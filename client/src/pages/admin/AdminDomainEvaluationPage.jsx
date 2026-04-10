// client/src/pages/admin/AdminDomainEvaluationPage.jsx
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import {
    Search, Download, X, Filter, Check, List,
    Calendar, ArrowLeft, Loader2, ExternalLink
} from 'lucide-react';

// API & Utils
import { useDomains, useEvaluationDataAdmin, useDomainEvaluationSummary } from '../../hooks/useAdminQueries';
import { useAlert } from '../../hooks/useAlert';
import { formatDate, formatTime } from '../../utils/formatters';
import { MAIN_SHEET_INTERVIEW_STATUSES } from '../../utils/constants';
import { Button } from '@/components/ui/button';

// --- Styled Components ---

const StatusBadge = ({ status }) => {
    const styles = {
        'Completed': 'bg-green-50 text-green-700 border-green-200',
        'Scheduled': 'bg-emerald-50 text-emerald-700 border-emerald-200',
        'InProgress': 'bg-purple-50 text-purple-700 border-purple-200',
        'Cancelled': 'bg-red-50 text-red-700 border-red-200',
        'Pending': 'bg-amber-50 text-amber-700 border-amber-200'
    };
    const defaultStyle = 'bg-gray-50 text-gray-700 border-gray-200';

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wide border ${styles[status] || defaultStyle}`}>
            {status}
        </span>
    );
};

const RemarksModal = ({ isOpen, onClose, content }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm" onClick={onClose}>
            <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Interviewer Remarks</h3>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 text-gray-500"><X className="h-4 w-4" /></Button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{content}</p>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                    <Button variant="outline" onClick={onClose} size="sm">Close</Button>
                </div>
            </div>
        </div>
    );
};

// --- Main Page Component ---

const AdminDomainEvaluationPage = () => {
    const { showError, showSuccess } = useAlert();
    const [selectedDomain, setSelectedDomain] = useState(null);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [remarksModal, setRemarksModal] = useState({ isOpen: false, content: '' });
    const [showLabels, setShowLabels] = useState(false);

    // Filter States
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [tempFilters, setTempFilters] = useState({ interviewDate: null, interviewStatus: '' });
    const [activeFilters, setActiveFilters] = useState({ interviewDate: null, interviewStatus: '' });
    const filterMenuRef = useRef(null);
    const searchTimerRef = useRef(null);

    // Debounce search input
    useEffect(() => {
        searchTimerRef.current = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(searchTimerRef.current);
    }, [search]);

    // Click outside handler for filter menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
                setIsFilterMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // TanStack Query: Domains list
    const { data: rawDomains = [] } = useDomains();
    const domains = useMemo(() => rawDomains.map(d => ({ value: d.name, label: d.name })), [rawDomains]);

    // TanStack Query: Summary data
    const { data: summaryData = [], isLoading: summaryLoading } = useDomainEvaluationSummary();

    // TanStack Query: Evaluation detail data
    const evalParams = useMemo(() => {
        if (!selectedDomain) return null;
        const params = { domain: selectedDomain.value, search: debouncedSearch, ...activeFilters };
        if (activeFilters.interviewDate) {
            params.interviewDate = format(activeFilters.interviewDate, 'yyyy-MM-dd');
        }
        return params;
    }, [selectedDomain, debouncedSearch, activeFilters]);

    const { data: evaluationData = { evaluationSheet: null, interviews: [] }, isLoading: evalLoading } = useEvaluationDataAdmin(evalParams, {
        enabled: !!selectedDomain,
    });

    const loading = selectedDomain ? evalLoading : summaryLoading;

    // Handlers
    const handleApplyFilters = () => { setActiveFilters(tempFilters); setIsFilterMenuOpen(false); };
    const handleClearFilters = () => { 
        setTempFilters({ interviewDate: null, interviewStatus: '' }); 
        setActiveFilters({ interviewDate: null, interviewStatus: '' }); 
        setIsFilterMenuOpen(false); 
    };

    const findLabelForValue = (value, options) => {
        const option = options.find(opt => String(opt.value) === String(value));
        return option ? option.label : value;
    };

    const renderCellContent = useCallback((interview, column, group, sheet, showLabels) => {
        const fieldHeader = column.header || group.title;
        const savedValue = interview.evaluationData ? interview.evaluationData[fieldHeader] : '';
        if (column.type === 'select' && showLabels) {
            return findLabelForValue(savedValue, column.options);
        }
        return savedValue;
    }, []);

    // Static Columns with Sticky Logic
    const staticColumns = useMemo(() => [
        // Sticky Columns (Candidate Name & UID)
        { key: 'candidateName', title: 'Candidate Name', minWidth: '180px', isSticky: true, left: 0 },
        { key: 'uid', title: 'Candidate UID', minWidth: '180px', isSticky: true, left: 180 },
        
        // Scrollable Columns
        { key: 'techStack', title: 'Domain', minWidth: '150px' },
        { key: 'interviewId', title: 'Interview ID', minWidth: '120px' },
        { key: 'mobileNumber', title: 'Mobile', minWidth: '120px' },
        { key: 'mailId', title: 'Email ID', minWidth: '220px' },
        { 
            key: 'candidateResume', 
            title: 'Resume', 
            minWidth: '100px', 
            render: (row) => row.candidateResume ? <a href={row.candidateResume} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"><ExternalLink /> Link</a> : '-' 
        },
        { 
            key: 'meetingLink', 
            title: 'Meeting Link', 
            minWidth: '200px', 
            render: (row) => row.meetingLink ? <a href={row.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline truncate block max-w-[200px] text-xs" title={row.meetingLink}>{row.meetingLink}</a> : '-' 
        },
        { key: 'interviewDate', title: 'Date', minWidth: '110px', render: (row) => formatDate(row.interviewDate) },
        { 
            key: 'interviewTime', 
            title: 'Time', 
            minWidth: '130px', 
            render: (row) => row.interviewTime ? row.interviewTime.split('-').map(t => formatTime(t.trim())).join(' - ') : '-' 
        },
        { key: 'interviewDuration', title: 'Duration', minWidth: '100px' },
        { key: 'interviewStatus', title: 'Status', minWidth: '130px', render: (row) => <StatusBadge status={row.interviewStatus} /> },
        { 
            key: 'interviewerRemarks', 
            title: 'Remarks', 
            minWidth: '200px', 
            render: (row) => row.interviewerRemarks ?
                <Button variant="link" size="xs" onClick={() => setRemarksModal({isOpen: true, content: row.interviewerRemarks})} className="text-gray-700 text-xs hover:text-indigo-600 text-left truncate max-w-[180px] block p-0 h-auto">
                    {row.interviewerRemarks}
                </Button> :
                <span className="text-gray-300">-</span> 
        },
    ], []);

    const handleExport = () => {
        if (!evaluationData.interviews?.length) return showError("No data to export.");
        
        const dataToExport = evaluationData.interviews.map(interview => {
            let rowData = {};
            staticColumns.forEach(col => {
                let value = interview[col.key];
                if (col.key === 'interviewDate' && value) value = formatDate(value);
                else if (col.key === 'interviewerRemarks') value = interview.interviewerRemarks || '';
                rowData[col.title] = value || '';
            });

            (evaluationData.evaluationSheet?.columnGroups || []).forEach(group => {
                group.columns.forEach(col => {
                    const headerTitle = col.header ? `${group.title} - ${col.header}` : group.title;
                    const headerKey = col.header || group.title;
                    let savedValue = interview.evaluationData?.[headerKey] || '';
                    if (col.type === 'select' && showLabels) savedValue = findLabelForValue(savedValue, col.options);
                    rowData[headerTitle] = savedValue;
                });
            });
            return rowData;
        });

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Evaluations');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        saveAs(blob, `Evaluation_${selectedDomain.label}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
        showSuccess(`Export started (${showLabels ? 'Labels' : 'Values'} format).`);
    };

    // React Select Styles
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

    return (
        <div className="flex flex-col h-full bg-white overflow-hidden">
            
            {/* Top Toolbar */}
            <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0 flex flex-col md:flex-row items-center justify-between gap-4 z-40 relative">
                
                {/* Left: Domain Selector */}
                <div className="w-full md:w-72">
                    <Select
                        options={domains}
                        value={selectedDomain}
                        onChange={(val) => { setSelectedDomain(val); handleClearFilters(); }}
                        placeholder="Select Domain to View..."
                        styles={selectStyles}
                    />
                </div>

                {/* Right: Controls */}
                {selectedDomain && (
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search candidate..."
                                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
                            />
                        </div>

                        {/* Filter Dropdown */}
                        <div className="relative z-50" ref={filterMenuRef}>
                            <Button variant="outline" onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} className={`${(activeFilters.interviewDate || activeFilters.interviewStatus) ? '!border-indigo-500 !text-indigo-600 !bg-indigo-50' : ''}`}>
                                <Filter className="mr-2 h-4 w-4" />
                                Filter
                            </Button>
                            {isFilterMenuOpen && (
                                <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50">
                                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Filter Records</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Interview Date</label>
                                            <div className="relative">
                                                <DatePicker selected={tempFilters.interviewDate} onChange={(date) => setTempFilters(p => ({ ...p, interviewDate: date }))} isClearable placeholderText="Select date" className="w-full pl-3 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-gray-900" />
                                                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Status</label>
                                            <select value={tempFilters.interviewStatus} onChange={(e) => setTempFilters(p => ({ ...p, interviewStatus: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-1 focus:ring-gray-900">
                                                <option value="">All Statuses</option>
                                                {MAIN_SHEET_INTERVIEW_STATUSES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mt-5 pt-3 border-t border-gray-100 flex justify-end gap-2">
                                        <Button variant="ghost" size="sm" onClick={handleClearFilters}>Clear</Button>
                                        <Button size="sm" onClick={handleApplyFilters}>Apply</Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Button variant={showLabels ? 'default' : 'outline'} onClick={() => setShowLabels(!showLabels)} title="Toggle between Labels and Values">
                            {showLabels ? <Check className="mr-2 h-4 w-4" /> : <List className="mr-2 h-4 w-4" />}
                            {showLabels ? 'Labels' : 'Values'}
                        </Button>

                        <Button variant="outline" onClick={handleExport} disabled={loading} title="Export to Excel"><Download className="h-4 w-4" /></Button>
                        
                        <Button variant="ghost" onClick={() => { setSelectedDomain(null); handleClearFilters(); }} title="Close View"><X className="h-4 w-4" /></Button>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden relative flex flex-col">
                
                {!selectedDomain ? (
                    // Summary View
                    <div className="flex-1 overflow-auto bg-white">
                        {loading ? (
                            <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-gray-300" /></div>
                        ) : (
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 sticky top-0 z-10 shadow-md">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Domain</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Candidates</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Scheduled</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Completed</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Cancelled</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">In Progress</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Pending</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 bg-white">
                                    {summaryData.map(item => (
                                        <tr key={item.domainName} className="hover:bg-indigo-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <Button variant="ghost" onClick={() => setSelectedDomain({ value: item.domainName, label: item.domainName })} className="font-semibold text-gray-900 group-hover:text-indigo-600 flex items-center gap-2 p-0 h-auto">
                                                    {item.domainName}
                                                    <ArrowLeft className="rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </Button>
                                            </td>
                                            <td className="px-6 py-4 text-center text-gray-600 font-medium">{item.candidateCount}</td>
                                            <td className="px-6 py-4 text-center"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700">{item.scheduledCount}</span></td>
                                            <td className="px-6 py-4 text-center"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700">{item.completedCount}</span></td>
                                            <td className="px-6 py-4 text-center"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700">{item.cancelledCount}</span></td>
                                            <td className="px-6 py-4 text-center"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700">{item.inProgressCount}</span></td>
                                            <td className="px-6 py-4 text-center text-gray-400">{item.pendingCount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                ) : (
                    // Detail View (Complex Table) - Full Width/Height
                    <div className="flex-1 overflow-auto custom-scrollbar bg-white">
                        {loading ? (
                            <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-gray-300" /></div>
                        ) : evaluationData.interviews.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <List className="h-12 w-12 mb-3 opacity-20" />
                                <p>No evaluation data found.</p>
                            </div>
                        ) : (
                            <table className="min-w-full text-sm border-separate border-spacing-0">
                                <thead className="bg-gray-50 sticky top-0 z-20 shadow-md">
                                    <tr>
                                        {staticColumns.map(col => (
                                            <th 
                                                key={col.key}
                                                className={`px-4 py-3 border-b border-r border-gray-200 text-left text-xs font-semibold text-gray-600 bg-gray-50 sticky top-0 ${col.isSticky ? 'z-30' : 'z-20'}`} 
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
                                                { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
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
                                                    className={`px-4 py-2.5 border-b border-r ${color.border} text-center text-xs font-semibold ${color.text} ${color.bg} uppercase tracking-wider sticky top-0 z-20`}
                                                    data-group-idx={groupIdx}
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
                                                { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100' },
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
                                        <tr key={interview._id} className="hover:bg-gray-50/80 transition-colors group">
                                            {staticColumns.map(col => (
                                                <td 
                                                    key={`${col.key}-${interview._id}`} 
                                                    className={`px-4 py-3 border-r border-gray-100 text-xs text-gray-700 whitespace-nowrap align-middle ${col.isSticky ? 'sticky z-10 bg-white group-hover:bg-gray-50' : ''} ${col.isCustomCell ? 'p-1' : ''}`}
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
                                                        key={`${(col.header || group.title)}-${interview._id}`} 
                                                        className="px-3 py-3 border-r border-gray-100 text-xs text-gray-600 text-center whitespace-nowrap align-middle"
                                                    >
                                                        {renderCellContent(interview, col, group, evaluationData.evaluationSheet, showLabels)}
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

            <RemarksModal isOpen={remarksModal.isOpen} onClose={() => setRemarksModal({ isOpen: false, content: '' })} content={remarksModal.content} />
        </div>
    );
};

export default AdminDomainEvaluationPage;
