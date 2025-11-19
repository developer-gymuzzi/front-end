import React, { useEffect, useState } from 'react';
import { Button } from '@nextui-org/react';
import { RxCross2 } from 'react-icons/rx';
import Filter from './Filters';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';
import axios from 'axios';
import { Check, X } from 'lucide-react';

export default function PaymentRequestList() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const endpoint = import.meta.env.VITE_API_LIVEHOST;
    const token = Cookies.get('token') || '';

    // Filters → name + status
    const [filters, setFilters] = useState({ name: '', status: '' });
    const [appliedFilters, setAppliedFilters] = useState({ name: '', status: '' });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(1);

    // Modal selected item
    const [selectedItem, setSelectedItem] = useState<any | null>(null);

    // FETCH PAYMENT REQUESTS
    const fetchPaymentRequests = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams({
                page: String(currentPage),
                limit: String(pageSize),
            });

            if (appliedFilters.name) params.append('name', appliedFilters.name);
            if (appliedFilters.status) params.append('status', appliedFilters.status);

            const url = `${endpoint}/v1/admin/list/paymentrequestlisting?${params.toString()}`;

            const response = await axios.get(url, {
                headers: { token },
            });

            const data = response?.data;
            if (data && data.success === 1) {
                setRequests(Array.isArray(data.data) ? data.data : []);
                setTotalPages(data?.pagination?.totalPages ? Number(data.pagination.totalPages) : 1);
            } else {
                setRequests([]);
                setTotalPages(1);
                console.warn('Unexpected response from paymentrequestlisting:', data);
            }
        } catch (err) {
            console.error('Fetch error: ', err);
            setRequests([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPaymentRequests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, pageSize, appliedFilters]);

    // APPROVE or REJECT request
    const updateStatus = async (id: string, type: 'approve' | 'reject') => {
        try {
            const api = type === 'approve' ? `${endpoint}/v1/admin/approve/approvePaymentRequest/${id}` : `${endpoint}/v1/admin/approve/rejectPaymentRequest/${id}`;

            const confirmMsg = type === 'approve' ? 'Approve this request?' : 'Reject this request?';
            const successMsg = type === 'approve' ? 'Request Approved!' : 'Request Rejected!';

            const result = await Swal.fire({
                title: confirmMsg,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#113354',
            });

            if (!result.isConfirmed) return;

            setActionLoading(id);

            const response = await axios.post(api, {}, { headers: { token } });
            const data = response?.data;

            if (data && data.success === 1) {
                await Swal.fire('Success', successMsg, 'success');
                // refresh list
                fetchPaymentRequests();
                // close modal if the selected item was the same and status changed
                if (selectedItem?._id === id) {
                    setSelectedItem(null);
                }
            } else {
                Swal.fire('Error', data?.message || 'Failed to update!', 'error');
            }
        } catch (error) {
            console.error('Update status error:', error);
            Swal.fire('Error', 'Something went wrong', 'error');
        } finally {
            setActionLoading(null);
        }
    };

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
        const cleared = { name: '', status: '' };
        setFilters(cleared);
        setAppliedFilters(cleared);
        setCurrentPage(1);
    };

    return (
        <div>
            {/* ---------- HEADER ---------- */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="grid gap-1">
                    <h2 className="CRM-Page-Title">Payment Requests</h2>
                    <p className="CRM-Page-Structure">
                        Dashboard / <span className="CRM-Page-Name">Payment Requests</span>
                    </p>

                    {Object.values(appliedFilters).some((val) => val) && (
                        <div className="flex flex-wrap gap-3 items-center mt-3">
                            {Object.entries(appliedFilters)
                                .filter(([_, val]) => val)
                                .map(([key, value]) => (
                                    <Button key={key} className="yellow-color" onClick={() => removeFilter(key)}>
                                        {value} <RxCross2 />
                                    </Button>
                                ))}

                            <h5 className="text-yellow cursor-pointer" onClick={clearAllFilters}>
                                Clear all filters
                            </h5>
                        </div>
                    )}
                </div>

                <Filter onSearch={handleSearch} filterValues={filters} />
            </div>

            {/* ---------- TABLE ---------- */}
            <div className="inventory-table table-containers">
                <div className="rounded-lg table-wrapper">
                    <div className="border-t-8 border-[#113354]" />

                    <table className="data-table">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="px-4 py-3">S.No</th>
                                <th className="px-4 py-3">User</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Phone</th>
                                <th className="px-4 py-3">Amount</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading
                                ? [...Array(5)].map((_, i) => (
                                      <tr key={i} className="border-b">
                                          {[...Array(8)].map((_, j) => (
                                              <td key={j} className="px-4 py-3">
                                                  <div className="h-5 w-full bg-gray-200 rounded animate-pulse" />
                                              </td>
                                          ))}
                                      </tr>
                                  ))
                                : requests.map((item: any, index: number) => {
                                      const serial = (currentPage - 1) * pageSize + index + 1;

                                      return (
                                          <tr key={item._id} className="border-b hover:bg-gray-50">
                                              <td className="px-4 py-3">{serial}</td>
                                              <td className="px-4 py-3">{item.user?.name || '---'}</td>
                                              <td className="px-4 py-3">{item.user?.email || '---'}</td>
                                              <td className="px-4 py-3">{item.user?.phone || '---'}</td>
                                              <td className="px-4 py-3 font-semibold">${item.amount}</td>

                                              <td className="px-4 py-3">
                                                  <span
                                                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                          item.status === 'Pending'
                                                              ? 'bg-yellow-100 text-yellow-800'
                                                              : item.status === 'Approved'
                                                              ? 'bg-green-100 text-green-700'
                                                              : 'bg-red-100 text-red-700'
                                                      }`}
                                                  >
                                                      {item.status}
                                                  </span>
                                              </td>

                                              <td className="px-4 py-3">{new Date(item.createdAt).toLocaleDateString()}</td>

                                              {/* ---------- ACTION COLUMN ---------- */}
                                              <td className="px-4 py-3">
                                                  <div className="flex gap-2 items-center">
                                                      {/* VIEW BUTTON (Always Visible) */}
                                                      <button
                                                          className="w-8 h-8 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center"
                                                          onClick={() => setSelectedItem(item)}
                                                          title="View Details"
                                                      >
                                                          👁
                                                      </button>

                                                      {/* SHOW APPROVE/REJECT ONLY IF PENDING */}
                                                      {item.status === 'Pending' && (
                                                          <>
                                                              <button
                                                                  className="w-8 h-8 bg-green-100 hover:bg-green-200 rounded-full flex items-center justify-center"
                                                                  onClick={() => updateStatus(item._id, 'approve')}
                                                                  title="Approve"
                                                                  disabled={actionLoading === item._id}
                                                              >
                                                                  {actionLoading === item._id ? (
                                                                      <div className="h-4 w-4 border-2 border-green-500 rounded-full animate-spin" />
                                                                  ) : (
                                                                      <Check size={18} className="text-green-600" />
                                                                  )}
                                                              </button>

                                                              <button
                                                                  className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center"
                                                                  onClick={() => updateStatus(item._id, 'reject')}
                                                                  title="Reject"
                                                                  disabled={actionLoading === item._id}
                                                              >
                                                                  {actionLoading === item._id ? (
                                                                      <div className="h-4 w-4 border-2 border-red-500 rounded-full animate-spin" />
                                                                  ) : (
                                                                      <X size={18} className="text-red-600" />
                                                                  )}
                                                              </button>
                                                          </>
                                                      )}
                                                  </div>
                                              </td>
                                          </tr>
                                      );
                                  })}
                        </tbody>
                    </table>
                </div>

                {/* ---------- PAGINATION ---------- */}
                <div className="pagination-container">
                    <div className="pagination-controls">
                        <button
                            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                            className={`pagination-button ${currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={currentPage <= 1}
                        >
                            ‹ Prev
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`flex h-8 w-8 items-center justify-center rounded-md text-sm ${currentPage === i + 1 ? 'bg-yellow text-white' : 'hover:bg-gray-100 border border-gray-300'}`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                            className={`pagination-button ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={currentPage >= totalPages}
                        >
                            Next ›
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Items per page</span>
                        <select
                            className="h-8 rounded-md border border-gray-300 bg-white p-1 text-sm text-gray-600"
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                        </select>
                    </div>
                </div>
            </div>

            {selectedItem && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999] fade-in">
                    <div className="bg-white w-[520px] md:w-[650px] rounded-xl shadow-2xl border border-gray-200 animate-slide-up">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-[#113354] rounded-t-xl">
                            <h2 className="text-lg font-semibold text-white">Payment Request Details</h2>
                            <button onClick={() => setSelectedItem(null)} className="text-white hover:text-gray-200 transition">
                                ✕
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* User Info */}
                            <div>
                                <h3 className="text-sm font-semibold text-[#113354] mb-1">User Details</h3>
                                <div className="bg-gray-50 rounded-lg p-3 shadow-sm border border-gray-200">
                                    <p className="text-sm font-medium">{selectedItem.user?.name || 'N/A'}</p>
                                    <p className="text-xs text-gray-500">{selectedItem.user?.role || 'User'}</p>
                                    <p className="text-xs text-gray-500 mt-1">Registered: {new Date(selectedItem.user?.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Contact */}
                            <div>
                                <h3 className="text-sm font-semibold text-[#113354] mb-1">Contact Info</h3>
                                <div className="bg-gray-50 rounded-lg p-3 shadow-sm border border-gray-200">
                                    <p className="text-sm">
                                        <strong>Email:</strong> {selectedItem.user?.email || 'N/A'}
                                    </p>
                                    <p className="text-sm">
                                        <strong>Phone:</strong> {selectedItem.user?.phone || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="md:col-span-2">
                                <h3 className="text-sm font-semibold text-[#113354] mb-1">Payment Details</h3>
                                <div className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200 grid grid-cols-2 gap-4">
                                    <p className="text-sm">
                                        <strong>Amount:</strong> ${selectedItem.amount}
                                    </p>
                                    <p className="text-sm">
                                        <strong>Status:</strong> {selectedItem.status}
                                    </p>
                                    <p className="text-sm col-span-2">
                                        <strong>Requested on:</strong> {new Date(selectedItem.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Wallet */}
                            <div className="md:col-span-2">
                                <h3 className="text-sm font-semibold text-[#113354] mb-1">Wallet Details</h3>
                                <div className="bg-gray-50 rounded-lg p-3 shadow-sm border border-gray-200">
                                    <p className="text-sm">
                                        <strong>User Wallet:</strong> {selectedItem.user?.wallet ?? 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                            {selectedItem.status === 'Pending' && (
                                <>
                                    <button
                                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-sm"
                                        onClick={() => {
                                            updateStatus(selectedItem._id, 'reject');
                                            setSelectedItem(null);
                                        }}
                                    >
                                        Reject
                                    </button>

                                    <button
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm"
                                        onClick={() => {
                                            updateStatus(selectedItem._id, 'approve');
                                            setSelectedItem(null);
                                        }}
                                    >
                                        Approve
                                    </button>
                                </>
                            )}

                            <button className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg shadow-sm" onClick={() => setSelectedItem(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
