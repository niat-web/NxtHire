import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '@/components/common/Loader';
import EmptyState from '@/components/common/EmptyState';
import Modal from '@/components/common/Modal';
import Textarea from '@/components/common/Textarea';
import { declineBookingRequest } from '@/api/interviewer.api';
import { useAlert } from '@/hooks/useAlert';
import { Calendar, Clock, CheckCircle, XCircle, Inbox, Lock, AlertCircle } from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import { useForm } from 'react-hook-form';
import { subDays, startOfDay } from 'date-fns';
import { useBookingRequests, useInvalidateInterviewer } from '@/hooks/useInterviewerQueries';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

import SlotSubmissionModal from '../../components/interviewer/SlotSubmissionModal'; 

const DeclineModal = ({ isOpen, onClose, onSubmit, request }) => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Decline Request for ${formatDate(request.bookingDate)}`}
            size="md"
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <Textarea
                    label="Remarks"
                    placeholder="Please provide a reason for not being available (e.g., personal emergency, prior commitment)."
                    {...register('remarks', { required: 'Remarks are required to decline.' })}
                    error={errors.remarks?.message}
                    rows={3}
                    required
                />
                <div className="mt-6 flex justify-end space-x-3">
                    <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button variant="destructive" type="submit" isLoading={isSubmitting}>
                        Confirm Not Interested
                    </Button>
                </div>
            </form>
        </Modal>
    );
};


const Availability = () => {
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();
  const [declineModalState, setDeclineModalState] = useState({ isOpen: false, request: null });

  const [submissionModalState, setSubmissionModalState] = useState({ isOpen: false, request: null });

  const { data: rawRequests, isLoading: loading } = useBookingRequests();
  const { invalidateBookings } = useInvalidateInterviewer();

  // Sort: Open first, then by date descending
  const requests = useMemo(() => {
    if (!rawRequests) return [];
    return [...rawRequests].sort((a, b) => {
        if (a.bookingStatus === 'Open' && b.bookingStatus !== 'Open') return -1;
        if (a.bookingStatus !== 'Open' && b.bookingStatus === 'Open') return 1;
        return new Date(b.bookingDate) - new Date(a.bookingDate);
    });
  }, [rawRequests]);

  const handleProvideAvailability = (request) => {
      setSubmissionModalState({ isOpen: true, request: request });
  };
  
  const handleOpenDeclineModal = (request) => {
    setDeclineModalState({ isOpen: true, request });
  };
  
  const handleCloseDeclineModal = () => {
    setDeclineModalState({ isOpen: false, request: null });
  };

  const handleCloseSubmissionModal = () => {
    setSubmissionModalState({ isOpen: false, request: null });
  };

  const handleDeclineSubmit = async (data) => {
    try {
        await declineBookingRequest(declineModalState.request.bookingId, data);
        showSuccess('Your unavailability has been noted.');
        handleSuccess();
    } catch (error) {
        showError("Failed to submit. Please try again.");
    }
  };
  
  const handleSuccess = () => {
    handleCloseDeclineModal();
    handleCloseSubmissionModal();
    invalidateBookings();
  };

  // Helper to get reference dates
  const getDates = () => {
      const today = startOfDay(new Date());
      // Define "Yesterday" as the cutoff. 
      // Any date strictly BEFORE yesterday is read-only.
      const yesterday = subDays(today, 1); 
      return { today, yesterday };
  };

  // --- MODIFIED STATUS BADGE LOGIC ---
  const getStatusBadge = (req, isExpired, canEdit) => {
      // 1. Closed by Admin
      if (req.bookingStatus === 'Closed') {
          return <Badge variant="gray" className="px-4 py-2 text-sm"><Lock className="mr-2 h-4 w-4" /> Request Closed</Badge>;
      }
      
      switch(req.status) {
          case 'Submitted':
              if (canEdit) {
                  // Case A: Submitted & Within Edit Window (Yesterday, Today, Future) -> Clickable Button
                  return (
                    <Button
                        onClick={() => handleProvideAvailability(req)}
                        variant="success"
                        className="group rounded-full shadow-md"
                        title="Click to view or edit submitted slots"
                    >
                        <CheckCircle className="mr-2 group-hover:scale-110 transition-transform" /> Slots Submitted
                        <span className="ml-2 text-xs bg-white/50 text-green-800 px-1.5 py-0.5 rounded border border-green-300/50 font-semibold group-hover:bg-white">Edit</span>
                    </Button>
                  );
              } else {
                  // Case B: Submitted & Too Old (Before Yesterday) -> Static Badge
                  return (
                    <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-50 text-green-600 border border-green-100 opacity-80 cursor-default">
                        <CheckCircle className="mr-2" /> Submitted (Locked)
                    </div>
                  );
              }

          case 'Not Available':
               return <Badge variant="danger" className="px-4 py-2 text-sm"><XCircle className="mr-2 h-4 w-4" /> Not Available</Badge>;

          default: // 'Pending'
               if (isExpired) {
                   return <Badge variant="gray" className="px-4 py-2 text-sm"><AlertCircle className="mr-2 h-4 w-4"/> Expired</Badge>;
               }
               return <Badge variant="warning" className="px-4 py-2 text-sm"><Clock className="mr-2 h-4 w-4"/> Awaiting Availability</Badge>;
      }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader size="lg" text="Loading Booking Requests..." />
      </div>
    );
  }

  const { today, yesterday } = getDates();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((req) => {
            const requestDate = startOfDay(new Date(req.bookingDate));
            
            // Expired Logic (For 'Pending' items): Can't start new submissions if date < today
            const isExpired = requestDate < today;

            // Edit Logic (For 'Submitted' items): Can edit if date >= yesterday
            const canEdit = requestDate >= yesterday; 
            
            // Actionable Logic (For displaying Buttons vs Badges):
            // 'Pending', 'Open', and Not Expired
            const isActionable = req.status === 'Pending' && req.bookingStatus === 'Open' && !isExpired;

            return (
              <Card
                  key={req.bookingId}
                  className={cn(
                      "p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-200 hover:shadow-md",
                      !isActionable && !canEdit && "bg-slate-50/50"
                  )}
              >
                  <div className="flex items-center gap-4">
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0", isActionable ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-400")}>
                          <Calendar className="w-6 h-6" />
                      </div>
                      <div>
                          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">Request for</p>
                          <p className={cn("text-lg font-semibold", isActionable || canEdit ? "text-slate-800" : "text-slate-500")}>
                              {formatDate(req.bookingDate)}
                          </p>
                      </div>
                  </div>
                  
                  <div className="flex items-center self-end sm:self-auto">
                      {isActionable ? (
                          <div className="flex gap-3">
                             <Button
                                  variant="outline"
                                  onClick={() => handleOpenDeclineModal(req)}
                                  className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                              >
                                  Not Interested
                              </Button>
                              <Button
                                  variant="default"
                                  onClick={() => handleProvideAvailability(req)}
                              >
                                  Provide Availability
                              </Button>
                          </div>
                      ) : (
                        getStatusBadge(req, isExpired, canEdit)
                      )}
                  </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="All Caught Up!"
          description="You have no new availability requests from the admin at this time."
          icon={<Inbox className="h-16 w-16 text-gray-300" />}
        />
      )}
      
      {declineModalState.isOpen && (
          <DeclineModal
            isOpen={declineModalState.isOpen}
            onClose={handleCloseDeclineModal}
            onSubmit={handleDeclineSubmit}
            request={declineModalState.request}
          />
      )}

      {/* --- RENDER SUBMISSION MODAL --- */}
      {submissionModalState.isOpen && (
          <SlotSubmissionModal
            isOpen={submissionModalState.isOpen}
            onClose={handleCloseSubmissionModal}
            request={submissionModalState.request}
            onSuccess={handleSuccess}
          />
      )}
    </div>
  );
};

export default Availability;
