import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FiMail, FiPhone, FiUser, FiSave, FiX, FiSend } from 'react-icons/fi';
import Button from '../../components/common/Button';
import { useAlert } from '../../hooks/useAlert';
import { createUser, updateUser } from '../../api/admin.api';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

const ToggleSwitch = ({ label, enabled, onChange }) => (
    <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <button type="button" onClick={() => onChange(!enabled)}
            className={`${enabled ? 'bg-emerald-500' : 'bg-gray-300'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors`}>
            <span className={`${enabled ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow transition`} />
        </button>
    </div>
);

const InputField = ({ label, icon: Icon, error, register, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="relative">
            {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />}
            <input {...props} {...register}
                className={`w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all ${error ? 'border-red-400' : 'border-gray-200'}`} />
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
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
                                <h2 className="text-lg font-bold text-gray-900">{isEditMode ? 'Edit User' : 'Add New User'}</h2>
                                {!isEditMode && <p className="text-xs text-gray-400 mt-0.5">A password setup email will be sent automatically</p>}
                            </div>
                            <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                                <FiX className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto">
                            <form id="user-form" onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                                <InputField label="First Name *" icon={FiUser}
                                    register={{ ...register('firstName', { required: 'First name is required' }) }}
                                    error={errors.firstName} placeholder="John" />

                                <InputField label="Last Name" icon={FiUser}
                                    register={{ ...register('lastName') }}
                                    error={errors.lastName} placeholder="Doe" />

                                <InputField label="Email Address *" icon={FiMail} type="email"
                                    register={{ ...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } }) }}
                                    error={errors.email} placeholder="user@example.com"
                                    disabled={isEditMode} />

                                <InputField label="Phone Number *" icon={FiPhone}
                                    register={{ ...register('phoneNumber', { required: 'Phone is required' }) }}
                                    error={errors.phoneNumber} placeholder="9876543210" />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <select {...register('role')}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 cursor-pointer">
                                        {roleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>

                                <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                                    <ToggleSwitch label="Account Active" enabled={isActive}
                                        onChange={(val) => setValue('isActive', val, { shouldDirty: true })} />
                                </div>

                                {!isEditMode && (
                                    <div className="flex items-start gap-3 p-4 bg-sky-50 border border-sky-100 rounded-lg">
                                        <FiSend className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
                                        <p className="text-xs text-sky-700 leading-relaxed">
                                            An email will be sent to the user with a secure link to create their password. The link expires in 24 hours.
                                        </p>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
                            <button type="button" onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                            <button type="submit" form="user-form" disabled={isSubmitting}
                                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-black disabled:opacity-50 transition-colors">
                                {isSubmitting ? (
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                                ) : (
                                    <>{isEditMode ? <><FiSave className="w-4 h-4" /> Save Changes</> : <><FiSend className="w-4 h-4" /> Create & Send Invite</>}</>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default UserFormModal;
