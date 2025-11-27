import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import moment from 'moment';

interface NotificationItem {
    _id: string;
    message: string;
    createdAt: string;
    data?: {
        changes?: string[];
    };
}

export default function AllNotificationsPage() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const endpoint = import.meta.env.VITE_API_LIVEHOST;

    const load = async () => {
        try {
            const token = Cookies.get('token');
            const { data } = await axios.get(`${endpoint}/v1/admin/list/listingNotify`, {
                headers: { token }
            });

            if (data.success) setNotifications(data.data || []);
        } catch (error) {
            console.error("Notification load failed", error);
        }
    };

    const markRead = async (id: string) => {
        try {
            await axios.put(`${endpoint}/v1/admin/list/markNotify/${id}`);
            setNotifications(prev => prev.filter(n => n._id !== id)); // ✔ remove instantly
        } catch (err) {
            console.error("Failed to mark read");
        }
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <div className="p-5 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-5">All Notifications</h1>

            {notifications.map(noti => (
                <div
                    key={noti._id}
                    onClick={() => markRead(noti._id)}
                    className="border p-4 rounded-md mb-3 shadow-sm bg-white cursor-pointer hover:bg-gray-50"
                >
                    <p className="font-semibold">{noti.message}</p>

                    {Array.isArray(noti?.data?.changes) && (
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                            {noti.data?.changes?.map((c, i) => (
                                <li key={i}>{c}</li>
                            ))}
                        </ul>
                    )}

                    <p className="text-xs text-gray-400 mt-2">
                        {moment(noti.createdAt).format('DD MMM YYYY, hh:mm A')}
                    </p>
                </div>
            ))}
        </div>
    );
}
