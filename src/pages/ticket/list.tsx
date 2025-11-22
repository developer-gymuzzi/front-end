// ✨ FULL UPDATED CODE WITH PERFECT SKELETON & NO BUTTON LOADERS ✨

import { useEffect, useState } from "react";
import { Button } from "@nextui-org/react";
import { RxCross2 } from "react-icons/rx";
import Filter from "./filter";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, IRootState } from "../../store";
import axios from "axios";
import Cookies from "js-cookie";
import { message } from "antd";
import { MessageCircleMore } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CompanyList() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [closingTicketId, setClosingTicketId] = useState<string | null>(null);
  const [openingTicketId, setOpeningTicketId] = useState<string | null>(null);

  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const loading = useSelector((state: IRootState) => state.customerConfig.loading);

  const endpoint = import.meta.env.VITE_API_LIVEHOST;
  const token = Cookies.get("token");

  const [filters, setFilters] = useState({ name: "", email: "", role: "" });
  const [appliedFilters, setAppliedFilters] = useState({
    name: "",
    email: "",
    role: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // ---------------- FETCH TICKETS ----------------
  const fetchTickets = async (page: number, limit: number, filterValues: any) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", String(limit));
      if (filterValues.name) params.append("name", filterValues.name);
      if (filterValues.email) params.append("email", filterValues.email);
      if (filterValues.role) params.append("role", filterValues.role);

      const { data } = await axios.get(
        `${endpoint}/v1/admin/list/ticketlisting?${params.toString()}`,
        { headers: { token } }
      );

      if (data.success) {
        setTickets(data.data);
        setTotalPages(data.totalPages);
      } else {
        message.error("Failed to load tickets");
      }
    } catch {
      message.error("Something went wrong while fetching tickets");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(currentPage, pageSize, appliedFilters);
  }, [currentPage, pageSize, appliedFilters]);

  // ---------------- OPEN TICKET ----------------
  const handleClick = async (id: string) => {
    setOpeningTicketId(id);
    try {
      await axios.patch(
        `${endpoint}/v1/admin/approve/openTicket/${id}`,
        {},
        { headers: { token } }
      );
      await fetchTickets(currentPage, pageSize, appliedFilters);
      navigate(`/adminmessages/${id}`);
    } catch {
      message.error("Failed to open ticket");
    } finally {
      setOpeningTicketId(null);
    }
  };

  // ---------------- CLOSE TICKET ----------------
  const handleCloseTicket = async (id: string) => {
    setClosingTicketId(id);
    try {
      await axios.patch(
        `${endpoint}/v1/admin/approve/closeTicket/${id}`,
        {},
        { headers: { token } }
      );

      message.success("Ticket closed successfully");
      await fetchTickets(currentPage, pageSize, appliedFilters);
    } catch {
      message.error("Failed to close ticket");
    } finally {
      setClosingTicketId(null);
    }
  };

  // ---------------- FILTERS ----------------
  const handleSearch = (newFilters: any) => {
    setFilters(newFilters);
    setAppliedFilters(newFilters);
    setCurrentPage(1);
  };

  const removeFilter = (key: string) => {
    const updated = { ...appliedFilters, [key]: "" };
    setFilters(updated);
    setAppliedFilters(updated);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    const cleared = { name: "", email: "", role: "" };
    setFilters(cleared);
    setAppliedFilters(cleared);
    setCurrentPage(1);
  };

  const formatRoleLabel = (val: string) => {
    if (val === "gym_owner") return "Gym Owner";
    if (val === "admin") return "Admin";
    if (val === "user") return "User";
    return val.charAt(0).toUpperCase() + val.slice(1);
  };

  // ---------------- NEW CLEAN PERFECT SKELETON ROW ----------------
  const SkeletonRow = () => (
    <tr className="border-b animate-pulse">
      <td className="py-4"><div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
      <td className="py-4"><div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
      <td className="py-4"><div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
      <td className="py-4"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
      <td className="py-4"><div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
      <td className="py-4"><div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div></td>
      <td className="py-4">
        <div className="flex gap-3">
          <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </td>
    </tr>
  );

  // ---------------- UI ----------------
  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="grid gap-1">
          <h2 className="CRM-Page-Title">Tickets</h2>
          <p className="CRM-Page-Structure">
            Dashboard / <span className="CRM-Page-Name">Ticket</span>
          </p>

          {Object.values(appliedFilters).some((val) => val) && (
            <div className="flex flex-wrap gap-3 items-center mt-3">
              {Object.entries(appliedFilters)
                .filter(([_, val]) => val)
                .map(([key, value]) => (
                  <Button key={key} className="yellow-color" onClick={() => removeFilter(key)}>
                    {formatRoleLabel(value)} <RxCross2 />
                  </Button>
                ))}
              <h5 className="text-yellow cursor-pointer" onClick={clearAllFilters}>
                Clear all filters
              </h5>
            </div>
          )}
        </div>

        <Filter
          onSearch={handleSearch}
          filterValues={filters}
          key={JSON.stringify(filters)}
        />
      </div>

      {/* TABLE */}
      <div className="inventory-table table-containers">
        <div className="rounded-lg table-wrapper">
          <div className="border-t-8 border-[#113354]"></div>

          <table className="data-table">
            <thead>
              <tr className="border-b bg-gray-50 dark:bg-gray-800">
                <th>S.No</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading
                ? Array.from({ length: pageSize }).map((_, index) => (
                    <SkeletonRow key={index} />
                  ))
                : tickets.length === 0
                ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      No tickets found
                    </td>
                  </tr>
                )
                : tickets.map((entry: any, index: number) => {
                    const rowIndex = (currentPage - 1) * pageSize + (index + 1);

                    return (
                      <tr
                        key={entry._id}
                        className="border-b hover:bg-gray-50 dark:hover:bg-gray-900 transition"
                      >
                        <td>{rowIndex}</td>
                        <td>{entry.user?.name || "---"}</td>
                        <td>{entry.user?.email || "---"}</td>
                        <td>{formatRoleLabel(entry.user?.role || "---")}</td>
                        <td>{entry.subject || "---"}</td>

                        <td>
                          <span
                            className={`px-2 py-1 text-xs rounded-full font-semibold ${
                              entry.status === "open"
                                ? "bg-green-100 text-green-800"
                                : entry.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {entry.status.charAt(0).toUpperCase() +
                              entry.status.slice(1)}
                          </span>
                        </td>

                        {/* ACTION BUTTONS */}
                        <td className="flex items-center gap-3">
                          <button
                            onClick={() => handleClick(entry._id)}
                            disabled={openingTicketId === entry._id}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
                          >
                            <MessageCircleMore className="w-4 h-4" />
                            Chat
                          </button>

                          {entry.status !== "closed" && (
                            <button
                              onClick={() => handleCloseTicket(entry._id)}
                              disabled={closingTicketId === entry._id}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                              Close
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
