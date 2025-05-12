import React, { useEffect, useState } from 'react'
import { Popover, PopoverTrigger, PopoverContent, Button } from "@nextui-org/react";
import { Filter } from 'lucide-react';

export default function FilterComponent({ onSearch, filterValues }: any) {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);


    const [localFilters, setLocalFilters] = useState<{ name: string; email: string; role: string }>(filterValues);

    const handlePopoverChange = (open: boolean) => {
        setIsPopoverOpen(open);
    };



    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocalFilters((prev: { name: string; email: string; role: string }) => ({ ...prev, [name]: value }));
    };

    const handleSearch = () => {
        onSearch(localFilters);
        setIsPopoverOpen(false);
    };
    return (
        <Popover isOpen={isPopoverOpen} onOpenChange={handlePopoverChange}>
            <PopoverTrigger>
                <button className="Filter-button gap-2">
                    <Filter className='w-[20px]' /> Filters
                </button>
            </PopoverTrigger>

            <PopoverContent className="items-stretch w-[500px]">
                <div className="px-4 py-3">
                    {/* Filter Label */}
                    <div className="mb-3 text-xl flex gap-2">
                        Filters
                        <Filter className='w-[20px]' />
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

                    {/* Email Input */}
                    <div className="input-field mb-3">
                        <label htmlFor="email" className="block font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            name="email"
                            type="text"
                            value={localFilters.email}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-md"
                        />
                    </div>

                    {/* Role Select */}
                    <div className="input-field mb-3">
                        <label htmlFor="pan" className="block font-medium text-gray-700">
                            Pan Card
                        </label>

                        <input
                            name="pan"
                            type="text"
                            value={localFilters.email}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-md"
                        />
                     
                    </div>
                    <div className="input-field mb-3">
                        <label htmlFor="license" className="block font-medium text-gray-700">
                            License No.
                        </label>

                        <input
                            name="license"
                            type="text"
                            value={localFilters.email}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-md"
                        />
                     
                    </div>

                    <div className="input-field mb-3">
                        <label htmlFor="address" className="block font-medium text-gray-700">
                            Address
                        </label>

                        <input
                            name="address"
                            type="text"
                            value={localFilters.email}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-md"
                        />
                     
                    </div>

                    <div className="input-field mb-3">
                        <label htmlFor="phone" className="block font-medium text-gray-700">
                            Phone
                        </label>

                        <input
                            name="phone"
                            type="text"
                            value={localFilters.email}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-md"
                        />
                     
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex gap-2 mt-3">
                        <button className="reset-btn" onClick={() => setIsPopoverOpen(false)}>
                            Cancel
                        </button>
                        <button className="Search-btn" onClick={handleSearch}>
                            <span>Search</span>
                        </button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
