// client/src/pages/admin/StudentBookings.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Eye, Link2, Users, Clipboard, Search, ChevronDown,
    Plus, CheckCircle, Clock, Trash2, Calendar, Filter, User
} from 'lucide-react';
import { deletePublicBookingLink } from '@/api/admin.api';
import { usePublicBookings, useInvalidateAdmin } from '@/hooks/useAdminQueries';
import { useAlert } from '@/hooks/useAlert';
import { formatDateTime } from '@/utils/formatters';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Loader from '@/components/common/Loader';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const StatusCount = ({ count, icon: Icon, colorClass, label }) => (
    <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium', colorClass)}>
        <Icon className="h-3 w-3" />
        <span>{count}</span>
        <span className="opacity-70 hidden sm:inline">{label}</span>
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
        if (searchTerm) items = items.filter(b => b.publicId.toLowerCase().includes(searchTerm.toLowerCase()));
        if (creatorFilter) items = items.filter(b => b.createdBy?._id === creatorFilter);
        switch (sortOption) {
            case 'oldest': items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
            case 'most_students': items.sort((a, b) => (b.allowedStudents?.length || 0) - (a.allowedStudents?.length || 0)); break;
            case 'fewest_students': items.sort((a, b) => (a.allowedStudents?.length || 0) - (b.allowedStudents?.length || 0)); break;
            default: items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return items;
    }, [publicBookings, searchTerm, sortOption, creatorFilter]);

    const handleDeleteConfirm = async () => {
        if (!deleteDialog.id) return;
        try {
            await deletePublicBookingLink(deleteDialog.id);
            showSuccess('Public booking link deleted!');
            invalidatePublicBookings();
        } catch { showError("Failed to delete the link."); }
        finally { setDeleteDialog({ isOpen: false, id: null }); }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader size="lg" />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 shrink-0 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="flex flex-col sm:flex-row gap-2 flex-1">
                        <div className="relative flex-1 sm:max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by Public ID..."
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-gray-400 transition-all" />
                        </div>
                        <select value={creatorFilter} onChange={(e) => setCreatorFilter(e.target.value)}
                            className="pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer hover:border-gray-300 transition-colors">
                            <option value="">All Creators</option>
                            {creatorOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}
                            className="pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer hover:border-gray-300 transition-colors">
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="most_students">Most Students</option>
                            <option value="fewest_students">Fewest Students</option>
                        </select>
                    </div>
                    <Button onClick={() => navigate('/admin/bookings/booking-slots')} className="rounded-lg">
                        <Plus className="mr-2 h-4 w-4" /> New Link
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
                {filteredAndSortedBookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Link2 className="h-7 w-7 text-gray-300" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">No links found</h3>
                        <p className="text-sm text-gray-500 max-w-xs mx-auto">
                            {publicBookings.length === 0 ? "Create your first public booking link." : "No links match your filters."}
                        </p>
                        {publicBookings.length === 0 && (
                            <Button onClick={() => navigate('/admin/bookings/booking-slots')} className="mt-5" size="sm">
                                <Plus className="mr-1.5 h-4 w-4" /> Create Link
                            </Button>
                        )}
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gradient-to-r from-blue-50 to-blue-50 sticky top-0 z-10">
                            <tr>
                                <th className="py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                                <th className="py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Public Link</th>
                                <th className="py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Details</th>
                                <th className="py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {filteredAndSortedBookings.map((booking) => {
                                const uniqueInterviewers = [...new Set(
                                    booking.interviewerSlots
                                        .map(slot => slot.interviewer?.user ? `${slot.interviewer.user.firstName} ${slot.interviewer.user.lastName}`.trim() : 'Unknown')
                                        .filter(Boolean)
                                )];
                                const url = `${window.location.origin}/book/${booking.publicId}`;
                                const creatorName = booking.createdBy ? `${booking.createdBy.firstName} ${booking.createdBy.lastName || ''}`.trim() : 'N/A';

                                return (
                                    <tr key={booking._id} className="group hover:bg-gray-50/80 transition-colors">
                                        <td className="py-3.5 px-6">
                                            <div className="text-sm font-medium text-gray-900">{formatDateTime(booking.createdAt)}</div>
                                            <div className="text-xs text-gray-400 mt-0.5">by {creatorName}</div>
                                        </td>
                                        <td className="py-3.5 px-6">
                                            <div className="flex items-center gap-2">
                                                <a href={url} target="_blank" rel="noopener noreferrer"
                                                    className="font-mono text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors">
                                                    {booking.publicId}
                                                </a>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                                    onClick={() => { navigator.clipboard.writeText(url); showSuccess("Link copied!"); }} title="Copy">
                                                    <Clipboard className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-6">
                                            <div className="flex items-center gap-3 text-sm text-gray-700">
                                                <span className="flex items-center gap-1" title={uniqueInterviewers.join(', ')}>
                                                    <Users className="h-3.5 w-3.5 text-gray-400" /> {uniqueInterviewers.length}
                                                </span>
                                                <span className="text-gray-200">|</span>
                                                <span className="flex items-center gap-1">
                                                    <User className="h-3.5 w-3.5 text-gray-400" /> {booking.allowedStudents?.length || 0}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-6">
                                            <div className="flex items-center gap-1.5">
                                                <StatusCount count={booking.bookedCount} icon={CheckCircle} colorClass="bg-green-50 text-green-700 border-green-100" label="Booked" />
                                                <StatusCount count={booking.pendingCount} icon={Clock} colorClass="bg-amber-50 text-amber-600 border-amber-100" label="Pending" />
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-6 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                                    onClick={() => navigate(`/admin/public-bookings/${booking._id}/tracking`)} title="Track">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                                    onClick={() => navigate(`/admin/public-bookings/${booking._id}/authorize`)} title="Authorize">
                                                    <Users className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => setDeleteDialog({ isOpen: true, id: booking._id })} title="Delete">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
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
            {filteredAndSortedBookings.length > 0 && (
                <div className="px-6 py-3 border-t border-gray-200 bg-white flex items-center justify-between shrink-0">
                    <p className="text-xs text-gray-500">Showing {filteredAndSortedBookings.length} of {publicBookings.length} links</p>
                </div>
            )}

            <ConfirmDialog isOpen={deleteDialog.isOpen} onClose={() => setDeleteDialog({ isOpen: false, id: null })}
                onConfirm={handleDeleteConfirm} title="Delete Public Link"
                message="All associated student invitations will be lost. This action is permanent." confirmVariant="danger" />
        </div>
    );
};

export default StudentBookings;
