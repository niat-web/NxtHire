// client/src/pages/admin/EarningsReportPage.jsx
import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
    ArrowLeft, DollarSign, Search, BarChart2, Download,
    Loader2, ChevronDown, X, Inbox, Calendar,
    ChevronLeft, ChevronRight, FileText, AlertTriangle,
    IndianRupee, Users, TrendingUp
} from 'lucide-react';
import { sendPaymentEmail, sendInvoiceEmail, sendPaymentReceivedEmail, updateInterviewer, saveBonusAmount } from '../../api/admin.api';
import { usePayoutSheet, usePaymentRequests, useYearlyEarnings, useMonthlyEarnings, useInvalidateAdmin } from '../../hooks/useAdminQueries';
import { useAlert } from '../../hooks/useAlert';
import { format as formatDateFns, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { cn } from '@/lib/utils';
import Loader from '@/components/common/Loader';

const badgeColorMap = {
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
    gray: 'bg-slate-100 text-slate-600',
};
const Badge = ({ children, variant = 'gray' }) => {
    const colorClass = badgeColorMap[variant] || badgeColorMap.gray;
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${colorClass}`}>
            {children}
        </span>
    );
};

const Btn = ({ children, onClick, loading = false, variant = 'primary', icon: Icon, className = '', disabled = false }) => {
    const v = {
        primary: 'bg-slate-900 text-white hover:bg-slate-800',
        outline: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
        ghost: 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
        yellow: 'bg-amber-400 text-slate-900 hover:bg-amber-500',
        danger: 'text-rose-600 border border-rose-200 hover:bg-rose-50',
    };
    return (
        <button onClick={onClick} disabled={loading || disabled}
            className={`inline-flex items-center justify-center text-xs font-medium rounded-md px-3 h-7 transition-colors disabled:opacity-40 ${v[variant]} ${className}`}>
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
            className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:bg-white focus:border-slate-400 rounded-lg px-2.5 py-1.5 text-xs font-mono transition-all focus:outline-none focus:ring-1 focus:ring-inset focus:ring-blue-400" />
    );
};

const BonusCell = ({ value, onChange, onSave, loading }) => (
    <div className="relative w-20">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
        <input type="number" value={value || ''} onChange={onChange} onBlur={onSave} disabled={loading} placeholder="0"
            className="w-full pl-6 pr-1 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-inset focus:ring-blue-400 focus:border-slate-400 text-right focus:outline-none" />
    </div>
);

const DataTable = ({ cols, rows, loading, error, empty, page, totalPages, totalItems, onPage, onRowClick }) => {
    if (loading) return <div className="flex-1 flex items-center justify-center"><Loader size="lg" /></div>;
    if (error) return <div className="flex-1 flex flex-col items-center justify-center text-center py-16"><AlertTriangle className="w-8 h-8 text-rose-300 mb-2" /><p className="text-sm text-slate-500">{error}</p></div>;
    if (!rows.length) return (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60 flex items-center justify-center mb-4 shadow-sm">
                <Inbox className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-900">No entries yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">{empty}</p>
        </div>
    );

    return (
        <>
            <div className="flex-1 overflow-auto min-h-0">
                <table className="w-full min-w-max border-collapse">
                    <thead className="sticky top-0 z-10">
                        <tr>
                            {cols.map(c => (
                                <th key={c.k} style={{ minWidth: c.w, ...(c.sticky ? { position: 'sticky', left: 0, zIndex: 20, boxShadow: '2px 0 4px -2px rgba(0,0,0,0.06)' } : {}) }}
                                    className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em] border-b border-slate-200 bg-slate-50/90 backdrop-blur-sm whitespace-nowrap">
                                    {c.t}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {rows.map((row, i) => (
                            <tr key={row._id || i} onClick={() => onRowClick?.(row)}
                                className={cn('hover:bg-slate-50/70 transition-colors', onRowClick && 'cursor-pointer')}>
                                {cols.map(c => (
                                    <td key={c.k} style={c.sticky ? { position: 'sticky', left: 0, zIndex: 5, boxShadow: '2px 0 4px -2px rgba(0,0,0,0.03)' } : {}}
                                        className={cn('px-4 py-2.5 text-sm whitespace-nowrap align-middle', c.sticky && 'bg-white')}>
                                        {c.r(row)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {onPage && totalItems > 0 && (
                <div className="px-6 py-3 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
                    <span className="text-xs text-slate-500 font-medium">{totalItems} records</span>
                    <div className="flex items-center gap-1.5">
                        <button onClick={() => onPage(page - 1)} disabled={page <= 1}
                            className="h-9 w-9 rounded-md flex items-center justify-center border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                            <ChevronLeft size={14} />
                        </button>
                        <span className="text-xs font-semibold text-slate-600 px-3">Page <span className="font-bold text-slate-900">{page}</span> of <span className="font-bold text-slate-900">{totalPages}</span></span>
                        <button onClick={() => onPage(page + 1)} disabled={page >= totalPages}
                            className="h-9 w-9 rounded-md flex items-center justify-center border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

const Modal = ({ title, onClose, children }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
        <div className="w-full max-w-lg bg-white rounded-xl shadow-xl shadow-slate-900/10 border border-slate-200" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"><X size={16} /></button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">{children}</div>
        </div>
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

    const summary = useMemo(() => {
        const totalPayout = rows.reduce((s, r) => s + r.totalAmount + Number(bonusAmounts[r._id] || 0), 0);
        const totalInterviews = rows.reduce((s, r) => s + r.interviewsCompleted, 0);
        return { totalPayout, totalInterviews, interviewers: rows.length };
    }, [rows, bonusAmounts]);

    const cols = useMemo(() => [
        { k: 'name', t: 'Interviewer', w: 180, sticky: true, r: (r) => <div><p className="font-bold text-slate-900 text-xs">{r.fullName}</p><p className="text-[10px] text-slate-400 font-mono">{r.interviewerId}</p></div> },
        { k: 'count', t: 'Count', w: 60, r: (r) => <span className="inline-flex px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">{r.interviewsCompleted}</span> },
        { k: 'bonus', t: 'Bonus', w: 100, r: (r) => <BonusCell value={bonusAmounts[r._id]} onChange={e => setBonusAmounts(p => ({ ...p, [r._id]: e.target.value }))} onSave={() => saveBonus(r)} loading={actionLoading[`${r._id}-bonus`]} /> },
        { k: 'total', t: 'Total', w: 100, r: (r) => <span className="font-bold text-emerald-700 text-xs">{formatCurrency(r.totalAmount + Number(bonusAmounts[r._id] || 0))}</span> },
        { k: 'payStatus', t: 'Pay Status', w: 110, r: (r) => <Badge variant={r.emailSentStatus === 'Sent' ? 'success' : 'gray'}>{r.emailSentStatus}</Badge> },
        { k: 'payAction', t: 'Pay Action', w: 90, r: (r) => <Btn onClick={() => action(r._id, 'email', sendPaymentEmail, { interviewerId: r._id, email: r.email, name: r.fullName, monthYear: startDate.toLocaleString('default', { month: 'long', year: 'numeric' }), payPerInterview: r.paymentAmount, interviewCount: r.interviewsCompleted, totalAmount: r.totalAmount, bonusAmount: Number(bonusAmounts[r._id]||0), startDate: startDate.toISOString(), endDate: endDate.toISOString() }, 'Sent!')} loading={actionLoading[`${r._id}-email`]}>{r.emailSentStatus === 'Sent' ? 'Resend' : 'Send'}</Btn> },
        { k: 'userConf', t: 'User Conf.', w: 110, r: (r) => <Badge variant={r.confirmationStatus === 'Confirmed' ? 'success' : r.confirmationStatus === 'Disputed' ? 'danger' : 'warning'}>{r.confirmationStatus}</Badge> },
        { k: 'confRem', t: 'Remarks', w: 90, r: (r) => r.confirmationRemarks ? <button onClick={() => setRemarksModal({ isOpen: true, content: r.confirmationRemarks })} className="text-xs font-semibold text-blue-600 hover:text-blue-800">View</button> : <span className="text-slate-300 text-xs">—</span> },
        { k: 'invReq', t: 'Invoice', w: 100, r: (r) => <Badge variant={r.invoiceEmailSentStatus === 'Sent' ? 'success' : 'gray'}>{r.invoiceEmailSentStatus}</Badge> },
        { k: 'invAction', t: 'Inv. Action', w: 80, r: (r) => <Btn variant="yellow" onClick={() => action(r._id, 'invoice', sendInvoiceEmail, { interviewerId: r._id, email: r.email, name: r.fullName, interviewCount: r.interviewsCompleted, interviewAmount: r.totalAmount, bonusAmount: Number(bonusAmounts[r._id]||0), startDate: startDate.toISOString(), endDate: endDate.toISOString() }, 'Sent!')} loading={actionLoading[`${r._id}-invoice`]}>Send</Btn> },
        { k: 'paidConf', t: 'Paid', w: 90, r: (r) => <Badge variant={r.paymentReceivedEmailSentAt ? 'success' : 'gray'}>{r.paymentReceivedEmailSentAt ? 'Sent' : 'No'}</Badge> },
        { k: 'paidAction', t: 'Paid Action', w: 80, r: (r) => <Btn variant="outline" onClick={() => action(r._id, 'paid', sendPaymentReceivedEmail, { interviewerId: r._id, email: r.email, name: r.fullName, startDate: startDate.toISOString(), endDate: endDate.toISOString(), totalAmount: r.totalAmount + Number(bonusAmounts[r._id]||0), interviewCount: r.interviewsCompleted }, 'Sent!')} loading={actionLoading[`${r._id}-paid`]}>Send</Btn> },
        { k: 'recStatus', t: 'Received', w: 100, r: (r) => <Badge variant={r.paymentReceivedStatus === 'Received' ? 'success' : 'warning'}>{r.paymentReceivedStatus}</Badge> },
        { k: 'recRem', t: 'Rec. Remarks', w: 90, r: (r) => r.paymentReceivedRemarks ? <button onClick={() => setRemarksModal({ isOpen: true, content: r.paymentReceivedRemarks })} className="text-xs font-semibold text-blue-600 hover:text-blue-800">View</button> : <span className="text-slate-300 text-xs">—</span> },
    ], [bonusAmounts, actionLoading, startDate, endDate]);

    return (
        <div className="h-full flex flex-col">
            <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-white h-10">
                            <Calendar className="text-slate-400 shrink-0" size={14} />
                            <DatePicker selectsRange startDate={startDate} endDate={endDate} onChange={setDateRange}
                                className="text-sm font-medium focus:outline-none w-48 bg-transparent" placeholderText="Select Range"
                                portalId="datepicker-portal" popperClassName="!z-[9999]" popperProps={{ strategy: 'fixed' }} />
                        </div>
                        <div className="flex gap-1.5">
                            {['This Month', 'Last Month'].map(l => (
                                <button key={l}
                                    className="h-10 px-4 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                                    onClick={() => { const n = new Date(); setDateRange(l === 'This Month' ? [startOfMonth(n), endOfMonth(n)] : [startOfMonth(subMonths(n,1)), endOfMonth(subMonths(n,1))]); }}>
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>
                    {rows.length > 0 && (
                        <div className="flex items-center gap-5 text-xs">
                            <div className="flex items-center gap-1.5 text-slate-500"><Users size={13} /> <span className="font-bold text-slate-900">{summary.interviewers}</span></div>
                            <div className="flex items-center gap-1.5 text-slate-500"><TrendingUp size={13} /> <span className="font-bold text-slate-900">{summary.totalInterviews}</span></div>
                            <div className="flex items-center gap-1.5 text-slate-500"><IndianRupee size={13} /> <span className="font-bold text-emerald-600">{formatCurrency(summary.totalPayout)}</span></div>
                        </div>
                    )}
                </div>
            </div>
            <DataTable cols={cols} rows={rows} loading={loading} error={error ? 'Failed to load.' : null} empty="No payment requests found for this period." page={page} totalPages={totalPages} totalItems={totalItems} onPage={setPage} />
            {remarksModal.isOpen && <Modal title="Remarks" onClose={() => setRemarksModal({ isOpen: false, content: '' })}><p className="text-sm text-slate-700 whitespace-pre-wrap">{remarksModal.content}</p></Modal>}
        </div>
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
        { k: 'assoc', t: 'Association', w: 160, r: (r) => <span className="font-semibold text-slate-800 text-xs">{r.associationName}</span> },
        { k: 'act', t: 'Activity', w: 130, r: (r) => <span className="inline-flex px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">{r.activityName}</span> },
        { k: 'ref', t: 'Ref ID', w: 140, r: (r) => <span className="font-mono text-xs text-slate-500">{r.activityReferenceId}</span> },
        { k: 'date', t: 'Date', w: 150, r: (r) => <span className="text-slate-600 text-xs font-medium">{formatDateTime(r.activityDatetime)}</span> },
        { k: 'pts', t: 'Points', w: 80, r: (r) => <span className="font-bold text-emerald-600 text-xs">+{r.points}</span> },
    ], [handleIdSave]);

    return (
        <div className="h-full flex flex-col">
            <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="relative w-64">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by ID..."
                            className="w-full pl-10 pr-3 h-10 bg-slate-50/60 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 focus:bg-white transition-colors" />
                    </div>
                    <div className="flex items-center gap-2.5">
                        <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 h-10">
                            <Calendar className="text-slate-400 shrink-0" size={14} />
                            <DatePicker selected={date} onChange={setDate} dateFormat="MMM yyyy" showMonthYearPicker
                                className="w-24 text-sm font-medium cursor-pointer focus:outline-none bg-transparent"
                                portalId="datepicker-portal" popperClassName="!z-[9999]" popperProps={{ strategy: 'fixed' }} />
                        </div>
                        <button onClick={handleExport} disabled={!rows.length}
                            className="h-10 inline-flex items-center gap-2 px-4 text-sm font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors">
                            <Download size={14} /> Export
                        </button>
                    </div>
                </div>
            </div>
            <DataTable cols={cols} rows={rows} loading={loading} error={error ? 'Failed to load.' : null} empty="No payout data for this month." page={page} totalPages={totalPages} totalItems={totalItems} onPage={setPage} />
        </div>
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
        { k: 'month', t: 'Month', w: 120, r: (r) => <span className="font-bold text-slate-900 text-sm">{months[r.month - 1]}</span> },
        { k: 'total', t: 'Total Payout', w: 140, r: (r) => <span className="font-mono text-emerald-700 font-bold text-sm">{formatCurrency(r.totalAmount)}</span> },
        { k: 'interviewers', t: 'Interviewers', w: 120, r: (r) => <span className="inline-flex px-2 py-0.5 bg-slate-100 rounded-md text-xs font-bold text-slate-700">{r.totalInterviewers}</span> },
        { k: 'conf', t: 'Confirmations', w: 200, r: (r) => <span className="text-xs text-slate-600 font-medium">{r.receivedCount} Received / {r.pendingCount} Pending</span> },
    ], []);

    const mCols = useMemo(() => [
        { k: 'name', t: 'Name', w: 200, r: (r) => <span className="font-bold text-slate-900 text-sm">{r.interviewerName}</span> },
        { k: 'id', t: 'ID', w: 150, r: (r) => <span className="text-xs font-mono text-slate-500">{r.interviewerId}</span> },
        { k: 'amt', t: 'Amount', w: 140, r: (r) => <span className="font-bold text-emerald-600 text-sm">{formatCurrency(r.monthPayment)}</span> },
        { k: 'status', t: 'Status', w: 140, r: (r) => <Badge variant={r.confirmationStatus === 'Received' ? 'success' : 'warning'}>{r.confirmationStatus}</Badge> },
    ], []);

    return (
        <div className="h-full flex flex-col">
            <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {view === 'monthly' && (
                            <button onClick={() => setView('yearly')} className="w-9 h-9 rounded-md flex items-center justify-center border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
                                <ArrowLeft size={16} />
                            </button>
                        )}
                        <h2 className="text-base font-bold text-slate-900 tracking-tight">
                            {view === 'yearly' ? `Earnings ${year}` : `${month?.name} ${year}`}
                        </h2>
                    </div>
                    <select value={year} onChange={e => setYear(+e.target.value)}
                        className="h-10 border border-slate-200 rounded-xl px-3 text-sm font-semibold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 hover:border-slate-300 transition-colors bg-white">
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>
            <DataTable cols={view === 'yearly' ? yCols : mCols} rows={data} loading={loading} error={err} empty="No reports available."
                onRowClick={view === 'yearly' ? (r) => { setMonth({ num: r.month, name: months[r.month-1] }); setView('monthly'); } : undefined} />
        </div>
    );
};

// ─── SIDEBAR ────────────────────────────────────────────────────────────────

const tabs = [
    { id: 'payments', label: 'Payment Requests', icon: DollarSign },
    { id: 'payout', label: 'Payout Sheet', icon: BarChart2 },
    { id: 'reports', label: 'Reports', icon: FileText },
];

const tabComponents = {
    'payments': PaymentRequestsView,
    'payout': PayoutSheetView,
    'reports': ReportsView,
};

const BASE = '/admin/earnings-report';

const EarningsSidebar = memo(({ activeTab, onTabClick }) => (
    <aside className="w-56 flex-shrink-0 bg-[#f0f4fa] border-r border-slate-200/80 flex flex-col">
        <nav className="flex-1 p-3 space-y-0.5">
            {tabs.map(t => {
                const isActive = activeTab === t.id;
                return (
                    <button key={t.id} onClick={() => onTabClick(t.id)}
                        className={cn(
                            'group relative flex items-center w-full px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all duration-200',
                            isActive
                                ? 'bg-white text-blue-700 shadow-sm border border-slate-200/60'
                                : 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
                        )}>
                        <t.icon className="w-4 h-4" />
                        <span className="ml-2.5 flex-1 text-left">{t.label}</span>
                    </button>
                );
            })}
        </nav>
    </aside>
));
EarningsSidebar.displayName = 'EarningsSidebar';

// ─── MAIN PAGE ──────────────────────────────────────────────────────────────

const getInitialTab = () => {
    const suffix = window.location.pathname.replace(BASE, '').replace(/^\//, '');
    return tabs.find(t => t.id === suffix)?.id || 'payments';
};

const EarningsReportPage = () => {
    const [activeTab, setActiveTab] = useState(getInitialTab);

    const handleTabClick = useCallback((tabId) => {
        setActiveTab(tabId);
        window.history.replaceState(null, '', `${BASE}/${tabId}`);
    }, []);

    const ActiveComponent = tabComponents[activeTab];

    return (
        <div className="flex h-full w-full overflow-hidden">
            <EarningsSidebar activeTab={activeTab} onTabClick={handleTabClick} />
            <main className="flex-1 overflow-hidden flex flex-col bg-[#f5f7fb]">
                <ActiveComponent key={activeTab} />
            </main>
        </div>
    );
};

export default EarningsReportPage;
