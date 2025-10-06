// // client/src/pages/interviewer/ProvideAvailabilityPage.jsx
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate, Link } from 'react-router-dom';
// import { FiArrowLeft, FiSave } from 'react-icons/fi';
// import { useAlert } from '../../hooks/useAlert';
// import { getBookingRequests, submitTimeSlots } from '../../api/interviewer.api';
// import AvailabilityForm from '../../components/interviewer/AvailabilityForm';
// import Loader from '../../components/common/Loader';

// const ProvideAvailabilityPage = () => {
//     const { bookingId } = useParams();
//     const navigate = useNavigate();
//     const { showSuccess, showError } = useAlert();

//     const [bookingRequest, setBookingRequest] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [isSubmitting, setIsSubmitting] = useState(false);

//     useEffect(() => {
//         getBookingRequests()
//             .then(res => {
//                 const request = res.data.data.find(r => r.bookingId === bookingId);
//                 if (request) {
//                     setBookingRequest(request);
//                 } else {
//                     throw new Error("Booking request not found.");
//                 }
//             })
//             .catch(() => {
//                 showError("Could not load booking request details.");
//                 navigate('/interviewer/availability');
//             })
//             .finally(() => setLoading(false));
//     }, [bookingId, navigate, showError]);

//     const handleSubmit = async (data) => {
//         setIsSubmitting(true);
//         try {
//             await submitTimeSlots(bookingId, data);
//             showSuccess('Availability submitted successfully!');
//             navigate('/interviewer/availability');
//         } catch (error) {
//             showError(error.response?.data?.message || 'Failed to submit availability.');
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     if (loading) {
//         return <div className="flex h-full items-center justify-center"><Loader text="Loading Request..." /></div>;
//     }
    
//     return (
//         <div className="h-full w-full flex flex-col bg-white overflow-hidden">
//             {/* Header */}
//             <div className="p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
//                 <div>
//                     <Link to="/interviewer/availability" className="text-m text-gray-600 hover:text-gray-900 flex items-center mb-1">
//                         <FiArrowLeft className="mr-2" /> Back to Requests
//                     </Link>
//                 </div>
//                 <button
//                     type="submit"
//                     form="availability-form"
//                     disabled={isSubmitting}
//                     className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-60 bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
//                 >
//                    {isSubmitting ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"/> : <FiSave className="h-4 w-4 mr-2"/>}
//                    {isSubmitting ? 'Submitting...' : 'Submit Slots'}
//                 </button>
//             </div>

//             {/* Form Area */}
//             <div className="flex-grow p-6 overflow-y-auto">
//                  {bookingRequest && (
//                     <AvailabilityForm 
//                         onSubmit={handleSubmit}
//                         bookingDate={bookingRequest.bookingDate}
//                         isSubmitting={isSubmitting}
//                     />
//                  )}
//             </div>
//         </div>
//     );
// };

// export default ProvideAvailabilityPage;


// client/src/pages/interviewer/ProvideAvailabilityPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Calendar, Clock, User, Building2, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useAlert } from '../../hooks/useAlert';
import { getBookingRequests, submitTimeSlots } from '../../api/interviewer.api';
import AvailabilityForm from '../../components/interviewer/AvailabilityForm';

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 mx-auto mb-6 relative">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Interview Details</h3>
            <p className="text-gray-600">Please wait while we fetch the booking information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Enhanced Header with Glassmorphism Effect */}
        <div className="sticky top-0 z-30 bg-gradient-to-br from-indigo-50/80 via-white/80 to-purple-50/80 backdrop-blur-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                {/* Navigation */}
                <nav className="flex items-center space-x-4">
                <Link
                    to="/interviewer/availability"
                    className="group flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    aria-label="Go back to availability requests"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                    Back to Requests
                </Link>
                </nav>

                {/* Action Button */}
                <button
                type="submit"
                form="availability-form"
                disabled={isSubmitting}
                className="group relative inline-flex items-center px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
                aria-label={isSubmitting ? 'Submitting availability' : 'Submit availability'}
                >
                {isSubmitting ? (
                    <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                    </>
                ) : (
                    <>
                    <Save className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    Submit Availability
                    </>
                )}
                </button>
            </div>
            </div>
        </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Interview Details Sidebar */}
          <aside className="xl:col-span-4">
            <div className="sticky top-24 space-y-6">
              {/* Main Details Card */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Card Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Interview Details</h2>
                      <p className="text-indigo-100 text-sm">Booking ID: {bookingId}</p>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                {bookingRequest && (
                  <div className="p-6 space-y-6">
                    {/* Interview Date */}
                    <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Interview Date</p>
                        <p className="text-lg font-bold text-gray-900 leading-tight">
                          {formatDate(bookingRequest.bookingDate)}
                        </p>
                      </div>
                    </div>

                    {/* Candidate Information */}
                    {bookingRequest.candidateName && (
                      <div className="flex items-start space-x-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <User className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">Candidate</p>
                          <p className="text-lg font-bold text-gray-900 leading-tight truncate">
                            {bookingRequest.candidateName}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Position */}
                    {bookingRequest.position && (
                      <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">Position</p>
                          <p className="text-lg font-bold text-gray-900 leading-tight">
                            {bookingRequest.position}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Status */}
                    <div className="flex items-start space-x-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Clock className="w-6 h-6 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">Status</p>
                        <div className="flex items-center mt-2">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                            <AlertCircle className="w-4 h-4 mr-1.5" />
                            Awaiting Availability
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tips and Guidelines Card */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-white mr-3" />
                    <h3 className="text-lg font-bold text-white">Best Practices</h3>
                  </div>
                </div>
                <div className="p-6">
                  <ul className="space-y-4">
                    {[
                      'Provide multiple time slots for flexibility',
                      'Choose times when you\'re most alert',
                      'Ensure stable internet for video calls'
                    ].map((tip, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                        </div>
                        <span className="text-sm text-gray-700 leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Form Area */}
          <section className="xl:col-span-8">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Form Content */}
              <div className="p-8">
                {bookingRequest && (
                  <AvailabilityForm
                    onSubmit={handleSubmit}
                    bookingDate={bookingRequest.bookingDate}
                    isSubmitting={isSubmitting}
                  />
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Enhanced Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full transform animate-pulse">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 mx-auto relative">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Submitting Your Availability</h3>
              <p className="text-gray-600 leading-relaxed">
                Please wait while we process your time slots and notify the candidate...
              </p>
              <div className="mt-6 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProvideAvailabilityPage;
