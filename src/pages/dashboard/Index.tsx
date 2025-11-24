'use client';

export default function Component() {
    const chartData = [
        { day: 'Sun', visits: 30, x: 50, y: 180 },
        { day: 'Mon', visits: 45, x: 100, y: 150 },
        { day: 'Tue', visits: 25, x: 150, y: 200 },
        { day: 'Wed', visits: 60, x: 200, y: 120 },
        { day: 'Thu', visits: 50, x: 250, y: 140 },
        { day: 'Fri', visits: 70, x: 300, y: 100 },
        { day: 'Sat', visits: 55, x: 350, y: 130 },
    ];

    const pathData = chartData.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
            <div className="max-w-10xl mx-auto">
                {/* Stats Cards - Enhanced with Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 ">
                    {/* Total Tickets */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl p-6 shadow-md border border-blue-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group ">
                        {/* Decorative Glow */}
                        <div className="absolute inset-0 bg-blue-400/5 blur-2xl"></div>

                        {/* Header */}
                        <div className="flex items-center justify-between mb-5 relative z-10">
                            <div className="flex items-center space-x-2">
                                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
                                <p className="text-gray-700 text-sm font-semibold uppercase tracking-wide">Total Tickets</p>
                            </div>

                            <div className="relative">
                                <select className="appearance-none bg-white/80 backdrop-blur-sm border border-blue-300 rounded-xl px-3 py-1.5 pr-6 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm">
                                    <option value="all">Filter</option>
                                    <option value="open">Open</option>
                                    <option value="closed">Closed</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-blue-500">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Number */}
                        <div className="flex flex-col items-center justify-center mt-2 relative z-10">
                            <p className="text-5xl font-extrabold text-blue-700 group-hover:text-blue-800 transition-colors duration-300 leading-tight">84</p>
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
                                <p className="text-gray-700 text-sm font-semibold uppercase tracking-wide">Total Revenue</p>
                            </div>

                            {/* Filter Dropdown */}
                            <div className="relative">
                                <select className="appearance-none bg-white/90 backdrop-blur-sm border border-green-300 rounded-xl px-3 py-1.5 pr-7 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer shadow-sm transition-all duration-200">
                                    <option value="month">Filter</option>
                                    <option value="month">This Month</option>
                                    <option value="quarter">This Quarter</option>
                                    <option value="year">This Year</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-green-500">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Main Revenue Value */}
                        <div className="flex flex-col items-center justify-center mt-3 relative z-10">
                            <div className="flex items-center space-x-2">
                                {/*    Animated Icon */}

                                <p className="text-4xl font-extrabold text-green-700 group-hover:text-green-800 transition-colors duration-300 leading-tight">$24,580</p>
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
                                <p className="text-gray-700 text-sm font-semibold uppercase tracking-wide">Total Members</p>
                            </div>

                            {/* Filter Dropdown */}
                            <div className="relative">
                                <select className="appearance-none bg-white/90 backdrop-blur-sm border border-purple-300 rounded-xl px-3 py-1.5 pr-7 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer shadow-sm transition-all duration-200">
                                    <option value="month">Filter</option>
                                    <option value="day">This Day</option>
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-purple-500">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Main Members Value */}
                        <div className="flex flex-col items-center justify-center mt-3 relative z-10">
                            <div className="flex items-center space-x-2">
                                <p className="text-4xl font-extrabold text-purple-700 group-hover:text-purple-800 transition-colors duration-300 leading-tight">1,247</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 tracking-wide font-medium">Active Members</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Gyms Status - Enhanced */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Recent Gyms Status</h2>
                                <p className="text-gray-500 text-sm mt-1">Latest gym approvals and updates</p>
                            </div>
                            <button className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-200 flex items-center space-x-2">
                                <span>View All</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                        <div className="space-y-4">
                            {[
                                { name: 'Powerhouse Gym', status: 'Approved', members: 324, tickets: 12, date: 'May 20, 2025', color: 'green' },
                                { name: 'Elite Fitness Center', status: 'Pending', members: 187, tickets: 8, date: 'May 18, 2025', color: 'yellow' },
                                { name: 'Iron Paradise', status: 'Rejected', members: 256, tickets: 15, date: 'May 15, 2025', color: 'red' },
                            ].map((gym, index) => (
                                <div
                                    key={index}
                                    className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-purple-300 transition-all duration-300 group hover:shadow-md"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-purple-700 transition-colors">{gym.name}</h3>
                                        <span className={`bg-${gym.color}-100 text-${gym.color}-800 px-3 py-1 rounded-full text-sm font-semibold`}>{gym.status}</span>
                                    </div>
                                    <p className="text-gray-500 text-sm mb-3">Last updated: {gym.date}</p>
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
                                                <span className="text-sm text-gray-600">{gym.members} Members</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                    />
                                                </svg>
                                                <span className="text-sm text-gray-600">{gym.tickets} Tickets</span>
                                            </div>
                                        </div>
                                        <button className="text-gray-400 hover:text-purple-600 transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Weekly Visits Chart - Enhanced */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Weekly Visits Analytics</h2>
                                <p className="text-gray-500 text-sm mt-1">Member visit trends and patterns</p>
                            </div>
                            <div className="flex bg-gray-100 rounded-xl p-1">
                                <button className="px-3 py-1 text-sm rounded-lg bg-white shadow-sm text-purple-600 font-semibold">Week</button>
                                <button className="px-3 py-1 text-sm rounded-lg text-gray-500 hover:text-gray-700 transition-colors">Month</button>
                                <button className="px-3 py-1 text-sm rounded-lg text-gray-500 hover:text-gray-700 transition-colors">Year</button>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="h-64 relative">
                                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-sm text-gray-500 py-4">
                                    <span>70</span>
                                    <span>53</span>
                                    <span>35</span>
                                    <span>18</span>
                                    <span>0</span>
                                </div>
                                <div className="ml-8 h-full relative">
                                    <div className="absolute inset-0">
                                        {[0, 1, 2, 3, 4].map((i) => (
                                            <div key={i} className="absolute w-full border-t border-gray-200" style={{ top: `${i * 25}%` }} />
                                        ))}
                                    </div>
                                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 240">
                                        <defs>
                                            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        <path d={`${pathData} L 350 240 L 50 240 Z`} fill="url(#areaGradient)" />
                                        <path d={pathData} stroke="#8b5cf6" strokeWidth="3" fill="none" className="drop-shadow-sm" />
                                        {chartData.map((point, index) => (
                                            <circle key={index} cx={point.x} cy={point.y} r="4" fill="#8b5cf6" className="hover:r-6 transition-all cursor-pointer" />
                                        ))}
                                    </svg>
                                </div>
                            </div>
                            <div className="flex justify-between mt-4 ml-8 text-sm text-gray-500">
                                {chartData.map((point) => (
                                    <span key={point.day} className="font-medium">
                                        {point.day}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                                <span className="text-sm font-semibold text-gray-900">Weekly Visits</span>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600">
                                    Total this week: <span className="font-bold text-gray-900">335 visits</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions - Enhanced */}
                {/* <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300"> */}
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

                {/* </div> */}
            </div>
        </div>
    );
}
