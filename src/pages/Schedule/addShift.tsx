import { message } from 'antd';
import axios from 'axios';
import Cookies from 'js-cookie';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { fetchAllCustomers, fetchCustomersSite, fetchGaurd, fetchServices } from '../../store/customerConfigSlice';
import { AppDispatch, IRootState } from '../../store';
import { Drawer, DrawerContent, DrawerBody, DrawerFooter, Button, useDisclosure, Spinner } from '@nextui-org/react';
export default function addShift() {
    const endpoint = import.meta.env.VITE_API_LIVEHOST;
    const apiKey = import.meta.env.VITE_API_X_HEADER_KEY;
    const dispatch: AppDispatch = useDispatch()
    const token = Cookies.get('token')
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    interface Customer {
        id: number,
        customer_name: string
    }
    interface Gaurds {
        ID: number,
        first_name: string,
        last_name: string
    }
    interface Services {
        ID: number,
        Service_name: string,

    }
    interface Site {
        ID: number,
        site_name: string,

    }

    const { siteId } = useParams()
    const { allcustomers } = useSelector((state: IRootState) => state.customerConfig) as { allcustomers: Customer[] };
    const { gaurds } = useSelector((state: IRootState) => state.customerConfig) as { gaurds: Gaurds[] }
    const { services } = useSelector((state: IRootState) => state.customerConfig) as { services: Services[] }
    const { site } = useSelector((state: IRootState) => state.customerConfig) as { site: Site[] }


    const [formData, setFormData] = useState({
        gaurd_name: "",
        shift_date: "",
        schedulestart: "",
        scheduleend: "",
        customer: "",
        site: "",
        service: "",
        note: "",
    });


    const formattedGuards = gaurds.map(guard => ({
        id: guard.ID,
        name: `${guard.first_name} ${guard.last_name}`.trim(),
    }));



    useEffect(() => {
        dispatch(fetchGaurd())
        dispatch(fetchAllCustomers())
        dispatch(fetchGaurd())
        dispatch(fetchServices())
    }, [])


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value,
        }));
    };


    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await axios.post(`${endpoint}?route=User/Insert/Shift`, formData, {
                headers: {
                    "x-api-key": apiKey,
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.status === true) {
                message.success(data.message);
                setFormData({
                    gaurd_name: "",
                    shift_date: "",
                    schedulestart: "",
                    scheduleend: "",
                    customer: "",
                    site: "",
                    service: "",
                    note: "",
                })


            } else {
                message.error(data.message);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            message.error("Submission failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const filteredOptions = formattedGuards.filter((guard) =>
        guard.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCustomerChange = (customerId: any) => {
        setFormData((prev) => ({
            ...prev,
            customer: customerId,
        }));

        dispatch(fetchCustomersSite({ customerId }));
    };



    return (
        <form onSubmit={handleSubmit} >
            <div
                className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 shadow-medium rounded-large transition-transform-background motion-reduce:transition-none"
                tabIndex={-1}
            >
                <div className="relative flex w-full p-3 flex-auto flex-col place-content-inherit align-items-inherit h-auto break-words text-left overflow-y-auto subpixel-antialiased">
                    <h2 className="uppercase text-xl">Add Shift</h2>
                    <span
                        aria-hidden="true"
                        className="w-px h-px block"
                        style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                    />
                    <div className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 shadow-medium transition-transform-background motion-reduce:transition-none rounded-[10px] p-2 mb-2">
                        <div className="title border-b pb-2 w-full flex justify-between">
                            <span className="">General info</span>
                        </div>

                        <div className="relative flex w-full p-3 flex-auto flex-col place-content-inherit align-items-inherit h-auto break-words text-left overflow-y-auto subpixel-antialiased">
                            <div className="grid grid-cols-2 gap-5">

                                <div className="relative">
                                    <label htmlFor="guard_name">
                                        Guard Name <span className="text-red-500">*</span>
                                    </label>

                                    <div
                                        className="w-full border rounded-md p-2 flex items-center justify-between bg-white cursor-pointer"
                                        onClick={() => setIsOpen(!isOpen)}
                                    >

                                        <span>
                                            {formData.gaurd_name
                                                ? formattedGuards.find(option => option.id === Number(formData.gaurd_name))?.name || "Select an option"
                                                : "Select an option"}
                                        </span>


                                        {isOpen ? (
                                            <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                                        ) : (
                                            <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                                        )}
                                    </div>

                                    {isOpen && (
                                        <div className="absolute w-full border bg-white rounded-md shadow-md mt-1 z-10">

                                            <input
                                                type="text"
                                                placeholder="Search..."
                                                className="w-full border-b p-2"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />

                                            <div className="max-h-40 overflow-y-auto">
                                                {filteredOptions.length > 0 ? (
                                                    filteredOptions.map((option) => (
                                                        <div
                                                            key={option.id}
                                                            className="p-2 hover:bg-gray-100 cursor-pointer"
                                                            onClick={() => {
                                                                setFormData((prev) => ({ ...prev, gaurd_name: option.id.toString() }));
                                                                setIsOpen(false);
                                                            }}

                                                        >
                                                            {option.name}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-2 text-gray-500">No options found</div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>


                                <div>
                                    <label htmlFor="shift_date">
                                        Shift Date
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        id="shift_date"
                                        name=''
                                        className="w-full border rounded-md px-3 py-2"
                                        value={formData.shift_date}
                                        onChange={handleChange} />

                                </div>



                                <div>
                                    <label htmlFor="schedulestart">
                                        Scheduled Start Time
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        id="schedulestart"
                                        className="w-full border rounded-md px-3 py-2"
                                        value={formData.schedulestart || ""}
                                        onChange={handleChange}
                                    />
                                </div>



                                <div>
                                    <label htmlFor="scheduleend">
                                        Scheduled End Time
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        id="scheduleend"
                                        className="w-full border rounded-md px-3 py-2"
                                        value={formData.scheduleend}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="customer_name">
                                        Customer
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="customer"
                                        className={`w-full border rounded-md `}
                                        value={formData.customer}

                                        onChange={(e) => handleCustomerChange(e.target.value)}
                                    >
                                        <option value="">Select a customer</option>
                                        {allcustomers?.map((customer) => (
                                            <option key={customer.id} value={customer.id}>
                                                {customer.customer_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="site">
                                        Site
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="site"
                                        className="w-full border rounded-md"
                                        value={formData.site}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, site: e.target.value }))} // Keep as string
                                    >
                                        <option value="">Select a Site</option>
                                        {site?.map((customer: any) => (
                                            <option key={customer.ID} value={customer.ID}>
                                                {customer.site_name}
                                            </option>
                                        ))}
                                    </select>

                                </div>

                                <div>
                                    <label htmlFor="service">
                                        Service
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="service"
                                        className={`w-full border rounded-md`}
                                        value={formData.service}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select a Service</option>
                                        {services?.map((customer) => (
                                            <option key={customer.ID} value={customer.ID}>
                                                {customer.Service_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="note">
                                        Note <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="note"
                                        className="w-full border rounded-md p-2 h-24"
                                        value={formData.note}
                                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                        placeholder="Enter a note..."
                                    />
                                </div>


                            </div>
                        </div>

                        <div className="p-3 h-auto flex w-full items-center overflow-hidden color-inherit subpixel-antialiased rounded-b-large" />
                    </div>

                    <span
                        aria-hidden="true"
                        className="w-px h-px block"
                        style={{ marginLeft: "0.25rem", marginTop: "0.25rem" }}
                    />
                    <div className="addMore mb-2 underline underline-offset-4 decoration-dotted decoration-blue-500 decoration-2 cursor-pointer" />

                    <button
                        className={`submit-btn ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                        type="submit"
                        disabled={
                            loading
                        }
                    >
                        {loading ? (
                            <>
                                <span className="animate-spin mr-2">⏳</span> Processing...
                            </>
                        ) : siteId ? "Update Shift" : "Add Shift"}
                    </button>


                </div>
            </div>
        </form>



    )
}
