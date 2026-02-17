import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, IRootState } from '../../store';
import { fetchGym, GymownerGymList } from '../../store/customerConfigSlice';
import axios from 'axios';
import { message } from 'antd';
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
            qr_payload?: string;
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

    // 🔥 HIGH QUALITY QR GENERATION (PNG ONLY)
    const generateQR = async (payload: string) => {
        if (!payload) return '';

        const cleanPayload = payload
            .replace(/\r/g, '')
            .replace(/\n/g, '')
            .trim();

        const qrDataUrl = await QRCode.toDataURL(cleanPayload, {
            width: 400,              // High resolution
            margin: 12,              // Large quiet zone
            errorCorrectionLevel: 'H',
            type: 'image/png',
            color: {
                dark: '#000000',
                light: '#FFFFFF',
            },
        });

        return qrDataUrl;
    };

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

    // 🔥 FORCE PNG DOWNLOAD
    const downloadQRCode = () => {
        if (!qrImage) {
            message.error('QR not available');
            return;
        }

        const link = document.createElement('a');
        link.href = qrImage;
        link.download = 'gym_qr_code.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="inventory-table table-containers">
            <div className="rounded-lg table-wrapper">
                <div className="border-t-8 border-[#113354]"></div>

                <table className="data-table">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="px-4 py-3">S.No</th>
                            <th className="px-4 py-3">Image</th>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Phone</th>
                            <th className="px-4 py-3">PAN</th>
                            <th className="px-4 py-3">License No</th>
                            <th className="px-4 py-3">QR Code</th>
                            <th className="px-4 py-3">Address</th>
                            <th className="px-4 py-3">Last Updated</th>
                            <th className="px-4 py-3">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {GymownerGym.map((entry, index) => (
                            <tr key={entry._id}>
                                <td className="px-4 py-3">
                                    {(currentPage - 1) * pageSize + index + 1}
                                </td>

                                <td className="px-4 py-3">
                                    <img
                                        src={entry.gymphotos?.[0]}
                                        alt="Gym"
                                        className="h-12 w-12 rounded-md object-cover"
                                    />
                                </td>

                                <td className="px-4 py-3">{entry.name || '---'}</td>
                                <td className="px-4 py-3">{entry.email || '---'}</td>
                                <td className="px-4 py-3">{entry.phone || '---'}</td>
                                <td className="px-4 py-3">{entry.pan || '---'}</td>
                                <td className="px-4 py-3">{entry.license_no || '---'}</td>

                                <td className="px-4 py-3">
                                    {entry.qr_payload ? (
                                        <button
                                            className="text-blue-600 underline"
                                            onClick={() => showQrModal(entry.qr_payload!)}
                                        >
                                            View QR
                                        </button>
                                    ) : (
                                        '---'
                                    )}
                                </td>

                                <td className="px-4 py-3">{entry.address || '---'}</td>

                                <td className="px-4 py-3">
                                    {entry.updatedAt
                                        ? new Date(entry.updatedAt).toLocaleString('en-IN')
                                        : '---'}
                                </td>

                                <td className="px-4 py-3">
                                    <button
                                        className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 hover:bg-yellow-200"
                                        onClick={() =>
                                            navigate(`/viewGym/${entry._id}`, {
                                                state: { gymData: entry },
                                            })
                                        }
                                    >
                                        <Eye size={18} className="text-green-600" />
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
                width={500}
            >
                <div style={{ textAlign: 'center' }}>
                    {qrImage && (
                        <img
                            src={qrImage}
                            alt="QR Code"
                            style={{
                                width: 400,
                                height: 400,
                                imageRendering: 'pixelated',
                            }}
                        />
                    )}

                    <button
                        onClick={downloadQRCode}
                        style={{
                            marginTop: 20,
                            padding: '10px 20px',
                            backgroundColor: '#1677ff',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 5,
                            cursor: 'pointer',
                        }}
                    >
                        Download QR Code
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default ApprovedGym;