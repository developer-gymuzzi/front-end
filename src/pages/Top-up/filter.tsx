import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/react";
import { Filter } from "lucide-react";
import { useState } from "react";

export default function TopupFilter({ onSearch, filterValues }: any) {
  const [localFilters, setLocalFilters] = useState(filterValues);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setLocalFilters((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <Popover>
      <PopoverTrigger>
        <button className="Filter-button gap-2">
          <Filter size={18} /> Filters
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-[420px]">
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-3">Filters</h3>

          <div className="mb-3">
            <label>Transaction ID</label>
            <input
              name="transactionId"
              value={localFilters.transactionId}
              onChange={handleChange}
              className="w-full border rounded"
            />
          </div>

          <div className="mb-3">
            <label>User ID</label>
            <input
              name="userId"
              value={localFilters.userId}
              onChange={handleChange}
              className="w-full border rounded"
            />
          </div>

          <div className="mb-3">
            <label>Payment Method</label>
            <select
              name="paymentMethod"
              value={localFilters.paymentMethod}
              onChange={handleChange}
              className="w-full border rounded"
            >
              <option value="">All</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="netbanking">Net Banking</option>
              <option value="wallet">Wallet</option>
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button
              className="reset-btn"
              onClick={() => onSearch({ transactionId: "", userId: "", paymentMethod: "" })}
            >
              Reset
            </button>
            <button className="Search-btn" onClick={() => onSearch(localFilters)}>
              Search
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
