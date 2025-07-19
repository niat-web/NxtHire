import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { useAlert } from '../../hooks/useAlert';
import { SOURCING_CHANNELS, APPLICATION_STATUS } from '../../utils/constants';
import { createApplicant, updateApplicant } from '../../api/admin.api';

const ApplicantFormModal = ({ isOpen, onClose, onSuccess, applicantData }) => {
    const isEditMode = !!applicantData;
    const { showSuccess, showError } = useAlert();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm();

    useEffect(() => {
        if (isEditMode && applicantData) {
            reset(applicantData);
        } else {
            reset({
                fullName: '', email: '', phoneNumber: '', whatsappNumber: '',
                linkedinProfileUrl: '', interestedInJoining: true, sourcingChannel: '', status: APPLICATION_STATUS.SUBMITTED
            });
        }
    }, [applicantData, isEditMode, reset]);
    
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

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditMode ? 'Edit Applicant' : 'Add New Applicant'}
            size="2xl"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Full Name" {...register('fullName', { required: 'Full name is required' })} error={errors.fullName?.message} required />
                    <Input label="Email Address" type="email" {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })} error={errors.email?.message} required />
                    <Input label="Phone Number" {...register('phoneNumber', { required: 'Phone number is required' })} error={errors.phoneNumber?.message} required />
                    <Input label="WhatsApp Number" {...register('whatsappNumber')} helpText="Optional" />
                </div>
                <Input label="LinkedIn Profile URL" {...register('linkedinProfileUrl', { required: 'LinkedIn URL is required', validate: v => v.includes('linkedin.com/') || 'Invalid URL' })} error={errors.linkedinProfileUrl?.message} required />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <Select label="How did you hear?" {...register('sourcingChannel', { required: 'Source is required' })} options={SOURCING_CHANNELS} placeholder="Select source" error={errors.sourcingChannel?.message} required />
                     <Select label="Status" {...register('status', { required: 'Status is required' })} options={statusOptions} placeholder="Select status" error={errors.status?.message} required />
                </div>
                <div className="flex items-center">
                    <input type="checkbox" id="interestedInJoining" {...register('interestedInJoining')} className="h-4 w-4 text-primary-600 rounded" />
                    <label htmlFor="interestedInJoining" className="ml-2 text-sm text-gray-700">Interested in Joining</label>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Applicant'}</Button>
                </div>
            </form>
        </Modal>
    );
};

export default ApplicantFormModal;