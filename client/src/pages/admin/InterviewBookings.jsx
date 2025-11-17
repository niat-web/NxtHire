import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { getInterviewBookings, deleteInterviewBooking, updateInterviewBookingStatus } from '@/api/admin.api';
import { useAlert } from '@/hooks/useAlert';
import { formatDate, formatDateTime } from '@/utils/formatters';
import { FiPlus, FiEdit, FiTrash2, FiClock, FiCheckCircle, FiXCircle, FiInbox, FiFilter, FiSearch, FiChevronRight, FiLock, FiUnlock, FiChevronDown } from 'react-icons/fi';
import DropdownMenu from '@/components/common/DropdownMenu';


const Header = ({ onAdd, filter, onFilterChange, searchTerm, onSearchChange, totalBookings, creatorOptions, creatorFilter, onCreatorChange }) => (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 border-b border-gray-200 bg-white">
        <div>
            <h1 className="text-xl font-bold text-gray-800">Interviewer Booking Requests ({totalBookings})</h1>
            <p className="text-sm text-gray-500">{totalBookings} links found</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
            <div className="relative w-full md:w-auto">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                    type="text"
                    onChange={onSearchChange}
                    placeholder="Search by date, creator..."
                    className="w-full md:w-48 pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                />
            </div>
            <div className="relative w-full md:w-auto">
                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <select
                    value={creatorFilter}
                    onChange={onCreatorChange}
                    className="w-full md:w-48 appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                    <option value="">All Creators</option>
                    {creatorOptions.map((creator) => (
                        <option key={creator.value} value={creator.value}>{creator.label}</option>
                    ))}
                </select>
            </div>
            <select value={filter} onChange={onFilterChange} className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500" aria-label="Filter by status">
                <option key="all" value="">All Statuses</option>
                <option key="open" value="Open">Open</option>
                <option key="closed" value="Closed">Closed</option>
            </select>
            <button onClick={onAdd} className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors">
                <FiPlus size={16} /> New Request
            </button>
        </div>
    </div>
);

const EmptyState = ({ message, onAction, actionText }) => (
    <div className="text-center py-16 bg-white rounded-lg border border-dashed">
        <FiInbox className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="font-semibold text-gray-800">No Booking Requests</h3>
        <p className="text-sm text-gray-500">{message}</p>
        {onAction && actionText && (
             <button onClick={onAction} className="mt-6 flex items-center justify-center gap-2 mx-auto px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors">
                <FiPlus size={16} /> {actionText}
            </button>
        )}
    </div>
);

const StatusBreakdown = ({ available, unavailable, pending }) => (
    <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5" title={`${available} Available`}>
            <FiCheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-semibold text-gray-700">{available}</span>
        </div>
        <div className="flex items-center gap-1.5" title={`${unavailable} Not Available`}>
            <FiXCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm font-semibold text-gray-700">{unavailable}</span>
        </div>
        <div className="flex items-center gap-1.5" title={`${pending} Pending`}>
            <FiClock className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-semibold text-gray-700">{pending}</span>
        </div>
    </div>
);

const BookingRow = ({ booking, onEdit, onDelete, onTrack, onStatusChange }) => {
    const totalInterviewers = booking.interviewers.length;
    const submittedCount = booking.interviewers.filter(i => i.status !== 'Pending').length;
    const availableCount = booking.interviewers.filter(i => i.status === 'Submitted').length;
    const unavailableCount = booking.interviewers.filter(i => i.status === 'Not Available').length;
    const pendingCount = totalInterviewers - submittedCount;
    const progress = totalInterviewers > 0 ? (submittedCount / totalInterviewers) * 100 : 0;
    
    const dropdownOptions = [
        booking.status === 'Open'
            ? { label: 'Close Request', icon: FiLock, onClick: () => onStatusChange(booking._id, 'Closed') }
            : { label: 'Re-Open Request', icon: FiUnlock, onClick: () => onStatusChange(booking._id, 'Open') },
        { label: 'Edit', icon: FiEdit, onClick: onEdit },
        { label: 'Delete', icon: FiTrash2, isDestructive: true, onClick: onDelete }
    ];
    
    return (
        <div
            className="grid grid-cols-12 gap-x-4 gap-y-2 items-center bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-300"
        >
            {/* Column 1: Booking Date */}
            <div className="col-span-12 md:col-span-2">
                <p className="font-bold text-gray-800 text-base whitespace-nowrap">{formatDate(booking.bookingDate)}</p>
            </div>
            
            {/* Column 2: Status Breakdown */}
            <div className="col-span-12 sm:col-span-4 md:col-span-3">
                <StatusBreakdown available={availableCount} unavailable={unavailableCount} pending={pendingCount} />
            </div>

            {/* Column 3: Right Aligned Group */}
            <div className="col-span-12 sm:col-span-8 md:col-span-7 flex flex-col md:flex-row items-center justify-end gap-x-4 gap-y-3 w-full">
                <div className="w-full md:w-auto text-left md:text-right">
                    <p className="text-xs text-gray-500 truncate" title={`by ${booking.createdBy.firstName} on ${formatDateTime(booking.createdAt)}`}>
                        by {booking.createdBy.firstName} on {formatDateTime(booking.createdAt)}
                    </p>
                </div>
                
                <div className="min-w-[150px]">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-600">Response Progress</span>
                        <span className="text-xs font-bold text-blue-800">{submittedCount}/{totalInterviewers}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
                 
                <div className="flex items-center justify-end gap-1">
                     <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${booking.status === 'Open' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                        {booking.status}
                    </span>
                    <button onClick={onTrack} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap">
                        Track <FiChevronRight size={14} />
                    </button>
                    <DropdownMenu options={dropdownOptions} />
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
        <div className="h-full flex flex-col">
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

            <div className="flex-1 overflow-y-auto p-4 space-y-8 bg-gray-50">
                {loading ? <div className="text-center p-12 text-gray-500">Loading...</div> : 
                    filteredBookings.length === 0 ? (
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
                    <>
                        {(filter === '' || filter === 'Open') && (
                            <div>
                                <h2 className="text-lg font-semibold text-gray-700 mb-3 px-2">Open Requests ({openBookings.length})</h2>
                                {openBookings.length > 0 ? (
                                    <div className="space-y-4">
                                        {openBookings.map(booking => (
                                            <BookingRow
                                                key={booking._id} 
                                                booking={booking} 
                                                onEdit={() => navigate(`/admin/bookings/edit/${booking._id}`)}
                                                onDelete={() => setDeleteDialog({ isOpen: true, id: booking._id })}
                                                onTrack={() => navigate(`/admin/interview-bookings/${booking._id}/tracking`)}
                                                onStatusChange={handleStatusChange}
                                            />
                                        ))}
                                    </div>
                                ) : <p className="p-4 text-center text-sm text-gray-500">No open requests found.</p>}
                            </div>
                        )}
                        
                        {(filter === '' || filter === 'Closed') && (
                            <div>
                                <h2 className="text-lg font-semibold text-gray-700 mb-3 px-2">Completed & Closed ({closedBookings.length})</h2>
                                {closedBookings.length > 0 ? (
                                    <div className="space-y-4">
                                        {closedBookings.map(booking => (
                                             <BookingRow
                                                key={booking._id} 
                                                booking={booking} 
                                                onEdit={() => navigate(`/admin/bookings/edit/${booking._id}`)}
                                                onDelete={() => setDeleteDialog({ isOpen: true, id: booking._id })}
                                                onTrack={() => navigate(`/admin/interview-bookings/${booking._id}/tracking`)}
                                                onStatusChange={handleStatusChange}
                                            />
                                        ))}
                                    </div>
                                 ) : <p className="p-4 text-center text-sm text-gray-500">No closed requests found.</p>}
                            </div>
                        )}
                    </>
                )}
            </div>

            <ConfirmDialog 
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, id: null })}
                onConfirm={handleDelete}
                title="Delete Booking"
                message="Are you sure you want to delete this booking request? This action is permanent and cannot be undone."
                confirmVariant="danger"
            />
        </div>
    );
};

export default InterviewBookings;
