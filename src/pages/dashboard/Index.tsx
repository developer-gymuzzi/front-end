import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

interface DashboardApiResponse {
    success: 0 | 1;
    data: {
        tickets: {
            total: number;
            open: number;
            closed: number;
            pending: number;
        };
        members: number;
        revenue: number;
        weeklyVisits: number[];
        recentGyms: {
            _id: string;
            name: string;
            earnings: number;
            isPendingApproval: 'approved' | 'rejected' | string;
            createdAt: string;
        }[];
    };
}
interface ChartProps {
    weeklyVisits: number[];
}

export default function Component() {
    const [data, setData] = useState<DashboardApiResponse['data'] | null>(null);
    const [Loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = Cookies.get('token');

                if (!token) {
                    console.error('No token found in cookies');
                    return;
                }

                console.log('Token from cookies:', token);

                const response = await axios.get(`${import.meta.env.VITE_API_LIVEHOST}/v1/admin/list/dashboard/analytics`, {
                    headers: {
                        token: token,
                    },
                });

                console.log('API Raw Response:', response.data);

                if (response.data.success) {
                    setData(response.data.data);
                    setLoading(false);
                } else {
                    console.log('API returned success: false', response.data);
                }
            } catch (error: any) {
                if (error.response) {
                    console.error('Response error:', error.response.status, error.response.data);
                } else if (error.request) {
                    console.error('No response:', error.request);
                } else {
                    console.error('Other error:', error.message);
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, []);

    const WeeklyVisitsChart: React.FC<ChartProps> = ({ weeklyVisits }) => {
        const maxVisits = Math.max(...weeklyVisits, 10);
        const chartWidth = 600;
        const chartHeight = 450;
        const padding = { top: 35, right: 40, bottom: 50, left: 50 };

        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        const chartData = weeklyVisits.map((visits, index) => {
            const x = padding.left + (index * (chartWidth - padding.left - padding.right)) / (weeklyVisits.length - 1);
            const y = padding.top + ((maxVisits - visits) / maxVisits) * (chartHeight - padding.top - padding.bottom);
            return { x, y, visits };
        });

        const getPath = () => chartData.map((point, index) => (index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`)).join(' ');
        return (
            <div className="relative">
                <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                    {/* Grid */}
                    <defs>
                        <pattern id="grid" width="60" height="80" patternUnits="userSpaceOnUse">
                            <path d="M 0 0 L 0 80 M 0 0 L 60 0" fill="none" stroke="#f0f0f0" strokeWidth="1" />
                        </pattern>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <rect width={chartWidth} height={chartHeight} fill="url(#grid)" />

                    {/* Horizontal grid + Y labels */}
                    {[0, maxVisits / 2, maxVisits].map((value, idx) => {
                        const y = padding.top + ((maxVisits - value) / maxVisits) * (chartHeight - padding.top - padding.bottom);
                        return (
                            <g key={idx}>
                                <line x1={padding.left} y1={y} x2={chartWidth - padding.right} y2={y} stroke="#e5e7eb" strokeDasharray="5,5" />
                                <text x={padding.left - 10} y={y + 4} textAnchor="end" fontSize="12" fill="#374151">
                                    {Math.round(value)}
                                </text>
                            </g>
                        );
                    })}

                    {/* Area under the line */}
                    <path d={`${getPath()} L ${chartData[chartData.length - 1].x} ${chartHeight - padding.bottom} L ${chartData[0].x} ${chartHeight - padding.bottom} Z`} fill="url(#areaGradient)" />

                    {/* Line */}
                    <path d={getPath()} stroke="#8b5cf6" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Dots on line - with proper label positioning */}
                    {chartData.map((point, idx) => {
                        // Determine if label should be above or below based on position
                        // If the point is in the top 25% of the chart, put label below
                        const isNearTop = point.y > chartHeight * 0.25;
                        const labelY = isNearTop ? point.y + 25 : point.y - 18;

                        return (
                            <g key={idx}>
                                {/* White background for dot */}
                                <circle cx={point.x} cy={point.y} r={7} fill="white" stroke="white" strokeWidth={3} />
                                {/* Colored dot */}
                                <circle cx={point.x} cy={point.y} r={5} fill="#8b5cf6" stroke="white" strokeWidth={2} />

                                {/* Value label with conditional positioning */}
                                <text x={point.x} y={labelY} textAnchor="middle" fontSize="12" fill="#8b5cf6" fontWeight={600} className="font-sans">
                                    {point.visits}
                                </text>
                            </g>
                        );
                    })}
                    {/* X-axis days */}
                    {days.map((day, index) => {
                        const x = padding.left + (index * (chartWidth - padding.left - padding.right)) / (days.length - 1);

                        return (
                            <text key={index} x={x} y={chartHeight - padding.bottom + 40} textAnchor="middle" fontSize="12" fill="#6b7280">
                                {day}
                            </text>
                        );
                    })}

                    {/* Axes */}
                    <line x1={padding.left} y1={padding.top} x2={padding.left} y2={chartHeight - padding.bottom} stroke="#d1d5db" strokeWidth={1} />
                    <line x1={padding.left} y1={chartHeight - padding.bottom} x2={chartWidth - padding.right} y2={chartHeight - padding.bottom} stroke="#d1d5db" strokeWidth={1} />
                </svg>
            </div>
        );
    };
    if (Loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 text-lg font-medium">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
            <div className="max-w-10xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 ">
                    {/* Total Tickets */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl p-6 shadow-md border border-blue-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group ">
                        {/* Decorative Glow */}
                        <div className="absolute inset-0 bg-blue-400/5 blur-2xl"></div>

                        {/* Header */}
                        <div className="flex items-center justify-between mb-5 relative z-10">
                            <div className="flex items-center space-x-2">
                                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
                                <p className="text-gray-700 text-xl font-semibold uppercase tracking-wide">Total Open Tickets</p>
                            </div>
                        </div>

                        {/* Number */}
                        <div className="flex flex-col items-center justify-center mt-2 relative z-10">
                            <p className="text-5xl font-extrabold text-blue-700 group-hover:text-blue-800 transition-colors duration-300 leading-tight">{data?.tickets.open ?? 0}</p>
                            <p className="text-xs text-gray-500 mt-1 tracking-wider">Active Tickets</p>
                        </div>
                    </div>

                    {/* Total Revenue */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-white via-green-50 to-green-100 rounded-2xl p-6 shadow-lg border border-green-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group">
                        {/* Decorative blur effect */}
                        <div className="absolute inset-0 bg-green-400/10 blur-2xl"></div>

                        {/* Header */}
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className="flex items-center space-x-2">
                                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                                <p className="text-gray-700 text-xl font-semibold uppercase tracking-wide">Total Revenue</p>
                            </div>
                        </div>

                        {/* Main Revenue Value */}
                        <div className="flex flex-col items-center justify-center mt-3 relative z-10">
                            <div className="flex items-center space-x-2">
                                <p className="text-4xl font-extrabold text-green-700 group-hover:text-green-800 transition-colors duration-300 leading-tight"> {data?.revenue ?? 0}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 tracking-wide font-medium">Total Earnings</p>
                        </div>
                    </div>
                    {/* Total Members */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-white via-purple-50 to-purple-100 rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group">
                        {/* Decorative blur effect */}
                        <div className="absolute inset-0 bg-purple-400/10 blur-2xl"></div>

                        {/* Header */}
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className="flex items-center space-x-2">
                                <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse"></div>
                                <p className="text-gray-700 text-xl font-semibold uppercase tracking-wide">Total Members</p>
                            </div>
                        </div>

                        {/* Main Members Value */}
                        <div className="flex flex-col items-center justify-center mt-3 relative z-10">
                            <div className="flex items-center space-x-2">
                                <p className="text-4xl font-extrabold text-purple-700 group-hover:text-purple-800 transition-colors duration-300 leading-tight">{data?.members ?? 0}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 tracking-wide font-medium">Active Members</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Recent Gyms Status</h2>
                                <p className="text-gray-500 text-sm mt-1">Latest gym approvals and updates</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {data?.recentGyms?.slice(0, 3).map((gym) => {
                                // Map status to Tailwind colors
                                const statusColors: Record<string, string> = {
                                    approved: 'green',
                                    pending: 'yellow',
                                    rejected: 'red',
                                };
                                const color = statusColors[gym.isPendingApproval] || 'gray';

                                const formattedDate = new Date(gym.createdAt).toLocaleString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true,
                                });

                                return (
                                    <div
                                        key={gym._id}
                                        className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-purple-300 transition-all duration-300 group hover:shadow-md"
                                    >
                                        {/* Header: Gym name and status */}
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-bold text-gray-900 text-lg group-hover:text-purple-700 transition-colors">{gym.name}</h3>
                                            <span className={`bg-${color}-100 text-${color}-800 px-3 py-1 rounded-full text-sm font-semibold`}>
                                                {gym.isPendingApproval.charAt(0).toUpperCase() + gym.isPendingApproval.slice(1)}
                                            </span>
                                        </div>

                                        {/* Created Date */}
                                        <p className="text-black text-sm mb-3">Created At {formattedDate}</p>

                                        {/* Stats */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-1">
                                                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                                                        />
                                                    </svg>
                                                    <span className="text-sm text-gray-600">{gym.earnings} Earnings</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Weekly Visits Chart - Corrected and Enhanced */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Weekly Visits Analytics</h2>
                                <p className="text-gray-500 text-sm mt-1">Member visit trends and patterns</p>
                            </div>
                            <div className="flex rounded-xl p-1">
                                <button className="px-4 py-3 text-sm rounded-lg bg-purple-100 shadow-sm text-purple-600 font-semibold">Week</button>
                            </div>
                        </div>

                        <WeeklyVisitsChart weeklyVisits={data?.weeklyVisits || [0, 0, 0, 0, 0, 0, 0]} />

                        <div className="flex items-center justify-between mt-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                                <span className="text-sm font-semibold text-gray-900">Weekly Visits</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions - Enhanced */}
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center mt-10">Quick Actions</h2>

                <div className="flex justify-center">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Generate Report */}
                        <button className="w-[300px] h-[150px] p-4 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl border border-green-200 transition-all duration-300 text-center group hover:scale-105">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">Generate Report</span>
                        </button>

                        {/* Settings */}
                        <button className="w-[300px] h-[150px] p-4 bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl border border-orange-200 transition-all duration-300 text-center group hover:scale-105">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                    />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">Settings</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
