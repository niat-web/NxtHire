// client/src/pages/interviewer/InterviewerDomainEvaluationPage.jsx
import React, { useState, useEffect, useMemo, useRef, useCallback, Fragment } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    updateEvaluationData,
    updateInterviewStatus,
} from '../../api/interviewer.api';
import { useAlert } from '../../hooks/useAlert';
import {
    useAssignedDomains,
    useInterviewerEvaluationSummary,
    useInterviewerEvaluationData,
    useInvalidateInterviewer,
} from '../../hooks/useInterviewerQueries';
import { formatDate, formatTime } from '../../utils/formatters';

import Select from 'react-select';
import {
    Search, ExternalLink, Filter, X, Info, Grid,
    Calendar, Check, RefreshCw, ArrowLeft, Loader2, List
} from 'lucide-react';
import { useInterviewStatuses } from '../../hooks/useAdminQueries';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Loader from '@/components/common/Loader';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

// --- STYLED UI COMPONENTS ---


const EditableStatusCell = React.memo(({ interview, onStatusChange, isUpdating }) => {
    const statusConfig = {
        'Completed': 'bg-green-50 text-green-800',
        'Scheduled': 'bg-emerald-50 text-emerald-800',
        'InProgress': 'bg-purple-50 text-purple-800',
        'Cancelled': 'bg-red-50 text-red-800',
    };
    const colorClass = statusConfig[interview.interviewStatus] || 'bg-white text-gray-800';

    return (
        <select
            value={interview.interviewStatus || ''}
            onChange={(e) => onStatusChange(interview._id, e.target.value)}
            disabled={isUpdating}
            className={cn(
                'block w-full h-full min-h-[34px] text-xs font-semibold px-3 py-2 border-0 rounded-none focus:outline-none focus:ring-1 focus:ring-inset focus:ring-blue-400 transition-colors cursor-pointer appearance-none',
                colorClass
            )}
            onClick={(e) => e.stopPropagation()}
        >
            <option value="" disabled>Select Status</option>
            {MAIN_SHEET_INTERVIEW_STATUSES.map((status) => (
                <option key={status.value} value={status.value} className="bg-white text-gray-900">{status.label}</option>
            ))}
        </select>
    );
});

const EditableRemarksCell = React.memo(({ interview, onSave, isUpdating }) => {
    const [value, setValue] = useState(interview.interviewerRemarks || '');
    useEffect(() => { setValue(interview.interviewerRemarks || ''); }, [interview.interviewerRemarks]);
    const handleBlur = () => { if (value !== (interview.interviewerRemarks || '')) onSave(interview._id, value); };

    return (
        <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleBlur}
            disabled={isUpdating}
            placeholder="Add remarks..."
            className="block w-full h-full min-h-[34px] bg-transparent text-xs px-3 py-2 border-0 resize-none focus:outline-none focus:ring-1 focus:ring-inset focus:ring-blue-400 focus:bg-white transition-colors"
        />
    );
});

const selectStyles = {
    control: (base, state) => ({
        ...base,
        borderColor: state.isFocused ? '#111827' : '#E5E7EB',
        boxShadow: 'none',
        '&:hover': { borderColor: '#9CA3AF' },
        padding: '2px',
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
        minHeight: '42px',
        width: '100%'
    }),
    menu: (base) => ({ ...base, zIndex: 60, borderRadius: '0.5rem', border: '1px solid #E5E7EB', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected ? '#F3F4F6' : state.isFocused ? '#F9FAFB' : 'white',
        color: state.isSelected ? '#111827' : '#374151',
        cursor: 'pointer',
        fontSize: '0.875rem'
    })
};

// --- HELPER: COLOR LOGIC ---
const getQualityColor = (value, options) => {
    if (!value) return 'text-gray-900 bg-white';

    if (options && options.length > 0) {
        const index = options.findIndex(o => String(o.value) === String(value));
        const total = options.length;
        if (index !== -1) {
            if (index === 0) return 'text-green-700 bg-green-50 font-bold border-green-200';
            if (index === 1 && total > 3) return 'text-green-600 bg-green-50 font-medium';
            if (index === total - 1) return 'text-red-700 bg-red-50 font-bold border-red-200';
            if (index === total - 2) return 'text-emerald-600 bg-emerald-50 font-medium';
            return 'text-yellow-600 bg-yellow-50 font-medium';
        }
    }

    const lower = String(value).toLowerCase();
    if (lower.includes('excellent') || lower.includes('well-organized') || lower === '5') return 'text-green-700 bg-green-50 font-bold';
    if (lower.includes('good') || lower === '4') return 'text-green-600 bg-green-50';
    if (lower.includes('average') || lower.includes('fair') || lower === '3') return 'text-yellow-600 bg-yellow-50';
    if (lower.includes('poor') || lower.includes('lacks') || lower === '1') return 'text-red-700 bg-red-50 font-bold';
    
    return 'text-gray-900 bg-white';
};

// --- MAIN PAGE COMPONENT ---

const InterviewerDomainEvaluationPage = () => {
    const MAIN_SHEET_INTERVIEW_STATUSES = useInterviewStatuses();
    const { showError, showSuccess } = useAlert();
    const navigate = useNavigate();
    const { domainName: domainNameParam } = useParams();
    const selectedDomain = useMemo(
        () => (domainNameParam ? { value: decodeURIComponent(domainNameParam), label: decodeURIComponent(domainNameParam) } : null),
        [domainNameParam]
    );
    const setSelectedDomain = useCallback(
        (val) => {
            if (val && val.value) {
                navigate(`/interviewer/domain-evaluation/${encodeURIComponent(val.value)}`);
            } else {
                navigate('/interviewer/domain-evaluation');
            }
        },
        [navigate]
    );
    const [search, setSearch] = useState('');
    const [savingStates, setSavingStates] = useState({});
    const [updatingStatusId, setUpdatingStatusId] = useState(null);

    // Filters
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [tempFilters, setTempFilters] = useState({ interviewDate: null, interviewStatus: '' });
    const [activeFilters, setActiveFilters] = useState({ interviewDate: null, interviewStatus: '' });
    const filterMenuRef = useRef(null);

    const { invalidateEvaluation } = useInvalidateInterviewer();

    // Initial Load via TanStack Query
    const { data: rawDomains, isLoading: domainsLoading } = useAssignedDomains();
    const { data: summaryData = [], isLoading: summaryLoading } = useInterviewerEvaluationSummary();

    const domains = useMemo(() => {
        if (!rawDomains) return [];
        return rawDomains.map((d) => ({ value: d, label: d }));
    }, [rawDomains]);

    // Build params for evaluation data query
    const evalParams = useMemo(() => {
        if (!selectedDomain) return null;
        const params = { domain: selectedDomain.value, search, ...activeFilters };
        if (activeFilters.interviewDate) params.interviewDate = format(activeFilters.interviewDate, 'yyyy-MM-dd');
        return params;
    }, [selectedDomain, search, activeFilters]);

    const { data: queryEvalData, isLoading: evalLoading } = useInterviewerEvaluationData(
        evalParams,
        { enabled: !!selectedDomain }
    );

    const [evaluationData, setEvaluationData] = useState({ evaluationSheet: null, interviews: [] });

    // Sync query data into local state (needed for optimistic updates on mutations)
    useEffect(() => {
        if (queryEvalData) {
            setEvaluationData(queryEvalData);
        } else if (!selectedDomain) {
            setEvaluationData({ evaluationSheet: null, interviews: [] });
        }
    }, [queryEvalData, selectedDomain]);

    const loading = !selectedDomain ? (domainsLoading || summaryLoading) : evalLoading;

    // Close filter menu on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) setIsFilterMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handlers
    const handleApplyFilters = () => { setActiveFilters(tempFilters); setIsFilterMenuOpen(false); };
    const handleClearFilters = () => { 
        setTempFilters({ interviewDate: null, interviewStatus: '' }); 
        setActiveFilters({ interviewDate: null, interviewStatus: '' }); 
        setIsFilterMenuOpen(false); 
    };

    const handleSaveEvaluation = (interviewId, fieldHeader, value) => {
        const stateKey = `${interviewId}-${fieldHeader}`;
        setSavingStates((prev) => ({ ...prev, [stateKey]: true }));

        setEvaluationData((currentData) => {
            const originalInterviews = currentData.interviews;
            const idx = originalInterviews.findIndex((i) => i._id === interviewId);
            if (idx === -1) {
                setSavingStates((prev) => ({ ...prev, [stateKey]: false }));
                return currentData;
            }
            
            const newPayload = { ...originalInterviews[idx].evaluationData, [fieldHeader]: value };
            const updatedInterview = { ...originalInterviews[idx], evaluationData: newPayload };
            const newInterviews = [...originalInterviews];
            newInterviews[idx] = updatedInterview;

            updateEvaluationData(interviewId, { evaluationData: newPayload })
                .catch(() => {
                    showError('Save failed.');
                    setEvaluationData({ ...currentData, interviews: originalInterviews });
                })
                .finally(() => setSavingStates((prev) => ({ ...prev, [stateKey]: false })));
                
            return { ...currentData, interviews: newInterviews };
        });
    };

    const handleStatusChange = async (interviewId, newStatus) => {
        setUpdatingStatusId(interviewId);
        try {
            await updateInterviewStatus(interviewId, newStatus);
            setEvaluationData((prev) => ({
                ...prev,
                interviews: prev.interviews.map((i) => i._id === interviewId ? { ...i, interviewStatus: newStatus } : i),
            }));
            showSuccess('Status updated!');
        } catch (err) { showError('Failed to update status.'); } 
        finally { setUpdatingStatusId(null); }
    };

    const handleRemarkSave = async (interviewId, remarks) => {
        const stateKey = `${interviewId}-interviewerRemarks`;
        setSavingStates((prev) => ({ ...prev, [stateKey]: true }));
        try {
            await updateEvaluationData(interviewId, { interviewerRemarks: remarks });
        } catch (error) { showError('Failed to save remarks.'); } 
        finally { setSavingStates((prev) => ({ ...prev, [stateKey]: false })); }
    };

    const renderCellContent = (interview, column, group) => {
        const fieldHeader = column.header || group.title;
        const savedValue = interview.evaluationData ? interview.evaluationData[fieldHeader] : '';
        const isLoading = savingStates[`${interview._id}-${fieldHeader}`];

        if (column.type === 'text') {
            return (
                <input
                    type="text"
                    defaultValue={savedValue}
                    onBlur={(e) => handleSaveEvaluation(interview._id, fieldHeader, e.target.value)}
                    placeholder="Value..."
                    disabled={isLoading}
                    className="block w-full h-full min-h-[34px] bg-transparent px-3 py-2 text-xs border-0 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-blue-400 focus:bg-white transition-colors"
                />
            );
        }

        // Apply Color Logic
        const currentStyle = getQualityColor(savedValue, column.options);

        return (
            <select
                value={savedValue || ''}
                onChange={(e) => handleSaveEvaluation(interview._id, fieldHeader, e.target.value)}
                className={cn(
                    'block w-full h-full min-h-[34px] px-3 py-2 text-xs border-0 rounded-none focus:outline-none focus:ring-1 focus:ring-inset focus:ring-blue-400 cursor-pointer transition-colors appearance-none',
                    currentStyle
                )}
                disabled={isLoading}
            >
                <option value="" className="text-gray-400 bg-white">Select...</option>
                {column.options.map((opt, i) => (
                    <option
                        key={i}
                        value={opt.value}
                        className={`py-1 ${getQualityColor(opt.value, column.options)}`}
                    >
                        {opt.label}
                    </option>
                ))}
            </select>
        );
    };
    
    // Configured Static Columns
    const staticColumns = useMemo(() => [
        // Sticky Columns (Left)
        { key: 'candidateName', title: 'Candidate Name', minWidth: '180px', isSticky: true, left: 0 }, 
        { key: 'uid', title: 'UID', minWidth: '160px', isSticky: true, left: 180 }, 
        
        // Scrollable Columns
        { key: 'techStack', title: 'Domain', minWidth: '140px' }, 
        { key: 'interviewId', title: 'ID', minWidth: '100px' }, 
        { key: 'mobileNumber', title: 'Mobile', minWidth: '120px' }, 
        { key: 'mailId', title: 'Email', minWidth: '200px' }, 
        { key: 'candidateResume', title: 'Resume', minWidth: '100px', render: (row) => row.candidateResume ? <a href={row.candidateResume} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"><ExternalLink /> Link</a> : '-' },
        { key: 'meetingLink', title: 'Link', minWidth: '180px', render: (row) => row.meetingLink ? <a href={row.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block max-w-[180px] text-xs" title={row.meetingLink}>{row.meetingLink}</a> : '-' }, 
        { key: 'interviewDate', title: 'Date', minWidth: '110px', render: (row) => formatDate(row.interviewDate)}, 
        { 
            key: 'interviewTime', 
            title: 'Time', 
            minWidth: '130px', 
            render: (row) => row.interviewTime ? row.interviewTime.split('-').map(t => formatTime(t.trim())).join(' - ') : '-' 
        }, 
        { key: 'interviewDuration', title: 'Duration', minWidth: '100px' },
        { key: 'interviewStatus', title: 'Status', minWidth: '140px', isCustomCell: true, render: (row) => <EditableStatusCell interview={row} onStatusChange={handleStatusChange} isUpdating={updatingStatusId === row._id} /> },
        { key: 'interviewerRemarks', title: 'Remarks', minWidth: '200px', isCustomCell: true, render: (row) => <EditableRemarksCell interview={row} onSave={handleRemarkSave} isUpdating={savingStates[`${row._id}-interviewerRemarks`]} />},
    ], [updatingStatusId, savingStates, handleStatusChange, handleRemarkSave]);

    return (
        <div className="flex flex-col h-full bg-white overflow-hidden">
            
            {/* Top Toolbar */}
            <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0 flex flex-col md:flex-row items-center justify-between gap-4 z-40 relative">
                
                {/* Left: Domain Selector */}
                <div className="w-full md:w-72 relative">
                    <Select
                        options={domains}
                        value={selectedDomain}
                        onChange={(val) => { setSelectedDomain(val); handleClearFilters(); }}
                        placeholder="Select Domain to Evaluate..."
                        styles={selectStyles}
                    />
                </div>

                {/* Right: Controls */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                    
                    {/* Info Help */}
                    <div className="relative group mr-2">
                        <Info className="h-5 w-5 text-blue-500 cursor-help" />
                        <div className="absolute top-full right-0 mt-2 w-72 bg-gray-900 text-white text-xs rounded-lg shadow-xl p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                            <p className="font-semibold mb-1">Important:</p>
                            <ul className="list-disc list-inside space-y-1 opacity-90">
                                <li>Review the Help Document before starting.</li>
                                <li>Ensure recording is ON.</li>
                            </ul>
                        </div>
                    </div>

                    {selectedDomain && (
                        <>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search candidate..."
                                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                />
                            </div>

                            {/* Filter Dropdown - z-50 ensures it's above table headers */}
                            <div className="relative z-50" ref={filterMenuRef}>
                                <Button variant="outline" onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} className={cn((activeFilters.interviewDate || activeFilters.interviewStatus) && "border-blue-500 text-blue-600 bg-blue-50")}>
                                    <Filter className="h-4 w-4 mr-2" />Filter
                                </Button>
                                {isFilterMenuOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50">
                                        <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Filter Records</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Interview Date</label>
                                                <div className="relative">
                                                    <DatePicker selected={tempFilters.interviewDate} onChange={(date) => setTempFilters(p => ({ ...p, interviewDate: date }))} isClearable placeholderText="Select date" className="w-full pl-3 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500" portalId="datepicker-portal" popperClassName="!z-[9999]" popperProps={{ strategy: 'fixed' }} />
                                                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Status</label>
                                                <select value={tempFilters.interviewStatus} onChange={(e) => setTempFilters(p => ({ ...p, interviewStatus: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-1 focus:ring-blue-500">
                                                    <option value="">All Statuses</option>
                                                    {MAIN_SHEET_INTERVIEW_STATUSES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="mt-5 pt-3 border-t border-gray-100 flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={handleClearFilters}>Clear</Button>
                                            <Button variant="default" size="sm" onClick={handleApplyFilters}>Apply</Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <Button variant="ghost" onClick={() => { setSelectedDomain(null); handleClearFilters(); }} title="Close View"><X className="h-4 w-4" /></Button>
                        </>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden relative flex flex-col">
                {!selectedDomain ? (
                    // Summary View
                    <div className="flex-1 overflow-auto bg-white">
                        {loading ? (
                            <div className="flex h-full items-center justify-center"><Loader size="lg" /></div>
                        ) : (
                            <table className="min-w-full text-sm">
                                <thead className="bg-blue-50 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">Domain</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">Help Doc</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">Total</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">Scheduled</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">Completed</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">Pending</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 bg-white">
                                    {summaryData.map(item => (
                                        <tr key={item.domainName} className="hover:bg-blue-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <button onClick={() => setSelectedDomain({ value: item.domainName, label: item.domainName })} className="font-semibold text-gray-900 group-hover:text-blue-600 flex items-center gap-2">
                                                    {item.domainName}
                                                    <ArrowLeft className="rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {item.interviewHelpDoc ? (
                                                    <a href={item.interviewHelpDoc} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium text-xs">
                                                        View <ExternalLink />
                                                    </a>
                                                ) : <span className="text-gray-300">-</span>}
                                            </td>
                                            <td className="px-6 py-4 text-center text-gray-900 font-semibold">{item.candidateCount}</td>
                                            <td className="px-6 py-4 text-center"><Badge variant="success">{item.scheduledCount}</Badge></td>
                                            <td className="px-6 py-4 text-center"><Badge variant="success">{item.completedCount}</Badge></td>
                                            <td className="px-6 py-4 text-center text-gray-400">{item.pendingCount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                ) : (
                    // Detail View (Full Width Table)
                    <div className="flex-1 overflow-auto custom-scrollbar bg-white">
                        {loading ? (
                            <div className="flex h-full items-center justify-center"><Loader size="lg" /></div>
                        ) : (
                            <table className="min-w-full text-sm border-separate border-spacing-0">
                                {/* Fixed Table Header */}
                                <thead className="bg-blue-50 sticky top-0 z-20">
                                    <tr>
                                        {staticColumns.map(col => (
                                            <th
                                                key={col.key}
                                                className={cn("px-4 py-3 border-b border-r border-gray-200 text-left text-xs font-medium text-gray-600 bg-blue-50 sticky top-0", col.isSticky ? "z-30" : "z-20")} 
                                                style={{ 
                                                    minWidth: col.minWidth, 
                                                    left: col.isSticky ? col.left : 'auto',
                                                    boxShadow: col.isSticky ? '2px 0 5px -2px rgba(0,0,0,0.1)' : 'none'
                                                }} 
                                                rowSpan={2}
                                            >
                                                {col.title}
                                            </th>
                                        ))}
                                        {evaluationData.evaluationSheet?.columnGroups.map((group, groupIdx) => {
                                            const hasSubHeaders = group.columns.some(col => col.header && col.header.trim() !== '');
                                            const groupColors = [
                                                { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-200' },
                                                { bg: 'bg-violet-100', text: 'text-violet-800', border: 'border-violet-200' },
                                                { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
                                                { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
                                                { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-200' },
                                                { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' },
                                                { bg: 'bg-fuchsia-100', text: 'text-fuchsia-800', border: 'border-fuchsia-200' },
                                                { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
                                            ];
                                            const color = groupColors[groupIdx % groupColors.length];
                                            return (
                                                <th
                                                    key={group.title}
                                                    colSpan={group.columns.length || 1}
                                                    rowSpan={hasSubHeaders ? 1 : 2}
                                                    className={`px-4 py-2.5 border-b border-r ${color.border} text-center text-xs font-medium ${color.text} ${color.bg} uppercase tracking-wider sticky top-0 z-20`}
                                                >
                                                    {group.title}
                                                </th>
                                            );
                                        })}
                                    </tr>
                                    <tr>
                                        {evaluationData.evaluationSheet?.columnGroups.flatMap((group, groupIdx) => {
                                            const hasSubHeaders = group.columns.some(col => col.header && col.header.trim() !== '');
                                            if (!hasSubHeaders) return null;
                                            const subColors = [
                                                { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-100' },
                                                { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-100' },
                                                { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
                                                { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
                                                { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100' },
                                                { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-100' },
                                                { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-100' },
                                                { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
                                            ];
                                            const color = subColors[groupIdx % subColors.length];
                                            return group.columns.map(col => (
                                                <th
                                                    key={`${group.title}-${col.header}`}
                                                    className={`px-3 py-2 border-b border-r ${color.border} text-left text-xs font-medium ${color.text} ${color.bg} whitespace-nowrap top-[41px] sticky z-20`}
                                                    style={{ minWidth: '160px' }}
                                                >
                                                    {col.header}
                                                </th>
                                            ));
                                        })}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {evaluationData.interviews.map(interview => (
                                        <tr key={interview._id} className="hover:bg-gray-50/80 transition-colors h-px">
                                            {staticColumns.map(col => (
                                                <td
                                                    key={`${col.key}-${interview._id}`}
                                                    className={cn(
                                                        "border-r border-gray-100 text-xs text-gray-700 whitespace-nowrap align-middle h-full",
                                                        col.isCustomCell ? "p-0" : "px-3 py-1",
                                                        col.isSticky && "sticky z-10 bg-white group-hover:bg-gray-50"
                                                    )}
                                                    style={{
                                                        left: col.isSticky ? col.left : 'auto',
                                                        boxShadow: col.isSticky ? '2px 0 5px -2px rgba(0,0,0,0.05)' : 'none'
                                                    }}
                                                >
                                                    {col.render ? col.render(interview) : interview[col.key]}
                                                </td>
                                            ))}
                                            {evaluationData.evaluationSheet?.columnGroups.flatMap(group =>
                                                group.columns.map(col => (
                                                    <td
                                                        key={`${group.title}-${col.header}-${interview._id}`}
                                                        className="p-0 border-r border-gray-100 text-xs text-center align-middle h-full"
                                                    >
                                                        {renderCellContent(interview, col, group)}
                                                    </td>
                                                ))
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InterviewerDomainEvaluationPage;
