// C:/Users/NxtWave/Desktop/Testing/Interviewer community/interviewer-hiring-system/interviewer-hiring-system/client/src/components/admin/BookingFormModal.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { FiCalendar, FiUsers, FiSearch, FiX, FiCheckCircle, FiCheck, FiSave } from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';

import { getInterviewers, createInterviewBooking, updateInterviewBooking } from '@/api/admin.api';
import { useAlert } from '@/hooks/useAlert';

import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button'; // Corrected: Added the missing Button import
import StatusBadge from '@/components/common/StatusBadge';

// --- Sub-components for a cleaner structure ---

// Skeleton loader for the interviewer list
const InterviewerListSkeleton = () => (
    <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-gray-100 animate-pulse">
                <div className="w-5 h-5 bg-gray-300 rounded"></div>
                <div className="flex-grow space-y-2">
                    <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        ))}
    </div>
);

// Renders a single interviewer in the list
const InterviewerListItem = React.memo(({ interviewer, isSelected, onSelect }) => (
    <motion.li
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors duration-200 ${
            isSelected ? 'bg-blue-100 ring-2 ring-blue-300' : 'hover:bg-gray-100'
        }`}
        onClick={onSelect}
    >
        <div className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
            isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'
        }`}>
            {isSelected && <FiCheck className="w-3 h-3 text-white" />}
        </div>
        <div className="flex-grow">
            <p className="font-semibold text-gray-800 text-sm">{interviewer.label}</p>
            <div className="flex items-center gap-2">
                <StatusBadge status={interviewer.status} />
                <span className="text-xs text-gray-500">{interviewer.primaryDomain}</span>
            </div>
        </div>
    </motion.li>
));

// Manages the list of available interviewers
const InterviewerList = ({ interviewers, loading, selected, onSelectionChange }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredInterviewers = useMemo(() =>
        interviewers.filter(i =>
            i.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            i.primaryDomain.toLowerCase().includes(searchTerm.toLowerCase())
        ), [interviewers, searchTerm]
    );

    const handleSelect = (interviewerValue) => {
        const newSelected = new Set(selected);
        if (newSelected.has(interviewerValue)) {
            newSelected.delete(interviewerValue);
        } else {
            newSelected.add(interviewerValue);
        }
        onSelectionChange(Array.from(newSelected));
    };

    return (
        <div className="flex flex-col h-full">
            <div className="relative mb-3 flex-shrink-0">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by name or domain..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                />
            </div>
            <div className="flex-grow overflow-y-auto pr-2">
                {loading ? <InterviewerListSkeleton /> : (
                    <ul className="space-y-1">
                        <AnimatePresence>
                            {filteredInterviewers.map(interviewer => (
                                <InterviewerListItem
                                    key={interviewer.value}
                                    interviewer={interviewer}
                                    isSelected={selected.includes(interviewer.value)}
                                    onSelect={() => handleSelect(interviewer.value)}
                                />
                            ))}
                        </AnimatePresence>
                    </ul>
                )}
            </div>
        </div>
    );
};

const BookingFormModal = ({ isOpen, onClose, onSuccess, bookingData = null }) => {
    const isEditMode = !!bookingData;
    const { showSuccess, showError } = useAlert();
    const { control, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = useForm();
    
    const [interviewerOptions, setInterviewerOptions] = useState([]);
    const [loadingInterviewers, setLoadingInterviewers] = useState(true);

    const selectedInterviewerIds = watch('interviewerIds', []);
    const bookingDate = watch('bookingDate');
    const canSubmit = !!bookingDate && selectedInterviewerIds?.length > 0 && !isSubmitting;

    useEffect(() => {
        if (isOpen) {
            setLoadingInterviewers(true);
            getInterviewers({ limit: 1000, status: 'Active,On Probation' })
                .then(res => {
                    const options = (res.data.data.interviewers || []).map(i => ({
                        value: i._id,
                        label: [i.user.firstName, i.user.lastName].filter(Boolean).join(' '),
                        status: i.status,
                        primaryDomain: i.primaryDomain || 'N/A'
                    }));
                    setInterviewerOptions(options);

                    if (isEditMode && bookingData) {
                        reset({
                            bookingDate: new Date(bookingData.bookingDate),
                            interviewerIds: bookingData.interviewers.map(i => i.interviewer._id)
                        });
                    } else {
                        reset({ bookingDate: null, interviewerIds: [] });
                    }
                })
                .catch(() => showError("Failed to load interviewers"))
                .finally(() => setLoadingInterviewers(false));
        }
    }, [isOpen, isEditMode, bookingData, showError, reset]);
    
    const onSubmit = async (data) => {
        const localDate = new Date(data.bookingDate);
        const utcDate = new Date(Date.UTC(localDate.getFullYear(), localDate.getMonth(), localDate.getDate()));

        const payload = {
            bookingDate: utcDate,
            interviewerIds: data.interviewerIds
        };
        try {
            if (isEditMode) {
                await updateInterviewBooking(bookingData._id, payload);
                showSuccess("Booking request updated successfully.");
            } else {
                await createInterviewBooking(payload);
                showSuccess("Booking request created successfully.");
            }
            onSuccess();
        } catch (err) {
            showError(`Failed to ${isEditMode ? 'update' : 'create'} booking request.`);
        }
    };
    
    const selectedInterviewers = useMemo(() =>
        interviewerOptions.filter(opt => selectedInterviewerIds.includes(opt.value)),
        [interviewerOptions, selectedInterviewerIds]
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditMode ? 'Edit Interview Booking' : 'New Interview Booking'}
            size="4xl"
        >
            <form id="booking-form" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-[500px]">

                    {/* Left Column: Controls & Summary */}
                    <div className="md:col-span-5 flex flex-col">
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Interview Date *
                            </label>
                            <div className="relative">
                                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Controller
                                    name="bookingDate"
                                    control={control}
                                    rules={{ required: 'Please select a date' }}
                                    render={({ field }) => (
                                        <DatePicker
                                            selected={field.value}
                                            onChange={(date) => field.onChange(date)}
                                            minDate={new Date()}
                                            dateFormat="EEEE, MMMM d, yyyy"
                                            placeholderText="Select a date for interviews"
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    )}
                                />
                            </div>
                            {errors.bookingDate && <p className="mt-1 text-sm text-red-600">{errors.bookingDate.message}</p>}
                        </div>

                        <div className="flex-grow flex flex-col border border-gray-200 rounded-lg bg-gray-50/50">
                            <div className="p-3 border-b border-gray-200">
                                <h4 className="text-sm font-semibold text-gray-800">Selected Interviewers ({selectedInterviewers.length})</h4>
                            </div>
                            <div className="flex-grow overflow-y-auto p-3">
                                {selectedInterviewers.length > 0 ? (
                                    <ul className="space-y-2">
                                        {selectedInterviewers.map(interviewer => (
                                            <li key={interviewer.value} className="flex items-center justify-between text-sm">
                                                <span className="text-gray-700">{interviewer.label}</span>
                                                <StatusBadge status={interviewer.status} />
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-center text-sm text-gray-500 h-full flex items-center justify-center">
                                        Select interviewers from the list on the right.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Interviewer Picker */}
                    <div className="md:col-span-7 flex flex-col border-l border-gray-200 pl-8">
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Available Interviewers *
                        </label>
                        <Controller
                            name="interviewerIds"
                            control={control}
                            rules={{ required: 'Please select at least one interviewer', validate: val => val.length > 0 || 'Select at least one' }}
                            render={({ field }) => (
                                <InterviewerList
                                    interviewers={interviewerOptions}
                                    loading={loadingInterviewers}
                                    selected={field.value}
                                    onSelectionChange={field.onChange}
                                />
                            )}
                        />
                         {errors.interviewerIds && <p className="mt-1 text-sm text-red-600">{errors.interviewerIds.message}</p>}
                    </div>

                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
                     <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        isLoading={isSubmitting}
                        disabled={!canSubmit}
                    >
                        Create & Notify {selectedInterviewerIds?.length || 0} Interviewer(s)
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default BookingFormModal;
