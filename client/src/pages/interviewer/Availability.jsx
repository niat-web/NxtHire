// client/src/pages/interviewer/Availability.jsx
import React, { useEffect, useState, useCallback } from 'react';
import Loader from '@/components/common/Loader';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import SlotSubmissionModal from '@/components/interviewer/SlotSubmissionModal';
import { getBookingRequests } from '@/api/interviewer.api';
import { useAlert } from '@/hooks/useAlert';
import { FiCalendar, FiClock, FiCheckCircle } from 'react-icons/fi';
import { formatDate } from '@/utils/formatters';

const Availability = () => {
  const { showError } = useAlert();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [modalState, setModalState] = useState({ isOpen: false, request: null });

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getBookingRequests();
      setRequests(response.data.data);
    } catch (error) {
      console.error('Error fetching booking requests:', error);
      showError('Failed to load booking requests. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleOpenModal = (request) => {
    setModalState({ isOpen: true, request });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, request: null });
  };
  
  const handleSuccess = () => {
    handleCloseModal();
    fetchRequests(); // Re-fetch to show updated status
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader size="lg" text="Loading Booking Requests..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.bookingId} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="mb-4 sm:mb-0">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FiCalendar className="mr-3 text-primary-600" />
                    Request for: {formatDate(req.bookingDate)}
                  </h3>
                </div>
                {req.status === 'Submitted' ? (
                  <div className="flex items-center space-x-2 text-green-600 font-medium">
                    <FiCheckCircle />
                    <span>Slots Submitted</span>
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    onClick={() => handleOpenModal(req)}
                    icon={<FiClock />}
                    iconPosition="left"
                  >
                    Provide Availability
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Pending Requests"
          description="You have no new availability requests from the admin at this time."
          icon={<FiCheckCircle className="h-12 w-12" />}
        />
      )}

      {modalState.isOpen && (
        <SlotSubmissionModal
          isOpen={modalState.isOpen}
          onClose={handleCloseModal}
          request={modalState.request}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default Availability;