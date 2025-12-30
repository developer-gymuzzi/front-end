import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Send } from 'lucide-react';
import { Button } from 'antd';
import { toast } from 'react-toastify';
import socket, { connectSocket } from '../../socket';

/* ================= TYPES ================= */

type ChatMessage = {
    id: string;
    text: string | null;
    image: string | null;
    sender: 'me' | 'other';
    senderRole: 'admin' | 'user' | 'gym_owner';
    time: string;
};

type ApiMessage = {
    _id: string;
    message: string | null;
    mediaUrl: string | null;
    senderRole: 'admin' | 'user' | 'gym_owner';
    sentAt: string;
};

/* ================= COMPONENT ================= */

export default function ChatScreen() {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [ticketInfo, setTicketInfo] = useState<{ subject: string; status: string } | null>(null);

    const [pendingImage, setPendingImage] = useState<string | null>(null);
    const [pendingImagePublicId, setPendingImagePublicId] = useState<string | null>(null);

    // ✅ PAGINATION STATE
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loadingOlder, setLoadingOlder] = useState(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const socketInitialized = useRef(false);

    const { id } = useParams();
    const ticketId = id || '';

    const endpoint = import.meta.env.VITE_API_LIVEHOST;
    const token =
        document.cookie
            .split('; ')
            .find((r) => r?.startsWith('token='))?.split('=')[1] || '';

    const userRole =
        (localStorage.getItem('userRole') as 'admin' | 'user' | 'gym_owner') || 'admin';
    const userId = localStorage.getItem('userId') || '';

    /* ================= FETCH TICKET (WITH PAGINATION) ================= */

    const fetchTicket = async (pageNo = 1, prepend = false) => {
        try {
            const url =
                userRole === 'admin'
                    ? `${endpoint}/v1/admin/list/${ticketId}?page=${pageNo}&limit=15`
                    : `${endpoint}/v1/user/ticket/${ticketId}?page=${pageNo}&limit=15`;

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

            setTotalPages(ticket.totalPages || 1);
            setPage(pageNo);

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

            setMessages((prev) =>
                prepend ? [...mapped, ...prev] : mapped
            );
        } catch {
            toast.error('Server error while fetching ticket');
        }
    };

    useEffect(() => {
        if (!ticketId) return;
        fetchTicket(1);
    }, [ticketId]);

    /* ================= SOCKET (UNCHANGED) ================= */

    useEffect(() => {
        if (!socketInitialized.current) {
            connectSocket();
            socketInitialized.current = true;
        }

        const onConnect = () => {
            userRole === 'admin'
                ? socket.emit('join-admin')
                : socket.emit('join-user', userId);
        };

        const onTicketMessage = (msg: any) => {
            if (!msg.ticketId || msg.ticketId !== ticketId) return;

            // ignore own server echo
            if (msg.sender === userId) return;

            setMessages((prev) => {
                if (msg._id && prev.some((m) => m.id === msg._id)) return prev;

                return [
                    ...prev,
                    {
                        id: msg._id || Math.random().toString(),
                        text: msg.message ?? null,
                        image: msg.mediaUrl ?? null,
                        sender: 'other',
                        senderRole: msg.senderRole,
                        time: new Date(msg.sentAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        }),
                    },
                ];
            });
        };

        socket.on('connect', onConnect);
        socket.on('ticket_message', onTicketMessage);

        return () => {
            socket.off('connect', onConnect);
            socket.off('ticket_message', onTicketMessage);
        };
    }, [ticketId]);

    /* ================= AUTO SCROLL ================= */

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    /* ================= SEND MESSAGE (UNCHANGED) ================= */

    const sendMessage = () => {
        if (!message.trim() && !pendingImage) return;

        const optimisticMessage: ChatMessage = {
            id: `tmp-${Date.now()}`,
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

        socket.emit('send_ticket_message', {
            ticketId,
            message: message || null,
            mediaUrl: pendingImage || null,
            mediaPublicId: pendingImagePublicId || null,
            type: pendingImage && message ? 'both' : pendingImage ? 'image' : 'text',
            senderRole: userRole,
        });

        setMessage('');
        setPendingImage(null);
        setPendingImagePublicId(null);
    };

    /* ================= IMAGE UPLOAD (UNCHANGED) ================= */

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

            setPendingImage(uploadData.imageUrl);
            setPendingImagePublicId(uploadData.publicId);

            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch {
            toast.error('Image upload error');
        }
    };

    /* ================= UI (UNCHANGED + LOAD OLDER) ================= */

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <div className="p-4 bg-white border-b">
                <h2 className="text-lg font-semibold">{ticketInfo?.subject}</h2>
                <p className="text-sm text-gray-500">Status: {ticketInfo?.status}</p>
            </div>

            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {page < totalPages && (
                    <div className="flex justify-center">
                        <Button
                            loading={loadingOlder}
                            onClick={async () => {
                                setLoadingOlder(true);
                                await fetchTicket(page + 1, true);
                                setLoadingOlder(false);
                            }}
                        >
                            Load older messages
                        </Button>
                    </div>
                )}

                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-3 rounded-xl max-w-xs ${msg.sender === 'me' ? 'bg-blue-500 text-white' : 'bg-white border'}`}>
                            <p className="text-xs opacity-70">
                                {msg.sender === 'me' ? 'You' : msg.senderRole.toUpperCase()}
                            </p>

                            {msg.image && <img src={msg.image} className="rounded-md mt-2 max-w-[180px]" />}
                            {msg.text && <p className="mt-1 whitespace-pre-wrap">{msg.text}</p>}
                            <p className="text-[10px] opacity-50 mt-1">{msg.time}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t flex flex-col gap-3">
                {pendingImage && (
                    <div className="flex gap-3 items-center">
                        <img src={pendingImage} className="max-w-[120px] rounded-md border" />
                        <button className="text-red-500 text-xs underline" onClick={() => setPendingImage(null)}>
                            Remove
                        </button>
                    </div>
                )}

                <div className="flex items-center gap-3">
                    <label htmlFor="chatImage" className="cursor-pointer text-xl">📎</label>
                    <input id="chatImage" ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />

                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                        rows={1}
                        placeholder="Type a message..."
                        className="flex-grow p-3 border rounded-xl resize-none"
                    />

                    <Button
                        type="primary"
                        shape="circle"
                        icon={<Send />}
                        disabled={!message.trim() && !pendingImage}
                        onClick={sendMessage}
                        style={{ backgroundColor: '#DBF900', borderColor: '#DBF900', color: 'black' }}
                    />
                </div>
            </div>
        </div>
    );
}
