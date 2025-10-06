// // client/src/components/interviewer/AvailabilityForm.jsx
// import React from 'react';
// import { useForm, useFieldArray } from 'react-hook-form';
// import { useAlert } from '@/hooks/useAlert';
// import { FiPlus, FiTrash2, FiSave, FiInfo } from 'react-icons/fi';
// import { TIME_SLOTS } from '@/utils/constants';
// import { formatDate } from '@/utils/formatters';

// const LocalButton = ({ children, onClick, type = 'button', isLoading = false, variant = 'primary', icon: Icon, disabled = false, className = '', ...props }) => {
//     const baseClasses = "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm transition-all duration-200";
//     const variantClasses = {
//         primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
//         outline: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500',
//         danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
//         ghost: 'text-gray-500 hover:bg-gray-100 focus:ring-gray-300 shadow-none'
//     };
//     return (
//         <button type={type} onClick={onClick} disabled={isLoading || disabled} className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
//             {isLoading ? "Saving..." : <>{Icon && <Icon className="mr-2 h-4 w-4" />}{children}</>}
//         </button>
//     );
// };
// const LocalTextarea = React.forwardRef(({ label, error, ...props }, ref) => (
//     <div>
//         {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
//         <textarea
//             ref={ref}
//             {...props}
//             className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 text-sm ${
//                 error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
//             }`}
//         />
//         {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
//     </div>
// ));
// LocalTextarea.displayName = 'LocalTextarea';

// const AvailabilityForm = ({ onSubmit, bookingDate, isSubmitting }) => {
//     const { showError } = useAlert();
//     const { register, control, handleSubmit, formState: { errors }, watch } = useForm({
//         defaultValues: { slots: [{ startTime: '', endTime: '' }], remarks: '' }
//     });

//     const { fields, append, remove } = useFieldArray({ control, name: 'slots' });

//     const validateEndTime = (endTime, index) => {
//         const startTime = watch(`slots.${index}.startTime`);
//         if (!startTime || !endTime) return true;
//         return endTime > startTime || 'End time must be after the start time.';
//     };

//     const handleFormSubmit = (data) => {
//         const validSlots = data.slots.filter(slot => slot.startTime && slot.endTime);
//         if (validSlots.length === 0) {
//             return showError('Please provide at least one complete time slot.');
//         }
//         onSubmit({ ...data, slots: validSlots });
//     };
    
//     const selectInputClass = "w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm";
//     const errorInputClass = "border-red-500 focus:border-red-500";

//     return (
//         <form id="availability-form" onSubmit={handleSubmit(handleFormSubmit)}>
//             <div className="space-y-6">
//                 <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-md">
//                     <div className="flex">
//                         <div className="flex-shrink-0"><FiInfo className="h-5 w-5 text-blue-500" /></div>
//                         <div className="ml-3"><p className="text-sm text-blue-800">You are providing your availability for <strong>{formatDate(bookingDate)}</strong>. All times are in your local timezone.</p></div>
//                     </div>
//                 </div>

//                 <div className="space-y-4">
//                     <div className="flex justify-between items-center">
//                         <h3 className="text-lg font-semibold text-gray-800">Time Slots</h3>
//                         <LocalButton
//                             type="button"
//                             variant="outline"
//                             onClick={() => append({ startTime: '', endTime: '' })}
//                             icon={FiPlus}
//                         >
//                             Add Slot
//                         </LocalButton>
//                     </div>

//                     {fields.map((field, index) => (
//                         <div key={field.id} className="grid grid-cols-12 gap-x-4 items-start bg-gray-50 p-3 rounded-lg border">
//                             <div className="col-span-5">
//                                 <label className="text-sm font-medium text-gray-700">Start Time</label>
//                                 <select {...register(`slots.${index}.startTime`, { required: 'Start time is required.' })} className={`mt-1 ${selectInputClass} ${errors.slots?.[index]?.startTime ? errorInputClass : ''}`} defaultValue="">
//                                     <option value="" disabled>Select...</option>
//                                     {TIME_SLOTS.map(slot => <option key={slot.value + '-start'} value={slot.value}>{slot.label}</option>)}
//                                 </select>
//                                 {errors.slots?.[index]?.startTime && <p className="mt-1 text-xs text-red-600">{errors.slots[index].startTime.message}</p>}
//                             </div>
//                             <div className="col-span-5">
//                                 <label className="text-sm font-medium text-gray-700">End Time</label>
//                                 <select {...register(`slots.${index}.endTime`, { required: 'End time is required.', validate: (value) => validateEndTime(value, index) })} className={`mt-1 ${selectInputClass} ${errors.slots?.[index]?.endTime ? errorInputClass : ''}`} defaultValue="">
//                                     <option value="" disabled>Select...</option>
//                                     {TIME_SLOTS.map(slot => <option key={slot.value + '-end'} value={slot.value}>{slot.label}</option>)}
//                                 </select>
//                                 {errors.slots?.[index]?.endTime && <p className="mt-1 text-xs text-red-600">{errors.slots[index].endTime.message}</p>}
//                             </div>
//                             <div className="col-span-2 flex items-center justify-center pt-7">
//                                 <LocalButton type="button" variant="ghost" className="!p-2 text-red-500 hover:!bg-red-50" onClick={() => remove(index)} disabled={fields.length <= 1}>
//                                     <FiTrash2 />
//                                 </LocalButton>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
                
//                 <div>
//                     <LocalTextarea label="Remarks (Optional)" placeholder="Add any notes for the admin regarding your availability..." rows="3" {...register('remarks')} />
//                 </div>
//             </div>
//         </form>
//     );
// };
// export default AvailabilityForm;



// client/src/components/interviewer/AvailabilityForm.jsx
import React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import Select from 'react-select';
import { useAlert } from '@/hooks/useAlert';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { TIME_SLOTS } from '@/utils/constants';

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
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Time Slots</h3>
                    
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
                                        <FiTrash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-4">
                        <button
                            type="button"
                            onClick={() => append({ startTime: null, endTime: null })}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-600 border-2 border-dashed border-slate-300 rounded-lg hover:bg-indigo-50 hover:border-indigo-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <FiPlus className="w-4 h-4" />
                            Add Another Slot
                        </button>
                    </div>
                </div>

                {/* --- REDESIGNED REMARKS SECTION --- */}
                <div>
                    <label htmlFor="remarks" className="block text-xl font-bold text-slate-800 mb-4">Remarks <span className="text-sm font-normal text-slate-500">(Optional)</span></label>
                    <textarea
                        id="remarks"
                        placeholder="Add any notes for the admin regarding your availability..."
                        rows="4"
                        {...register('remarks')}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                </div>
            </div>
        </form>
    );
};

export default AvailabilityForm;
