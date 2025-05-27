import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { X, Plus, Upload, Edit2, Save, ChevronDown, ChevronUp, MapPin, Phone, Mail, FileText, Percent, CheckCircle2, History, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { message } from 'antd';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function CustomGymForm() {
    const [isEditing, setIsEditing] = useState(false);
    const [activeSection, setActiveSection] = useState<string | null>('basic');
    const [showHistory, setShowHistory] = useState(false);
    const [cloudinaryIds, setCloudinaryIds] = useState<string[]>([]);

    const endpoint = import.meta.env.VITE_API_LIVEHOST;

    const defaultData = {
        name: '',
        lat: 0,
        lon: 0,
        address: '',
        phone: '',
        email: '',
        pan: '',
        gst: '',
        license_no: '',
        owner: { _id: '', name: '', email: '' },
        earnings: 0,
        commissionPercentage: 0,
        gymtype: '',
        isPendingApproval: '',
    };

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const removeSelectedImage = (index: number) => {
        const updatedFiles = [...newFiles];
        const updatedPreviews = [...filePreviews];

        updatedFiles.splice(index, 1);
        URL.revokeObjectURL(updatedPreviews[index]);
        updatedPreviews.splice(index, 1);

        setNewFiles(updatedFiles);
        setFilePreviews(updatedPreviews);

        if (updatedFiles.length === 0 && fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const [formData, setFormData] = useState(defaultData);
    const [amenities, setAmenities] = useState<string[]>([]);
    const [amenityInput, setAmenityInput] = useState('');
    const [photos, setPhotos] = useState<string[]>([]);
    const location = useLocation();
    const { gymData } = location.state || {};


    useEffect(() => {
        if (gymData) {
            setFormData({
                name: gymData.name || '',
                lat: gymData.location.coordinates[1] || 0, 
                lon: gymData.location.coordinates[0] || 0, 
                address: gymData.address || '',
                phone: gymData.phone || '',
                email: gymData.email || '',
                pan: gymData.pan || '',
                gst: gymData.gst || '',
                license_no: gymData.license_no || '',
                owner: gymData.owner || { _id: '', name: '', email: '' },
                earnings: gymData.earnings || 0,
                commissionPercentage: gymData.commissionPercentage || 20,
                gymtype: gymData.gymtype || 'gym',
                isPendingApproval: gymData.isPendingApproval || 'pending',
            });

            setPhotos(gymData.gymphotos || []);
            setAmenities(gymData.amenities || []);
            setPhotos(gymData.gymphotos || []);
            setCloudinaryIds(gymData.cloudinary_public_id || []);
        }
    }, [gymData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [filePreviews, setFilePreviews] = useState<string[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const selected = Array.from(files);
        const maxAllowed = 5 - photos.length - newFiles.length;
        const filtered = selected.slice(0, maxAllowed);

        const newPreviews = filtered.map((file) => URL.createObjectURL(file));

        setNewFiles((prev) => [...prev, ...filtered]);
        setFilePreviews((prev) => [...prev, ...newPreviews]);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const Token = Cookies.get('token');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const form = new FormData();
            form.append('gymId', gymData?._id);
            form.append('name', formData.name);
            form.append('lat', formData.lat.toString());
            form.append('lon', formData.lon.toString());
            form.append('address', formData.address);
            form.append('phone', formData.phone);
            form.append('email', formData.email);
            form.append('pan', formData.pan);
            form.append('gst', formData.gst);
            form.append('license_no', formData.license_no);
            form.append('gymtype', formData.gymtype);

            if (amenities.length > 0) {
                amenities.forEach((amenity) => {
                    form.append('amenities', amenity);
                });
            }

            newFiles.forEach((file) => {
                form.append('gymphotos', file);
            });
            const { data } = await axios.post(`${endpoint}/v1/gym/updateData`, form, {
                headers: {
                    token: Token,
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (data.success) {
                message.success('Gym updated successfully.');
                setIsEditing(false);
            } else {
                message.error(data.message || 'Failed to update gym.');
            }
        } catch (err) {
            console.error(err);
            message.error('Something went wrong while updating the gym.');
        }
    };

    const addAmenity = () => {
        if (amenityInput.trim() !== '' && !amenities.includes(amenityInput.trim())) {
            setAmenities([...amenities, amenityInput.trim()]);
            setAmenityInput('');
        }
    };

    const removeAmenity = (amenity: string) => {
        setAmenities(amenities.filter((a) => a !== amenity));
    };

    const removePhoto = async (photo: string) => {
        const index = photos.findIndex((p) => p === photo);
        if (index === -1) return;

        const imageIds = [cloudinaryIds[index]];
        const gymId = gymData?._id;

        const body = {
            imageIds,
            gymId,
        };

        if (isEditing && gymId && imageIds) {
            try {
                const { data } = await axios.delete(`${endpoint}/v1/admin/edit/gymPic`, { data: body });

                if (data.success) {
                    message.success('Image deleted successfully');
                    setPhotos((prev) => prev.filter((_, i) => i !== index));
                    setCloudinaryIds((prev) => prev.filter((_, i) => i !== index));
                } else {
                    message.error(data.message || 'Failed to delete image');
                }
            } catch (err) {
                message.error('Something went wrong while deleting image');
            }
        }
    };

    const toggleSection = (section: string) => {
        setActiveSection(activeSection === section ? null : section);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const gymTypeOptions = {
        gym: 'Fitness Gym',
        yoga: 'Yoga Studio',
        crossfit: 'CrossFit Box',
        pilates: 'Pilates Studio',
    };

    const approvalStatusOptions = {
        pending: 'Pending Approval',
        approved: 'Approved',
        rejected: 'Rejected',
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Header */}
            <div className="bg-[#071d3f] py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white">{formData.name}</h1>
                            <p className="mt-2 text-blue-100 flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {formData.address}
                            </p>
                            {formData.owner && formData.owner.name && (
                                <p className="mt-2 text-blue-200 flex items-center">
                                    <User className="h-4 w-4 mr-1" />
                                    Owner: {formData.owner.name}
                                </p>
                            )}
                        </div>
                        <div className="mt-4 md:mt-0 flex gap-2">
                            {gymData?.previousNames && gymData.previousNames.length > 0 && (
                                <button
                                    onClick={() => setShowHistory(!showHistory)}
                                    className="px-5 py-2.5 rounded-lg font-medium flex items-center transition-all bg-blue-800 text-white hover:bg-blue-700"
                                >
                                    <History className="h-4 w-4 mr-2" /> History
                                </button>
                            )}
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={`px-5 py-2.5 rounded-lg font-medium flex items-center transition-all ${
                                    isEditing ? 'bg-white text-blue-700 hover:bg-gray-100' : 'bg-blue-600 text-white hover:bg-blue-500'
                                }`}
                            >
                                {isEditing ? (
                                    <>
                                        <X className="h-4 w-4 mr-2" /> Cancel
                                    </>
                                ) : (
                                    <>
                                        <Edit2 className="h-4 w-4 mr-2" /> Edit Gym
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Badge */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-white shadow-md">
                    <span
                        className={`inline-block w-3 h-3 rounded-full mr-2 ${
                            formData.isPendingApproval === 'approved' ? 'bg-green-500' : formData.isPendingApproval === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}
                    ></span>
                    <span className="text-sm font-medium text-gray-700">{approvalStatusOptions[formData.isPendingApproval as keyof typeof approvalStatusOptions]}</span>
                </div>
            </div>

            {/* History Modal */}
            {showHistory && gymData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-800">Gym History</h2>
                                <button onClick={() => setShowHistory(false)} className="text-gray-500 hover:text-gray-700">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            {gymData.previousNames && gymData.previousNames.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-medium text-gray-800 mb-3">Previous Names</h3>
                                    <div className="space-y-3">
                                        {gymData.previousNames.map((item: any) => (
                                            <div key={item._id} className="bg-gray-50 p-3 rounded-lg">
                                                <p className="text-gray-800 font-medium">{item.name}</p>
                                                <p className="text-sm text-gray-500">Changed on {formatDate(item.changedAt)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {gymData.previousAddresses && gymData.previousAddresses.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-medium text-gray-800 mb-3">Previous Addresses</h3>
                                    <div className="space-y-3">
                                        {gymData.previousAddresses.map((item: any) => (
                                            <div key={item._id} className="bg-gray-50 p-3 rounded-lg">
                                                <p className="text-gray-800 font-medium">{item.address}</p>
                                                <p className="text-sm text-gray-500">Changed on {formatDate(item.changedAt)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(!gymData.previousNames || gymData.previousNames.length === 0) && (!gymData.previousAddresses || gymData.previousAddresses.length === 0) && (
                                <p className="text-gray-500 italic">No history records available.</p>
                            )}
                        </div>
                        <div className="p-4 border-t border-gray-200 bg-gray-50">
                            <div className="flex justify-end">
                                <button onClick={() => setShowHistory(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmit}>
                    {/* Basic Information Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between bg-white rounded-t-xl px-6 py-4 cursor-pointer" onClick={() => toggleSection('basic')}>
                            <h2 className="text-xl font-bold text-gray-800">Basic Information</h2>
                            <button type="button" className="text-gray-500">
                                {activeSection === 'basic' ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </button>
                        </div>

                        {activeSection === 'basic' && (
                            <div className="bg-white rounded-b-xl shadow-sm p-6 border-t border-gray-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-gray-700">Gym Name</label>
                                            {isEditing && <span className="text-xs text-blue-600">Required</span>}
                                        </div>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            />
                                        ) : (
                                            <p className="text-gray-900 py-2.5">{formData.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-gray-700">Gym Type</label>
                                        </div>
                                        {isEditing ? (
                                            <select
                                                name="gymtype"
                                                value={formData.gymtype}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none bg-white"
                                            >
                                                <option value="Commercial Gym">Commercial Gym</option>
                                                <option value="Boutique Fitness">Boutique Fitness</option>
                                                <option value="CrossFit Box">CrossFit Box</option>
                                                <option value="Yoga Studio">Yoga Studio</option>
                                                <option value="Dance Studio">Dance Studio</option>
                                                <option value="Martial Arts">Martial Arts</option>
                                                <option value="Personal Training">Personal Training</option>
                                                <option value="Sports Complex">Sports Complex</option>
                                            </select>
                                        ) : (
                                            <p className="text-gray-900 py-2.5">{gymTypeOptions[formData.gymtype as keyof typeof gymTypeOptions]}</p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-gray-700">Address</label>
                                        </div>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            />
                                        ) : (
                                            <p className="text-gray-900 py-2.5">{formData.address}</p>
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-gray-700">Latitude</label>
                                        </div>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="lat"
                                                value={formData.lat}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            />
                                        ) : (
                                            <p className="text-gray-900 py-2.5">{formData.lat}</p>
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-gray-700">Longitude</label>
                                        </div>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="lon"
                                                value={formData.lon}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            />
                                        ) : (
                                            <p className="text-gray-900 py-2.5">{formData.lon}</p>
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                        </div>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            />
                                        ) : (
                                            <p className="text-gray-900 py-2.5 flex items-center">
                                                <Phone className="h-4 w-4 mr-2 text-gray-500" />
                                                {formData.phone}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                        </div>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            />
                                        ) : (
                                            <p className="text-gray-900 py-2.5 flex items-center">
                                                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                                                {formData.email}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Owner Information Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between bg-white rounded-t-xl px-6 py-4 cursor-pointer" onClick={() => toggleSection('owner')}>
                            <h2 className="text-xl font-bold text-gray-800">Owner Information</h2>
                            <button type="button" className="text-gray-500">
                                {activeSection === 'owner' ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </button>
                        </div>

                        {activeSection === 'owner' && (
                            <div className="bg-white rounded-b-xl shadow-sm p-6 border-t border-gray-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-gray-700">Owner Name</label>
                                        </div>
                                        {isEditing ? (
                                            <input
                                            readOnly
                                                type="text"
                                                name="owner.name"
                                                value={formData.owner?.name || ''}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        owner: { ...prev.owner, name: e.target.value },
                                                    }))
                                                }
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            />
                                        ) : (
                                            <p className="text-gray-900 py-2.5 flex items-center">
                                                <User className="h-4 w-4 mr-2 text-gray-500" />
                                                {formData.owner?.name || 'Not specified'}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-gray-700">Owner Email</label>
                                        </div>
                                        {isEditing ? (
                                            <input
                                            readOnly
                                                type="email"
                                                name="owner.email"
                                                value={formData.owner?.email || ''}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        owner: { ...prev.owner, email: e.target.value },
                                                    }))
                                                }
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            />
                                        ) : (
                                            <p className="text-gray-900 py-2.5 flex items-center">
                                                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                                                {formData.owner?.email || 'Not specified'}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-gray-700">Owner ID</label>
                                        </div>
                                        <p className="text-gray-900 py-2.5">{formData.owner?._id || 'Not specified'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Business Details Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between bg-white rounded-t-xl px-6 py-4 cursor-pointer" onClick={() => toggleSection('business')}>
                            <h2 className="text-xl font-bold text-gray-800">Business Details</h2>
                            <button type="button" className="text-gray-500">
                                {activeSection === 'business' ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </button>
                        </div>

                        {activeSection === 'business' && (
                            <div className="bg-white rounded-b-xl shadow-sm p-6 border-t border-gray-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-gray-700">PAN Number</label>
                                        </div>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="pan"
                                                value={formData.pan}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            />
                                        ) : (
                                            <p className="text-gray-900 py-2.5 flex items-center">
                                                <FileText className="h-4 w-4 mr-2 text-gray-500" />
                                                {formData.pan}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-gray-700">GST Number</label>
                                        </div>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="gst"
                                                value={formData.gst}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            />
                                        ) : (
                                            <p className="text-gray-900 py-2.5 flex items-center">
                                                <FileText className="h-4 w-4 mr-2 text-gray-500" />
                                                {formData.gst}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-gray-700">License Number</label>
                                        </div>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="license_no"
                                                value={formData.license_no}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            />
                                        ) : (
                                            <p className="text-gray-900 py-2.5 flex items-center">
                                                <FileText className="h-4 w-4 mr-2 text-gray-500" />
                                                {formData.license_no}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-gray-700">Earnings</label>
                                        </div>
                                        {isEditing ? (
                                            <input
                                            readOnly
                                                type="number"
                                                name="earnings"
                                                value={formData.earnings}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            />
                                        ) : (
                                            <p className="text-gray-900 py-2.5">₹{formData.earnings}</p>
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-gray-700">Commission Percentage</label>
                                        </div>
                                        {isEditing ? (
                                            <input
                                            readOnly
                                                type="number"
                                                name="commissionPercentage"
                                                value={formData.commissionPercentage}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            />
                                        ) : (
                                            <p className="text-gray-900 py-2.5 flex items-center">
                                                <Percent className="h-4 w-4 mr-2 text-gray-500" />
                                                {formData.commissionPercentage}%
                                            </p>
                                        )}
                                    </div>

                                    {/* <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-gray-700">Approval Status</label>
                                        </div>
                                        {isEditing ? (
                                            <select
                                                name="isPendingApproval"
                                                value={formData.isPendingApproval}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none bg-white"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="approved">Approved</option>
                                                <option value="rejected">Rejected</option>
                                            </select>
                                        ) : (
                                            <p className="text-gray-900 py-2.5">{approvalStatusOptions[formData.isPendingApproval as keyof typeof approvalStatusOptions]}</p>
                                        )}
                                    </div> */}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Features & Media Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between bg-white rounded-t-xl px-6 py-4 cursor-pointer" onClick={() => toggleSection('features')}>
                            <h2 className="text-xl font-bold text-gray-800">Features & Media</h2>
                            <button type="button" className="text-gray-500">
                                {activeSection === 'features' ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </button>
                        </div>

                        {activeSection === 'features' && (
                            <div className="bg-white rounded-b-xl shadow-sm p-6 border-t border-gray-100">
                                {/* Amenities */}
                                <div className="mb-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-medium text-gray-800">Amenities</h3>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {amenities.map((amenity, index) => (
                                            <div key={index} className={`px-3 py-1.5 rounded-full flex items-center ${isEditing ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                                <CheckCircle2 className={`h-4 w-4 mr-1.5 ${isEditing ? 'text-blue-600' : 'text-gray-500'}`} />
                                                <span className={`text-sm ${isEditing ? 'text-blue-800' : 'text-gray-700'}`}>{amenity}</span>
                                                {isEditing && (
                                                    <button type="button" onClick={() => removeAmenity(amenity)} className="ml-1.5 text-blue-500 hover:text-blue-700">
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        {amenities.length === 0 && <p className="text-gray-500 text-sm italic">No amenities added yet.</p>}
                                    </div>

                                    {isEditing && (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={amenityInput}
                                                onChange={(e) => setAmenityInput(e.target.value)}
                                                placeholder="Add an amenity"
                                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                                            />
                                            <button
                                                type="button"
                                                onClick={addAmenity}
                                                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition flex items-center"
                                            >
                                                <Plus className="h-4 w-4 mr-1.5" /> Add
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Photos */}
                                {/* Photos Section */}
                                <div className="mb-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-medium text-gray-800">Gym Photos</h3>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                        {photos.map((photo, index) => (
                                            <div key={index} className="relative group overflow-hidden rounded-lg border border-gray-200">
                                                <div className="aspect-video bg-gray-100">
                                                    <img
                                                        src={photo || '/placeholder.svg'}
                                                        alt={`Gym Photo ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                                                        }}
                                                    />
                                                </div>
                                                {isEditing && (
                                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => removePhoto(photo)}
                                                            className="opacity-0 group-hover:opacity-100 bg-white rounded-full p-1.5 shadow-lg hover:bg-red-50 transition-all duration-300"
                                                        >
                                                            <X className="h-4 w-4 text-red-500" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Single Upload Input */}
                                    {isEditing && (
                                        <>
                                            <div className="mb-4">
                                                <label htmlFor="photoUpload" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Upload up to 3 images
                                                </label>

                                                {newFiles.length < 5 && (
                                                    <input
                                                        type="file"
                                                        id="photoUpload"
                                                        accept="image/*"
                                                        ref={fileInputRef}
                                                        multiple
                                                        onChange={handleFileChange}
                                                        disabled={newFiles.length >= 3}
                                                        className="block w-full text-sm text-gray-500
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0
                   file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-blue-700
                   hover:file:bg-blue-100"
                                                    />
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                {filePreviews.map((preview, index) => (
                                                    <div key={index} className="relative">
                                                        <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-md" />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeSelectedImage(index)}
                                                            className="absolute top-1 right-1 bg-white text-red-500 rounded-full p-1 shadow hover:bg-red-50"
                                                            title="Remove"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Form Actions */}
                    {isEditing && (
                        <div className="flex justify-end mt-8">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 mr-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition flex items-center"
                            >
                                <Save className="h-4 w-4 mr-2" /> Save Changes
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
