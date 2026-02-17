import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, IRootState } from '../../store';
import { fetchGym, GymownerGymList } from '../../store/customerConfigSlice';
import axios from 'axios';
import { message } from 'antd';
import Swal from 'sweetalert2';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { Modal } from 'antd';

const ApprovedGym = ({ filters }: { filters: any }) => {
    const dispatch: AppDispatch = useDispatch();
    const navigate = useNavigate();

    const { GymownerGym, loading, gymOwnerpagination } = useSelector(
        (state: IRootState) => state.customerConfig
    ) as {
        GymownerGym: {
            _id: string;
            gymphotos?: string[];
            name?: string;
            email?: string;
            phone?: string;
            pan?: string;
            license_no?: string;
            address?: string;
            updatedAt?: any;
            qr_payload?: any;
        }[];
        loading: boolean;
        gymOwnerpagination: { totalPages: number };
    };

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [qrImage, setQrImage] = useState<string>('');

    useEffect(() => {
        dispatch(
            GymownerGymList({
                page: currentPage,
                limit: pageSize,
                ...filters,
                status: 'approved',
            })
        );
    }, [dispatch, currentPage, pageSize, filters]);

    const handlePageChange = (page: number) => {
        if (page !== currentPage) setCurrentPage(page);
    };

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPageSize(Number(e.target.value));
        setCurrentPage(1);
    };

    const approval = async (
        gymId: string,
        approvalStatus: 'approved' | 'rejected'
    ) => {
        try {
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_LIVEHOST}/v1/admin/approve/approveRequest`,
                { gymId, approvalStatus },
                {
                    headers: { 'Content-Type': 'application/json' },
                }
            );

            if (data.success) {
                message.success(data.message);
                dispatch(
                    fetchGym({
                        page: currentPage,
                        limit: pageSize,
                        status: 'approved',
                    })
                );
            } else {
                message.error(data.message);
            }
        } catch (error) {
            message.error('Something went wrong');
        }
    };

    // 🔥 Generate QR as PNG
    const generateQR = async (payload: string) => {
        const cleanPayload = payload?.trim();

        return await QRCode.toDataURL(cleanPayload, {
            width: 300,
            margin: 2,
            errorCorrectionLevel: 'H',
            color: {
                dark: '#000000',
                light: '#ffffff',
            },
        });
    };

    // 🔥 Show Modal with PNG QR
    const showQrModal = async (qrPayload: string) => {
        try {
            const image = await generateQR(qrPayload);
            setQrImage(image);
            setIsModalVisible(true);
        } catch (err) {
            message.error('Failed to generate QR');
        }
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setQrImage('');
    };

    // 🔥 Download PNG
    const downloadQRCode = () => {
        if (!qrImage) {
            message.error('QR code not available.');
            return;
        }

        const link = document.createElement('a');
        link.href = qrImage;
        link.download = 'gym_qr_code.png';
        link.click();
    };

    return (
        <div className="inventory-table table-containers">
            <div className="rounded-lg table-wrapper">
                <div className="border-t-8 border-[#113354]"></div>

                <table className="data-table">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="px-4 py-3 text-left">S.No</th>
                            <th className="px-4 py-3 text-left">Image</th>
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-left">Email</th>
                            <th className="px-4 py-3 text-left">Phone</th>
                            <th className="px-4 py-3 text-left">PAN</th>
                            <th className="px-4 py-3 text-left">License No</th>
                            <th className="px-4 py-3 text-left">QR Code</th>
                            <th className="px-4 py-3 text-left">Address</th>
                            <th className="px-4 py-3 text-left">Last Updated</th>
                            <th className="px-4 py-3 text-left">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading
                            ? [...Array(7)].map((_, idx) => (
                                  <tr key={idx}>
                                      {[...Array(11)].map((_, i) => (
                                          <td key={i} className="px-4 py-3">
                                              <div className="h-5 bg-gray-200 rounded w-full" />
                                          </td>
                                      ))}
                                  </tr>
                              ))
                            : GymownerGym.map((entry, index) => (
                                  <tr key={entry._id}>
                                      <td className="px-4 py-3">
                                          {(currentPage - 1) * pageSize +
                                              index +
                                              1}
                                      </td>

                                      <td className="px-4 py-3">
                                          <img
                                              src={entry.gymphotos?.[0]}
                                              alt="Gym"
                                              className="h-12 w-12 rounded-md object-cover"
                                          />
                                      </td>

                                      <td className="px-4 py-3">
                                          {entry.name || '---'}
                                      </td>
                                      <td className="px-4 py-3">
                                          {entry.email || '---'}
                                      </td>
                                      <td className="px-4 py-3">
                                          {entry.phone || '---'}
                                      </td>
                                      <td className="px-4 py-3">
                                          {entry.pan || '---'}
                                      </td>
                                      <td className="px-4 py-3">
                                          {entry.license_no || '---'}
                                      </td>

                                      <td className="px-4 py-3">
                                          {entry.qr_payload ? (
                                              <button
                                                  className="text-blue-600 underline"
                                                  onClick={() =>
                                                      showQrModal(
                                                          entry.qr_payload
                                                      )
                                                  }
                                              >
                                                  View QR
                                              </button>
                                          ) : (
                                              '---'
                                          )}
                                      </td>

                                      <td className="px-4 py-3">
                                          {entry.address || '---'}
                                      </td>

                                      <td className="px-4 py-3">
                                          {entry.updatedAt
                                              ? new Date(
                                                    entry.updatedAt
                                                ).toLocaleString('en-IN')
                                              : '---'}
                                      </td>

                                      <td className="px-4 py-3">
                                          <button
                                              className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 hover:bg-yellow-200"
                                              onClick={() =>
                                                  navigate(
                                                      `/viewGym/${entry._id}`,
                                                      { state: { gymData: entry } }
                                                  )
                                              }
                                          >
                                              <Eye
                                                  size={18}
                                                  className="text-green-600"
                                              />
                                          </button>
                                      </td>
                                  </tr>
                              ))}
                    </tbody>
                </table>
            </div>

            {/* 🔥 QR Modal */}
            <Modal
                title="QR Code"
                open={isModalVisible}
                onCancel={handleModalClose}
                footer={null}
                width={350}
            >
                <div className="flex flex-col items-center gap-4">
                    {qrImage && (
                        <img
                            src={qrImage}
                            alt="QR Code"
                            width={250}
                        />
                    )}

                    <button
                        onClick={downloadQRCode}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Download QR Code
                    </button>
                </div>
            </Modal>

            {/* Pagination */}
            <div className="pagination-container mt-4 flex justify-between items-center">
                <div className="flex gap-2">
                    <button
                        onClick={() =>
                            handlePageChange(currentPage - 1)
                        }
                        disabled={currentPage <= 1}
                    >
                        ‹ Prev
                    </button>

                    {Array.from(
                        { length: gymOwnerpagination.totalPages || 1 },
                        (_, i) => (
                            <button
                                key={i + 1}
                                onClick={() =>
                                    handlePageChange(i + 1)
                                }
                                className={`px-3 py-1 rounded ${
                                    currentPage === i + 1
                                        ? 'bg-yellow text-white'
                                        : 'bg-gray-100'
                                }`}
                            >
                                {i + 1}
                            </button>
                        )
                    )}

                    <button
                        onClick={() =>
                            handlePageChange(currentPage + 1)
                        }
                        disabled={
                            currentPage >=
                            (gymOwnerpagination.totalPages || 1)
                        }
                    >
                        Next ›
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <span>Items per page</span>
                    <select
                        value={pageSize}
                        onChange={handlePageSizeChange}
                    >
                        {[5, 10, 20, 50].map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default ApprovedGym;