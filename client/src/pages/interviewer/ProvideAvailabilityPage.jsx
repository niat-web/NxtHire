// client/src/pages/interviewer/ProvideAvailabilityPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { useAlert } from '../../hooks/useAlert';
import { getBookingRequests, submitTimeSlots } from '../../api/interviewer.api';
import AvailabilityForm from '../../components/interviewer/AvailabilityForm';
import Loader from '../../components/common/Loader';

const ProvideAvailabilityPage = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const { showSuccess, showError } = useAlert();

    const [bookingRequest, setBookingRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        getBookingRequests()
            .then(res => {
                const request = res.data.data.find(r => r.bookingId === bookingId);
                if (request) {
                    setBookingRequest(request);
                } else {
                    throw new Error("Booking request not found.");
                }
            })
            .catch(() => {
                showError("Could not load booking request details.");
                navigate('/interviewer/availability');
            })
            .finally(() => setLoading(false));
    }, [bookingId, navigate, showError]);

    const handleSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            await submitTimeSlots(bookingId, data);
            showSuccess('Availability submitted successfully!');
            navigate('/interviewer/availability');
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to submit availability.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="flex h-full items-center justify-center"><Loader text="Loading Request..." /></div>;
    }
    
    return (
        <div className="h-full w-full flex flex-col bg-white overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
                <div>
                    <Link to="/interviewer/availability" className="text-m text-gray-600 hover:text-gray-900 flex items-center mb-1">
                        <FiArrowLeft className="mr-2" /> Back to Requests
                    </Link>
                </div>
                <button
                    type="submit"
                    form="availability-form"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-60 bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
                >
                   {isSubmitting ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"/> : <FiSave className="h-4 w-4 mr-2"/>}
                   {isSubmitting ? 'Submitting...' : 'Submit Slots'}
                </button>
            </div>

            {/* Form Area */}
            <div className="flex-grow p-6 overflow-y-auto">
                 {bookingRequest && (
                    <AvailabilityForm 
                        onSubmit={handleSubmit}
                        bookingDate={bookingRequest.bookingDate}
                        isSubmitting={isSubmitting}
                    />
                 )}
            </div>
        </div>
    );
};

export default ProvideAvailabilityPage;
