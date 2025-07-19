// client/src/components/interviewer/SlotSubmissionModal.jsx
import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useAlert } from '@/hooks/useAlert';
import { FiPlus, FiTrash2, FiSave, FiX, FiLoader } from 'react-icons/fi';
import { TIME_SLOTS } from '@/utils/constants';
import { formatDate } from '@/utils/formatters';
import { submitTimeSlots } from '@/api/interviewer.api';

const SlotSubmissionModal = ({ isOpen, onClose, request, onSuccess }) => {
    const { showSuccess, showError } = useAlert();
    const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        defaultValues: { slots: [{ startTime: '', endTime: '' }] }
    });
    const { fields, append, remove } = useFieldArray({ control, name: 'slots' });

    const onSubmit = async (data) => {
        try {
            await submitTimeSlots(request.bookingId, data);
            showSuccess('Availability submitted successfully!');
            onSuccess();
        } catch (error) {
            showError('Failed to submit time slots. Please try again.');
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="relative z-50">
            {/* Modal Overlay */}
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            {/* Modal Content */}
            <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                <div className="relative w-full max-w-lg my-8 flex flex-col bg-white shadow-xl rounded-lg">
                    {/* Header */}
                    <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                            Provide Slots for {formatDate(request.bookingDate)}
                        </h3>
                        <button
                            type="button"
                            className="text-gray-400 hover:text-gray-500 focus:outline-none"
                            onClick={onClose}
                        >
                            <FiX className="h-5 w-5" />
                        </button>
                    </div>
                    
                    {/* Body */}
                    <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                        <div className="space-y-4">
                            
                            {/* --- FIX START: Labels are now outside the loop --- */}
                            <div className="grid grid-cols-2 gap-4 mb-1">
                                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                                <label className="block text-sm font-medium text-gray-700">End Time</label>
                            </div>
                            {/* --- FIX END --- */}

                            {fields.map((field, index) => (
                                // --- FIX START: Using flex with items-center for perfect row alignment ---
                                <div key={field.id} className="flex items-center gap-4">
                                    {/* Start Time Select */}
                                    <select 
                                        {...register(`slots.${index}.startTime`, { required: true })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        <option value="" disabled>Select an option</option>
                                        {TIME_SLOTS.map(slot => <option key={slot.value} value={slot.value}>{slot.label}</option>)}
                                    </select>

                                    {/* End Time Select */}
                                    <select 
                                        {...register(`slots.${index}.endTime`, { required: true })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        <option value="" disabled>Select an option</option>
                                        {TIME_SLOTS.map(slot => <option key={slot.value} value={slot.value}>{slot.label}</option>)}
                                    </select>
                                    
                                    {/* Delete Button */}
                                    <button
                                        type="button"
                                        className="p-2.5 rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                                        onClick={() => remove(index)}
                                        disabled={fields.length <= 1}
                                        aria-label="Remove time slot"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                                // --- FIX END ---
                            ))}

                            {/* Add Button */}
                            <button
                                type="button"
                                className="mt-2 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors focus:outline-none border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                onClick={() => append({ startTime: '', endTime: '' })}
                            >
                                <FiPlus className="mr-2 -ml-1 h-5 w-5" />
                                Add
                            </button>
                        </div>
                        
                        {/* Footer Buttons */}
                        <div className="mt-8 flex justify-end gap-3">
                            <button 
                                type="button" 
                                className="px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                onClick={onClose} 
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <FiLoader className="animate-spin mr-2 -ml-1 h-5 w-5" />
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <FiSave className="mr-2 -ml-1 h-5 w-5" />
                                        Submit Slots
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SlotSubmissionModal;