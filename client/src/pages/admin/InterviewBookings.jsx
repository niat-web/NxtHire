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
import { Button } from '@/components/ui/button';

// ─── Inline Dropdown Menu ───────────────────────────────────────────────────
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
        <div className="relative inline-block text-left" ref={menuRef}>
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-transparent text-slate-500 hover:bg-slate-100 focus:outline-none transition-colors"
            >
                <span className="sr-only">Open options</span>
                <MoreVertical className="h-5 w-5" />
            </button>
            {open && (
                <div className="absolute right-0 z-50 mt-1 w-48 rounded-xl bg-white shadow-md ring-1 ring-black/5 focus:outline-none">
                    <div className="py-1">
                        {options.map((option) => (
                            <button
                                key={option.label}
                                type="button"
                                onClick={() => { setOpen(false); option.onClick?.(); }}
                                className={cn(
                                    'group flex items-center w-full px-4 py-2 text-sm transition-colors',
                                    option.isDestructive
                                        ? 'text-red-700 hover:bg-red-50'
                                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                                )}
                            >
                                {option.icon && <option.icon className="mr-3 h-5 w-5 text-slate-400 group-hover:text-slate-500" />}
                                <span>{option.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Stat Card ──────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color = 'blue' }) => {
    const palette = {
        blue:    'bg-blue-50 text-blue-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber:   'bg-amber-50 text-amber-600',
        red:     'bg-red-50 text-red-600',
    };
    return (
        <div className="bg-white px-5 py-3">
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
                <div className={cn('w-7 h-7 rounded-md flex items-center justify-center', palette[color])}>
                    <Icon size={14} />
                </div>
            </div>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{value}</p>
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
            if (b.createdBy) {
                creators.set(b.createdBy._id, `${b.createdBy.firstName} ${b.createdBy.lastName || ''}`.trim());
            }
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

    const { openBookings, closedBookings } = useMemo(() => {
        const sorted = [...filteredBookings].sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
        return {
            openBookings: sorted.filter(b => b.status === 'Open'),
            closedBookings: sorted.filter(b => b.status !== 'Open'),
        };
    }, [filteredBookings]);

    // Stats
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

    const hasFilters = searchTerm || filter || creatorFilter;

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-5 py-3 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="relative w-56">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search by date or creator..."
                            className="w-full pl-9 pr-4 h-9 bg-slate-50 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all" />
                    </div>
                    <select value={creatorFilter} onChange={e => setCreatorFilter(e.target.value)}
                        className="h-9 pl-3 pr-8 bg-white border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 appearance-none cursor-pointer hover:border-slate-300 transition-colors">
                        <option value="">All Creators</option>
                        {creatorOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                    <select value={filter} onChange={e => setFilter(e.target.value)}
                        className="h-9 pl-3 pr-8 bg-white border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 appearance-none cursor-pointer hover:border-slate-300 transition-colors">
                        <option value="">All Statuses</option>
                        <option value="Open">Open</option>
                        <option value="Closed">Closed</option>
                    </select>
                    <div className="flex-1" />
                    <Button onClick={() => navigate('/admin/bookings/new')} className="rounded-md shrink-0">
                        <Plus size={16} className="mr-2" /> New Request
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader size="lg" />
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Inbox className="h-7 w-7 text-slate-300" />
                        </div>
                        <h3 className="text-base font-semibold text-slate-900 mb-1">No Requests Found</h3>
                        <p className="text-sm text-slate-500 mb-5">
                            {hasFilters ? 'No bookings match your filters.' : 'Create your first booking request.'}
                        </p>
                        {hasFilters ? (
                            <Button variant="outline" size="sm" onClick={() => { setSearchTerm(''); setFilter(''); setCreatorFilter(''); }}>
                                Clear filters
                            </Button>
                        ) : (
                            <Button size="sm" onClick={() => navigate('/admin/bookings/new')}>
                                <Plus size={14} className="mr-1.5" /> New Request
                            </Button>
                        )}
                    </div>
                ) : (
                    <div>
                        {/* Stat cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 border-b border-slate-200">
                            <StatCard label="Total Requests" value={bookings.length} icon={Calendar} color="blue" />
                            <StatCard label="Open" value={openBookings.length} icon={Clock} color="amber" />
                            <StatCard label="Interviewers" value={totalInterviewers} icon={Users} color="emerald" />
                            <StatCard label="Submitted" value={totalSubmitted} icon={CheckCircle2} color="emerald" />
                        </div>

                        {/* Tab row: All / Open / Closed */}
                        <div className="flex items-center gap-1 border-b border-slate-200 px-5">
                            {[
                                { id: '', label: 'All', count: filteredBookings.length },
                                { id: 'Open', label: 'Open Requests', count: openBookings.length },
                                { id: 'Closed', label: 'Closed', count: closedBookings.length },
                            ].map(tab => (
                                <button key={tab.id} onClick={() => setFilter(tab.id)}
                                    className={cn(
                                        'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
                                        filter === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-gray-300'
                                    )}>
                                    {tab.label}
                                    <span className={cn(
                                        'ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                                        filter === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                                    )}>{tab.count}</span>
                                </button>
                            ))}
                        </div>

                        {/* Booking cards */}
                        <div className="divide-y divide-slate-100">
                            {(filter === '' ? [...openBookings, ...closedBookings] : filter === 'Open' ? openBookings : closedBookings).map(booking => (
                                <BookingRow key={booking._id} booking={booking}
                                    onEdit={() => navigate(`/admin/bookings/edit/${booking._id}`)}
                                    onDelete={() => setDeleteDialog({ isOpen: true, id: booking._id })}
                                    onTrack={() => navigate(`/admin/interview-bookings/${booking._id}/tracking`)}
                                    onStatusChange={handleStatusChange} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <ConfirmDialog isOpen={deleteDialog.isOpen} onClose={() => setDeleteDialog({ isOpen: false, id: null })}
                onConfirm={handleDelete} title="Delete Booking Request"
                message="This will remove all tracking data associated with this request." confirmVariant="danger" />
        </div>
    );
};

// ─── Booking Row Card ───────────────────────────────────────────────────────
const BookingRow = ({ booking, onEdit, onDelete, onTrack, onStatusChange }) => {
    const total = booking.interviewers.length;
    const available = booking.interviewers.filter(i => i.status === 'Submitted').length;
    const unavailable = booking.interviewers.filter(i => i.status === 'Not Available').length;
    const pending = total - booking.interviewers.filter(i => i.status !== 'Pending').length;
    const progress = total > 0 ? Math.round((total - pending) / total * 100) : 0;
    const isClosed = booking.status === 'Closed';

    const dropdownOptions = [
        isClosed
            ? { label: 'Re-Open', icon: Unlock, onClick: () => onStatusChange(booking._id, 'Open') }
            : { label: 'Close', icon: Lock, onClick: () => onStatusChange(booking._id, 'Closed') },
        { label: 'Edit', icon: Edit2, onClick: onEdit },
        { label: 'Delete', icon: Trash2, isDestructive: true, onClick: onDelete },
    ];

    return (
        <div className={cn(
            'bg-white px-5 py-3 hover:bg-slate-50/60 transition-colors duration-150 flex flex-col md:flex-row md:items-center gap-3',
            isClosed && 'opacity-50'
        )}>
            {/* Date badge */}
            <div className="flex items-center gap-3 md:w-56 shrink-0">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex flex-col items-center justify-center shrink-0 border border-blue-100">
                    <span className="text-[10px] font-bold uppercase leading-none">{new Date(booking.bookingDate).toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-base font-black leading-none">{new Date(booking.bookingDate).getDate()}</span>
                </div>
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                        {formatDate(booking.bookingDate)}
                        {isClosed && <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] uppercase font-bold rounded">Closed</span>}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                        <span className="inline-flex items-center gap-1"><User size={10} />{booking.createdBy?.firstName}</span>
                        {' · '}{formatDateTime(booking.createdAt)}
                    </p>
                </div>
            </div>

            {/* Response stats */}
            <div className="flex items-center gap-1.5 flex-1 justify-start md:justify-center">
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100" title="Available">
                    <CheckCircle2 size={12} /> <span className="text-xs font-semibold">{available}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 text-red-600 border border-red-100" title="Unavailable">
                    <XCircle size={12} /> <span className="text-xs font-semibold">{unavailable}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 text-amber-600 border border-amber-100" title="Pending">
                    <Clock size={12} /> <span className="text-xs font-semibold">{pending}</span>
                </div>
            </div>

            {/* Progress */}
            <div className="w-28 shrink-0 hidden sm:block">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Response</span>
                    <span className={cn('text-xs font-bold', progress === 100 ? 'text-emerald-600' : 'text-blue-600')}>{progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all duration-500', progress === 100 ? 'bg-emerald-500' : 'bg-blue-500')}
                        style={{ width: `${progress}%` }} />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={onTrack} className="rounded-lg">
                    Track <ChevronRight size={13} />
                </Button>
                <InlineDropdownMenu options={dropdownOptions} />
            </div>
        </div>
    );
};

export default InterviewBookings;
