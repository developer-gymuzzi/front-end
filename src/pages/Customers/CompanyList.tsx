import { useEffect, useState } from 'react';
import { Pagination } from '@nextui-org/react';
import { Drawer, DrawerContent, DrawerBody, DrawerFooter, Button, useDisclosure, Spinner } from '@nextui-org/react';
import { RxCross2 } from 'react-icons/rx';
import Filter from './Filters';
import { Eye, Trash, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import Cookies from 'js-cookie';
import ViewCompanyModal from './view-company-modal';
import View from '../../../public/assets/APSIcon/View';
import Edit from '../../../public/assets/APSIcon/Edit';
import Delete from '../../../public/assets/APSIcon/delect';
import { Table, message } from 'antd';
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateCompany } from '../../store/customerConfigSlice';
import { AppDispatch, IRootState } from '../../store';
import { useSelector } from 'react-redux';

interface CompanyFormData {
    ID: string,
    Company_name: string,
    Contact_person: string,
    Number: string,
    Email: string,
    Address: string,
    Logo: File | null,
}



export default function ComapnyList() {
    const [viewModalOpen, setViewModalOpen] = useState(false)
    const [companydata, setCompany]: any = useState([])
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [loading, setLoading] = useState<boolean>(true);
    const [viewMode, setViewMode] = useState<boolean>(false)
    const isLoadingFromStore = useSelector((state: IRootState) => state.customerConfig.loading);

    ; // Import the AppDispatch type

    const dispatch: AppDispatch = useDispatch();
    const navigate = useNavigate()

    const [activeTab, setActiveTab] = useState('inventory');

    const endpoint = import.meta.env.VITE_API_LIVEHOST;
    const apiKey = import.meta.env.VITE_API_X_HEADER_KEY;
    const token = Cookies.get('token') || '';

    const [formData, setFormData] = useState<CompanyFormData>({
        ID: '',
        Company_name: '',
        Contact_person: '',
        Number: '',
        Email: '',
        Address: '',
        Logo: null,
    });

    const [originalFormData, setOriginalFormData] = useState<CompanyFormData | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    const checkForChanges = (currentData: CompanyFormData) => {
        if (!originalFormData) return false;
        
        return (
            currentData.Company_name !== originalFormData.Company_name ||
            currentData.Contact_person !== originalFormData.Contact_person ||
            currentData.Number !== originalFormData.Number ||
            currentData.Email !== originalFormData.Email ||
            currentData.Address !== originalFormData.Address ||
            currentData.Logo !== originalFormData.Logo
        );
    };

    const [list, setList] = useState<any[]>([]);
    const [editId, setEditId] = useState<number | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const updatedFormData = {
            ...formData,
            [name]: value,
        };
        setFormData(updatedFormData);
        setHasChanges(checkForChanges(updatedFormData));
    };


    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalRecords, setTotalRecords] = useState(0);

    const getInventory = async (page = 1, pageSize = 5) => {
        try {
            const { data } = await axios.get(`${endpoint}?route=company/list/get&page=${page}&pageSize=${pageSize}`, {
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.status) {
                setList(data.Data);
                setCurrentPage(data.Pagination.currentPage);
                setTotalPages(data.Pagination.totalPages);
                setTotalRecords(data.Pagination.totalRecords);
                setLoading(false);
            }
        } catch (error) {
            toast.error('Something went wrong while fetching inventory data.');
        }
    };

    // useEffect(() => {
    //     getInventory(currentPage, pageSize);
    // }, [currentPage, pageSize]);


    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handlePageClick = (page: any) => {
        if (page !== currentPage) {
            setCurrentPage(page);
        }
    };

    const handlePageSizeChange = (e: any) => {
        setPageSize(Number(e.target.value));
        setCurrentPage(1);
    };

    const editData = async () => {
        if (editId === null) return;
        setIsLoading(true);

        const body = { ...formData, ID: editId };

        try {
            const { data } = await axios.post(`${endpoint}?route=admin/Edit/Inventory`, body, {
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.status) {
                message.success("Inventory updated successfully!");
                setEditId(null);
                onOpenChange()
                getInventory();
            } else {
                message.error('Failed to update inventory.');
            }
        } catch (error) {
            toast.error('Something went wrong while updating the inventory.');
        }
        setIsLoading(false);
    };

    const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;

        if (file) {
            const validTypes = ['image/jpeg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                message.error('Please upload a PNG or JPG image.');
                return;
            }

            setLogoPreview(URL.createObjectURL(file));

            const updatedFormData = {
                ...formData,
                Logo: file,
            };
            setFormData(updatedFormData);
            setHasChanges(checkForChanges(updatedFormData));
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!hasChanges) return;

        const formDataToSend = new FormData();
        formDataToSend.append('ID', formData.ID.toString());
        formDataToSend.append('Company_name', formData.Company_name);
        formDataToSend.append('Contact_person', formData.Contact_person);
        formDataToSend.append('Number', formData.Number);
        formDataToSend.append('Email', formData.Email);
        formDataToSend.append('Address', formData.Address);

        if (formData.Logo) {
            formDataToSend.append('Logo', formData.Logo);
            console.log(formData.Logo);
        }

        // Wait for the dispatch to complete
        await dispatch(updateCompany(formDataToSend));

        if (!isLoadingFromStore) {
            onOpenChange();
        }

        getInventory();
    };
    const deleteData = async (id: number) => {
        try {
            const { data } = await axios.post(`${endpoint}?route=admin/Trash/Inventory`, { ID: id }, {
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.status == true) {
                message.success('Inventory moved to trash successfully.');
                getInventory();
            } else {
                toast.error('Failed to move inventory to trash.');
            }
        } catch (error) {
            toast.error('Something went wrong while trashing the inventory.');
        }
    };

    const openEditDrawer = (entry: any) => {
        setViewMode(false);
        const newFormData = {
            ID: entry.ID,
            Company_name: entry.Name,
            Contact_person: entry.Contact_person,
            Number: entry.Phone,
            Email: entry.Email,
            Address: entry.Address,
            Logo: entry.logo,
        };
        setFormData(newFormData);
        setOriginalFormData(newFormData);
        setHasChanges(false);
        setEditId(entry.ID);
        onOpen();
    };


    const resetFormData = () => {
        setFormData({
            ID: '',
            Company_name: '',
            Contact_person: '',
            Number: '',
            Email: '',
            Address: '',
            Logo: null,
        });
        setEditId(null);
    };

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        if (tabId !== 'inventory') {
            resetFormData();
        }
    };

    // useEffect(() => {
    //     if (activeTab === "inventory") {
    //         setLoading(true);
    //         getInventory()
    //             .then(() => {
    //                 setLoading(false);
    //             })
    //             .catch(() => {
    //                 setLoading(false);
    //             });
    //     }
    // }, [activeTab]);



    const company = () => {
        navigate('/addCompany')
    }


    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="grid gap-1">
                    <h2 className="CRM-Page-Title">Customers</h2>
                    <p className="CRM-Page-Structure">
                        Dashboard / <span className="CRM-Page-Name">Customers</span>
                    </p>
                    <div className="flex flex-wrap gap-3 items-center mt-3">

                    </div>
                </div>

                {/* <div className="flex flex-wrap items-center justify-end gap-3">
                    <Button className="Insert-Button" onClick={company}>
                        <Plus /> Add Customers
                    </Button>
                </div> */}
            </div>


            <div className="inventory-table table-containers">
                <div className="rounded-lg table-wrapper">
                    <div className="border-t-8 border-[#113354]"></div>
                    <table className="data-table">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="px-4 py-3 text-left font-medium text-gray-500 sortable-header">S.No</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500 sortable-header">Company Name</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500 sortable-header">Address</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500 sortable-header">Phone</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500 sortable-header">Contact Person</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500 sortable-header">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(5)].map((_, index) => (
                                    <tr key={index} className="border-b last:border-b-0">
                                        <td className="px-4 py-3">
                                            <div className="w-12 rounded h-5 bg-gray-300 "></div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            <div className="w-24 rounded h-5 bg-gray-300 "></div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            <div className="w-16 rounded h-5 bg-gray-300 "></div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            <div className="w-12 rounded h-5 bg-gray-300 "></div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            <div className="w-12 rounded h-5 bg-gray-300 "></div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            <div className="flex gap-2">
                                                <div className="w-5 rounded h-5 bg-gray-300 "></div>
                                                <div className="w-5 rounded h-5 bg-gray-300 "></div>
                                                <div className="w-5 rounded h-5 bg-gray-300 "></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                list.map((entry, index) => {
                                    const rowIndex = (currentPage - 1) * pageSize + (index + 1);

                                    return (
                                        <tr
                                            key={entry.ID}
                                            className="border-b last:border-b-0 hover:shadow-md hover:font-semibold"
                                        >
                                            <td className="px-4 py-3">{rowIndex}</td>
                                            <td className="px-4 py-3 text-gray-600">{entry.Name || '---'} </td>
                                            <td className="px-4 py-3 text-gray-600">{entry.Address || '---'}</td>
                                            <td className="px-4 py-3 text-gray-600">{entry.Phone || '---'}</td>
                                            <td className="px-4 py-3 text-gray-600">{entry.Contact_person || '---'}</td>
                                            <td className="px-4 py-3 text-gray-600">
                                                <div className="flex gap-2">

                                                    <span className="cursor-pointer" onClick={() => {
                                                        setCompany(entry);
                                                        setViewModalOpen(true);
                                                    }}>
                                                        <View className="h-5 w-5 text-gray-400" />
                                                    </span>
                                                    <span onClick={() => openEditDrawer(entry)} className="cursor-pointer">
                                                        <Edit className="h-5 w-5 text-gray-500" />
                                                    </span>
                                                    <span
                                                    className="cursor-pointer"
                                                        onClick={() => {
                                                            if (entry.id) {
                                                                Swal.fire({
                                                                    title: 'Are you sure?',
                                                                    icon: 'warning',
                                                                    showCancelButton: true,
                                                                    confirmButtonColor: getComputedStyle(
                                                                        document.documentElement
                                                                    )
                                                                        .getPropertyValue('--yellow-color')
                                                                        .trim(),
                                                                    cancelButtonColor: '#d33',
                                                                    confirmButtonText: 'Yes, delete it!',
                                                                }).then((result) => {
                                                                    if (result.isConfirmed) {
                                                                        deleteData(entry.id);
                                                                        Swal.fire(
                                                                            'Deleted!',
                                                                            'Your item has been deleted.',
                                                                            'success'
                                                                        );
                                                                    }
                                                                });
                                                            }
                                                        }}
                                                    >
                                                        <Delete className="h-5 w-5 text-red-500" />
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>


                    </table>
                </div>


                <div className="pagination-container">
                    <div className="pagination-controls">
                        <button
                            onClick={handlePreviousPage}
                            className={`pagination-button ${currentPage <= 1 ? "opacity-50 cursor-not-allowed" : ""}`}
                            disabled={currentPage <= 1}
                        >
                            ‹ Prev
                        </button>
                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={index + 1}
                                onClick={() => handlePageClick(index + 1)}
                                className={`flex h-8 w-8 items-center justify-center rounded-md text-sm 
                                    ${index + 1 === currentPage ? "bg-yellow text-white" : "hover:bg-gray-100 border border-gray-300 text-gray-600"}
                                    ${index + 1 === currentPage ? "cursor-not-allowed" : ""}`}
                                disabled={index + 1 === currentPage}
                            >
                                {index + 1}
                            </button>
                        ))}
                        <button
                            onClick={handleNextPage}
                            className={`pagination-button ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
                            disabled={currentPage >= totalPages || totalPages === 0}
                        >
                            Next ›
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Items per page</span>
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

            </div>


            <ViewCompanyModal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} company={companydata} />

            <Drawer isOpen={isOpen} onOpenChange={onOpenChange} size="xl" className="h-screen" shouldBlockScroll={true}>
                <DrawerContent>
                    {(onClose) => (
                        <>
                            <DrawerBody>
                                <div className="grid gap-4">
                                    <h3 className="Drawer-header">Edit Company</h3>
                                    <div className="space-y-2 mt-1">
                                        <div className="input-field flex items-center justify-center">
                                            <div className="relative w-24 h-24 mb-4 flex items-center justify-center">
                                                <img
                                                    id="logo-preview"
                                                    src={logoPreview || (typeof formData.Logo === 'string' ? formData.Logo : '')}
                                                    alt="Logo Preview"
                                                    className="w-full h-full object-cover rounded-full border-2 border-gray-300"
                                                />

                                                {!logoPreview && !formData.Logo && (
                                                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center mb-1 mr-1">
                                                        <span className="text-xl">+</span>
                                                    </div>
                                                )}

                                                <input
                                                    id="logo"
                                                    type="file"
                                                    name="Logo"
                                                    accept="image/*"
                                                    disabled={false} // Disable if in view mode
                                                    onChange={handleLogoChange} // Handle image file change
                                                    className="absolute inset-0 opacity-0 cursor-pointer rounded-full"
                                                    required={!formData.ID} // Make the field required if no ID (assuming this is for creating, not editing)
                                                />
                                            </div>
                                        </div>

                                        <div className="input-field">
                                            <label htmlFor="Company_name" className="Form-label">Company Name</label>
                                            <input
                                                id="Company_name"
                                                type="text"
                                                name="Company_name"
                                                value={formData.Company_name}
                                                disabled={viewMode}
                                                onChange={handleChange}
                                                placeholder="Enter company name"
                                                required={!formData.ID}
                                                className="w-full border border-gray-300 rounded-md"
                                            />
                                        </div>

                                        <div className="input-field">
                                            <label htmlFor="Address">Address</label>
                                            <textarea
                                                id="Address"
                                                name="Address"
                                                value={formData.Address}
                                                onChange={handleChange}
                                                disabled={viewMode}
                                                placeholder="Enter company address"
                                                rows={3}
                                                className="w-full border border-gray-300 rounded-md p-4"
                                                required={!formData.ID}  // Only required if not editing an existing entry
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-5">
                                            <div className="input-field">
                                                <label htmlFor="Contact_person">Contact Person</label>
                                                <input
                                                    id="Contact_person"
                                                    type="text"
                                                    name="Contact_person"
                                                    value={formData.Contact_person}
                                                    disabled={viewMode}
                                                    onChange={handleChange}
                                                    placeholder="Enter contact person name"
                                                    required={!formData.ID}  // Only required if not editing an existing entry
                                                    className="w-full border border-gray-300 rounded-md"
                                                />
                                            </div>
                                            <div className="input-field">
                                                <label htmlFor="Phone">Phone Number</label>
                                                <input
                                                    id="Phone"
                                                    type="tel"
                                                    name="Number"
                                                    value={formData.Number}
                                                    disabled={viewMode}
                                                    onChange={handleChange}
                                                    placeholder="Enter phone number"
                                                    required={!formData.ID}  // Only required if not editing an existing entry
                                                    className="w-full border border-gray-300 rounded-md"
                                                />
                                            </div>
                                        </div>

                                        <div className="input-field">
                                            <label htmlFor="Email">Email Address</label>
                                            <input
                                                id="Email"
                                                type="email"
                                                name="Email"
                                                value={formData.Email}
                                                disabled={viewMode}
                                                onChange={handleChange}
                                                placeholder="Enter email address"
                                                required={!formData.ID}  // Only required if not editing an existing entry
                                                className="w-full border border-gray-300 rounded-md"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </DrawerBody>

                            <DrawerFooter className="flex justify-start gap-1 mt-3">
                                <button className="Close-btn" onClick={onClose}>Close</button>
                                {!viewMode && (
                                    <button
                                        className="submit-btn"
                                        onClick={handleSubmit}
                                        disabled={isLoadingFromStore || !hasChanges}


                                    >
                                        {isLoadingFromStore ? 'Updating...' : 'Update'}
                                    </button>
                                )}

                            </DrawerFooter>

                        </>
                    )}
                </DrawerContent>
            </Drawer>
        </div>
    );
}