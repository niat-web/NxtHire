import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { deleteInterviewBooking, updateInterviewBookingStatus } from '@/api/admin.api';
import { useInterviewBookings, useInvalidateAdmin } from '@/hooks/useAdminQueries';
import { useAlert } from '@/hooks/useAlert';
import { formatDate } from '@/utils/formatters';
import {
    Plus, Search, Calendar, User, Clock, CheckCircle2,
    XCircle, ChevronRight, Lock, Unlock, Trash2, Edit2,
    Inbox, Users, MoreVertical, ChevronDown,
} from 'lucide-react';
import Loader from '@/components/common/Loader';
import { cn } from '@/lib/utils';

const DISPLAY = { fontFamily: 'Fraunces, Georgia, serif' };
const ACCENT = '#FF4800';

// ─── Inline Dropdown ────────────────────────────────────────────────────────
const InlineDropdownMenu = ({ options }) => {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    return (
        <div className="relative inline-block" ref={menuRef}>
            <button
                aria-label="Row actions"
                onClick={() => setOpen(v => !v)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
                <MoreVertical className="h-4 w-4" aria-hidden="true" />
            </button>
            {open && (
                <div className="absolute right-0 z-50 mt-1 w-44 rounded-2xl bg-white shadow-xl border border-slate-200 py-1.5">
                    {options.map((option) => (
                        <button key={option.label} onClick={() => { setOpen(false); option.onClick?.(); }}
                            className={cn('flex items-center gap-2.5 w-full px-4 py-2 text-[13px] font-medium transition-colors',
                                option.isDestructive ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                            )}>
                            {option.icon && <option.icon className="h-3.5 w-3.5" aria-hidden="true" />}
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── Stat chip ──────────────────────────────────────────────────────────────
const StatChip = ({ label, value, icon: Icon }) => (
    <div className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white px-3 h-9">
        <Icon className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
        <span style={DISPLAY} className="text-[15px] font-semibold text-slate-900 leading-none tracking-tight">{value}</span>
        <span className="text-[11.5px] text-slate-500">{label}</span>
    </div>
);

// ─── Main Component ─────────────────────────────────────────────────────────
const InterviewBookings = () => {
    const { showError, showSuccess } = useAlert();
    const navigate = useNavigate();
    const { data: bookings = [], isLoading: loading } = useInterviewBookings();
    const { invalidateBookings } = useInvalidateAdmin();
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });
    const [filter, setFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [creatorFilter, setCreatorFilter] = useState('');

    const creatorOptions = useMemo(() => {
        const creators = new Map();
        bookings.forEach(b => {
            if (b.createdBy) creators.set(b.createdBy._id, `${b.createdBy.firstName} ${b.createdBy.lastName || ''}`.trim());
        });
        return Array.from(creators, ([value, label]) => ({ value, label }));
    }, [bookings]);

    const filteredBookings = useMemo(() =>
        bookings.filter(b => {
            if (filter && b.status !== filter) return false;
            if (creatorFilter && b.createdBy?._id !== creatorFilter) return false;
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                const dateMatch = formatDate(b.bookingDate).toLowerCase().includes(term);
                const creatorMatch = `${b.createdBy?.firstName || ''} ${b.createdBy?.lastName || ''}`.toLowerCase().includes(term);
                if (!dateMatch && !creatorMatch) return false;
            }
            return true;
        }),
    [bookings, filter, searchTerm, creatorFilter]);

    const sorted = useMemo(() => [...filteredBookings].sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)), [filteredBookings]);

    // Stats
    const openCount = useMemo(() => bookings.filter(b => b.status === 'Open').length, [bookings]);
    const totalInterviewers = useMemo(() => bookings.reduce((sum, b) => sum + b.interviewers.length, 0), [bookings]);
    const totalSubmitted = useMemo(() => bookings.reduce((sum, b) => sum + b.interviewers.filter(i => i.status === 'Submitted').length, 0), [bookings]);

    const handleDelete = async () => {
        if (!deleteDialog.id) return;
        try {
            await deleteInterviewBooking(deleteDialog.id);
            showSuccess('Booking deleted.');
            setDeleteDialog({ isOpen: false, id: null });
            invalidateBookings();
        } catch { showError('Failed to delete booking.'); }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await updateInterviewBookingStatus(id, newStatus);
            showSuccess(`Request ${newStatus.toLowerCase()}.`);
            invalidateBookings();
        } catch { showError('Failed to update status.'); }
    };

    const hasFilters = !!(searchTerm || creatorFilter || filter);

    return (
        <div className="h-full flex flex-col bg-[#FAFAF9] overflow-hidden">

            {/* Header — hero + stats + toolbar in one tight slab */}
            <section className="border-b border-slate-200 bg-white px-6 lg:px-8 pt-5 pb-4 shrink-0">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 style={DISPLAY} className="text-[26px] sm:text-[30px] font-semibold text-slate-900 tracking-tight leading-none">
                            Interviewer bookings
                        </h1>
                        <p className="mt-2 text-[13px] text-slate-500">
                            {bookings.length} requests · {openCount} currently open
                        </p>
                    </div>
                    <button onClick={() => navigate('/admin/bookings/new')}
                        className="inline-flex h-10 items-center gap-2 rounded-full bg-slate-900 px-5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#FF4800]">
                        <Plus className="h-4 w-4" aria-hidden="true" /> New request
                    </button>
                </div>

                {/* Stat chips */}
                <div className="flex flex-wrap items-center gap-2 mt-5">
                    <StatChip label="Total" value={bookings.length} icon={Calendar} />
                    <StatChip label="Open" value={openCount} icon={Clock} />
                    <StatChip label="Interviewers" value={totalInterviewers} icon={Users} />
                    <StatChip label="Submitted" value={totalSubmitted} icon={CheckCircle2} />
                </div>

                {/* Toolbar: search + creator + status tabs */}
                <div className="flex flex-wrap items-center gap-2.5 mt-4">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                        <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search date or creator"
                            className="w-full pl-10 pr-3 h-9 bg-white border border-slate-200 rounded-full text-[13px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors" />
                    </div>
                    <div className="relative">
                        <select value={creatorFilter} onChange={e => setCreatorFilter(e.target.value)}
                            className="h-9 pl-4 pr-9 bg-white border border-slate-200 rounded-full text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 appearance-none cursor-pointer transition-colors">
                            <option value="">All creators</option>
                            {creatorOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" aria-hidden="true" />
                    </div>

                    <div className="flex-1" />

                    {/* Status tab group */}
                    <div className="flex items-center bg-slate-100 rounded-full p-0.5">
                        {[
                            { id: '', label: 'All' },
                            { id: 'Open', label: 'Open' },
                            { id: 'Closed', label: 'Closed' },
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setFilter(tab.id)}
                                className={cn(
                                    'px-4 h-8 text-[12px] font-semibold rounded-full transition-colors',
                                    filter === tab.id ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-slate-900'
                                )}>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {hasFilters && (
                        <button onClick={() => { setSearchTerm(''); setCreatorFilter(''); setFilter(''); }}
                            className="text-[12px] text-slate-500 hover:text-slate-900 font-medium px-3 h-8 rounded-full hover:bg-slate-100 transition-colors">
                            Clear
                        </button>
                    )}
                </div>
            </section>

            {/* ── Content ── */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-64"><Loader size="lg" /></div>
                ) : sorted.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <span className="inline-flex items-center justify-center h-12 w-12 rounded-full border border-slate-200 bg-white text-slate-400 mb-4">
                            <Inbox className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <h3 style={DISPLAY} className="text-[20px] font-semibold text-slate-900 tracking-tight">
                            {hasFilters ? 'No bookings match.' : 'No booking requests yet.'}
                        </h3>
                        <p className="mt-1 text-[13px] text-slate-500 max-w-sm">
                            {hasFilters ? 'Try clearing the filters to see the full list.' : 'Create a request to gather availability from your interviewer pool.'}
                        </p>
                        {!hasFilters && (
                            <button onClick={() => navigate('/admin/bookings/new')}
                                className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-slate-900 px-5 text-[13px] font-semibold text-white hover:bg-[#FF4800] transition-colors">
                                <Plus className="h-4 w-4" aria-hidden="true" /> New request
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="px-6 lg:px-8 py-5 space-y-2">
                        {sorted.map(booking => (
                            <BookingRow key={booking._id} booking={booking}
                                onEdit={() => navigate(`/admin/bookings/edit/${booking._id}`)}
                                onDelete={() => setDeleteDialog({ isOpen: true, id: booking._id })}
                                onTrack={() => navigate(`/admin/interview-bookings/${booking._id}/tracking`)}
                                onStatusChange={handleStatusChange} />
                        ))}
                    </div>
                )}
            </div>

            <ConfirmDialog isOpen={deleteDialog.isOpen} onClose={() => setDeleteDialog({ isOpen: false, id: null })}
                onConfirm={handleDelete} title="Delete booking request"
                message="This will remove all tracking data associated with this request." confirmVariant="danger" />
        </div>
    );
};

// ─── Booking Row ────────────────────────────────────────────────────────────
const BookingRow = ({ booking, onEdit, onDelete, onTrack, onStatusChange }) => {
    const total = booking.interviewers.length;
    const available = booking.interviewers.filter(i => i.status === 'Submitted').length;
    const unavailable = booking.interviewers.filter(i => i.status === 'Not Available').length;
    const pending = total - booking.interviewers.filter(i => i.status !== 'Pending').length;
    const progress = total > 0 ? Math.round((total - pending) / total * 100) : 0;
    const isClosed = booking.status === 'Closed';
    const bookingDate = new Date(booking.bookingDate);

    const dropdownOptions = [
        isClosed
            ? { label: 'Re-open', icon: Unlock, onClick: () => onStatusChange(booking._id, 'Open') }
            : { label: 'Close', icon: Lock, onClick: () => onStatusChange(booking._id, 'Closed') },
        { label: 'Edit', icon: Edit2, onClick: onEdit },
        { label: 'Delete', icon: Trash2, isDestructive: true, onClick: onDelete },
    ];

    return (
        <div className={cn(
            'group relative flex items-center gap-5 rounded-2xl border border-slate-200 bg-white px-5 py-4 transition-colors hover:border-slate-900',
            isClosed && 'opacity-60'
        )}>
            {/* Accent stripe on hover */}
            <span
                className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: ACCENT }}
                aria-hidden="true"
            />

            {/* Date block — Fraunces day number */}
            <div className="w-14 shrink-0 text-center">
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em] leading-tight">
                    {bookingDate.toLocaleString('default', { month: 'short' })}
                </div>
                <div style={DISPLAY} className="mt-0.5 text-[24px] font-semibold text-slate-900 leading-none tracking-tight">
                    {bookingDate.getDate()}
                </div>
            </div>

            <div className="w-px self-stretch bg-slate-100" aria-hidden="true" />

            {/* Primary info */}
            <div className="min-w-0 w-52 shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-[13.5px] font-semibold text-slate-900 truncate">{formatDate(booking.bookingDate)}</span>
                    {isClosed && (
                        <span className="inline-flex items-center px-1.5 py-0.5 border border-slate-200 bg-slate-50 text-slate-600 text-[9.5px] uppercase font-semibold tracking-wide rounded-full">
                            Closed
                        </span>
                    )}
                </div>
                <p className="text-[12px] text-slate-500 mt-0.5 flex items-center gap-1 truncate">
                    <User className="h-3 w-3 text-slate-400" aria-hidden="true" />
                    Created by {booking.createdBy?.firstName || 'Admin'}
                </p>
            </div>

            {/* Response counts */}
            <div className="flex items-center gap-2 shrink-0">
                <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border border-emerald-200 bg-emerald-50/60 text-emerald-700 text-[11.5px] font-semibold" title="Available">
                    <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> {available}
                </span>
                <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border border-red-200 bg-red-50 text-red-700 text-[11.5px] font-semibold" title="Unavailable">
                    <XCircle className="h-3 w-3" aria-hidden="true" /> {unavailable}
                </span>
                <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border border-amber-200 bg-amber-50/60 text-amber-800 text-[11.5px] font-semibold" title="Pending">
                    <Clock className="h-3 w-3" aria-hidden="true" /> {pending}
                </span>
            </div>

            {/* Progress — takes remaining space */}
            <div className="flex-1 min-w-[120px] hidden md:block">
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${progress}%`, backgroundColor: progress === 100 ? '#059669' : ACCENT }}
                        />
                    </div>
                    <span className={cn('text-[12px] font-semibold tabular-nums w-10 text-right', progress === 100 ? 'text-emerald-700' : 'text-slate-900')}>
                        {progress}%
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={onTrack}
                    className="inline-flex items-center gap-1 h-8 px-3.5 text-[12px] font-semibold text-slate-900 border border-slate-900 rounded-full bg-white hover:bg-slate-900 hover:text-white transition-colors">
                    Track <ChevronRight className="h-3 w-3" aria-hidden="true" />
                </button>
                <InlineDropdownMenu options={dropdownOptions} />
            </div>
        </div>
    );
};

export default InterviewBookings;
