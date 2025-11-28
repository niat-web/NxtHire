// client/src/pages/admin/StudentBookings.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiEye,
    FiInfo,
    FiLink,
    FiUsers,
    FiClipboard,
    FiSearch,
    FiChevronDown,
    FiPlus,
    FiCheckCircle,
    FiClock,
    FiTrash2,
    FiCalendar,
    FiFilter,
    FiUser
} from 'react-icons/fi';
import { getPublicBookings, deletePublicBookingLink } from '@/api/admin.api';
import { useAlert } from '@/hooks/useAlert';
import { formatDateTime } from '@/utils/formatters';
import ConfirmDialog from '@/components/common/ConfirmDialog';

// ---------- Reusable Button (Same as AuthorizeStudentsPage for consistency) ----------
const LocalButton = ({
    children,
    onClick,
    type = 'button',
    isLoading = false,
    variant = 'primary',
    icon: Icon,
    disabled = false,
    size = 'md',
    className = '',
    title = '',
}) => {
    const base =
        'inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

    const sizes = {
        xs: 'text-xs px-2 py-1 rounded-md',
        sm: 'text-xs px-3 py-1.5 rounded-lg',
        md: 'text-sm px-5 py-2.5 rounded-xl',
        lg: 'text-base px-6 py-3 rounded-xl',
        icon: 'p-2 rounded-lg',
    };

    const variants = {
        primary:
            'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 hover:from-blue-700 hover:to-blue-800 border border-transparent',
        outline:
            'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm',
        subtle:
            'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-transparent',
        danger:
            'bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 shadow-sm',
        ghost:
            'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={isLoading || disabled}
            className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
            title={title}
        >
            {isLoading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing...</span>
                </>
            ) : (
                <>
                    {Icon && <Icon className={`${children ? 'mr-2' : ''} ${size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />}
                    {children}
                </>
            )}
        </button>
    );
};

const StatusBadge = ({ count, icon: Icon, colorClass, label }) => (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${colorClass}`}>
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs font-semibold">{count}</span>
        <span className="text-xs opacity-80 hidden sm:inline">{label}</span>
    </div>
);

const StudentBookings = () => {
    const { showSuccess, showError } = useAlert();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [publicBookings, setPublicBookings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('newest');
    const [creatorFilter, setCreatorFilter] = useState('');
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });

    const fetchPublicBookings = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getPublicBookings();
            setPublicBookings(response.data.data);
        } catch (err) {
            showError("Failed to fetch public booking links.");
        } finally {
            setLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        fetchPublicBookings();
    }, [fetchPublicBookings]);

    const creatorOptions = useMemo(() => {
        const creators = new Map();
        publicBookings.forEach(booking => {
            if (booking.createdBy) {
                const name = `${booking.createdBy.firstName} ${booking.createdBy.lastName || ''}`.trim();
                creators.set(booking.createdBy._id, name);
            }
        });
        return Array.from(creators, ([value, label]) => ({ value, label }));
    }, [publicBookings]);

    const filteredAndSortedBookings = useMemo(() => {
        let items = [...publicBookings];

        if (searchTerm) {
            items = items.filter(b => b.publicId.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        if (creatorFilter) {
            items = items.filter(b => b.createdBy?._id === creatorFilter);
        }

        switch (sortOption) {
            case 'oldest':
                items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'most_students':
                items.sort((a, b) => (b.allowedStudents?.length || 0) - (a.allowedStudents?.length || 0));
                break;
            case 'fewest_students':
                items.sort((a, b) => (a.allowedStudents?.length || 0) - (b.allowedStudents?.length || 0));
                break;
            case 'newest':
            default:
                items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return items;
    }, [publicBookings, searchTerm, sortOption, creatorFilter]);

    const handleDeleteRequest = (id) => {
        setDeleteDialog({ isOpen: true, id });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteDialog.id) return;
        try {
            await deletePublicBookingLink(deleteDialog.id);
            showSuccess('Public booking link deleted successfully!');
            fetchPublicBookings();
        } catch (err) {
            showError("Failed to delete the link.");
        } finally {
            setDeleteDialog({ isOpen: false, id: null });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
                    <p className="text-slate-500 font-medium animate-pulse">Loading links...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex flex-col bg-slate-50/50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 shadow-sm">
                <div className="max-w-[1600px] mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Manage Public Links</h1>
                    </div>
                    <LocalButton
                        onClick={() => navigate('/admin/bookings/booking-slots')}
                        icon={FiPlus}
                        variant="primary"
                        className="w-full sm:w-auto shadow-blue-600/20"
                    >
                        New Link
                    </LocalButton>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                <div className="h-full max-w-[1600px] mx-auto p-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">

                        {/* Toolbar */}
                        <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row items-center justify-between gap-4 bg-white">
                            <div className="relative flex-1 w-full lg:max-w-md">
                                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by Public ID..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                                <div className="relative w-full sm:w-48">
                                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                                    <select
                                        value={creatorFilter}
                                        onChange={(e) => setCreatorFilter(e.target.value)}
                                        className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                                    >
                                        <option value="">All Creators</option>
                                        {creatorOptions.map(creator => (
                                            <option key={creator.value} value={creator.value}>{creator.label}</option>
                                        ))}
                                    </select>
                                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 pointer-events-none" />
                                </div>

                                <div className="relative w-full sm:w-48">
                                    <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                                    <select
                                        value={sortOption}
                                        onChange={(e) => setSortOption(e.target.value)}
                                        className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                                    >
                                        <option value="newest">Newest First</option>
                                        <option value="oldest">Oldest First</option>
                                        <option value="most_students">Most Students</option>
                                        <option value="fewest_students">Fewest Students</option>
                                    </select>
                                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="flex-1 overflow-auto relative">
                            {filteredAndSortedBookings.length === 0 ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                                    <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                        <FiLink className="h-8 w-8 text-slate-300" />
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-900 mb-1">No links found</h3>
                                    <p className="text-slate-500 max-w-xs mx-auto">
                                        {publicBookings.length === 0
                                            ? "Create your first public booking link to get started."
                                            : "No links match your current search filters."}
                                    </p>
                                    {publicBookings.length === 0 && (
                                        <LocalButton
                                            onClick={() => navigate('/admin/bookings/booking-slots')}
                                            icon={FiPlus}
                                            variant="primary"
                                            className="mt-6"
                                        >
                                            Create Link
                                        </LocalButton>
                                    )}
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                                            <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Public Link</th>
                                            <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</th>
                                            <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredAndSortedBookings.map((booking) => {
                                            const uniqueInterviewers = [...new Set(
                                                booking.interviewerSlots
                                                    .map(slot => slot.interviewer?.user ? `${slot.interviewer.user.firstName} ${slot.interviewer.user.lastName}`.trim() : 'Unknown')
                                                    .filter(Boolean)
                                            )];
                                            const url = `${window.location.origin}/book/${booking.publicId}`;
                                            const creatorName = booking.createdBy ? `${booking.createdBy.firstName} ${booking.createdBy.lastName || ''}`.trim() : 'N/A';

                                            return (
                                                <tr key={booking._id} className="group hover:bg-slate-50 transition-colors">
                                                    <td className="py-4 px-6">
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                                                                <FiCalendar className="text-slate-400 h-3.5 w-3.5" />
                                                                {formatDateTime(booking.createdAt)}
                                                            </div>
                                                            <div className="text-xs text-slate-500 mt-1 pl-5.5">
                                                                by {creatorName}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-2">
                                                            <a
                                                                href={url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="font-mono text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                                                            >
                                                                {booking.publicId}
                                                            </a>
                                                            <button
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(url);
                                                                    showSuccess("Public link copied!");
                                                                }}
                                                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                                title="Copy Link"
                                                            >
                                                                <FiClipboard className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-xs text-slate-500 uppercase tracking-wide">Assigned</span>
                                                                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700" title={uniqueInterviewers.join(', ')}>
                                                                    <FiUsers className="h-4 w-4 text-slate-400" />
                                                                    {uniqueInterviewers.length}
                                                                </div>
                                                            </div>
                                                            <div className="w-px h-8 bg-slate-200" />
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-xs text-slate-500 uppercase tracking-wide">Students</span>
                                                                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                                                                    <FiUsers className="h-4 w-4 text-slate-400" />
                                                                    {booking.allowedStudents?.length || 0}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex flex-col gap-2">
                                                            <StatusBadge
                                                                count={booking.bookedCount}
                                                                icon={FiCheckCircle}
                                                                colorClass="bg-green-50 text-green-700 border-green-100"
                                                                label="Booked"
                                                            />
                                                            <StatusBadge
                                                                count={booking.pendingCount}
                                                                icon={FiClock}
                                                                colorClass="bg-yellow-50 text-yellow-700 border-yellow-100"
                                                                label="Pending"
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <LocalButton
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => navigate(`/admin/public-bookings/${booking._id}/tracking`)}
                                                                title="Track Progress"
                                                            >
                                                                <FiEye className="h-4 w-4" />
                                                            </LocalButton>
                                                            <LocalButton
                                                                variant="primary"
                                                                size="icon"
                                                                onClick={() => navigate(`/admin/public-bookings/${booking._id}/authorize`)}
                                                                title="Authorize Students"
                                                                className="shadow-none"
                                                            >
                                                                <FiUsers className="h-4 w-4" />
                                                            </LocalButton>
                                                            <LocalButton
                                                                variant="danger"
                                                                size="icon"
                                                                onClick={() => handleDeleteRequest(booking._id)}
                                                                title="Delete Link"
                                                            >
                                                                <FiTrash2 className="h-4 w-4" />
                                                            </LocalButton>
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
                        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                            <div className="text-sm text-slate-500 font-medium">
                                Showing {filteredAndSortedBookings.length} links
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, id: null })}
                onConfirm={handleDeleteConfirm}
                title="Delete Public Link"
                message="Are you sure you want to delete this public booking link? All associated student invitations and bookings will be lost. This action is permanent."
                confirmVariant="danger"
            />
        </div>
    );
};

export default StudentBookings;
