import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { deleteInterviewBooking, updateInterviewBookingStatus } from '@/api/admin.api';
import { useInterviewBookings, useInvalidateAdmin } from '@/hooks/useAdminQueries';
import { useAlert } from '@/hooks/useAlert';
import { formatDate, formatDateTime } from '@/utils/formatters';
import {
    Plus, Search, Filter, Calendar, User, Clock, CheckCircle2,
    XCircle, MoreVertical, ChevronRight, Lock, Unlock, Trash2, Edit2,
    Inbox
} from 'lucide-react';
import DropdownMenu from '@/components/common/DropdownMenu';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-5 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div className="flex flex-col md:flex-row gap-2 flex-1">
                    <div className="relative flex-1 md:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search by date or creator..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all" />
                    </div>
                    <div className="flex gap-2">
                        <select value={creatorFilter} onChange={e => setCreatorFilter(e.target.value)}
                            className="pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 appearance-none cursor-pointer">
                            <option value="">All Creators</option>
                            {creatorOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                        <select value={filter} onChange={e => setFilter(e.target.value)}
                            className="pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 appearance-none cursor-pointer">
                            <option value="">All Statuses</option>
                            <option value="Open">Open</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>
                </div>
                <Button onClick={() => navigate('/admin/bookings/new')}>
                    <Plus size={16} className="mr-2" /> New Request
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <div className="w-8 h-8 border-3 border-gray-200 border-t-slate-700 rounded-full animate-spin mb-3" />
                        <p className="text-sm text-gray-500">Loading requests...</p>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Inbox className="h-10 w-10 text-gray-300 mb-4" />
                        <h3 className="text-base font-semibold text-gray-800 mb-1">No Requests Found</h3>
                        <p className="text-sm text-gray-500 mb-4">No bookings match your filters.</p>
                        <Button variant="link" onClick={() => { setSearchTerm(''); setFilter(''); setCreatorFilter(''); }}>
                            Clear filters
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6 max-w-5xl mx-auto">
                        {/* Open Requests */}
                        {(filter === '' || filter === 'Open') && openBookings.length > 0 && (
                            <div>
                                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
                                    Open Requests
                                    <span className="ml-2 bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{openBookings.length}</span>
                                </h2>
                                <div className="space-y-2">
                                    {openBookings.map(booking => (
                                        <BookingRow key={booking._id} booking={booking}
                                            onEdit={() => navigate(`/admin/bookings/edit/${booking._id}`)}
                                            onDelete={() => setDeleteDialog({ isOpen: true, id: booking._id })}
                                            onTrack={() => navigate(`/admin/interview-bookings/${booking._id}/tracking`)}
                                            onStatusChange={handleStatusChange} />
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* Closed Requests */}
                        {(filter === '' || filter === 'Closed') && closedBookings.length > 0 && (
                            <div>
                                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
                                    Closed
                                    <span className="ml-2 bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{closedBookings.length}</span>
                                </h2>
                                <div className="space-y-2">
                                    {closedBookings.map(booking => (
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
                )}
            </div>

            <ConfirmDialog isOpen={deleteDialog.isOpen} onClose={() => setDeleteDialog({ isOpen: false, id: null })}
                onConfirm={handleDelete} title="Delete Booking Request"
                message="This will remove all tracking data associated with this request." confirmVariant="danger" />
        </div>
    );
};

// ─── Booking Row ─────────────────────────────────────────────────────────────
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
        <div className={cn('bg-white rounded-xl border border-gray-100 p-4 hover:border-gray-300 transition-all flex flex-col md:flex-row md:items-center gap-4', isClosed && 'opacity-60')}>
            {/* Date badge */}
            <div className="flex items-center gap-3 md:w-60 shrink-0">
                <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-lg flex flex-col items-center justify-center shrink-0 border border-indigo-100">
                    <span className="text-xs font-semibold uppercase leading-none">{new Date(booking.bookingDate).toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-base font-black leading-none">{new Date(booking.bookingDate).getDate()}</span>
                </div>
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        {formatDate(booking.bookingDate)}
                        {isClosed && <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-xs uppercase font-semibold rounded">Closed</span>}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                        <span className="inline-flex items-center gap-1"><User size={10} />{booking.createdBy?.firstName}</span>
                        {' · '}
                        {formatDateTime(booking.createdAt)}
                    </p>
                </div>
            </div>

            {/* Response stats */}
            <div className="flex items-center gap-2 flex-1 justify-start md:justify-center">
                <div className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-100" title="Available">
                    <CheckCircle2 size={12} /> <span className="text-xs font-medium">{available}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded bg-red-50 text-red-600 border border-red-100" title="Unavailable">
                    <XCircle size={12} /> <span className="text-xs font-medium">{unavailable}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded bg-amber-50 text-amber-600 border border-amber-100" title="Pending">
                    <Clock size={12} /> <span className="text-xs font-medium">{pending}</span>
                </div>
            </div>

            {/* Progress */}
            <div className="w-28 shrink-0 hidden sm:block">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-400 uppercase">Response</span>
                    <span className={cn('text-xs font-medium', progress === 100 ? 'text-emerald-600' : 'text-indigo-600')}>{progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all', progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500')}
                        style={{ width: `${progress}%` }} />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={onTrack}>
                    Track Responses <ChevronRight size={13} />
                </Button>
                <DropdownMenu options={dropdownOptions} />
            </div>
        </div>
    );
};

export default InterviewBookings;
