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
import { Search, Calendar, Link, Trash2, Check, Plus } from 'lucide-react';
import Loader from '@/components/common/Loader';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import ManualSlotFormModal from './ManualSlotFormModal';
import { cn } from '@/lib/utils';

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

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchFilter), 300);
        return () => clearTimeout(timer);
    }, [searchFilter]);

    const slotsParams = useMemo(() => {
        const params = { search: debouncedSearch };
        if (dateFilter) params.date = format(dateFilter, 'yyyy-MM-dd');
        return params;
    }, [debouncedSearch, dateFilter]);

    const { data: slots = [], isLoading: loading } = useBookingSlots(slotsParams);
    const { data: interviewersData } = useInterviewers({ limit: 1000 });

    const interviewerOptions = useMemo(() =>
        (interviewersData?.interviewers || []).map(i => ({ value: i._id, label: `${i.user.firstName} ${i.user.lastName} (${i.user.email})` })),
    [interviewersData]);

    const { invalidateBookingSlots } = useInvalidateAdmin();

    const handleDeleteConfirm = async () => {
        if (!deleteDialog.bookingId || !deleteDialog.submissionId) return;
        try { await resetBookingSubmission(deleteDialog.bookingId, deleteDialog.submissionId); showSuccess("Submission deleted."); invalidateBookingSlots(); }
        catch { showError("Failed to delete."); }
        finally { setDeleteDialog({ isOpen: false, bookingId: null, submissionId: null }); }
    };

    const handleSlotSelection = (row, slot) => {
        setSelectedSlots(prev => {
            const next = { ...prev };
            const entry = next[row.submissionId];
            if (!entry) {
                next[row.submissionId] = { interviewerId: row.interviewerId, date: row.interviewDate, slots: [{ startTime: slot.startTime, endTime: slot.endTime }] };
            } else {
                const idx = entry.slots.findIndex(s => s.startTime === slot.startTime && s.endTime === slot.endTime);
                if (idx > -1) {
                    const newSlots = entry.slots.filter((_, i) => i !== idx);
                    if (!newSlots.length) delete next[row.submissionId];
                    else next[row.submissionId] = { ...entry, slots: newSlots };
                } else {
                    next[row.submissionId] = { ...entry, slots: [...entry.slots, { startTime: slot.startTime, endTime: slot.endTime }] };
                }
            }
            return next;
        });
    };

    const handleSelectAllForRow = (row) => {
        setSelectedSlots(prev => {
            const next = { ...prev };
            const entry = next[row.submissionId];
            if (entry && entry.slots.length === row.timeSlots.length) delete next[row.submissionId];
            else next[row.submissionId] = { interviewerId: row.interviewerId, date: row.interviewDate, slots: row.timeSlots.map(s => ({ startTime: s.startTime, endTime: s.endTime })) };
            return next;
        });
    };

    const handleCreatePublicLink = async () => {
        setIsCreatingLink(true);
        try { await createPublicBookingLink({ selectedSlots: Object.values(selectedSlots) }); showSuccess('Public link created!'); navigate('/admin/bookings/student-bookings'); }
        catch { showError("Failed to create link."); }
        finally { setIsCreatingLink(false); }
    };

    const selectedSlotsCount = Object.values(selectedSlots).reduce((c, item) => c + item.slots.length, 0);

    return (
        <div className="h-full flex flex-col bg-white overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-2 px-5 py-2.5 border-b border-slate-200 shrink-0">
                <div className="relative w-52">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input type="text" value={searchFilter} onChange={e => setSearchFilter(e.target.value)} placeholder="Search by name or email..."
                        className="w-full pl-9 pr-3 h-8 bg-slate-50 border border-slate-200 rounded-md text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all" />
                </div>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 z-10 pointer-events-none" />
                    <DatePicker selected={dateFilter} onChange={setDateFilter} isClearable placeholderText="Filter by date"
                        portalId="datepicker-portal" popperClassName="!z-[9999]" popperProps={{ strategy: 'fixed' }}
                        className="pl-9 pr-3 h-8 bg-white border border-slate-200 rounded-md text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 w-36" />
                </div>

                <div className="flex-1" />

                <button onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-1.5 h-8 px-3 text-[12px] font-medium text-slate-700 border border-slate-200 rounded-md bg-white hover:bg-slate-50 transition-colors">
                    <Plus size={13} /> Manual Add Slot
                </button>
                <button onClick={handleCreatePublicLink} disabled={selectedSlotsCount === 0 || isCreatingLink}
                    className="inline-flex items-center gap-1.5 h-8 px-3 text-[12px] font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-40 transition-colors">
                    <Link size={13} /> Create Link {selectedSlotsCount > 0 && `(${selectedSlotsCount})`}
                </button>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-64"><Loader size="lg" /></div>
                ) : slots.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                        <p className="text-sm font-medium text-slate-500">No slots found</p>
                        <p className="text-[11px] mt-0.5">{searchFilter || dateFilter ? 'Try adjusting your filters.' : ''}</p>
                    </div>
                ) : (
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <th className="sticky top-0 w-10 px-4 py-2 bg-slate-50 border-b border-slate-200 z-10">
                                    <input type="checkbox"
                                        checked={slots.length > 0 && slots.every(row => selectedSlots[row.submissionId]?.slots.length === row.timeSlots.length)}
                                        onChange={e => {
                                            if (e.target.checked) {
                                                const all = {};
                                                slots.forEach(row => { all[row.submissionId] = { interviewerId: row.interviewerId, date: row.interviewDate, slots: row.timeSlots.map(s => ({ startTime: s.startTime, endTime: s.endTime })) }; });
                                                setSelectedSlots(all);
                                            } else setSelectedSlots({});
                                        }}
                                        className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                </th>
                                <th className="sticky top-0 px-4 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] bg-slate-50 border-b border-slate-200 z-10">Interviewer</th>
                                <th className="sticky top-0 px-4 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] bg-slate-50 border-b border-slate-200 z-10 w-28">Date</th>
                                <th className="sticky top-0 px-4 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] bg-slate-50 border-b border-slate-200 z-10">Time Slots</th>
                                <th className="sticky top-0 w-12 px-4 py-2 bg-slate-50 border-b border-slate-200 z-10" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {slots.map(row => {
                                const entry = selectedSlots[row.submissionId];
                                const isAllSelected = entry && entry.slots.length === row.timeSlots.length;
                                return (
                                    <tr key={row.submissionId} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="px-4 py-2.5">
                                            <input type="checkbox" checked={isAllSelected || false} onChange={() => handleSelectAllForRow(row)}
                                                className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <p className="text-[13px] font-medium text-slate-900">{row.fullName}</p>
                                            <p className="text-[11px] text-slate-400">{row.email}</p>
                                        </td>
                                        <td className="px-4 py-2.5 text-[12px] text-slate-600 whitespace-nowrap">{formatDate(row.interviewDate)}</td>
                                        <td className="px-4 py-2.5">
                                            <div className="flex flex-wrap gap-1">
                                                {row.timeSlots.map((slot, idx) => {
                                                    const isSelected = entry?.slots.some(s => s.startTime === slot.startTime && s.endTime === slot.endTime);
                                                    return (
                                                        <button key={idx} type="button" onClick={() => handleSlotSelection(row, slot)}
                                                            className={cn('inline-flex items-center gap-1 h-6 px-2 text-[10px] font-medium rounded-md border transition-colors',
                                                                isSelected ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300')}>
                                                            {isSelected && <Check size={10} />}
                                                            {formatTime(slot.startTime)}-{formatTime(slot.endTime)}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <button onClick={() => setDeleteDialog({ isOpen: true, bookingId: row.bookingId, submissionId: row.submissionId })}
                                                className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            <ConfirmDialog isOpen={deleteDialog.isOpen} onClose={() => setDeleteDialog({ isOpen: false, bookingId: null, submissionId: null })}
                onConfirm={handleDeleteConfirm} title="Delete Submission" message="This will reset the interviewer's status to 'Pending'. Cannot be undone." confirmVariant="danger" />

            <ManualSlotFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
                onSuccess={() => { setIsModalOpen(false); invalidateBookingSlots(); showSuccess("Slot added."); }} interviewers={interviewerOptions} />
        </div>
    );
};

export default BookingSlots;
