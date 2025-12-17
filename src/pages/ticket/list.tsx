import { useEffect, useState } from 'react';
import { Button } from '@nextui-org/react';
import { RxCross2 } from 'react-icons/rx';
import Filter from './filter';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, IRootState } from '../../store';
import axios from 'axios';
import Cookies from 'js-cookie';
import { message } from 'antd';
import { Eye, MessageCircleMore, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Pagination } from '@nextui-org/react';

export default function CompanyList() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [closingTicketId, setClosingTicketId] = useState<string | null>(null);
    const [openingTicketId, setOpeningTicketId] = useState<string | null>(null);

    const navigate = useNavigate();
    const dispatch: AppDispatch = useDispatch();

    const endpoint = import.meta.env.VITE_API_LIVEHOST;
    const token = Cookies.get('token');

    const [filters, setFilters] = useState({ name: '', email: '', role: '' });
    const [appliedFilters, setAppliedFilters] = useState({
        name: '',
        email: '',
        role: '',
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(1);

    /* ---------- VIEW MODAL STATES ---------- */
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewData, setViewData] = useState<any>(null);

    const openViewModal = (ticket: any) => {
        setViewData(ticket);
        setShowViewModal(true);
    };

    /* ---------- FETCH TICKETS ---------- */
    const fetchTickets = async (page: number, limit: number, filterValues: any) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', String(page));
            params.append('limit', String(limit));
            if (filterValues.name) params.append('name', filterValues.name);
            if (filterValues.email) params.append('email', filterValues.email);
            if (filterValues.role) params.append('role', filterValues.role);

            const { data } = await axios.get(
                `${endpoint}/v1/admin/list/ticketlisting?${params.toString()}`,
                { headers: { token } }
            );

            if (data.success) {
                setTickets(data.data);
                const totalPageCount =
                    data.pagination?.totalPages ||
                    data.data?.totalPages ||
                    data.totalPages ||
                    1;

                setTotalPages(totalPageCount);
            } else {
                message.error('Failed to load tickets');
            }
        } catch {
            message.error('Something went wrong while fetching tickets');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets(currentPage, pageSize, appliedFilters);
    }, [currentPage, pageSize, appliedFilters]);

    /* ---------- OPEN TICKET ---------- */
    const handleClick = async (id: string) => {
        setOpeningTicketId(id);
        try {
            await axios.patch(
                `${endpoint}/v1/admin/approve/openTicket/${id}`,
                {},
                { headers: { token } }
            );
            await fetchTickets(currentPage, pageSize, appliedFilters);
            navigate(`/adminmessages/${id}`);
        } catch {
            message.error('Failed to open ticket');
        } finally {
            setOpeningTicketId(null);
        }
    };

    /* ---------- CLOSE TICKET ---------- */
    const handleCloseTicket = async (id: string) => {
        setClosingTicketId(id);
        try {
            await axios.patch(
                `${endpoint}/v1/admin/approve/closeTicket/${id}`,
                {},
                { headers: { token } }
            );
            message.success('Ticket closed successfully');
            await fetchTickets(currentPage, pageSize, appliedFilters);
        } catch {
            message.error('Failed to close ticket');
        } finally {
            setClosingTicketId(null);
        }
    };

    /* ---------- PAGINATION ---------- */
    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handlePageClick = (page: number) => {
        if (page !== currentPage) setCurrentPage(page);
    };

    const handlePageSizeChange = (e: any) => {
        setPageSize(Number(e.target.value));
        setCurrentPage(1);
    };

    /* ---------- FILTERS ---------- */
    const handleSearch = (newFilters: any) => {
        setFilters(newFilters);
        setAppliedFilters(newFilters);
        setCurrentPage(1);
    };

    const removeFilter = (key: string) => {
        const updated = { ...appliedFilters, [key]: '' };
        setFilters(updated);
        setAppliedFilters(updated);
        setCurrentPage(1);
    };

    const clearAllFilters = () => {
        const cleared = { name: '', email: '', role: '' };
        setFilters(cleared);
        setAppliedFilters(cleared);
        setCurrentPage(1);
    };

    const formatRoleLabel = (val: string) => {
        if (val === 'gym_owner') return 'Gym Owner';
        if (val === 'admin') return 'Admin';
        if (val === 'user') return 'User';
        return val.charAt(0).toUpperCase() + val.slice(1);
    };

    /* ---------- SKELETON ---------- */
    const SkeletonRow = () => (
        <tr className="border-b animate-pulse">
            <td className="py-4">
                <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
            </td>
            <td className="py-4">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            </td>
            <td className="py-4">
                <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
            </td>
            <td className="py-4">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            </td>
            <td className="py-4">
                <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
            </td>
            <td className="py-4">
                <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </td>
            <td className="py-4">
                <div className="flex gap-3">
                    <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
            </td>
        </tr>
    );

    return (
        <div>
            {/* HEADER */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="grid gap-1">
                    <h2 className="CRM-Page-Title">Tickets</h2>
                    <p className="CRM-Page-Structure">
                        Dashboard / <span className="CRM-Page-Name">Ticket</span>
                    </p>

                    {Object.values(appliedFilters).some((val) => val) && (
                        <div className="flex flex-wrap gap-3 items-center mt-3">
                            {Object.entries(appliedFilters)
                                .filter(([_, val]) => val)
                                .map(([key, value]) => (
                                    <Button
                                        key={key}
                                        className="bg-yellow"
                                        onClick={() => removeFilter(key)}
                                    >
                                        {formatRoleLabel(value)} <RxCross2 />
                                    </Button>
                                ))}

                            <h5
                                className="text-black cursor-pointer"
                                onClick={clearAllFilters}
                            >
                                Clear all filters
                            </h5>
                        </div>
                    )}
                </div>

                <Filter
                    onSearch={handleSearch}
                    filterValues={filters}
                    key={JSON.stringify(filters)}
                />
            </div>

            {/* TABLE */}
            <div className="inventory-table table-containers">
                <div className="rounded-lg table-wrapper">
                    <div className="border-t-8 border-[#113354]" />

                    <table className="data-table">
                        <thead>
                            <tr className="border-b bg-gray-50 dark:bg-gray-800">
                                <th>S.No</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Subject</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {isLoading ? (
                                Array.from({ length: pageSize }).map((_, i) => (
                                    <SkeletonRow key={i} />
                                ))
                            ) : tickets.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="text-center py-8 text-gray-500"
                                    >
                                        No tickets found
                                    </td>
                                </tr>
                            ) : (
                                tickets.map((entry: any, index: number) => {
                                    const rowIndex =
                                        (currentPage - 1) * pageSize + index + 1;

                                    return (
                                        <tr
                                            key={entry._id}
                                            className="border-b hover:bg-gray-50 dark:hover:bg-gray-900"
                                        >
                                            <td>{rowIndex}</td>
                                            <td>{entry.user?.name || '---'}</td>
                                            <td>{entry.user?.email || '---'}</td>
                                            <td>
                                                {formatRoleLabel(
                                                    entry.user?.role || '---'
                                                )}
                                            </td>
                                            <td>{entry.subject}</td>

                                            <td>
                                                <span
                                                    className={`px-2 py-1 text-xs rounded-full font-semibold ${
                                                        entry.status === 'open'
                                                            ? 'bg-green-100 text-green-800'
                                                            : entry.status ===
                                                              'pending'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}
                                                >
                                                    {entry.status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        entry.status.slice(1)}
                                                </span>
                                            </td>

                                            <td className="flex items-center gap-3">
                                                <button
                                                    onClick={() =>
                                                        openViewModal(entry)
                                                    }
                                                    className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 hover:bg-yellow-200 transition"
                                                >
                                                    <Eye
                                                        size={18}
                                                        className="text-green-600"
                                                    />
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleClick(entry._id)
                                                    }
                                                    disabled={
                                                        openingTicketId ===
                                                        entry._id
                                                    }
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 disabled:opacity-50"
                                                >
                                                    <MessageCircleMore className="w-4 h-4" />
                                                    Chat
                                                </button>

                                                {entry.status !== 'closed' && (
                                                    <button
                                                        onClick={() =>
                                                            handleCloseTicket(
                                                                entry._id
                                                            )
                                                        }
                                                        disabled={
                                                            closingTicketId ===
                                                            entry._id
                                                        }
                                                        className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-800 disabled:opacity-50 flex items-center justify-center"
                                                    >
                                                        <X
                                                            size={22}
                                                            className="h-4 w-4"
                                                        />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PAGINATION */}
            <div className="pagination-container">
                <div className="pagination-controls">
                    <button
                        onClick={handlePreviousPage}
                        disabled={currentPage <= 1}
                        className={`pagination-button ${
                            currentPage <= 1
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                        }`}
                    >
                        ‹ Prev
                    </button>

                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => handlePageClick(index + 1)}
                            disabled={index + 1 === currentPage}
                            className={`flex h-8 w-8 items-center justify-center rounded-md text-sm ${
                                index + 1 === currentPage
                                    ? 'bg-yellow text-black cursor-not-allowed'
                                    : 'hover:bg-gray-100 border border-gray-300 text-gray-600'
                            }`}
                        >
                            {index + 1}
                        </button>
                    ))}

                    <button
                        onClick={handleNextPage}
                        disabled={currentPage >= totalPages}
                        className={`pagination-button ${
                            currentPage === totalPages
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                        }`}
                    >
                        Next ›
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                        Items per page
                    </span>
                    <select
                        className="h-8 rounded-md border border-gray-300 bg-white p-1 text-sm text-gray-600"
                        value={pageSize}
                        onChange={handlePageSizeChange}
                    >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                </div>
            </div>

            {/* ---------- VIEW MODAL ---------- */}
            {showViewModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-md max-h-[90vh] overflow-y-auto p-6 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800">
                        <h2 className="text-2xl font-bold mb-5 border-b pb-3">
                            Ticket Details
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <p className="font-semibold">Subject</p>
                                <p>{viewData?.subject || '---'}</p>
                            </div>

                            <div>
                                <p className="font-semibold">Description</p>
                                <p className="whitespace-pre-line">
                                    {viewData?.description || '---'}
                                </p>
                            </div>

                            <div>
                                <p className="font-semibold">Raised By</p>
                                <p>Name: {viewData?.user?.name}</p>
                                <p>Email: {viewData?.user?.email}</p>
                                <p>Phone: {viewData?.user?.phone}</p>
                                <p>
                                    Role:{' '}
                                    {formatRoleLabel(
                                        viewData?.user?.role
                                    )}
                                </p>
                            </div>

                            <div>
                                <p className="font-semibold">
                                    Ticket Raised On
                                </p>
                                <p>
                                    {new Date(
                                        viewData?.createdAt
                                    ).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="px-5 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
