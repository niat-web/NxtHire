// client/src/pages/admin/ManualSlotFormModal.jsx
import React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { Plus, Trash2, Save, Calendar, Clock, User } from 'lucide-react';

import Modal from '../../components/common/Modal';
import { TIME_SLOTS } from '../../utils/constants';
import { manualAddBookingSlot } from '../../api/admin.api';
import { useAlert } from '../../hooks/useAlert';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const ManualSlotFormModal = ({ isOpen, onClose, onSuccess, interviewers }) => {
    const { showSuccess, showError } = useAlert();
    
    const { register, control, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm({
        defaultValues: {
            interviewerId: null,
            date: new Date(),
            slots: [{ startTime: '', endTime: '' }]
        }
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'slots' });

    const onSubmit = async (data) => {
        // --- FIX: Use date-fns format to prevent timezone rollback ---
        // toISOString() converts to UTC, often causing the date to go back by one day.
        // format(date, 'yyyy-MM-dd') keeps the local date selected by the user.
        const formattedDate = format(data.date, 'yyyy-MM-dd');

        const payload = {
            interviewerId: data.interviewerId?.value,
            date: formattedDate, 
            slots: data.slots.filter(s => s.startTime && s.endTime),
        };

        if (!payload.interviewerId) { return showError("Please select an interviewer."); }
        if (payload.slots.length === 0) { return showError("Please provide at least one complete time slot."); }

        try {
            await manualAddBookingSlot(payload);
            showSuccess("Slots added successfully!");
            onSuccess();
            onClose();
        } catch (err) {
            showError(err.response?.data?.message || "Failed to add manual slot.");
        }
    };

    const validateEndTime = (endTime, index) => {
        const startTime = watch(`slots.${index}.startTime`);
        if (!startTime || !endTime) return true;
        return endTime > startTime || 'Invalid Time';
    };

    const selectStyles = {
        control: (base, state) => ({
            ...base,
            borderColor: state.isFocused ? '#111827' : '#D1D5DB',
            boxShadow: 'none',
            '&:hover': { borderColor: '#9CA3AF' },
            padding: '2px',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            minHeight: '42px'
        }),
        menuPortal: base => ({ ...base, zIndex: 9999 }),
        menu: base => ({ ...base, borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? '#F3F4F6' : state.isFocused ? '#F9FAFB' : 'white',
            color: state.isSelected ? '#111827' : '#374151',
            cursor: 'pointer',
            fontSize: '0.875rem'
        })
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Manually Add Slots" size="5xl">
            <form id="manual-slot-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-[550px]">
                
                <div className="flex flex-1 overflow-hidden">
                    
                    {/* LEFT COLUMN: Details (Fixed with Inline Calendar) */}
                    <div className="w-[340px] bg-gray-50 border-r border-gray-200 p-6 flex flex-col gap-6 flex-shrink-0 overflow-y-auto custom-scrollbar">
                        
                        {/* Interviewer Select */}
                        <section>
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                                <User /> Select Interviewer <span className="text-red-500">*</span>
                            </label>
                            <Controller
                                name="interviewerId"
                                control={control}
                                rules={{ required: "Required" }}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        options={interviewers}
                                        placeholder="Search name..."
                                        styles={selectStyles}
                                        menuPortalTarget={document.body}
                                    />
                                )}
                            />
                            {errors.interviewerId && <p className="mt-1 text-xs text-red-600 font-medium">Please select an interviewer</p>}
                        </section>

                        {/* Inline Calendar - Better UX */}
                        <section className="flex flex-col">
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                                <Calendar /> Select Date <span className="text-red-500">*</span>
                            </label>
                            <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-md flex justify-center">
                                <Controller
                                    name="date"
                                    control={control}
                                    rules={{ required: "Required" }}
                                    render={({ field }) => (
                                        <DatePicker
                                            selected={field.value}
                                            onChange={field.onChange}
                                            minDate={new Date()}
                                            inline // <--- This makes it always visible
                                            calendarClassName="!border-0 !shadow-none !font-sans"
                                        />
                                    )}
                                />
                            </div>
                        </section>

                        <div className="mt-auto p-3 bg-blue-50 rounded-xl border border-blue-100">
                            <p className="text-xs text-blue-800 font-medium leading-relaxed">
                                <strong>Note:</strong> Slots will be added to the interviewer's availability for the selected date.
                            </p>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Time Slots (Scrollable) */}
                    <div className="flex-1 flex flex-col h-full bg-white min-w-0">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Clock className="h-4 w-4" /></div>
                                Define Slots
                            </h3>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => append({ startTime: '', endTime: '' })}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            >
                                <Plus className="h-3 w-3 mr-1" /> Add Slot
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-3">
                            {fields.map((field, index) => (
                                <div key={field.id} className="group relative grid grid-cols-12 gap-3 items-center p-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all">
                                    <div className="col-span-5">
                                        <div className="relative">
                                            <select 
                                                {...register(`slots.${index}.startTime`, { required: true })} 
                                                className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-1 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                                            >
                                                <option value="">Start Time</option>
                                                {TIME_SLOTS.map(slot => <option key={slot.value} value={slot.value}>{slot.label}</option>)}
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-400"><Clock className="h-3 w-3" /></div>
                                        </div>
                                    </div>

                                    <div className="col-span-1 flex justify-center text-gray-300">→</div>

                                    <div className="col-span-5">
                                        <div className="relative">
                                            <select 
                                                {...register(`slots.${index}.endTime`, { required: true, validate: (value) => validateEndTime(value, index) })} 
                                                className={cn('w-full pl-3 pr-8 py-2 bg-gray-50 border rounded-lg text-sm font-medium focus:ring-1 focus:bg-white transition-colors appearance-none cursor-pointer', errors.slots?.[index]?.endTime ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500')}
                                            >
                                                <option value="">End Time</option>
                                                {TIME_SLOTS.map(slot => <option key={slot.value} value={slot.value}>{slot.label}</option>)}
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-400"><Clock className="h-3 w-3" /></div>
                                        </div>
                                        {errors.slots?.[index]?.endTime && <p className="mt-1 text-xs text-red-600 font-medium">{errors.slots[index].endTime.message}</p>}
                                    </div>

                                    <div className="col-span-1 flex justify-center">
                                        <button 
                                            type="button"
                                            onClick={() => remove(index)} 
                                            disabled={fields.length <= 1}
                                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-0"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            
                            {fields.length === 0 && (
                                <div className="text-center py-10 text-gray-400 text-sm">
                                    Click "Add Slot" to begin.
                                </div>
                            )}
                            <div className="h-4"></div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end gap-3 z-20 rounded-b-xl">
                    <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
                    <Button type="submit" form="manual-slot-form" isLoading={isSubmitting}><Save className="mr-2 h-4 w-4" />Save Slots</Button>
                </div>
            </form>
        </Modal>
    );
};

export default ManualSlotFormModal;
