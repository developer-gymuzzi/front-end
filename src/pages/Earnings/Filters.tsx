import React, { useState, useEffect } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@nextui-org/react';
import { Filter, X } from 'lucide-react';

interface FilterProps {
    onApplyFilters: (filters: any) => void;
    activeFilters: any;
    onRemoveFilter: (key: string) => void;
}

export default function FilterComponent({
    onApplyFilters,
    activeFilters,
    onRemoveFilter,
}: FilterProps) {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    // FILTER STATES
    const [gymName, setGymName] = useState('');
    const [ownerName, setOwnerName] = useState(''); // Gym owner
    const [userName, setUserName] = useState(''); // Payer
    const [transactionId, setTransactionId] = useState('');

    const [dateType, setDateType] = useState<
        'none' | 'today' | 'yesterday' | 'single' | 'range'
    >('none');

    const [singleDate, setSingleDate] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Load values when popover opens
    useEffect(() => {
        if (!activeFilters) return;

        setGymName(activeFilters.gym || '');
        setOwnerName(activeFilters.owner || '');
        setUserName(activeFilters.user || '');
        setTransactionId(activeFilters.transactionId || '');

        setDateType(activeFilters.dateType || 'none');
        setSingleDate(activeFilters.date || '');
        setStartDate(activeFilters.startDate || '');
        setEndDate(activeFilters.endDate || '');
    }, [activeFilters, isPopoverOpen]);

    // APPLY FILTERS
    const handleSearch = () => {
        const filters: any = {
            gym: gymName.trim(),
            owner: ownerName.trim(),
            user: userName.trim(),
            transactionId: transactionId.trim(),
        };

        // DATE LOGIC
        if (dateType !== 'none') filters.dateType = dateType;

        if (dateType === 'single') filters.date = singleDate;
        if (dateType === 'range') {
            filters.startDate = startDate;
            filters.endDate = endDate;
        }

        onApplyFilters(filters);
        setIsPopoverOpen(false);
    };

    // RESET ALL FILTERS
    const handleReset = () => {
        setGymName('');
        setOwnerName('');
        setUserName('');
        setTransactionId('');
        setDateType('none');
        setSingleDate('');
        setStartDate('');
        setEndDate('');

        onApplyFilters({});
        setIsPopoverOpen(false);
    };

    return (
        <div>
            <Popover isOpen={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger>
                    <button className="Filter-button flex gap-2">
                        <Filter className="w-[20px]" /> Filters
                    </button>
                </PopoverTrigger>

                <PopoverContent className="items-stretch w-[500px] z-[9999]">
                    <div className="px-4 py-3">
                        <div className="mb-3 text-xl flex gap-2">
                            Filters <Filter className="w-[20px]" />
                        </div>

                        {/* GYM */}
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

                        {/* OWNER */}
                        <div className="input-field mb-3">
                            <label className="block text-gray-700">Gym Owner Name</label>
                            <input
                                type="text"
                                value={ownerName}
                                onChange={(e) => setOwnerName(e.target.value)}
                                placeholder="Enter gym owner name..."
                                className="w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>

                        {/* USER */}
                        <div className="input-field mb-3">
                            <label className="block text-gray-700">User Name (Paid By)</label>
                            <input
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="Enter user name..."
                                className="w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>

                        {/* TRANSACTION ID */}
                        <div className="input-field mb-3">
                            <label className="block text-gray-700">Transaction ID</label>
                            <input
                                type="text"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                placeholder="Enter transaction ID..."
                                className="w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>

                        {/* DATE TYPE */}
                        <div className="mb-3">
                            <label className="block text-gray-700 mb-1">Date Filter</label>

                            <select
                                className="w-full border p-2 rounded-md"
                                value={dateType}
                                onChange={(e) =>
                                    setDateType(e.target.value as any)
                                }
                            >
                                <option value="none">None</option>
                                <option value="today">Today</option>
                                <option value="yesterday">Yesterday</option>
                                <option value="single">Single Date</option>
                                <option value="range">Date Range</option>
                            </select>
                        </div>

                        {/* SINGLE DATE */}
                        {dateType === 'single' && (
                            <div className="mb-3">
                                <label className="block text-gray-700">
                                    Select Date
                                </label>
                                <input
                                    type="date"
                                    className="w-full border p-2 rounded-md"
                                    value={singleDate}
                                    onChange={(e) =>
                                        setSingleDate(e.target.value)
                                    }
                                />
                            </div>
                        )}

                        {/* DATE RANGE */}
                        {dateType === 'range' && (
                            <div className="flex gap-2 mb-3">
                                <div className="w-1/2">
                                    <label className="block text-gray-700">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full border p-2 rounded-md"
                                        value={startDate}
                                        onChange={(e) =>
                                            setStartDate(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="w-1/2">
                                    <label className="block text-gray-700">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full border p-2 rounded-md"
                                        value={endDate}
                                        onChange={(e) =>
                                            setEndDate(e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        )}

                        {/* BUTTONS */}
                        <div className="flex gap-2 mt-3">
                            <button className="reset-btn" onClick={handleReset}>
                                Cancel
                            </button>
                            <button className="Search-btn" onClick={handleSearch}>
                                Search
                            </button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
