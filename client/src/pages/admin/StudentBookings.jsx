import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiInfo, FiLink, FiUsers, FiClipboard, FiSearch, FiChevronDown, FiPlus, FiCheckCircle, FiClock } from 'react-icons/fi';
import { getPublicBookings } from '@/api/admin.api';
import { useAlert } from '@/hooks/useAlert';
import { formatDateTime } from '@/utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';


const Header = ({ onSearch, onSortChange, onAddNew, totalLinks, sortOption, creatorOptions, onCreatorChange, creatorFilter }) => (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 border-b border-gray-200 bg-white">
        <div>
            <h1 className="text-xl font-bold text-gray-800">Manage Public Links</h1>
            <p className="text-sm text-gray-500">{totalLinks} links found</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
            <div className="relative w-full md:w-auto">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                    type="text"
                    onChange={onSearch}
                    placeholder="Search by Public ID..."
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
                    {creatorOptions.map(creator => (
                        <option key={creator.value} value={creator.value}>{creator.label}</option>
                    ))}
                </select>
            </div>
            
            <div className="relative w-full md:w-auto">
                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <select
                    value={sortOption}
                    onChange={onSortChange}
                    className="w-full md:w-48 appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="most_students">Most Students</option>
                    <option value="fewest_students">Fewest Students</option>
                </select>
            </div>

             <button onClick={onAddNew} className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors">
                <FiPlus size={16} /> New Link
            </button>
        </div>
    </div>
);


const Loader = () => (
    <div className="text-center py-20 text-gray-500">
        <div className="w-8 h-8 mx-auto border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
        <span className="mt-4 block">Loading Links...</span>
    </div>
);

const EmptyState = ({ message, onAction, actionText }) => (
    <div className="text-center py-20 bg-white rounded-lg border border-dashed mt-4">
        <FiLink className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="font-semibold text-gray-800">No Links Found</h3>
        <p className="text-sm text-gray-500 mt-1">{message}</p>
        {onAction && actionText && (
             <button onClick={onAction} className="mt-6 flex items-center justify-center gap-2 mx-auto px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors">
                <FiPlus size={16} /> {actionText}
            </button>
        )}
    </div>
);

const StatusBreakdown = ({ booked, pending }) => (
    <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5" title={`${booked} Students have booked`}>
            <FiCheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-semibold text-gray-700">{booked}</span>
        </div>
        <div className="flex items-center gap-1.5" title={`${pending} Students are pending`}>
            <FiClock className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-semibold text-gray-700">{pending}</span>
        </div>
    </div>
);

const LinkRow = ({ booking, onAuthorize, onTrack, onCopy }) => {
    const uniqueInterviewers = useMemo(() => [
        ...new Set(
            booking.interviewerSlots
                .map(slot => slot.interviewer?.user ? `${slot.interviewer.user.firstName} ${slot.interviewer.user.lastName}`.trim() : 'Unknown')
                .filter(Boolean)
        )
    ], [booking.interviewerSlots]);

    const url = `${window.location.origin}/book/${booking.publicId}`;
    const creatorName = booking.createdBy ? `${booking.createdBy.firstName} ${booking.createdBy.lastName || ''}`.trim() : 'N/A';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-12 gap-x-4 gap-y-2 items-center bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-300"
        >
            <div className="col-span-12 md:col-span-2">
                <p className="text-sm text-gray-800 font-medium whitespace-nowrap">{formatDateTime(booking.createdAt)}</p>
                <p className="text-xs text-gray-500 truncate" title={`Created by ${creatorName}`}>
                    by {creatorName}
                </p>
            </div>
            
            <div className="col-span-12 md:col-span-2">
                 <div className="flex items-center gap-2 group">
                    <a href={url} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline font-mono text-xs">{booking.publicId}</a>
                    <button onClick={() => onCopy(url)} title="Copy link">
                        <FiClipboard className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </button>
                </div>
            </div>

            <div className="col-span-12 md:col-span-3 flex items-center gap-6">
                <div className="relative group flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-800">{uniqueInterviewers.length}</span>
                    <span className="text-sm text-gray-600">Assigned</span>
                    {uniqueInterviewers.length > 0 && <FiInfo className="text-gray-400 cursor-pointer"/>}
                    
                    <div className="absolute left-0 bottom-full mb-2 w-max max-w-xs p-2 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                        <ul className="list-disc list-inside mt-1">
                            {uniqueInterviewers.map((name, index) => <li key={index}>{name}</li>)}
                        </ul>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-800">{booking.allowedStudents?.length || 0}</span>
                    <span className="text-sm text-gray-600">Students</span>
                </div>
            </div>

            <div className="col-span-6 md:col-span-2">
                 <StatusBreakdown booked={booking.bookedCount} pending={booking.pendingCount} />
            </div>

            <div className="col-span-6 md:col-span-3 flex items-center justify-end gap-2">
                 <button onClick={onTrack} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg transition-colors">
                     <FiEye size={14}/> Track
                 </button>
                 <button onClick={onAuthorize} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors">
                    <FiUsers size={14} />
                </button>
            </div>
        </motion.div>
    );
};

const StudentBookings = () => {
    const { showSuccess, showError } = useAlert();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [publicBookings, setPublicBookings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('newest');
    const [creatorFilter, setCreatorFilter] = useState('');

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


    return (
        <div className="h-full w-full flex flex-col bg-gray-50">
            <Header
                onSearch={(e) => setSearchTerm(e.target.value)}
                onSortChange={(e) => setSortOption(e.target.value)}
                onAddNew={() => navigate('/admin/bookings/booking-slots')}
                totalLinks={filteredAndSortedBookings.length}
                sortOption={sortOption}
                creatorOptions={creatorOptions}
                creatorFilter={creatorFilter}
                onCreatorChange={(e) => setCreatorFilter(e.target.value)}
            />

            <div className="flex-grow p-4 md:p-6 overflow-y-auto">
                {loading ? (
                    <Loader />
                ) : (
                    <>
                        <div className="hidden md:grid grid-cols-12 gap-x-4 px-4 pb-2 border-b border-gray-200">
                            <div className="col-span-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Created</div>
                            <div className="col-span-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Public Link</div>
                            <div className="col-span-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Details</div>
                            <div className="col-span-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</div>
                            <div className="col-span-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</div>
                        </div>

                        {filteredAndSortedBookings.length > 0 ? (
                            <div className="space-y-3 mt-3">
                                <AnimatePresence>
                                    {filteredAndSortedBookings.map(booking => (
                                        <LinkRow
                                            key={booking._id} 
                                            booking={booking} 
                                            onAuthorize={() => navigate(`/admin/public-bookings/${booking._id}/authorize`)} 
                                            onTrack={() => navigate(`/admin/public-bookings/${booking._id}/tracking`)}
                                            onCopy={(url) => {
                                                navigator.clipboard.writeText(url);
                                                showSuccess("Public link copied to clipboard!");
                                            }}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <EmptyState message="No links match your search or filters." />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default StudentBookings;
