import { useEffect, useState } from 'react';
import { RxCross2 } from 'react-icons/rx';
import Filter from './Filters';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, IRootState } from '../../store';
import { fetchUsers } from '../../store/customerConfigSlice';
import UserDetailsModal from './UserDetailsModal';
import { Button, message } from 'antd';
import axios from "axios";
import Cookies from "js-cookie";
import { Eye, Ban, Check } from 'lucide-react';

// ================= USER INTERFACE =================
interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    wallet: number | string;
    phone: string;
    dob: string;
    gender: string | null;
    phoneVerified: boolean;
    emailVerified: boolean;
    avatar?: string;
    approved?: boolean;
    verificationCode?: string;
    verificationCodeExpiry?: string;
    profileImage?: string;
    trainerCertification?: string[];
    trainerExperience?: string[];
    lastLogin?: string | null;
    isDeleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
    currentToken?: string;
    isBlocked?: boolean;
    blockedAt?: string | null;
    [key: string]: any;
}

export default function CompanyList() {
    const dispatch: AppDispatch = useDispatch();
    const { users = [], loading = false, pagination } = useSelector((state: IRootState) => state.customerConfig);

    const [filters, setFilters] = useState({ name: '', email: '', role: '' });
    const [appliedFilters, setAppliedFilters] = useState({ name: '', email: '', role: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(1);

    const [isModal, setIsModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // ============ Fetch Users ============
    useEffect(() => {
        dispatch(fetchUsers({ page: currentPage, limit: pageSize, ...appliedFilters }));
    }, [dispatch, currentPage, pageSize, appliedFilters]);

    useEffect(() => {
        if (pagination?.totalPages) {
            setTotalPages(pagination.totalPages);
        }
    }, [pagination]);

    // Pagination Handlers
    const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
    const handlePreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
    const handlePageClick = (page: number) => page !== currentPage && setCurrentPage(page);
    const handlePageSizeChange = (e: any) => {
        setPageSize(Number(e.target.value));
        setCurrentPage(1);
    };

    // Filters
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

    // ==================== BLOCK USER ====================
    const handleBlock = async (userId: string) => {
        try {
            const token = Cookies.get("token");

            const res = await axios.patch(
                `${import.meta.env.VITE_API_LIVEHOST}/v1/admin/approve/blockUser/${userId}`,
                {},
                { headers: { token } }
            );

            if (res.data.success) {
                message.success("User blocked successfully");
                dispatch(fetchUsers({ page: currentPage, limit: pageSize, ...appliedFilters }));
            } else {
                message.error(res.data.message);
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || "Failed to block user");
        }
    };

    // ==================== UNBLOCK USER ====================
    const handleUnblock = async (userId: string) => {
        try {
            const token = Cookies.get("token");

            const res = await axios.patch(
                `${import.meta.env.VITE_API_LIVEHOST}/v1/admin/approve/unblockUser/${userId}`,
                {},
                { headers: { token } }
            );

            if (res.data.success) {
                message.success("User unblocked successfully");
                dispatch(fetchUsers({ page: currentPage, limit: pageSize, ...appliedFilters }));
            } else {
                message.error(res.data.message);
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || "Failed to unblock user");
        }
    };

    // View Details
    const handleViewDetails = (user: User) => {
        setSelectedUser(user);
        setIsModal(true);
    };

    // ==================== UI ====================
    return (
        <div>
            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="grid gap-1">
                    <h2 className="CRM-Page-Title">People</h2>
                    <p className="CRM-Page-Structure">
                        Dashboard / <span className="CRM-Page-Name">People</span>
                    </p>

                    {Object.entries(appliedFilters).some(([_, val]) => val) && (
                        <div className="flex flex-wrap gap-3 items-center mt-3">
                            {Object.entries(appliedFilters)
                                .filter(([_, val]) => val)
                                .map(([key, value]) => (
                                    <Button key={key} className="yellow-color" onClick={() => removeFilter(key)}>
                                        {formatRoleLabel(value)} <RxCross2 />
                                    </Button>
                                ))}

                            <h5 className="text-yellow cursor-pointer" onClick={clearAllFilters}>
                                Clear all filters
                            </h5>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3">
                    <Filter onSearch={handleSearch} filterValues={filters} />
                </div>
            </div>

            {/* TABLE */}
            <div className="inventory-table table-containers">
                <div className="rounded-lg table-wrapper">
                    <div className="border-t-8 border-[#113354]"></div>

                    <table className="data-table">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="px-4 py-3">S.No</th>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Phone</th>
                                <th className="px-4 py-3">Role</th>
                                <th className="px-4 py-3 text-center">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading
                                ? [...Array(5)].map((_, idx) => (
                                      <tr key={idx} className="border-b">
                                          <td className="px-4 py-3"><div className="w-12 h-5 bg-gray-300"></div></td>
                                          <td className="px-4 py-3"><div className="w-24 h-5 bg-gray-300"></div></td>
                                          <td className="px-4 py-3"><div className="w-16 h-5 bg-gray-300"></div></td>
                                          <td className="px-4 py-3"><div className="w-12 h-5 bg-gray-300"></div></td>
                                          <td className="px-4 py-3"><div className="w-12 h-5 bg-gray-300"></div></td>
                                          <td className="px-4 py-3">
                                              <div className="flex gap-2">
                                                  <div className="w-5 h-5 bg-gray-300"></div>
                                                  <div className="w-5 h-5 bg-gray-300"></div>
                                                  <div className="w-5 h-5 bg-gray-300"></div>
                                              </div>
                                          </td>
                                      </tr>
                                  ))
                                : users.map((entry: User, index) => {
                                      const rowIndex = (currentPage - 1) * pageSize + (index + 1);

                                      return (
                                          <tr key={entry._id} className="border-b hover:shadow-md">
                                              <td className="px-4 py-3">{rowIndex}</td>
                                              <td className="px-4 py-3">{entry.name || "---"}</td>
                                              <td className="px-4 py-3">{entry.email || "---"}</td>
                                              <td className="px-4 py-3">{entry.phone || "---"}</td>

                                              <td className="px-4 py-3">
                                                  <span
                                                      className={`inline-block px-2 py-1 text-xs rounded-full font-semibold ${
                                                          entry.role === 'admin'
                                                              ? 'bg-blue-100 text-blue-700'
                                                              : entry.role === 'user'
                                                              ? 'bg-purple-100 text-purple-700'
                                                              : entry.role === 'gym_owner'
                                                              ? 'bg-yellow-100 text-yellow-800'
                                                              : 'bg-gray-100 text-gray-600'
                                                      }`}>
                                                      {entry.role === "gym_owner"
                                                          ? "Gym Owner"
                                                          : entry.role.charAt(0).toUpperCase() + entry.role.slice(1)}
                                                  </span>

                                                  {entry.isBlocked && (
                                                      <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                                                          Blocked
                                                      </span>
                                                  )}
                                              </td>

                                              <td className="px-2 py-2">
                                                  <div className="flex items-center gap-2">
                                                      {/* View */}
                                                      <button
                                                          onClick={() => handleViewDetails(entry)}
                                                          className="p-2 rounded-md text-blue-500 hover:bg-blue-100">
                                                          <Eye size={18} />
                                                      </button>

                                                      {/* BLOCK USER */}
                                                      <button
                                                          onClick={() => handleBlock(entry._id)}
                                                          disabled={entry.isBlocked}
                                                          className={`p-2 rounded-md ${
                                                              entry.isBlocked
                                                                  ? "text-gray-400 cursor-not-allowed"
                                                                  : "text-red-500 hover:bg-red-100"
                                                          }`}
                                                      >
                                                          <Ban size={18} />
                                                      </button>

                                                      {/* UNBLOCK USER */}
                                                      <button
                                                          onClick={() => handleUnblock(entry._id)}
                                                          disabled={!entry.isBlocked}
                                                          className={`p-2 rounded-md ${
                                                              !entry.isBlocked
                                                                  ? "text-gray-400 cursor-not-allowed"
                                                                  : "text-green-500 hover:bg-green-100"
                                                          }`}
                                                      >
                                                          <Check size={18} />
                                                      </button>
                                                  </div>
                                              </td>
                                          </tr>
                                      );
                                  })}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                <div className="pagination-container">
                    <div className="pagination-controls">
                        <button disabled={currentPage <= 1} onClick={handlePreviousPage} className="pagination-button">
                            ‹ Prev
                        </button>

                        {[...Array(totalPages)].map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => handlePageClick(idx + 1)}
                                disabled={idx + 1 === currentPage}
                                className={`flex h-8 w-8 items-center justify-center rounded-md ${
                                    idx + 1 === currentPage
                                        ? "bg-yellow text-white"
                                        : "hover:bg-gray-100 border border-gray-300"
                                }`}
                            >
                                {idx + 1}
                            </button>
                        ))}

                        <button disabled={currentPage >= totalPages} onClick={handleNextPage} className="pagination-button">
                            Next ›
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <span>Items per page</span>
                        <select value={pageSize} onChange={handlePageSizeChange} className="border p-1 rounded">
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                        </select>
                    </div>
                </div>
            </div>

            <UserDetailsModal isOpen={isModal} onClose={() => setIsModal(false)} user={selectedUser} />
        </div>
    );
}
