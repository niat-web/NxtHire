// client/src/pages/admin/InterviewerFormModal.jsx

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSave, FiX } from 'react-icons/fi';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAlert } from '../../hooks/useAlert';
import { createInterviewer, updateInterviewer } from '../../api/admin.api';
import { DOMAINS, INTERVIEWER_STATUS, PAYMENT_TIERS } from '../../utils/constants';
import { createPortal } from 'react-dom'; // <--- STEP 1: ADD THIS IMPORT

const InterviewerFormDrawer = ({ isOpen, onClose, onSuccess, interviewerData }) => {
    const isEditMode = !!interviewerData;
    const { showSuccess, showError } = useAlert();
    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isSubmitting }
    } = useForm();

    // Data for dropdowns
    const [statusOptions] = useState(Object.values(INTERVIEWER_STATUS).map(s => ({ value: s, label: s })));
    const [domainOptions] = useState(DOMAINS);
    const [tierOptions] = useState(PAYMENT_TIERS.map(t => ({ value: t.value, label: t.label })));
    const [companyTypeOptions] = useState([
        { value: 'Other', label: 'Other' },
        { value: 'Product-based', label: 'Product-based' },
        { value: 'Service-based', label: 'Service-based' },
        { value: 'Startup', label: 'Startup' }
    ]);

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && interviewerData) {
                const transformedDomains = (interviewerData.domains || [])
                    .map(d => domainOptions.find(opt => opt.value === d))
                    .filter(Boolean);

                reset({
                    ...interviewerData.user,
                    ...interviewerData,
                    domains: transformedDomains,
                });
            } else {
                reset({ status: INTERVIEWER_STATUS.PROBATION, paymentTier: 'Tier 1', companyType: 'Other', domains: [] });
            }
        }
    }, [interviewerData, isEditMode, reset, isOpen, domainOptions]);

    const onSubmit = async (data) => {
        try {
            const payload = {
                ...data,
                domains: data.domains ? data.domains.map(d => d.value) : [],
            };
            if (isEditMode) {
                await updateInterviewer(interviewerData._id, payload);
                showSuccess('Interviewer updated successfully!');
            } else {
                await createInterviewer(payload);
                showSuccess('Interviewer created successfully!');
            }
            onSuccess();
        } catch (error) {
            showError(error.response?.data?.message || 'Operation failed.');
        }
    };

    const reactSelectStyles = { menuPortal: base => ({ ...base, zIndex: 100 }) };

    // STEP 2: WRAP THE ENTIRE RETURN IN createPortal
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
                        // STEP 3: Ensure h-screen is used instead of h-full
                        className="fixed top-0 right-0 h-screen w-full max-w-lg bg-white shadow-xl z-50 flex flex-col"
                    >
                        {/* Drawer Header */}
                        <div className="flex justify-between items-center p-3 border-b border-gray-200 flex-shrink-0">
                            <h2 className="text-xl font-semibold text-gray-800">{isEditMode ? 'Edit Interviewer' : 'Add New Interviewer'}</h2>
                            <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
                                <FiX className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Drawer Body (Scrollable Form) */}
                        <div className="flex-grow overflow-y-auto">
                            <form id="interviewer-form" onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                                <Input label="First Name" {...register('firstName', { required: 'First name is required' })} error={errors.firstName?.message} />
                                <Input label="Last Name" {...register('lastName', { required: 'Last name is required' })} error={errors.lastName?.message} />
                                <Input label="Email" type="email" {...register('email', { required: 'Email is required' })} error={errors.email?.message} />
                                <Input label="Phone Number" {...register('phoneNumber', { required: 'Phone is required' })} error={errors.phoneNumber?.message} />
                                <Input label="Interviewer ID (Optional)" {...register('interviewerId')} helpText="Internal tracking ID." />
                                <Input label="Payout ID (UUID)" {...register('payoutId')} helpText="Manually entered Payout ID." />
                                {!isEditMode && (
                                    <Input label="Temporary Password" type="password" {...register('password', { required: 'Password is required' })} error={errors.password?.message} />
                                )}
                                <Input label="Current Employer" {...register('currentEmployer', { required: 'Employer is required' })} error={errors.currentEmployer?.message} />
                                <Input label="Job Title" {...register('jobTitle', { required: 'Job title is required' })} error={errors.jobTitle?.message} />
                                <Input label="Years of Experience" type="number" step="0.1" {...register('yearsOfExperience', { required: 'Experience is required', valueAsNumber: true })} error={errors.yearsOfExperience?.message} />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Type</label>
                                    <select {...register('companyType')} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                                        {companyTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Domain(s) *</label>
                                    <Controller
                                        name="domains"
                                        control={control}
                                        rules={{ required: "At least one domain is required." }}
                                        render={({ field }) => <Select isMulti menuPortalTarget={document.body} styles={reactSelectStyles} options={domainOptions} {...field} />}
                                    />
                                    {errors.domains && <p className="mt-1 text-sm text-red-600">{errors.domains.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select {...register('status')} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">{statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Tier</label>
                                    <select {...register('paymentTier')} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">{tierOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>
                                </div>
                            </form>
                        </div>

                        {/* Drawer Footer */}
                        <div className="flex justify-end gap-4 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                            <Button type="submit" form="interviewer-form" variant="primary" isLoading={isSubmitting} icon={<FiSave/>}>
                                {isEditMode ? 'Save Changes' : 'Create Interviewer'}
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body // This renders the drawer as a direct child of <body>
    );
};

export default InterviewerFormDrawer;
