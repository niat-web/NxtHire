import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import { getBookingSlots, createPublicBookingLink, resetBookingSubmission } from '@/api/admin.api';
import { useAlert } from '@/hooks/useAlert';
import { formatDate, formatTime, formatDateTime } from '@/utils/formatters';
import { debounce } from '@/utils/helpers';
import { Search, Calendar, Link, Loader2, Trash2, Check } from 'lucide-react';
import ConfirmDialog from '@/components/common/ConfirmDialog';

const BookingSlots = () => {
    const { showSuccess, showError } = useAlert();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [slots, setSlots] = useState([]);
    const [searchFilter, setSearchFilter] = useState("");
    const [dateFilter, setDateFilter] = useState(null);
    const [selectedSlots, setSelectedSlots] = useState({});
    const [isCreatingLink, setIsCreatingLink] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, bookingId: null, submissionId: null });

    const fetchSlots = useCallback(async () => {
        setLoading(true);
        try {
            const params = { search: searchFilter };
            if (dateFilter) {
                params.date = format(dateFilter, 'yyyy-MM-dd');
            }
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

    const handleDeleteRequest = (bookingId, submissionId) => {
        setDeleteDialog({ isOpen: true, bookingId, submissionId });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteDialog.bookingId || !deleteDialog.submissionId) return;
        try {
            await resetBookingSubmission(deleteDialog.bookingId, deleteDialog.submissionId);
            showSuccess("Submission deleted.");
            fetchSlots();
        } catch (error) {
            showError("Failed to delete submission.");
        } finally {
            setDeleteDialog({ isOpen: false, bookingId: null, submissionId: null });
        }
    };

    const handleSlotSelection = (row, slot) => {
        setSelectedSlots(prev => {
            const newSelection = { ...prev };
            const submissionEntry = newSelection[row.submissionId];

            if (!submissionEntry) {
                newSelection[row.submissionId] = {
                    interviewerId: row.interviewerId,
                    date: row.interviewDate,
                    slots: [{ startTime: slot.startTime, endTime: slot.endTime }]
                };
            } else {
                const slotIndex = submissionEntry.slots.findIndex(
                    s => s.startTime === slot.startTime && s.endTime === slot.endTime
                );

                if (slotIndex > -1) {
                    const newSlots = submissionEntry.slots.filter((_, index) => index !== slotIndex);
                    if (newSlots.length === 0) {
                        delete newSelection[row.submissionId];
                    } else {
                        newSelection[row.submissionId] = { ...submissionEntry, slots: newSlots };
                    }
                } else {
                    newSelection[row.submissionId] = {
                        ...submissionEntry,
                        slots: [...submissionEntry.slots, { startTime: slot.startTime, endTime: slot.endTime }]
                    };
                }
            }
            return newSelection;
        });
    };

    const handleSelectAllForRow = (row) => {
        setSelectedSlots(prev => {
            const newSelection = { ...prev };
            const entry = newSelection[row.submissionId];
            const isCurrentlySelected = entry && entry.slots.length === row.timeSlots.length;

            if (isCurrentlySelected) {
                delete newSelection[row.submissionId];
            } else {
                newSelection[row.submissionId] = {
                    interviewerId: row.interviewerId,
                    date: row.interviewDate,
                    slots: row.timeSlots.map(s => ({ startTime: s.startTime, endTime: s.endTime }))
                };
            }
            return newSelection;
        });
    };

    const handleCreatePublicLink = async () => {
        setIsCreatingLink(true);
        try {
            const payload = { selectedSlots: Object.values(selectedSlots) };
            await createPublicBookingLink(payload);
            showSuccess('Public link created! Redirecting...');
            navigate('/admin/bookings/student-bookings');
        } catch (error) {
            showError("Failed to create public link.");
        } finally {
            setIsCreatingLink(false);
        }
    };

    const selectedSlotsCount = Object.keys(selectedSlots).length;

    return (
        <div className="h-full flex flex-col bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col md:flex-row gap-3 flex-1">
                        <div className="relative flex-1 md:max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchFilter}
                                onChange={(e) => setSearchFilter(e.target.value)}
                                placeholder="Search by name or email..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>

                        <div className="relative min-w-[180px]">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                            <DatePicker
                                selected={dateFilter}
                                onChange={(date) => setDateFilter(date)}
                                isClearable
                                placeholderText="Filter by date"
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleCreatePublicLink}
                        disabled={selectedSlotsCount === 0 || isCreatingLink}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-sm font-semibold rounded-lg transition-all whitespace-nowrap"
                    >
                        {isCreatingLink ? (
                            <><Loader2 className="animate-spin" size={16} /> Creating...</>
                        ) : (
                            <><Link size={16} /> Create Link {selectedSlotsCount > 0 && `(${selectedSlotsCount})`}</>
                        )}
                    </button>
                </div>
            </div>

            {/* Simple Table View */}
            <div className="flex-1 overflow-auto px-6 py-4">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                ) : slots.length === 0 ? (
                    <div className="text-center py-16 text-slate-500">
                        No slots found. {searchFilter || dateFilter ? "Try adjusting your filters." : ""}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
  <tr>
    <th className="text-left px-4 py-3 font-semibold text-slate-700 w-8"></th>
    <th className="text-left px-4 py-3 font-semibold text-slate-700">Interviewer</th>
    <th className="text-left px-4 py-3 font-semibold text-slate-700 whitespace-nowrap w-40">
      Date
    </th>
    <th className="text-left pl-8 pr-4 py-3 font-semibold text-slate-700">Time Slots</th>
    <th className="text-left px-4 py-3 font-semibold text-slate-700 w-16"></th>
  </tr>
</thead>

<tbody className="divide-y divide-slate-100">
  {slots.map((row) => {
    const entry = selectedSlots[row.submissionId];
    const isAllSelected = entry && entry.slots.length === row.timeSlots.length;

    return (
      <tr key={row.submissionId} className="hover:bg-slate-50 transition-colors">
        {/* Checkbox */}
        <td className="px-4 py-3">
          <input
            type="checkbox"
            checked={isAllSelected || false}
            onChange={() => handleSelectAllForRow(row)}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
          />
        </td>

        {/* Interviewer Info */}
        <td className="px-4 py-3">
          <div className="font-medium text-slate-800">{row.fullName}</div>
          <div className="text-xs text-slate-500">{row.email}</div>
          <div className="text-xs text-slate-400 mt-1">{formatDateTime(row.submittedAt)}</div>
        </td>

        {/* Date (single-line) */}
        <td className="px-4 py-3 text-slate-700 whitespace-nowrap w-40">
          {formatDate(row.interviewDate)}
        </td>

        {/* Time Slots (shifted right) */}
        <td className="pl-8 pr-4 py-3">
          <div className="flex flex-wrap gap-1.5">
            {row.timeSlots.map((slot, idx) => {
              const isSelected = entry?.slots.some(
                (s) => s.startTime === slot.startTime && s.endTime === slot.endTime
              );
              return (
                <button
                  key={idx}
                  onClick={() => handleSlotSelection(row, slot)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-blue-100 text-blue-700 border border-blue-300"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {isSelected && <Check size={12} className="inline mr-1" />}
                  {formatTime(slot.startTime)}-{formatTime(slot.endTime)}
                </button>
              );
            })}
          </div>
        </td>

        {/* Delete Button */}
        <td className="px-4 py-3">
          <button
            onClick={() => handleDeleteRequest(row.bookingId, row.submissionId)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </td>
      </tr>
    );
  })}
</tbody>

                        </table>
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, bookingId: null, submissionId: null })}
                onConfirm={handleDeleteConfirm}
                title="Delete Submission"
                message="Are you sure you want to delete this submission? This cannot be undone."
                confirmVariant="danger"
            />
        </div>
    );
};

export default BookingSlots;
