// client/src/components/interviewer/AvailabilityForm.jsx
import React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import Select from 'react-select';
import { useAlert } from '@/hooks/useAlert';
import { Plus, Trash2 } from 'lucide-react';
import { TIME_SLOTS } from '@/utils/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const AvailabilityForm = ({ onSubmit, bookingDate, isSubmitting }) => {
    const { showError } = useAlert();
    const { register, control, handleSubmit, formState: { errors }, watch } = useForm({
        defaultValues: { slots: [{ startTime: null, endTime: null }], remarks: '' }
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'slots' });

    const validateEndTime = (endTime, index) => {
        const startTime = watch(`slots.${index}.startTime`);
        if (!startTime || !endTime) return true;
        return endTime.value > startTime.value || 'End time must be after the start time.';
    };

    const handleFormSubmit = (data) => {
        const validSlots = data.slots
            .filter(slot => slot.startTime && slot.endTime)
            .map(slot => ({ startTime: slot.startTime.value, endTime: slot.endTime.value }));

        if (validSlots.length === 0) {
            return showError('Please provide at least one complete time slot.');
        }
        onSubmit({ remarks: data.remarks, slots: validSlots });
    };

    const customSelectStyles = (hasError) => ({
        control: (provided, state) => ({
            ...provided,
            minHeight: '42px',
            backgroundColor: 'white',
            borderColor: hasError ? '#ef4444' : (state.isFocused ? '#6366f1' : '#d1d5db'),
            boxShadow: state.isFocused ? '0 0 0 1px #6366f1' : 'none',
            '&:hover': {
                borderColor: hasError ? '#ef4444' : '#a5b4fc',
            },
        }),
        menu: (provided) => ({
            ...provided,
            zIndex: 20,
        }),
        placeholder: (provided) => ({
            ...provided,
            color: '#6b7280',
        }),
    });

    return (
        <form id="availability-form" onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="space-y-8">
                {/* --- REDESIGNED TIME SLOTS SECTION --- */}
                <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-4">Time Slots</h3>
                    
                    <div className="grid grid-cols-12 gap-x-4 px-1 pb-2">
                        <label className="col-span-5 text-sm font-semibold text-slate-600">Start Time</label>
                        <label className="col-span-5 text-sm font-semibold text-slate-600">End Time</label>
                    </div>

                    <div className="space-y-3">
                        {fields.map((field, index) => (
                            <div key={field.id} className="group grid grid-cols-12 gap-x-4 items-start p-1">
                                <div className="col-span-5">
                                    <Controller
                                        name={`slots.${index}.startTime`}
                                        control={control}
                                        rules={{ required: 'Required' }}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                options={TIME_SLOTS}
                                                placeholder="Select..."
                                                styles={customSelectStyles(errors.slots?.[index]?.startTime)}
                                            />
                                        )}
                                    />
                                    {errors.slots?.[index]?.startTime && <p className="mt-1 text-xs text-red-600">{errors.slots[index].startTime.message}</p>}
                                </div>
                                
                                <div className="col-span-5">
                                    <Controller
                                        name={`slots.${index}.endTime`}
                                        control={control}
                                        rules={{ required: 'Required', validate: (value) => validateEndTime(value, index) }}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                options={TIME_SLOTS}
                                                placeholder="Select..."
                                                styles={customSelectStyles(errors.slots?.[index]?.endTime)}
                                            />
                                        )}
                                    />
                                    {errors.slots?.[index]?.endTime && <p className="mt-1 text-xs text-red-600">{errors.slots[index].endTime.message}</p>}
                                </div>

                                <div className="col-span-2 flex items-center justify-center pt-1">
                                    <button 
                                      type="button" 
                                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200 opacity-50 group-hover:opacity-100" 
                                      onClick={() => remove(index)} 
                                      disabled={fields.length <= 1}
                                      title="Remove slot"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => append({ startTime: null, endTime: null })}
                            className="w-full border-2 border-dashed border-slate-300 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-500"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Another Slot
                        </Button>
                    </div>
                </div>

                {/* --- REDESIGNED REMARKS SECTION --- */}
                <div>
                    <label htmlFor="remarks" className="block text-xl font-semibold text-slate-800 mb-4">Remarks <span className="text-sm font-normal text-slate-500">(Optional)</span></label>
                    <textarea
                        id="remarks"
                        placeholder="Add any notes for the admin regarding your availability..."
                        rows="4"
                        {...register('remarks')}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                </div>
            </div>
        </form>
    );
};

export default AvailabilityForm;
