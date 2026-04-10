import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { deleteInterviewBooking, updateInterviewBookingStatus } from '@/api/admin.api';
import { useInterviewBookings, useInvalidateAdmin } from '@/hooks/useAdminQueries';
import { useAlert } from '@/hooks/useAlert';
import { formatDate, formatDateTime } from '@/utils/formatters';
import {
    Plus, Search, Calendar, User, Clock, CheckCircle2,
    XCircle, ChevronRight, Lock, Unlock, Trash2, Edit2,
    Inbox, Users, BarChart3
} from 'lucide-react';
import DropdownMenu from '@/components/common/DropdownMenu';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// ─── Stat Card ──────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color = 'indigo' }) => {
    const palette = {
        indigo:  'bg-indigo-50 text-indigo-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber:   'bg-amber-50 text-amber-600',
        red:     'bg-red-50 text-red-600',
    };
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', palette[color])}>
                    <Icon size={16} />
                </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
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
            <div className="bg-white border-b border-gray-200 px-6 py-4 shrink-0 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex flex-col md:flex-row gap-2 flex-1">
                        <div className="relative flex-1 md:max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Search by date or creator..."
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-gray-400 transition-all" />
                        </div>
                        <div className="flex gap-2">
                            <select value={creatorFilter} onChange={e => setCreatorFilter(e.target.value)}
                                className="pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer hover:border-gray-300 transition-colors">
                                <option value="">All Creators</option>
                                {creatorOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                            <select value={filter} onChange={e => setFilter(e.target.value)}
                                className="pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer hover:border-gray-300 transition-colors">
                                <option value="">All Statuses</option>
                                <option value="Open">Open</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>
                    </div>
                    <Button onClick={() => navigate('/admin/bookings/new')} className="rounded-lg">
                        <Plus size={16} className="mr-2" /> New Request
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mb-3" />
                        <p className="text-sm text-gray-500">Loading requests...</p>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Inbox className="h-7 w-7 text-gray-300" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">No Requests Found</h3>
                        <p className="text-sm text-gray-500 mb-5">
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
                    <div className="p-6 space-y-5">
                        {/* Stat cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <StatCard label="Total Requests" value={bookings.length} icon={Calendar} color="indigo" />
                            <StatCard label="Open" value={openBookings.length} icon={Clock} color="amber" />
                            <StatCard label="Interviewers" value={totalInterviewers} icon={Users} color="emerald" />
                            <StatCard label="Submitted" value={totalSubmitted} icon={CheckCircle2} color="emerald" />
                        </div>

                        {/* Tab row: All / Open / Closed */}
                        <div className="flex items-center gap-1 border-b border-gray-200">
                            {[
                                { id: '', label: 'All', count: filteredBookings.length },
                                { id: 'Open', label: 'Open Requests', count: openBookings.length },
                                { id: 'Closed', label: 'Closed', count: closedBookings.length },
                            ].map(tab => (
                                <button key={tab.id} onClick={() => setFilter(tab.id)}
                                    className={cn(
                                        'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
                                        filter === tab.id
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    )}>
                                    {tab.label}
                                    <span className={cn(
                                        'ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                                        filter === tab.id ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
                                    )}>{tab.count}</span>
                                </button>
                            ))}
                        </div>

                        {/* Booking cards */}
                        <div className="space-y-2">
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
            'bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 flex flex-col md:flex-row md:items-center gap-4',
            isClosed && 'opacity-50'
        )}>
            {/* Date badge */}
            <div className="flex items-center gap-3 md:w-56 shrink-0">
                <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex flex-col items-center justify-center shrink-0 border border-indigo-100">
                    <span className="text-[10px] font-bold uppercase leading-none">{new Date(booking.bookingDate).toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-base font-black leading-none">{new Date(booking.bookingDate).getDate()}</span>
                </div>
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        {formatDate(booking.bookingDate)}
                        {isClosed && <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] uppercase font-bold rounded">Closed</span>}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
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
                    <span className="text-[10px] font-semibold text-gray-400 uppercase">Response</span>
                    <span className={cn('text-xs font-bold', progress === 100 ? 'text-emerald-600' : 'text-indigo-600')}>{progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all duration-500', progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500')}
                        style={{ width: `${progress}%` }} />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={onTrack} className="rounded-lg">
                    Track <ChevronRight size={13} />
                </Button>
                <DropdownMenu options={dropdownOptions} />
            </div>
        </div>
    );
};

export default InterviewBookings;
