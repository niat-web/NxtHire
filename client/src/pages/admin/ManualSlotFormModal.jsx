// client/src/pages/admin/ManualSlotFormModal.jsx
import React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import ReactSelect from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { Plus, Trash2, Save, Calendar, Clock, X, Loader2 } from 'lucide-react';
import { TIME_SLOTS } from '../../utils/constants';
import { manualAddBookingSlot } from '../../api/admin.api';
import { useAlert } from '../../hooks/useAlert';
import { cn } from '@/lib/utils';

const ManualSlotFormModal = ({ isOpen, onClose, onSuccess, interviewers }) => {
    const { showSuccess, showError } = useAlert();

    const { control, handleSubmit, register, formState: { errors, isSubmitting }, watch } = useForm({
        defaultValues: { interviewerId: null, date: new Date(), slots: [{ startTime: '', endTime: '' }] }
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'slots' });

    const onSubmit = async (data) => {
        const formattedDate = format(data.date, 'yyyy-MM-dd');
        const payload = { interviewerId: data.interviewerId?.value, date: formattedDate, slots: data.slots.filter(s => s.startTime && s.endTime) };
        if (!payload.interviewerId) return showError("Select an interviewer.");
        if (!payload.slots.length) return showError("Add at least one time slot.");
        try { await manualAddBookingSlot(payload); onSuccess(); onClose(); }
        catch (err) { showError(err.response?.data?.message || "Failed to add slot."); }
    };

    const validateEndTime = (endTime, index) => {
        const startTime = watch(`slots.${index}.startTime`);
        if (!startTime || !endTime) return true;
        return endTime > startTime || 'End must be after start';
    };

    const selectStyles = {
        control: (base, state) => ({ ...base, borderColor: state.isFocused ? '#93c5fd' : '#e2e8f0', boxShadow: state.isFocused ? '0 0 0 2px #dbeafe' : 'none', '&:hover': { borderColor: '#cbd5e1' }, borderRadius: '0.375rem', fontSize: '0.8125rem', minHeight: '36px' }),
        menuPortal: base => ({ ...base, zIndex: 9999 }),
        menu: base => ({ ...base, borderRadius: '0.5rem', border: '1px solid #e2e8f0' }),
        option: (base, state) => ({ ...base, backgroundColor: state.isSelected ? '#eff6ff' : state.isFocused ? '#f8fafc' : 'white', color: '#334155', cursor: 'pointer', fontSize: '0.8125rem' }),
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl border border-slate-200 flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 shrink-0">
                    <h2 className="text-sm font-semibold text-slate-900">Manually Add Slots</h2>
                    <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <form id="manual-slot-form" onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-5 space-y-4">

                    {/* Interviewer + Date — side by side */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Interviewer *</label>
                            <Controller name="interviewerId" control={control} rules={{ required: true }}
                                render={({ field }) => (
                                    <ReactSelect {...field} options={interviewers} placeholder="Search name..." styles={selectStyles} menuPortalTarget={document.body} />
                                )} />
                            {errors.interviewerId && <p className="mt-1 text-[11px] text-red-500">Required</p>}
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Date *</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 z-10 pointer-events-none" />
                                <Controller name="date" control={control} rules={{ required: true }}
                                    render={({ field }) => (
                                        <DatePicker selected={field.value} onChange={field.onChange} minDate={new Date()} dateFormat="EEE, MMM d, yyyy"
                                            portalId="datepicker-portal" popperClassName="!z-[9999]" popperProps={{ strategy: 'fixed' }}
                                            className="w-full pl-9 pr-3 h-9 border border-slate-200 rounded-md text-[13px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 bg-white" />
                                    )} />
                            </div>
                        </div>
                    </div>

                    {/* Time slots */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Time Slots</label>
                            <button type="button" onClick={() => append({ startTime: '', endTime: '' })}
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-800 transition-colors">
                                <Plus size={12} /> Add Slot
                            </button>
                        </div>

                        <div className="space-y-2">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex items-center gap-2">
                                    <div className="flex-1">
                                        <select {...register(`slots.${index}.startTime`, { required: true })}
                                            className="w-full h-9 pl-3 pr-7 bg-white border border-slate-200 rounded-md text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 appearance-none cursor-pointer">
                                            <option value="">Start Time</option>
                                            {TIME_SLOTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                        </select>
                                    </div>
                                    <span className="text-slate-300 text-[12px]">to</span>
                                    <div className="flex-1">
                                        <select {...register(`slots.${index}.endTime`, { required: true, validate: v => validateEndTime(v, index) })}
                                            className={cn('w-full h-9 pl-3 pr-7 bg-white border rounded-md text-[12px] focus:outline-none focus:ring-2 appearance-none cursor-pointer',
                                                errors.slots?.[index]?.endTime ? 'border-red-300 focus:ring-red-100 focus:border-red-300' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-300')}>
                                            <option value="">End Time</option>
                                            {TIME_SLOTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                        </select>
                                        {errors.slots?.[index]?.endTime && <p className="mt-0.5 text-[10px] text-red-500">{errors.slots[index].endTime.message}</p>}
                                    </div>
                                    <button type="button" onClick={() => remove(index)} disabled={fields.length <= 1}
                                        className="w-7 h-7 rounded-md flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 disabled:opacity-0 transition-colors">
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-md text-[11px] text-blue-800">
                        <Clock size={13} className="text-blue-500 mt-0.5 shrink-0" />
                        <span>Slots will be added to the interviewer's availability for the selected date.</span>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-200 shrink-0">
                    <button type="button" onClick={onClose} className="h-9 px-4 text-[13px] font-medium text-slate-700 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors">Cancel</button>
                    <button type="submit" form="manual-slot-form" disabled={isSubmitting}
                        className="inline-flex items-center gap-2 h-9 px-4 text-[13px] font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors">
                        {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        Save Slots
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManualSlotFormModal;
