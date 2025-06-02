// import { useEffect, useMemo, useState } from 'react';
// import { Button } from '@nextui-org/react';
// import { CheckCheck, ShieldOff, Eye } from 'lucide-react'
// import Filter from './filter';
// import axios from 'axios';
// import { useDispatch, useSelector } from 'react-redux'
// import Cookies from 'js-cookie';
// import { Input, Modal, Table, Tag, message } from 'antd';
// import { AppDispatch, IRootState } from '../../store';
// import Tableempty from '../Tableempty';
// import { RxCross2 } from 'react-icons/rx';
// export default function GaurdShift() {
//     const dispatch: AppDispatch = useDispatch()

//     interface Guard {
//         ShiftID: number
//         Company_Name: any,
//         Customer_Name: any,
//         Site_Name: any,
//         Service_Name: any,
//         shift_date: any,
//         Accept_status: any
//     }
//     const [filters, setFilters] = useState({

//         customer_Name: '',
//         site_name: '',
//         shift_date: '',
//         Service_name: '',
//         BETWEENshift_date: '',

//     });
//     const memoizedFilters = useMemo(() => filters, [filters]);
//     const endpoint = import.meta.env.VITE_API_LIVEHOST;
//     const apiKey = import.meta.env.VITE_API_X_HEADER_KEY;
//     const token = Cookies.get('token') || '';
//     const [currentPage, setCurrentPage] = useState(1);
//     const [pageSize, setPageSize] = useState(10);

//     const checkPermission = (module: string, action: string) => {
//         return permissions?.[module]?.includes(action);
//     };

//     const [rejectModal, setRejectModal] = useState<{ visible: boolean, id: number | null, note: string }>({ visible: false, id: null, note: "" });



//     const { loading } = useSelector((state: IRootState) => state.customerConfig) as { loading: boolean };

//     useEffect(() => {
//         dispatch(fetchGuardShift({ page: currentPage, pageSize, Accept_status: "Pending", filters: memoizedFilters }));
//     }, [currentPage, pageSize, dispatch, memoizedFilters]);


//     const handlePageChange = (page: number) => {
//         if (page !== currentPage) {
//             setCurrentPage(page);
//         }
//     };

//     const handleItemsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
//         const newPageSize = parseInt(event.target.value, 10);
//         setPageSize(newPageSize);
//         setCurrentPage(1);
//     };

//     const handleAction = async (ShiftID: number, ShiftStatus: string, Note = "") => {
//         try {
//             const payload: any = { ShiftID, ShiftStatus };

//             if (ShiftStatus === "Rejected") {
//                 payload.Note = Note;
//             }

//             await axios.post(`${endpoint}?route=Guard/Shift/Accpeted`, payload, {
//                 headers: {
//                     "x-api-key": apiKey,
//                     "Content-Type": "application/json",
//                     Authorization: `Bearer ${token}`,
//                 },
//             });

//             message.success(`Shift ${ShiftStatus.toLowerCase()} successfully!`);
        
//         } catch (error) {
//             message.error("Something went wrong");
//         }
//     };

//     const [isModalOpen, setIsModalOpen] = useState(false);
//     interface ShiftData {
//         Company_logo: string;
//         Company_Name: string;
//         shift_date: string;
//         schedule_start: string;
//         schedule_end: string;
//         created_by: string;
//         Customer_Name: string;
//         Site_Name: string;
//         Service_Name: string;
//         note: string;
//         Accept_status: string;
//         updated_by?: string;
//     }

//     const [shiftData, setShiftData] = useState<ShiftData | null>(null);

//     const handleViewDetails = (entry: any) => {
//         setShiftData(entry);
//         setIsModalOpen(true);
//     };

//     const removeFilter = (key: string) => {
//         setFilters((prev) => ({
//             ...prev,
//             [key]: '',
//         }));
//     };

//     return (
//         <>
//             {checkPermission("guardShifts", "show") &&
//                 <div>
//                     <div className="flex flex-wrap items-center justify-between gap-3 align-center">
//                         <div className="grid gap-1">
//                             <h1 className="text-2xl font-bold mb-6 text-gray-800">Gaurd Shifts</h1>
//                             <div className="flex flex-wrap gap-3 items-center mt-3">
//                                 {Object.entries(filters)
//                                     .filter(([key, value]) => value) // Only show non-empty filters
//                                     .map(([key, value]) => (
//                                         <Button key={key} className="yellow-color" onClick={() => removeFilter(key)}>
//                                             {value} <RxCross2 />
//                                         </Button>
//                                     ))}
//                                 {Object.values(filters).some(value => value) && (
//                                     <h5 className="text-yellow cursor-pointer" onClick={() => setFilters({
//                                         customer_Name: '',
//                                         site_name: '',
//                                         shift_date: '',
//                                         Service_name: '',
//                                         BETWEENshift_date: '',
//                                     })}>
//                                         Clear all filters
//                                     </h5>
//                                 )}
//                             </div>
//                         </div>

//                         <div className="flex flex-wrap items-center justify-end gap-3">

//                             <Filter onFilterChange={setFilters} />
//                         </div>

//                     </div>

//                     <div className='Managepeople-Div  grid gap-3 table-container'>
//                         <div className="inventory-table mt-4 ">
//                             <div className="rounded-lg ">

//                                 <div className="table-wrapper">
//                                     <div className="border-t-8 border-[#113354]"></div>
//                                     <table className="data-table">
//                                         <thead>
//                                             <tr className="">
//                                                 <th className="px-4 py-3 text-left font-medium text-gray-500 sortable-header">S.No</th>
//                                                 <th className="px-4 py-3 text-left font-medium text-gray-500 sortable-header">Company Name</th>
//                                                 <th className="px-4 py-3 text-left font-medium text-gray-500 sortable-header">Customer Name</th>
//                                                 <th className="px-4 py-3 text-left font-medium text-gray-500 sortable-header">Site Name</th>
//                                                 <th className="px-4 py-3 text-left font-medium text-gray-500 sortable-header">Service Name</th>
//                                                 <th className="px-4 py-3 text-left font-medium text-gray-500 sortable-header">Shift  Date</th>
//                                                 <th className="px-4 py-3 text-left font-medium text-gray-500 sortable-header">Status</th>
//                                                 <th className="px-4 py-3 text-left font-medium text-gray-500 sortable-header">Action</th>
//                                             </tr>
//                                         </thead>
//                                         <tbody>
//                                             {loading ? (
//                                                 [...Array(10)].map((_, index) => (
//                                                     <tr key={index} className="border-b last:border-b-0 ">
//                                                         <td className="px-4 py-3 ">
//                                                             <div className="w-10 h-5 bg-gray-300 rounded "></div>
//                                                         </td>

//                                                         <td className="px-4 py-3">
//                                                             <div className="w-28 h-5 bg-gray-300 rounded "></div>
//                                                         </td>
//                                                         <td className="px-4 py-3">
//                                                             <div className="w-24 h-5 bg-gray-300 rounded "></div>
//                                                         </td>
//                                                         <td className="px-4 py-3">
//                                                             <div className="w-32 h-5 bg-gray-300 rounded "></div>
//                                                         </td>
//                                                         <td className="px-4 py-3">
//                                                             <div className="w-28 h-5 bg-gray-300 rounded "></div>
//                                                         </td>
//                                                         <td className="px-4 py-3">
//                                                             <div className="w-20 h-5 bg-gray-300 rounded "></div>
//                                                         </td>
//                                                         <td className="px-4 py-3">
//                                                             <div className="w-20 h-6 bg-gray-300 rounded "></div>
//                                                         </td>
//                                                         <td className="px-4 py-3 flex space-x-2">
//                                                             <div className="w-6 h-6 bg-gray-300 rounded-full "></div>
//                                                             <div className="w-6 h-6 bg-gray-300 rounded-full "></div>
//                                                             <div className="w-6 h-6 bg-gray-300 rounded-full "></div>
//                                                         </td>
//                                                     </tr>
//                                                 ))
//                                             ) : guardShifts.length === 0 ? (
//                                                 <Tableempty length={8} />
//                                             ) : (
//                                                 guardShifts.map((entry, index) => (
//                                                     <tr key={index} className="border-b last:border-b-0 hover:shadow-md hover:font-semibold">
//                                                         <td className="px-4 py-3">
//                                                             {(pagination.currentPage - 1) * pagination.pageSize + index + 1}
//                                                         </td>

//                                                         <td className="px-4 py-3 text-gray-600">{entry.Company_Name || '---'}</td>
//                                                         <td className="px-4 py-3 text-gray-600">{entry.Customer_Name || '---'}</td>
//                                                         <td className="px-4 py-3 text-gray-600">{entry.Site_Name || '---'}</td>
//                                                         <td className="px-4 py-3 text-gray-600">{entry.Service_Name || '---'}</td>
//                                                         <td className="px-4 py-3 text-gray-600">{entry.shift_date || '---'}</td>

//                                                         <td className="px-4 py-3">
//                                                             <span
//                                                                 className={`px-3 py-1 text-sm font-semibold rounded-lg
//                             ${entry.Accept_status === "Pending" ? "bg-yellow-100 text-yellow-700" : ""}
//                             ${entry.Accept_status === "Accepted" ? "bg-green-100 text-green-700" : ""}
//                             ${entry.Accept_status === "Rejected" ? "bg-red-100 text-red-700" : ""}
//                         `}
//                                                             >
//                                                                 {entry.Accept_status || "---"}
//                                                             </span>
//                                                         </td>

//                                                         <td className="px-4 py-3 flex items-center space-x-2">
//                                                             <Eye className="text-blue-500 cursor-pointer" onClick={() => handleViewDetails(entry)} />

//                                                             <>
//                                                                 <CheckCheck className="text-green-500 cursor-pointer" onClick={() => handleAction(entry.ShiftID, "Accepted")} />
//                                                                 <ShieldOff className="text-red-500 cursor-pointer" onClick={() => setRejectModal({ visible: true, id: entry.ShiftID, note: "" })} />
//                                                             </>
//                                                         </td>
//                                                     </tr>
//                                                 ))
//                                             )}
//                                         </tbody>

//                                     </table>
//                                 </div>
//                             </div>


//                             <div className="pagination-container">
//                                 <div className="pagination-controls">
//                                     <button
//                                         className="pagination-button"
//                                         disabled={currentPage <= 1}
//                                         onClick={() => handlePageChange(currentPage - 1)}
//                                     >
//                                         ‹ Prev
//                                     </button>

//                                     {[...Array(pagination.totalPages)].map((_, index) => {
//                                         const page = index + 1;
//                                         return (
//                                             <button
//                                                 key={page}
//                                                 className={`flex h-8 w-8 items-center justify-center rounded-md text-sm 
//                                                 ${currentPage === page ? "bg-yellow text-white" : "hover:bg-gray-100"}`}
//                                                 onClick={() => handlePageChange(page)}
//                                             >
//                                                 {page}
//                                             </button>
//                                         );
//                                     })}
//                                     <button
//                                         className="pagination-button"
//                                         disabled={currentPage >= pagination.totalPages || pagination.totalPages === 0}
//                                         onClick={() => handlePageChange(currentPage + 1)}
//                                     >
//                                         Next ›
//                                     </button>
//                                 </div>
//                                 <div className="items-per-page">
//                                     <span className="text-sm text-gray-600">Items per page</span>
//                                     <select
//                                         className="items-select"
//                                         value={pagination.pageSize}
//                                         onChange={handleItemsPerPageChange}
//                                     >
//                                         <option value="10">10</option>
//                                         <option value="20">20</option>
//                                         <option value="50">50</option>
//                                     </select>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     <Modal
//                         title="Reject Shift"
//                         visible={rejectModal.visible}
//                         onCancel={() => setRejectModal({ visible: false, id: null, note: "" })}
//                         onOk={() => {
//                             if (!rejectModal.note.trim()) {
//                                 message.warning("Rejection note is required.");
//                                 return;
//                             }
//                             if (rejectModal.id !== null) {
//                                 handleAction(rejectModal.id, "Rejected", rejectModal.note);
//                             }
//                             setRejectModal({ visible: false, id: null, note: "" });
//                         }}
//                         okButtonProps={{ style: { backgroundColor: "#1890ff", borderColor: "#1890ff" } }}
//                     >
//                         <p>Please enter a reason for rejection:</p>
//                         <Input.TextArea
//                             rows={3}
//                             value={rejectModal.note}
//                             onChange={(e) =>
//                                 setRejectModal((prev) => ({ ...prev, note: e.target.value }))
//                             }
//                             placeholder="Enter rejection reason"
//                         />
//                     </Modal>
//                     <Modal
//                         title="Shift Details"
//                         open={isModalOpen}
//                         onCancel={() => setIsModalOpen(false)}
//                         footer={[
//                             <Button key="close" onClick={() => setIsModalOpen(false)}>
//                                 Close
//                             </Button>,
//                         ]}
//                     >
//                         {shiftData && (
//                             <>
//                                 <div className="flex flex-col items-center mb-4">
//                                     <img
//                                         src={shiftData.Company_logo}
//                                         alt="Company Logo"
//                                         className="w-20 h-20 rounded-lg shadow-md"
//                                     />
//                                     <h2 className="text-lg font-semibold mt-2">{shiftData.Company_Name}</h2>
//                                 </div>

//                                 <div className="grid grid-cols-2 gap-4">
//                                     <Input addonBefore="Shift Date" value={shiftData.shift_date} readOnly />
//                                     <Input addonBefore="Start Time" value={shiftData.schedule_start} readOnly />
//                                     <Input addonBefore="End Time" value={shiftData.schedule_end} readOnly />
//                                     <Input addonBefore="Created By" value={shiftData.created_by} readOnly />
//                                 </div>

//                                 <div className="mt-4 space-y-2">
//                                     <Input addonBefore="Customer" value={shiftData.Customer_Name} readOnly />
//                                     <Input addonBefore="Site" value={shiftData.Site_Name} readOnly />
//                                     <Input addonBefore="Service" value={shiftData.Service_Name} readOnly />
//                                 </div>

//                                 <div className="mt-4 space-y-2">
//                                     <Input addonBefore="Note" value={shiftData.note} readOnly />
//                                     <Input addonBefore="Status" value={shiftData.Accept_status} readOnly />
//                                     <Input addonBefore="Updated By" value={shiftData.updated_by || "N/A"} readOnly />
//                                 </div>
//                             </>
//                         )}
//                     </Modal>


//                 </div>
//             }
//         </>
//     );
// }