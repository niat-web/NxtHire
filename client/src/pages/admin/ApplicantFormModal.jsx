import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { useAlert } from '../../hooks/useAlert';
import { APPLICATION_STATUS } from '../../utils/constants';
import { useSourcingChannels } from '../../hooks/useAdminQueries';
import { createApplicant, updateApplicant } from '../../api/admin.api';

const ApplicantFormModal = ({ isOpen, onClose, onSuccess, applicantData }) => {
    const SOURCING_CHANNELS = useSourcingChannels();
    const isEditMode = !!applicantData;
    const { showSuccess, showError } = useAlert();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm();

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && applicantData) {
                reset(applicantData);
            } else {
                reset({
                    fullName: '', email: '', phoneNumber: '', whatsappNumber: '',
                    linkedinProfileUrl: '', interestedInJoining: true, sourcingChannel: '', status: APPLICATION_STATUS.SUBMITTED
                });
            }
        }
    }, [applicantData, isEditMode, reset, isOpen]);
    
    const statusOptions = Object.values(APPLICATION_STATUS).map(s => ({ value: s, label: s }));

    const onSubmit = async (data) => {
        try {
            if (isEditMode) {
                await updateApplicant(applicantData._id, data);
                showSuccess('Applicant updated successfully!');
            } else {
                await createApplicant(data);
                showSuccess('Applicant created successfully!');
            }
            onSuccess();
        } catch (error) {
            showError(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} applicant.`);
        }
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 z-40"
                    />

                    {/* Drawer Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
                        className="fixed top-0 right-0 h-screen w-full max-w-lg bg-white shadow-xl z-50 flex flex-col"
                    >
                        {/* Drawer Header */}
                        <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
                            <h2 className="text-xl font-semibold text-gray-800">{isEditMode ? 'Edit Applicant' : 'Add New Applicant'}</h2>
                            <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Drawer Body (Scrollable Form) */}
                        <div className="flex-grow overflow-y-auto">
                            <form id="applicant-form" onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name<span className="text-red-600 ml-1">*</span></label>
                                        <input type="text" {...register('fullName', { required: 'Full name is required' })} className={`h-10 w-full rounded-lg border ${errors.fullName ? 'border-red-300' : 'border-slate-200'} bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300`} />
                                        {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>}
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address<span className="text-red-600 ml-1">*</span></label>
                                        <input type="email" {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })} className={`h-10 w-full rounded-lg border ${errors.email ? 'border-red-300' : 'border-slate-200'} bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300`} />
                                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number<span className="text-red-600 ml-1">*</span></label>
                                        <input type="text" {...register('phoneNumber', { required: 'Phone number is required' })} className={`h-10 w-full rounded-lg border ${errors.phoneNumber ? 'border-red-300' : 'border-slate-200'} bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300`} />
                                        {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>}
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                                        <input type="text" {...register('whatsappNumber')} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300" />
                                        <p className="mt-1 text-sm text-gray-500">Optional</p>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile URL<span className="text-red-600 ml-1">*</span></label>
                                    <input type="text" {...register('linkedinProfileUrl', { required: 'LinkedIn URL is required', validate: v => v.includes('linkedin.com/') || 'Invalid URL' })} className={`h-10 w-full rounded-lg border ${errors.linkedinProfileUrl ? 'border-red-300' : 'border-slate-200'} bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300`} />
                                    {errors.linkedinProfileUrl && <p className="mt-1 text-sm text-red-600">{errors.linkedinProfileUrl.message}</p>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">How did you hear?<span className="text-red-600 ml-1">*</span></label>
                                        <select {...register('sourcingChannel', { required: 'Source is required' })} className={`h-10 w-full rounded-lg border ${errors.sourcingChannel ? 'border-red-300' : 'border-slate-200'} bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300`}>
                                            <option value="" disabled>Select source</option>
                                            {SOURCING_CHANNELS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                        </select>
                                        {errors.sourcingChannel && <p className="mt-1 text-sm text-red-600">{errors.sourcingChannel.message}</p>}
                                     </div>
                                     <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status<span className="text-red-600 ml-1">*</span></label>
                                        <select {...register('status', { required: 'Status is required' })} className={`h-10 w-full rounded-lg border ${errors.status ? 'border-red-300' : 'border-slate-200'} bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300`}>
                                            <option value="" disabled>Select status</option>
                                            {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                        </select>
                                        {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
                                     </div>
                                </div>
                                <div className="flex items-center">
                                    <input type="checkbox" id="interestedInJoining" {...register('interestedInJoining')} className="h-4 w-4 text-primary-600 rounded" />
                                    <label htmlFor="interestedInJoining" className="ml-2 text-sm text-gray-700">Interested in Joining</label>
                                </div>
                            </form>
                        </div>

                        {/* Drawer Footer */}
                        <div className="flex justify-end gap-4 p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                            <button type="button" onClick={onClose} className="px-4 h-10 text-sm font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                            <button type="submit" form="applicant-form" disabled={isSubmitting} className="px-4 h-10 text-sm font-medium rounded-md bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition-colors inline-flex items-center">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSubmitting ? 'Saving...' : 'Save Applicant'}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default ApplicantFormModal;
