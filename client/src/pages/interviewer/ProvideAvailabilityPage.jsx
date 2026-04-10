// client/src/pages/interviewer/ProvideAvailabilityPage.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Calendar, Clock, User, Building2, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useAlert } from '../../hooks/useAlert';
import { submitTimeSlots } from '../../api/interviewer.api';
import AvailabilityForm from '../../components/interviewer/AvailabilityForm';
import { useBookingRequests, useInvalidateInterviewer } from '../../hooks/useInterviewerQueries';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ProvideAvailabilityPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: allRequests, isLoading: loading, error: queryError } = useBookingRequests();
  const { invalidateBookings } = useInvalidateInterviewer();

  const bookingRequest = useMemo(() => {
    if (!allRequests) return null;
    return allRequests.find(r => r.bookingId === bookingId) || null;
  }, [allRequests, bookingId]);

  // Navigate away if data loaded but request not found
  useEffect(() => {
    if (!loading && allRequests && !bookingRequest) {
      showError("Could not load booking request details.");
      navigate('/interviewer/availability');
    }
  }, [loading, allRequests, bookingRequest, showError, navigate]);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await submitTimeSlots(bookingId, data);
      invalidateBookings();
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full mx-4">
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50">
      {/* Enhanced Header with Glassmorphism Effect */}
        <div className="sticky top-0 z-30 bg-gradient-to-br from-indigo-50/80 via-white/80 to-indigo-50/80 backdrop-blur-sm border-b border-gray-200">
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
                <Button
                  type="submit"
                  form="availability-form"
                  variant="success"
                  size="lg"
                  isLoading={isSubmitting}
                  className="shadow-sm hover:shadow-md"
                  aria-label={isSubmitting ? 'Submitting availability' : 'Submit availability'}
                >
                  {!isSubmitting && <Save className="w-4 h-4 mr-2" />}
                  {isSubmitting ? 'Submitting...' : 'Submit Availability'}
                </Button>
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Card Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-600 px-6 py-5">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">Interview Details</h2>
                      <p className="text-indigo-100 text-sm">Booking ID: {bookingId}</p>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                {bookingRequest && (
                  <div className="p-6 space-y-6">
                    {/* Interview Date */}
                    <div className="flex items-start space-x-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-indigo-600 uppercase tracking-wider mb-1">Interview Date</p>
                        <p className="text-lg font-semibold text-gray-900 leading-tight">
                          {formatDate(bookingRequest.bookingDate)}
                        </p>
                      </div>
                    </div>

                    {/* Candidate Information */}
                    {bookingRequest.candidateName && (
                      <div className="flex items-start space-x-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <User className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-indigo-600 uppercase tracking-wider mb-1">Candidate</p>
                          <p className="text-lg font-semibold text-gray-900 leading-tight truncate">
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
                          <p className="text-xs font-medium text-purple-600 uppercase tracking-wider mb-1">Position</p>
                          <p className="text-lg font-semibold text-gray-900 leading-tight">
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
                        <p className="text-xs font-medium text-amber-600 uppercase tracking-wider mb-1">Status</p>
                        <div className="flex items-center mt-2">
                          <Badge variant="warning" className="px-3 py-1.5 text-sm">
                            <AlertCircle className="w-4 h-4 mr-1.5" />
                            Awaiting Availability
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tips and Guidelines Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-white mr-3" />
                    <h3 className="text-lg font-semibold text-white">Best Practices</h3>
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
                        <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
          <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full transform animate-pulse">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 mx-auto relative">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Submitting Your Availability</h3>
              <p className="text-gray-600 leading-relaxed">
                Please wait while we process your time slots and notify the candidate...
              </p>
              <div className="mt-6 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-600 to-indigo-600 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProvideAvailabilityPage;
