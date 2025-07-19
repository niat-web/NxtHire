// client/src/components/admin/BookingFormModal.jsx
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import StatusBadge from '@/components/common/StatusBadge';
import { useAlert } from '@/hooks/useAlert';
import { getInterviewers, createInterviewBooking, updateInterviewBooking } from '@/api/admin.api';
import Select from 'react-select';

const BookingFormModal = ({ isOpen, onClose, onSuccess, bookingData = null }) => {
    const isEditMode = !!bookingData;
    const { showSuccess, showError } = useAlert();
    const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();
    const [interviewerOptions, setInterviewerOptions] = useState([]);
    const [loadingInterviewers, setLoadingInterviewers] = useState(true);
    
    useEffect(() => {
        if (isOpen) {
            setLoadingInterviewers(true);
            getInterviewers({ limit: 500, status: 'Active,On Probation' }) 
                .then(res => {
                    const options = (res.data.data.interviewers || []).map(i => ({
                        value: i._id,
                        label: `${i.user.firstName} ${i.user.lastName}`,
                        status: i.status 
                    }));
                    setInterviewerOptions(options);

                    if (isEditMode && bookingData) {
                        const preselectedInterviewers = options.filter(option => 
                            bookingData.interviewers.some(interviewer => interviewer.interviewer._id === option.value)
                        );
                        reset({
                            bookingDate: new Date(bookingData.bookingDate),
                            interviewers: preselectedInterviewers
                        });
                    } else {
                        reset({ bookingDate: null, interviewers: [] });
                    }
                })
                .catch(() => showError("Failed to load interviewers"))
                .finally(() => setLoadingInterviewers(false));
        }
    }, [isOpen, isEditMode, bookingData, showError, reset]);

    const formatOptionLabel = ({ label, status }) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{label}</span>
            {status && <StatusBadge status={status} />}
        </div>
    );
    
    const onSubmit = async (data) => {
        const payload = {
            bookingDate: data.bookingDate,
            interviewerIds: data.interviewers.map(i => i.value)
        };

        try {
            if (isEditMode) {
                await updateInterviewBooking(bookingData._id, payload);
                showSuccess("Booking request updated successfully.");
            } else {
                await createInterviewBooking(payload);
                showSuccess("Booking request created successfully.");
            }
            onSuccess();
        } catch (err) {
            showError(`Failed to ${isEditMode ? 'update' : 'create'} booking request.`);
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? 'Edit Interview Booking' : 'Create New Interview Booking'} size="lg">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label className="form-label">Booking Date</label>
                    <Controller
                        control={control}
                        name="bookingDate"
                        rules={{ required: 'Date is required.' }}
                        render={({ field }) => (
                            <DatePicker
                                placeholderText="mm/dd/yyyy"
                                onChange={(date) => field.onChange(date)}
                                selected={field.value}
                                className="form-input" 
                                minDate={new Date()}
                            />
                        )}
                    />
                    {errors.bookingDate && <p className="form-error">{errors.bookingDate.message}</p>}
                </div>
                
                <div>
                    <label className="form-label">Select Interviewers</label>
                    <Controller
                        name="interviewers"
                        control={control}
                        rules={{ required: 'Please select at least one interviewer.' }}
                        render={({ field }) => (
                            <Select
                                {...field}
                                isMulti
                                options={interviewerOptions}
                                isLoading={loadingInterviewers}
                                className="react-select-container"
                                classNamePrefix="react-select"
                                placeholder="Select interviewers..."
                                formatOptionLabel={formatOptionLabel}
                                // *** FIX STARTS HERE ***
                                // menuPortalTarget allows the dropdown menu to render outside the modal's overflow context.
                                menuPortalTarget={document.body}
                                // We apply styles to ensure the portalled menu appears correctly above the modal.
                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                // This ensures the positioning logic works correctly when portalled.
                                menuPosition={'fixed'}
                                // *** FIX ENDS HERE ***
                            />
                        )}
                    />
                    {errors.interviewers && <p className="form-error">{errors.interviewers.message}</p>}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="primary" isLoading={isSubmitting}>{isEditMode ? 'Save Changes' : 'Create Booking'}</Button>
                </div>
            </form>
        </Modal>
    );
};

export default BookingFormModal;