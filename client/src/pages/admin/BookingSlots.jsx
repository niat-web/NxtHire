import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import { createPublicBookingLink, resetBookingSubmission } from '@/api/admin.api';
import { useBookingSlots, useInterviewers, useInvalidateAdmin } from '@/hooks/useAdminQueries';
import { useAlert } from '@/hooks/useAlert';
import { formatDate, formatTime } from '@/utils/formatters';
import { Search, Calendar, Link as LinkIcon, Trash2, Check, Plus, Inbox } from 'lucide-react';
import Loader from '@/components/common/Loader';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import ManualSlotFormModal from './ManualSlotFormModal';
import { cn } from '@/lib/utils';

const DISPLAY = { fontFamily: 'Supreme, "Plus Jakarta Sans", system-ui, sans-serif' };
const ACCENT = '#C0392B';

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
    const allSelected = slots.length > 0 && slots.every(row => selectedSlots[row.submissionId]?.slots.length === row.timeSlots.length);

    return (
        <div className="h-full flex flex-col bg-card overflow-hidden">
            {/* Hero + toolbar — edge-to-edge slab */}
            <section className="border-b border-border bg-card px-5 lg:px-6 pt-3 pb-3 shrink-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 style={DISPLAY} className="text-[22px] sm:text-[26px] font-semibold text-foreground tracking-tight leading-none">
                            Booking slots
                        </h1>
                        <p className="mt-1 text-[12.5px] text-muted-foreground">
                            {slots.length} submitted · pick times and publish a candidate booking link
                        </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => setIsModalOpen(true)}
                            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-primary px-4 text-[12.5px] font-semibold text-foreground transition-colors hover:bg-primary hover:text-white">
                            <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add slot manually
                        </button>
                        <button onClick={handleCreatePublicLink} disabled={selectedSlotsCount === 0 || isCreatingLink}
                            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed">
                            <LinkIcon className="h-3.5 w-3.5" aria-hidden="true" />
                            Create link {selectedSlotsCount > 0 && <span className="ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-white text-foreground text-[10.5px]">{selectedSlotsCount}</span>}
                        </button>
                    </div>
                </div>

                {/* Filter row */}
                <div className="flex flex-wrap items-center gap-2.5 mt-3">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/70" aria-hidden="true" />
                        <input type="text" value={searchFilter} onChange={e => setSearchFilter(e.target.value)} placeholder="Search by name or email"
                            className="w-full pl-10 pr-3 h-9 bg-white border border-border rounded-md text-[13px] placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-colors" />
                    </div>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/70 z-10 pointer-events-none" aria-hidden="true" />
                        <DatePicker selected={dateFilter} onChange={setDateFilter} isClearable placeholderText="Filter by date"
                            portalId="datepicker-portal" popperClassName="!z-[9999]" popperProps={{ strategy: 'fixed' }}
                            className="pl-10 pr-4 h-9 bg-white border border-border rounded-md text-[13px] placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary w-44 transition-colors" />
                    </div>
                    {(searchFilter || dateFilter) && (
                        <button onClick={() => { setSearchFilter(''); setDateFilter(null); }}
                            className="text-[12px] text-muted-foreground hover:text-foreground font-medium px-3 h-8 rounded-md hover:bg-muted transition-colors">
                            Clear
                        </button>
                    )}
                </div>
            </section>

            {/* Table */}
            <div className="flex-1 overflow-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-64"><Loader size="lg" /></div>
                ) : slots.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <span className="inline-flex items-center justify-center h-12 w-12 rounded-full border border-border bg-white text-muted-foreground/70 mb-4">
                            <Inbox className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <h3 style={DISPLAY} className="text-[20px] font-semibold text-foreground tracking-tight">No slots yet</h3>
                        <p className="mt-1 text-[13px] text-muted-foreground">{searchFilter || dateFilter ? 'Try adjusting your filters.' : 'Interviewer submissions will appear here.'}</p>
                    </div>
                ) : (
                    <div className="px-5 lg:px-6 py-3">
                        <div className="bg-white rounded-lg border border-border overflow-hidden">
                            <table className="min-w-full text-[13px]">
                                <thead>
                                    <tr>
                                        <th className="sticky top-0 w-10 px-4 py-3 bg-muted/40 backdrop-blur border-b border-border z-10">
                                            <input type="checkbox" aria-label="Select all rows"
                                                checked={allSelected}
                                                onChange={e => {
                                                    if (e.target.checked) {
                                                        const all = {};
                                                        slots.forEach(row => { all[row.submissionId] = { interviewerId: row.interviewerId, date: row.interviewDate, slots: row.timeSlots.map(s => ({ startTime: s.startTime, endTime: s.endTime })) }; });
                                                        setSelectedSlots(all);
                                                    } else setSelectedSlots({});
                                                }}
                                                className="h-4 w-4 rounded border-slate-300 text-foreground focus:ring-primary" />
                                        </th>
                                        <th className="sticky top-0 px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.15em] bg-muted/40 backdrop-blur border-b border-border z-10">Interviewer</th>
                                        <th className="sticky top-0 px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.15em] bg-muted/40 backdrop-blur border-b border-border z-10 w-32">Date</th>
                                        <th className="sticky top-0 px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.15em] bg-muted/40 backdrop-blur border-b border-border z-10">Time slots</th>
                                        <th className="sticky top-0 w-12 px-4 py-3 bg-muted/40 backdrop-blur border-b border-border z-10" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {slots.map(row => {
                                        const entry = selectedSlots[row.submissionId];
                                        const isAllSelected = entry && entry.slots.length === row.timeSlots.length;
                                        const selectedCountInRow = entry?.slots.length || 0;
                                        return (
                                            <tr key={row.submissionId} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-4 py-3 align-middle">
                                                    <input type="checkbox" aria-label={`Select all slots for ${row.fullName}`} checked={isAllSelected || false} onChange={() => handleSelectAllForRow(row)}
                                                        className="h-4 w-4 rounded border-slate-300 text-foreground focus:ring-primary" />
                                                </td>
                                                <td className="px-4 py-3 align-middle">
                                                    <p className="text-[13px] font-semibold text-foreground">{row.fullName}</p>
                                                    <p className="text-[11.5px] text-muted-foreground">{row.email}</p>
                                                </td>
                                                <td className="px-4 py-3 text-[12.5px] text-foreground/90 whitespace-nowrap align-middle">{formatDate(row.interviewDate)}</td>
                                                <td className="px-4 py-3 align-middle">
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        {row.timeSlots.map((slot, idx) => {
                                                            const isSelected = entry?.slots.some(s => s.startTime === slot.startTime && s.endTime === slot.endTime);
                                                            return (
                                                                <button key={idx} type="button" onClick={() => handleSlotSelection(row, slot)}
                                                                    className={cn(
                                                                        'inline-flex items-center gap-1 h-7 px-2.5 text-[11.5px] font-semibold rounded-md border transition-colors',
                                                                        isSelected
                                                                            ? 'border-primary bg-primary text-white'
                                                                            : 'border-border bg-white text-foreground/90 hover:border-primary hover:text-foreground'
                                                                    )}>
                                                                    {isSelected && <Check className="h-3 w-3" aria-hidden="true" />}
                                                                    {formatTime(slot.startTime)}–{formatTime(slot.endTime)}
                                                                </button>
                                                            );
                                                        })}
                                                        {selectedCountInRow > 0 && (
                                                            <span className="text-[11px] text-muted-foreground ml-1">{selectedCountInRow}/{row.timeSlots.length} selected</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 align-middle">
                                                    <button
                                                        aria-label="Delete submission"
                                                        onClick={() => setDeleteDialog({ isOpen: true, bookingId: row.bookingId, submissionId: row.submissionId })}
                                                        className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors">
                                                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Sticky selection bar */}
            {selectedSlotsCount > 0 && (
                <div className="shrink-0 border-t border-border bg-white px-6 lg:px-8 py-3 flex items-center justify-between">
                    <p className="text-[12.5px] text-foreground/90">
                        <span className="font-semibold text-foreground">{selectedSlotsCount}</span> slot{selectedSlotsCount === 1 ? '' : 's'} selected across <span className="font-semibold text-foreground">{Object.keys(selectedSlots).length}</span> interviewer{Object.keys(selectedSlots).length === 1 ? '' : 's'}
                    </p>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setSelectedSlots({})}
                            className="h-9 px-4 text-[12px] font-semibold text-foreground/90 rounded-md border border-border hover:border-primary hover:text-foreground transition-colors">
                            Clear
                        </button>
                        <button onClick={handleCreatePublicLink} disabled={isCreatingLink}
                            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-40">
                            <LinkIcon className="h-3.5 w-3.5" aria-hidden="true" /> Create link ({selectedSlotsCount})
                        </button>
                    </div>
                </div>
            )}

            <ConfirmDialog isOpen={deleteDialog.isOpen} onClose={() => setDeleteDialog({ isOpen: false, bookingId: null, submissionId: null })}
                onConfirm={handleDeleteConfirm} title="Delete submission" message="This will reset the interviewer's status to 'Pending'. Cannot be undone." confirmVariant="danger" />

            <ManualSlotFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
                onSuccess={() => { setIsModalOpen(false); invalidateBookingSlots(); showSuccess("Slot added."); }} interviewers={interviewerOptions} />
        </div>
    );
};

export default BookingSlots;
