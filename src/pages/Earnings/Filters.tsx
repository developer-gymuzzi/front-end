import React, { useEffect, useState } from 'react'
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/react";
import { Filter } from 'lucide-react';

export default function FilterComponent({ onSearch }: any) {

    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const [gymName, setGymName] = useState("");

    const handlePopoverChange = (open: boolean) => {
        setIsPopoverOpen(open);
    };

    const handleSearch = () => {
        onSearch(gymName); 
        setIsPopoverOpen(false);
    };

    return (
        <Popover isOpen={isPopoverOpen} onOpenChange={handlePopoverChange} >
            <PopoverTrigger>
                <button className="Filter-button gap-2">
                    <Filter className='w-[20px]' /> Filters
                </button>
            </PopoverTrigger>

            <PopoverContent className="items-stretch w-[500px] z-[9999]">
                <div className="px-4 py-3">

                    <div className="mb-3 text-xl flex gap-2">
                        Filters
                        <Filter className='w-[20px]' />
                    </div>

                    <div className="input-field mb-3">
                        <label className="block text-gray-700">Gym Name</label>
                        <input
                            type="text"
                            value={gymName}
                            onChange={(e) => setGymName(e.target.value)}
                            placeholder="Enter gym name..."
                            className="w-full border border-gray-300 rounded-md p-2"
                        />
                    </div>

                    <div className="flex gap-2 mt-3">
                        <button
                            className="reset-btn"
                            onClick={() => {
                                setGymName("");
                                onSearch("");  // Reset filter
                                setIsPopoverOpen(false);
                            }}
                        >
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
