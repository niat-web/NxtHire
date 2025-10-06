// // client/src/pages/interviewer/Availability.jsx
// import React, { useEffect, useState, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useForm } from 'react-hook-form';
// import Loader from '@/components/common/Loader';
// import Button from '@/components/common/Button';
// import EmptyState from '@/components/common/EmptyState';
// import Modal from '@/components/common/Modal'; 
// import Textarea from '@/components/common/Textarea';
// import { getBookingRequests, declineBookingRequest } from '@/api/interviewer.api';
// import { useAlert } from '@/hooks/useAlert';
// import { FiCalendar, FiClock, FiCheckCircle, FiXCircle, FiX } from 'react-icons/fi';
// import { formatDate } from '@/utils/formatters';

// const DeclineModal = ({ isOpen, onClose, onSubmit, request }) => {
//     const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
//     return (
//         <Modal
//             isOpen={isOpen}
//             onClose={onClose}
//             title={`Decline Request for ${formatDate(request.bookingDate)}`}
//             size="md"
//         >
//             <form onSubmit={handleSubmit(onSubmit)}>
//                 <Textarea
//                     label="Remarks"
//                     placeholder="Please provide a reason for not being available (e.g., personal emergency, prior commitment)."
//                     {...register('remarks', { required: 'Remarks are required to decline.' })}
//                     error={errors.remarks?.message}
//                     rows={3}
//                     required
//                 />
//                 <div className="mt-6 flex justify-end space-x-3">
//                     <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
//                         Cancel
//                     </Button>
//                     <Button variant="danger" type="submit" isLoading={isSubmitting}>
//                         Confirm Not Interested
//                     </Button>
//                 </div>
//             </form>
//         </Modal>
//     );
// };


// const Availability = () => {
//   const { showSuccess, showError } = useAlert();
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);
//   const [requests, setRequests] = useState([]);
//   const [declineModalState, setDeclineModalState] = useState({ isOpen: false, request: null });

//   const fetchRequests = useCallback(async () => {
//     setLoading(true);
//     try {
//       const response = await getBookingRequests();
//       setRequests(response.data.data);
//     } catch (error) {
//       console.error('Error fetching booking requests:', error);
//       showError('Failed to load booking requests. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   }, [showError]);

//   useEffect(() => {
//     fetchRequests();
//   }, [fetchRequests]);

//   const handleProvideAvailability = (request) => {
//     navigate(`/interviewer/provide-availability/${request.bookingId}`);
//   };
  
//   const handleOpenDeclineModal = (request) => {
//     setDeclineModalState({ isOpen: true, request });
//   };
//   const handleCloseDeclineModal = () => {
//     setDeclineModalState({ isOpen: false, request: null });
//   };
//   const handleDeclineSubmit = async (data) => {
//     try {
//         await declineBookingRequest(declineModalState.request.bookingId, data);
//         showSuccess('Your unavailability has been noted.');
//         handleSuccess();
//     } catch (error) {
//         showError("Failed to submit. Please try again.");
//     }
//   };
  
//   const handleSuccess = () => {
//     handleCloseDeclineModal();
//     fetchRequests();
//   };

//   const today = new Date();
//   today.setHours(0, 0, 0, 0);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-full">
//         <Loader size="lg" text="Loading Booking Requests..." />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {requests.length > 0 ? (
//         <div className="space-y-4">
//           {requests.map((req) => {
//             const requestDate = new Date(req.bookingDate);
//             const isExpired = requestDate < today && req.status === 'Pending';

//             return (
//               <div key={req.bookingId} className="bg-white rounded-lg shadow-sm border border-gray-200">
//                 <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
//                   <div className="mb-4 sm:mb-0">
//                     <h3 className="text-lg font-semibold text-gray-800 flex items-center">
//                       <FiCalendar className="mr-3 text-primary-600" />
//                       Request for: {formatDate(req.bookingDate)}
//                     </h3>
//                   </div>

//                   {isExpired ? (
//                     <div className="flex items-center space-x-2 text-gray-500 font-medium">
//                       <FiXCircle />
//                       <span>Expired</span>
//                     </div>
//                   ) : req.status === 'Submitted' ? (
//                     <div className="flex items-center space-x-2 text-green-600 font-medium">
//                       <FiCheckCircle />
//                       <span>Slots Submitted</span>
//                     </div>
//                   ) : req.status === 'Not Available' ? (
//                     <div className="flex items-center space-x-2 text-red-600 font-medium">
//                       <FiXCircle />
//                       <span>Marked as Not Available</span>
//                     </div>
//                   ) : (
//                     <div className="flex items-center gap-3">
//                        <Button
//                           variant="outline"
//                           onClick={() => handleOpenDeclineModal(req)}
//                           icon={<FiXCircle />}
//                           className="!text-red-600 !border-red-300 hover:!bg-red-50"
//                         >
//                           Not Interested
//                         </Button>
//                         <Button
//                           variant="primary"
//                           onClick={() => handleProvideAvailability(req)}
//                           icon={<FiClock />}
//                           iconPosition="left"
//                         >
//                           Provide Availability
//                         </Button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       ) : (
//         <EmptyState
//           title="No Pending Requests"
//           description="You have no new availability requests from the admin at this time."
//           icon={<FiCheckCircle className="h-12 w-12" />}
//         />
//       )}
      
//       {declineModalState.isOpen && (
//           <DeclineModal
//             isOpen={declineModalState.isOpen}
//             onClose={handleCloseDeclineModal}
//             onSubmit={handleDeclineSubmit}
//             request={declineModalState.request}
//           />
//       )}
//     </div>
//   );
// };

// export default Availability;



// client/src/pages/interviewer/Availability.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '@/components/common/Loader';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import Modal from '@/components/common/Modal';
import Textarea from '@/components/common/Textarea';
import { getBookingRequests, declineBookingRequest } from '@/api/interviewer.api';
import { useAlert } from '@/hooks/useAlert';
import { FiCalendar, FiClock, FiCheckCircle, FiXCircle, FiInbox, FiLock } from 'react-icons/fi';
import { formatDate } from '@/utils/formatters';
import { useForm } from 'react-hook-form';

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
                    <Button variant="danger" type="submit" isLoading={isSubmitting}>
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
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [declineModalState, setDeclineModalState] = useState({ isOpen: false, request: null });

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getBookingRequests();
      // --- MODIFICATION: Sort the requests to show Open ones first ---
      const sortedRequests = [...response.data.data].sort((a, b) => {
          if (a.bookingStatus === 'Open' && b.bookingStatus !== 'Open') return -1;
          if (a.bookingStatus !== 'Open' && b.bookingStatus === 'Open') return 1;
          return new Date(b.bookingDate) - new Date(a.bookingDate);
      });
      setRequests(sortedRequests);
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

  const handleProvideAvailability = (request) => {
    navigate(`/interviewer/provide-availability/${request.bookingId}`);
  };
  
  const handleOpenDeclineModal = (request) => {
    setDeclineModalState({ isOpen: true, request });
  };
  const handleCloseDeclineModal = () => {
    setDeclineModalState({ isOpen: false, request: null });
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
    fetchRequests();
  };

  const getStatusBadge = (req) => {
      // If the entire booking is closed by the admin, that's the primary status.
      if (req.bookingStatus === 'Closed') {
          return <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-600"><FiLock className="mr-2" /> Request Closed</div>;
      }
      
      // Otherwise, show the interviewer's specific response status.
      switch(req.status) {
          case 'Submitted':
              return <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-700"><FiCheckCircle className="mr-2" /> Slots Submitted</div>;
          case 'Not Available':
               return <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-red-100 text-red-700"><FiXCircle className="mr-2" /> Not Available</div>;
          default:
               return <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-700"><FiClock className="mr-2"/> Awaiting Availability</div>;
      }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader size="lg" text="Loading Booking Requests..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((req) => {
            const isActionable = req.status === 'Pending' && req.bookingStatus === 'Open';

            return (
              <div 
                  key={req.bookingId} 
                  className={`bg-white rounded-lg shadow-sm border p-4 flex items-center justify-between gap-6 transition-all duration-300 ${isActionable ? 'hover:shadow-md hover:border-indigo-200' : 'opacity-70 bg-gray-50'}`}
              >
                  <div className="flex items-center flex-1 min-w-0">
                      <FiCalendar className={`w-6 h-6 mr-4 flex-shrink-0 ${isActionable ? 'text-indigo-500' : 'text-gray-400'}`} />
                      <div>
                          <p className="text-sm text-gray-500">Request for:</p>
                          <p className={`text-lg font-bold ${isActionable ? 'text-gray-800' : 'text-gray-600'}`}>{formatDate(req.bookingDate)}</p>
                      </div>
                  </div>
                  
                  <div className="flex items-center justify-end gap-3 flex-shrink-0">
                      {isActionable ? (
                          <>
                             <Button
                                  variant="outline"
                                  onClick={() => handleOpenDeclineModal(req)}
                                  className="!font-semibold !text-red-600 !border-red-300 hover:!bg-red-50"
                              >
                                  Not Interested
                              </Button>
                              <Button
                                  variant="primary"
                                  onClick={() => handleProvideAvailability(req)}
                                  className="!font-bold shadow-sm"
                              >
                                  Provide Availability
                              </Button>
                          </>
                      ) : (
                        getStatusBadge(req)
                      )}
                  </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="All Caught Up!"
          description="You have no new availability requests from the admin at this time."
          icon={<FiInbox className="h-16 w-16 text-gray-300" />}
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
    </div>
  );
};

export default Availability;
