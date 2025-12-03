import React, { useState, useMemo, useEffect } from 'react';
import socket, { connectSocket } from '../../socket';
import axios from 'axios';
import Cookies from 'js-cookie';
import { message } from 'antd';
import Filter from './Filters';

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

interface ApiStats {
    totalGymEarnings: number;
    totalAdminEarnings: number;
    totalTransactions: number;
}

interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    limit: number;
    totalRecords: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

const EarningsDashboard = () => {
    const [transactions, setTransactions] = useState<TransactionGroup[]>([]);
    const [filter] = useState<'all' | 'gym' | 'admin'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<any>({});
    const [activeFilters, setActiveFilters] = useState<any>({});
    const [resetFiltersKey, setResetFiltersKey] = useState(0);

    const [selectedTransaction, setSelectedTransaction] = useState<TransactionGroup | null>(null);
    const [apiStats, setApiStats] = useState<ApiStats>({
        totalGymEarnings: 0,
        totalAdminEarnings: 0,
        totalTransactions: 0,
    });

    const [pagination, setPagination] = useState<PaginationInfo>({
        currentPage: 1,
        totalPages: 1,
        limit: 10,
        totalRecords: 0,
        hasNextPage: false,
        hasPrevPage: false,
    });

    // ===================== LOAD DATA =====================
    const loadData = async (page = 1, newFilters = filters) => {
        try {
            const token = Cookies.get('token');
            let url = `${import.meta.env.VITE_API_LIVEHOST}/v1/admin/list/earnings/listing?page=${page}`;

            if (newFilters.gym) url += `&gym=${newFilters.gym}`;
            if (newFilters.owner) url += `&owner=${newFilters.owner}`;
            if (newFilters.user) url += `&user=${newFilters.user}`;
            if (newFilters.transactionId) url += `&transactionId=${newFilters.transactionId}`;

            if (newFilters.dateType === 'today') url += `&date=today`;
            if (newFilters.dateType === 'yesterday') url += `&date=yesterday`;
            if (newFilters.dateType === 'single') url += `&date=${newFilters.date}`;
            if (newFilters.dateType === 'range') url += `&startDate=${newFilters.startDate}&endDate=${newFilters.endDate}`;

            const { data } = await axios.get(url, { headers: { token } });

            if (data.success) {
                setTransactions(data.grouped);
                setApiStats(data.stats);
                setPagination(data.pagination);
            }
        } catch (err) {
            console.log(err);
            message.error('Failed to load earnings');
        }
    };

    // ===================== SOCKET =====================
    useEffect(() => {
        connectSocket();
        loadData(1);

        socket.on('transaction:new', (data: any) => {
            const newTxn: TransactionGroup = {
                payment: data.payment,
                commission: data.commission || null,
                paymentAmount: data.payment.amount,
                adminCommission: data.commission?.amount || 0,
                gymOwnerReceives: data.payment.amount - (data.commission?.amount || 0),
            };

            // 1️⃣ Add new transaction to UI
            setTransactions((prev) => [newTxn, ...prev]);

            // 2️⃣ 🔥 Update real-time totals
            setApiStats((prev) => ({
                totalGymEarnings: prev.totalGymEarnings + newTxn.gymOwnerReceives,
                totalAdminEarnings: prev.totalAdminEarnings + newTxn.adminCommission,
                totalTransactions: prev.totalTransactions + 1,
            }));

            // 3️⃣ Notification
            message.success(`New payment of ₹${newTxn.paymentAmount} received`);
        });

        return () => {
            socket.off('transaction:new');
        };
    }, []);

    // ===================== SEARCH FILTER =====================
    const filteredGroups = useMemo(() => {
        let list = [...transactions];

        if (searchTerm) {
            const t = searchTerm.toLowerCase();
            list = list.filter((g) => g.payment.from.name.toLowerCase().includes(t) || g.payment.to.name.toLowerCase().includes(t) || g.payment.gym.name.toLowerCase().includes(t));
        }

        return list;
    }, [transactions, searchTerm]);

    // ===================== STATISTICS =====================
    const stats = useMemo(() => {
        return {
            overallGymEarnings: apiStats.totalGymEarnings,
            overallAdminEarnings: apiStats.totalAdminEarnings,
            totalTransactions: apiStats.totalTransactions,

            filteredGymEarnings: filteredGroups.reduce((s, t) => s + t.gymOwnerReceives, 0),
            filteredAdminEarnings: filteredGroups.reduce((s, t) => s + t.adminCommission, 0),

            avgCommission: filteredGroups.length > 0 ? filteredGroups.reduce((s, t) => s + (t.commission?.commissionPercentage || 0), 0) / filteredGroups.length : 0,
        };
    }, [apiStats, filteredGroups]);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="grid gap-1">
            {/* HEADER */}
            <div className="flex justify-between items-center">
                <h2 className="CRM-Page-Title">Earnings Dashboard</h2>

                <Filter
                    activeFilters={activeFilters}
                    onApplyFilters={(filters) => {
                        setActiveFilters(filters);
                        loadData(1, filters);
                    }}
                    onRemoveFilter={(key) => {
                        const updated = { ...activeFilters };
                        delete updated[key];
                        setActiveFilters(updated);
                        loadData(1, updated);
                    }}
                />
            </div>

            <p className="CRM-Page-Structure mb-6">
                Dashboard / <span className="CRM-Page-Name">Earnings</span>
            </p>

            {/* ===================== STATS ===================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600">Gym Owner Earnings</p>
                    <p className="text-2xl font-bold">₹{stats.filteredGymEarnings.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Overall: ₹{stats.overallGymEarnings.toFixed(2)}</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600">Admin Commission</p>
                    <p className="text-2xl font-bold">₹{stats.filteredAdminEarnings.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Overall: ₹{stats.overallAdminEarnings.toFixed(2)}</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600">Total Transactions</p>
                    <p className="text-2xl font-bold">{filteredGroups.length}</p>
                    <p className="text-xs text-gray-500">Overall: {stats.totalTransactions}</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600">Avg Commission</p>
                    <p className="text-2xl font-bold">{stats.avgCommission.toFixed(1)}%</p>
                </div>
            </div>

            {/* ===================== ACTIVE FILTER TAGS ===================== */}
            {/* ===================== ACTIVE FILTER TAGS ===================== */}
            {Object.values(activeFilters).some((val) => val) && (
                <div className="flex flex-wrap gap-3 items-center mb-4">
                    {Object.entries(activeFilters).map(([key, value]) => {
                        if (!value) return null;
                        if (key === 'dateType' && value === 'none') return null;

                        // Label Mapping
                        const labelMap: any = {
                            gym: 'Gym',
                            owner: 'Gym Owner',
                            user: 'User',
                            transactionId: 'Transaction ID',

                            dateType: 'Date Filter',
                            date: 'Date',
                            startDate: 'Start Date',
                            endDate: 'End Date',

                            today: 'Today',
                            yesterday: 'Yesterday',
                            single: 'Single Date',
                            range: 'Date Range',
                        };

                        const label = labelMap[key] || key;

                        // Value Formatter
                        const formattedValue =
                            key === 'dateType'
                                ? value === 'today'
                                    ? 'Today'
                                    : value === 'yesterday'
                                    ? 'Yesterday'
                                    : value === 'single'
                                    ? activeFilters.date
                                    : value === 'range'
                                    ? `${activeFilters.startDate} → ${activeFilters.endDate}`
                                    : value
                                : String(value);

                        return (
                            <div key={key} className="flex items-center bg-gray-200 px-4 py-1 rounded-full text-sm">
                                <span>
                                    {label}: {formattedValue}
                                </span>

                                <button
                                    className="ml-2 text-red-600"
                                    onClick={() => {
                                        const updated = { ...activeFilters };

                                        // handle removal of date fields
                                        if (key === 'date') {
                                            delete updated.date;
                                            delete updated.dateType;
                                        }

                                        if (key === 'startDate' || key === 'endDate') {
                                            delete updated.startDate;
                                            delete updated.endDate;
                                            delete updated.dateType;
                                        }

                                        if (key === 'dateType') {
                                            delete updated.dateType;
                                            delete updated.date;
                                            delete updated.startDate;
                                            delete updated.endDate;
                                        }

                                        // normal removal
                                        delete updated[key];

                                        setActiveFilters(updated);
                                        loadData(1, updated);
                                    }}
                                >
                                    ✖
                                </button>
                            </div>
                        );
                    })}

                    {/* CLEAR ALL */}
                    <h5
                        className="text-red-600 cursor-pointer ml-2"
                        onClick={() => {
                            setActiveFilters({});
                            setResetFiltersKey((prev) => prev + 1);
                            loadData(1, {});
                        }}
                    >
                        Clear all filters
                    </h5>
                </div>
            )}

            {/* ===================== TABLE ===================== */}
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

                                    <td className="px-6 py-4 text-blue-600">₹{group.paymentAmount}</td>
                                    <td className="px-6 py-4 text-green-600">₹{group.adminCommission}</td>

                                    <td className="px-6 py-4 text-purple-600 font-bold">₹{group.gymOwnerReceives}</td>

                                    <td className="px-6 py-4">
                                        <button onClick={() => setSelectedTransaction(group)} className="text-blue-600 hover:underline">
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredGroups.length === 0 && <div className="text-center py-10 text-gray-500">No transactions found</div>}
            </div>

            {/* ===================== PAGINATION ===================== */}
            <div className="flex justify-between items-center mt-6">
                <button
                    disabled={!pagination.hasPrevPage}
                    onClick={() => loadData(pagination.currentPage - 1)}
                    className={`px-4 py-2 rounded ${pagination.hasPrevPage ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500'}`}
                >
                    Prev
                </button>

                <p className="text-gray-700">
                    Page {pagination.currentPage} of {pagination.totalPages}
                </p>

                <button
                    disabled={!pagination.hasNextPage}
                    onClick={() => loadData(pagination.currentPage + 1)}
                    className={`px-4 py-2 rounded ${pagination.hasNextPage ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500'}`}
                >
                    Next
                </button>
            </div>

            {/* ===================== MODAL ===================== */}
            {selectedTransaction && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
                        <div className="p-6 flex justify-between items-start border-b">
                            <h2 className="text-2xl font-bold">Transaction Details</h2>
                            <button onClick={() => setSelectedTransaction(null)} className="text-gray-500 text-xl">
                                ✖
                            </button>
                        </div>

                        {/* PAYMENT CARD */}
                        <div className="p-6 bg-blue-50">
                            <h3 className="text-lg font-bold text-blue-900 mb-3">Gym Owner Payment</h3>

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

                        {/* COMMISSION CARD */}
                        {selectedTransaction.commission && (
                            <div className="p-6 bg-green-50 border-t">
                                <h3 className="text-lg font-bold text-green-900 mb-3">Admin Commission</h3>

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
                            <button onClick={() => setSelectedTransaction(null)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
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
