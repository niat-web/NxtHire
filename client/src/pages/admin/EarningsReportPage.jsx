// client/src/pages/admin/EarningsReportPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
    ArrowLeft, DollarSign, Search, BarChart2, Download,
    Loader2, ChevronDown, X, Inbox, Calendar,
    ChevronLeft, ChevronRight, FileText, Edit2, AlertTriangle
} from 'lucide-react';
import { sendPaymentEmail, sendInvoiceEmail, sendPaymentReceivedEmail, updateInterviewer, saveBonusAmount } from '../../api/admin.api';
import { usePayoutSheet, usePaymentRequests, useYearlyEarnings, useMonthlyEarnings, useInvalidateAdmin } from '../../hooks/useAdminQueries';
import { useAlert } from '../../hooks/useAlert';
import { format as formatDateFns, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import Badge from '../../components/common/Badge';
import { Button } from '@/components/ui/button';

// ─── REUSABLE UI ────────────────────────────────────────────────────────────

const Btn = ({ children, onClick, loading = false, variant = 'primary', icon: Icon, className = '', disabled = false }) => {
    const v = {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
        outline: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50',
        ghost: 'text-gray-500 hover:bg-gray-100 hover:text-gray-900',
        yellow: 'bg-amber-400 text-gray-900 hover:bg-amber-500',
        danger: 'text-red-600 border border-red-200 hover:bg-red-50',
    };
    return (
        <button onClick={onClick} disabled={loading || disabled}
            className={`inline-flex items-center justify-center text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors disabled:opacity-40 ${v[variant]} ${className}`}>
            {loading ? <Loader2 className="animate-spin h-3.5 w-3.5 mr-1.5" /> : Icon && <Icon className={`h-3.5 w-3.5 ${children ? 'mr-1.5' : ''}`} />}
            {loading ? 'Wait...' : children}
        </button>
    );
};

const EditableIDCell = ({ row, onSave }) => {
    const [val, setVal] = useState(row.interviewer?.interviewerId || '');
    const [saving, setSaving] = useState(false);
    const { showError } = useAlert();
    const save = async () => {
        if (val.trim() === (row.interviewer?.interviewerId || '').trim()) return;
        setSaving(true);
        try { await onSave(row.interviewer._id, val.trim()); } catch { setVal(row.interviewer?.interviewerId || ''); showError('Failed'); } finally { setSaving(false); }
    };
    return (
        <input type="text" value={val} onChange={e => setVal(e.target.value)} onBlur={save} disabled={saving}
            className="w-full bg-transparent border border-transparent hover:border-gray-200 focus:bg-white focus:border-slate-400 rounded px-2 py-1 text-xs font-mono transition-all" />
    );
};

const BonusCell = ({ value, onChange, onSave, loading }) => (
    <div className="relative w-20">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
        <input type="number" value={value || ''} onChange={onChange} onBlur={onSave} disabled={loading} placeholder="0"
            className="w-full pl-5 pr-1 py-1 text-xs border border-gray-200 rounded bg-white focus:ring-1 focus:ring-slate-400 focus:border-slate-400 text-right" />
    </div>
);

// ─── PAYMENT REQUESTS VIEW ──────────────────────────────────────────────────

const PaymentRequestsView = () => {
    const { showError, showSuccess } = useAlert();
    const [dateRange, setDateRange] = useState([startOfMonth(new Date()), endOfMonth(new Date())]);
    const [startDate, endDate] = dateRange;
    const [remarksModal, setRemarksModal] = useState({ isOpen: false, content: '' });
    const [page, setPage] = useState(1);
    const [bonusAmounts, setBonusAmounts] = useState({});
    const [actionLoading, setActionLoading] = useState({});
    const { invalidatePayments } = useInvalidateAdmin();
    const limit = 20;

    const params = useMemo(() => ({ startDate: startDate?.toISOString(), endDate: endDate?.toISOString(), page, limit }), [startDate, endDate, page]);
    const { data: result, isLoading: loading, error } = usePaymentRequests(params);
    const rows = result?.requests || [];
    const totalPages = result?.totalPages || 1;
    const totalItems = result?.totalDocs || 0;

    useEffect(() => { if (rows.length) setBonusAmounts(rows.reduce((a, r) => ({ ...a, [r._id]: r.bonusAmount || 0 }), {})); }, [rows]);
    useEffect(() => { setPage(1); }, [startDate, endDate]);

    const action = async (id, type, fn, payload, msg) => {
        setActionLoading(p => ({ ...p, [`${id}-${type}`]: true }));
        try { await fn(payload); showSuccess(msg); invalidatePayments(); } catch (e) { showError(e.response?.data?.message || 'Failed'); }
        finally { setActionLoading(p => ({ ...p, [`${id}-${type}`]: false })); }
    };

    const saveBonus = (r) => {
        const bonus = Number(bonusAmounts[r._id] || 0);
        action(r._id, 'bonus', saveBonusAmount, { interviewerId: r._id, startDate: startDate.toISOString(), endDate: endDate.toISOString(), monthYear: startDate.toLocaleString('default', { month: 'long', year: 'numeric' }), totalAmount: r.totalAmount, interviewCount: r.interviewsCompleted, bonusAmount: bonus }, 'Bonus saved!');
    };

    const cols = useMemo(() => [
        { k: 'month', t: 'Month', w: 80, r: () => <span className="font-semibold text-gray-800 text-xs">{startDate ? formatDateFns(startDate, 'MMM') : '-'}</span> },
        { k: 'name', t: 'Interviewer', w: 180, sticky: true, r: (r) => <div><p className="font-semibold text-gray-900 text-xs">{r.fullName}</p><p className="text-xs text-gray-400 font-mono">{r.interviewerId}</p></div> },
        { k: 'mobile', t: 'Mobile', w: 110, r: (r) => <span className="text-gray-600 text-xs">{r.mobileNumber}</span> },
        { k: 'company', t: 'Company', w: 120, r: (r) => <span className="text-gray-500 text-xs">{r.companyType}</span> },
        { k: 'base', t: 'Base Pay', w: 90, r: (r) => <span className="text-xs">{formatCurrency(r.paymentAmount)}</span> },
        { k: 'count', t: 'Count', w: 60, r: (r) => <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-xs font-semibold">{r.interviewsCompleted}</span> },
        { k: 'bonus', t: 'Bonus', w: 100, r: (r) => <BonusCell value={bonusAmounts[r._id]} onChange={e => setBonusAmounts(p => ({ ...p, [r._id]: e.target.value }))} onSave={() => saveBonus(r)} loading={actionLoading[`${r._id}-bonus`]} /> },
        { k: 'total', t: 'Total', w: 100, r: (r) => <span className="font-semibold text-green-700 text-xs">{formatCurrency(r.totalAmount + Number(bonusAmounts[r._id] || 0))}</span> },
        { k: 'payStatus', t: 'Pay Status', w: 110, r: (r) => <Badge variant={r.emailSentStatus === 'Sent' ? 'success' : 'gray'}>{r.emailSentStatus}</Badge> },
        { k: 'payAction', t: 'Pay Action', w: 90, r: (r) => <Btn onClick={() => action(r._id, 'email', sendPaymentEmail, { interviewerId: r._id, email: r.email, name: r.fullName, monthYear: startDate.toLocaleString('default', { month: 'long', year: 'numeric' }), payPerInterview: r.paymentAmount, interviewCount: r.interviewsCompleted, totalAmount: r.totalAmount, bonusAmount: Number(bonusAmounts[r._id]||0), startDate: startDate.toISOString(), endDate: endDate.toISOString() }, 'Sent!')} loading={actionLoading[`${r._id}-email`]}>{r.emailSentStatus === 'Sent' ? 'Resend' : 'Send'}</Btn> },
        { k: 'userConf', t: 'User Conf.', w: 110, r: (r) => <Badge variant={r.confirmationStatus === 'Confirmed' ? 'success' : r.confirmationStatus === 'Disputed' ? 'danger' : 'warning'}>{r.confirmationStatus}</Badge> },
        { k: 'confRem', t: 'Remarks', w: 90, r: (r) => r.confirmationRemarks ? <Button variant="link" size="xs" onClick={() => setRemarksModal({ isOpen: true, content: r.confirmationRemarks })}>View</Button> : <span className="text-gray-300 text-xs">-</span> },
        { k: 'invReq', t: 'Invoice', w: 100, r: (r) => <Badge variant={r.invoiceEmailSentStatus === 'Sent' ? 'success' : 'gray'}>{r.invoiceEmailSentStatus}</Badge> },
        { k: 'invAction', t: 'Inv. Action', w: 80, r: (r) => <Btn variant="yellow" onClick={() => action(r._id, 'invoice', sendInvoiceEmail, { interviewerId: r._id, email: r.email, name: r.fullName, interviewCount: r.interviewsCompleted, interviewAmount: r.totalAmount, bonusAmount: Number(bonusAmounts[r._id]||0), startDate: startDate.toISOString(), endDate: endDate.toISOString() }, 'Sent!')} loading={actionLoading[`${r._id}-invoice`]}>Send</Btn> },
        { k: 'paidConf', t: 'Paid', w: 90, r: (r) => <Badge variant={r.paymentReceivedEmailSentAt ? 'success' : 'gray'}>{r.paymentReceivedEmailSentAt ? 'Sent' : 'No'}</Badge> },
        { k: 'paidAction', t: 'Paid Action', w: 80, r: (r) => <Btn variant="outline" onClick={() => action(r._id, 'paid', sendPaymentReceivedEmail, { interviewerId: r._id, email: r.email, name: r.fullName, startDate: startDate.toISOString(), endDate: endDate.toISOString(), totalAmount: r.totalAmount + Number(bonusAmounts[r._id]||0), interviewCount: r.interviewsCompleted }, 'Sent!')} loading={actionLoading[`${r._id}-paid`]}>Send</Btn> },
        { k: 'recStatus', t: 'Received', w: 100, r: (r) => <Badge variant={r.paymentReceivedStatus === 'Received' ? 'success' : 'warning'}>{r.paymentReceivedStatus}</Badge> },
        { k: 'recRem', t: 'Rec. Remarks', w: 90, r: (r) => r.paymentReceivedRemarks ? <Button variant="link" size="xs" onClick={() => setRemarksModal({ isOpen: true, content: r.paymentReceivedRemarks })}>View</Button> : <span className="text-gray-300 text-xs">-</span> },
    ], [bonusAmounts, actionLoading, startDate, endDate]);

    return (
        <>
            {/* Toolbar */}
            <div className="px-4 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 bg-white shrink-0">
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 bg-white relative z-30">
                    <Calendar className="text-gray-400" size={14} />
                    <DatePicker selectsRange startDate={startDate} endDate={endDate} onChange={setDateRange} className="text-sm font-medium focus:outline-none w-48" placeholderText="Select Range" />
                </div>
                <div className="flex gap-1.5">
                    {['This Month', 'Last Month'].map(l => (
                        <Button key={l} variant="outline" size="sm" onClick={() => { const n = new Date(); setDateRange(l === 'This Month' ? [startOfMonth(n), endOfMonth(n)] : [startOfMonth(subMonths(n,1)), endOfMonth(subMonths(n,1))]); }}>{l}</Button>
                    ))}
                </div>
            </div>
            {/* Table */}
            <DataTable cols={cols} rows={rows} loading={loading} error={error ? 'Failed to load.' : null} empty="No requests found." page={page} totalPages={totalPages} totalItems={totalItems} onPage={setPage} />
            {remarksModal.isOpen && <Modal title="Remarks" onClose={() => setRemarksModal({ isOpen: false, content: '' })}><p className="text-sm text-gray-700 whitespace-pre-wrap">{remarksModal.content}</p></Modal>}
        </>
    );
};

// ─── PAYOUT SHEET VIEW ──────────────────────────────────────────────────────

const PayoutSheetView = () => {
    const { showError, showSuccess } = useAlert();
    const [search, setSearch] = useState('');
    const [debSearch, setDebSearch] = useState('');
    const [date, setDate] = useState(new Date());
    const [page, setPage] = useState(1);
    const limit = 20;
    const { invalidatePayments } = useInvalidateAdmin();

    useEffect(() => { const t = setTimeout(() => { setDebSearch(search); setPage(1); }, 300); return () => clearTimeout(t); }, [search]);
    useEffect(() => { setPage(1); }, [date]);

    const params = useMemo(() => ({ search: debSearch, startDate: startOfMonth(date).toISOString(), endDate: endOfMonth(date).toISOString(), page, limit }), [debSearch, date, page]);
    const { data: result, isLoading: loading, error } = usePayoutSheet(params);
    const rows = result?.payoutSheet || [];
    const totalPages = result?.totalPages || 1;
    const totalItems = result?.totalDocs || 0;

    const handleIdSave = useCallback(async (id, newId) => { await updateInterviewer(id, { interviewerId: newId }); invalidatePayments(); showSuccess('Updated'); }, [invalidatePayments, showSuccess]);

    const handleExport = () => {
        if (!rows.length) return showError('No data');
        const ws = XLSX.utils.json_to_sheet(rows.map(r => ({ 'User ID': r.interviewer?.interviewerId, Activity: r.activityName, Points: r.points, Date: formatDateTime(r.activityDatetime) })));
        const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Payout');
        saveAs(new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })]), `Payout_${formatDateFns(date, 'MMM-yyyy')}.xlsx`);
    };

    const cols = useMemo(() => [
        { k: 'id', t: 'Interviewer ID', w: 260, sticky: true, r: (r) => <EditableIDCell row={r} onSave={handleIdSave} /> },
        { k: 'assoc', t: 'Association', w: 160, r: (r) => <span className="font-medium text-gray-800 text-xs">{r.associationName}</span> },
        { k: 'act', t: 'Activity', w: 130, r: (r) => <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs font-semibold">{r.activityName}</span> },
        { k: 'ref', t: 'Ref ID', w: 140, r: (r) => <span className="font-mono text-xs text-gray-500">{r.activityReferenceId}</span> },
        { k: 'date', t: 'Date', w: 150, r: (r) => <span className="text-gray-600 text-xs">{formatDateTime(r.activityDatetime)}</span> },
        { k: 'pts', t: 'Points', w: 80, r: (r) => <span className="font-semibold text-green-600 text-xs">+{r.points}</span> },
    ], [handleIdSave]);

    return (
        <>
            <div className="px-4 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 bg-white shrink-0">
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ID..."
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400" />
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative z-50">
                        <DatePicker selected={date} onChange={setDate} dateFormat="MMM yyyy" showMonthYearPicker className="w-28 pl-3 pr-7 py-2 border border-gray-200 rounded-lg text-sm font-medium cursor-pointer focus:outline-none" />
                        <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                    </div>
                    <Btn variant="outline" icon={Download} onClick={handleExport} disabled={!rows.length} />
                </div>
            </div>
            <DataTable cols={cols} rows={rows} loading={loading} error={error ? 'Failed to load.' : null} empty="No payout data." page={page} totalPages={totalPages} totalItems={totalItems} onPage={setPage} />
        </>
    );
};

// ─── REPORTS VIEW ───────────────────────────────────────────────────────────

const ReportsView = () => {
    const [view, setView] = useState('yearly');
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(null);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    const { data: yData = [], isLoading: yLoad, error: yErr } = useYearlyEarnings(year, { enabled: view === 'yearly' });
    const { data: mData = [], isLoading: mLoad, error: mErr } = useMonthlyEarnings(year, month?.num, { enabled: view === 'monthly' && !!month });

    const data = view === 'yearly' ? yData : mData;
    const loading = view === 'yearly' ? yLoad : mLoad;
    const err = (view === 'yearly' ? yErr : mErr) ? 'Failed to load.' : null;

    const yCols = useMemo(() => [
        { k: 'month', t: 'Month', w: 120, r: (r) => <span className="font-semibold text-gray-900 text-sm">{months[r.month - 1]}</span> },
        { k: 'total', t: 'Total Payout', w: 140, r: (r) => <span className="font-mono text-green-700 font-semibold text-sm">{formatCurrency(r.totalAmount)}</span> },
        { k: 'interviewers', t: 'Interviewers', w: 120, r: (r) => <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-semibold">{r.totalInterviewers}</span> },
        { k: 'conf', t: 'Confirmations', w: 200, r: (r) => <span className="text-xs text-gray-600">{r.receivedCount} Received / {r.pendingCount} Pending</span> },
    ], []);

    const mCols = useMemo(() => [
        { k: 'name', t: 'Name', w: 200, r: (r) => <span className="font-medium text-gray-900 text-sm">{r.interviewerName}</span> },
        { k: 'id', t: 'ID', w: 150, r: (r) => <span className="text-xs font-mono text-gray-500">{r.interviewerId}</span> },
        { k: 'amt', t: 'Amount', w: 140, r: (r) => <span className="font-semibold text-green-600 text-sm">{formatCurrency(r.monthPayment)}</span> },
        { k: 'status', t: 'Status', w: 140, r: (r) => <Badge variant={r.confirmationStatus === 'Received' ? 'success' : 'warning'}>{r.confirmationStatus}</Badge> },
    ], []);

    return (
        <>
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-3">
                    {view === 'monthly' && <Btn variant="ghost" icon={ArrowLeft} onClick={() => setView('yearly')} />}
                    <h2 className="text-base font-semibold text-gray-900">{view === 'yearly' ? `Earnings ${year}` : `${month?.name} ${year}`}</h2>
                </div>
                <select value={year} onChange={e => setYear(+e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium cursor-pointer focus:outline-none">
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>
            <DataTable cols={view === 'yearly' ? yCols : mCols} rows={data} loading={loading} error={err} empty="No reports."
                onRowClick={view === 'yearly' ? (r) => { setMonth({ num: r.month, name: months[r.month-1] }); setView('monthly'); } : undefined} />
        </>
    );
};

// ─── SHARED TABLE (self-contained, no external deps) ────────────────────────

const DataTable = ({ cols, rows, loading, error, empty, page, totalPages, totalItems, onPage, onRowClick }) => {
    if (loading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-6 h-6 text-gray-300 animate-spin" /></div>;
    if (error) return <div className="flex-1 flex flex-col items-center justify-center text-center"><AlertTriangle className="w-8 h-8 text-red-300 mb-2" /><p className="text-sm text-gray-500">{error}</p></div>;
    if (!rows.length) return <div className="flex-1 flex flex-col items-center justify-center text-center"><Inbox className="w-8 h-8 text-gray-300 mb-2" /><p className="text-base font-semibold text-gray-700">No Data Found</p><p className="text-xs text-gray-400 mt-1">{empty}</p></div>;

    return (
        <>
            <div className="flex-1 overflow-auto min-h-0">
                <table className="w-full min-w-max border-collapse">
                    <thead className="sticky top-0 z-10">
                        <tr>
                            {cols.map(c => (
                                <th key={c.k} style={{ minWidth: c.w, ...(c.sticky ? { position: 'sticky', left: 0, zIndex: 20, boxShadow: '2px 0 4px -2px rgba(0,0,0,0.08)' } : {}) }}
                                    className={`px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 bg-gray-50 whitespace-nowrap`}>
                                    {c.t}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr key={row._id || i} onClick={() => onRowClick?.(row)}
                                className={`border-b border-gray-100 hover:bg-gray-50/80 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}>
                                {cols.map(c => (
                                    <td key={c.k} style={c.sticky ? { position: 'sticky', left: 0, zIndex: 5, boxShadow: '2px 0 4px -2px rgba(0,0,0,0.04)' } : {}}
                                        className={`px-3 py-2.5 text-sm whitespace-nowrap align-middle ${c.sticky ? 'bg-white' : ''}`}>
                                        {c.r(row)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {onPage && totalItems > 0 && (
                <div className="px-4 py-2.5 border-t border-gray-200 bg-white flex items-center justify-between shrink-0">
                    <span className="text-xs text-gray-500">{totalItems} records</span>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => onPage(page - 1)} disabled={page <= 1} className="h-7 w-7"><ChevronLeft size={14} /></Button>
                        <span className="text-xs font-medium text-gray-600 px-2">{page} / {totalPages}</span>
                        <Button variant="ghost" size="icon" onClick={() => onPage(page + 1)} disabled={page >= totalPages} className="h-7 w-7"><ChevronRight size={14} /></Button>
                    </div>
                </div>
            )}
        </>
    );
};

const Modal = ({ title, onClose, children }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
        <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 text-gray-400"><X size={16} /></Button>
            </div>
            <div className="p-5 max-h-[60vh] overflow-y-auto">{children}</div>
        </div>
    </div>
);

// ─── MAIN PAGE ──────────────────────────────────────────────────────────────

const EarningsReportPage = () => {
    const [tab, setTab] = useState('payments');
    const tabs = [
        { id: 'payments', label: 'Payment Requests', icon: DollarSign },
        { id: 'payout', label: 'Payout Sheet', icon: BarChart2 },
        { id: 'reports', label: 'Reports', icon: FileText },
    ];

    return (
        <div className="h-full w-full flex overflow-hidden">
            {/* Sidebar */}
            <div style={{ width: 210, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid #e5e7eb', background: '#fff' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
                    <p className="text-sm font-semibold text-gray-900">Earnings Report</p>
                    <p className="text-xs text-gray-400 mt-0.5">Payments & Reports</p>
                </div>
                <nav style={{ flex: 1, padding: 8 }}>
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', borderRadius: 8, marginBottom: 2, fontSize: 13, fontWeight: 500, transition: 'all 0.15s',
                                background: tab === t.id ? '#4f46e5' : 'transparent', color: tab === t.id ? '#fff' : '#6b7280' }}
                            onMouseEnter={e => { if (tab !== t.id) e.currentTarget.style.background = '#f3f4f6'; }}
                            onMouseLeave={e => { if (tab !== t.id) e.currentTarget.style.background = 'transparent'; }}>
                            <t.icon size={15} /> {t.label}
                        </button>
                    ))}
                </nav>
            </div>
            {/* Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0, background: '#fff' }}>
                {tab === 'payments' && <PaymentRequestsView />}
                {tab === 'payout' && <PayoutSheetView />}
                {tab === 'reports' && <ReportsView />}
            </div>
        </div>
    );
};

export default EarningsReportPage;
