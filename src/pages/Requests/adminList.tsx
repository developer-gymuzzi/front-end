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

    // Filters
    const [filters, setFilters] = useState({ name: '', status: '' });
    const [appliedFilters, setAppliedFilters] = useState({ name: '', status: '' });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(1);

    // Modal selected item
    const [selectedItem, setSelectedItem] = useState<any | null>(null);

    /* ---------------------------------------------
     * FETCH PAYMENT REQUESTS
     * --------------------------------------------- */
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
                setTotalPages(data?.pagination?.totalPages || 1);
            } else {
                setRequests([]);
                setTotalPages(1);
            }
        } catch (err) {
            console.error('Fetch error: ', err);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPaymentRequests();
    }, [currentPage, pageSize, appliedFilters]);

    /* ---------------------------------------------
     * UPDATE STATUS (APPROVE / REJECT)
     * --------------------------------------------- */
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

            if (data?.success === 1) {
                await Swal.fire('Success', successMsg, 'success');
                fetchPaymentRequests();

                if (selectedItem?._id === id) setSelectedItem(null);
            } else {
                Swal.fire('Error', data.message || 'Failed to update!', 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Something went wrong', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    /* --------------------------------------------------
     * FILTER HANDLERS
     * -------------------------------------------------- */
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

    /* --------------------------------------------------
     * UI RENDER
     * -------------------------------------------------- */
    return (
        <div>
            {/* HEADER */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="grid gap-1">
                    <h2 className="CRM-Page-Title">Payment Requests</h2>
                    <p className="CRM-Page-Structure">
                        Dashboard / <span className="CRM-Page-Name">Payment Requests</span>
                    </p>

                    {/* Active Filters */}
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

            {/* TABLE */}
            <div className="inventory-table table-containers">
                <div className="rounded-lg table-wrapper">
                    <div className="border-t-8 border-[#113354]" />

                    <table className="data-table">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th>S.No</th>
                                <th>User</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Primary Account</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading
                                ? [...Array(5)].map((_, i) => (
                                      <tr key={i} className="border-b">
                                          {[...Array(9)].map((_, j) => (
                                              <td key={j}>
                                                  <div className="h-5 bg-gray-200 rounded animate-pulse" />
                                              </td>
                                          ))}
                                      </tr>
                                  ))
                                : requests.map((item, index) => {
                                      const serial = (currentPage - 1) * pageSize + index + 1;

                                      const primaryAcc = item.userBankAccounts?.find((a: any) => a.primaryAccount);

                                      return (
                                          <tr key={item._id} className="border-b hover:bg-gray-50">
                                              <td>{serial}</td>
                                              <td>{item.user?.name || '---'}</td>
                                              <td>{item.user?.email || '---'}</td>
                                              <td>{item.user?.phone || '---'}</td>

                                              {/* PRIMARY ACCOUNT */}
                                              <td>
                                                  {primaryAcc ? (
                                                      <span className="text-sm font-semibold text-gray-700">
                                                          {primaryAcc.bankName} <br />
                                                          <span className="text-xs text-gray-500">{primaryAcc.accountNo}</span>
                                                      </span>
                                                  ) : (
                                                      '---'
                                                  )}
                                              </td>

                                              <td className="font-semibold">${item.amount}</td>

                                              <td>
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

                                              <td>{new Date(item.createdAt).toLocaleDateString()}</td>

                                              <td>
                                                  <div className="flex gap-2">
                                                      {/* VIEW BUTTON */}
                                                      <button className="w-8 h-8 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center" onClick={() => setSelectedItem(item)}>
                                                          👁
                                                      </button>

                                                      {/* ONLY IF PENDING */}
                                                      {item.status === 'Pending' && (
                                                          <>
                                                              <button
                                                                  className="w-8 h-8 bg-green-100 hover:bg-green-200 rounded-full flex items-center justify-center"
                                                                  onClick={() => updateStatus(item._id, 'approve')}
                                                              >
                                                                  <Check size={18} className="text-green-600" />
                                                              </button>

                                                              <button
                                                                  className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center"
                                                                  onClick={() => updateStatus(item._id, 'reject')}
                                                              >
                                                                  <X size={18} className="text-red-600" />
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

                {/* PAGINATION */}
                <div className="pagination-container">
                    <div className="pagination-controls">
                        <button onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)} className="pagination-button" disabled={currentPage <= 1}>
                            ‹ Prev
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                            <button key={i} onClick={() => setCurrentPage(i + 1)} className={`pagination-number ${currentPage === i + 1 ? 'active' : ''}`}>
                                {i + 1}
                            </button>
                        ))}

                        <button onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)} className="pagination-button" disabled={currentPage >= totalPages}>
                            Next ›
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Items per page</span>
                        <select
                            className="pagination-select"
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

            {/* --------------------------------------------------
             * DETAILS MODAL WITH THEME-BASED ATTRACTIVE DESIGN
             * -------------------------------------------------- */}
            {selectedItem && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[999]">
                    <div className="bg-white w-[90%] md:w-[650px] max-h-[95vh] overflow-y-auto rounded-2xl shadow-2xl border border-gray-200 animate-fadeIn">
                        {/* HEADER */}
                        <div className="flex items-center justify-between px-6 py-4 bg-[#113354] text-white rounded-t-2xl shadow-md">
                            <h2 className="text-[20px] font-semibold tracking-wide">Payment Request Details</h2>
                            <button onClick={() => setSelectedItem(null)} className="text-white hover:bg-white/20 rounded-full p-1 transition">
                                ✕
                            </button>
                        </div>

                        {/* BODY */}
                        <div className="p-6 space-y-7">
                            {/* USER DETAILS */}
                            <div>
                                <h3 className="text-[#113354] font-semibold text-sm mb-2">User Details</h3>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                                    <p className="font-medium text-gray-800">{selectedItem.user?.name}</p>
                                    <p className="text-xs text-gray-500 mt-1">{selectedItem.user?.role}</p>
                                    <p className="text-xs text-gray-500 mt-1">Registered: {new Date(selectedItem.user?.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* CONTACT DETAILS */}
                            <div>
                                <h3 className="text-[#113354] font-semibold text-sm mb-2">Contact Info</h3>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm space-y-1">
                                    <p className="text-sm">
                                        <strong>Email:</strong> {selectedItem.user?.email}
                                    </p>
                                    <p className="text-sm">
                                        <strong>Phone:</strong> {selectedItem.user?.phone}
                                    </p>
                                </div>
                            </div>

                            {/* PAYMENT DETAILS */}
                            <div>
                                <h3 className="text-[#113354] font-semibold text-sm mb-2">Payment Info</h3>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm grid grid-cols-2 gap-4">
                                    <p className="text-sm">
                                        <strong>Amount:</strong> ₹{selectedItem.amount}
                                    </p>
                                    <p className="text-sm">
                                        <strong>Status:</strong> {selectedItem.status}
                                    </p>
                                    <p className="text-sm col-span-2">
                                        <strong>Requested on:</strong> {new Date(selectedItem.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* WALLET */}
                            <div>
                                <h3 className="text-[#113354] font-semibold text-sm mb-2">Wallet Details</h3>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                                    <p className="text-sm">
                                        <strong>User Wallet:</strong> ₹{selectedItem.user?.wallet}
                                    </p>
                                </div>
                            </div>

                            {/* BANK ACCOUNTS */}
                            <div>
                                <h3 className="text-[#113354] font-semibold text-sm mb-3">Bank Accounts</h3>

                                <div className="space-y-4">
                                    {selectedItem.userBankAccounts?.map((acc: any) => (
                                        <div key={acc._id} className="p-4 bg-gray-50 rounded-xl border border-gray-300 shadow-sm hover:shadow-md transition">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-semibold text-gray-800">
                                                    {acc.bankName} - <span className="text-gray-600">{acc.accountType}</span>
                                                </h4>

                                                {acc.primaryAccount && <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full shadow-sm">PRIMARY</span>}
                                            </div>

                                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                                <p>
                                                    <strong>Account Holder:</strong> {acc.name}
                                                </p>
                                                <p>
                                                    <strong>Account No:</strong> {acc.accountNo}
                                                </p>
                                                <p>
                                                    <strong>IFSC:</strong> {acc.ifscCode}
                                                </p>
                                                <p>
                                                    <strong>Branch:</strong> {acc.branchName}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-100 rounded-b-2xl border-t">
                            {selectedItem.status === 'Pending' && (
                                <>
                                    <button
                                        className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow transition"
                                        onClick={() => {
                                            updateStatus(selectedItem._id, 'reject');
                                            setSelectedItem(null);
                                        }}
                                    >
                                        Reject
                                    </button>

                                    <button
                                        className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow transition"
                                        onClick={() => {
                                            updateStatus(selectedItem._id, 'approve');
                                            setSelectedItem(null);
                                        }}
                                    >
                                        Approve
                                    </button>
                                </>
                            )}

                            <button className="px-5 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg shadow transition" onClick={() => setSelectedItem(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
