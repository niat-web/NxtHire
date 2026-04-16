// client/src/pages/admin/Applicants.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CheckCircle, Download, Edit, Trash2, Plus, MoreVertical, Search, ChevronLeft, ChevronRight, ChevronDown, X, ArrowLeft, Clock } from 'lucide-react';
import { deleteApplicant, exportApplicants } from '../../api/admin.api';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { APPLICATION_STATUS } from '../../utils/constants';
import { debounce } from '../../utils/helpers';
import { useAlert } from '../../hooks/useAlert';
import { useApplicants, useInvalidateAdmin } from '../../hooks/useAdminQueries';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ApplicantFormModal from './ApplicantFormModal';
import { saveAs } from 'file-saver';

// ── Inline status badge ──
const statusColors = {
    'Application Submitted': 'bg-slate-100 text-slate-700',
    'Under Review': 'bg-amber-50 text-amber-700',
    'Profile Approved': 'bg-emerald-50 text-emerald-700',
    'Profile Rejected': 'bg-red-50 text-red-700',
    'Skills Assessment Sent': 'bg-blue-50 text-blue-700',
    'Skills Assessment Completed': 'bg-blue-50 text-blue-700',
    'Guidelines Sent': 'bg-violet-50 text-violet-700',
    'Guidelines Reviewed': 'bg-violet-50 text-violet-700',
    'Guidelines Failed': 'bg-red-50 text-red-700',
    'Onboarded': 'bg-emerald-50 text-emerald-700',
};

const InlineStatusBadge = ({ status }) => (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${statusColors[status] || 'bg-slate-100 text-slate-600'}`}>
        {status}
    </span>
);

// ── Inline dropdown menu ──
const InlineDropdown = ({ options }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        if (open) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    return (
        <div className="relative" ref={ref}>
            <button onClick={() => setOpen(!open)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                <MoreVertical className="h-4 w-4" />
            </button>
            {open && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                    {options.map((opt) => (
                        <button key={opt.label} onClick={() => { opt.onClick(); setOpen(false); }}
                            className={`flex items-center gap-2.5 w-full px-4 py-2 text-sm font-medium transition-colors ${opt.isDestructive ? 'text-rose-600 hover:bg-rose-50' : 'text-slate-700 hover:bg-slate-50'}`}>
                            {opt.icon && <opt.icon className="h-4 w-4" />}
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const Applicants = () => {
    const { showSuccess, showError } = useAlert();
    const { invalidateApplicants } = useInvalidateAdmin();

    const [modalState, setModalState] = useState({ type: null, data: null });
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });
    const [historyView, setHistoryView] = useState(null); // { data: [], name: '', email: '' }

    const [pagination, setPagination] = useState({ currentPage: 1 });
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const [filters, setFilters] = useState({ search: '', status: '' });

    const queryParams = useMemo(() => ({
        page: pagination.currentPage, limit: 15,
        search: filters.search, status: filters.status,
        sortBy: sortConfig.key, sortOrder: sortConfig.direction,
    }), [pagination.currentPage, filters.search, filters.status, sortConfig.key, sortConfig.direction]);

    const { data, isLoading } = useApplicants(queryParams);
    const applicants = data?.applicants || [];
    const totalPages = data?.totalPages || 1;
    const totalItems = data?.totalDocs || 0;

    const handlePageChange = (page) => setPagination(prev => ({ ...prev, currentPage: page }));

    const debouncedFilterChange = useMemo(() => debounce((key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    }, 300), []);

    const handleSort = (key) => {
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handleDelete = async () => {
        if (!deleteDialog.id) return;
        try {
            await deleteApplicant(deleteDialog.id);
            showSuccess('Applicant deleted successfully.');
            setDeleteDialog({ isOpen: false, id: null });
            invalidateApplicants();
        } catch { showError('Failed to delete applicant.'); }
    };

    const handleExport = async () => {
        try {
            const response = await exportApplicants({ status: filters.status, search: filters.search });
            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, `applicants_${new Date().toISOString().slice(0, 10)}.xlsx`);
            showSuccess("Export started successfully.");
        } catch { showError("Failed to export data."); }
    };

    const columns = [
        { key: 'fullName', title: 'Full Name', sortable: true, minWidth: '180px' },
        { key: 'email', title: 'Email', sortable: true, minWidth: '220px' },
        { key: 'phoneNumber', title: 'Phone', minWidth: '130px' },
        { key: 'linkedinProfileUrl', title: 'LinkedIn', minWidth: '120px' },
        { key: 'interestedInJoining', title: 'Interested', minWidth: '100px' },
        { key: 'sourcingChannel', title: 'Source', sortable: true, minWidth: '120px' },
        { key: 'status', title: 'Status', sortable: true, minWidth: '180px' },
        { key: 'history', title: 'History', minWidth: '100px' },
        { key: 'createdAt', title: 'Applied On', sortable: true, minWidth: '180px' },
        { key: 'actions', title: '', minWidth: '60px' },
    ];

    const renderCell = (col, row) => {
        switch (col.key) {
            case 'fullName': return <span className="text-sm font-semibold text-slate-900">{row.fullName}</span>;
            case 'email': return <span className="text-sm text-slate-600">{row.email}</span>;
            case 'phoneNumber': return <span className="text-sm text-slate-600">{row.phoneNumber}</span>;
            case 'linkedinProfileUrl': return row.linkedinProfileUrl ? <a href={row.linkedinProfileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">View Profile</a> : <span className="text-slate-300">—</span>;
            case 'interestedInJoining': return row.interestedInJoining ? <CheckCircle className="text-emerald-500" size={16} /> : <span className="text-slate-300">—</span>;
            case 'sourcingChannel': return <span className="text-sm text-slate-600">{row.sourcingChannel}</span>;
            case 'status': return <InlineStatusBadge status={row.status} />;
            case 'history': return (
                <button onClick={() => setHistoryView({ data: row.statusHistory || [], name: row.fullName, email: row.email })}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800">View</button>
            );
            case 'createdAt': return <span className="text-xs text-slate-500 font-medium">{formatDateTime(row.createdAt)}</span>;
            case 'actions': return (
                <InlineDropdown options={[
                    { label: 'Edit', icon: Edit, onClick: () => setModalState({ type: 'edit', data: row }) },
                    { label: 'Delete', icon: Trash2, isDestructive: true, onClick: () => setDeleteDialog({ isOpen: true, id: row._id }) },
                ]} />
            );
            default: return null;
        }
    };

    // ── If history is selected, show full-page detail view ──
    if (historyView) {
        return (
            <div className="h-full flex flex-col overflow-hidden bg-white">
                {/* Top bar */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setHistoryView(null)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                            <ArrowLeft size={15} />
                        </button>
                        <div>
                            <h1 className="text-sm font-semibold text-slate-900">Status History — {historyView.name}</h1>
                            <p className="text-[11px] text-slate-400">{historyView.email}</p>
                        </div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">{historyView.data.length} entries</span>
                </div>

                {/* Table — full page */}
                <div className="flex-1 overflow-y-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <th className="sticky top-0 w-12 px-5 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] bg-slate-50 border-b border-slate-200 z-10">#</th>
                                <th className="sticky top-0 px-5 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] bg-slate-50 border-b border-slate-200 z-10">Status</th>
                                <th className="sticky top-0 px-5 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] bg-slate-50 border-b border-slate-200 z-10">Date & Time</th>
                                <th className="sticky top-0 px-5 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] bg-slate-50 border-b border-slate-200 z-10">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {historyView.data.length === 0 ? (
                                <tr><td colSpan={4} className="px-5 py-14 text-center text-[13px] text-slate-400">No status history available.</td></tr>
                            ) : (
                                historyView.data.map((item, i) => (
                                    <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="px-5 py-3 text-[13px] font-semibold text-slate-900 align-top">{i + 1}</td>
                                        <td className="px-5 py-3 align-top">
                                            <InlineStatusBadge status={item.status} />
                                        </td>
                                        <td className="px-5 py-3 text-[13px] text-slate-500 align-top flex items-center gap-1.5">
                                            <Clock size={13} className="text-slate-300 shrink-0" />
                                            {formatDateTime(item.timestamp)}
                                        </td>
                                        <td className="px-5 py-3 text-[13px] text-slate-600 align-top">
                                            {item.notes || <span className="text-slate-300">—</span>}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-white overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3 bg-white border-b border-slate-200 flex-shrink-0">
                <div className="flex items-center gap-2">
                    {/* Search — left side */}
                    <div className="relative w-56">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input type="text" defaultValue={filters.search} onChange={(e) => debouncedFilterChange('search', e.target.value)}
                            placeholder="Search..." className="w-full pl-9 pr-4 h-9 bg-slate-50 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all" />
                    </div>

                        {/* Inline status filter */}
                    {/* Status filter */}
                    <div className="relative">
                        <select value={filters.status} onChange={(e) => { setFilters(p => ({ ...p, status: e.target.value })); setPagination(p => ({ ...p, currentPage: 1 })); }}
                            className="appearance-none bg-white border border-slate-200 text-slate-700 text-[13px] rounded-lg h-9 pl-3 pr-8 cursor-pointer hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors">
                            <option value="">All Statuses</option>
                            {Object.values(APPLICATION_STATUS).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Right side actions */}
                    <button onClick={handleExport} className="h-9 w-9 rounded-md flex items-center justify-center border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shrink-0" title="Export">
                        <Download size={16} />
                    </button>
                    <button onClick={() => setModalState({ type: 'add', data: null })}
                        className="inline-flex items-center gap-2 px-4 h-9 text-[13px] font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shrink-0">
                        <Plus size={16} /> Add
                    </button>
                </div>
            </div>

            {/* Inline table */}
            <div className="overflow-auto flex-1">
                <table className="min-w-full">
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th key={col.key} scope="col"
                                    className={`sticky top-0 px-5 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em] whitespace-nowrap border-b border-slate-200 bg-slate-50/90 backdrop-blur-sm z-10 ${col.sortable ? 'cursor-pointer hover:text-slate-900' : ''}`}
                                    style={{ minWidth: col.minWidth }}
                                    onClick={() => col.sortable && handleSort(col.key)}>
                                    <div className="flex items-center gap-1.5">
                                        {col.title}
                                        {col.sortable && (
                                            <span className="text-[10px]">
                                                {sortConfig.key === col.key ? (sortConfig.direction === 'asc' ? '▲' : '▼') : <span className="text-slate-300">⇅</span>}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {isLoading ? (
                            [...Array(8)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    {columns.map((col) => (
                                        <td key={col.key} className="px-5 py-3"><div className="h-4 w-full bg-slate-100 rounded" /></td>
                                    ))}
                                </tr>
                            ))
                        ) : applicants.length === 0 ? (
                            <tr><td colSpan={columns.length} className="px-6 py-14 text-center text-sm text-slate-400">No applicants found.</td></tr>
                        ) : (
                            applicants.map((row) => (
                                <tr key={row._id} className="hover:bg-slate-50/70 transition-colors">
                                    {columns.map((col) => (
                                        <td key={col.key} className="px-5 py-3 whitespace-nowrap text-sm text-slate-700 align-middle">
                                            {renderCell(col, row)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalItems > 15 && (
                <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-3 flex-shrink-0">
                    <p className="text-xs text-slate-500 font-medium">
                        Page <span className="font-bold text-slate-900">{pagination.currentPage}</span> of <span className="font-bold text-slate-900">{totalPages}</span>
                    </p>
                    <div className="flex items-center gap-1.5">
                        <button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage <= 1}
                            className="h-9 w-9 rounded-md flex items-center justify-center border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage >= totalPages}
                            className="h-9 w-9 rounded-md flex items-center justify-center border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Modals */}
            {modalState.type && (
                <ApplicantFormModal isOpen={!!modalState.type} onClose={() => setModalState({ type: null, data: null })} onSuccess={() => { setModalState({ type: null, data: null }); invalidateApplicants(); }} applicantData={modalState.data} />
            )}
            <ConfirmDialog isOpen={deleteDialog.isOpen} onClose={() => setDeleteDialog({ isOpen: false, id: null })} onConfirm={handleDelete} title="Delete Applicant" message="Are you sure you want to delete this applicant? This action cannot be undone." />

        </div>
    );
};

export default Applicants;
