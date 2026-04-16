// client/src/pages/admin/InterviewerFormModal.jsx

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import ReactSelect from 'react-select';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, X, Loader2, Info } from 'lucide-react';
import { useAlert } from '../../hooks/useAlert';
import { createInterviewer, updateInterviewer } from '../../api/admin.api';
import { DOMAINS, INTERVIEWER_STATUS } from '../../utils/constants';
import { createPortal } from 'react-dom';

const InterviewerFormDrawer = ({ isOpen, onClose, onSuccess, interviewerData }) => {
    const isEditMode = !!interviewerData;
    const { showSuccess, showError } = useAlert();
    const {
        register,
        handleSubmit,
        reset,
        control,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm();

    const [statusOptions] = useState(Object.values(INTERVIEWER_STATUS).map(s => ({ value: s, label: s })));
    const [domainOptions] = useState(DOMAINS);
    const [companyTypeOptions] = useState([
        { value: 'Other', label: 'Other' },
        { value: 'Product-based', label: 'Product-based' },
        { value: 'Service-based', label: 'Service-based' },
        { value: 'Startup', label: 'Startup' }
    ]);

    // Watch source to toggle fields
    const source = watch('source', 'External');

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
                    source: interviewerData.source || 'External',
                });
            } else {
                reset({ status: INTERVIEWER_STATUS.PROBATION, paymentAmount: '', companyType: 'Other', domains: [], source: 'External' });
            }
        }
    }, [interviewerData, isEditMode, reset, isOpen, domainOptions]);

    const onSubmit = async (data) => {
        try {
            const payload = {
                ...data,
                domains: data.domains ? data.domains.map(d => d.value) : [],
                source: data.source || 'External',
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

    const inputClass = (hasError) => `h-10 w-full rounded-lg border ${hasError ? 'border-red-300' : 'border-slate-200'} bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300`;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }} onClick={onClose}
                        className="fixed inset-0 bg-black/60 z-40"
                    />

                    <motion.div
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
                        className="fixed top-0 right-0 h-screen w-full max-w-lg bg-white shadow-xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-200 flex-shrink-0">
                            <h2 className="text-base font-semibold text-slate-900">{isEditMode ? 'Edit Interviewer' : 'Add New Interviewer'}</h2>
                            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-grow overflow-y-auto">
                            <form id="interviewer-form" onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">

                                {/* Source selector — only on create */}
                                {!isEditMode && (
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Source Type</label>
                                        <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-100">
                                            <button type="button" onClick={() => setValue('source', 'Internal')}
                                                className={`flex-1 py-2 text-[13px] font-semibold rounded-md transition-all ${source === 'Internal' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                                Internal
                                            </button>
                                            <button type="button" onClick={() => setValue('source', 'External')}
                                                className={`flex-1 py-2 text-[13px] font-semibold rounded-md transition-all ${source === 'External' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                                External
                                            </button>
                                        </div>
                                        {source === 'Internal' && (
                                            <div className="mt-2 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50/60 p-3 text-[12px] text-blue-800 leading-relaxed">
                                                <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
                                                <span>Internal interviewers require only basic details. Additional fields can be updated later.</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── Common fields (both Internal & External) ── */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">First Name *</label>
                                        <input type="text" {...register('firstName', { required: 'Required' })} className={inputClass(errors.firstName)} />
                                        {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Last Name *</label>
                                        <input type="text" {...register('lastName', { required: 'Required' })} className={inputClass(errors.lastName)} />
                                        {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Email *</label>
                                    <input type="email" {...register('email', { required: 'Required' })} className={inputClass(errors.email)} />
                                    {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Phone Number *</label>
                                    <input type="text" {...register('phoneNumber', { required: 'Required' })} className={inputClass(errors.phoneNumber)} />
                                    {errors.phoneNumber && <p className="mt-1 text-xs text-red-600">{errors.phoneNumber.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Domain(s) *</label>
                                    <Controller
                                        name="domains"
                                        control={control}
                                        rules={{ required: "At least one domain is required." }}
                                        render={({ field }) => <ReactSelect isMulti menuPortalTarget={document.body} styles={reactSelectStyles} options={domainOptions} {...field} />}
                                    />
                                    {errors.domains && <p className="mt-1 text-xs text-red-600">{errors.domains.message}</p>}
                                </div>

                                {/* Password info — only on create */}
                                {!isEditMode && (
                                    <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3 text-[12px] text-blue-800 leading-relaxed">
                                        <p className="font-semibold text-blue-900 mb-0.5">Password setup via email</p>
                                        The interviewer will receive a welcome email with a secure link to set their own password. No password is required here.
                                    </div>
                                )}

                                {/* ── External-only fields (or always show in edit mode) ── */}
                                {(source === 'External' || isEditMode) && (
                                    <>
                                        <div className="pt-2 border-t border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-3">Professional Details</p>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Current Employer {source === 'External' && !isEditMode ? '*' : ''}</label>
                                            <input type="text" {...register('currentEmployer', source === 'External' && !isEditMode ? { required: 'Required' } : {})} className={inputClass(errors.currentEmployer)} />
                                            {errors.currentEmployer && <p className="mt-1 text-xs text-red-600">{errors.currentEmployer.message}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Job Title {source === 'External' && !isEditMode ? '*' : ''}</label>
                                            <input type="text" {...register('jobTitle', source === 'External' && !isEditMode ? { required: 'Required' } : {})} className={inputClass(errors.jobTitle)} />
                                            {errors.jobTitle && <p className="mt-1 text-xs text-red-600">{errors.jobTitle.message}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Years of Experience {source === 'External' && !isEditMode ? '*' : ''}</label>
                                            <input type="number" step="0.1" {...register('yearsOfExperience', source === 'External' && !isEditMode ? { required: 'Required', valueAsNumber: true } : { valueAsNumber: true })} className={inputClass(errors.yearsOfExperience)} />
                                            {errors.yearsOfExperience && <p className="mt-1 text-xs text-red-600">{errors.yearsOfExperience.message}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Company Type</label>
                                            <select {...register('companyType')} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300">
                                                {companyTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Interviewer ID</label>
                                                <input type="text" {...register('interviewerId')} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300" />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Payout ID</label>
                                                <input type="text" {...register('payoutId')} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Payment Amount (₹ per interview)</label>
                                            <input type="number" placeholder="e.g. 500" {...register('paymentAmount')} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300" />
                                        </div>
                                    </>
                                )}

                                {/* Status — always show */}
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Status</label>
                                    <select {...register('status')} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300">
                                        {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>

                            </form>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 px-5 py-4 border-t border-slate-200 bg-slate-50 flex-shrink-0">
                            <button type="button" onClick={onClose} className="px-4 h-10 text-[13px] font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                            <button type="submit" form="interviewer-form" disabled={isSubmitting} className="px-4 h-10 text-[13px] font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors inline-flex items-center">
                                {isSubmitting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
                                {isEditMode ? 'Save Changes' : 'Create Interviewer'}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default InterviewerFormDrawer;
