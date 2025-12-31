import { useEffect, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import TopupFilter from "./filter";
import { Eye } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import TopupDetailsModal from "./TopupDetailsModal";

// ================= INTERFACES =================
interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Topup {
  _id: string;
  amount: number;
  paymentMethod: string;
  status: string;
  description: string;
  createdAt: string;
  from: User;
  to: User;
}

// ================= COMPONENT =================
export default function TopupList() {
  const [topups, setTopups] = useState<Topup[]>([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    transactionId: "",
    userId: "",
    paymentMethod: "",
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedTopup, setSelectedTopup] = useState<Topup | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ================= FETCH TOPUPS =================
  const fetchTopups = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("token");

      const res = await axios.get(
        `${import.meta.env.VITE_API_LIVEHOST}/v1/admin/list/topups`,
        {
          headers: { token },
          params: {
            page: currentPage,
            limit: pageSize,
            transactionId: appliedFilters.transactionId || undefined,
            to: appliedFilters.userId || undefined,
            paymentMethod: appliedFilters.paymentMethod || undefined,
          },
        }
      );

      if (res.data.success) {
        setTopups(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopups();
  }, [currentPage, pageSize, appliedFilters]);

  // ================= FILTER HANDLERS =================
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
    const cleared = { transactionId: "", userId: "", paymentMethod: "" };
    setFilters(cleared);
    setAppliedFilters(cleared);
    setCurrentPage(1);
  };

  // ================= UI =================
  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="grid gap-1">
          <h2 className="CRM-Page-Title">Top-ups</h2>
          <p className="CRM-Page-Structure">
            Dashboard / <span className="CRM-Page-Name">Top-ups</span>
          </p>

          {Object.entries(appliedFilters).some(([_, v]) => v) && (
            <div className="flex flex-wrap gap-3 items-center mt-3">
              {Object.entries(appliedFilters)
                .filter(([_, v]) => v)
                .map(([key, value]) => (
                  <button
                    key={key}
                    className="bg-yellow px-3 py-1 rounded flex gap-1"
                    onClick={() => removeFilter(key)}
                  >
                    {value} <RxCross2 />
                  </button>
                ))}

              <span
                className="cursor-pointer text-black"
                onClick={clearAllFilters}
              >
                Clear all filters
              </span>
            </div>
          )}
        </div>

        <TopupFilter onSearch={handleSearch} filterValues={filters} />
      </div>

      {/* TABLE */}
      <div className="inventory-table table-containers">
        <div className="rounded-lg table-wrapper">
          <div className="border-t-8 border-[#113354]"></div>

          <table className="data-table">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3">S.No</th>
                <th className="px-4 py-3">Transaction ID</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th
                  className="px-4 py-3 text-center"
                  style={{ width: "150px" }}
                >
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {loading
                ? [...Array(5)].map((_, idx) => (
                    <tr key={idx} className="border-b">
                      {[...Array(8)].map((__, i) => (
                        <td key={i} className="px-4 py-3">
                          <div className="h-5 bg-gray-300 rounded"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                : topups.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-6">
                        No top-ups found
                      </td>
                    </tr>
                  ) : (
                    topups.map((t, index) => (
                      <tr
                        key={t._id}
                        className="border-b hover:shadow-md"
                      >
                        <td className="px-4 py-3">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td className="px-4 py-3">{t._id}</td>
                        <td className="px-4 py-3">
                          {t.to?.name || "---"}
                        </td>
                        <td className="px-4 py-3">₹{t.amount}</td>
                        <td className="px-4 py-3">
                          {t.paymentMethod}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full font-semibold ${
                              t.status === "success"
                                ? "bg-green-100 text-green-700"
                                : t.status === "failed"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {new Date(t.createdAt).toLocaleString()}
                        </td>
                        <td
                          className="px-2 py-2"
                          style={{ width: "150px" }}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <button
                              className="p-2 rounded-md text-blue-500 hover:bg-blue-100"
                              onClick={() => {
                                setSelectedTopup(t);
                                setIsModalOpen(true);
                              }}
                            >
                              <Eye size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="pagination-container">
          <div className="pagination-controls">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="pagination-button"
            >
              ‹ Prev
            </button>

            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                disabled={idx + 1 === currentPage}
                className={`flex h-8 w-8 items-center justify-center rounded-md ${
                  idx + 1 === currentPage
                    ? "bg-yellow text-black"
                    : "hover:bg-gray-100 border border-gray-300"
                }`}
              >
                {idx + 1}
              </button>
            ))}

            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="pagination-button"
            >
              Next ›
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span>Items per page</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border p-1 rounded"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      <TopupDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        topup={selectedTopup}
      />
    </div>
  );
}
