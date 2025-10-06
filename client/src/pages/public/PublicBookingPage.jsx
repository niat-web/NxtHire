// // client/src/pages/public/PublicBookingPage.jsx

// import React, { useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { useForm } from 'react-hook-form';
// import { FiMail, FiCheckCircle, FiClock, FiUser, FiPhone, FiCalendar, FiArrowRight } from 'react-icons/fi';
// import { verifyPublicBookingEmail, getPublicAvailableSlots, bookPublicSlot } from '@/api/public.api';
// import { useAlert } from '@/hooks/useAlert';
// import { formatDate, formatTime } from '@/utils/formatters';

// const PublicBookingPage = () => {
//     const { publicId } = useParams();
//     const { showSuccess, showError } = useAlert();
//     const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    
//     // --- MODIFICATION: The 'loading' state is no longer needed for form submissions ---
//     // const [loading, setLoading] = useState(false); 
//     const [step, setStep] = useState('verify_email');
//     const [verifiedEmail, setVerifiedEmail] = useState('');
//     const [availableSlots, setAvailableSlots] = useState([]);
//     const [confirmedBooking, setConfirmedBooking] = useState(null);

//     const handleEmailVerification = async (data) => {
//         // setLoading(true); // <-- REMOVE
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
//         // finally { // <-- REMOVE
//         //     setLoading(false);
//         // }
//     };

//     const handleBookingSubmit = async (data) => {
//         // setLoading(true); // <-- REMOVE
//         const [interviewerId, startTime, endTime] = data.selectedSlot.split('|');

//         try {
//             const bookingData = {
//                 studentName: data.studentName,
//                 studentPhone: data.studentPhone,
//                 studentEmail: verifiedEmail,
//                 interviewerId,
//                 slot: { startTime, endTime },
//             };
            
//             const response = await bookPublicSlot(publicId, bookingData);
//             setConfirmedBooking(response.data.data);
//             showSuccess('Your interview slot has been confirmed!');
//             setStep('confirmed');
//         } catch (err) {
//             showError(err.response?.data?.message || 'Failed to book the slot. It might have just been taken. Please refresh and try again.');
//         } 
//         // finally { // <-- REMOVE
//         //     setLoading(false);
//         // }
//     };
    
//     // --- MODIFICATION: REMOVE the top-level loader return statement ---
//     /*
//     if (loading) {
//         return (
//             <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
//                 <div className="text-center">
//                     <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
//                     <p className="mt-4 text-gray-600">Processing...</p>
//                 </div>
//             </div>
//         );
//     }
//     */


//     return (
//         <div className="h-screen bg-gray-100 font-sans">
//             <div className="w-full h-full">
//                 {step === 'verify_email' && (
//                     <div className="w-full h-full flex items-center justify-center p-4">
//                         <div className="w-full max-w-md bg-white rounded-lg shadow-md border border-gray-200">
//                             <div className="p-6 border-b">
//                                 <h2 className="text-xl font-semibold text-gray-800">Verify Your Email</h2>
//                             </div>
//                             <form onSubmit={handleSubmit(handleEmailVerification)} className="p-6">
//                                 <p className="text-gray-600 mb-4 text-sm">
//                                     Please enter the email address where you received the interview invitation.
//                                 </p>
//                                 <div className="mb-4">
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
//                                     <div className="relative">
//                                         <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//                                         <input
//                                             type="email"
//                                             className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
//                                             placeholder="you@example.com"
//                                             {...register('email', { required: 'Email is required' })}
//                                         />
//                                     </div>
//                                     {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
//                                 </div>
//                                 {/* MODIFICATION: The isSubmitting state is now handled correctly */}
//                                 <button
//                                     type="submit"
//                                     disabled={isSubmitting}
//                                     className="w-full flex justify-center items-center py-2 px-4 border rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
//                                 >
//                                     {isSubmitting ? 'Verifying...' : 'Proceed'}
//                                     {!isSubmitting && <FiArrowRight className="ml-2 h-4 w-4" />}
//                                 </button>
//                             </form>
//                         </div>
//                     </div>
//                 )}
                
//                 {step === 'booking_form' && (
//                     <form 
//                         onSubmit={handleSubmit(handleBookingSubmit)} 
//                         className="w-full h-full bg-white overflow-hidden"
//                     >
//                         <div className="flex flex-col md:flex-row w-full h-full">
//                             {/* Left Side: User Details */}
//                             <div className="w-full md:w-[400px] flex-shrink-0 border-b md:border-b-0 md:border-r border-gray-200 p-6 flex flex-col">
//                                 <h2 className="text-xl font-bold text-gray-800 mb-6 pb-4 border-b">Your Details</h2>
//                                 <div className="flex-grow space-y-4">
//                                     <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-md">
//                                         <FiMail className="h-4 w-4 text-gray-500" />
//                                         <input
//                                             type="email"
//                                             className="text-sm text-gray-800 break-all bg-transparent border-none w-full focus:ring-0"
//                                             value={verifiedEmail}
//                                             readOnly
//                                             disabled
//                                         />
//                                     </div>
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
//                                         <div className="relative">
//                                             <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//                                             <input
//                                                 className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
//                                                 {...register('studentName', { required: "Full name is required" })}
//                                             />
//                                         </div>
//                                         {errors.studentName && <p className="mt-1 text-xs text-red-600">{errors.studentName.message}</p>}
//                                     </div>
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
//                                         <div className="relative">
//                                             <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//                                             <input
//                                                 type="tel"
//                                                 className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
//                                                 {...register('studentPhone', { required: "Phone number is required" })}
//                                             />
//                                         </div>
//                                         {errors.studentPhone && <p className="mt-1 text-xs text-red-600">{errors.studentPhone.message}</p>}
//                                     </div>
//                                 </div>
//                                 <div className="mt-auto pt-6 flex-shrink-0">
//                                      {/* MODIFICATION: The isSubmitting state is now handled correctly */}
//                                     <button
//                                         type="submit"
//                                         disabled={isSubmitting}
//                                         className="w-full flex justify-center py-2.5 px-4 border rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
//                                     >
//                                         {isSubmitting ? 'Booking...' : 'Confirm My Booking'}
//                                     </button>
//                                 </div>
//                             </div>

//                             {/* Right Side: Slot Selection (Scrollable) */}
//                             <div className="w-full md:flex-1 p-6 flex flex-col overflow-hidden">
//                                 <h2 className="text-xl font-bold text-gray-800 mb-4 pb-4 border-b flex-shrink-0">Select an Available Time Slot</h2>
//                                 {errors.selectedSlot && <p className="mb-2 text-xs text-red-600 flex-shrink-0">{errors.selectedSlot.message}</p>}
//                                 <div className="flex-grow overflow-y-auto space-y-6 pr-2">
//                                     {availableSlots.length > 0 ? (
//                                         availableSlots.map((interviewerSlot) => (
//                                             <div key={interviewerSlot._id}>
//                                                 <div className="flex items-center gap-2 mb-2">
//                                                     <FiCalendar className="h-4 w-4 text-gray-500" />
//                                                     <h3 className="text-sm font-semibold text-gray-800">{formatDate(interviewerSlot.date)}</h3>
//                                                 </div>
//                                                 <div className="text-xs text-gray-600 mb-3 ml-1">
//                                                     <FiUser className="inline-block mr-1 h-3 w-3" />
//                                                     {interviewerSlot.interviewer.user.firstName} {interviewerSlot.interviewer.user.lastName}
//                                                 </div>
//                                                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2">
//                                                     {interviewerSlot.timeSlots.map((slot) => (
//                                                         <label key={slot._id} className="relative block">
//                                                             <input
//                                                                 type="radio"
//                                                                 className="sr-only peer"
//                                                                 {...register('selectedSlot', { required: "Please select one time slot" })}
//                                                                 value={`${interviewerSlot.interviewer._id}|${slot.startTime}|${slot.endTime}`}
//                                                             />
//                                                             <div className="text-center p-2 border border-gray-300 rounded-md cursor-pointer text-sm text-gray-700 hover:border-blue-500 hover:bg-blue-50 peer-checked:bg-blue-100 peer-checked:border-blue-500 peer-checked:font-semibold peer-checked:text-blue-800">
//                                                                 {`${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`}
//                                                             </div>
//                                                         </label>
//                                                     ))}
//                                                 </div>
//                                             </div>
//                                         ))
//                                     ) : (
//                                         <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
//                                             <FiClock className="h-8 w-8 mb-2" />
//                                             <p className="font-semibold">No slots currently available.</p>
//                                             <p className="text-sm">Please check back later.</p>
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                     </form>
//                 )}

//                 {(step === 'confirmed' || step === 'already_booked') && (
//                      <div className="w-full h-full flex items-center justify-center p-4">
//                         <div className="w-full max-w-xl bg-white rounded-lg shadow-md border border-gray-200">
//                              <div className="p-6 border-b">
//                                 <h2 className="text-xl font-semibold text-gray-800">Booking Confirmed</h2>
//                             </div>
//                             <div className="p-8 text-center">
//                                 <FiCheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
//                                 <h3 className="text-xl font-bold text-gray-800 mb-2">
//                                     {step === 'already_booked' ? 'You Have a Previous Booking' : 'Your Interview is Scheduled!'}
//                                 </h3>
//                                 <p className="text-gray-600 mb-6">
//                                 Your meeting link will be sent shortly. Please keep an eye on your email for further details..
//                                 </p>
//                                 {confirmedBooking && (
//                                     <div className="text-left bg-gray-50 rounded-lg border p-4 space-y-3">
//                                         <div className="flex items-center">
//                                             <FiUser className="w-4 h-4 mr-3 text-gray-500"/>
//                                             <span className="text-sm text-gray-600">Name:</span>
//                                             <span className="ml-2 font-medium text-gray-800">{confirmedBooking.studentName}</span>
//                                         </div>
//                                         <div className="flex items-center">
//                                             <FiCalendar className="w-4 h-4 mr-3 text-gray-500"/>
//                                             <span className="text-sm text-gray-600">Date:</span>
//                                             <span className="ml-2 font-medium text-gray-800">{formatDate(confirmedBooking.bookingDate)}</span>
//                                         </div>
//                                         <div className="flex items-center">
//                                             <FiClock className="w-4 h-4 mr-3 text-gray-500"/>
//                                             <span className="text-sm text-gray-600">Time:</span>
//                                             <span className="ml-2 font-medium text-gray-800">{`${confirmedBooking.bookedSlot.startTime} - ${confirmedBooking.bookedSlot.endTime}`}</span>
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                      </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default PublicBookingPage;


import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiMail, FiCheckCircle, FiClock, FiUser, FiPhone, FiCalendar, FiArrowRight, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { verifyPublicBookingEmail, getPublicAvailableSlots, bookPublicSlot } from '@/api/public.api';
import { useAlert } from '@/hooks/useAlert';
import { formatDate, formatTime } from '@/utils/formatters';

// --- UI Sub-Components for Each Step ---

const EmailVerificationStep = ({ onSubmit, register, errors, isSubmitting }) => (
    <motion.div
        key="verify-email"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50"
    >
        <div className="p-8 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800">Book Your Interview</h2>
            <p className="mt-2 text-slate-600 text-sm">
                Please verify your email address to access available time slots.
            </p>
        </div>
        <form onSubmit={onSubmit} className="p-8">
            <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="email"
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl text-sm transition-colors ${errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20'} focus:outline-none focus:ring-4`}
                        placeholder="you@example.com"
                        {...register('email', { required: 'Email is required' })}
                    />
                </div>
                {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>}
            </div>
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border rounded-xl text-white font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:scale-[1.02]"
            >
                {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <>
                        <span>Verify & Proceed</span>
                        <FiArrowRight />
                    </>
                )}
            </button>
        </form>
    </motion.div>
);

const BookingStep = ({ onSubmit, register, errors, isSubmitting, verifiedEmail, availableSlots }) => (
    <motion.form
        key="booking-form"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        onSubmit={onSubmit}
        className="w-full max-w-6xl h-auto md:h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200/50 flex flex-col overflow-hidden"
    >
        <div className="flex flex-col md:flex-row w-full flex-grow md:h-full">
            {/* Left Side: User Details */}
            <div className="w-full md:w-[380px] flex-shrink-0 border-b md:border-b-0 md:border-r border-slate-200 p-6 flex flex-col bg-slate-50/70 md:overflow-y-auto">
                <div className="md:sticky md:top-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Step 2: Your Details</h2>
                    <p className="text-sm text-slate-500 mb-6 pb-4 border-b border-slate-200">Confirm your information and select a time slot.</p>
                    <div className="flex-grow space-y-5">
                        <div>
                            <label className="text-xs font-semibold text-slate-600 uppercase">Email Address</label>
                            <div className="flex items-center gap-3 mt-2 p-3 bg-white border border-slate-300 rounded-lg shadow-inner">
                                <FiCheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                <span className="text-sm text-slate-800 break-all">{verifiedEmail}</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                            <div className="relative">
                                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl text-sm ${errors.studentName ? 'border-red-400' : 'border-slate-300'} focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500`} {...register('studentName', { required: "Full name is required" })} placeholder="Enter your full name" />
                            </div>
                            {errors.studentName && <p className="mt-1 text-xs text-red-600">{errors.studentName.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                            <div className="relative">
                                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="tel" className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl text-sm ${errors.studentPhone ? 'border-red-400' : 'border-slate-300'} focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500`} {...register('studentPhone', { required: "Phone number is required" })} placeholder="Enter your 10-digit number" />
                            </div>
                            {errors.studentPhone && <p className="mt-1 text-xs text-red-600">{errors.studentPhone.message}</p>}
                        </div>
                    </div>
                    <div className="mt-auto pt-6 flex-shrink-0">
                         <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-3.5 px-4 border rounded-xl text-white font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 shadow-lg">
                            {isSubmitting ? 'Confirming...' : 'Confirm My Booking'}
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Right Side: Slot Selection */}
            <div className="w-full md:flex-1 p-6 flex flex-col overflow-hidden">
                <h2 className="text-xl font-bold text-slate-800 mb-4 pb-4 border-b border-slate-200 flex-shrink-0">Select an Available Time Slot</h2>
                {errors.selectedSlot && <p className="mb-4 text-xs text-red-600 flex-shrink-0 bg-red-50 p-3 rounded-lg border border-red-200">{errors.selectedSlot.message}</p>}
                <div className="flex-grow overflow-y-auto space-y-8 pr-3 -mr-3">
                    {availableSlots.length > 0 ? (
                        availableSlots.map((interviewerSlot) => (
                            <div key={interviewerSlot._id}>
                                <div className="flex items-center gap-3 mb-4">
                                    <FiCalendar className="h-5 w-5 text-indigo-500" />
                                    <h3 className="text-lg font-bold text-slate-800">{formatDate(interviewerSlot.date)}</h3>
                                    <div className="text-xs text-slate-500 ml-auto bg-slate-100 px-2 py-1 rounded">
                                        <FiUser className="inline-block mr-1.5 h-3 w-3" />
                                        {interviewerSlot.interviewer.user.firstName} {interviewerSlot.interviewer.user.lastName}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {interviewerSlot.timeSlots.map((slot) => (
                                        <label key={slot._id} className="relative block">
                                            <input type="radio" className="sr-only peer" {...register('selectedSlot', { required: "Please select one time slot" })} value={`${interviewerSlot.interviewer._id}|${slot.startTime}|${slot.endTime}`} />
                                            <div className="text-center p-3 border-2 border-slate-300 rounded-lg cursor-pointer text-sm text-slate-700 hover:border-indigo-500 hover:bg-indigo-50 peer-checked:bg-indigo-100 peer-checked:border-indigo-600 peer-checked:font-semibold peer-checked:text-indigo-800 transition-all duration-200 relative">
                                                {`${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`}
                                                <FiCheck className="h-4 w-4 text-white bg-indigo-600 rounded-full p-0.5 absolute -top-1.5 -right-1.5 opacity-0 peer-checked:opacity-100 transition-opacity" />
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-10">
                            <FiClock className="h-10 w-10 mb-4" />
                            <p className="font-semibold text-slate-700">No Slots Currently Available</p>
                            <p className="text-sm mt-1">Please check back later or contact support if you believe this is an error.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </motion.form>
);

const ConfirmationStep = ({ step, bookingDetails }) => (
    <motion.div
        key={step}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200"
    >
        <div className="p-8 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 10 }}>
                <FiCheckCircle className="h-16 w-16 text-green-500 mx-auto mb-5" />
            </motion.div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
                {step === 'already_booked' ? 'You Have a Booking' : 'Your Interview is Scheduled!'}
            </h2>
            <p className="text-slate-600 mb-6">A meeting link and confirmation have been sent to your email.</p>
            {bookingDetails && (
                <div className="text-left bg-slate-50 rounded-lg border border-slate-200 p-5 space-y-4">
                    <div className="flex items-center"><FiUser className="w-4 h-4 mr-4 text-slate-500 flex-shrink-0" /><span className="text-sm text-slate-600">Name:</span><span className="ml-2 font-semibold text-slate-900">{bookingDetails.studentName}</span></div>
                    <div className="flex items-center"><FiCalendar className="w-4 h-4 mr-4 text-slate-500 flex-shrink-0" /><span className="text-sm text-slate-600">Date:</span><span className="ml-2 font-semibold text-slate-900">{formatDate(bookingDetails.bookingDate)}</span></div>
                    <div className="flex items-center"><FiClock className="w-4 h-4 mr-4 text-slate-500 flex-shrink-0" /><span className="text-sm text-slate-600">Time:</span><span className="ml-2 font-semibold text-slate-900">{`${formatTime(bookingDetails.bookedSlot.startTime)} - ${formatTime(bookingDetails.bookedSlot.endTime)}`}</span></div>
                </div>
            )}
        </div>
    </motion.div>
);

const PublicBookingPage = () => {
    const { publicId } = useParams();
    const { showSuccess, showError } = useAlert();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    
    const [step, setStep] = useState('verify_email');
    const [verifiedEmail, setVerifiedEmail] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [confirmedBooking, setConfirmedBooking] = useState(null);

    const handleEmailVerification = async (data) => {
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
            showError(err.response?.data?.message || "Verification failed. Please check your email and try again.");
        } 
    };

    const handleBookingSubmit = async (data) => {
        const [interviewerId, startTime, endTime] = data.selectedSlot.split('|');
        try {
            const bookingData = { studentName: data.studentName, studentPhone: data.studentPhone, studentEmail: verifiedEmail, interviewerId, slot: { startTime, endTime } };
            const response = await bookPublicSlot(publicId, bookingData);
            setConfirmedBooking(response.data.data);
            showSuccess('Your interview slot has been confirmed!');
            setStep('confirmed');
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to book the slot. It might have been taken. Please refresh and try again.');
        } 
    };

    return (
        <div className="min-h-screen bg-slate-900 font-sans relative overflow-hidden">
            <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-[radial-gradient(ellipse_at_center,_rgba(120,119,198,0.3)_0%,_rgba(255,255,255,0)_70%)] opacity-50"></div>
            <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-[radial-gradient(ellipse_at_center,_rgba(79,70,229,0.3)_0%,_rgba(255,255,255,0)_70%)] opacity-40"></div>

            <div className="w-full min-h-screen flex items-start md:items-center justify-center p-4 md:p-8">
                <AnimatePresence mode="wait">
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
                        />
                    )}

                    {(step === 'confirmed' || step === 'already_booked') && (
                         <ConfirmationStep 
                             step={step}
                             bookingDetails={confirmedBooking} 
                         />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PublicBookingPage;
