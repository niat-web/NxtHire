import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Mail,
  CheckCircle,
  Clock,
  User,
  Phone,
  Calendar,
  ArrowRight,
  Check,
  ArrowLeft,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { verifyPublicBookingEmail, getPublicAvailableSlots, bookPublicSlot } from '@/api/public.api';
import { useAlert } from '@/hooks/useAlert';
import { formatDate, formatTime } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// --- UI Sub-Components ---

const PageLoader = ({ text }) => (
  <div className="flex flex-col items-center justify-center text-center p-8 bg-white/90 rounded-xl shadow-xl m-4">
    <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
    <p className="text-lg font-semibold text-gray-800">{text}</p>
    <p className="text-sm text-gray-500 mt-2">Please wait...</p>
  </div>
);

const EmailVerificationStep = ({ onSubmit, register, errors, isSubmitting }) => (
  <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden transform transition-all duration-300 mx-auto m-4">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 -z-10 opacity-70"></div>

    <div className="p-8 sm:p-10 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6 shadow-inner">
        <Mail className="h-10 w-10 text-blue-600" />
      </div>
      <h2 className="text-3xl font-semibold text-gray-900 mb-2">Book Your Interview</h2>
      <p className="text-base text-gray-600">
        Please verify your email address to access available time slots.
      </p>
    </div>
    <form onSubmit={onSubmit} className="p-8 sm:p-10 bg-gray-50/50 border-t border-gray-200">
      <div className="mb-6">
        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            id="email"
            type="email"
            className={cn(
              'pl-12 h-11',
              errors.email && 'border-red-400 focus-visible:ring-red-500/20'
            )}
            placeholder="you@example.com"
            {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' } })}
          />
        </div>
        {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>}
      </div>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 shadow-md font-semibold"
        isLoading={isSubmitting}
      >
        {isSubmitting ? (
          'Verifying...'
        ) : (
          <>
            Verify & Proceed
            <ArrowRight className="ml-2" />
          </>
        )}
      </Button>
    </form>
  </div>
);

const BookingStep = ({ onSubmit, register, errors, isSubmitting, verifiedEmail, availableSlots, trigger }) => {
    const [mobileStep, setMobileStep] = useState(1);
    const [isValidating, setIsValidating] = useState(false);

    const handleNextStep = async () => {
        if (isValidating) return;
        setIsValidating(true);
        try {
            const isValid = await trigger(['studentName', 'studentPhone']);
            if (isValid) setMobileStep(2);
        } finally { setIsValidating(false); }
    };

    return (
        <form
            onSubmit={onSubmit}
            className="w-full h-screen bg-white flex flex-col overflow-hidden shadow-2xl"
        >
            <div className="flex flex-col lg:flex-row w-full flex-grow h-full">

                {/* LEFT PANEL: User Details */}
                <div className={cn(
                    'w-full lg:w-[30%] flex-shrink-0 border-b lg:border-b-0 lg:border-r border-gray-200 p-6 lg:p-8 flex flex-col bg-gray-50 lg:bg-gray-50/80',
                    mobileStep === 1 ? 'flex' : 'hidden lg:flex'
                )}>
                    <div className="lg:sticky lg:top-8">
                        <div className="mb-8">
                            <h2 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">Your Details</h2>
                            <p className="text-sm text-gray-500">Step 2 of 3</p>
                        </div>

                        <div className="space-y-6">
                            <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-md">
                                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1 block">Verified Email</label>
                                <div className="flex items-center gap-2 text-gray-800 font-medium">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    <span className="break-all">{verifiedEmail}</span>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="studentName" className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        id="studentName"
                                        className={cn(
                                            'pl-12 h-12 rounded-xl',
                                            errors.studentName && 'border-red-400 bg-red-50'
                                        )}
                                        {...register('studentName', { required: "Full name is required" })}
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                {errors.studentName && <p className="mt-1.5 text-xs text-red-600 flex items-center"><AlertTriangle className="mr-1 h-3 w-3"/>{errors.studentName.message}</p>}
                            </div>

                            <div>
                                <label htmlFor="studentPhone" className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        id="studentPhone"
                                        type="tel"
                                        className={cn(
                                            'pl-12 h-12 rounded-xl',
                                            errors.studentPhone && 'border-red-400 bg-red-50'
                                        )}
                                        {...register('studentPhone', { required: "Phone number is required" })}
                                        placeholder="Enter your 10-digit number"
                                    />
                                </div>
                                {errors.studentPhone && <p className="mt-1.5 text-xs text-red-600 flex items-center"><AlertTriangle className="mr-1 h-3 w-3"/>{errors.studentPhone.message}</p>}
                            </div>
                        </div>

                        {/* Desktop Submit Button */}
                        <div className="mt-10 hidden lg:block">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-xl shadow-md font-semibold"
                                isLoading={isSubmitting}
                            >
                                {isSubmitting ? 'Processing...' : 'Confirm My Booking'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: Slot Selection */}
                <div className={cn(
                    'w-full lg:w-[70%] p-6 lg:p-10 flex flex-col overflow-hidden bg-white',
                    mobileStep === 2 ? 'flex' : 'hidden lg:flex'
                )}>
                    <div className="mb-6 pb-4 border-b border-gray-100">
                        <h2 className="text-2xl lg:text-3xl font-semibold text-gray-900">Select a Time Slot</h2>
                        <p className="text-gray-500 mt-1">Choose an available time that works best for you.</p>
                    </div>

                    {errors.selectedSlot && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700">
                            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                            <p className="text-sm font-medium">{errors.selectedSlot.message}</p>
                        </div>
                    )}

                    <div className="flex-grow overflow-y-auto pr-2 space-y-8">
                        {availableSlots.length > 0 ? (
                            availableSlots.map((interviewerSlot) => (
                                <div key={interviewerSlot._id} className="animate-fadeIn">
                                    <div className="flex items-center gap-3 mb-4 sticky top-0 bg-white z-10 py-2">
                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-800">{formatDate(interviewerSlot.date)}</h3>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {interviewerSlot.timeSlots.map((slot) => (
                                            <label key={slot._id} className="relative group">
                                                <input
                                                    type="radio"
                                                    className="sr-only peer"
                                                    {...register('selectedSlot', { required: "Please select one time slot" })}
                                                    value={`${interviewerSlot.interviewer._id}|${slot.startTime}|${slot.endTime}`}
                                                />
                                                <div className="
                                                    flex flex-col items-center justify-center p-4
                                                    border-2 border-gray-100 rounded-xl cursor-pointer
                                                    transition-all duration-200
                                                    hover:border-blue-200 hover:bg-blue-50 hover:shadow-md
                                                    peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:shadow-lg
                                                    bg-white
                                                ">
                                                    <span className="text-sm font-semibold">{`${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`}</span>

                                                    <div className="absolute top-3 right-3 opacity-0 peer-checked:opacity-100 transition-opacity">
                                                        <div className="bg-white text-blue-600 rounded-full p-0.5">
                                                            <Check className="h-3 w-3" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                    <Clock className="h-10 w-10 text-gray-300" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Slots Available</h3>
                                <p className="text-gray-500 max-w-md">
                                    There are currently no available time slots. Please check back later or contact the administration.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Bar */}
            <div className="p-4 border-t border-gray-200 bg-white lg:hidden flex-shrink-0 safe-area-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                {mobileStep === 1 && (
                    <Button
                        type="button"
                        onClick={handleNextStep}
                        className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold"
                    >
                        Select Time Slot <ArrowRight className="ml-2" />
                    </Button>
                )}
                {mobileStep === 2 && (
                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setMobileStep(1)}
                            size="icon"
                            className="h-12 w-12 rounded-xl flex-shrink-0"
                        >
                            <ArrowLeft size={20} />
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-grow h-12 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 font-semibold"
                            isLoading={isSubmitting}
                        >
                            {isSubmitting ? 'Processing...' : 'Confirm Booking'}
                        </Button>
                    </div>
                )}
            </div>
        </form>
    );
};

const ConfirmationStep = ({ step, bookingDetails }) => (
  <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden transform transition-all duration-300 mx-auto m-4">
    <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-green-50 -z-10 opacity-70"></div>

    <div className="p-8 sm:p-10 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 shadow-inner">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>
      <h2 className="text-3xl font-semibold text-gray-900 mb-2">
        {step === 'already_booked' ? 'Booking Exists' : 'Interview Scheduled!'}
      </h2>
      <p className="text-base text-gray-600">
        A meeting link and confirmation details have been sent to your email shortly.
      </p>

      {bookingDetails && (
          <div className="mt-8 text-left bg-white/80 rounded-xl border border-green-100 p-6 shadow-md">
              <div className="space-y-4">
                  <div className="flex items-start gap-4">
                      <div className="p-2 bg-gray-100 rounded-lg text-gray-500"><User className="w-5 h-5" /></div>
                      <div>
                          <p className="text-xs text-gray-500 uppercase font-medium tracking-wide">Name</p>
                          <p className="font-semibold text-gray-900">{bookingDetails.studentName}</p>
                      </div>
                  </div>
                  <div className="flex items-start gap-4">
                      <div className="p-2 bg-gray-100 rounded-lg text-gray-500"><Calendar className="w-5 h-5" /></div>
                      <div>
                          <p className="text-xs text-gray-500 uppercase font-medium tracking-wide">Date</p>
                          <p className="font-semibold text-gray-900">{formatDate(bookingDetails.bookingDate)}</p>
                      </div>
                  </div>
                  <div className="flex items-start gap-4">
                      <div className="p-2 bg-gray-100 rounded-lg text-gray-500"><Clock className="w-5 h-5" /></div>
                      <div>
                          <p className="text-xs text-gray-500 uppercase font-medium tracking-wide">Time</p>
                          <p className="font-semibold text-gray-900">{`${formatTime(bookingDetails.bookedSlot.startTime)} - ${formatTime(bookingDetails.bookedSlot.endTime)}`}</p>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  </div>
);

const PublicBookingPage = () => {
    const { publicId } = useParams();
    const { showSuccess, showError } = useAlert();
    const { register, handleSubmit, formState: { errors, isSubmitting }, trigger } = useForm();

    const [step, setStep] = useState('verify_email');
    const [verifiedEmail, setVerifiedEmail] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [confirmedBooking, setConfirmedBooking] = useState(null);
    const [pageLoading, setPageLoading] = useState(false);
    const [pageError, setPageError] = useState(null);

    const handleEmailVerification = async (data) => {
        setPageLoading(true);
        setPageError(null);
        try {
            const response = await verifyPublicBookingEmail({ email: data.email, publicId });
            setVerifiedEmail(data.email);
            if (response.data.status === 'already_booked') {
                setConfirmedBooking(response.data.booking);
                setStep('already_booked');
            } else {
                const slotsResponse = await getPublicAvailableSlots(publicId);
                setAvailableSlots(slotsResponse.data.data);
                setStep('booking_form');
            }
        } catch (err) {
            setPageError(err.response?.data?.message || "Verification failed. Please check your email and try again.");
            showError(err.response?.data?.message || "Verification failed.");
        } finally {
            setPageLoading(false);
        }
    };

    const handleBookingSubmit = async (data) => {
        setPageLoading(true);
        setPageError(null);
        const [interviewerId, startTime, endTime] = data.selectedSlot.split('|');
        try {
            const bookingData = {
                studentName: data.studentName,
                studentPhone: data.studentPhone,
                studentEmail: verifiedEmail,
                interviewerId,
                slot: { startTime, endTime }
            };
            const response = await bookPublicSlot(publicId, bookingData);
            setConfirmedBooking(response.data.data);
            showSuccess('Your interview slot has been confirmed!');
            setStep('confirmed');
        } catch (err) {
            setPageError(err.response?.data?.message || 'Failed to book the slot. It might have been taken. Please refresh and try again.');
            showError(err.response?.data?.message || 'Failed to book the slot.');
        } finally {
            setPageLoading(false);
        }
    };

    return (
        <div className="h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-blue-50 font-sans relative overflow-hidden flex flex-col p-0">
            {/* Subtle Background Elements */}
            <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-[radial-gradient(ellipse_at_center,_rgba(120,119,198,0.3)_0%,_rgba(255,255,255,0)_70%)] opacity-50 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-[radial-gradient(ellipse_at_center,_rgba(79,70,229,0.3)_0%,_rgba(255,255,255,0)_70%)] opacity-40 pointer-events-none"></div>

            {/* Main Content Area */}
            <div className="flex-grow flex items-center justify-center relative z-10 w-full h-full">
                {pageLoading ? (
                    <PageLoader text="Loading..." />
                ) : pageError ? (
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-red-100 p-8 sm:p-10 text-center mx-auto m-4">
                        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-6" />
                        <h2 className="text-3xl font-semibold text-gray-900 mb-2">Error</h2>
                        <p className="text-base text-gray-600">{pageError}</p>
                    </div>
                ) : (
                    <>
                        {step === 'verify_email' && (
                            <EmailVerificationStep
                                onSubmit={handleSubmit(handleEmailVerification)}
                                register={register}
                                errors={errors}
                                isSubmitting={isSubmitting}
                            />
                        )}

                        {step === 'booking_form' && (
                            <BookingStep
                                onSubmit={handleSubmit(handleBookingSubmit)}
                                register={register}
                                errors={errors}
                                isSubmitting={isSubmitting}
                                verifiedEmail={verifiedEmail}
                                availableSlots={availableSlots}
                                trigger={trigger}
                            />
                        )}

                        {(step === 'confirmed' || step === 'already_booked') && (
                            <ConfirmationStep
                                step={step}
                                bookingDetails={confirmedBooking}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default PublicBookingPage;
