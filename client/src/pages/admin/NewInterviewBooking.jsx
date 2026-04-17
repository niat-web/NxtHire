import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { useAlert } from '../../hooks/useAlert';
import { createInterviewBooking, updateInterviewBooking } from '../../api/admin.api';
import { useInterviewBookingDetails, useInvalidateAdmin } from '../../hooks/useAdminQueries';
import BookingForm from '../../components/admin/BookingForm';
import Loader from '../../components/common/Loader';

const NewInterviewBooking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;
    const { showSuccess, showError } = useAlert();

    const { data: bookingData, isLoading: loading } = useInterviewBookingDetails(id, {
        enabled: isEditMode,
    });
    const { invalidateBookings } = useInvalidateAdmin();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        const localDate = new Date(data.bookingDate);
        const utcDate = new Date(Date.UTC(localDate.getFullYear(), localDate.getMonth(), localDate.getDate()));
        const payload = { bookingDate: utcDate, interviewerIds: data.interviewerIds };

        try {
            if (isEditMode) {
                await updateInterviewBooking(id, payload);
                showSuccess("Booking request updated.");
            } else {
                await createInterviewBooking(payload);
                showSuccess("Booking request created.");
            }
            invalidateBookings();
            navigate('/admin/bookings/interviewer-bookings');
        } catch {
            showError(`Failed to ${isEditMode ? 'update' : 'create'} booking.`);
        } finally { setIsSubmitting(false); }
    };

    if (loading) return <div className="flex h-full items-center justify-center"><Loader size="lg" /></div>;

    return (
        <div className="h-full w-full flex flex-col bg-white overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-2.5 border-b border-slate-200 shrink-0">
                <div className="flex items-center gap-3">
                    <Link to="/admin/bookings/interviewer-bookings"
                        className="w-8 h-8 rounded-md flex items-center justify-center border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
                        <ArrowLeft size={15} />
                    </Link>
                    <h1 className="text-sm font-semibold text-slate-900">{isEditMode ? 'Edit Booking' : 'New Booking Request'}</h1>
                </div>
                <button type="submit" form="booking-form" disabled={isSubmitting}
                    className="inline-flex items-center gap-2 h-9 px-4 text-[13px] font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors">
                    {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create & Notify')}
                </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-hidden">
                <BookingForm onSubmit={onSubmit} initialData={bookingData} isSubmitting={isSubmitting} isEditMode={isEditMode} />
            </div>
        </div>
    );
};

export default NewInterviewBooking;
