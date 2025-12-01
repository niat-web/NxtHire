import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useAlert } from '@/hooks/useAlert';
import { useAuth } from '@/hooks/useAuth'; // To get interviewer name
import { FiPlus, FiTrash2, FiSave, FiX, FiLoader, FiClock, FiUser, FiCalendar, FiAlignLeft } from 'react-icons/fi';
import { TIME_SLOTS } from '@/utils/constants';
import { formatDate, formatDateTime } from '@/utils/formatters';
import { submitTimeSlots } from '@/api/interviewer.api';

// --- UI COMPONENTS ---

const LocalModal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fadeIn" 
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                <div 
                    className="relative w-full max-w-4xl h-[600px] bg-white shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-slideUp"
                    onClick={(e) => e.stopPropagation()} 
                >
                    {/* Header - Absolute top right close button for clean look */}
                    <button 
                        type="button" 
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors z-10" 
                        onClick={onClose}
                    >
                        <FiX className="h-5 w-5" />
                    </button>

                    {/* Modal Content Body */}
                    <div className="flex flex-1 h-full overflow-hidden">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

const SlotRow = ({ register, index, remove, errors, isOneLeft }) => {
    return (
        <div className="group relative flex items-center gap-3 p-3 mb-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-300 hover:shadow-md transition-all duration-200">
            {/* Number Badge */}
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 text-xs font-bold group-hover:bg-indigo-50 group-hover:text-indigo-600">
                {index + 1}
            </div>

            <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="relative">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 ml-1">Start</label>
                    <select 
                        {...register(`slots.${index}.startTime`, { required: true })} 
                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none transition-colors"
                    >
                        <option value="" disabled>Select time</option>
                        {TIME_SLOTS.map(slot => <option key={slot.value} value={slot.value}>{slot.label}</option>)}
                    </select>
                </div>
                <div className="relative">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 ml-1">End</label>
                    <select 
                        {...register(`slots.${index}.endTime`, { required: true })} 
                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none transition-colors"
                    >
                        <option value="" disabled>Select time</option>
                        {TIME_SLOTS.map(slot => <option key={slot.value} value={slot.value}>{slot.label}</option>)}
                    </select>
                </div>
            </div>

            {/* Delete Button */}
            <button 
                type="button" 
                onClick={() => remove(index)} 
                disabled={isOneLeft}
                className={`p-2 rounded-lg transition-colors mt-4 ${isOneLeft ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
                title="Remove Slot"
            >
                <FiTrash2 className="h-5 w-5" />
            </button>
        </div>
    );
};

// --- MAIN COMPONENT ---

const SlotSubmissionModal = ({ isOpen, onClose, request, onSuccess }) => {
    const { showSuccess, showError } = useAlert();
    const { currentUser } = useAuth(); // Get logged in interviewer details
    
    const { register, control, handleSubmit, formState: { isSubmitting }, watch, reset } = useForm({
        defaultValues: { slots: [{ startTime: '', endTime: '' }], remarks: '' }
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'slots' });

    useEffect(() => {
        if (isOpen && request) {
            if (request.providedSlots && request.providedSlots.length > 0) {
                reset({
                    slots: request.providedSlots,
                    remarks: request.remarks || ''
                });
            } else {
                reset({ slots: [{ startTime: '', endTime: '' }], remarks: '' });
            }
        }
    }, [isOpen, request, reset]);

    const onSubmit = async (data) => {
        // Basic Validation: End time > Start time
        for (let i = 0; i < data.slots.length; i++) {
            const { startTime, endTime } = data.slots[i];
            if (!startTime || !endTime) return showError(`Slot #${i + 1} is incomplete.`);
            if (startTime >= endTime) return showError(`Slot #${i + 1}: End time must be after start time.`);
        }

        try {
            await submitTimeSlots(request.bookingId, { ...data, slots: data.slots });
            showSuccess('Availability submitted successfully!');
            onSuccess();
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to submit time slots.');
        }
    };

    // Helper for date display
    const dateObj = request ? new Date(request.bookingDate) : new Date();
    const monthName = dateObj.toLocaleString('default', { month: 'long' });
    const dayName = dateObj.toLocaleString('default', { weekday: 'long' });
    const dayNumber = dateObj.getDate();
    const year = dateObj.getFullYear();

    const isUpdateMode = request?.status === 'Submitted';

    return (
        <LocalModal isOpen={isOpen} onClose={onClose}>
            
            {/* --- LEFT SIDE PANEL (Fixed Info) --- */}
            <div className="w-1/3 bg-slate-50 border-r border-slate-200 p-8 flex flex-col justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-1">Availability Request</h2>
                    <p className="text-sm text-slate-500 mb-8">Review details and provide your slots.</p>

                    {/* Interviewer Info */}
                    <div className="flex items-center gap-4 mb-8 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                        <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                            {currentUser?.firstName?.[0]}
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-bold">Interviewer</p>
                            <p className="font-semibold text-slate-800">{currentUser?.firstName} {currentUser?.lastName}</p>
                        </div>
                    </div>

                    {/* Date Visualization */}
                    <div className="mb-6">
                        <p className="text-xs text-slate-400 uppercase font-bold mb-3">Interview Date</p>
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 text-center w-full max-w-[200px]">
                            <div className="bg-indigo-600 text-white py-2 font-bold uppercase tracking-widest text-sm">
                                {monthName}
                            </div>
                            <div className="py-4">
                                <span className="block text-5xl font-black text-slate-800">{dayNumber}</span>
                                <span className="block text-sm font-medium text-slate-500 mt-1">{dayName}, {year}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Info (Last Submitted) */}
                {isUpdateMode && request.submittedAt && (
                     <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-100 rounded-lg text-xs text-green-800">
                        <FiClock className="mt-0.5 flex-shrink-0" />
                        <span>
                            Last submitted on:<br/>
                            <strong>{formatDateTime(request.submittedAt)}</strong>
                        </span>
                    </div>
                )}
            </div>

            {/* --- RIGHT SIDE PANEL (Scrollable Form) --- */}
            <div className="w-2/3 flex flex-col h-full">
                {/* Scrollable Area */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <FiClock className="text-indigo-500" />
                            Available Time Slots
                        </h3>
                        <button 
                            type="button"
                            onClick={() => append({ startTime: '', endTime: '' })}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-lg hover:bg-indigo-100 transition-colors"
                        >
                            <FiPlus /> Add Slot
                        </button>
                    </div>

                    <form id="slot-form" onSubmit={handleSubmit(onSubmit)} className="space-y-2">
                        {fields.map((field, index) => (
                            <SlotRow 
                                key={field.id} 
                                index={index} 
                                register={register} 
                                remove={remove} 
                                isOneLeft={fields.length === 1}
                            />
                        ))}

                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                <FiAlignLeft className="text-slate-400"/> 
                                Additional Remarks <span className="text-slate-400 font-normal">(Optional)</span>
                            </label>
                            <textarea
                                {...register('remarks')}
                                rows="3"
                                placeholder="Any specific notes regarding your availability..."
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all resize-none"
                            />
                        </div>
                    </form>
                </div>

                {/* Fixed Footer Actions */}
                <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-4 z-10">
                    <button 
                        type="button" 
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-6 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        form="slot-form"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-8 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <FiLoader className="animate-spin" /> Saving...
                            </>
                        ) : (
                            <>
                                <FiSave /> {isUpdateMode ? 'Update Slots' : 'Confirm Slots'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </LocalModal>
    );
};

export default SlotSubmissionModal;
