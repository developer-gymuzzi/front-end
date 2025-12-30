import { X } from "lucide-react";

export default function TopupDetailsModal({ isOpen, onClose, topup }: any) {
  if (!isOpen || !topup) return null;

  const statusColor =
    topup.status === "success"
      ? "bg-green-100 text-green-700"
      : topup.status === "failed"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[600px] max-w-full">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Top-up Details</h3>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-4 space-y-4">

          {/* STATUS */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Status</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
              {topup.status.toUpperCase()}
            </span>
          </div>

          {/* DETAILS GRID */}
          <div className="grid grid-cols-2 gap-4 text-sm">

            <div>
              <p className="text-gray-500">Transaction ID</p>
              <p className="font-medium break-all">{topup._id}</p>
            </div>

            <div>
              <p className="text-gray-500">Amount</p>
              <p className="font-medium">₹ {topup.amount}</p>
            </div>

            <div>
              <p className="text-gray-500">User</p>
              <p className="font-medium">
                {topup.to?.name || "---"}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Payment Method</p>
              <p className="font-medium uppercase">
                {topup.paymentMethod}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Razorpay Payment ID</p>
              <p className="font-medium break-all">
                {topup.razorpay_payment_id || "---"}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Razorpay Order ID</p>
              <p className="font-medium break-all">
                {topup.razorpay_order_id || "---"}
              </p>
            </div>

            <div className="col-span-2">
              <p className="text-gray-500">Description</p>
              <p className="font-medium">
                {topup.description || "---"}
              </p>
            </div>

            <div className="col-span-2">
              <p className="text-gray-500">Created At</p>
              <p className="font-medium">
                {new Date(topup.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end px-6 py-4 border-t">
          <button
            onClick={onClose}
            className="reset-btn"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
