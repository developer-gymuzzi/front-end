import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { message as antdMessage } from 'antd';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useParams } from 'react-router-dom';
import socket from '../../socket';

type Msg = {
    id: number;
    text: string;
    sender: 'me' | 'other';
    time: string;
    avatar?: string;
};

export default function ChatScreen() {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Msg[]>([]);

    const endpoint = import.meta.env.VITE_API_LIVEHOST;
    const token = Cookies.get('token') ?? '';
    const { id } = useParams<{ id: string }>();

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const loggedInUserId = localStorage.getItem('userId');

    const mapApiMessages = (apiMessages: any[]): Msg[] => {
        return apiMessages.map((msg, index) => ({
            id: index + 1,
            text: msg.message,
            sender: msg.sender === loggedInUserId ? 'me' : 'other',
            time: new Date(msg.sentAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            }),
        }));
    };

    const fetchTicket = async () => {
        if (!id) return;
        try {
            const res = await axios.get(`${endpoint}/v1/admin/list/listpar/${id}`, {
                headers: { token },
            });

            if (res.data.success) {
                const mappedMessages = mapApiMessages(res.data.ticket.messages);
                setMessages(mappedMessages);
            } else {
                antdMessage.error('Failed to load ticket messages');
            }
        } catch (error) {
            antdMessage.error('Something went wrong fetching messages');
            console.error(error);
        }
    };

    useEffect(() => {
        fetchTicket();
    }, [id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!id) return;

        const handleNewMessage = (data: any) => {
            if (data.ticketId === id) {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: prev.length + 1,
                        text: data.message,
                        sender: data.sender === loggedInUserId ? 'me' : 'other',
                        time: new Date(data.sentAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        }),
                    },
                ]);
            }
        };

        socket.on('ticket_message', handleNewMessage);
        return () => {
            socket.off('ticket_message', handleNewMessage);
        };
    }, [id, loggedInUserId]);

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        try {
            const res = await axios.post(`${endpoint}/v1/user/ticket/messanging/${id}`, { message }, { headers: { token } });

            if (res.data.success) {
                setMessage('');
            } else {
                antdMessage.error('Failed to send message');
            }
        } catch (error) {
            antdMessage.error('Error sending message');
            console.error(error);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex flex-col h-[900px] bg-gray-50">
            {/* Fixed Header */}
            <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center">
                <h2 className="text-lg font-semibold text-gray-900">Sarah Johnson</h2>
            </div>

            {/* Scrollable Messages */}
            <div className="flex-grow overflow-y-auto px-6 py-4 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                                msg.sender === 'me' ? 'bg-blue-500 text-white rounded-br-md' : 'bg-white text-gray-900 rounded-bl-md border border-gray-200'
                            }`}
                        >
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            <p className={`text-xs mt-1 ${msg.sender === 'me' ? 'text-blue-100' : 'text-gray-500'}`}>{msg.time}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Fixed Input Area */}
            <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center space-x-4">
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type a message..."
                    rows={1}
                    className="flex-grow px-4 py-3 bg-gray-100 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ maxHeight: 120, overflowY: 'auto' }}
                />
                <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className={`p-3 rounded-full transition-colors duration-200 ${
                        message.trim() ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
