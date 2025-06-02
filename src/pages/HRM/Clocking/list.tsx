// import { useEffect, useMemo, useState } from 'react';
// import { Drawer, DrawerContent, DrawerBody, DrawerFooter, Button, useDisclosure, Spinner } from '@nextui-org/react';

// import { CheckCheck, ShieldOff, Eye, Plus } from 'lucide-react';
// import axios from 'axios';
// import { useDispatch, useSelector } from 'react-redux'
// import Cookies from 'js-cookie';
// import { Input, Modal, Table, Tag, message } from 'antd';
// import { fetchGuardShift } from '../../../store/customerConfigSlice';
// import { AppDispatch, IRootState } from '../../../store';
// import Papa from 'papaparse';
// import saveAs from 'file-saver';
// import Filter from '../../guard/filter'
// import { RxCross2 } from 'react-icons/rx';



// export default function TimeTrackingTable() {
//     const dispatch: AppDispatch = useDispatch()

//     interface Guard {
//         ShiftID: number
//         Company_Name: any,
//         Customer_Name: any,
//         Site_Name: any,
//         Service_Name: any,
//         shift_date: any,
//         Accept_status: any,
//         Clock_in?: string,
//         Clock_out?: string
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

//     const permissions = useSelector((state: IRootState) => state.customerConfig.permissions) as Record<string, string[]>;

//     const checkPermission = (module: string, action: string) => {
//         return permissions?.[module]?.includes(action);
//     };

//     const { guardShifts, pagination } = useSelector((state: IRootState) => state.customerConfig) as {
//         guardShifts: Guard[];
//         pagination: { currentPage: number; pageSize: number; totalRecords: number; totalPages: number };
//     };

//     const { loading } = useSelector((state: IRootState) => state.customerConfig) as { loading: boolean };


//     useEffect(() => {
//         dispatch(fetchGuardShift({ page: pagination.currentPage, pageSize: pagination.pageSize, Accept_status: "Accepted", filters: memoizedFilters }));
//     }, [pagination.currentPage, pagination.pageSize, dispatch, filters, memoizedFilters]);


//     const handlePageChange = (page: number) => {
//         dispatch(fetchGuardShift({ page, pageSize: pagination.pageSize, Accept_status: "Accepted", filters: memoizedFilters }));
//     };


//     const handleItemsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
//         const newPageSize = parseInt(event.target.value, 10);
//         dispatch(fetchGuardShift({ page: 1, pageSize: newPageSize, Accept_status: "Accepted", filters }));
//     };


//     const handleClockInOut = async (shiftID: number) => {
//         try {
//             const shift = guardShifts.find(s => s.ShiftID === shiftID);
//             if (!shift) return;

//             const actionType = shift.Clock_in && !shift.Clock_out ? "CLOCKOUT" : "CLOCKIN";

//             const { data } = await axios.get(
//                 `${endpoint}?route=Update/Clock/In/Out&ID=${shiftID}&ty=${actionType}`,
//                 {
//                     headers: {
//                         "x-api-key": apiKey,
//                         "Content-Type": "application/json",
//                         Authorization: `Bearer ${token}`,
//                     },
//                 }
//             );

//             if (data.status === true) {
//                 message.success(`Clock ${actionType} Successful`);

//                 dispatch(fetchGuardShift({ page: pagination.currentPage, pageSize: pagination.pageSize, Accept_status: "Accepted", filters: memoizedFilters }));
//             }
//         } catch (error) {
//             message.error("Something went wrong");
//         }
//     };

//     const handleExport = () => {
//         if (guardShifts.length === 0) {
//             message.warning("No data available for export.");
//             return;
//         }

//         const csvData = [
//             ["S.No", "Company Name", "Customer Name", "Site Name", "Service Name", "Shift Date", "Status", "Clock In", "Clock Out"], // Headers
//             ...guardShifts.map((entry, index) => [
//                 index + 1,
//                 entry.Company_Name || "---",
//                 entry.Customer_Name || "---",
//                 entry.Site_Name || "---",
//                 entry.Service_Name || "---",
//                 entry.shift_date || "---",
//                 entry.Accept_status || "---",
//                 entry.Clock_in || "---",
//                 entry.Clock_out || "---"
//             ])
//         ];

//         const csv = Papa.unparse(csvData);

//         const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//         saveAs(blob, `GuardShifts_${new Date().toISOString()}.csv`);
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
//         Clock_in: string;
//         Clock_out: string;
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
//             {checkPermission("clockInOut", "show") &&
//                 <div>
//                     <div className="flex flex-wrap items-center justify-between gap-3 p-4">
//                         <div className="grid gap-1">
//                             <h2 className="CRM-Page-Title">CLOCK IN/OUT</h2>
//                             <p className="CRM-Page-Structure">
//                                 Dashboard / HRM / <span className="CRM-Page-Name">CLOCK IN/OUT</span>
//                             </p>
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
//                             {/* <button className="btn Insert-Button gap-3" onClick={handleExport}>
//                                 <svg
//                                     xmlns="http://www.w3.org/2000/svg"
//                                     width={21}
//                                     height={21}
//                                     viewBox="0 0 21 21"
//                                     fill="none"
//                                 >
//                                     <path
//                                         d="M16.4306 7.24536H13.2926V9.10731H16.4306C17.3638 9.10731 18.0878 9.58397 18.0878 9.99422V18.2507C18.0878 18.661 17.3638 19.1376 16.4306 19.1376H4.56938C3.63623 19.1376 2.91224 18.661 2.91224 18.2507V9.99453C2.91224 9.58428 3.63623 9.10762 4.56938 9.10762H7.70676V7.24567H4.56938C2.59602 7.24567 1.05029 8.45315 1.05029 9.99453V18.251C1.05029 19.7927 2.59602 20.9999 4.56938 20.9999H16.4309C18.404 20.9999 19.95 19.7924 19.95 18.251V9.99453C19.9497 8.45284 18.404 7.24536 16.4306 7.24536Z"
//                                         fill="white"
//                                     />
//                                     <path
//                                         d="M7.74476 4.64091C7.98309 4.64091 8.22111 4.54998 8.40296 4.36813L9.56854 3.20255V7.24547V9.10742V12.6743C9.56854 13.1885 9.98531 13.6053 10.4995 13.6053C11.0137 13.6053 11.4305 13.1885 11.4305 12.6743V9.10742V7.24547V3.13956L12.6591 4.36813C12.8409 4.54998 13.0792 4.64091 13.3173 4.64091C13.5553 4.64091 13.7936 4.54998 13.9755 4.36813C14.3392 4.00474 14.3392 3.41513 13.9755 3.05174L11.1959 0.272155C11.014 0.0903045 10.776 0 10.538 0C10.5355 0 10.5333 0 10.5309 0C10.5284 0 10.5262 0 10.5237 0C10.2857 0 10.0477 0.0903045 9.86583 0.272155L7.08625 3.05174C6.72255 3.41513 6.72255 4.00474 7.08625 4.36813C7.26841 4.54998 7.50643 4.64091 7.74476 4.64091Z"
//                                         fill="white"
//                                     />
//                                 </svg>
//                                 <span>Export</span>
//                             </button> */}

//                         </div>
//                     </div>

//                     <div className='Managepeople-Div  grid gap-3'>

//                         <div className="inventory-table mt-4 ">
//                             <div className="table-wrapper">
//                                 <div className="border-t-8 border-[#113354]"></div>
//                                 <table className="table-data">
//                                     <thead>
//                                         <tr className="border-b bg-gray-50">
//                                             <th className="px-4 py-3 text-left font-medium text-gray-500">S.No</th>
//                                             <th className="px-4 py-3 text-left font-medium text-gray-500">Company Name</th>
//                                             <th className="px-4 py-3 text-left font-medium text-gray-500">Customer Name</th>
//                                             <th className="px-4 py-3 text-left font-medium text-gray-500">Site Name</th>
//                                             <th className="px-4 py-3 text-left font-medium text-gray-500">Service Name</th>
//                                             <th className="px-4 py-3 text-left font-medium text-gray-500">Shift  Date</th>
//                                             <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
//                                             <th className="px-4 py-3 text-left font-medium text-gray-500">Action</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {loading ? (
//                                             [...Array(10)].map((_, index) => (
//                                                 <tr key={index} className="border-b last:border-b-0">
//                                                     <td className="px-4 py-3">
//                                                         <div className="w-12 h-5 bg-gray-300  rounded"></div>
//                                                     </td>
//                                                     <td className="px-4 py-3">
//                                                         <div className="w-24 h-5 bg-gray-300  rounded"></div>
//                                                     </td>
//                                                     <td className="px-4 py-3">
//                                                         <div className="w-16 h-5 bg-gray-300  rounded"></div>
//                                                     </td>
//                                                     <td className="px-4 py-3">
//                                                         <div className="w-20 h-5 bg-gray-300  rounded"></div>
//                                                     </td>
//                                                     <td className="px-4 py-3">
//                                                         <div className="w-20 h-5 bg-gray-300  rounded"></div>
//                                                     </td>
//                                                     <td className="px-4 py-3">
//                                                         <div className="w-24 h-5 bg-gray-300  rounded"></div>
//                                                     </td>
//                                                     <td className="px-4 py-3">
//                                                         <div className="w-16 h-5 bg-gray-300  rounded"></div>
//                                                     </td>
//                                                     <td className="px-4 py-3 flex gap-2">
//                                                         <div className="w-10 h-5 bg-gray-300  rounded"></div>
//                                                         <div className="w-10 h-5 bg-gray-300  rounded"></div>
//                                                     </td>
//                                                 </tr>
//                                             ))
//                                         ) : (
//                                             guardShifts.map((entry, index) => (
//                                                 <tr key={index} className="border-b last:border-b-0 hover:shadow-md hover:font-semibold">
//                                                     <td className="px-4 py-3">
//                                                         {(pagination.currentPage - 1) * pagination.pageSize + index + 1}
//                                                     </td>
//                                                     <td className="px-4 py-3 text-gray-600">{entry.Company_Name || '---'}</td>
//                                                     <td className="px-4 py-3 text-gray-600">{entry.Customer_Name || '---'}</td>
//                                                     <td className="px-4 py-3 text-gray-600">{entry.Site_Name || '---'}</td>
//                                                     <td className="px-4 py-3 text-gray-600">{entry.Service_Name || '---'}</td>
//                                                     <td className="px-4 py-3 text-gray-600">{entry.shift_date || '---'}</td>
//                                                     <td className="px-4 py-3">
//                                                         <span
//                                                             className={`px-3 py-1 text-sm font-semibold rounded-lg
//                             ${entry.Accept_status === "Accepted" ? "bg-yellow-100 text-yellow-700" : ""}
//                             ${entry.Accept_status === "Accepted" ? "bg-green-100 text-green-700" : ""}
//                             ${entry.Accept_status === "Rejected" ? "bg-red-100 text-red-700" : ""}
//                         `}
//                                                         >
//                                                             {entry.Accept_status || "---"}
//                                                         </span>
//                                                     </td>
//                                                     <td className="px-4 py-3 flex items-center space-x-2">
//                                                         <Eye className="text-blue-500 cursor-pointer " onClick={() => handleViewDetails(entry)} />
//                                                         {!entry.Clock_out && (
//                                                             <Button
//                                                                 className={`px-3 py-1 rounded-md text-white ${entry.Clock_in ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"}`}
//                                                                 onClick={() => handleClockInOut(entry.ShiftID)}
//                                                             >
//                                                                 {entry.Clock_in ? "Clock Out" : "Clock In"}
//                                                             </Button>
//                                                         )}
//                                                     </td>
//                                                 </tr>
//                                             ))
//                                         )}
//                                     </tbody>

//                                 </table>
//                             </div>


//                             <div className="mt-4 flex items-center justify-between px-1">
//                                 <div></div>

//                                 <div className="flex items-center gap-1">
//                                     {/* Previous Button */}
//                                     <button
//                                         className="flex h-8 items-center justify-center rounded-md px-3 text-sm disabled:opacity-50"
//                                         disabled={pagination.currentPage === 1}
//                                         onClick={() => handlePageChange(pagination.currentPage - 1)}
//                                     >
//                                         ‹ Prev
//                                     </button>

//                                     {/* Page Numbers */}
//                                     {[...Array(pagination.totalPages)].map((_, index) => {
//                                         const page = index + 1;
//                                         return (
//                                             <button
//                                                 key={page}
//                                                 className={`flex h-8 w-8 items-center justify-center rounded-md text-sm ${pagination.currentPage === page ? "bg-yellow text-white" : "hover:bg-gray-100"
//                                                     }`}
//                                                 onClick={() => handlePageChange(page)}
//                                             >
//                                                 {page}
//                                             </button>
//                                         );
//                                     })}

//                                     {/* Next Button */}
//                                     <button
//                                         className="flex h-8 items-center justify-center rounded-md px-3 text-sm"
//                                         disabled={pagination.currentPage === pagination.totalPages}
//                                         onClick={() => handlePageChange(pagination.currentPage + 1)}
//                                     >
//                                         Next ›
//                                     </button>
//                                 </div>

//                                 {/* Items Per Page Selector */}
//                                 <div className="flex items-center gap-2">
//                                     <span className="text-sm text-gray-600">Items per page</span>
//                                     <select
//                                         className="h-8 rounded-md border border-gray-300 bg-white p-1 text-sm text-gray-600"
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
//                                 {/* Company Info */}
//                                 <div className="flex flex-col items-center mb-4">
//                                     {shiftData.Company_logo ? (
//                                         <img
//                                             src={shiftData.Company_logo || "/placeholder.svg"}
//                                             alt={`${shiftData.Company_Name} logo`}
//                                             className="w-24 h-24 rounded-full object-cover border"
//                                         />
//                                     ) : (
//                                         <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border">
//                                             <span className="text-gray-400 text-xl font-medium">{shiftData.Company_Name.substring(0, 2).toUpperCase()}</span>
//                                         </div>
//                                     )}

//                                     <h2 className="text-lg font-semibold mt-2">{shiftData.Company_Name}</h2>
//                                 </div>

//                                 {/* Shift Information in Input Fields */}
//                                 <div className="grid grid-cols-2 gap-4">
//                                     <Input addonBefore="Shift Date" value={shiftData.shift_date} readOnly />
//                                     <Input addonBefore="Start Time" value={shiftData.schedule_start} readOnly />
//                                     <Input addonBefore="End Time" value={shiftData.schedule_end} readOnly />
//                                     <Input addonBefore="Created By" value={shiftData.created_by} readOnly />
//                                 </div>

//                                 {/* Customer, Site, and Service Info */}
//                                 <div className="mt-4 space-y-2">
//                                     <Input addonBefore="Customer" value={shiftData.Customer_Name} readOnly />
//                                     <Input addonBefore="Site" value={shiftData.Site_Name} readOnly />
//                                     <Input addonBefore="Service" value={shiftData.Service_Name} readOnly />
//                                 </div>

//                                 {/* Additional Details */}
//                                 <div className="mt-4 space-y-2">
//                                     <Input addonBefore="Note" value={shiftData.note} readOnly />
//                                     <Input addonBefore="Clock IN" value={shiftData.Clock_in} readOnly />
//                                     <Input addonBefore="Clock OUT" value={shiftData.Clock_out} readOnly />
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