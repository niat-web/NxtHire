import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { FiCalendar, FiSearch, FiCheck, FiX, FiUsers, FiFilter } from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';
import { getInterviewers } from '@/api/admin.api';
import { useAlert } from '@/hooks/useAlert';
import StatusBadge from '@/components/common/StatusBadge';
import Badge from '../common/Badge';
import { INTERVIEWER_STATUS, DOMAINS } from '@/utils/constants';

// --- Reusable Filter Select Component ---
const FilterSelect = ({ options, value, onChange, placeholder, icon: Icon }) => (
    <div className="relative">
        <Icon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
        >
            <option value="">{placeholder}</option>
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);


// --- Skeleton for loading state ---
const InterviewerListSkeleton = () => (
    <div className="space-y-2">
        {[...Array(8)].map((_, i) => <div key={i} className="bg-gray-200 animate-pulse h-[52px] rounded-lg"></div>)}
    </div>
);

// --- Available Interviewer Item ---
const AvailableInterviewerListItem = React.memo(({ interviewer, isSelected, onSelect }) => (
    <motion.li
        layout
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
        transition={{ duration: 0.2 }}
        className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all duration-200 border-2 ${isSelected ? 'bg-blue-50 border-blue-400 shadow-sm' : 'border-transparent hover:bg-gray-100'}`}
        onClick={onSelect}
    >
        <div className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
            {isSelected && <FiCheck className="w-3 h-3 text-white" />}
        </div>
        <div className="grid grid-cols-12 gap-x-3 flex-grow items-center">
            <div className="col-span-5 min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate" title={interviewer.label}>{interviewer.label}</p>
                <p className="text-xs text-gray-500 truncate" title={interviewer.email}>{interviewer.email}</p>
            </div>
            <div className="col-span-3"><StatusBadge status={interviewer.status} /></div>
            <div className="col-span-4 flex flex-wrap gap-1">
                {interviewer.domains.map((domain, index) => <Badge key={index} variant="gray" size="sm">{domain}</Badge>)}
            </div>
        </div>
    </motion.li>
));

// --- Selected Interviewer Item ---
const SelectedInterviewerListItem = React.memo(({ interviewer, onDeselect }) => (
    <motion.li
        layout
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 shadow-sm"
    >
        <div>
            <p className="font-semibold text-gray-800 text-sm">{interviewer.label}</p>
            <p className="text-xs text-gray-500">{interviewer.email}</p>
        </div>
        <button type="button" onClick={() => onDeselect(interviewer.value)} className="p-1.5 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors">
            <FiX className="w-4 h-4" />
        </button>
    </motion.li>
));

// --- List of Available Interviewers (Right Panel) ---
const AvailableInterviewerList = ({ interviewers, loading, selected, onSelectionChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [domainFilter, setDomainFilter] = useState('');

    const statusOptions = Object.values(INTERVIEWER_STATUS).map(s => ({ value: s, label: s }));

    const filteredInterviewers = useMemo(() =>
        interviewers.filter(i => {
            const searchMatch = i.label.toLowerCase().includes(searchTerm.toLowerCase()) || i.email.toLowerCase().includes(searchTerm.toLowerCase());
            const statusMatch = !statusFilter || i.status === statusFilter;
            const domainMatch = !domainFilter || i.domains.includes(domainFilter);
            return searchMatch && statusMatch && domainMatch;
        }), [interviewers, searchTerm, statusFilter, domainFilter]
    );

    const activeCount = useMemo(() => filteredInterviewers.filter(i => i.status === 'Active').length, [filteredInterviewers]);

    const handleSelectActive = () => {
        onSelectionChange(filteredInterviewers.filter(i => i.status === 'Active').map(i => i.value));
    };

    const handleSelectAll = () => {
        onSelectionChange(selected.length === filteredInterviewers.length ? [] : filteredInterviewers.map(i => i.value));
    };

    return (
        <div className="flex flex-col h-full bg-white border border-gray-200/80 rounded-2xl shadow-sm p-4">
            {/* Header with Search and Filters */}
            <div className="flex-shrink-0 mb-3 space-y-3">
                <h4 className="text-md font-bold text-gray-800">Available Interviewers ({filteredInterviewers.length})</h4>
                <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <FilterSelect options={statusOptions} value={statusFilter} onChange={setStatusFilter} placeholder="All Statuses" icon={FiFilter} />
                    <FilterSelect options={DOMAINS} value={domainFilter} onChange={setDomainFilter} placeholder="All Domains" icon={FiFilter} />
                </div>
            </div>

            {/* Selection Actions */}
            <div className="flex items-center justify-between px-2 py-2 border-b border-t border-gray-200 flex-shrink-0">
                {/* --- MODIFICATION START: Group Select All and Clear Selection together --- */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center">
                        <input type="checkbox" id="select-all" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" checked={selected.length === filteredInterviewers.length && filteredInterviewers.length > 0} onChange={handleSelectAll} disabled={loading || filteredInterviewers.length === 0} />
                        <label htmlFor="select-all" className="ml-3 text-sm font-medium text-gray-700 cursor-pointer">Select All</label>
                    </div>
                    {selected.length > 0 && (
                        <button type="button" onClick={() => onSelectionChange([])} className="text-xs font-medium text-red-600 hover:text-red-800 transition-colors flex items-center gap-1">
                            <FiX size={14} /> Clear Selection
                        </button>
                    )}
                </div>
                {/* --- MODIFICATION END --- */}

                <button type="button" onClick={handleSelectActive} disabled={activeCount === 0 || loading} className="px-3 py-1 text-xs font-medium rounded-md border border-green-300 bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed">
                    Select Active ({activeCount})
                </button>
            </div>

            {/* List */}
            <div className="flex-grow overflow-y-auto pr-2 -mr-2 py-2">
                {loading ? <InterviewerListSkeleton /> : (
                    <ul className="space-y-1">
                        <AnimatePresence>
                            {filteredInterviewers.map(interviewer => (
                                <AvailableInterviewerListItem key={interviewer.value} interviewer={interviewer} isSelected={selected.includes(interviewer.value)}
                                    onSelect={() => {
                                        const newSelected = new Set(selected);
                                        if (newSelected.has(interviewer.value)) newSelected.delete(interviewer.value); else newSelected.add(interviewer.value);
                                        onSelectionChange(Array.from(newSelected));
                                    }} />
                            ))}
                        </AnimatePresence>
                        {filteredInterviewers.length === 0 && <div className="text-center text-sm text-gray-500 py-10">No interviewers found matching filters.</div>}
                    </ul>
                )}
            </div>
        </div>
    );
};

// --- Main Form Component ---
const BookingForm = ({ onSubmit, initialData = null }) => {
    const { showError } = useAlert();
    const { control, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm();

    const [interviewerOptions, setInterviewerOptions] = useState([]);
    const [loadingInterviewers, setLoadingInterviewers] = useState(true);
    const selectedInterviewerIds = watch('interviewerIds', []);

    useEffect(() => {
        setLoadingInterviewers(true);
        getInterviewers({ limit: 1000 })
            .then(res => {
                const options = (res.data.data.interviewers || []).map(i => ({
                    value: i._id, label: [i.user.firstName, i.user.lastName].filter(Boolean).join(' '), email: i.user.email, status: i.status, domains: i.domains || [],
                }));
                setInterviewerOptions(options);

                if (initialData) { reset({ bookingDate: new Date(initialData.bookingDate), interviewerIds: initialData.interviewers.map(i => i.interviewer._id) }); }
                else { reset({ bookingDate: null, interviewerIds: [] }); }
            })
            .catch(() => showError("Failed to load interviewers"))
            .finally(() => setLoadingInterviewers(false));
    }, [initialData, showError, reset]);

    const selectedInterviewers = useMemo(() => interviewerOptions.filter(opt => selectedInterviewerIds.includes(opt.value)), [interviewerOptions, selectedInterviewerIds]);

    const handleDeselect = (interviewerId) => {
        setValue('interviewerIds', selectedInterviewerIds.filter(id => id !== interviewerId), { shouldValidate: true, shouldDirty: true });
    };

    return (
        <form id="booking-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
            <div className="flex-grow grid md:grid-cols-2 gap-6 min-h-0">

                {/* Left Panel */}
                <div className="flex flex-col space-y-6 min-h-0">
                    <div className="flex-shrink-0 bg-white border border-gray-200/80 rounded-2xl shadow-sm p-4">
                        <label className="block text-md font-bold text-gray-800 mb-2">1. Select Interview Date</label>
                        <div className="relative"><FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                            <Controller name="bookingDate" control={control} rules={{ required: 'Please select a date' }}
                                render={({ field }) => (
                                    <DatePicker selected={field.value} onChange={field.onChange} minDate={new Date()} dateFormat="EEEE, MMMM d, yyyy" placeholderText="Select a date for interviews" className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" />
                                )} />
                        </div>
                        {errors.bookingDate && <p className="mt-1.5 text-sm text-red-600">{errors.bookingDate.message}</p>}
                    </div>
                    <div className="flex-grow flex flex-col bg-white border border-gray-200/80 rounded-2xl shadow-sm p-4 min-h-0">
                        <h4 className="text-md font-bold text-gray-800 flex-shrink-0 mb-3">Selected Interviewers ({selectedInterviewers.length})</h4>
                        <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                            {selectedInterviewers.length > 0 ? (
                                <ul className="space-y-2"><AnimatePresence>{selectedInterviewers.map(interviewer => <SelectedInterviewerListItem key={interviewer.value} interviewer={interviewer} onDeselect={handleDeselect} />)}</AnimatePresence></ul>
                            ) : (
                                <div className="text-center text-sm text-gray-500 h-full flex items-center justify-center flex-col"><FiUsers className="h-10 w-10 text-gray-300 mb-2" /><p>Select interviewers from the list on the right.</p></div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="flex flex-col min-h-0">
                    <div className="flex-grow min-h-0">
                        <Controller name="interviewerIds" control={control} rules={{ required: 'Please select at least one interviewer' }}
                            render={({ field }) => (
                                <AvailableInterviewerList interviewers={interviewerOptions} loading={loadingInterviewers} selected={field.value || []} onSelectionChange={field.onChange} />
                            )} />
                    </div>
                    {errors.interviewerIds && <p className="mt-1 text-sm text-red-600">{errors.interviewerIds.message}</p>}
                </div>
            </div>
        </form>
    );
};

export default BookingForm;
