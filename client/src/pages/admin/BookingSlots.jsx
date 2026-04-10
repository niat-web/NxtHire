// client/src/pages/admin/BookingSlots.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import { createPublicBookingLink, resetBookingSubmission } from '@/api/admin.api';
import { useBookingSlots, useInterviewers, useInvalidateAdmin } from '@/hooks/useAdminQueries';
import { useAlert } from '@/hooks/useAlert';
import { formatDate, formatTime, formatDateTime } from '@/utils/formatters';
import { Search, Calendar, Link, Loader2, Trash2, Check, Plus } from 'lucide-react';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import ManualSlotFormModal from './ManualSlotFormModal';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const BookingSlots = () => {
    const { showSuccess, showError } = useAlert();
    const navigate = useNavigate();
    const [searchFilter, setSearchFilter] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [dateFilter, setDateFilter] = useState(null);
    const [selectedSlots, setSelectedSlots] = useState({});
    const [isCreatingLink, setIsCreatingLink] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, bookingId: null, submissionId: null });

    const [isModalOpen, setIsModalOpen] = useState(false);

    // Debounce search input to avoid excessive API calls
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchFilter), 300);
        return () => clearTimeout(timer);
    }, [searchFilter]);

    const slotsParams = useMemo(() => {
        const params = { search: debouncedSearch };
        if (dateFilter) {
            params.date = format(dateFilter, 'yyyy-MM-dd');
        }
        return params;
    }, [debouncedSearch, dateFilter]);

    const { data: slots = [], isLoading: loading } = useBookingSlots(slotsParams, {
        onError: () => showError("Failed to fetch booking slots."),
    });

    const { data: interviewersData } = useInterviewers({ limit: 1000 }, {
        onError: () => showError("Failed to load list of interviewers for manual entry."),
    });

    const interviewerOptions = useMemo(() => {
        return (interviewersData?.interviewers || []).map(i => ({
            value: i._id,
            label: `${i.user.firstName} ${i.user.lastName} (${i.user.email})`
        }));
    }, [interviewersData]);

    const { invalidateBookingSlots } = useInvalidateAdmin();
    
    const handleDeleteRequest = (bookingId, submissionId) => {
        setDeleteDialog({ isOpen: true, bookingId, submissionId });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteDialog.bookingId || !deleteDialog.submissionId) return;
        try {
            await resetBookingSubmission(deleteDialog.bookingId, deleteDialog.submissionId);
            showSuccess("Submission deleted.");
            invalidateBookingSlots();
        } catch (error) {
            showError("Failed to delete submission.");
        } finally {
            setDeleteDialog({ isOpen: false, bookingId: null, submissionId: null });
        }
    };

    const handleSlotSelection = (row, slot) => {
        setSelectedSlots(prev => {
            const newSelection = { ...prev };
            const submissionEntry = newSelection[row.submissionId];

            if (!submissionEntry) {
                newSelection[row.submissionId] = {
                    interviewerId: row.interviewerId,
                    date: row.interviewDate,
                    slots: [{ startTime: slot.startTime, endTime: slot.endTime }]
                };
            } else {
                const slotIndex = submissionEntry.slots.findIndex(
                    s => s.startTime === slot.startTime && s.endTime === slot.endTime
                );

                if (slotIndex > -1) {
                    const newSlots = submissionEntry.slots.filter((_, index) => index !== slotIndex);
                    if (newSlots.length === 0) {
                        delete newSelection[row.submissionId];
                    } else {
                        newSelection[row.submissionId] = { ...submissionEntry, slots: newSlots };
                    }
                } else {
                    newSelection[row.submissionId] = {
                        ...submissionEntry,
                        slots: [...submissionEntry.slots, { startTime: slot.startTime, endTime: slot.endTime }]
                    };
                }
            }
            return newSelection;
        });
    };

    const handleSelectAllForRow = (row) => {
        setSelectedSlots(prev => {
            const newSelection = { ...prev };
            const entry = newSelection[row.submissionId];
            const isCurrentlySelected = entry && entry.slots.length === row.timeSlots.length;

            if (isCurrentlySelected) {
                delete newSelection[row.submissionId];
            } else {
                newSelection[row.submissionId] = {
                    interviewerId: row.interviewerId,
                    date: row.interviewDate,
                    slots: row.timeSlots.map(s => ({ startTime: s.startTime, endTime: s.endTime }))
                };
            }
            return newSelection;
        });
    };

    const handleCreatePublicLink = async () => {
        setIsCreatingLink(true);
        try {
            const payload = { selectedSlots: Object.values(selectedSlots) };
            await createPublicBookingLink(payload);
            showSuccess('Public link created! Redirecting...');
            navigate('/admin/bookings/student-bookings');
        } catch (error) {
            showError("Failed to create public link.");
        } finally {
            setIsCreatingLink(false);
        }
    };

    const selectedSlotsCount = Object.values(selectedSlots).reduce((count, item) => count + item.slots.length, 0);

    return (
        <div className="h-full flex flex-col bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col md:flex-row gap-3 flex-1">
                        <div className="relative flex-1 md:max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchFilter}
                                onChange={(e) => setSearchFilter(e.target.value)}
                                placeholder="Search by name or email..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                            />
                        </div>

                        <div className="relative min-w-[180px]">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                            <DatePicker
                                selected={dateFilter}
                                onChange={(date) => setDateFilter(date)}
                                isClearable
                                placeholderText="Filter by date"
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                            <Plus size={16} className="mr-2" />
                            Manual Add Slot
                        </Button>

                        <Button
                            onClick={handleCreatePublicLink}
                            disabled={selectedSlotsCount === 0}
                            isLoading={isCreatingLink}
                        >
                            {!isCreatingLink && <Link size={16} className="mr-2" />}
                            {isCreatingLink ? 'Creating...' : <>Create Link {selectedSlotsCount > 0 && `(${selectedSlotsCount})`}</>}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto px-6 py-4">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-700 rounded-full animate-spin"></div>
                    </div>
                ) : slots.length === 0 ? (
                    <div className="text-center py-16 text-slate-500">
                        No slots found. {searchFilter || dateFilter ? "Try adjusting your filters." : ""}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-700 w-8"></th>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-700">Interviewer</th>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-700 whitespace-nowrap w-40">Date</th>
                                    <th className="text-left pl-8 pr-4 py-3 font-semibold text-slate-700">Time Slots</th>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-700 w-16"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {slots.map((row) => {
                                    const entry = selectedSlots[row.submissionId];
                                    const isAllSelected = entry && entry.slots.length === row.timeSlots.length;
                                    
                                    return (
                                        <tr key={row.submissionId} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <input type="checkbox" checked={isAllSelected || false} onChange={() => handleSelectAllForRow(row)} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-slate-900/10" />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-800">{row.fullName}</div>
                                                <div className="text-xs text-slate-500">{row.email}</div>
                                                <div className="text-xs text-slate-400 mt-1">{formatDateTime(row.submittedAt)}</div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-700 whitespace-nowrap w-40">{formatDate(row.interviewDate)}</td>
                                            <td className="pl-8 pr-4 py-3">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {row.timeSlots.map((slot, idx) => {
                                                        const isSelected = entry?.slots.some( s => s.startTime === slot.startTime && s.endTime === slot.endTime );
                                                        return (
                                                            <Button key={idx} variant={isSelected ? 'outline' : 'secondary'} size="xs" onClick={() => handleSlotSelection(row, slot)} className={cn(isSelected && 'bg-indigo-100 text-indigo-700 border-indigo-300')}>
                                                                {isSelected && <Check size={12} className="inline mr-1" />}
                                                                {formatTime(slot.startTime)}-{formatTime(slot.endTime)}
                                                            </Button>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteRequest(row.bookingId, row.submissionId)} className="text-red-600 hover:bg-red-50">
                                                    <Trash2 size={16} />
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, bookingId: null, submissionId: null })}
                onConfirm={handleDeleteConfirm}
                title="Delete Submission"
                message="Are you sure you want to delete this submission? This will reset the interviewer's status to 'Pending' for this date. This cannot be undone."
                confirmVariant="danger"
            />
            
            <ManualSlotFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false);
                    invalidateBookingSlots(); // Refresh the list after successful submission
                    showSuccess("Manual slot added successfully and is now available for booking.");
                }}
                interviewers={interviewerOptions}
            />
        </div>
    );
};

export default BookingSlots;
