import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { deleteInterviewBooking, updateInterviewBookingStatus } from '@/api/admin.api';
import { useInterviewBookings, useInvalidateAdmin } from '@/hooks/useAdminQueries';
import { useAlert } from '@/hooks/useAlert';
import { formatDate, formatDateTime } from '@/utils/formatters';
import {
    Plus, Search, Calendar, User, Clock, CheckCircle2,
    XCircle, ChevronRight, Lock, Unlock, Trash2, Edit2,
    Inbox, Users, BarChart3, MoreVertical
} from 'lucide-react';
import Loader from '@/components/common/Loader';
import { cn } from '@/lib/utils';

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
            <button onClick={() => setOpen(v => !v)}
                className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                <MoreVertical className="h-4 w-4" />
            </button>
            {open && (
                <div className="absolute right-0 z-50 mt-1 w-44 rounded-xl bg-white shadow-xl border border-slate-200 py-1 focus:outline-none">
                    {options.map((option) => (
                        <button key={option.label} onClick={() => { setOpen(false); option.onClick?.(); }}
                            className={cn('flex items-center gap-2 w-full px-3 py-2 text-[13px] font-medium transition-colors',
                                option.isDestructive ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-50'
                            )}>
                            {option.icon && <option.icon className="h-4 w-4" />}
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

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

    return (
        <div className="h-full flex flex-col bg-white overflow-hidden">
            {/* ── Toolbar: stats + filters + action ── */}
            <div className="border-b border-slate-200 shrink-0">
                {/* Top row: inline stats + new button */}
                <div className="flex items-center px-5 py-2.5 gap-5 border-b border-slate-100">
                    <div className="flex items-center gap-5 text-[12px]">
                        <div className="flex items-center gap-1.5 text-slate-500">
                            <Calendar size={13} className="text-slate-400" />
                            <span className="font-bold text-slate-900">{bookings.length}</span> Total
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                            <Clock size={13} className="text-amber-500" />
                            <span className="font-bold text-slate-900">{openCount}</span> Open
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                            <Users size={13} className="text-blue-500" />
                            <span className="font-bold text-slate-900">{totalInterviewers}</span> Interviewers
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                            <CheckCircle2 size={13} className="text-emerald-500" />
                            <span className="font-bold text-slate-900">{totalSubmitted}</span> Submitted
                        </div>
                    </div>
                    <div className="flex-1" />
                    <button onClick={() => navigate('/admin/bookings/new')}
                        className="inline-flex items-center gap-2 h-9 px-4 text-[13px] font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shrink-0">
                        <Plus size={15} /> New Request
                    </button>
                </div>

                {/* Bottom row: search + filters + tabs */}
                <div className="flex items-center px-5 py-2 gap-2">
                    <div className="relative w-52">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search..."
                            className="w-full pl-9 pr-3 h-8 bg-slate-50 border border-slate-200 rounded-md text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all" />
                    </div>
                    <select value={creatorFilter} onChange={e => setCreatorFilter(e.target.value)}
                        className="h-8 pl-3 pr-7 bg-white border border-slate-200 rounded-md text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 appearance-none cursor-pointer hover:border-slate-300 transition-colors">
                        <option value="">All Creators</option>
                        {creatorOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                    <div className="flex-1" />
                    {/* Inline tabs */}
                    <div className="flex items-center bg-slate-100 rounded-md p-0.5">
                        {[
                            { id: '', label: 'All' },
                            { id: 'Open', label: 'Open' },
                            { id: 'Closed', label: 'Closed' },
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setFilter(tab.id)}
                                className={cn(
                                    'px-3 py-1 text-[11px] font-semibold rounded transition-all',
                                    filter === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                )}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-64"><Loader size="lg" /></div>
                ) : sorted.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Inbox size={28} className="mb-2 opacity-30" />
                        <p className="text-sm font-medium text-slate-500">{searchTerm || creatorFilter ? 'No bookings match your filters.' : 'No booking requests yet.'}</p>
                        {!searchTerm && !creatorFilter && (
                            <button onClick={() => navigate('/admin/bookings/new')}
                                className="mt-3 inline-flex items-center gap-1.5 px-4 h-9 text-[13px] font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
                                <Plus size={14} /> New Request
                            </button>
                        )}
                    </div>
                ) : (
                    sorted.map(booking => (
                        <BookingRow key={booking._id} booking={booking}
                            onEdit={() => navigate(`/admin/bookings/edit/${booking._id}`)}
                            onDelete={() => setDeleteDialog({ isOpen: true, id: booking._id })}
                            onTrack={() => navigate(`/admin/interview-bookings/${booking._id}/tracking`)}
                            onStatusChange={handleStatusChange} />
                    ))
                )}
            </div>

            <ConfirmDialog isOpen={deleteDialog.isOpen} onClose={() => setDeleteDialog({ isOpen: false, id: null })}
                onConfirm={handleDelete} title="Delete Booking Request"
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
            ? { label: 'Re-Open', icon: Unlock, onClick: () => onStatusChange(booking._id, 'Open') }
            : { label: 'Close', icon: Lock, onClick: () => onStatusChange(booking._id, 'Closed') },
        { label: 'Edit', icon: Edit2, onClick: onEdit },
        { label: 'Delete', icon: Trash2, isDestructive: true, onClick: onDelete },
    ];

    return (
        <div className={cn(
            'flex items-center gap-4 px-5 py-3 border-b border-slate-100 hover:bg-slate-50/50 transition-colors group',
            isClosed && 'opacity-40'
        )}>
            {/* Date pill */}
            <div className="w-11 shrink-0 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase leading-tight">
                    {bookingDate.toLocaleString('default', { month: 'short' })}
                </div>
                <div className="text-lg font-black text-slate-900 leading-tight">
                    {bookingDate.getDate()}
                </div>
            </div>

            {/* Info */}
            <div className="min-w-0 w-44 shrink-0">
                <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-semibold text-slate-900 truncate">{formatDate(booking.bookingDate)}</span>
                    {isClosed && <span className="px-1.5 py-px bg-slate-200 text-slate-500 text-[9px] uppercase font-bold rounded">Closed</span>}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1 truncate">
                    <User size={10} className="shrink-0" /> {booking.createdBy?.firstName || 'Admin'}
                </p>
            </div>

            {/* Response counts — compact inline */}
            <div className="flex items-center gap-3 text-[11px] shrink-0">
                <span className="flex items-center gap-1 text-emerald-600" title="Available">
                    <CheckCircle2 size={12} /> {available}
                </span>
                <span className="flex items-center gap-1 text-red-500" title="Unavailable">
                    <XCircle size={12} /> {unavailable}
                </span>
                <span className="flex items-center gap-1 text-amber-500" title="Pending">
                    <Clock size={12} /> {pending}
                </span>
            </div>

            {/* Progress bar */}
            <div className="flex-1 max-w-[160px] hidden md:block">
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full transition-all duration-500', progress === 100 ? 'bg-emerald-500' : 'bg-blue-500')}
                            style={{ width: `${progress}%` }} />
                    </div>
                    <span className={cn('text-[11px] font-bold w-8 text-right', progress === 100 ? 'text-emerald-600' : 'text-blue-600')}>
                        {progress}%
                    </span>
                </div>
            </div>

            <div className="flex-1" />

            {/* Actions */}
            <div className="flex items-center gap-1.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                <button onClick={onTrack}
                    className="inline-flex items-center gap-1 h-7 px-3 text-[11px] font-medium text-slate-700 border border-slate-200 rounded-md bg-white hover:bg-slate-50 transition-colors">
                    Track <ChevronRight size={12} />
                </button>
                <InlineDropdownMenu options={dropdownOptions} />
            </div>
        </div>
    );
};

export default InterviewBookings;
