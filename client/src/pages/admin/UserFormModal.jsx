import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import ReactSelect from 'react-select';
import { Mail, Phone, User, Save, X, Send, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAlert } from '../../hooks/useAlert';
import { createUser, updateUser } from '../../api/admin.api';
import { useDomainOptions } from '../../hooks/useAdminQueries';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

const ToggleSwitch = ({ label, enabled, onChange }) => (
    <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-foreground/90">{label}</span>
        <button type="button" onClick={() => onChange(!enabled)} aria-label={label}
            className={`${enabled ? 'bg-primary' : 'bg-slate-300'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors`}>
            <span className={`${enabled ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow transition`} />
        </button>
    </div>
);

const InputField = ({ label, icon: Icon, error, register, ...props }) => (
    <div>
        <label className="block text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-1.5">{label}</label>
        <div className="relative">
            {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/70" aria-hidden="true" />}
            <input {...props} {...register}
                className={`w-full pl-10 pr-3 h-10 border rounded-lg text-[13px] text-foreground placeholder:text-muted-foreground/70 bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-colors ${error ? 'border-red-300' : 'border-border'}`} />
        </div>
        {error && <p className="mt-1.5 text-[12px] text-red-600">{error.message}</p>}
    </div>
);

const UserFormModal = ({ isOpen, onClose, onSuccess, userData }) => {
    const isEditMode = !!userData;
    const { showSuccess, showError } = useAlert();
    const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm();
    const roleOptions = [{ value: 'admin', label: 'Admin' }, { value: 'interviewer', label: 'Interviewer' }];
    const isActive = watch('isActive');
    const selectedRole = watch('role');
    const DOMAINS = useDomainOptions();

    // ── Dual-role state (admin who is ALSO an interviewer) ──
    const [alsoInterviewer, setAlsoInterviewer] = useState(false);
    const [interviewerDomains, setInterviewerDomains] = useState([]); // [{value,label}, ...]

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && userData) {
                reset({ ...userData });
                setAlsoInterviewer(userData.alsoInterviewer === true);
                // Existing interviewer domains aren't returned by the User endpoint;
                // admin can re-pick them when toggling. Leaving empty by default.
                setInterviewerDomains([]);
            } else {
                reset({ role: 'interviewer', isActive: true });
                setAlsoInterviewer(false);
                setInterviewerDomains([]);
            }
        }
    }, [userData, isEditMode, reset, isOpen]);

    // If the admin flips the role away from "admin", auto-disable the dual flag
    useEffect(() => {
        if (selectedRole !== 'admin' && alsoInterviewer) {
            setAlsoInterviewer(false);
        }
    }, [selectedRole, alsoInterviewer]);

    const onSubmit = async (data) => {
        try {
            // Build the dual-role payload only when the flag is on AND the role is admin
            const dualPayload = (data.role === 'admin' && alsoInterviewer)
                ? {
                    alsoInterviewer: true,
                    interviewerDomains: interviewerDomains.map(d => d.value),
                    interviewerPrimaryDomain: interviewerDomains[0]?.value || '',
                }
                : { alsoInterviewer: false };

            // Client-side guard: if dual flag is on, require at least one domain
            if (dualPayload.alsoInterviewer && (!dualPayload.interviewerDomains || dualPayload.interviewerDomains.length === 0)) {
                showError('Please select at least one domain for the interviewer role.');
                return;
            }

            const payload = { ...data, ...dualPayload };

            if (isEditMode) {
                await updateUser(userData._id, payload);
                showSuccess('User updated successfully!');
            } else {
                await createUser(payload);
                showSuccess('User created! A setup email has been sent to set their password.');
            }
            onSuccess();
        } catch (error) {
            showError(error.response?.data?.message || 'Operation failed.');
        }
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose} className="fixed inset-0 bg-black/50 z-40" />

                    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
                        className="fixed top-0 right-0 h-screen w-full max-w-md bg-white shadow-xl z-50 flex flex-col">

                        {/* Header */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 shrink-0">
                            <div>
                                <h2 className="font-display text-[22px] font-semibold text-foreground tracking-tight leading-none">{isEditMode ? 'Edit user' : 'Add new user'}</h2>
                                {!isEditMode && <p className="text-[12.5px] text-muted-foreground mt-2">A password setup email will be sent automatically.</p>}
                            </div>
                            <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto">
                            <form id="user-form" onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                                <InputField label="First Name *" icon={User}
                                    register={{ ...register('firstName', { required: 'First name is required' }) }}
                                    error={errors.firstName} placeholder="John" />

                                <InputField label="Last Name" icon={User}
                                    register={{ ...register('lastName') }}
                                    error={errors.lastName} placeholder="Doe" />

                                <InputField label="Email Address *" icon={Mail} type="email"
                                    register={{ ...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } }) }}
                                    error={errors.email} placeholder="user@example.com"
                                    disabled={isEditMode} />

                                <InputField label="Phone Number *" icon={Phone}
                                    register={{ ...register('phoneNumber', { required: 'Phone is required' }) }}
                                    error={errors.phoneNumber} placeholder="9876543210" />

                                <div>
                                    <label className="block text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-1.5">Role</label>
                                    <select {...register('role')}
                                        className="w-full px-4 h-10 border border-border rounded-lg text-[13px] text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary cursor-pointer transition-colors">
                                        {roleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>

                                {/* Dual-role section — only shown for Admin role */}
                                {selectedRole === 'admin' && (
                                    <div className="p-4 border border-primary/20 rounded-xl bg-primary/5 space-y-3">
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={alsoInterviewer}
                                                onChange={(e) => setAlsoInterviewer(e.target.checked)}
                                                className="mt-0.5 h-4 w-4 rounded border-primary/40 text-primary focus:ring-primary"
                                            />
                                            <span className="flex-1">
                                                <span className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground">
                                                    <UserCheck className="h-3.5 w-3.5 text-primary" />
                                                    Also enable as Interviewer
                                                </span>
                                                <span className="block text-[11.5px] text-muted-foreground mt-0.5">
                                                    This admin will also be able to conduct interviews. They'll appear in the Interviewers list and can switch between the two views.
                                                </span>
                                            </span>
                                        </label>

                                        {alsoInterviewer && (
                                            <div className="pt-3 border-t border-primary/15">
                                                <label className="block text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-1.5">
                                                    Interviewer Domains *
                                                </label>
                                                <ReactSelect
                                                    isMulti
                                                    options={DOMAINS}
                                                    value={interviewerDomains}
                                                    onChange={(opts) => setInterviewerDomains(opts || [])}
                                                    placeholder="Select one or more domains"
                                                    menuPortalTarget={document.body}
                                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                />
                                                <p className="text-[11px] text-muted-foreground mt-1.5">
                                                    The first selected domain becomes the primary. {interviewerDomains.length > 0 && (
                                                        <>Primary: <span className="font-semibold text-foreground">{interviewerDomains[0].label}</span>.</>
                                                    )}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="p-5 border border-gray-100 rounded-xl bg-gray-50">
                                    <ToggleSwitch label="Account Active" enabled={isActive}
                                        onChange={(val) => setValue('isActive', val, { shouldDirty: true })} />
                                </div>

                                {!isEditMode && (
                                    <div className="flex items-start gap-3 p-4 bg-muted/40 border border-border rounded-2xl">
                                        <Send className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" aria-hidden="true" />
                                        <p className="text-[12.5px] text-foreground/80 leading-relaxed">
                                            An email will be sent to the user with a secure link to create their password. The link expires in 24 hours.
                                        </p>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" form="user-form" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> Processing...</>
                                ) : (
                                    <>{isEditMode ? <><Save className="w-4 h-4 mr-2" /> Save Changes</> : <><Send className="w-4 h-4 mr-2" /> Create & Send Invite</>}</>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default UserFormModal;
