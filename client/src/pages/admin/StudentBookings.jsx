import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Eye, Link2, Users, Clipboard, Search, ChevronDown,
    Plus, CheckCircle, Clock, Trash2, Inbox, BarChart3, X, Check, Loader2, CalendarPlus
} from 'lucide-react';
import { deletePublicBookingLink, addSlotsToPublicBooking } from '@/api/admin.api';
import { usePublicBookings, useBookingSlots, useInvalidateAdmin } from '@/hooks/useAdminQueries';
import { useAlert } from '@/hooks/useAlert';
import { formatDateTime, formatDate, formatTime } from '@/utils/formatters';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Loader from '@/components/common/Loader';
import { cn } from '@/lib/utils';

const DISPLAY = { fontFamily: 'Supreme, "Plus Jakarta Sans", system-ui, sans-serif' };
const ACCENT = '#C0392B';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="w-full max-w-2xl bg-white rounded-2xl border border-border shadow-xl flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                    <div>
                        <h2 style={DISPLAY} className="text-[18px] font-semibold text-foreground tracking-tight">Add slots to public link</h2>
                        <p className="text-[12px] text-muted-foreground mt-0.5">Select available slots to append</p>
                    </div>
                    <button aria-label="Close" onClick={onClose} className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                        <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40"><Loader size="md" /></div>
                    ) : slots.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <span className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-border bg-white text-muted-foreground/70 mb-3">
                                <Inbox className="h-4 w-4" aria-hidden="true" />
                            </span>
                            <p className="text-[13px] font-semibold text-foreground">No available slots</p>
                            <p className="text-[12px] text-muted-foreground mt-0.5">Create booking requests first to collect availability</p>
                        </div>
                    ) : (
                        <table className="min-w-full text-[13px]">
                            <thead>
                                <tr>
                                    <th className="sticky top-0 px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.15em] bg-muted/40 backdrop-blur border-b border-border z-10">Interviewer</th>
                                    <th className="sticky top-0 px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.15em] bg-muted/40 backdrop-blur border-b border-border z-10 w-32">Date</th>
                                    <th className="sticky top-0 px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.15em] bg-muted/40 backdrop-blur border-b border-border z-10">Time slots</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {slots.map(row => {
                                    const entry = selectedSlots[row.submissionId];
                                    return (
                                        <tr key={row.submissionId} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3 align-middle">
                                                <p className="text-[12.5px] font-semibold text-foreground">{row.fullName}</p>
                                                <p className="text-[11.5px] text-muted-foreground">{row.email}</p>
                                            </td>
                                            <td className="px-4 py-3 text-[12.5px] text-foreground/90 align-middle">{formatDate(row.interviewDate)}</td>
                                            <td className="px-4 py-3 align-middle">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {row.timeSlots.map((slot, idx) => {
                                                        const isSelected = entry?.slots.some(s => s.startTime === slot.startTime && s.endTime === slot.endTime);
                                                        return (
                                                            <button key={idx} type="button" onClick={() => handleSlotToggle(row, slot)}
                                                                className={cn('inline-flex items-center gap-1 h-7 px-2.5 text-[11.5px] font-semibold rounded-full border transition-colors',
                                                                    isSelected ? 'bg-primary text-white border-primary' : 'bg-white text-foreground/90 border-border hover:border-primary hover:text-foreground')}>
                                                                {isSelected && <Check className="h-3 w-3" aria-hidden="true" />}
                                                                {formatTime(slot.startTime)}–{formatTime(slot.endTime)}
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

                <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30 shrink-0 rounded-b-2xl">
                    <span className="text-[12.5px] text-foreground/80"><span className="font-semibold text-foreground">{selectedCount}</span> slot{selectedCount === 1 ? '' : 's'} selected</span>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="h-9 px-4 text-[12.5px] font-semibold text-foreground/90 border border-border rounded-full hover:border-primary hover:text-foreground transition-colors">Cancel</button>
                        <button onClick={handleSave} disabled={selectedCount === 0 || saving}
                            className="inline-flex items-center gap-1.5 h-9 px-5 text-[13px] font-semibold text-white bg-primary rounded-full hover:bg-primary/90 disabled:opacity-40 transition-colors">
                            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Plus className="h-3.5 w-3.5" aria-hidden="true" />}
                            Add {selectedCount > 0 ? selectedCount : ''} slot{selectedCount === 1 ? '' : 's'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Stat chip ──
const StatChip = ({ label, value, icon: Icon }) => (
    <div className="flex items-center gap-2.5 rounded-full border border-border bg-white px-3 h-9">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        <span style={DISPLAY} className="text-[15px] font-semibold text-foreground leading-none tracking-tight">{value}</span>
        <span className="text-[11.5px] text-muted-foreground">{label}</span>
    </div>
);

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

    const hasFilters = !!(searchTerm || creatorFilter);

    if (loading) return <div className="flex items-center justify-center h-64"><Loader size="lg" /></div>;

    return (
        <div className="h-full flex flex-col bg-card overflow-hidden">
            {/* Hero — title on the left, search + filters + CTA on the right in one row */}
            <section className="border-b border-border bg-card px-5 lg:px-6 pt-3 pb-3 shrink-0">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 style={DISPLAY} className="text-[22px] sm:text-[26px] font-semibold text-foreground tracking-tight leading-none">
                            Public links
                        </h1>
                        <p className="mt-1 text-[12.5px] text-muted-foreground">
                            {publicBookings.length} link{publicBookings.length === 1 ? '' : 's'} · {totalBooked} student{totalBooked === 1 ? '' : 's'} booked so far
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <div className="relative w-full sm:w-56">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/70" aria-hidden="true" />
                            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by public ID"
                                className="w-full pl-10 pr-3 h-9 bg-white border border-border rounded-full text-[13px] placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-colors" />
                        </div>
                        <div className="relative">
                            <select value={creatorFilter} onChange={e => setCreatorFilter(e.target.value)}
                                className="appearance-none h-9 pl-4 pr-9 bg-white border border-border rounded-full text-[13px] text-foreground/90 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-colors">
                                <option value="">All creators</option>
                                {creatorOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/70 pointer-events-none" aria-hidden="true" />
                        </div>
                        <div className="relative">
                            <select value={sortOption} onChange={e => setSortOption(e.target.value)}
                                className="appearance-none h-9 pl-4 pr-9 bg-white border border-border rounded-full text-[13px] text-foreground/90 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-colors">
                                <option value="newest">Newest first</option>
                                <option value="oldest">Oldest first</option>
                                <option value="most_students">Most students</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/70 pointer-events-none" aria-hidden="true" />
                        </div>
                        {hasFilters && (
                            <button onClick={() => { setSearchTerm(''); setCreatorFilter(''); }}
                                className="text-[12px] text-muted-foreground hover:text-foreground font-medium px-3 h-8 rounded-full hover:bg-muted transition-colors">
                                Clear
                            </button>
                        )}
                        <button onClick={() => navigate('/admin/bookings/booking-slots')}
                            className="inline-flex h-9 items-center gap-2 rounded-full bg-primary px-5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-primary/90">
                            <Plus className="h-4 w-4" aria-hidden="true" /> New link
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-3">
                    <StatChip label="Links" value={publicBookings.length} icon={Link2} />
                    <StatChip label="Students" value={totalStudents} icon={Users} />
                    <StatChip label="Booked" value={totalBooked} icon={CheckCircle} />
                </div>
            </section>

            {/* Table */}
            <div className="flex-1 overflow-auto">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <span className="inline-flex items-center justify-center h-12 w-12 rounded-full border border-border bg-white text-muted-foreground/70 mb-4">
                            <Link2 className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <h3 style={DISPLAY} className="text-[20px] font-semibold text-foreground tracking-tight">
                            {publicBookings.length === 0 ? 'No public links yet' : 'No links match'}
                        </h3>
                        <p className="mt-1 text-[13px] text-muted-foreground max-w-sm">
                            {publicBookings.length === 0 ? 'Create one from Booking slots to share with students.' : 'Try clearing the filters to see all links.'}
                        </p>
                    </div>
                ) : (
                    <div className="px-5 lg:px-6 py-3">
                        <div className="bg-white rounded-lg border border-border overflow-hidden">
                            <table className="min-w-full text-[13px]">
                                <thead>
                                    <tr>
                                        <th className="sticky top-0 px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.15em] bg-muted/40 backdrop-blur border-b border-border z-10">Created</th>
                                        <th className="sticky top-0 px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.15em] bg-muted/40 backdrop-blur border-b border-border z-10">Public ID</th>
                                        <th className="sticky top-0 px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.15em] bg-muted/40 backdrop-blur border-b border-border z-10">Interviewers</th>
                                        <th className="sticky top-0 px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.15em] bg-muted/40 backdrop-blur border-b border-border z-10">Students</th>
                                        <th className="sticky top-0 px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.15em] bg-muted/40 backdrop-blur border-b border-border z-10">Booked</th>
                                        <th className="sticky top-0 px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.15em] bg-muted/40 backdrop-blur border-b border-border z-10">Pending</th>
                                        <th className="sticky top-0 w-40 px-5 py-3 bg-muted/40 backdrop-blur border-b border-border z-10" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filtered.map(booking => {
                                        const uniqueInterviewers = [...new Set(
                                            booking.interviewerSlots?.map(s => s.interviewer?.user ? `${s.interviewer.user.firstName} ${s.interviewer.user.lastName}`.trim() : null).filter(Boolean)
                                        )];
                                        const url = `${window.location.origin}/book/${booking.publicId}`;
                                        const creatorName = booking.createdBy ? `${booking.createdBy.firstName} ${booking.createdBy.lastName || ''}`.trim() : '—';

                                        return (
                                            <tr key={booking._id} className="group hover:bg-muted/30 transition-colors cursor-pointer"
                                                onClick={() => navigate(`/admin/public-bookings/${booking._id}/evaluation`)}>
                                                <td className="px-5 py-3.5 align-middle">
                                                    <p className="text-[12.5px] font-semibold text-foreground">{formatDateTime(booking.createdAt)}</p>
                                                    <p className="text-[11.5px] text-muted-foreground mt-0.5">by {creatorName}</p>
                                                </td>
                                                <td className="px-5 py-3.5 align-middle" onClick={e => e.stopPropagation()}>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-mono text-[11.5px] font-semibold text-foreground border border-border bg-muted/40 px-2 py-0.5 rounded-md">{booking.publicId}</span>
                                                        <button aria-label="Copy link" onClick={() => { navigator.clipboard.writeText(url); showSuccess("Copied!"); }}
                                                            className="h-7 w-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Copy link">
                                                            <Clipboard className="h-3 w-3" aria-hidden="true" />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 align-middle">
                                                    <span className="text-[12.5px] text-foreground/90" title={uniqueInterviewers.join(', ')}>{uniqueInterviewers.length}</span>
                                                </td>
                                                <td className="px-5 py-3.5 align-middle">
                                                    <span className="text-[12.5px] font-semibold text-foreground">{booking.allowedStudents?.length || 0}</span>
                                                </td>
                                                <td className="px-5 py-3.5 align-middle">
                                                    <span className="inline-flex items-center gap-1 h-6 px-2 rounded-full border border-emerald-200 bg-emerald-50/60 text-emerald-700 text-[11.5px] font-semibold">
                                                        <CheckCircle className="h-3 w-3" aria-hidden="true" /> {booking.bookedCount || 0}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 align-middle">
                                                    <span className="inline-flex items-center gap-1 h-6 px-2 rounded-full border border-amber-200 bg-amber-50/60 text-amber-800 text-[11.5px] font-semibold">
                                                        <Clock className="h-3 w-3" aria-hidden="true" /> {booking.pendingCount || 0}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 align-middle" onClick={e => e.stopPropagation()}>
                                                    <div className="flex items-center justify-end gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                                        <button aria-label="Add slots" onClick={() => setAddSlotsModal({ isOpen: true, bookingId: booking._id })}
                                                            className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Add slots">
                                                            <CalendarPlus className="h-3.5 w-3.5" aria-hidden="true" />
                                                        </button>
                                                        <button aria-label="Evaluations" onClick={() => navigate(`/admin/public-bookings/${booking._id}/evaluation`)}
                                                            className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Evaluations">
                                                            <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
                                                        </button>
                                                        <button aria-label="Track" onClick={() => navigate(`/admin/public-bookings/${booking._id}/tracking`)}
                                                            className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Track">
                                                            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                                                        </button>
                                                        <button aria-label="Authorize" onClick={() => navigate(`/admin/public-bookings/${booking._id}/authorize`)}
                                                            className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Authorize">
                                                            <Users className="h-3.5 w-3.5" aria-hidden="true" />
                                                        </button>
                                                        <button aria-label="Delete" onClick={() => setDeleteDialog({ isOpen: true, id: booking._id })}
                                                            className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                                                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                                        </button>
                                                    </div>
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

            {filtered.length > 0 && (
                <div className="px-6 lg:px-8 py-3 border-t border-border bg-white shrink-0">
                    <p className="text-[12px] text-muted-foreground"><span className="font-semibold text-foreground">{filtered.length}</span> of <span className="font-semibold text-foreground">{publicBookings.length}</span> links</p>
                </div>
            )}

            <AddSlotsModal
                isOpen={addSlotsModal.isOpen}
                onClose={() => setAddSlotsModal({ isOpen: false, bookingId: null })}
                publicBookingId={addSlotsModal.bookingId}
                onSuccess={() => invalidatePublicBookings()}
            />

            <ConfirmDialog isOpen={deleteDialog.isOpen} onClose={() => setDeleteDialog({ isOpen: false, id: null })}
                onConfirm={handleDeleteConfirm} title="Delete public link"
                message="All associated student invitations will be lost. This action is permanent." confirmVariant="danger" />
        </div>
    );
};

export default StudentBookings;
