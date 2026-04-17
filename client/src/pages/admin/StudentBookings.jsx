// client/src/pages/admin/StudentBookings.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Eye, Link2, Users, Clipboard, Search, ChevronDown, ChevronRight,
    Plus, CheckCircle, Clock, Trash2, User, ExternalLink, BarChart3, X, Check, Loader2, CalendarPlus
} from 'lucide-react';
import { deletePublicBookingLink, addSlotsToPublicBooking } from '@/api/admin.api';
import { usePublicBookings, useBookingSlots, useInvalidateAdmin } from '@/hooks/useAdminQueries';
import { useAlert } from '@/hooks/useAlert';
import { formatDateTime, formatDate, formatTime } from '@/utils/formatters';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Loader from '@/components/common/Loader';
import { cn } from '@/lib/utils';

// ── Add Slots Modal ──
const AddSlotsModal = ({ isOpen, onClose, publicBookingId, onSuccess }) => {
    const { showSuccess, showError } = useAlert();
    const { data: slots = [], isLoading } = useBookingSlots({});
    const [selectedSlots, setSelectedSlots] = useState({});
    const [saving, setSaving] = useState(false);

    const handleSlotToggle = (row, slot) => {
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

    const selectedCount = Object.values(selectedSlots).reduce((c, item) => c + item.slots.length, 0);

    const handleSave = async () => {
        if (selectedCount === 0) return;
        setSaving(true);
        try {
            await addSlotsToPublicBooking(publicBookingId, { selectedSlots: Object.values(selectedSlots) });
            showSuccess(`${selectedCount} slot(s) added!`);
            setSelectedSlots({});
            onSuccess();
            onClose();
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to add slots.');
        } finally { setSaving(false); }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl border border-slate-200 flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 shrink-0">
                    <div>
                        <h2 className="text-sm font-semibold text-slate-900">Add Slots to Public Link</h2>
                        <p className="text-[11px] text-slate-400">Select available slots to add</p>
                    </div>
                    <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* Slots list */}
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40"><Loader size="md" /></div>
                    ) : slots.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                            <p className="text-sm font-medium text-slate-500">No available slots</p>
                            <p className="text-[11px] mt-0.5">Create booking requests first to get interviewer slots</p>
                        </div>
                    ) : (
                        <table className="min-w-full">
                            <thead>
                                <tr>
                                    <th className="sticky top-0 px-4 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] bg-slate-50 border-b border-slate-200 z-10">Interviewer</th>
                                    <th className="sticky top-0 px-4 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] bg-slate-50 border-b border-slate-200 z-10 w-28">Date</th>
                                    <th className="sticky top-0 px-4 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] bg-slate-50 border-b border-slate-200 z-10">Time Slots</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {slots.map(row => {
                                    const entry = selectedSlots[row.submissionId];
                                    return (
                                        <tr key={row.submissionId} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-4 py-2.5">
                                                <p className="text-[12px] font-medium text-slate-900">{row.fullName}</p>
                                                <p className="text-[10px] text-slate-400">{row.email}</p>
                                            </td>
                                            <td className="px-4 py-2.5 text-[12px] text-slate-600">{formatDate(row.interviewDate)}</td>
                                            <td className="px-4 py-2.5">
                                                <div className="flex flex-wrap gap-1">
                                                    {row.timeSlots.map((slot, idx) => {
                                                        const isSelected = entry?.slots.some(s => s.startTime === slot.startTime && s.endTime === slot.endTime);
                                                        return (
                                                            <button key={idx} type="button" onClick={() => handleSlotToggle(row, slot)}
                                                                className={cn('inline-flex items-center gap-1 h-6 px-2 text-[10px] font-medium rounded border transition-colors',
                                                                    isSelected ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300')}>
                                                                {isSelected && <Check size={10} />}
                                                                {formatTime(slot.startTime)}-{formatTime(slot.endTime)}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 shrink-0">
                    <span className="text-[11px] text-slate-400">{selectedCount} slot(s) selected</span>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="h-8 px-3 text-[12px] font-medium text-slate-700 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors">Cancel</button>
                        <button onClick={handleSave} disabled={selectedCount === 0 || saving}
                            className="inline-flex items-center gap-1.5 h-8 px-3 text-[12px] font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-40 transition-colors">
                            {saving ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                            Add {selectedCount > 0 ? selectedCount : ''} Slots
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StudentBookings = () => {
    const { showSuccess, showError } = useAlert();
    const navigate = useNavigate();
    const { data: publicBookings = [], isLoading: loading } = usePublicBookings();
    const { invalidatePublicBookings } = useInvalidateAdmin();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('newest');
    const [creatorFilter, setCreatorFilter] = useState('');
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });
    const [addSlotsModal, setAddSlotsModal] = useState({ isOpen: false, bookingId: null });

    const creatorOptions = useMemo(() => {
        const creators = new Map();
        publicBookings.forEach(b => {
            if (b.createdBy) creators.set(b.createdBy._id, `${b.createdBy.firstName} ${b.createdBy.lastName || ''}`.trim());
        });
        return Array.from(creators, ([value, label]) => ({ value, label }));
    }, [publicBookings]);

    const filtered = useMemo(() => {
        let items = [...publicBookings];
        if (searchTerm) items = items.filter(b => b.publicId.toLowerCase().includes(searchTerm.toLowerCase()));
        if (creatorFilter) items = items.filter(b => b.createdBy?._id === creatorFilter);
        switch (sortOption) {
            case 'oldest': items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
            case 'most_students': items.sort((a, b) => (b.allowedStudents?.length || 0) - (a.allowedStudents?.length || 0)); break;
            default: items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return items;
    }, [publicBookings, searchTerm, sortOption, creatorFilter]);

    const handleDeleteConfirm = async () => {
        if (!deleteDialog.id) return;
        try { await deletePublicBookingLink(deleteDialog.id); showSuccess('Link deleted!'); invalidatePublicBookings(); }
        catch { showError("Failed to delete."); }
        finally { setDeleteDialog({ isOpen: false, id: null }); }
    };

    // Stats
    const totalStudents = useMemo(() => publicBookings.reduce((s, b) => s + (b.allowedStudents?.length || 0), 0), [publicBookings]);
    const totalBooked = useMemo(() => publicBookings.reduce((s, b) => s + (b.bookedCount || 0), 0), [publicBookings]);

    if (loading) return <div className="flex items-center justify-center h-64"><Loader size="lg" /></div>;

    return (
        <div className="h-full flex flex-col bg-white overflow-hidden">
            {/* Toolbar */}
            <div className="border-b border-slate-200 shrink-0">
                {/* Stats row */}
                <div className="flex items-center px-5 py-2 gap-5 border-b border-slate-100">
                    <div className="flex items-center gap-5 text-[12px]">
                        <div className="flex items-center gap-1.5 text-slate-500">
                            <Link2 size={13} className="text-slate-400" />
                            <span className="font-bold text-slate-900">{publicBookings.length}</span> Links
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                            <Users size={13} className="text-blue-500" />
                            <span className="font-bold text-slate-900">{totalStudents}</span> Students
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                            <CheckCircle size={13} className="text-emerald-500" />
                            <span className="font-bold text-slate-900">{totalBooked}</span> Booked
                        </div>
                    </div>
                    <div className="flex-1" />
                    <button onClick={() => navigate('/admin/bookings/booking-slots')}
                        className="inline-flex items-center gap-2 h-8 px-3 text-[12px] font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
                        <Plus size={13} /> New Link
                    </button>
                </div>

                {/* Filter row */}
                <div className="flex items-center gap-2 px-5 py-2">
                    <div className="relative w-48">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by ID..."
                            className="w-full pl-9 pr-3 h-8 bg-slate-50 border border-slate-200 rounded-md text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all" />
                    </div>
                    <div className="relative">
                        <select value={creatorFilter} onChange={e => setCreatorFilter(e.target.value)}
                            className="appearance-none h-8 pl-3 pr-7 bg-white border border-slate-200 rounded-md text-[12px] cursor-pointer hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors">
                            <option value="">All Creators</option>
                            {creatorOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                    </div>
                    <div className="relative">
                        <select value={sortOption} onChange={e => setSortOption(e.target.value)}
                            className="appearance-none h-8 pl-3 pr-7 bg-white border border-slate-200 rounded-md text-[12px] cursor-pointer hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors">
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="most_students">Most Students</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                        <Link2 size={28} className="mb-2 opacity-20" />
                        <p className="text-sm font-medium text-slate-500">{publicBookings.length === 0 ? 'No public links yet' : 'No links match your filters'}</p>
                    </div>
                ) : (
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <th className="sticky top-0 px-5 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] bg-slate-50 border-b border-slate-200 z-10">Created</th>
                                <th className="sticky top-0 px-5 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] bg-slate-50 border-b border-slate-200 z-10">Public ID</th>
                                <th className="sticky top-0 px-5 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] bg-slate-50 border-b border-slate-200 z-10">Interviewers</th>
                                <th className="sticky top-0 px-5 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] bg-slate-50 border-b border-slate-200 z-10">Students</th>
                                <th className="sticky top-0 px-5 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] bg-slate-50 border-b border-slate-200 z-10">Booked</th>
                                <th className="sticky top-0 px-5 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] bg-slate-50 border-b border-slate-200 z-10">Pending</th>
                                <th className="sticky top-0 w-32 px-5 py-2 bg-slate-50 border-b border-slate-200 z-10" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map(booking => {
                                const uniqueInterviewers = [...new Set(
                                    booking.interviewerSlots?.map(s => s.interviewer?.user ? `${s.interviewer.user.firstName} ${s.interviewer.user.lastName}`.trim() : null).filter(Boolean)
                                )];
                                const url = `${window.location.origin}/book/${booking.publicId}`;
                                const creatorName = booking.createdBy ? `${booking.createdBy.firstName} ${booking.createdBy.lastName || ''}`.trim() : '—';

                                return (
                                    <tr key={booking._id} className="group hover:bg-slate-50/60 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/admin/public-bookings/${booking._id}/evaluation`)}>
                                        {/* Created */}
                                        <td className="px-5 py-2.5">
                                            <p className="text-[12px] font-medium text-slate-900">{formatDateTime(booking.createdAt)}</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">by {creatorName}</p>
                                        </td>
                                        {/* Public ID */}
                                        <td className="px-5 py-2.5" onClick={e => e.stopPropagation()}>
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-mono text-[11px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{booking.publicId}</span>
                                                <button onClick={() => { navigator.clipboard.writeText(url); showSuccess("Copied!"); }}
                                                    className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Copy link">
                                                    <Clipboard size={11} />
                                                </button>
                                            </div>
                                        </td>
                                        {/* Interviewers */}
                                        <td className="px-5 py-2.5">
                                            <span className="text-[12px] text-slate-600" title={uniqueInterviewers.join(', ')}>{uniqueInterviewers.length}</span>
                                        </td>
                                        {/* Students */}
                                        <td className="px-5 py-2.5">
                                            <span className="text-[12px] font-medium text-slate-900">{booking.allowedStudents?.length || 0}</span>
                                        </td>
                                        {/* Booked */}
                                        <td className="px-5 py-2.5">
                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                                                <CheckCircle size={11} /> {booking.bookedCount || 0}
                                            </span>
                                        </td>
                                        {/* Pending */}
                                        <td className="px-5 py-2.5">
                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-500">
                                                <Clock size={11} /> {booking.pendingCount || 0}
                                            </span>
                                        </td>
                                        {/* Actions */}
                                        <td className="px-5 py-2.5" onClick={e => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setAddSlotsModal({ isOpen: true, bookingId: booking._id })}
                                                    className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors" title="Add Slots">
                                                    <CalendarPlus size={14} />
                                                </button>
                                                <button onClick={() => navigate(`/admin/public-bookings/${booking._id}/evaluation`)}
                                                    className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Evaluations">
                                                    <BarChart3 size={14} />
                                                </button>
                                                <button onClick={() => navigate(`/admin/public-bookings/${booking._id}/tracking`)}
                                                    className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Track">
                                                    <Eye size={14} />
                                                </button>
                                                <button onClick={() => navigate(`/admin/public-bookings/${booking._id}/authorize`)}
                                                    className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Authorize">
                                                    <Users size={14} />
                                                </button>
                                                <button onClick={() => setDeleteDialog({ isOpen: true, id: booking._id })}
                                                    className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Footer */}
            {filtered.length > 0 && (
                <div className="px-5 py-2 border-t border-slate-100 shrink-0">
                    <p className="text-[11px] text-slate-400">{filtered.length} of {publicBookings.length} links</p>
                </div>
            )}

            <AddSlotsModal
                isOpen={addSlotsModal.isOpen}
                onClose={() => setAddSlotsModal({ isOpen: false, bookingId: null })}
                publicBookingId={addSlotsModal.bookingId}
                onSuccess={() => invalidatePublicBookings()}
            />

            <ConfirmDialog isOpen={deleteDialog.isOpen} onClose={() => setDeleteDialog({ isOpen: false, id: null })}
                onConfirm={handleDeleteConfirm} title="Delete Public Link"
                message="All associated student invitations will be lost. This action is permanent." confirmVariant="danger" />
        </div>
    );
};

export default StudentBookings;
