"use client"

import { useState, useEffect } from "react"
import { PencilIcon, TrashIcon, PlusIcon, SearchIcon } from "lucide-react"
import { CheckIcon, XIcon } from "lucide-react";
import "./crm-permissions.css"
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    useDisclosure,
    Card,
    Pagination,
    Spinner,
} from "@nextui-org/react";
import Cookies from "js-cookie";
import axios from "axios";
import { message } from "antd";
import { NavLink } from "react-router-dom";
type RoleItem = {
    id: string;
    name: string;
    description: string;
    Active: string;
};
export default function CRMPermissions() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [roleslist, setRolesList] = useState<RoleItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ role: "", description: "" });

    const endpoint = import.meta.env.VITE_API_LIVEHOST;
    const apiKey = import.meta.env.VITE_API_X_HEADER_KEY;
    const token = Cookies.get("token") || "";
    const secretKey = import.meta.env.VITE_DECREYPT_KEY;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const addRole = async () => {
        if (!formData.role.trim()) {
            message.error("Role is required!");
            return;
        }

        const body = {
            Role: formData.role,
            Description: formData.description,
        };

        try {
            setIsLoading(true);
            const { data } = await axios.post(`${endpoint}?route=admin/add/role`, body, {
                headers: {
                    "x-api-key": apiKey,
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.status === true) {
                setIsLoading(false);
                setFormData({ role: "", description: "" });
                rolelisting(true);
                message.success("Role added successfully!");
            } else {
                message.error("Failed to add role.");
            }
        } catch (error) {
            setIsLoading(false);
            message.error("Something went wrong while adding the role.");
        }
    };


    const rolelisting = async (forceReload = false) => {
        try {
            const { data } = await axios.get(`${endpoint}?route=admin/get/role`, {
                headers: {
                    "x-api-key": apiKey,
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.status === false) {
                message.error(data.message);
            }
            setRolesList(data.data);
            setLoading(false);
        } catch (error) {
            message.error("Something went wrong while fetching roles!");
            setLoading(false);
        }
    };

    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const getList = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(
                `${endpoint}?route=APS/List/Employer&page=${currentPage}&pageSize=${pageSize}`,
                {
                    headers: {
                        'x-api-key': apiKey,
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (data.status === true) {
                setUsers(data.Data);
                setTotalPages(Math.ceil(data.Pagination.totalRecords / pageSize));
            }
        } catch (error) {
            console.error('Error fetching the list:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        rolelisting(false);
        getList();
    }, [currentPage, pageSize]);

    const [searchQuery, setSearchQuery] = useState("")
    // Filter roles based on search query
    const filteredRoles = roleslist.filter((role) => role.name.toLowerCase().includes(searchQuery.toLowerCase()))

    const [editRoleId, setEditRoleId] = useState(null);
    const [roleName, setRoleName] = useState("");
    const handleDoubleClick = (role: any) => {
        setEditRoleId(role.id);
        setRoleName(role.name);
    };

    const updateRoleName = async (roleId: number, newName: string) => {
        try {
            const { data } = await axios.post(`${endpoint}?route=api/update-role-name`,
                {
                    Role: newName,
                    Id: roleId,
                }
                , {
                    headers: {
                        "x-api-key": apiKey,
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

            if (data.status === true) {
                rolelisting(true);
            } else {
                message.error(data.message);
            }
        } catch (error) {
            message.error("Something went wrong while adding the role.");
        }
    };


    const handleUpdate = (role: any) => {
        if (role.name === roleName) {
            message.info('Role name is same as previous');
        } else {
            updateRoleName(role.id, roleName);
        }
        setEditRoleId(null);
    };


    const [Selectloading, setSelectLoading] = useState<Record<string, boolean>>({});

    const handleAccessChange = async (userId: string, roleId: string) => {
        if (!userId) {
            message.error("User ID is required!");
            return;
        } else if (!roleId) {
            message.error("Role ID is required!");
            return;
        }

        setSelectLoading((prev) => ({ ...prev, [userId]: true })); // Set loading state for the specific user

        try {
            const { data } = await axios.post(`${endpoint}?route=api/update-role-guard`,
                { userId, roleId },
                {
                    headers: {
                        "x-api-key": apiKey,
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (data.status) {
                message.success("Role updated successfully!");
                getList();
            } else {
                message.error(data.message);
            }
        } catch (error) {
            message.error("Something went wrong while updating the role.");
        }

        setSelectLoading((prev) => ({ ...prev, [userId]: false })); // Reset loading state
    };


    // Function to cancel edit
    const handleCancel = () => {
        setEditRoleId(null);
    };


    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPageSize(Number(e.target.value));
        setCurrentPage(1);
    };

    return (
        <div className=" ">
            <div className=" mx-auto">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">CRM Permission Management</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left panel - User permissions */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                            {/* Header with dark blue border */}
                            <div className="border-t-8 border-[#113354]"></div>

                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-gray-800">CRM User Roles</h2>

                                    <NavLink to={'/add/user'} className=" btn Insert-Button">
                                        <PlusIcon size={16} />
                                        Add User
                                    </NavLink>
                                </div>

                                <div className="space-y-4">
                                    {loading ? (
                                        <div className="flex items-center justify-center h-32">
                                            <Spinner color="primary" />
                                        </div>
                                    ) :
                                        (users.map((user: any) => (
                                            <div
                                                key={user.Guard_ID}
                                                className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex-1">
                                                    <span className="text-gray-500 text-sm font-medium">user:</span>
                                                    <span className="ml-2 font-medium">{user.first_name} {user.last_name}</span>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="custom-select-wrapper relative">
                                                        {Selectloading[user.Guard_ID] ? (
                                                            <Spinner size="sm" className="absolute left-2 top-1/2 transform -translate-y-1/2" />
                                                        ) :
                                                            <select
                                                                value={user.Role_ID}
                                                                onChange={(e) => handleAccessChange(user.Guard_ID, e.target.value)}
                                                                className="custom-select pl-8" // Add padding for spinner positioning
                                                                disabled={Selectloading[user.Guard_ID]} // Disable when loading
                                                            >
                                                                {roleslist.map((level, index) => (
                                                                    <option key={index} value={level.id}>
                                                                        {level.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        }

                                                    </div>


                                                    {/* <NavLink
                                                        to={`/crm-permissions`}
                                                        className="text-gray-400 hover:text-indigo-600 transition-colors p-1.5 rounded-full hover:bg-indigo-50"
                                                    >
                                                        <PencilIcon size={16} />
                                                    </NavLink> */}
                                                    {/* <button className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
                                                    <TrashIcon size={18} />
                                                </button> */}
                                                </div>
                                            </div>
                                        ))
                                        )}
                                </div>
                                <div className="pagination-container mt-3">
                                    <div className="pagination-controls">
                                        <button
                                            className="pagination-button"
                                            disabled={currentPage === 1 || loading}
                                            onClick={() => handlePageChange(currentPage - 1)}
                                        >
                                            ‹ Prev
                                        </button>
                                        {[...Array(totalPages)].map((_, pageIndex) => (
                                            <button
                                                key={pageIndex}
                                                className={`flex h-8 w-8 items-center justify-center rounded-md text-sm ${currentPage === pageIndex + 1 ? 'bg-yellow text-white' : 'hover:bg-gray-100 border border-gray-300'}`}
                                                onClick={() => handlePageChange(pageIndex + 1)}
                                            >
                                                {pageIndex + 1}
                                            </button>
                                        ))}
                                        <button
                                            className="pagination-button"
                                            disabled={currentPage === totalPages || loading}
                                            onClick={() => handlePageChange(currentPage + 1)}
                                        >
                                            Next ›
                                        </button>
                                    </div>

                                    <div className="items-per-page">
                                        <span className="text-sm text-gray-600">Items per page</span>
                                        <select
                                            className="items-select"
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
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden h-full">

                            <div className="border-t-8 border-[#113354]"></div>

                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-gray-800">Roles</h2>
                                    <button className=" btn Insert-Button" onClick={onOpen}>
                                        <PlusIcon size={14} />
                                        New Role
                                    </button>
                                </div>
                                <div className="relative mb-4">
                                    <input
                                        type="text"
                                        placeholder="Search roles..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                    <SearchIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                </div>

                                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">

                                    {loading ? (
                                        <div className="flex items-center justify-center h-32">
                                            <Spinner color="primary" />
                                        </div>
                                    )
                                        : filteredRoles.map((role) => (
                                            <div
                                                key={role.id}
                                                className="flex items-center justify-between py-2.5 px-3 border-b border-gray-100 hover:bg-gray-50 rounded-md transition-colors"
                                            >
                                                <div className="flex items-center">
                                                    <span className="text-gray-500 mr-2">-</span>
                                                    {editRoleId === role.id ? (
                                                        <input
                                                            type="text"
                                                            value={roleName}
                                                            onChange={(e) => setRoleName(e.target.value)}
                                                            className="border px-2 py-1 rounded-md"
                                                        />
                                                    ) : (
                                                        <span
                                                            className="font-medium text-gray-700 cursor-pointer"
                                                            onDoubleClick={() => handleDoubleClick(role)}
                                                        >
                                                            {role.name}
                                                        </span>
                                                    )}
                                                </div>

                                                {editRoleId === role.id ? (
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => handleUpdate(role)}
                                                            className="text-green-600 hover:bg-green-100 p-1 rounded-full transition-colors"
                                                        >
                                                            <CheckIcon size={16} />
                                                        </button>
                                                        <button
                                                            onClick={handleCancel}
                                                            className="text-red-600 hover:bg-red-100 p-1 rounded-full transition-colors"
                                                        >
                                                            <XIcon size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <NavLink
                                                        to={`/crm-permissions/edit/${role.id}`}
                                                        className="text-gray-400 hover:text-indigo-600 transition-colors p-1.5 rounded-full hover:bg-indigo-50"
                                                        aria-label={`Edit ${role.name} role`}
                                                    >
                                                        <PencilIcon size={16} />
                                                    </NavLink>
                                                )}


                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} className="bg-[url('./assets/Icon/Vector.svg')] bg-center bg-no-repeat">
                <ModalContent>
                    <ModalHeader className="border-none">
                        <span className="flex gap-2">Add Role <img src="./assets/Icon/Add_rolebule.svg" alt="AddRole" /></span>
                    </ModalHeader>
                    <ModalBody>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Role<span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={formData.role}
                                    onChange={handleChange}
                                    name="role"
                                    type="text"
                                    placeholder="Enter Role"
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={handleChange}
                                    name="description"
                                    placeholder="Enter role description..."
                                    rows={5}
                                    className="w-full p-2 border rounded-lg resize-none"
                                    style={{ maxHeight: "150px" }}
                                ></textarea>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter className="justify-start">
                        <button className="Close-btn" onClick={onOpenChange}>
                            Cancel
                        </button>
                        <Button
                            className="yellow-color"
                            onPress={addRole}
                            disabled={!formData.role.trim()} // Disable button if "Role" is empty
                        >
                            {isLoading ? "Adding Role..." : "Add Role"}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div >
    )
}

