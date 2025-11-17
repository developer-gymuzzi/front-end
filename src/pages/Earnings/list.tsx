import React, { useState, useMemo, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, Calendar, Search } from 'lucide-react';
import socket, { connectSocket } from '../../socket';
import axios from 'axios';
import Cookies from 'js-cookie';
import { message } from 'antd';
import Filter from './Filters';

// ===================== INTERFACES =====================
interface User {
    _id: string;
    name: string;
    email: string;
}

interface Gym {
    _id: string;
    name: string;
}

interface PaymentTxn {
    _id: string;
    amount: number;
    description: string;
    createdAt: string;
    from: User;
    to: User;
    gym: Gym;
}

interface CommissionTxn {
    _id: string;
    amount: number;
    description: string;
    commissionPercentage: number;
    createdAt: string;
    to: User;
}

interface TransactionGroup {
    payment: PaymentTxn;
    commission?: CommissionTxn;
    paymentAmount: number;
    adminCommission: number;
    gymOwnerReceives: number;
}

interface Stats {
    overallGymEarnings: number;
    overallAdminEarnings: number;

    filteredGymEarnings: number;
    filteredAdminEarnings: number;

    totalTransactions: number;
    avgCommission: number;
}

type FilterType = 'all' | 'gym' | 'admin';

// =======================================================

const EarningsDashboard = () => {

    const [transactions, setTransactions] = useState<TransactionGroup[]>([]);
    const [filter, setFilter] = useState<FilterType>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTransaction, setSelectedTransaction] = useState<TransactionGroup | null>(null);
    const [notificationCount, setNotificationCount] = useState(0);
    const [gymFilter, setGymFilter] = useState(''); 

    // ===================== LOAD API =====================
    const loadData = async (gymName: string = '') => {
        try {
            const token = Cookies.get('token');

            const URL = gymName
                ? `${import.meta.env.VITE_API_LIVEHOST}/v1/admin/list/earnings/listing?gym=${gymName}`
                : `${import.meta.env.VITE_API_LIVEHOST}/v1/admin/list/earnings/listing`;

            const { data } = await axios.get(URL, {
                headers: { token }
            });

            if (data.success) {
                setTransactions(data.grouped);
            } else {
                message.error(data.message);
            }

        } catch (err) {
            console.error("ERR LOADING DATA", err);
            message.error('Failed to load earnings.');
        }
    };

    // ===================== SOCKET SETUP =====================
    useEffect(() => {
        connectSocket();
        loadData(); 

        socket.on('transaction:new', (raw: any) => {
            console.log("🔥 REAL-TIME RECEIVED:", raw);

            if (!raw || !raw.payment) {
                console.warn("⚠ Invalid real-time data received", raw);
                return;
            }

            const newGroup: TransactionGroup = {
                payment: raw.payment,
                commission: raw.commission || undefined,
                paymentAmount: raw.payment.amount,
                adminCommission: raw.commission?.amount || 0,
                gymOwnerReceives: raw.payment.amount - (raw.commission?.amount || 0)
            };

            setTransactions(prev => [newGroup, ...prev]);
        });

        socket.on('notification:count', ({ unreadCount }) => {
            setNotificationCount(unreadCount);
        });

        socket.on('notification:new', data => {
            message.info('🔔 ' + data.message);
        });

        return () => {
            socket.off('transaction:new');
            socket.off('notification:new');
            socket.off('notification:count');
        };
    }, []);

    // ===================== FILTER & SEARCH =====================
    const filteredGroups = useMemo(() => {
        let list = [...transactions];

        if (filter === 'gym') list = list.filter(g => g.payment);
        if (filter === 'admin') list = list.filter(g => g.commission);

        if (searchTerm) {
            const t = searchTerm.toLowerCase();
            list = list.filter(g =>
                g.payment.from.name.toLowerCase().includes(t) ||
                g.payment.to.name.toLowerCase().includes(t) ||
                g.payment.gym.name.toLowerCase().includes(t)
            );
        }

        return list;
    }, [transactions, filter, searchTerm]);

    // ===================== STATS (UPDATED) =====================
    const stats = useMemo<Stats>(() => {
        const overallGym = transactions.reduce((s, t) => s + t.gymOwnerReceives, 0);
        const overallAdmin = transactions.reduce((s, t) => s + t.adminCommission, 0);

        const filteredGym = filteredGroups.reduce((s, t) => s + t.gymOwnerReceives, 0);
        const filteredAdmin = filteredGroups.reduce((s, t) => s + t.adminCommission, 0);

        return {
            overallGymEarnings: overallGym,
            overallAdminEarnings: overallAdmin,
            filteredGymEarnings: filteredGym,
            filteredAdminEarnings: filteredAdmin,
            totalTransactions: filteredGroups.length,
            avgCommission:
                filteredGroups.length > 0
                    ? filteredGroups.reduce((s, t) => s + (t.commission?.commissionPercentage || 0), 0) / filteredGroups.length
                    : 0
        };
    }, [transactions, filteredGroups]);

    // ===================== DATE FORMAT =====================
    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // ===================== UI =====================
    return (
        <div className="grid gap-1">

            {/* TOP HEADER */}
            <div className="flex justify-between items-center">
                <h2 className="CRM-Page-Title">Earnings Dashboard</h2>

                <div className="flex items-center gap-3">
                    <Filter 
                        onSearch={(gymName: string) => {
                            setGymFilter(gymName);
                            loadData(gymName);
                        }}
                    />
                </div>
            </div>

            <p className="CRM-Page-Structure mb-6">
                Dashboard / <span className="CRM-Page-Name">Earnings</span>
            </p>

            {/* STATS CARDS (UPDATED) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600">Gym Owner Earnings (Filtered)</p>
                    <p className="text-2xl font-bold">₹{stats.filteredGymEarnings}</p>
                    <p className="text-xs text-gray-500">Overall: ₹{stats.overallGymEarnings}</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600">Admin Commission (Filtered)</p>
                    <p className="text-2xl font-bold">₹{stats.filteredAdminEarnings}</p>
                    <p className="text-xs text-gray-500">Overall: ₹{stats.overallAdminEarnings}</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600">Filtered Transactions</p>
                    <p className="text-2xl font-bold">{stats.totalTransactions}</p>
                    <p className="text-xs text-gray-500">Overall: {transactions.length}</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600">Avg Commission (Filtered)</p>
                    <p className="text-2xl font-bold">{stats.avgCommission.toFixed(1)}%</p>
                </div>

            </div>

            {/* TABLE */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Gym Owner</th>
                                <th className="px-6 py-3">Gym</th>
                                <th className="px-6 py-3">Payment</th>
                                <th className="px-6 py-3">Commission</th>
                                <th className="px-6 py-3">Net To Owner</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {filteredGroups.map((group, index) => (
                                <tr key={index} className="hover:bg-gray-50">

                                    <td className="px-6 py-4">{formatDate(group.payment.createdAt)}</td>

                                    <td className="px-6 py-4">
                                        {group.payment.from.name}
                                        <div className="text-gray-500 text-xs">{group.payment.from.email}</div>
                                    </td>

                                    <td className="px-6 py-4">
                                        {group.payment.to.name}
                                        <div className="text-gray-500 text-xs">{group.payment.to.email}</div>
                                    </td>

                                    <td className="px-6 py-4">{group.payment.gym.name}</td>

                                    <td className="px-6 py-4 text-blue-600">
                                        ₹{group.paymentAmount}
                                    </td>

                                    <td className="px-6 py-4 text-green-600">
                                        ₹{group.adminCommission}
                                    </td>

                                    <td className="px-6 py-4 text-purple-600 font-bold">
                                        ₹{group.gymOwnerReceives}
                                    </td>

                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => setSelectedTransaction(group)}
                                            className="text-blue-600 hover:underline"
                                        >
                                            View Details
                                        </button>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredGroups.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        No transactions found
                    </div>
                )}
            </div>

            {/* ===================== MODAL ===================== */}
            {selectedTransaction && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">

                        <div className="p-6 flex justify-between items-start border-b">
                            <h2 className="text-2xl font-bold">Transaction Details</h2>
                            <button
                                onClick={() => setSelectedTransaction(null)}
                                className="text-gray-500 text-xl"
                            >
                                ✖
                            </button>
                        </div>

                        {/* Payment Card */}
                        <div className="p-6 bg-blue-50">
                            <h3 className="text-lg font-bold text-blue-900 mb-4">Gym Owner Payment</h3>

                            <div className="grid grid-cols-2 gap-4">

                                <div>
                                    <p className="text-sm text-gray-600">Payment ID</p>
                                    <p className="font-semibold">{selectedTransaction.payment._id}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600">Amount</p>
                                    <p className="font-bold text-blue-700">₹{selectedTransaction.paymentAmount}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600">User (From)</p>
                                    <p className="font-semibold">{selectedTransaction.payment.from.name}</p>
                                    <p className="text-xs text-gray-500">{selectedTransaction.payment.from.email}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600">Gym Owner (To)</p>
                                    <p className="font-semibold">{selectedTransaction.payment.to.name}</p>
                                    <p className="text-xs text-gray-500">{selectedTransaction.payment.to.email}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600">Gym</p>
                                    <p className="font-semibold">{selectedTransaction.payment.gym.name}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600">Date</p>
                                    <p className="font-semibold">{formatDate(selectedTransaction.payment.createdAt)}</p>
                                </div>

                                <div className="col-span-2">
                                    <p className="text-sm text-gray-600">Description</p>
                                    <p className="font-medium">{selectedTransaction.payment.description}</p>
                                </div>

                            </div>
                        </div>

                        {/* Commission Card */}
                        {selectedTransaction.commission && (
                            <div className="p-6 bg-green-50 border-t">
                                <h3 className="text-lg font-bold text-green-900 mb-4">Admin Commission</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Commission ID</p>
                                        <p className="font-semibold">{selectedTransaction.commission._id}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600">Amount</p>
                                        <p className="font-bold text-green-700">₹{selectedTransaction.adminCommission}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600">Commission Rate</p>
                                        <p className="font-semibold">{selectedTransaction.commission.commissionPercentage}%</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600">To (Admin)</p>
                                        <p className="font-semibold">{selectedTransaction.commission.to.name}</p>
                                        <p className="text-xs text-gray-500">{selectedTransaction.commission.to.email}</p>
                                    </div>

                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-600">Description</p>
                                        <p className="font-medium">{selectedTransaction.commission.description}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="p-6 flex justify-end">
                            <button
                                onClick={() => setSelectedTransaction(null)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                            >
                                Close
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default EarningsDashboard;
