// client/src/pages/interviewer/InterviewerDomainEvaluationPage.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef, Fragment } from 'react';
import {
    getAssignedDomains,
    getEvaluationDataForInterviewer,
    updateEvaluationData,
    updateInterviewStatus,
    getInterviewerEvaluationSummary,
} from '../../api/interviewer.api';
import { useAlert } from '../../hooks/useAlert';
import { formatDate } from '../../utils/formatters';
import { debounce } from '../../utils/helpers';
import Select from 'react-select';
import { 
    FiSearch, FiExternalLink, FiFilter, FiX, FiInfo, FiGrid, 
    FiCalendar, FiCheck, FiRefreshCw, FiArrowLeft, FiLoader, FiList 
} from 'react-icons/fi';
import { MAIN_SHEET_INTERVIEW_STATUSES } from '../../utils/constants';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

// --- STYLED UI COMPONENTS ---

const LocalButton = ({ children, onClick, variant = 'primary', icon: Icon, className = '', disabled = false, size = 'md', title = '' }) => {
    const base = 'inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] whitespace-nowrap focus:outline-none';
    const sizes = { sm: 'text-xs px-3 py-2 rounded-lg', md: 'text-sm px-4 py-2.5 rounded-lg', icon: 'p-2.5 rounded-lg' };
    const variants = {
        primary: 'bg-gray-900 text-white hover:bg-black border border-transparent shadow-sm', 
        accent: 'bg-[#FFD130] text-gray-900 hover:bg-[#FFC400] border border-[#FFD130] shadow-sm',
        outline: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
        ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    };
    return (
        <button onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} title={title}>
            {Icon && <Icon className={`${children ? 'mr-2' : ''} h-4 w-4`} />}
            {children}
        </button>
    );
};

const EditableStatusCell = React.memo(({ interview, onStatusChange, isUpdating }) => {
    const statusConfig = {
        'Completed': 'bg-green-50 text-green-800 border-green-200 focus:ring-green-500',
        'Scheduled': 'bg-blue-50 text-blue-800 border-blue-200 focus:ring-blue-500',
        'InProgress': 'bg-purple-50 text-purple-800 border-purple-200 focus:ring-purple-500',
        'Cancelled': 'bg-red-50 text-red-800 border-red-200 focus:ring-red-500',
    };
    // Reduced padding (py-1) for tighter rows
    const baseClasses = 'w-full text-xs font-bold px-2 py-1 border rounded-md shadow-sm focus:outline-none focus:ring-1 transition-colors cursor-pointer appearance-none';
    const colorClass = statusConfig[interview.interviewStatus] || 'bg-gray-50 text-gray-800 border-gray-200';

    return (
        <select
            value={interview.interviewStatus || ''}
            onChange={(e) => onStatusChange(interview._id, e.target.value)}
            disabled={isUpdating}
            className={`${baseClasses} ${colorClass}`}
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
            // Reduced min-height and padding
            className="w-full h-full min-h-[28px] bg-transparent text-xs p-1 border-0 focus:ring-1 focus:ring-blue-500 rounded resize-none focus:bg-white transition-colors"
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
            if (index === total - 2) return 'text-orange-600 bg-orange-50 font-medium';
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
    const { showError, showSuccess } = useAlert();
    const [loading, setLoading] = useState(true);
    const [domains, setDomains] = useState([]);
    const [selectedDomain, setSelectedDomain] = useState(null);
    const [search, setSearch] = useState('');
    const [summaryData, setSummaryData] = useState([]);
    const [evaluationData, setEvaluationData] = useState({ evaluationSheet: null, interviews: [] });
    const [savingStates, setSavingStates] = useState({});
    const [updatingStatusId, setUpdatingStatusId] = useState(null);
    
    // Filters
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [tempFilters, setTempFilters] = useState({ interviewDate: null, interviewStatus: '' });
    const [activeFilters, setActiveFilters] = useState({ interviewDate: null, interviewStatus: '' });
    const filterMenuRef = useRef(null);

    // Initial Load
    useEffect(() => {
        setLoading(true);
        Promise.all([getAssignedDomains(), getInterviewerEvaluationSummary()])
            .then(([domainsRes, summaryRes]) => {
                setDomains(domainsRes.data.data.map((d) => ({ value: d, label: d })));
                setSummaryData(summaryRes.data.data);
            })
            .catch(() => showError('Failed to load initial data.'))
            .finally(() => setLoading(false));

        const handleClickOutside = (event) => {
            if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) setIsFilterMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showError]);

    // Fetch Detail Data
    const fetchData = useCallback(async () => {
        if (!selectedDomain) {
            setEvaluationData({ evaluationSheet: null, interviews: [] });
            return;
        }
        setLoading(true);
        try {
            const params = { domain: selectedDomain.value, search, ...activeFilters };
            if (activeFilters.interviewDate) params.interviewDate = format(activeFilters.interviewDate, 'yyyy-MM-dd');
            const res = await getEvaluationDataForInterviewer(params);
            setEvaluationData(res.data.data);
        } catch (err) {
            showError('Failed to fetch evaluation data.');
            setEvaluationData({ evaluationSheet: null, interviews: [] });
        } finally {
            setLoading(false);
        }
    }, [selectedDomain, search, activeFilters, showError]);

    useEffect(() => {
        const handler = debounce(fetchData, 300);
        if (selectedDomain) handler();
        return () => handler.cancel();
    }, [fetchData]);

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
                    // Reduced padding for text input
                    className="w-full h-full bg-transparent p-1 text-xs border-0 focus:ring-1 focus:ring-blue-500 rounded focus:bg-white transition-colors"
                />
            );
        }

        // Apply Color Logic
        const currentStyle = getQualityColor(savedValue, column.options);

        return (
            <select
                value={savedValue || ''}
                onChange={(e) => handleSaveEvaluation(interview._id, fieldHeader, e.target.value)}
                // Reduced padding for select
                className={`w-full h-full p-1 text-xs border-0 focus:ring-1 focus:ring-blue-500 rounded cursor-pointer transition-colors ${currentStyle}`}
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
        { key: 'candidateResume', title: 'Resume', minWidth: '100px', render: (row) => row.candidateResume ? <a href={row.candidateResume} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"><FiExternalLink /> Link</a> : '-' }, 
        { key: 'meetingLink', title: 'Link', minWidth: '180px', render: (row) => row.meetingLink ? <a href={row.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block max-w-[180px] text-xs" title={row.meetingLink}>{row.meetingLink}</a> : '-' }, 
        { key: 'interviewDate', title: 'Date', minWidth: '110px', render: (row) => formatDate(row.interviewDate)}, 
        { key: 'interviewTime', title: 'Time', minWidth: '100px' }, 
        { key: 'interviewDuration', title: 'Duration', minWidth: '100px' }, 
        { key: 'interviewStatus', title: 'Status', minWidth: '140px', render: (row) => <EditableStatusCell interview={row} onStatusChange={handleStatusChange} isUpdating={updatingStatusId === row._id} /> },
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
                        <FiInfo className="h-5 w-5 text-indigo-500 cursor-help" />
                        <div className="absolute top-full right-0 mt-2 w-72 bg-gray-900 text-white text-xs rounded-lg shadow-xl p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                            <p className="font-bold mb-1">Important:</p>
                            <ul className="list-disc list-inside space-y-1 opacity-90">
                                <li>Review the Help Document before starting.</li>
                                <li>Ensure recording is ON.</li>
                            </ul>
                        </div>
                    </div>

                    {selectedDomain && (
                        <>
                            <div className="relative w-full sm:w-64">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search candidate..."
                                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
                                />
                            </div>

                            {/* Filter Dropdown - z-50 ensures it's above table headers */}
                            <div className="relative z-50" ref={filterMenuRef}>
                                <LocalButton variant="outline" onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} icon={FiFilter} className={`${(activeFilters.interviewDate || activeFilters.interviewStatus) ? '!border-blue-500 !text-blue-600 !bg-blue-50' : ''}`}>
                                    Filter
                                </LocalButton>
                                {isFilterMenuOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Filter Records</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Interview Date</label>
                                                <div className="relative">
                                                    <DatePicker selected={tempFilters.interviewDate} onChange={(date) => setTempFilters(p => ({ ...p, interviewDate: date }))} isClearable placeholderText="Select date" className="w-full pl-3 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-gray-900" />
                                                    <FiCalendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Status</label>
                                                <select value={tempFilters.interviewStatus} onChange={(e) => setTempFilters(p => ({ ...p, interviewStatus: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-1 focus:ring-gray-900">
                                                    <option value="">All Statuses</option>
                                                    {MAIN_SHEET_INTERVIEW_STATUSES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="mt-5 pt-3 border-t border-gray-100 flex justify-end gap-2">
                                            <LocalButton variant="ghost" size="sm" onClick={handleClearFilters}>Clear</LocalButton>
                                            <LocalButton variant="primary" size="sm" onClick={handleApplyFilters}>Apply</LocalButton>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <LocalButton variant="ghost" onClick={() => { setSelectedDomain(null); handleClearFilters(); }} icon={FiX} title="Close View" />
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
                            <div className="flex h-full items-center justify-center"><FiLoader className="animate-spin h-8 w-8 text-gray-300" /></div>
                        ) : (
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Domain</th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Help Doc</th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Total</th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Scheduled</th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Completed</th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Pending</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 bg-white">
                                    {summaryData.map(item => (
                                        <tr key={item.domainName} className="hover:bg-blue-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <button onClick={() => setSelectedDomain({ value: item.domainName, label: item.domainName })} className="font-bold text-gray-900 group-hover:text-blue-600 flex items-center gap-2">
                                                    {item.domainName}
                                                    <FiArrowLeft className="rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {item.interviewHelpDoc ? (
                                                    <a href={item.interviewHelpDoc} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium text-xs">
                                                        View <FiExternalLink />
                                                    </a>
                                                ) : <span className="text-gray-300">-</span>}
                                            </td>
                                            <td className="px-6 py-4 text-center text-gray-900 font-bold">{item.candidateCount}</td>
                                            <td className="px-6 py-4 text-center"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">{item.scheduledCount}</span></td>
                                            <td className="px-6 py-4 text-center"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700">{item.completedCount}</span></td>
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
                            <div className="flex h-full items-center justify-center"><FiLoader className="animate-spin h-8 w-8 text-gray-300" /></div>
                        ) : (
                            <table className="min-w-full text-sm border-separate border-spacing-0">
                                {/* Fixed Table Header */}
                                <thead className="bg-gray-50 sticky top-0 z-20 shadow-sm">
                                    <tr>
                                        {staticColumns.map(col => (
                                            <th 
                                                key={col.key} 
                                                className={`px-4 py-3 border-b border-r border-gray-200 text-left text-xs font-bold text-gray-600 bg-gray-50 sticky top-0 ${col.isSticky ? 'z-30' : 'z-20'}`} 
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
                                        {evaluationData.evaluationSheet?.columnGroups.map(group => {
                                            const hasSubHeaders = group.columns.some(col => col.header && col.header.trim() !== '');
                                            return (
                                                <th 
                                                    key={group.title} 
                                                    colSpan={group.columns.length || 1} 
                                                    rowSpan={hasSubHeaders ? 1 : 2} 
                                                    className="px-4 py-2 border-b border-r border-gray-200 text-center text-xs font-bold text-gray-800 bg-gray-100 uppercase tracking-wide sticky top-0 z-20"
                                                >
                                                    {group.title}
                                                </th>
                                            );
                                        })}
                                    </tr>
                                    <tr>
                                        {evaluationData.evaluationSheet?.columnGroups.flatMap(group => {
                                            const hasSubHeaders = group.columns.some(col => col.header && col.header.trim() !== '');
                                            if (!hasSubHeaders) return null;
                                            return group.columns.map(col => (
                                                <th 
                                                    key={`${group.title}-${col.header}`} 
                                                    className="px-3 py-2 border-b border-r border-gray-200 text-left text-[11px] font-semibold text-gray-500 bg-gray-50 whitespace-nowrap top-[41px] sticky z-20" 
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
                                        <tr key={interview._id} className="hover:bg-gray-50/80 transition-colors">
                                            {staticColumns.map(col => (
                                                <td 
                                                    key={`${col.key}-${interview._id}`} 
                                                    // Reduced padding to py-1
                                                    className={`px-3 py-1 border-r border-gray-100 text-xs text-gray-700 whitespace-nowrap align-middle ${col.isSticky ? 'sticky z-10 bg-white group-hover:bg-gray-50' : ''} ${col.isCustomCell ? 'p-1' : ''}`}
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
                                                        className="px-2 py-1 border-r border-gray-100 text-xs text-center align-middle"
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
