import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, Search, Check, X, Users, ChevronDown } from 'lucide-react';
import { getInterviewers } from '@/api/admin.api';
import { useAlert } from '@/hooks/useAlert';
import { INTERVIEWER_STATUS } from '@/utils/constants';
import { useDomainOptions } from '@/hooks/useAdminQueries';
import { cn } from '@/lib/utils';

const BookingForm = ({ onSubmit, initialData = null }) => {
    const DOMAINS = useDomainOptions();
    const { showError } = useAlert();
    const { control, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm();

    const [interviewerOptions, setInterviewerOptions] = useState([]);
    const [loadingInterviewers, setLoadingInterviewers] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [domainFilter, setDomainFilter] = useState('');
    const selectedInterviewerIds = watch('interviewerIds', []);

    useEffect(() => {
        setLoadingInterviewers(true);
        getInterviewers({ limit: 1000 })
            .then(res => {
                const options = (res.data.data.interviewers || []).map(i => ({
                    value: i._id,
                    label: [i.user.firstName, i.user.lastName].filter(Boolean).join(' '),
                    email: i.user.email,
                    status: i.status,
                    domains: i.domains || [],
                }));
                setInterviewerOptions(options);
                if (initialData) {
                    reset({ bookingDate: new Date(initialData.bookingDate), interviewerIds: initialData.interviewers.map(i => i.interviewer._id) });
                } else {
                    reset({ bookingDate: null, interviewerIds: [] });
                }
            })
            .catch(() => showError("Failed to load interviewers"))
            .finally(() => setLoadingInterviewers(false));
    }, [initialData, showError, reset]);

    const filtered = useMemo(() =>
        interviewerOptions.filter(i => {
            if (searchTerm && !i.label.toLowerCase().includes(searchTerm.toLowerCase()) && !i.email.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            if (statusFilter && i.status !== statusFilter) return false;
            if (domainFilter && !i.domains.includes(domainFilter)) return false;
            return true;
        }), [interviewerOptions, searchTerm, statusFilter, domainFilter]);

    const activeCount = useMemo(() => filtered.filter(i => i.status === 'Active').length, [filtered]);

    const toggleSelect = (id) => {
        const current = selectedInterviewerIds || [];
        const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
        setValue('interviewerIds', next, { shouldValidate: true, shouldDirty: true });
    };

    const selectActive = () => {
        setValue('interviewerIds', filtered.filter(i => i.status === 'Active').map(i => i.value), { shouldValidate: true, shouldDirty: true });
    };

    const selectAll = () => {
        const allIds = filtered.map(i => i.value);
        const current = selectedInterviewerIds || [];
        setValue('interviewerIds', current.length === allIds.length ? [] : allIds, { shouldValidate: true, shouldDirty: true });
    };

    const getStatusClass = (status) => {
        const s = (status || '').toLowerCase();
        if (['active'].includes(s)) return 'bg-emerald-50 text-emerald-700';
        if (['on probation'].includes(s)) return 'bg-amber-50 text-amber-700';
        return 'bg-slate-100 text-slate-600';
    };

    return (
        <form id="booking-form" onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col overflow-hidden">

            {/* Date picker bar */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-200 bg-slate-50/50 shrink-0">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Interview Date</span>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10 pointer-events-none" />
                    <Controller name="bookingDate" control={control} rules={{ required: 'Select a date' }}
                        render={({ field }) => (
                            <DatePicker selected={field.value} onChange={field.onChange} minDate={new Date()} dateFormat="EEE, MMM d, yyyy" placeholderText="Select date..."
                                portalId="datepicker-portal" popperClassName="!z-[9999]" popperProps={{ strategy: 'fixed' }}
                                className="pl-10 pr-3 h-9 border border-slate-200 rounded-md text-[13px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 bg-white w-52" />
                        )} />
                </div>
                {errors.bookingDate && <span className="text-[11px] text-red-500 font-medium">{errors.bookingDate.message}</span>}

                <div className="flex-1" />

                {/* Selected count */}
                <span className="text-[11px] text-slate-500">
                    Selected: <span className="font-bold text-blue-600">{(selectedInterviewerIds || []).length}</span> / {filtered.length}
                </span>
                {errors.interviewerIds && <span className="text-[11px] text-red-500 font-medium">Select at least one</span>}
            </div>

            {/* Filter bar */}
            <div className="flex items-center gap-2 px-5 py-2 border-b border-slate-100 shrink-0">
                <div className="relative w-52">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search interviewers..."
                        className="w-full pl-9 pr-3 h-8 bg-slate-50 border border-slate-200 rounded-md text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all" />
                </div>
                <div className="relative">
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        className="appearance-none h-8 pl-3 pr-7 bg-white border border-slate-200 rounded-md text-[12px] cursor-pointer hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors">
                        <option value="">All Statuses</option>
                        {Object.values(INTERVIEWER_STATUS).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                </div>
                <div className="relative">
                    <select value={domainFilter} onChange={e => setDomainFilter(e.target.value)}
                        className="appearance-none h-8 pl-3 pr-7 bg-white border border-slate-200 rounded-md text-[12px] cursor-pointer hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors">
                        <option value="">All Domains</option>
                        {DOMAINS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                </div>

                <div className="flex-1" />

                <button type="button" onClick={selectActive} disabled={activeCount === 0}
                    className="inline-flex items-center gap-1 h-7 px-2.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 disabled:opacity-40 transition-colors">
                    Select Active ({activeCount})
                </button>
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                        checked={(selectedInterviewerIds || []).length === filtered.length && filtered.length > 0}
                        onChange={selectAll} disabled={loadingInterviewers || filtered.length === 0} />
                    <span className="text-[11px] text-slate-600 font-medium">All</span>
                </label>
                {(selectedInterviewerIds || []).length > 0 && (
                    <button type="button" onClick={() => setValue('interviewerIds', [], { shouldValidate: true })}
                        className="text-[11px] font-medium text-red-500 hover:text-red-700 transition-colors">Clear</button>
                )}
            </div>

            {/* Interviewer table */}
            <div className="flex-1 overflow-y-auto">
                <Controller name="interviewerIds" control={control} rules={{ required: 'Select at least one interviewer' }}
                    render={({ field }) => (
                        <>
                            {loadingInterviewers ? (
                                <div className="space-y-0">
                                    {[...Array(10)].map((_, i) => (
                                        <div key={i} className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 animate-pulse">
                                            <div className="w-4 h-4 bg-slate-100 rounded" />
                                            <div className="h-3.5 w-32 bg-slate-100 rounded" />
                                            <div className="h-3.5 w-40 bg-slate-100 rounded" />
                                            <div className="h-5 w-16 bg-slate-100 rounded-full" />
                                            <div className="h-5 w-12 bg-slate-100 rounded-full" />
                                        </div>
                                    ))}
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                    <Users size={28} className="mb-2 opacity-20" />
                                    <p className="text-sm font-medium text-slate-500">No interviewers found</p>
                                </div>
                            ) : (
                                <table className="min-w-full">
                                    <thead>
                                        <tr>
                                            <th className="sticky top-0 w-10 px-5 py-2 bg-slate-50 border-b border-slate-200 z-10" />
                                            <th className="sticky top-0 px-3 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] bg-slate-50 border-b border-slate-200 z-10">Name</th>
                                            <th className="sticky top-0 px-3 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] bg-slate-50 border-b border-slate-200 z-10">Email</th>
                                            <th className="sticky top-0 px-3 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] bg-slate-50 border-b border-slate-200 z-10">Status</th>
                                            <th className="sticky top-0 px-3 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] bg-slate-50 border-b border-slate-200 z-10">Domains</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filtered.map(interviewer => {
                                            const isSelected = (field.value || []).includes(interviewer.value);
                                            return (
                                                <tr key={interviewer.value} onClick={() => toggleSelect(interviewer.value)}
                                                    className={cn('cursor-pointer transition-colors', isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50/60')}>
                                                    <td className="px-5 py-2.5">
                                                        <div className={cn('w-4 h-4 rounded border-2 flex items-center justify-center transition-all',
                                                            isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300')}>
                                                            {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-[13px] font-medium text-slate-900">{interviewer.label}</td>
                                                    <td className="px-3 py-2.5 text-[12px] text-slate-500">{interviewer.email}</td>
                                                    <td className="px-3 py-2.5">
                                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${getStatusClass(interviewer.status)}`}>
                                                            {interviewer.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2.5">
                                                        <div className="flex flex-wrap gap-1">
                                                            {interviewer.domains.map((d, i) => (
                                                                <span key={i} className="px-1.5 py-0.5 text-[10px] font-medium text-slate-600 bg-slate-100 rounded">
                                                                    {d}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </>
                    )}
                />
            </div>
        </form>
    );
};

export default BookingForm;
