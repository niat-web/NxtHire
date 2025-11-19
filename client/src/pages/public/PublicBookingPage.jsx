// import React, { useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { useForm } from 'react-hook-form';
// import { FiMail, FiCheckCircle, FiClock, FiUser, FiPhone, FiCalendar, FiArrowRight, FiCheck, FiArrowLeft } from 'react-icons/fi';
// import { verifyPublicBookingEmail, getPublicAvailableSlots, bookPublicSlot } from '@/api/public.api';
// import { useAlert } from '@/hooks/useAlert';
// import { formatDate, formatTime } from '@/utils/formatters';

// // --- UI Sub-Components for Each Step ---

// const EmailVerificationStep = ({ onSubmit, register, errors, isSubmitting }) => (
//     <div
//         className="w-full max-w-md bg-slate-200/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20"
//     >
//         <div className="p-8 border-b border-slate-300/50">
//             <h2 className="text-2xl font-bold text-slate-800">Book Your Interview</h2>
//             <p className="mt-2 text-slate-600 text-sm">
//                 Please verify your email address to access available time slots.
//             </p>
//         </div>
//         <form onSubmit={onSubmit} className="p-8">
//             <div className="mb-6">
//                 <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
//                 <div className="relative">
//                     <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
//                     <input
//                         type="email"
//                         className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl text-sm transition-colors ${errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20'} focus:outline-none focus:ring-4`}
//                         placeholder="you@example.com"
//                         {...register('email', { required: 'Email is required' })}
//                     />
//                 </div>
//                 {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>}
//             </div>
//             <button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className="w-full flex justify-center items-center gap-2 py-3 px-4 border rounded-xl text-white font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:scale-[1.02]"
//             >
//                 {isSubmitting ? (
//                     <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
//                 ) : (
//                     <>
//                         <span>Verify & Proceed</span>
//                         <FiArrowRight />
//                     </>
//                 )}
//             </button>
//         </form>
//     </div>
// );

// const BookingStep = ({ onSubmit, register, errors, isSubmitting, verifiedEmail, availableSlots, trigger }) => {
//     const [mobileStep, setMobileStep] = useState(1);

//     const handleNextStep = async () => {
//         const isValid = await trigger(['studentName', 'studentPhone']);
//         if (isValid) {
//             setMobileStep(2);
//         }
//     };
    
//     return (
//         <form
//             onSubmit={onSubmit}
//             className="w-full max-w-6xl h-auto md:h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200/50 flex flex-col overflow-hidden"
//         >
//             <div className="flex flex-col md:flex-row w-full flex-grow md:h-full">
//                 <div className={`w-full md:w-[380px] flex-shrink-0 border-b md:border-b-0 md:border-r border-slate-200 p-4 md:p-6 bg-slate-50/70 md:overflow-y-auto ${mobileStep === 1 ? 'flex flex-col' : 'hidden md:flex md:flex-col'}`}>
//                     <div className="md:sticky md:top-6">
//                         <h2 className="text-xl font-bold text-slate-800 mb-2">Step 2: Your Details</h2>
//                         <p className="text-sm text-slate-500 mb-6 pb-4 border-b border-slate-200">Confirm your information and select a time slot.</p>
//                         <div className="flex-grow space-y-5">
//                             <div>
//                                 <label className="text-xs font-semibold text-slate-600 uppercase">Email Address</label>
//                                 <div className="flex items-center gap-3 mt-2 p-3 bg-white border border-slate-300 rounded-lg shadow-inner">
//                                     <FiCheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
//                                     <span className="text-sm text-slate-800 break-all">{verifiedEmail}</span>
//                                 </div>
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
//                                 <div className="relative">
//                                     <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
//                                     <input className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl text-sm ${errors.studentName ? 'border-red-400' : 'border-slate-300'} focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500`} {...register('studentName', { required: "Full name is required" })} placeholder="Enter your full name" />
//                                 </div>
//                                 {errors.studentName && <p className="mt-1 text-xs text-red-600">{errors.studentName.message}</p>}
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
//                                 <div className="relative">
//                                     <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
//                                     <input type="tel" className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl text-sm ${errors.studentPhone ? 'border-red-400' : 'border-slate-300'} focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500`} {...register('studentPhone', { required: "Phone number is required" })} placeholder="Enter your 10-digit number" />
//                                 </div>
//                                 {errors.studentPhone && <p className="mt-1 text-xs text-red-600">{errors.studentPhone.message}</p>}
//                             </div>
//                         </div>
//                         <div className="mt-auto pt-6 flex-shrink-0 hidden md:block">
//                             <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-3.5 px-4 border rounded-xl text-white font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 shadow-lg">
//                                 {isSubmitting ? 'Confirming...' : 'Confirm My Booking'}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
                
//                 <div className={`w-full md:flex-1 p-4 md:p-6 flex flex-col overflow-hidden ${mobileStep === 2 ? 'flex' : 'hidden md:flex'}`}>
//                     <h2 className="text-xl font-bold text-slate-800 mb-4 pb-4 border-b border-slate-200 flex-shrink-0">Step 3: Select an Available Time Slot</h2>
//                     {errors.selectedSlot && <p className="mb-4 text-xs text-red-600 flex-shrink-0 bg-red-50 p-3 rounded-lg border border-red-200">{errors.selectedSlot.message}</p>}
//                     <div className="flex-grow overflow-y-auto space-y-8 pr-3 -mr-3">
//                         {availableSlots.length > 0 ? (
//                             availableSlots.map((interviewerSlot) => (
//                                 <div key={interviewerSlot._id}>
//                                     <div className="flex items-center gap-3 mb-4">
//                                         <FiCalendar className="h-5 w-5 text-indigo-500" />
//                                         <h3 className="text-lg font-bold text-slate-800">{formatDate(interviewerSlot.date)}</h3>
//                                         <div className="text-xs text-slate-500 ml-auto bg-slate-100 px-2 py-1 rounded">
//                                             <FiUser className="inline-block mr-1.5 h-3 w-3" />
//                                             {interviewerSlot.interviewer.user.firstName} {interviewerSlot.interviewer.user.lastName}
//                                         </div>
//                                     </div>
//                                     <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
//                                         {interviewerSlot.timeSlots.map((slot) => (
//                                             <label key={slot._id} className="relative block">
//                                                 <input type="radio" className="sr-only peer" {...register('selectedSlot', { required: "Please select one time slot" })} value={`${interviewerSlot.interviewer._id}|${slot.startTime}|${slot.endTime}`} />
//                                                 <div className="text-center p-3 border-2 border-slate-300 rounded-lg cursor-pointer text-sm text-slate-700 hover:border-indigo-500 hover:bg-indigo-50 peer-checked:bg-indigo-100 peer-checked:border-indigo-600 peer-checked:font-semibold peer-checked:text-indigo-800 transition-all duration-200 relative">
//                                                     {`${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`}
//                                                     <FiCheck className="h-4 w-4 text-white bg-indigo-600 rounded-full p-0.5 absolute -top-1.5 -right-1.5 opacity-0 peer-checked:opacity-100 transition-opacity" />
//                                                 </div>
//                                             </label>
//                                         ))}
//                                     </div>
//                                 </div>
//                             ))
//                         ) : (
//                             <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-10">
//                                 <FiClock className="h-10 w-10 mb-4" />
//                                 <p className="font-semibold text-slate-700">No Slots Currently Available</p>
//                                 <p className="text-sm mt-1">Please check back later or contact support if you believe this is an error.</p>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>
            
//             <div className="p-4 border-t border-slate-200 bg-slate-50/70 md:hidden">
//                 {mobileStep === 1 && (
//                     <button
//                         type="button"
//                         onClick={handleNextStep}
//                         className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border rounded-xl text-white font-semibold bg-indigo-600 hover:bg-indigo-700 shadow-lg"
//                     >
//                         Next <FiArrowRight />
//                     </button>
//                 )}
//                 {mobileStep === 2 && (
//                     <div className="flex items-center gap-4">
//                         <button
//                             type="button"
//                             onClick={() => setMobileStep(1)}
//                             className="flex justify-center items-center gap-2 py-3.5 px-4 border-2 border-slate-300 rounded-xl text-slate-700 font-semibold bg-white hover:bg-slate-50"
//                         >
//                             <FiArrowLeft /> Back
//                         </button>
//                         <button
//                             type="submit"
//                             disabled={isSubmitting}
//                             className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border rounded-xl text-white font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 shadow-lg"
//                         >
//                             {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
//                         </button>
//                     </div>
//                 )}
//             </div>
//         </form>
//     );
// };

// const ConfirmationStep = ({ step, bookingDetails }) => (
//     <div
//         className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200"
//     >
//         <div className="p-6 sm:p-8 text-center">
//             <div>
//                 <FiCheckCircle className="h-16 w-16 text-green-500 mx-auto mb-5" />
//             </div>
//             <h2 className="text-2xl font-bold text-slate-800 mb-2">
//                 {step === 'already_booked' ? 'You Have a Booking' : 'Your Interview is Scheduled!'}
//             </h2>
//             <p className="text-slate-600 mb-6">A meeting link and confirmation have been sent to your email.</p>
//             {bookingDetails && (
//                 <div className="text-left bg-slate-50 rounded-lg border border-slate-200 p-5 space-y-4">
//                     <div className="flex items-center"><FiUser className="w-4 h-4 mr-4 text-slate-500 flex-shrink-0" /><span className="text-sm text-slate-600">Name:</span><span className="ml-2 font-semibold text-slate-900">{bookingDetails.studentName}</span></div>
//                     <div className="flex items-center"><FiCalendar className="w-4 h-4 mr-4 text-slate-500 flex-shrink-0" /><span className="text-sm text-slate-600">Date:</span><span className="ml-2 font-semibold text-slate-900">{formatDate(bookingDetails.bookingDate)}</span></div>
//                     <div className="flex items-center"><FiClock className="w-4 h-4 mr-4 text-slate-500 flex-shrink-0" /><span className="text-sm text-slate-600">Time:</span><span className="ml-2 font-semibold text-slate-900">{`${formatTime(bookingDetails.bookedSlot.startTime)} - ${formatTime(bookingDetails.bookedSlot.endTime)}`}</span></div>
//                 </div>
//             )}
//         </div>
//     </div>
// );

// const PublicBookingPage = () => {
//     const { publicId } = useParams();
//     const { showSuccess, showError } = useAlert();
//     const { register, handleSubmit, formState: { errors, isSubmitting }, trigger } = useForm();
    
//     const [step, setStep] = useState('verify_email');
//     const [verifiedEmail, setVerifiedEmail] = useState('');
//     const [availableSlots, setAvailableSlots] = useState([]);
//     const [confirmedBooking, setConfirmedBooking] = useState(null);

//     const handleEmailVerification = async (data) => {
//         try {
//             const response = await verifyPublicBookingEmail({ email: data.email, publicId });
//             setVerifiedEmail(data.email);
//             if (response.data.status === 'already_booked') {
//                 setConfirmedBooking(response.data.booking);
//                 setStep('already_booked');
//             } else {
//                 const slotsResponse = await getPublicAvailableSlots(publicId);
//                 setAvailableSlots(slotsResponse.data.data);
//                 setStep('booking_form');
//             }
//         } catch (err) {
//             showError(err.response?.data?.message || "Verification failed. Please check your email and try again.");
//         } 
//     };

//     const handleBookingSubmit = async (data) => {
//         const [interviewerId, startTime, endTime] = data.selectedSlot.split('|');
//         try {
//             const bookingData = { studentName: data.studentName, studentPhone: data.studentPhone, studentEmail: verifiedEmail, interviewerId, slot: { startTime, endTime } };
//             const response = await bookPublicSlot(publicId, bookingData);
//             setConfirmedBooking(response.data.data);
//             showSuccess('Your interview slot has been confirmed!');
//             setStep('confirmed');
//         } catch (err) {
//             showError(err.response?.data?.message || 'Failed to book the slot. It might have been taken. Please refresh and try again.');
//         } 
//     };

//     return (
//         <div className="min-h-screen bg-slate-900 font-sans relative overflow-hidden">
//             <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-[radial-gradient(ellipse_at_center,_rgba(120,119,198,0.3)_0%,_rgba(255,255,255,0)_70%)] opacity-50"></div>
//             <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-[radial-gradient(ellipse_at_center,_rgba(79,70,229,0.3)_0%,_rgba(255,255,255,0)_70%)] opacity-40"></div>

//             <div className="w-full min-h-screen flex items-start md:items-center justify-center p-4 md:p-8">
//                 {step === 'verify_email' && (
//                     <EmailVerificationStep 
//                         onSubmit={handleSubmit(handleEmailVerification)}
//                         register={register}
//                         errors={errors}
//                         isSubmitting={isSubmitting}
//                     />
//                 )}
                
//                 {step === 'booking_form' && (
//                     <BookingStep
//                         onSubmit={handleSubmit(handleBookingSubmit)}
//                         register={register}
//                         errors={errors}
//                         isSubmitting={isSubmitting}
//                         verifiedEmail={verifiedEmail}
//                         availableSlots={availableSlots}
//                         trigger={trigger}
//                     />
//                 )}

//                 {(step === 'confirmed' || step === 'already_booked') && (
//                      <ConfirmationStep 
//                          step={step}
//                          bookingDetails={confirmedBooking} 
//                      />
//                 )}
//             </div>
//         </div>
//     );
// };

// export default PublicBookingPage;



import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  FiMail,
  FiCheckCircle,
  FiClock,
  FiUser,
  FiPhone,
  FiCalendar,
  FiArrowRight,
  FiCheck,
  FiArrowLeft,
  FiAlertTriangle,
  FiLoader
} from 'react-icons/fi';
import { verifyPublicBookingEmail, getPublicAvailableSlots, bookPublicSlot } from '@/api/public.api';
import { useAlert } from '@/hooks/useAlert';
import { formatDate, formatTime } from '@/utils/formatters';

// --- UI Sub-Components ---

const Loader = ({ text }) => (
  <div className="flex flex-col items-center justify-center text-center p-8 bg-white/90 rounded-xl shadow-xl m-4">
    <FiLoader className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
    <p className="text-lg font-semibold text-gray-800">{text}</p>
    <p className="text-sm text-gray-500 mt-2">Please wait...</p>
  </div>
);

const EmailVerificationStep = ({ onSubmit, register, errors, isSubmitting }) => (
  // ADDED: max-w-md and m-4 to restrict width and add safety margin on mobile
  <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden transform transition-all duration-300 mx-auto m-4">
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-blue-50 -z-10 opacity-70"></div>
    
    <div className="p-8 sm:p-10 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-6 shadow-inner">
        <FiMail className="h-10 w-10 text-indigo-600" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Book Your Interview</h2>
      <p className="text-base text-gray-600">
        Please verify your email address to access available time slots.
      </p>
    </div>
    <form onSubmit={onSubmit} className="p-8 sm:p-10 bg-gray-50/50 border-t border-gray-200">
      <div className="mb-6">
        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
        <div className="relative">
          <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            id="email"
            type="email"
            className={`w-full pl-12 pr-4 py-3 border rounded-lg text-sm transition-colors duration-200 ${
              errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20'
            } focus:outline-none focus:ring-2 bg-white`}
            placeholder="you@example.com"
            {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' } })}
          />
        </div>
        {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center items-center gap-2 py-3 px-4 border rounded-lg text-white font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:scale-[1.02] duration-300"
      >
        {isSubmitting ? (
          <>
            <FiLoader className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
            <span>Verifying...</span>
          </>
        ) : (
          <>
            <span>Verify & Proceed</span>
            <FiArrowRight />
          </>
        )}
      </button>
    </form>
  </div>
);

const BookingStep = ({ onSubmit, register, errors, isSubmitting, verifiedEmail, availableSlots, trigger }) => {
    const [mobileStep, setMobileStep] = useState(1);

    const handleNextStep = async () => {
        const isValid = await trigger(['studentName', 'studentPhone']);
        if (isValid) {
            setMobileStep(2);
        }
    };
    
    return (
        // Full screen height, no margins/padding on the container itself
        <form
            onSubmit={onSubmit}
            className="w-full h-screen bg-white flex flex-col overflow-hidden shadow-2xl"
        >
            <div className="flex flex-col lg:flex-row w-full flex-grow h-full">
                
                {/* LEFT PANEL: User Details (Step 2) */}
                {/* Desktop: 30% width, gray background. Mobile: Full width, white background. */}
                <div className={`w-full lg:w-[30%] flex-shrink-0 border-b lg:border-b-0 lg:border-r border-gray-200 p-6 lg:p-8 flex flex-col bg-gray-50 lg:bg-gray-50/80 ${mobileStep === 1 ? 'flex' : 'hidden lg:flex'}`}>
                    <div className="lg:sticky lg:top-8">
                        <div className="mb-8">
                            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Your Details</h2>
                            <p className="text-sm text-gray-500">Step 2 of 3</p>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Verified Email</label>
                                <div className="flex items-center gap-2 text-gray-800 font-medium">
                                    <FiCheckCircle className="h-5 w-5 text-green-500" />
                                    <span className="break-all">{verifiedEmail}</span>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="studentName" className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                <div className="relative">
                                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        id="studentName"
                                        className={`w-full pl-12 pr-4 py-3.5 border rounded-xl text-sm transition-all ${errors.studentName ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-indigo-500 bg-white'} focus:ring-4 focus:ring-indigo-500/10 outline-none`} 
                                        {...register('studentName', { required: "Full name is required" })} 
                                        placeholder="Enter your full name" 
                                    />
                                </div>
                                {errors.studentName && <p className="mt-1.5 text-xs text-red-600 flex items-center"><FiAlertTriangle className="mr-1"/>{errors.studentName.message}</p>}
                            </div>

                            <div>
                                <label htmlFor="studentPhone" className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                                <div className="relative">
                                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        id="studentPhone"
                                        type="tel" 
                                        className={`w-full pl-12 pr-4 py-3.5 border rounded-xl text-sm transition-all ${errors.studentPhone ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-indigo-500 bg-white'} focus:ring-4 focus:ring-indigo-500/10 outline-none`} 
                                        {...register('studentPhone', { required: "Phone number is required" })} 
                                        placeholder="Enter your 10-digit number" 
                                    />
                                </div>
                                {errors.studentPhone && <p className="mt-1.5 text-xs text-red-600 flex items-center"><FiAlertTriangle className="mr-1"/>{errors.studentPhone.message}</p>}
                            </div>
                        </div>

                        {/* Desktop Submit Button */}
                        <div className="mt-10 hidden lg:block">
                            <button type="submit" disabled={isSubmitting} className="w-full flex justify-center items-center gap-2 py-4 px-6 border border-transparent rounded-xl text-white font-bold bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 disabled:bg-indigo-300 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5">
                                {isSubmitting ? (
                                    <>
                                        <FiLoader className="animate-spin w-5 h-5" />
                                        Processing...
                                    </>
                                ) : (
                                    'Confirm My Booking'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* RIGHT PANEL: Slot Selection (Step 3) */}
                {/* Desktop: 70% width. Mobile: Full width. */}
                <div className={`w-full lg:w-[70%] p-6 lg:p-10 flex flex-col overflow-hidden bg-white ${mobileStep === 2 ? 'flex' : 'hidden lg:flex'}`}>
                    <div className="mb-6 pb-4 border-b border-gray-100">
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Select a Time Slot</h2>
                        <p className="text-gray-500 mt-1">Choose an available time that works best for you.</p>
                    </div>

                    {errors.selectedSlot && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700">
                            <FiAlertTriangle className="h-5 w-5 flex-shrink-0" />
                            <p className="text-sm font-medium">{errors.selectedSlot.message}</p>
                        </div>
                    )}

                    <div className="flex-grow overflow-y-auto pr-2 space-y-8">
                        {availableSlots.length > 0 ? (
                            availableSlots.map((interviewerSlot) => (
                                <div key={interviewerSlot._id} className="animate-fadeIn">
                                    <div className="flex items-center gap-3 mb-4 sticky top-0 bg-white z-10 py-2">
                                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                            <FiCalendar className="h-5 w-5" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800">{formatDate(interviewerSlot.date)}</h3>
                                        
                                        {/* Optional: Show interviewer name if needed, or keep it anonymous */}
                                        {/* <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full ml-auto">
                                            <FiUser className="h-3 w-3" />
                                            {interviewerSlot.interviewer.user.firstName}
                                        </div> */}
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
                                                    hover:border-indigo-200 hover:bg-indigo-50 hover:shadow-md
                                                    peer-checked:border-indigo-600 peer-checked:bg-indigo-600 peer-checked:text-white peer-checked:shadow-lg
                                                    bg-white
                                                ">
                                                    <span className="text-sm font-bold">{`${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`}</span>
                                                    
                                                    <div className="absolute top-3 right-3 opacity-0 peer-checked:opacity-100 transition-opacity">
                                                        <div className="bg-white text-indigo-600 rounded-full p-0.5">
                                                            <FiCheck className="h-3 w-3" />
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
                                    <FiClock className="h-10 w-10 text-gray-300" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">No Slots Available</h3>
                                <p className="text-gray-500 max-w-md">
                                    There are currently no available time slots. Please check back later or contact the administration.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Mobile Navigation Bar (Fixed at bottom) */}
            <div className="p-4 border-t border-gray-200 bg-white lg:hidden flex-shrink-0 safe-area-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                {mobileStep === 1 && (
                    <button
                        type="button"
                        onClick={handleNextStep}
                        className="w-full flex justify-center items-center gap-2 py-4 px-6 rounded-xl text-white font-bold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
                    >
                        Select Time Slot <FiArrowRight />
                    </button>
                )}
                {mobileStep === 2 && (
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setMobileStep(1)}
                            className="flex-shrink-0 p-4 border border-gray-200 rounded-xl text-gray-600 bg-gray-50 hover:bg-gray-100 active:bg-gray-200"
                        >
                            <FiArrowLeft size={20} />
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-grow flex justify-center items-center gap-2 py-4 px-6 rounded-xl text-white font-bold bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 active:bg-indigo-800 transition-colors"
                        >
                            {isSubmitting ? 'Processing...' : 'Confirm Booking'}
                        </button>
                    </div>
                )}
            </div>
        </form>
    );
};

const ConfirmationStep = ({ step, bookingDetails }) => (
  // ADDED: max-w-md and m-4 to restrict width and add safety margin
  <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden transform transition-all duration-300 mx-auto m-4">
    <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-blue-50 -z-10 opacity-70"></div>

    <div className="p-8 sm:p-10 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 shadow-inner">
        <FiCheckCircle className="h-10 w-10 text-green-600" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">
        {step === 'already_booked' ? 'Booking Exists' : 'Interview Scheduled!'}
      </h2>
      <p className="text-base text-gray-600">
        A meeting link and confirmation details have been sent to your email shortly.
      </p>
      
      {bookingDetails && (
          <div className="mt-8 text-left bg-white/80 rounded-xl border border-green-100 p-6 shadow-sm">
              <div className="space-y-4">
                  <div className="flex items-start gap-4">
                      <div className="p-2 bg-gray-100 rounded-lg text-gray-500"><FiUser className="w-5 h-5" /></div>
                      <div>
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Name</p>
                          <p className="font-semibold text-gray-900">{bookingDetails.studentName}</p>
                      </div>
                  </div>
                  <div className="flex items-start gap-4">
                      <div className="p-2 bg-gray-100 rounded-lg text-gray-500"><FiCalendar className="w-5 h-5" /></div>
                      <div>
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Date</p>
                          <p className="font-semibold text-gray-900">{formatDate(bookingDetails.bookingDate)}</p>
                      </div>
                  </div>
                  <div className="flex items-start gap-4">
                      <div className="p-2 bg-gray-100 rounded-lg text-gray-500"><FiClock className="w-5 h-5" /></div>
                      <div>
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Time</p>
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
    
    const [step, setStep] = useState('verify_email'); // 'verify_email', 'booking_form', 'confirmed', 'already_booked', 'error'
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
        <div className="h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 font-sans relative overflow-hidden flex flex-col p-0">
            {/* Subtle Animated Background Elements */}
            <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-[radial-gradient(ellipse_at_center,_rgba(120,119,198,0.3)_0%,_rgba(255,255,255,0)_70%)] opacity-50 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-[radial-gradient(ellipse_at_center,_rgba(79,70,229,0.3)_0%,_rgba(255,255,255,0)_70%)] opacity-40 pointer-events-none"></div>

            {/* Main Content Area */}
            <div className="flex-grow flex items-center justify-center relative z-10 w-full h-full">
                {pageLoading ? (
                    <Loader text="Loading..." />
                ) : pageError ? (
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-red-100 p-8 sm:p-10 text-center mx-auto m-4">
                        <FiAlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-6" />
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Error</h2>
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
