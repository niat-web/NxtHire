// C:/Users/NxtWave/Desktop/Testing/Interviewer community/interviewer-hiring-system/interviewer-hiring-system/client/src/pages/admin/UserFormModal.jsx

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiMail, FiPhone, FiUser, FiKey, FiEye, FiEyeOff, FiSave, FiX } from 'react-icons/fi';
import Button from '../../components/common/Button';
import { useAlert } from '../../hooks/useAlert';
import { createUser, updateUser } from '../../api/admin.api';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

// --- (Helper Components are now local to this file) ---

const PasswordField = ({ register, error }) => {
    const [show, setShow] = useState(false);
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <div className="relative">
                <FiKey className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
                <input
                    type={show ? 'text' : 'password'}
                    {...register}
                    placeholder="Enter a secure password"
                    className={`w-full pl-10 pr-10 py-2 border rounded-md shadow-sm text-sm ${error ? 'border-red-500' : 'border-gray-300'}`}
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {show ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
            </div>
            {error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
        </div>
    );
};

const ToggleSwitch = ({ label, enabled, onChange }) => (
    <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <button
            type="button"
            onClick={() => onChange(!enabled)}
            className={`${enabled ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        >
            <span className={`${enabled ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
        </button>
    </div>
);

const InputField = ({ label, icon: Icon, error, register, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label} {props.required && <span className="text-red-500">*</span>}</label>
        <div className="relative">
            {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>}
            <input
                {...props}
                {...register}
                className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm text-sm ${error ? 'border-red-500' : 'border-gray-300'}`}
            />
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
    </div>
);


// --- Main Drawer Component ---
const UserFormModal = ({ isOpen, onClose, onSuccess, userData }) => {
    const isEditMode = !!userData;
    const { showSuccess, showError } = useAlert();
    const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm();
    const roleOptions = [{ value: 'admin', label: 'Admin' }, { value: 'interviewer', label: 'Interviewer' }];

    const isActive = watch('isActive');
    
    useEffect(() => {
        if (isOpen) {
            if (isEditMode && userData) {
                reset({ ...userData, fullName: undefined });
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
                showSuccess('User created successfully!');
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
                        <div className="flex justify-between items-center p-3 border-b border-gray-200 flex-shrink-0">
                            <h2 className="text-xl font-semibold text-gray-800">{isEditMode ? 'Edit User' : 'Add New User'}</h2>
                            <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
                                <FiX className="h-6 w-6" />
                            </button>
                        </div>
                        
                        {/* Drawer Body (Scrollable Form) */}
                        <div className="flex-grow overflow-y-auto">
                            <form id="user-form" onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <InputField label="First Name" icon={FiUser} register={{...register('firstName', { required: 'First name is required' })}} error={errors.firstName} required />
                                    <InputField label="Last Name" icon={FiUser} register={{...register('lastName', { required: 'Last name is required' })}} error={errors.lastName} required />
                                    <InputField label="Email Address" icon={FiMail} type="email" register={{...register('email', { required: 'Email is required' })}} error={errors.email} required />
                                    <InputField label="Phone Number" icon={FiPhone} register={{...register('phoneNumber', { required: 'Phone is required' })}} error={errors.phoneNumber} required />
                                    {!isEditMode && <PasswordField register={{...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' }})}} error={errors.password} />}
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Role</label><select {...register('role')} className="w-full p-2 border border-gray-300 rounded-md shadow-sm">{roleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>
                                    <div className="p-4 border rounded-lg bg-gray-50"><ToggleSwitch label="Account Active" enabled={isActive} onChange={(val) => setValue('isActive', val, { shouldValidate: true, shouldDirty: true })}/></div>
                                </div>
                            </form>
                        </div>
                        
                        {/* Drawer Footer */}
                        <div className="flex justify-end gap-4 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                            <Button type="submit" form="user-form" isLoading={isSubmitting} icon={<FiSave/>}>
                                {isEditMode ? 'Save Changes' : 'Create User'}
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body // This renders the drawer as a direct child of <body>
    );
};

export default UserFormModal;
