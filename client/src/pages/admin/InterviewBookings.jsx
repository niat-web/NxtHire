import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { getInterviewBookings, deleteInterviewBooking, updateInterviewBookingStatus } from '@/api/admin.api';
import { useAlert } from '@/hooks/useAlert';
import { formatDate, formatDateTime } from '@/utils/formatters';
import {
    Plus, Search, Filter, Calendar, User, Clock, CheckCircle2,
    XCircle, MoreVertical, ChevronRight, Lock, Unlock, Trash2, Edit2,
    Inbox, RefreshCw
} from 'lucide-react';
import DropdownMenu from '@/components/common/DropdownMenu';

// Simplified Header with cleaner filters
const Header = ({ onAdd, filter, onFilterChange, searchTerm, onSearchChange, totalBookings, creatorOptions, creatorFilter, onCreatorChange }) => (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-3 flex-1">
                <div className="relative flex-1 md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={onSearchChange}
                        placeholder="Search by date or creator..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    <div className="relative min-w-[140px]">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        <select
                            value={creatorFilter}
                            onChange={onCreatorChange}
                            className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer hover:bg-slate-50 transition-colors"
                        >
                            <option value="">All Creators</option>
                            {creatorOptions.map((creator) => (
                                <option key={creator.value} value={creator.value}>{creator.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="relative min-w-[140px]">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        <select
                            value={filter}
                            onChange={onFilterChange}
                            className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer hover:bg-slate-50 transition-colors"
                        >
                            <option value="">All Statuses</option>
                            <option value="Open">Open</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>
                </div>
            </div>

            <button
                onClick={onAdd}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-200 transition-all hover:shadow-md hover:shadow-blue-300 active:scale-95 whitespace-nowrap"
            >
                <Plus size={18} />
                New Request
            </button>
        </div>
    </div>
);

const EmptyState = ({ message, onAction, actionText }) => (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
            <Inbox className="h-10 w-10 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">No Requests Found</h3>
        <p className="text-slate-500 max-w-sm mb-8">{message}</p>
        {onAction && actionText && (
            <button
                onClick={onAction}
                className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-colors"
            >
                <RefreshCw size={16} />
                {actionText}
            </button>
        )}
    </div>
);

// Clean Status Badge Component
const StatusPill = ({ icon: Icon, count, color, label }) => (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${color} border border-current/10`} title={label}>
        <Icon size={14} className="opacity-70" />
        <span className="text-xs font-bold">{count}</span>
    </div>
);

const BookingCard = ({ booking, onEdit, onDelete, onTrack, onStatusChange }) => {
    const totalInterviewers = booking.interviewers.length;
    const submittedCount = booking.interviewers.filter(i => i.status !== 'Pending').length;
    const availableCount = booking.interviewers.filter(i => i.status === 'Submitted').length;
    const unavailableCount = booking.interviewers.filter(i => i.status === 'Not Available').length;
    const pendingCount = totalInterviewers - submittedCount;

    // Calculate progress percentage
    const progress = totalInterviewers > 0 ? (submittedCount / totalInterviewers) * 100 : 0;

    const dropdownOptions = [
        booking.status === 'Open'
            ? { label: 'Close Request', icon: Lock, onClick: () => onStatusChange(booking._id, 'Closed') }
            : { label: 'Re-Open Request', icon: Unlock, onClick: () => onStatusChange(booking._id, 'Open') },
        { label: 'Edit Details', icon: Edit2, onClick: onEdit },
        { label: 'Delete Request', icon: Trash2, isDestructive: true, onClick: onDelete }
    ];

    return (
        <div className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left: Date & Creator */}
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex flex-col items-center justify-center border border-blue-100">
                        <span className="text-xs font-bold uppercase">{new Date(booking.bookingDate).toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-lg font-black leading-none">{new Date(booking.bookingDate).getDate()}</span>
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                            {formatDate(booking.bookingDate)}
                            {booking.status === 'Closed' && (
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] uppercase font-bold rounded-full border border-slate-200">Closed</span>
                            )}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                                <User size={12} />
                                {booking.createdBy.firstName}
                            </span>
                            <span>•</span>
                            <span>Created {formatDateTime(booking.createdAt)}</span>
                        </div>
                    </div>
                </div>

                {/* Middle: Stats & Progress */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-8 flex-1 md:justify-center">
                    <div className="flex items-center gap-2">
                        <StatusPill icon={CheckCircle2} count={availableCount} color="bg-green-50 text-green-700" label="Available" />
                        <StatusPill icon={XCircle} count={unavailableCount} color="bg-red-50 text-red-700" label="Not Available" />
                        <StatusPill icon={Clock} count={pendingCount} color="bg-amber-50 text-amber-700" label="Pending" />
                    </div>

                    <div className="w-full sm:w-32 md:w-40">
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Response</span>
                            <span className="text-[10px] font-bold text-blue-600">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center justify-end gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-slate-50 mt-2 md:mt-0">
                    <button
                        onClick={onTrack}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 text-xs font-bold rounded-lg transition-colors"
                    >
                        Track Responses
                        <ChevronRight size={14} />
                    </button>
                    <div className="relative">
                        <DropdownMenu options={dropdownOptions} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const InterviewBookings = () => {
    const { showError, showSuccess } = useAlert();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState([]);
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });
    const [filter, setFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [creatorFilter, setCreatorFilter] = useState('');

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getInterviewBookings();
            setBookings(res.data.data);
        } catch (err) {
            showError("Failed to fetch interview bookings.");
        } finally {
            setLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const creatorOptions = useMemo(() => {
        const creators = new Map();
        bookings.forEach(booking => {
            if (booking.createdBy) {
                const name = `${booking.createdBy.firstName} ${booking.createdBy.lastName || ''}`.trim();
                creators.set(booking.createdBy._id, name);
            }
        });
        return Array.from(creators, ([value, label]) => ({ value, label }));
    }, [bookings]);

    const filteredBookings = useMemo(() => {
        return bookings.filter(booking => {
            const filterMatch = !filter || booking.status === filter;
            const searchMatch = !searchTerm ||
                formatDate(booking.bookingDate).toLowerCase().includes(searchTerm.toLowerCase()) ||
                (booking.createdBy && `${booking.createdBy.firstName} ${booking.createdBy.lastName || ''}`.trim().toLowerCase().includes(searchTerm.toLowerCase()));
            const creatorMatch = !creatorFilter || booking.createdBy?._id === creatorFilter;

            return filterMatch && searchMatch && creatorMatch;
        });
    }, [bookings, filter, searchTerm, creatorFilter]);

    const { openBookings, closedBookings } = useMemo(() => {
        const open = [];
        const closed = [];
        const sortedBookings = [...filteredBookings].sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
        sortedBookings.forEach(b => (b.status === 'Open' ? open.push(b) : closed.push(b)));
        return { openBookings: open, closedBookings: closed };
    }, [filteredBookings]);

    const handleDelete = async () => {
        if (!deleteDialog.id) return;
        try {
            await deleteInterviewBooking(deleteDialog.id);
            showSuccess('Booking deleted successfully!');
            setDeleteDialog({ isOpen: false, id: null });
            fetchBookings();
        } catch (err) {
            showError('Failed to delete booking.');
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const response = await updateInterviewBookingStatus(id, newStatus);
            const updatedBooking = response.data.data;
            setBookings(prevBookings =>
                prevBookings.map(booking =>
                    booking._id === id ? updatedBooking : booking
                )
            );
            showSuccess(`Request has been ${newStatus.toLowerCase()}.`);
        } catch (err) {
            showError('Failed to update request status.');
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-50">
            <Header
                onAdd={() => navigate('/admin/bookings/new')}
                filter={filter}
                onFilterChange={(e) => setFilter(e.target.value)}
                searchTerm={searchTerm}
                onSearchChange={(e) => setSearchTerm(e.target.value)}
                totalBookings={filteredBookings.length}
                creatorOptions={creatorOptions}
                creatorFilter={creatorFilter}
                onCreatorChange={(e) => setCreatorFilter(e.target.value)}
            />

            <div className="flex-1 overflow-y-auto px-6 py-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-500 font-medium">Loading requests...</p>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <EmptyState
                        message="No bookings found matching your current filters."
                        onAction={() => {
                            setSearchTerm('');
                            setFilter('');
                            setCreatorFilter('');
                        }}
                        actionText="Clear All Filters"
                    />
                ) : (
                    <div className="max-w-5xl mx-auto space-y-10">
                        {(filter === '' || filter === 'Open') && openBookings.length > 0 && (
                            <div className="space-y-4">
                                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-1">
                                    Open Requests <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">{openBookings.length}</span>
                                </h2>
                                {openBookings.map(booking => (
                                    <BookingCard
                                        key={booking._id}
                                        booking={booking}
                                        onEdit={() => navigate(`/admin/bookings/edit/${booking._id}`)}
                                        onDelete={() => setDeleteDialog({ isOpen: true, id: booking._id })}
                                        onTrack={() => navigate(`/admin/interview-bookings/${booking._id}/tracking`)}
                                        onStatusChange={handleStatusChange}
                                    />
                                ))}
                            </div>
                        )}

                        {(filter === '' || filter === 'Closed') && closedBookings.length > 0 && (
                            <div className="space-y-4">
                                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-1">
                                    Completed & Closed <span className="ml-2 bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs">{closedBookings.length}</span>
                                </h2>
                                {closedBookings.map(booking => (
                                    <BookingCard
                                        key={booking._id}
                                        booking={booking}
                                        onEdit={() => navigate(`/admin/bookings/edit/${booking._id}`)}
                                        onDelete={() => setDeleteDialog({ isOpen: true, id: booking._id })}
                                        onTrack={() => navigate(`/admin/interview-bookings/${booking._id}/tracking`)}
                                        onStatusChange={handleStatusChange}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, id: null })}
                onConfirm={handleDelete}
                title="Delete Booking Request"
                message="Are you sure you want to delete this request? This will remove all tracking data associated with it."
                confirmVariant="danger"
            />
        </div>
    );
};

export default InterviewBookings;
