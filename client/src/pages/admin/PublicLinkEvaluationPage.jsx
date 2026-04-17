// client/src/pages/admin/PublicLinkEvaluationPage.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { ArrowLeft, Download, ExternalLink, Search, ChevronDown } from 'lucide-react';
import { useEvaluationByPublicBooking } from '@/hooks/useAdminQueries';
import { useAlert } from '@/hooks/useAlert';
import { formatDate, formatTime } from '@/utils/formatters';
import Loader from '@/components/common/Loader';
import { cn } from '@/lib/utils';

const StatusBadge = ({ status }) => {
    const styles = {
        Completed: 'bg-emerald-50 text-emerald-700', Scheduled: 'bg-amber-50 text-amber-700',
        InProgress: 'bg-blue-50 text-blue-700', Cancelled: 'bg-red-50 text-red-700',
    };
    return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${styles[status] || 'bg-slate-100 text-slate-600'}`}>{status || '—'}</span>;
};

const PublicLinkEvaluationPage = () => {
    const { id } = useParams();
    const { showError, showSuccess } = useAlert();
    const [selectedDomain, setSelectedDomain] = useState('');
    const [search, setSearch] = useState('');

    // Single API call — returns domains + evaluation data, filtered by student emails
    const queryParams = useMemo(() => {
        const p = {};
        if (selectedDomain) p.domain = selectedDomain;
        if (search) p.search = search;
        return p;
    }, [selectedDomain, search]);

    const { data, isLoading } = useEvaluationByPublicBooking(id, queryParams);

    const domains = data?.domains || [];
    const interviews = data?.interviews || [];
    const evalSheet = data?.evaluationSheet;

    // Auto-select first domain
    useEffect(() => {
        if (domains.length > 0 && !selectedDomain) {
            setSelectedDomain(domains[0]);
        }
    }, [domains, selectedDomain]);

    // Static columns
    const staticColumns = useMemo(() => [
        { key: 'candidateName', title: 'Candidate', minWidth: '180px', isSticky: true },
        { key: 'uid', title: 'UID', minWidth: '160px' },
        { key: 'mobileNumber', title: 'Mobile', minWidth: '120px' },
        { key: 'mailId', title: 'Email', minWidth: '200px' },
        { key: 'candidateResume', title: 'Resume', minWidth: '80px', render: (row) => row.candidateResume ? <a href={row.candidateResume} target="_blank" rel="noopener noreferrer" className="text-[11px] font-medium text-blue-600 hover:text-blue-800 inline-flex items-center gap-0.5"><ExternalLink size={10} /> Link</a> : '—' },
        { key: 'interviewDate', title: 'Date', minWidth: '100px', render: (row) => row.interviewDate ? formatDate(row.interviewDate) : '—' },
        { key: 'interviewTime', title: 'Time', minWidth: '120px', render: (row) => row.interviewTime ? row.interviewTime.split('-').map(t => formatTime(t.trim())).join(' - ') : '—' },
        { key: 'interviewStatus', title: 'Status', minWidth: '110px', render: (row) => <StatusBadge status={row.interviewStatus} /> },
        { key: 'interviewerRemarks', title: 'Remarks', minWidth: '180px', render: (row) => row.interviewerRemarks ? <span className="text-[11px] text-slate-600 truncate block max-w-[160px]" title={row.interviewerRemarks}>{row.interviewerRemarks}</span> : '—' },
    ], []);

    // Dynamic columns from evaluation sheet
    const dynamicColumns = useMemo(() => {
        if (!evalSheet?.columnGroups) return [];
        const cols = [];
        evalSheet.columnGroups.forEach(group => {
            group.columns.forEach(col => {
                cols.push({
                    key: `eval_${group.title}_${col.header || ''}`,
                    title: col.header ? `${group.title} - ${col.header}` : group.title,
                    headerKey: col.header || group.title,
                    minWidth: '100px',
                });
            });
        });
        return cols;
    }, [evalSheet]);

    const allColumns = [...staticColumns, ...dynamicColumns];

    // Export
    const handleExport = () => {
        if (!interviews.length) return showError('No data to export.');
        const rows = interviews.map(iv => {
            const row = {};
            staticColumns.forEach(col => {
                let val = iv[col.key];
                if (col.key === 'interviewDate' && val) val = formatDate(val);
                row[col.title] = val || '';
            });
            dynamicColumns.forEach(col => {
                row[col.title] = iv.evaluationData?.[col.headerKey] || '';
            });
            return row;
        });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Evaluations');
        const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([buf]), `PublicLink_${selectedDomain}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
        showSuccess('Exported!');
    };

    if (isLoading && !data) return <div className="flex items-center justify-center h-full"><Loader size="lg" /></div>;

    if (domains.length === 0 && !isLoading) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <p className="text-sm font-medium text-slate-500">No evaluation data found for this public link</p>
                <p className="text-[11px] text-slate-400 mt-1">No matching candidates found in the main sheet</p>
                <Link to="/admin/bookings/student-bookings" className="mt-4 inline-flex items-center gap-2 h-9 px-4 text-[13px] font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
                    <ArrowLeft size={14} /> Back to Public Links
                </Link>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-white overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-2.5 border-b border-slate-200 shrink-0">
                <div className="flex items-center gap-3">
                    <Link to="/admin/bookings/student-bookings"
                        className="w-8 h-8 rounded-md flex items-center justify-center border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
                        <ArrowLeft size={15} />
                    </Link>
                    <h1 className="text-sm font-semibold text-slate-900">Public Link Evaluation</h1>
                </div>

                <div className="flex items-center gap-2">
                    {/* Domain dropdown */}
                    {domains.length > 0 && (
                        <div className="relative">
                            <select value={selectedDomain} onChange={e => setSelectedDomain(e.target.value)}
                                className="appearance-none h-9 pl-3 pr-8 bg-white border border-slate-200 rounded-md text-[13px] font-medium text-slate-700 cursor-pointer hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors">
                                {domains.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                        </div>
                    )}

                    {/* Search */}
                    <div className="relative w-48">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                            className="w-full pl-9 pr-3 h-9 bg-slate-50 border border-slate-200 rounded-md text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all" />
                    </div>

                    {/* Export */}
                    <button onClick={handleExport} disabled={!interviews.length}
                        className="inline-flex items-center gap-1.5 h-9 px-3 text-[12px] font-medium text-slate-700 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors">
                        <Download size={13} /> Export
                    </button>
                </div>
            </div>

            {/* Stats bar */}
            <div className="flex items-center gap-4 px-5 py-2 border-b border-slate-100 shrink-0 text-[11px]">
                <span className="text-slate-400">Domain: <span className="font-bold text-slate-900">{selectedDomain || '—'}</span></span>
                <span className="text-slate-400">Candidates: <span className="font-bold text-slate-900">{interviews.length}</span></span>
                <span className="text-slate-400">Completed: <span className="font-bold text-emerald-600">{interviews.filter(i => i.interviewStatus === 'Completed').length}</span></span>
                <span className="text-slate-400">Pending: <span className="font-bold text-amber-600">{interviews.filter(i => !i.interviewStatus || i.interviewStatus === 'Scheduled').length}</span></span>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64"><Loader size="lg" /></div>
                ) : interviews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                        <p className="text-sm font-medium text-slate-500">No evaluation data</p>
                        <p className="text-[11px] mt-0.5">No candidates from this public link found in {selectedDomain}</p>
                    </div>
                ) : (() => {
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
                    const columnGroups = evalSheet?.columnGroups || [];
                    const hasEvalColumns = columnGroups.length > 0;

                    return (
                        <table className="min-w-full">
                            <thead>
                                {/* Row 1: static column headers + group titles */}
                                <tr>
                                    {staticColumns.map(col => (
                                        <th key={col.key}
                                            className={cn(
                                                'sticky top-0 px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] border-b border-slate-200 bg-slate-50 whitespace-nowrap',
                                                col.isSticky ? 'z-30 bg-slate-50' : 'z-10'
                                            )}
                                            style={{ minWidth: col.minWidth, ...(col.isSticky ? { position: 'sticky', left: 0 } : {}) }}
                                            rowSpan={hasEvalColumns ? 2 : 1}>
                                            {col.title}
                                        </th>
                                    ))}
                                    {columnGroups.map((group, gIdx) => {
                                        const hasSubHeaders = group.columns.some(c => c.header && c.header.trim());
                                        const color = groupColors[gIdx % groupColors.length];
                                        return (
                                            <th key={group.title} colSpan={group.columns.length || 1} rowSpan={hasSubHeaders ? 1 : 2}
                                                className={`px-4 py-2.5 border-b border-r ${color.border} text-center text-xs font-semibold ${color.text} ${color.bg} uppercase tracking-wider sticky top-0 z-20`}>
                                                {group.title}
                                            </th>
                                        );
                                    })}
                                </tr>
                                {/* Row 2: sub-headers for groups that have them */}
                                {hasEvalColumns && (
                                    <tr>
                                        {columnGroups.flatMap((group, gIdx) => {
                                            const hasSubHeaders = group.columns.some(c => c.header && c.header.trim());
                                            if (!hasSubHeaders) return null;
                                            const color = subColors[gIdx % subColors.length];
                                            return group.columns.map((col, cIdx) => (
                                                <th key={`${group.title}-${col.header || cIdx}`}
                                                    className={`px-3 py-2 border-b border-r ${color.border} text-center text-[10px] font-semibold ${color.text} ${color.bg} whitespace-nowrap sticky top-[37px] z-20`}>
                                                    {col.header || '—'}
                                                </th>
                                            ));
                                        })}
                                    </tr>
                                )}
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {interviews.map((iv, i) => (
                                    <tr key={iv._id || i} className="hover:bg-slate-50/60 transition-colors">
                                        {staticColumns.map(col => (
                                            <td key={col.key}
                                                className={cn('px-4 py-2.5 text-[12px] text-slate-700 whitespace-nowrap align-middle', col.isSticky && 'sticky bg-white z-[5]')}
                                                style={col.isSticky ? { left: 0 } : {}}>
                                                {col.render ? col.render(iv) : (iv[col.key] || '—')}
                                            </td>
                                        ))}
                                        {columnGroups.flatMap(group =>
                                            group.columns.map((col, cIdx) => {
                                                const headerKey = col.header || group.title;
                                                return (
                                                    <td key={`${group.title}-${col.header || cIdx}`}
                                                        className="px-3 py-2.5 text-[12px] text-slate-700 whitespace-nowrap align-middle text-center">
                                                        {iv.evaluationData?.[headerKey] || '—'}
                                                    </td>
                                                );
                                            })
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    );
                })()}
            </div>
        </div>
    );
};

export default PublicLinkEvaluationPage;
