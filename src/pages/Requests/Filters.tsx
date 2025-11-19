import React, { useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent, Button } from '@nextui-org/react';
import { Filter } from 'lucide-react';

export default function FilterComponent({ onSearch, filterValues }: any) {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const [localFilters, setLocalFilters] = useState({
        name: filterValues.name || "",
        status: filterValues.status || ""
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocalFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearch = () => {
        onSearch(localFilters);
        setIsPopoverOpen(false);
    };

    return (
        <Popover isOpen={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger>
                <button className="Filter-button gap-2">
                    <Filter className="w-[20px]" /> Filters
                </button>
            </PopoverTrigger>

            <PopoverContent className="items-stretch w-[500px]">
                <div className="px-4 py-3">
                    {/* Title */}
                    <div className="mb-3 text-xl flex gap-2">
                        Filters <Filter className="w-[20px]" />
                    </div>

                    {/* Name Input */}
                    <div className="input-field mb-3">
                        <label htmlFor="name" className="block text-gray-700">
                            Name
                        </label>
                        <input
                            name="name"
                            type="text"
                            value={localFilters.name}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-md"
                        />
                    </div>

                    {/* Status Select */}
                    <div className="input-field mb-3">
                        <label htmlFor="status" className="block font-medium text-gray-700">
                            Status
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={localFilters.status}
                            onChange={handleInputChange}
                            className="w-full mt-1 border border-gray-300 rounded-md"
                        >
                            <option value="">All</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2 mt-3">
                        <button className="reset-btn" onClick={() => setIsPopoverOpen(false)}>
                            Cancel
                        </button>
                        <button className="Search-btn" onClick={handleSearch}>
                            Search
                        </button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
