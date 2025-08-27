import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { useAlert } from '../../hooks/useAlert';
import { createUser, updateUser } from '../../api/admin.api';
import { FiEye, FiEyeOff } from 'react-icons/fi'; // Import icons

const UserFormModal = ({ isOpen, onClose, onSuccess, userData }) => {
    const isEditMode = !!userData;
    const { showSuccess, showError } = useAlert();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm();
    
    const [roleOptions] = useState([
      { value: 'admin', label: 'Admin' },
      { value: 'interviewer', label: 'Interviewer' },
    ]);

    const [showPassword, setShowPassword] = useState(false); // State for password visibility
    
    useEffect(() => {
        if (isEditMode && userData) {
            reset({ ...userData, fullName: undefined }); // Don't reset fullName
        } else {
            reset({ role: 'interviewer', isActive: true });
        }
    }, [userData, isEditMode, reset]);

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

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? 'Edit User' : 'Add New User'} size="lg">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="First Name" {...register('firstName', { required: 'First name is required' })} error={errors.firstName?.message} />
                    <Input label="Last Name" {...register('lastName', { required: 'Last name is required' })} error={errors.lastName?.message} />
                 </div>
                 <Input label="Email" type="email" {...register('email', { required: 'Email is required' })} error={errors.email?.message} />
                 <Input label="Phone Number" {...register('phoneNumber', { required: 'Phone number is required' })} error={errors.phoneNumber?.message} required />
                 
                 {!isEditMode && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Password</label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                {...register('password', { required: 'Password is required' })}
                                className={`w-full px-3 py-2 pr-10 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
                    </div>
                )}
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select label="Role" {...register('role')} options={roleOptions} />
                    <div className="flex items-center pt-6">
                        <input type="checkbox" id="isActive" {...register('isActive')} className="h-4 w-4 text-primary-600 rounded" />
                        <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">Is Active</label>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save User'}</Button>
                </div>
            </form>
        </Modal>
    );
};

export default UserFormModal;
