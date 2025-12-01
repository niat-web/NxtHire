// client/src/pages/admin/EarningsReportPage.jsx
import React, { useState, useEffect, useCallback, useMemo, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { 
    FiArrowLeft, FiDollarSign, FiSearch, FiBarChart2, FiDownload, 
    FiLoader, FiChevronDown, FiX, FiInbox, FiCalendar, 
    FiFilter, FiChevronLeft, FiChevronRight, FiChevronsLeft, 
    FiChevronsRight, FiFileText, FiEdit2, FiAlertTriangle
} from 'react-icons/fi';
import { getPaymentRequests, sendPaymentEmail, sendInvoiceEmail, sendPaymentReceivedEmail, getPayoutSheet, updateInterviewer, getYearlyEarningsSummary, getMonthlyEarningsDetails, saveBonusAmount } from '../../api/admin.api';
import { useAlert } from '../../hooks/useAlert';
import { format as formatDateFns, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from 'date-fns';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { debounce } from '../../utils/helpers';
import Badge from '../../components/common/Badge';

// --- STYLED COMPONENTS ---

const LocalButton = ({ children, onClick, isLoading = false, variant = 'primary', icon: Icon, className = '', disabled = false, title = '' }) => {
    const base = "inline-flex items-center justify-center font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-[0.98]";
    
    const sizes = {
        xs: 'text-xs px-2.5 py-1.5',
        sm: 'text-xs px-3 py-2',
        md: 'text-sm px-4 py-2.5'
    };

    const variants = {
        primary: 'bg-gray-900 text-white hover:bg-black border border-transparent shadow-sm focus:ring-gray-900',
        secondary: 'bg-[#FFD130] text-gray-900 hover:bg-[#FFC400] border border-[#FFD130] shadow-sm',
        outline: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400',
        danger: 'bg-white text-red-600 border border-red-200 hover:bg-red-50',
        ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    };

    const sizeClass = className.includes('text-xs') || className.includes('text-[10px]') ? sizes.xs : sizes.md;

    return (
        <button onClick={onClick} disabled={isLoading || disabled} className={`${base} ${sizeClass} ${variants[variant]} ${className}`} title={title}>
            {isLoading ? (
                <FiLoader className="animate-spin h-4 w-4 mr-2" />
            ) : (
                Icon && <Icon className={`h-4 w-4 ${children ? 'mr-2' : ''}`} />
            )}
            {isLoading ? "Processing..." : children}
        </button>
    );
};

const RemarksModal = ({ isOpen, onClose, content }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm" onClick={onClose}>
            <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Remarks</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500"><FiX className="h-4 w-4" /></button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{content}</p>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                    <LocalButton variant="outline" onClick={onClose} size="sm">Close</LocalButton>
                </div>
            </div>
        </div>
    );
};

// --- TABLE COMPONENT (Fixed Layout & Scroll) ---
const CompactTable = ({ columns, data, isLoading, emptyMessage, onRowClick, error }) => {
    const Loader = () => (
        <div className="flex flex-col justify-center items-center py-20 h-full">
            <FiLoader className="w-8 h-8 text-gray-400 animate-spin mb-3" />
            <span className="text-sm font-medium text-gray-500">Loading records...</span>
        </div>
    );

    const EmptyState = ({ msg }) => (
        <div className="flex flex-col items-center justify-center py-20 text-center h-full">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <FiInbox className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No Data Found</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-xs">{msg}</p>
        </div>
    );

    const ErrorState = ({ msg }) => (
        <div className="flex flex-col items-center justify-center py-20 text-center h-full">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <FiAlertTriangle className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Unable to Load Data</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-xs">{msg || "An unexpected error occurred."}</p>
        </div>
    );

    return (
        <div className="flex-1 w-full overflow-hidden flex flex-col bg-white border-t border-gray-200">
            <div className="flex-1 overflow-auto custom-scrollbar relative">
                <table className="min-w-max border-separate border-spacing-0">
                    <thead className="bg-gray-50 sticky top-0 z-20 shadow-sm">
                        <tr>
                            {columns.map((col, idx) => (
                                <th 
                                    key={col.key || idx}
                                    className={`px-4 py-3 border-b border-r border-gray-200 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-50 ${col.isSticky ? 'sticky left-0 z-30' : ''}`}
                                    style={col.isSticky ? { left: 0, boxShadow: '2px 0 5px -2px rgba(0,0,0,0.1)', minWidth: col.minWidth } : { minWidth: col.minWidth }}
                                >
                                    {col.title}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {isLoading ? (
                            <tr><td colSpan={columns.length} className="h-64"><Loader /></td></tr>
                        ) : error ? (
                            <tr><td colSpan={columns.length} className="h-64"><ErrorState msg={error} /></td></tr>
                        ) : data.length === 0 ? (
                            <tr><td colSpan={columns.length} className="h-64"><EmptyState msg={emptyMessage} /></td></tr>
                        ) : (
                            data.map((row, rowIndex) => (
                                <tr 
                                    key={row._id || rowIndex} 
                                    className={`group hover:bg-blue-50/30 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                                    onClick={() => onRowClick && onRowClick(row)}
                                >
                                    {columns.map((col, colIdx) => (
                                        <td 
                                            key={col.key || colIdx}
                                            className={`px-4 py-3 border-b border-r border-gray-100 text-sm text-gray-700 align-middle ${col.allowWrap ? '' : 'whitespace-nowrap'} ${col.isSticky ? 'sticky left-0 z-10 bg-white group-hover:bg-blue-50/30' : ''}`}
                                            style={col.isSticky ? { left: 0, boxShadow: '2px 0 5px -2px rgba(0,0,0,0.05)' } : {}}
                                        >
                                            {col.render ? col.render(row) : row[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const PaginationControls = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage, onItemsPerPageChange }) => {
    if (totalItems === 0) return null;
    
    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) pages.push(1, 2, 3, 4, '...', totalPages);
            else if (currentPage >= totalPages - 2) pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            else pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
        }
        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between p-3 border-t border-gray-200 bg-white gap-4 flex-shrink-0">
            <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>Show</span>
                <select value={itemsPerPage} onChange={onItemsPerPageChange} className="bg-white border border-gray-300 rounded-md px-2 py-1 text-sm font-medium focus:ring-1 focus:ring-gray-900 focus:border-gray-900 cursor-pointer">
                    {[15, 20, 50, 100].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span>of <strong>{totalItems}</strong> entries</span>
            </div>
            
            <div className="flex items-center gap-1">
                <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"><FiChevronLeft /></button>
                {getPageNumbers().map((page, idx) => (
                    page === '...' ? <span key={idx} className="px-2 text-gray-400">...</span> :
                    <button key={idx} onClick={() => onPageChange(page)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${currentPage === page ? 'bg-gray-900 text-white' : 'hover:bg-gray-100 text-gray-700'}`}>{page}</button>
                ))}
                <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"><FiChevronRight /></button>
            </div>
        </div>
    );
};

// --- SUB-VIEWS & CELLS ---

const EditableInterviewerIDCell = ({ row, onSave }) => {
    const [value, setValue] = useState(row.interviewer?.interviewerId || '');
    const [loading, setLoading] = useState(false);
    const { showError } = useAlert();

    const handleBlur = async () => {
        if (value.trim() === (row.interviewer?.interviewerId || '').trim()) return;
        setLoading(true);
        try { await onSave(row.interviewer._id, value.trim()); } 
        catch { setValue(row.interviewer?.interviewerId || ''); showError('Update failed.'); } 
        finally { setLoading(false); }
    };

    return (
        <div className="relative group w-full">
            <input 
                type="text" 
                value={value} 
                onChange={e => setValue(e.target.value)} 
                onBlur={handleBlur} 
                disabled={loading}
                className="w-full bg-transparent border border-transparent hover:border-gray-200 focus:bg-white focus:border-blue-500 rounded px-2 py-1 text-sm font-mono transition-all truncate"
            />
            <FiEdit2 className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 pointer-events-none" />
            {loading && <FiLoader className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 animate-spin text-blue-600" />}
        </div>
    );
};

const EditableBonusCell = ({ value, onChange, onSave, isLoading }) => (
    <div className="relative w-20">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
        <input
            type="number"
            value={value || ''}
            onChange={onChange}
            onBlur={onSave}
            disabled={isLoading}
            placeholder="0"
            className="w-full pl-5 pr-2 py-1.5 text-xs border border-gray-200 rounded bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-right"
        />
        {isLoading && <div className="absolute right-1 top-1 text-blue-500"><span className="block w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span></div>}
    </div>
);

// --- VIEW COMPONENTS ---

const PayoutSheetView = () => {
    const { showError, showSuccess } = useAlert();
    const [loading, setLoading] = useState(true);
    const [payoutData, setPayoutData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [date, setDate] = useState(new Date());
    const [pagination, setPagination] = useState({ currentPage: 1, itemsPerPage: 15, totalPages: 1, totalItems: 0 });
    const [errorState, setErrorState] = useState(null);

    const fetchPayoutSheet = useCallback(async (page) => {
        setLoading(true);
        setErrorState(null);
        try {
            const params = { search: searchTerm, startDate: startOfMonth(date).toISOString(), endDate: endOfMonth(date).toISOString(), page, limit: pagination.itemsPerPage };
            const res = await getPayoutSheet(params);
            setPayoutData(res.data.data.payoutSheet || []);
            setPagination(p => ({ ...p, currentPage: page, totalPages: res.data.data.totalPages, totalItems: res.data.data.totalDocs }));
        } catch (err) { 
            console.error(err);
            setErrorState("Failed to retrieve payout sheet.");
            setPayoutData([]); 
        } 
        finally { setLoading(false); }
    }, [date, searchTerm, pagination.itemsPerPage]);

    useEffect(() => { const h = debounce(() => fetchPayoutSheet(1), 300); h(); return h.cancel; }, [date, searchTerm]);
    useEffect(() => { fetchPayoutSheet(pagination.currentPage); }, [pagination.currentPage]);

    const handleExport = () => {
        if (!payoutData.length) return showError("No data to export.");
        const data = payoutData.map(r => ({ "User ID": r.interviewer.interviewerId, "Activity": r.activityName, "Points": r.points, "Date": formatDateTime(r.activityDatetime) }));
        const ws = XLSX.utils.json_to_sheet(data); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Payout');
        saveAs(new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })], { type: 'application/octet-stream' }), `Payout_${formatDateFns(date, 'MMM-yyyy')}.xlsx`);
        showSuccess("Exported!");
    };

    const handleIdSave = useCallback(async (id, newId) => {
        await updateInterviewer(id, { interviewerId: newId });
        setPayoutData(d => d.map(r => r.interviewer._id === id ? { ...r, interviewer: { ...r.interviewer, interviewerId: newId } } : r));
        showSuccess('ID Updated');
    }, [showSuccess]);

    const columns = useMemo(() => [
        // Updated minWidth for full visibility
        { key: 'interviewer_id', title: 'Interviewer ID', isSticky: true, minWidth: '280px', render: r => <EditableInterviewerIDCell row={r} onSave={handleIdSave} /> },
        { key: 'association_name', title: 'Association', minWidth: '180px', render: r => <span className="font-medium text-gray-800">{r.associationName}</span> },
        { key: 'activity_name', title: 'Activity', minWidth: '150px', render: r => <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-bold">{r.activityName}</span> },
        { key: 'ref_id', title: 'Ref ID', minWidth: '150px', render: r => <span className="font-mono text-xs text-gray-500">{r.activityReferenceId}</span> },
        { key: 'date', title: 'Date', minWidth: '160px', render: r => <span className="text-gray-600 text-xs">{formatDateTime(r.activityDatetime)}</span> },
        { key: 'points', title: 'Points', minWidth: '100px', render: r => <span className="font-bold text-green-600">+{r.points}</span> }
    ], [handleIdSave]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between gap-4 bg-gray-50/50 flex-shrink-0">
                <div className="relative w-full sm:w-72">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search Interviewer ID..." className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900" />
                </div>
                <div className="flex gap-2 items-center">
                    <div className="relative z-50">
                        <DatePicker selected={date} onChange={setDate} dateFormat="MMM yyyy" showMonthYearPicker className="w-32 pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-1 focus:ring-gray-900 cursor-pointer" />
                        <FiCalendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    <LocalButton variant="outline" onClick={handleExport} icon={FiDownload} disabled={loading || !payoutData.length} />
                </div>
            </div>
            <CompactTable columns={columns} data={payoutData} isLoading={loading} error={errorState} emptyMessage="No payout data available." />
            <PaginationControls {...pagination} onPageChange={p => fetchPayoutSheet(p)} onItemsPerPageChange={e => setPagination(p => ({ ...p, itemsPerPage: +e.target.value, currentPage: 1 }))} />
        </div>
    );
};

const PaymentRequestsView = () => {
    const { showError, showSuccess } = useAlert();
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState([]);
    const [dateRange, setDateRange] = useState([startOfMonth(new Date()), endOfMonth(new Date())]);
    const [startDate, endDate] = dateRange;
    const [remarksModal, setRemarksModal] = useState({ isOpen: false, content: '' });
    const [pagination, setPagination] = useState({ currentPage: 1, itemsPerPage: 15, totalPages: 1, totalItems: 0 });
    const [bonusAmounts, setBonusAmounts] = useState({});
    const [actionLoading, setActionLoading] = useState({});
    const [errorState, setErrorState] = useState(null);

    const fetchRequests = useCallback(async (page = 1) => {
        setLoading(true);
        setErrorState(null);
        try {
            const params = { startDate: startDate?.toISOString(), endDate: endDate?.toISOString(), page, limit: pagination.itemsPerPage };
            const res = await getPaymentRequests(params);
            setRequests(res.data.data.requests || []);
            setBonusAmounts((res.data.data.requests || []).reduce((acc, r) => ({ ...acc, [r._id]: r.bonusAmount || 0 }), {}));
            setPagination(p => ({ ...p, currentPage: page, totalPages: res.data.data.totalPages, totalItems: res.data.data.totalDocs }));
        } catch (err) { 
            console.error(err);
            setErrorState("Failed to retrieve payment requests. Please check data or try again.");
            setRequests([]); 
        } 
        finally { setLoading(false); }
    }, [startDate, endDate, pagination.itemsPerPage]);

    useEffect(() => { fetchRequests(1); }, [startDate, endDate, fetchRequests]);
    useEffect(() => { if (!loading) fetchRequests(pagination.currentPage); }, [pagination.currentPage]);

    const handleAction = async (id, actionType, apiCall, payload, successMsg) => {
        setActionLoading(p => ({ ...p, [`${id}-${actionType}`]: true }));
        try { await apiCall(payload); showSuccess(successMsg); fetchRequests(pagination.currentPage); } 
        catch (e) { showError(e.response?.data?.message || "Action failed."); } 
        finally { setActionLoading(p => ({ ...p, [`${id}-${actionType}`]: false })); }
    };

    const handleBonusSave = async (row) => {
        const bonus = Number(bonusAmounts[row._id] || 0);
        handleAction(row._id, 'bonus', saveBonusAmount, {
            interviewerId: row._id, startDate: startDate.toISOString(), endDate: endDate.toISOString(),
            monthYear: startDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
            totalAmount: row.totalAmount, interviewCount: row.interviewsCompleted, bonusAmount: bonus
        }, 'Bonus saved!');
    };

    const columns = useMemo(() => [
        { key: 'month', title: 'Month', minWidth: '100px', render: () => <span className="font-semibold text-gray-800">{startDate ? startDate.toLocaleString('default', { month: 'short' }) : '-'}</span> },
        
        { key: 'fullName', title: 'Interviewer', isSticky: true, minWidth: '200px', render: r => (
            <div>
                <p className="font-bold text-gray-900 text-sm">{r.fullName}</p>
                <p className="text-[10px] text-gray-500 font-mono mt-0.5">{r.interviewerId}</p>
            </div>
        )},
        
        { key: 'mobileNumber', title: 'Mobile', minWidth: '130px', render: r => <span className="text-gray-600 text-xs">{r.mobileNumber}</span> },
        { key: 'companyType', title: 'Company Type', minWidth: '140px', render: r => <span className="text-gray-600 text-xs">{r.companyType}</span> },
        { key: 'amount', title: 'Base Pay', minWidth: '100px', render: r => <span className="text-gray-600 text-sm">{formatCurrency(r.paymentAmount)}</span> },
        { key: 'interviewsCompleted', title: 'Count', minWidth: '70px', render: r => <span className="inline-flex justify-center items-center h-6 min-w-[24px] px-2 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">{r.interviewsCompleted}</span> },
        { key: 'bonusAmount', title: 'Bonus', minWidth: '120px', render: r => <EditableBonusCell value={bonusAmounts[r._id]} onChange={e => setBonusAmounts(prev => ({ ...prev, [r._id]: e.target.value }))} onSave={() => handleBonusSave(r)} isLoading={actionLoading[`${r._id}-bonus`]} /> },
        { key: 'totalAmount', title: 'Total', minWidth: '120px', render: r => <span className="font-bold text-green-700 text-sm">{formatCurrency(r.totalAmount + Number(bonusAmounts[r._id] || 0))}</span> },
        
        { key: 'emailStatus', title: 'Pay Email Status', minWidth: '140px', render: r => <Badge variant={r.emailSentStatus === 'Sent' ? 'success' : 'gray'}>{r.emailSentStatus}</Badge> },
        { key: 'emailAction', title: 'Pay Email Action', minWidth: '120px', render: r => (
            <LocalButton 
                onClick={() => handleAction(r._id, 'email', sendPaymentEmail, { interviewerId: r._id, email: r.email, name: r.fullName, monthYear: startDate.toLocaleString('default', { month: 'long', year: 'numeric' }), payPerInterview: r.paymentAmount, interviewCount: r.interviewsCompleted, totalAmount: r.totalAmount, bonusAmount: Number(bonusAmounts[r._id]||0), startDate: startDate.toISOString(), endDate: endDate.toISOString() }, 'Email sent!')}
                isLoading={actionLoading[`${r._id}-email`]}
                variant="primary" className="!text-[10px] !px-3 !py-1 !h-7"
            >
                {r.emailSentStatus === 'Sent' ? 'Resend' : 'Send'}
            </LocalButton>
        )},

        { key: 'confStatus', title: 'User Conf.', minWidth: '130px', render: r => <Badge variant={r.confirmationStatus === 'Confirmed' ? 'success' : r.confirmationStatus === 'Disputed' ? 'danger' : 'warning'}>{r.confirmationStatus}</Badge> },
        { key: 'confRemarks', title: 'Conf. Remarks', minWidth: '120px', render: r => r.confirmationRemarks ? <button onClick={() => setRemarksModal({ isOpen: true, content: r.confirmationRemarks })} className="text-xs text-blue-600 hover:underline">View Remarks</button> : <span className="text-xs text-gray-300">-</span> },

        { key: 'invoiceStatus', title: 'Invoice Req.', minWidth: '130px', render: r => <Badge variant={r.invoiceEmailSentStatus === 'Sent' ? 'success' : 'gray'}>{r.invoiceEmailSentStatus}</Badge> },
        { key: 'invoiceAction', title: 'Invoice Action', minWidth: '120px', render: r => (
            <LocalButton 
                onClick={() => handleAction(r._id, 'invoice', sendInvoiceEmail, { interviewerId: r._id, email: r.email, name: r.fullName, interviewCount: r.interviewsCompleted, interviewAmount: r.totalAmount, bonusAmount: Number(bonusAmounts[r._id]||0), startDate: startDate.toISOString(), endDate: endDate.toISOString() }, 'Invoice Req Sent!')}
                isLoading={actionLoading[`${r._id}-invoice`]}
                variant="secondary" className="!text-[10px] !px-3 !py-1 !h-7"
            >Send</LocalButton>
        )},

        { key: 'paidStatus', title: 'Paid Conf.', minWidth: '130px', render: r => <Badge variant={r.paymentReceivedEmailSentAt ? 'success' : 'gray'}>{r.paymentReceivedEmailSentAt ? 'Sent' : 'No'}</Badge> },
        { key: 'paidAction', title: 'Paid Action', minWidth: '120px', render: r => (
            <LocalButton 
                onClick={() => handleAction(r._id, 'paid', sendPaymentReceivedEmail, { interviewerId: r._id, email: r.email, name: r.fullName, startDate: startDate.toISOString(), endDate: endDate.toISOString(), totalAmount: r.totalAmount + Number(bonusAmounts[r._id]||0), interviewCount: r.interviewsCompleted }, 'Paid Conf Sent!')}
                isLoading={actionLoading[`${r._id}-paid`]}
                variant="outline" className="!text-[10px] !px-3 !py-1 !h-7"
            >Send</LocalButton>
        )},

        { key: 'recStatus', title: 'User Rec.', minWidth: '130px', render: r => <Badge variant={r.paymentReceivedStatus === 'Received' ? 'success' : 'warning'}>{r.paymentReceivedStatus}</Badge> },
        { key: 'recRemarks', title: 'Rec. Remarks', minWidth: '120px', render: r => r.paymentReceivedRemarks ? <button onClick={() => setRemarksModal({ isOpen: true, content: r.paymentReceivedRemarks })} className="text-xs text-blue-600 hover:underline">View Remarks</button> : <span className="text-xs text-gray-300">-</span> },

    ], [bonusAmounts, actionLoading, handleBonusSave]); 

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex flex-col xl:flex-row gap-4 justify-between bg-gray-50/50 flex-shrink-0">
                <div className="flex items-center gap-2 bg-white px-3 py-2 border border-gray-300 rounded-lg shadow-sm w-full xl:w-auto relative z-30">
                    <FiCalendar className="text-gray-400" />
                    <DatePicker selectsRange startDate={startDate} endDate={endDate} onChange={setDateRange} className="text-sm font-medium focus:outline-none w-52" placeholderText="Select Range" />
                </div>
                <div className="flex gap-2">
                    {["This Month", "Last Month"].map(l => (
                        <button key={l} onClick={() => { 
                            const n = new Date(); const d = l === "This Month" ? [startOfMonth(n), endOfMonth(n)] : [startOfMonth(subMonths(n,1)), endOfMonth(subMonths(n,1))];
                            setDateRange(d); 
                        }} className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">{l}</button>
                    ))}
                </div>
            </div>
            
            <CompactTable columns={columns} data={requests} isLoading={loading} error={errorState} emptyMessage="No requests found." />
            
            <PaginationControls {...pagination} onPageChange={p => setPagination(pr => ({...pr, currentPage: p}))} onItemsPerPageChange={e => setPagination(pr => ({...pr, itemsPerPage: +e.target.value, currentPage: 1}))} />
            <RemarksModal isOpen={remarksModal.isOpen} onClose={() => setRemarksModal({ isOpen: false, content: '' })} content={remarksModal.content} />
        </div>
    );
};

const ReportsView = () => {
    const { showError } = useAlert();
    const [view, setView] = useState('yearly');
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [errorState, setErrorState] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setErrorState(null);
        try {
            const res = view === 'yearly' 
                ? await getYearlyEarningsSummary(currentYear) 
                : await getMonthlyEarningsDetails(currentYear, selectedMonth.month);
            setData(res.data.data);
        } catch { 
            setErrorState("Failed to load reports."); 
            setData([]);
        } 
        finally { setLoading(false); }
    }, [view, currentYear, selectedMonth, showError]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const yearlyCols = useMemo(() => [
        { key: 'month', title: 'Month', minWidth: '150px', render: r => <span className="font-bold text-gray-900">{["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][r.month - 1]}</span> },
        { key: 'totalAmount', title: 'Total Payout', minWidth: '150px', render: r => <span className="font-mono text-green-700 font-bold">{formatCurrency(r.totalAmount)}</span> },
        { key: 'totalInterviewers', title: 'Interviewers Paid', minWidth: '150px', render: r => <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold">{r.totalInterviewers}</span> },
        { key: 'status', title: 'Confirmations', minWidth: '200px', render: r => <span className="text-xs text-gray-600">{r.receivedCount} Received / {r.pendingCount} Pending</span> }
    ], []);

    const monthlyCols = useMemo(() => [
        { key: 'interviewerName', title: 'Name', minWidth: '200px', render: r => <span className="font-medium text-gray-900">{r.interviewerName}</span> },
        { key: 'interviewerId', title: 'ID', minWidth: '150px', render: r => <span className="text-xs font-mono text-gray-500">{r.interviewerId}</span> },
        { key: 'monthPayment', title: 'Amount', minWidth: '150px', render: r => <span className="font-bold text-green-600">{formatCurrency(r.monthPayment)}</span> },
        { key: 'confirmationStatus', title: 'Status', minWidth: '150px', render: r => <Badge variant={r.confirmationStatus === 'Received' ? 'success' : 'warning'}>{r.confirmationStatus}</Badge> }
    ], []);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
                <div className="flex items-center gap-3">
                    {view === 'monthly' && <LocalButton variant="ghost" icon={FiArrowLeft} onClick={() => setView('yearly')} />}
                    <h2 className="text-lg font-bold text-gray-800">{view === 'yearly' ? `Earnings: ${currentYear}` : `${selectedMonth?.name} ${currentYear} Details`}</h2>
                </div>
                <select value={currentYear} onChange={e => setCurrentYear(+e.target.value)} className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium focus:ring-gray-900 cursor-pointer">
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>
            <div className="flex-grow overflow-auto p-4 custom-scrollbar">
                <CompactTable 
                    columns={view === 'yearly' ? yearlyCols : monthlyCols} 
                    data={data} 
                    isLoading={loading} 
                    error={errorState}
                    emptyMessage="No reports available."
                    onRowClick={view === 'yearly' ? (r) => { setSelectedMonth({ month: r.month, name: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][r.month-1] }); setView('monthly'); } : undefined}
                />
            </div>
        </div>
    );
};

const EarningsReportPage = () => {
    const [activeView, setActiveView] = useState('payments');

    const NavBtn = ({ id, label, icon: Icon }) => (
        <button 
            onClick={() => setActiveView(id)} 
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeView === id ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
        >
            <Icon className="h-4 w-4" /> {label}
        </button>
    );

    return (
        <div className="h-screen bg-[#F5F7F9] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0 flex justify-between items-center z-50 shadow-sm relative">
                <div className="flex items-center gap-4">
                    <Link to="/admin/dashboard" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors">
                        <FiArrowLeft />
                        Back
                    </Link>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
                    <NavBtn id="payments" label="Payment Requests" icon={FiDollarSign} />
                    <NavBtn id="payout" label="Payout Sheet" icon={FiBarChart2} />
                    <NavBtn id="reports" label="Reports" icon={FiFileText} />
                </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-hidden p-4 sm:p-6">
                <div className="h-full w-full max-w-[1920px] mx-auto flex flex-col">
                    {activeView === 'payments' && <PaymentRequestsView />}
                    {activeView === 'payout' && <PayoutSheetView />}
                    {activeView === 'reports' && <ReportsView />}
                </div>
            </div>
        </div>
    );
};

export default EarningsReportPage;
