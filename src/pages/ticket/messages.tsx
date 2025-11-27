import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Send } from 'lucide-react';
import { Button, Spin } from 'antd';
import { toast } from 'react-toastify';
import socket, { connectSocket } from '../../socket';

type ChatMessage = {
    id: string;
    text: string | null;
    image: string | null;
    sender: 'me' | 'other';
    senderRole: 'admin' | 'user' | 'gym_owner';
    time: string;
    loading?: boolean;
};

type ApiMessage = {
    _id: string;
    message: string | null;
    mediaUrl: string | null;
    senderRole: 'admin' | 'user' | 'gym_owner';
    sentAt: string;
};

export default function ChatScreen() {
    const [message, setMessage] = useState<string>('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [ticketInfo, setTicketInfo] = useState<{ subject: string; status: string } | null>(null);

    // NEW: image + text support
    const [pendingImage, setPendingImage] = useState<string | null>(null);
    const [pendingImagePublicId, setPendingImagePublicId] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const { id } = useParams();
    const ticketId = id || '';

    const endpoint = import.meta.env.VITE_API_LIVEHOST;
    const token =
        document.cookie
            .split('; ')
            .find((r) => r.startsWith('token='))
            ?.split('=')[1] || '';

    const userRole = (localStorage.getItem('userRole') as 'admin' | 'user' | 'gym_owner') || 'admin';
    const userId = localStorage.getItem('userId') || '';

    // ---------------- FETCH TICKET ----------------
    useEffect(() => {
        if (!ticketId) return;

        const fetchTicket = async () => {
            try {
                const url = userRole === 'admin' ? `${endpoint}/v1/admin/list/${ticketId}` : `${endpoint}/v1/user/ticket/${ticketId}`;

                const res = await fetch(url, { headers: { token } });
                const json = await res.json();

                if (!json.success) {
                    toast.error('Failed to load ticket');
                    return;
                }

                const ticket = json.data;

                setTicketInfo({
                    subject: ticket.subject,
                    status: ticket.status,
                });

                const mapped: ChatMessage[] = ticket.messages.map((msg: ApiMessage) => ({
                    id: msg._id,
                    text: msg.message,
                    image: msg.mediaUrl,
                    sender: msg.senderRole === userRole ? 'me' : 'other',
                    senderRole: msg.senderRole,
                    time: new Date(msg.sentAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                }));

                setMessages(mapped);
            } catch (err) {
                toast.error('Server error while fetching ticket');
            }
        };

        fetchTicket();
    }, [ticketId]);

    // ---------------- SOCKET CONNECTION ----------------
    useEffect(() => {
        connectSocket();

        socket.on('connect', () => {
            if (userRole === 'admin') socket.emit('join-admin');
            else socket.emit('join-user', userId);
        });

        socket.on('ticket_message', (msg: any) => {
            if (!msg.ticketId || msg.ticketId !== ticketId) return;

            setMessages((prev) => {
                // Remove optimistic duplicate
                const filtered = prev.filter((m) => !(m.sender === 'me' && m.text === msg.message && m.image === msg.mediaUrl));

                const incoming: ChatMessage = {
                    id: msg._id ?? Math.random().toString(),
                    text: msg.message,
                    image: msg.mediaUrl,
                    sender: msg.senderRole === userRole ? 'me' : 'other',
                    senderRole: msg.senderRole,
                    time: new Date(msg.sentAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                };

                return [...filtered, incoming];
            });
        });

        return () => {
            socket.off('connect');
            socket.off('ticket_message');
        };
    }, [ticketId]);

    // ---------------- SCROLL BOTTOM ----------------
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ---------------- SEND MESSAGE (TEXT / IMAGE / BOTH) ----------------
    const sendMessage = () => {
        if (!message.trim() && !pendingImage) return;

        // FIXED TYPE LOGIC
        let finalType: 'text' | 'image' | 'both' = 'text';
        if (pendingImage && message.trim()) finalType = 'both';
        else if (pendingImage) finalType = 'image';

        const payload = {
            ticketId,
            message: message || null,
            mediaUrl: pendingImage || null,
            mediaPublicId: pendingImagePublicId || null,
            type: finalType, // IMPORTANT FIX
            senderRole: userRole,
        };

        // Optimistic message
        const optimisticMessage: ChatMessage = {
            id: Math.random().toString(),
            text: message || null,
            image: pendingImage || null,
            sender: 'me',
            senderRole: userRole,
            time: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            }),
        };

        setMessages((prev) => [...prev, optimisticMessage]);
        socket.emit('send_ticket_message', payload);

        // Reset
        setMessage('');
        setPendingImage(null);
        setPendingImagePublicId(null);
    };

    // ---------------- IMAGE UPLOAD ----------------
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('file', file);

            const uploadRes = await fetch(`${endpoint}/v1/gymOwner/ticket/upload`, {
                method: 'POST',
                headers: { token },
                body: formData,
            });

            const uploadData = await uploadRes.json();
            if (!uploadData.success) {
                toast.error('Image upload failed');
                return;
            }

            // Do NOT reset message
            setPendingImage(uploadData.imageUrl);
            setPendingImagePublicId(uploadData.publicId);

            // Allow selecting same file again
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch {
            toast.error('Image upload error');
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* HEADER */}
            <div className="p-4 bg-white border-b">
                <h2 className="text-lg font-semibold">{ticketInfo?.subject}</h2>
                <p className="text-sm text-gray-500">Status: {ticketInfo?.status}</p>
            </div>

            {/* CHAT */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-3 rounded-xl max-w-xs ${msg.sender === 'me' ? 'bg-blue-500 text-white' : 'bg-white border'}`}>
                            <p className="text-xs opacity-70">{msg.sender === 'me' ? 'You' : msg.senderRole.toUpperCase()}</p>

                            {/* IMAGE */}
                            {msg.image && (
                                <>
                                    <img src={msg.image} className="rounded-md mt-2 max-w-[180px]" />
                                </>
                            )}

                            {/* TEXT */}
                            {msg.text && <p className="mt-1 whitespace-pre-wrap">{msg.text}</p>}

                            <p className="text-[10px] opacity-50 mt-1">{msg.time}</p>
                        </div>
                    </div>
                ))}

                <div ref={messagesEndRef} />
            </div>

            {/* INPUT AREA */}
            <div className="p-4 bg-white border-t flex flex-col gap-3">
                {/* IMAGE PREVIEW */}
                {pendingImage && (
                    <div className="flex gap-3 items-center">
                        <img src={pendingImage} className="max-w-[120px] rounded-md border" />
                        <button
                            className="text-red-500 text-xs underline"
                            onClick={() => {
                                setPendingImage(null);
                                setPendingImagePublicId(null);
                            }}
                        >
                            Remove
                        </button>
                    </div>
                )}

                <div className="flex items-center gap-3">
                    <label htmlFor="chatImage" className="cursor-pointer text-xl">
                        📎
                    </label>

                    <input id="chatImage" ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />

                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={1} placeholder="Type a message..." className="flex-grow p-3 border rounded-xl resize-none" />

                    <Button
                        type="primary"
                        shape="circle"
                        icon={<Send />}
                        disabled={!message.trim() && !pendingImage}
                        onClick={sendMessage}
                        style={{
                            backgroundColor: '#DBF900',
                            borderColor: '#DBF900',
                            color: 'black',
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
