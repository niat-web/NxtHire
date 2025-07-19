// client/src/pages/admin/BookingSlots.jsx
import React, { useState, useEffect, useMemo, useCallback, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import Card from '@/components/common/Card';
import Table from '@/components/common/Table';
import Button from '@/components/common/Button';
import SearchInput from '@/components/common/SearchInput';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { getBookingSlots, createPublicBookingLink, getInterviewBookingDetails, resetBookingSubmission } from '@/api/admin.api';
import { useAlert } from '@/hooks/useAlert';
import { formatDate } from '@/utils/formatters';
import { debounce } from '@/utils/helpers';
import { FiLink, FiLoader, FiMoreVertical, FiEdit, FiTrash2 } from 'react-icons/fi';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import BookingFormModal from '@/components/admin/BookingFormModal';


const BookingSlots = () => {
    const { showSuccess, showError } = useAlert();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [slots, setSlots] = useState([]);
    const [searchFilter, setSearchFilter] = useState("");
    const [dateFilter, setDateFilter] = useState(null);
    const [selectedSlots, setSelectedSlots] = useState([]); // [{ interviewerId, date, slots: [...] }]
    const [isCreatingLink, setIsCreatingLink] = useState(false);
    
    // State for modals
    const [modalState, setModalState] = useState({ isOpen: false, data: null });
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, bookingId: null, submissionId: null });

    const fetchSlots = useCallback(async () => {
        setLoading(true);
        try {
            const params = { search: searchFilter };
            if (dateFilter) params.date = dateFilter.toISOString().split('T')[0];
            const res = await getBookingSlots(params);
            setSlots(res.data.data);
        } catch (err) {
            showError("Failed to fetch booking slots.");
        } finally {
            setLoading(false);
        }
    }, [showError, searchFilter, dateFilter]);

    const debouncedFetch = useMemo(() => debounce(fetchSlots, 300), [fetchSlots]);

    useEffect(() => {
        debouncedFetch();
        return () => debouncedFetch.cancel();
    }, [searchFilter, dateFilter, debouncedFetch]);
    
    const handleEditRequest = async (bookingId) => {
        try {
            const res = await getInterviewBookingDetails(bookingId);
            setModalState({ isOpen: true, data: res.data.data });
        } catch (error) {
            showError("Failed to fetch booking details for editing.");
        }
    };

    const handleDeleteRequest = (row) => {
        setDeleteDialog({ isOpen: true, bookingId: row.bookingId, submissionId: row.submissionId });
    };
    
    const handleDeleteConfirm = async () => {
        if (!deleteDialog.bookingId || !deleteDialog.submissionId) return;
        try {
            await resetBookingSubmission(deleteDialog.bookingId, deleteDialog.submissionId);
            showSuccess("Submission has been deleted.");
            fetchSlots();
        } catch (error) {
            showError("Failed to delete submission.");
        } finally {
            setDeleteDialog({ isOpen: false, bookingId: null, submissionId: null });
        }
    };
    
    // ** REFINED LOGIC for handling individual slot clicks **
    const handleSlotSelection = (interviewerRow, slot) => {
        setSelectedSlots(prev => {
            const newSelection = JSON.parse(JSON.stringify(prev)); // Deep copy to prevent mutation
            const entryDate = new Date(interviewerRow.interviewDate).getTime();
            
            let interviewerEntry = newSelection.find(s => s.interviewerId === interviewerRow.interviewerId && new Date(s.date).getTime() === entryDate);
            
            if (!interviewerEntry) {
                // If the interviewer/date combo is not selected yet, add it
                newSelection.push({
                    interviewerId: interviewerRow.interviewerId,
                    date: interviewerRow.interviewDate,
                    slots: [slot]
                });
            } else {
                // If it exists, toggle the specific slot
                const slotIndex = interviewerEntry.slots.findIndex(s => s.startTime === slot.startTime);
                if (slotIndex > -1) {
                    interviewerEntry.slots.splice(slotIndex, 1);
                    // If no slots are left for this entry, remove the whole entry
                    if (interviewerEntry.slots.length === 0) {
                        return newSelection.filter(s => !(s.interviewerId === interviewerRow.interviewerId && new Date(s.date).getTime() === entryDate));
                    }
                } else {
                    interviewerEntry.slots.push(slot);
                }
            }
            return newSelection;
        });
    };
    
    // ** NEW LOGIC for handling master row checkbox clicks **
    const handleSelectAllForRow = (row, isAnythingSelected) => {
        setSelectedSlots(prev => {
            const newSelection = JSON.parse(JSON.stringify(prev));
            const entryDate = new Date(row.interviewDate).getTime();
            const entryIndex = newSelection.findIndex(s => s.interviewerId === row.interviewerId && new Date(s.date).getTime() === entryDate);

            if (isAnythingSelected) {
                // Action: DESELECT ALL for this row.
                if (entryIndex > -1) {
                    newSelection.splice(entryIndex, 1);
                }
            } else {
                // Action: SELECT ALL for this row.
                const allSlotsForThisRow = row.timeSlots.map(s => ({ startTime: s.startTime, endTime: s.endTime }));
                if (entryIndex > -1) {
                    newSelection[entryIndex].slots = allSlotsForThisRow;
                } else {
                    newSelection.push({
                        interviewerId: row.interviewerId,
                        date: row.interviewDate,
                        slots: allSlotsForThisRow
                    });
                }
            }
            return newSelection;
        });
    };
    
    const handleCreatePublicLink = async () => {
        setIsCreatingLink(true);
        try {
            await createPublicBookingLink({ selectedSlots });
            showSuccess('Public booking link created! Redirecting...');
            navigate('/admin/student-bookings');
        } catch (error) {
            showError("Failed to create public link. Please try again.");
        } finally {
            setIsCreatingLink(false);
        }
    };
    
    const columns = useMemo(() => [
        { 
            key: 'fullName', 
            title: 'Interviewer Name',
            render: (row) => {
                const entry = selectedSlots.find(s => 
                    s.interviewerId === row.interviewerId && 
                    new Date(s.date).getTime() === new Date(row.interviewDate).getTime()
                );
                const totalSlotsInRow = row.timeSlots.length;
                const selectedCount = entry ? entry.slots.length : 0;
                
                const isAllSelected = totalSlotsInRow > 0 && selectedCount === totalSlotsInRow;
                const isPartiallySelected = selectedCount > 0 && selectedCount < totalSlotsInRow;

                return (
                    <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-indigo-600 rounded cursor-pointer"
                          checked={isAllSelected}
                          ref={el => { if (el) el.indeterminate = isPartiallySelected; }}
                          onChange={() => handleSelectAllForRow(row, isAllSelected || isPartiallySelected)}
                        />
                        <span>{row.fullName}</span>
                    </div>
                );
            }
        },
        { key: 'email', title: 'Interviewer Email' },
        { key: 'interviewDate', title: 'Interview Date', render: row => formatDate(row.interviewDate) },
        { 
            key: 'timeSlots', 
            title: 'Submitted Time Slots', 
            render: (row) => (
                <div className="flex flex-wrap gap-2">
                    {row.timeSlots.map((slot, index) => {
                        const isSelected = selectedSlots.some(s => 
                            s.interviewerId === row.interviewerId && 
                            new Date(s.date).getTime() === new Date(row.interviewDate).getTime() && // ** THE FIX **
                            s.slots.some(selSlot => selSlot.startTime === slot.startTime)
                        );
                        return (
                            <label key={`${row.submissionId}-${slot.startTime}-${index}`} className={`flex items-center space-x-2 cursor-pointer p-2 rounded-md transition-all ${isSelected ? 'bg-indigo-100 ring-2 ring-indigo-300' : 'bg-gray-100 hover:bg-gray-200'}`}>
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleSlotSelection(row, slot)}
                                    className="form-checkbox h-4 w-4 text-indigo-600 rounded"
                                />
                                <span className="text-sm font-medium">{`${slot.startTime} - ${slot.endTime}`}</span>
                            </label>
                        )
                    })}
                </div>
            )
        },
        { 
            key: 'actions',
            title: 'Actions',
            render: (row) => (
                <Menu as="div" className="relative inline-block text-left">
                    <Menu.Button className="p-2 rounded-full hover:bg-gray-100">
                        <FiMoreVertical />
                    </Menu.Button>
                    <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                            <div className="px-1 py-1">
                                <Menu.Item>
                                    {({ active }) => (
                                        <button onClick={() => handleEditRequest(row.bookingId)} className={`${active ? 'bg-primary-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}>
                                            <FiEdit className="mr-2" /> Edit Source Booking
                                        </button>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <button onClick={() => handleDeleteRequest(row)} className={`${active ? 'bg-red-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}>
                                            <FiTrash2 className="mr-2" /> Delete This Row
                                        </button>
                                    )}
                                </Menu.Item>
                            </div>
                        </Menu.Items>
                    </Transition>
                </Menu>
            )
        }
    ], [selectedSlots, handleSelectAllForRow, handleSlotSelection, handleEditRequest, handleDeleteRequest]);

    return (
        <>
            <Card>
                 <div className="p-4 border-b flex justify-between items-center flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <SearchInput value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)} placeholder="Search by name/email..." className="w-64"/>
                        <DatePicker selected={dateFilter} onChange={(date) => setDateFilter(date)} isClearable placeholderText="Filter by date" className="form-input w-48 py-2" popperClassName="z-20"/>
                    </div>
                     <Button
                        onClick={handleCreatePublicLink}
                        disabled={selectedSlots.length === 0 || isCreatingLink}
                        icon={isCreatingLink ? <FiLoader className="animate-spin" /> : <FiLink/>}
                    >
                        {isCreatingLink ? 'Creating...' : 'Create Public Link'}
                    </Button>
                </div>
                <Table
                    columns={columns}
                    data={slots}
                    isLoading={loading}
                    emptyMessage="No time slots have been submitted by interviewers yet."
                />
            </Card>

            {/* MODALS */}
            {modalState.isOpen && (
                <BookingFormModal 
                    isOpen={modalState.isOpen}
                    onClose={() => setModalState({ isOpen: false, data: null })}
                    onSuccess={() => { setModalState({ isOpen: false, data: null }); fetchSlots(); }}
                    bookingData={modalState.data}
                />
            )}
            <ConfirmDialog 
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ ...deleteDialog, isOpen: false })}
                onConfirm={handleDeleteConfirm}
                title="Delete Submission"
                message="Are you sure you want to delete this interviewer's slot submission for this date? This action cannot be undone."
                confirmVariant="danger"
            />
        </>
    );
};

export default BookingSlots;