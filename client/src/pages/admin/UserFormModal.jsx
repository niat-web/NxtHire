// C:/Users/NxtWave/Desktop/Testing/Interviewer community/interviewer-hiring-system/interviewer-hiring-system/client/src/pages/admin/UserFormModal.jsx

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiMail, FiPhone, FiUser, FiLock, FiEye, FiEyeOff, FiSave } from 'react-icons/fi';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { useAlert } from '../../hooks/useAlert';
import { createUser, updateUser } from '../../api/admin.api';

const PasswordField = ({ register, error }) => {
    const [show, setShow] = useState(false);
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
                <input
                    type={show ? 'text' : 'password'}
                    {...register}
                    placeholder="Enter a secure password"
                    className={`w-full pl-10 pr-10 py-2 border rounded-md ${error ? 'border-red-500' : 'border-gray-300'}`}
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
    
    const inputWrapperClass = "relative";
    const inputClass = "w-full pl-10 pr-3 py-2 border rounded-md shadow-sm text-sm";
    const iconClass = "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400";

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditMode ? 'Edit User' : 'Add New User'}
            size="2xl"
            footer={
                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" form="user-form" isLoading={isSubmitting} icon={<FiSave/>}>
                        {isEditMode ? 'Save Changes' : 'Create User'}
                    </Button>
                </div>
            }
        >
            <form id="user-form" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Left Column: Identity */}
                    <div className="space-y-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label><div className={inputWrapperClass}><FiUser className={iconClass}/><input {...register('firstName', { required: 'First name is required' })} className={`${inputClass} ${errors.firstName && 'border-red-500'}`} /></div>{errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>}</div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label><div className={inputWrapperClass}><FiUser className={iconClass}/><input {...register('lastName', { required: 'Last name is required' })} className={`${inputClass} ${errors.lastName && 'border-red-500'}`} /></div>{errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>}</div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label><div className={inputWrapperClass}><FiMail className={iconClass}/><input type="email" {...register('email', { required: 'Email is required' })} className={`${inputClass} ${errors.email && 'border-red-500'}`} /></div>{errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}</div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label><div className={inputWrapperClass}><FiPhone className={iconClass}/><input {...register('phoneNumber', { required: 'Phone is required' })} className={`${inputClass} ${errors.phoneNumber && 'border-red-500'}`} /></div>{errors.phoneNumber && <p className="mt-1 text-xs text-red-500">{errors.phoneNumber.message}</p>}</div>
                    </div>
                    {/* Right Column: System */}
                    <div className="space-y-4">
                        {!isEditMode && <PasswordField register={{...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' }})}} error={errors.password} />}
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Role</label><select {...register('role')} className="w-full p-2 border border-gray-300 rounded-md shadow-sm">{roleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>
                        <div className="p-4 border rounded-lg bg-gray-50"><ToggleSwitch label="Account Active" enabled={isActive} onChange={(val) => setValue('isActive', val, { shouldValidate: true, shouldDirty: true })}/></div>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default UserFormModal;
