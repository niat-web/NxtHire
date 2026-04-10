import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useAlert } from '../../hooks/useAlert';
import { createInterviewBooking, updateInterviewBooking } from '../../api/admin.api';
import { useInterviewBookingDetails, useInvalidateAdmin } from '../../hooks/useAdminQueries';
import BookingForm from '../../components/admin/BookingForm';
import Loader from '../../components/common/Loader';
import { Button } from '@/components/ui/button';

const NewInterviewBooking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;
    const { showSuccess, showError } = useAlert();

    const { data: bookingData, isLoading: loading } = useInterviewBookingDetails(id, {
        enabled: isEditMode,
        onError: () => {
            showError("Failed to load booking details.");
            navigate('/admin/bookings/interviewer-bookings');
        },
    });
    const { invalidateBookings } = useInvalidateAdmin();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = async (data) => {
        setIsSubmitting(true);

        // Convert local date from DatePicker to UTC for consistent storage
        const localDate = new Date(data.bookingDate);
        const utcDate = new Date(Date.UTC(localDate.getFullYear(), localDate.getMonth(), localDate.getDate()));

        const payload = {
            bookingDate: utcDate,
            interviewerIds: data.interviewerIds
        };

        try {
            if (isEditMode) {
                await updateInterviewBooking(id, payload);
                showSuccess("Booking request updated successfully.");
            } else {
                await createInterviewBooking(payload);
                showSuccess("Booking request created successfully.");
            }
            invalidateBookings();
            navigate('/admin/bookings/interviewer-bookings');
        } catch (err) {
            showError(`Failed to ${isEditMode ? 'update' : 'create'} booking request.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="flex h-full items-center justify-center"><Loader text="Loading booking data..." /></div>;
    }

    return (
        <div className="h-full w-full flex flex-col bg-white overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
                <div>
                    <Link to="/admin/bookings/interviewer-bookings" className="text-m text-gray-600 hover:text-gray-900 flex items-center mb-1">
                        <ArrowLeft className="mr-2" /> Back to Bookings
                    </Link>
                    <h1 className="text-xl font-semibold text-gray-800">
                        {isEditMode ? '' : ''}
                    </h1>
                </div>
                <Button
                    type="submit"
                    form="booking-form"
                    variant="success"
                    isLoading={isSubmitting}
                >
                    {!isSubmitting && <Save className="h-4 w-4 mr-2" />}
                    {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create & Notify')}
                </Button>
            </div>

            {/* Form Area */}
            <div className="flex-grow p-6 overflow-y-auto">
                <BookingForm
                    onSubmit={onSubmit}
                    initialData={bookingData}
                    isSubmitting={isSubmitting}
                    isEditMode={isEditMode}
                />
            </div>
        </div>
    );
};

export default NewInterviewBooking;
