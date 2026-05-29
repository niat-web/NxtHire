import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Phone, User, Save, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAlert } from '../../hooks/useAlert';
import { createUser, updateUser } from '../../api/admin.api';
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

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && userData) {
                reset({ ...userData });
            } else {
                reset({ role: 'interviewer', isActive: true });
            }
        }
    }, [userData, isEditMode, reset, isOpen]);

    const onSubmit = async (data) => {
        try {
            if (isEditMode) {
                await updateUser(userData._id, data);
                showSuccess('User updated successfully!');
            } else {
                await createUser(data);
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
