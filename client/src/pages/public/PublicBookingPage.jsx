import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, CheckCircle, Clock, User, Phone, Calendar, ArrowRight, Check, ArrowLeft, AlertTriangle, Loader2, Shield } from 'lucide-react';
import { verifyPublicBookingEmail, getPublicAvailableSlots, bookPublicSlot } from '@/api/public.api';
import { useAlert } from '@/hooks/useAlert';
import { formatDate, formatTime } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import logoSrc from '/logo.svg';

// ── Step 1: Email Verification ──
const EmailStep = ({ onSubmit, register, errors, isSubmitting }) => (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">

        <div className="flex-1 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-[380px]">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Book Your Interview</h1>
                    <p className="text-sm text-slate-500 mt-1.5">Verify your email to see available time slots</p>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input type="email" placeholder="you@example.com"
                                {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })}
                                className={cn('w-full pl-11 pr-4 h-12 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all',
                                    errors.email ? 'border-red-300' : 'border-slate-200')} />
                        </div>
                        {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>}
                    </div>

                    <button type="submit" disabled={isSubmitting}
                        className="w-full inline-flex items-center justify-center gap-2 h-12 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm shadow-blue-600/20">
                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <>Continue <ArrowRight size={16} /></>}
                    </button>
                </form>

                <div className="flex items-center justify-center gap-2 mt-6 text-xs text-slate-400">
                    <Shield size={12} /> Your information is secure and private
                </div>
            </div>
        </div>
    </div>
);

// ── Step 2: Booking Form ──
const BookingStep = ({ onSubmit, register, errors, isSubmitting, verifiedEmail, availableSlots, trigger }) => {
    const [mobileView, setMobileView] = useState('details'); // 'details' | 'slots'

    const handleContinue = async () => {
        const isValid = await trigger(['studentName', 'studentPhone']);
        if (isValid) setMobileView('slots');
    };

    const totalSlots = availableSlots.reduce((sum, s) => sum + s.timeSlots.length, 0);

    return (
        <form onSubmit={onSubmit} className="min-h-screen lg:h-screen flex flex-col bg-white overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-3">
                    <img src={logoSrc} alt="NxtHire" className="h-6" />
                    <div className="w-px h-6 bg-slate-200 hidden sm:block" />
                    <span className="text-sm font-semibold text-slate-900 hidden sm:block">Interview Booking</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-full">
                    <CheckCircle size={12} className="text-emerald-600" />
                    <span className="text-[11px] font-medium text-emerald-700 hidden sm:inline">{verifiedEmail}</span>
                    <span className="text-[11px] font-medium text-emerald-700 sm:hidden">Verified</span>
                </div>
            </div>

            {/* Mobile step indicator */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-100 lg:hidden">
                <button type="button" onClick={() => setMobileView('details')}
                    className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all',
                        mobileView === 'details' ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 border border-slate-200')}>
                    <User size={12} /> Details
                </button>
                <div className="w-4 h-px bg-slate-300" />
                <button type="button" onClick={handleContinue}
                    className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all',
                        mobileView === 'slots' ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 border border-slate-200')}>
                    <Calendar size={12} /> Slots ({totalSlots})
                </button>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Left panel: User details */}
                <div className={cn(
                    'w-full lg:w-[360px] xl:w-[400px] shrink-0 lg:border-r border-slate-100 flex flex-col',
                    mobileView === 'details' ? 'flex' : 'hidden lg:flex'
                )}>
                    <div className="flex-1 p-5 sm:p-6 overflow-y-auto">
                        <h2 className="text-lg font-bold text-slate-900 mb-0.5">Your Details</h2>
                        <p className="text-xs text-slate-400 mb-6">We need a few details to confirm your booking</p>

                        <div className="space-y-5">
                            {/* Verified email display */}
                            <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                                    <CheckCircle size={16} className="text-emerald-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Verified Email</p>
                                    <p className="text-sm font-medium text-slate-900 truncate">{verifiedEmail}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input type="text" placeholder="Enter your full name"
                                        {...register('studentName', { required: "Name is required" })}
                                        className={cn('w-full pl-11 pr-4 h-12 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400',
                                            errors.studentName ? 'border-red-300' : 'border-slate-200')} />
                                </div>
                                {errors.studentName && <p className="mt-1.5 text-xs text-red-500">{errors.studentName.message}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input type="tel" placeholder="10-digit phone number"
                                        {...register('studentPhone', { required: "Phone is required" })}
                                        className={cn('w-full pl-11 pr-4 h-12 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400',
                                            errors.studentPhone ? 'border-red-300' : 'border-slate-200')} />
                                </div>
                                {errors.studentPhone && <p className="mt-1.5 text-xs text-red-500">{errors.studentPhone.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Desktop confirm button */}
                    <div className="p-5 border-t border-slate-100 hidden lg:block">
                        <button type="submit" disabled={isSubmitting}
                            className="w-full inline-flex items-center justify-center gap-2 h-12 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm shadow-blue-600/20">
                            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <>Confirm Booking <Check size={16} /></>}
                        </button>
                    </div>
                </div>

                {/* Right panel: Slot selection */}
                <div className={cn(
                    'flex-1 flex flex-col overflow-hidden bg-[#fafbfd]',
                    mobileView === 'slots' ? 'flex' : 'hidden lg:flex'
                )}>
                    <div className="p-5 sm:p-6 border-b border-slate-100 shrink-0 bg-white">
                        <h2 className="text-lg font-bold text-slate-900">Choose a Time Slot</h2>
                        <p className="text-xs text-slate-400 mt-0.5">{totalSlots} slot{totalSlots !== 1 ? 's' : ''} available</p>
                    </div>

                    {errors.selectedSlot && (
                        <div className="mx-5 mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
                            <AlertTriangle size={14} /> {errors.selectedSlot.message}
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                        {availableSlots.length > 0 ? (
                            availableSlots.map((interviewerSlot) => (
                                <div key={interviewerSlot._id}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                            <Calendar size={14} className="text-blue-600" />
                                        </div>
                                        <h3 className="text-sm font-semibold text-slate-900">{formatDate(interviewerSlot.date)}</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {interviewerSlot.timeSlots.map((slot) => (
                                            <label key={slot._id} className="cursor-pointer">
                                                <input type="radio" className="sr-only peer"
                                                    {...register('selectedSlot', { required: "Please select a time slot" })}
                                                    value={`${interviewerSlot.interviewer._id}|${slot.startTime}|${slot.endTime}`} />
                                                <div className="inline-flex items-center gap-1.5 h-9 px-3.5 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-600 bg-white
                                                    transition-all duration-150
                                                    hover:border-blue-300 hover:bg-blue-50
                                                    peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-checked:text-white">
                                                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                                    <Clock size={24} className="text-slate-400" />
                                </div>
                                <h3 className="text-base font-semibold text-slate-900 mb-1">No Slots Available</h3>
                                <p className="text-sm text-slate-500 max-w-xs">There are no available time slots right now. Please check back later.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile bottom bar */}
            <div className="p-4 border-t border-slate-200 bg-white lg:hidden shrink-0 safe-area-bottom">
                {mobileView === 'details' ? (
                    <button type="button" onClick={handleContinue}
                        className="w-full inline-flex items-center justify-center gap-2 h-12 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-sm shadow-blue-600/20">
                        Choose Time Slot <ArrowRight size={16} />
                    </button>
                ) : (
                    <div className="flex gap-2.5">
                        <button type="button" onClick={() => setMobileView('details')}
                            className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 shrink-0">
                            <ArrowLeft size={18} />
                        </button>
                        <button type="submit" disabled={isSubmitting}
                            className="flex-1 inline-flex items-center justify-center gap-2 h-12 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm shadow-blue-600/20">
                            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <>Confirm Booking <Check size={16} /></>}
                        </button>
                    </div>
                )}
            </div>
        </form>
    );
};

// ── Step 3: Confirmation ──
const ConfirmationStep = ({ step, bookingDetails }) => (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">


        <div className="flex-1 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-[380px] text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle size={28} className="text-emerald-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {step === 'already_booked' ? 'Already Booked' : 'You\'re All Set!'}
                </h1>
                <p className="text-sm text-slate-500 mt-1.5">
                    A confirmation email with meeting details has been sent to you shortly.
                </p>

                {bookingDetails && (
                    <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-5 text-left space-y-4">
                        {[
                            { icon: User, label: 'Name', value: bookingDetails.studentName },
                            { icon: Calendar, label: 'Date', value: formatDate(bookingDetails.bookingDate) },
                            { icon: Clock, label: 'Time', value: `${formatTime(bookingDetails.bookedSlot.startTime)} - ${formatTime(bookingDetails.bookedSlot.endTime)}` },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                                    <item.icon size={16} className="text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{item.label}</p>
                                    <p className="text-sm font-semibold text-slate-900">{item.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
);

// ── Main ──
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
            setPageError(err.response?.data?.message || "Verification failed.");
            showError(err.response?.data?.message || "Verification failed.");
        } finally { setPageLoading(false); }
    };

    const handleBookingSubmit = async (data) => {
        setPageLoading(true);
        const [interviewerId, startTime, endTime] = data.selectedSlot.split('|');
        try {
            const response = await bookPublicSlot(publicId, {
                studentName: data.studentName, studentPhone: data.studentPhone,
                studentEmail: verifiedEmail, interviewerId, slot: { startTime, endTime }
            });
            setConfirmedBooking(response.data.data);
            showSuccess('Interview slot confirmed!');
            setStep('confirmed');
        } catch (err) {
            showError(err.response?.data?.message || 'Booking failed.');
        } finally { setPageLoading(false); }
    };

    if (pageLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="relative w-10 h-10 mx-auto mb-3">
                        <div className="w-10 h-10 rounded-full border-[3px] border-slate-200" />
                        <div className="absolute inset-0 w-10 h-10 rounded-full border-[3px] border-transparent border-t-blue-600 border-r-blue-600 animate-spin" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">Please wait...</p>
                </div>
            </div>
        );
    }

    if (pageError && step === 'verify_email') {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-4">
                <div className="w-full max-w-[380px] text-center">
                    <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle size={24} className="text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-1">Something went wrong</h2>
                    <p className="text-sm text-slate-500">{pageError}</p>
                    <button onClick={() => { setPageError(null); }} className="mt-5 inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            {step === 'verify_email' && <EmailStep onSubmit={handleSubmit(handleEmailVerification)} register={register} errors={errors} isSubmitting={isSubmitting} />}
            {step === 'booking_form' && <BookingStep onSubmit={handleSubmit(handleBookingSubmit)} register={register} errors={errors} isSubmitting={isSubmitting} verifiedEmail={verifiedEmail} availableSlots={availableSlots} trigger={trigger} />}
            {(step === 'confirmed' || step === 'already_booked') && <ConfirmationStep step={step} bookingDetails={confirmedBooking} />}
        </>
    );
};

export default PublicBookingPage;
