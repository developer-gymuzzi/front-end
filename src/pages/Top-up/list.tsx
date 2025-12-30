import { useEffect, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import TopupFilter from "./filter";
import { Eye } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import TopupDetailsModal from "./TopupDetailsModal";

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

  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <div>
          <h2 className="CRM-Page-Title">Top-ups</h2>
          <p className="CRM-Page-Structure">
            Dashboard / <span className="CRM-Page-Name">Top-ups</span>
          </p>

          {Object.entries(appliedFilters).some(([_, v]) => v) && (
            <div className="flex flex-wrap gap-2 mt-3">
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
        <table className="data-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Transaction ID</th>
              <th>User</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-6">
                  Loading...
                </td>
              </tr>
            ) : topups.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-6">
                  No top-ups found
                </td>
              </tr>
            ) : (
              topups.map((t, index) => (
                <tr key={t._id}>
                  <td>{(currentPage - 1) * pageSize + index + 1}</td>
                  <td>{t._id}</td>
                  <td>{t.to?.name || "---"}</td>
                  <td>₹{t.amount}</td>
                  <td>{t.paymentMethod}</td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
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
                  <td>{new Date(t.createdAt).toLocaleString()}</td>
                  <td>
                    <button
                      className="p-2 text-blue-500 hover:bg-blue-100 rounded"
                      onClick={() => {
                        setSelectedTopup(t);
                        setIsModalOpen(true);
                      }}
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div className="pagination-container">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Prev
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
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
