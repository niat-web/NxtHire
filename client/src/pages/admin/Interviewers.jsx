// client/src/pages/admin/Interviewers.jsx
import React, { useEffect, useState, useMemo, useRef, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import {
    User, Search, Edit, Trash2, Plus, Upload, CheckCircle,
    AlertTriangle, Loader2, X, ChevronLeft, ChevronRight,
    Users, ChevronDown, Eye, Phone, MessageCircle, Briefcase, CreditCard,
    Send, RefreshCw
} from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';

import {
    updateInterviewer, bulkUploadInterviewers, bulkDeleteInterviewers,
    sendWelcomeEmail, sendProbationEmail, markProbationAsSent
} from '../../api/admin.api';
import { INTERVIEWER_STATUS } from '../../utils/constants';
import { debounce } from '../../utils/helpers';
import { useInterviewers, useInvalidateAdmin, useDomainOptions } from '../../hooks/useAdminQueries';
import { formatDateTime } from '../../utils/formatters';
import { useAlert } from '../../hooks/useAlert';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import InterviewerFormModal from './InterviewerFormModal';

// --- View Details Modal ---
const ViewDetailsModal = ({ isOpen, onClose, data, onSendWelcome, onSendProbation, onMarkProbation }) => {
    if (!data) return null;

    const [loadingAction, setLoadingAction] = useState(null);

    const handleAction = async (actionFn, actionType) => {
        setLoadingAction(actionType);
        await actionFn(data._id);
        setLoadingAction(null);
    };

    const DetailItem = ({ label, value, icon: Icon }) => (
        <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                {Icon && <Icon className="w-3 h-3" />} {label}
            </span>
            <span className="text-sm font-medium text-slate-900 break-words">{value || <span className="text-slate-400 italic">N/A</span>}</span>
        </div>
    );

    const showProbationActions = (data.status === 'On Probation' || data.status === 'Active') && (data.metrics?.interviewsCompleted >= 5);

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-xl bg-white text-left align-middle shadow-lg transition-all flex flex-col max-h-[90vh]">
                                {/* Header */}
                                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-lg font-semibold border border-blue-100">
                                            {data.user?.firstName?.[0]}{data.user?.lastName?.[0]}
                                        </div>
                                        <div>
                                            <Dialog.Title as="h3" className="text-lg font-semibold text-slate-900 leading-tight">
                                                {data.user?.firstName} {data.user?.lastName}
                                            </Dialog.Title>
                                            <p className="text-sm text-slate-500">{data.jobTitle} · <span className={`font-semibold ${data.status === 'Active' ? 'text-emerald-600' : 'text-amber-600'}`}>{data.status}</span></p>
                                        </div>
                                    </div>
                                    <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"><X className="h-5 w-5" /></button>
                                </div>

                                {/* Scrollable Content */}
                                <div className="p-6 overflow-y-auto custom-scrollbar">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="col-span-1 md:col-span-2"><h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2"><User size={14} /> Contact Information</h4></div>
                                        <DetailItem label="Email Address" value={data.user?.email} />
                                        <DetailItem label="Phone Number" value={data.user?.phoneNumber} />
                                        <DetailItem label="WhatsApp" value={data.user?.whatsappNumber} />
                                        <DetailItem label="Onboarded Date" value={data.onboardingDate ? formatDateTime(data.onboardingDate) : 'N/A'} />

                                        <div className="col-span-1 md:col-span-2 mt-2"><h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2"><Briefcase size={14} /> Professional Details</h4></div>
                                        <DetailItem label="Current Employer" value={data.currentEmployer} />
                                        <DetailItem label="Total Experience" value={`${data.yearsOfExperience} Years`} />
                                        <DetailItem label="Company Type" value={data.companyType} />
                                        <DetailItem label="Domains" value={data.domains?.join(', ')} />
                                        <DetailItem label="Interviewer ID" value={data.interviewerId} />
                                        <DetailItem label="Payout ID" value={data.payoutId} />
                                        <DetailItem label="Interviews Completed" value={data.metrics?.interviewsCompleted || 0} />

                                        <div className="col-span-1 md:col-span-2 mt-2"><h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2"><CreditCard size={14} /> Bank Details</h4></div>
                                        <DetailItem label="Bank Name" value={data.bankDetails?.bankName} />
                                        <DetailItem label="Account Name" value={data.bankDetails?.accountName} />
                                        <DetailItem label="Account Number" value={data.bankDetails?.accountNumber} />
                                        <DetailItem label="IFSC Code" value={data.bankDetails?.ifscCode} />
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap justify-between items-center gap-3">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAction(onSendWelcome, 'welcome')}
                                            disabled={loadingAction === 'welcome'}
                                            className={`inline-flex items-center gap-2 px-3 h-8 text-xs font-medium rounded-md border transition-colors disabled:opacity-40 ${data.welcomeEmailSentAt ? 'text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-700 border-slate-200 bg-white hover:bg-slate-50'}`}
                                        >
                                            {loadingAction === 'welcome' ? <Loader2 size={13} className="animate-spin" /> : (data.welcomeEmailSentAt ? <RefreshCw size={13} /> : <Send size={13} />)}
                                            {data.welcomeEmailSentAt ? "Resend Welcome Mail" : "Send Welcome Mail"}
                                        </button>

                                        {showProbationActions && (
                                            <button
                                                onClick={() => handleAction(onSendProbation, 'probation')}
                                                disabled={loadingAction === 'probation'}
                                                className={`inline-flex items-center gap-2 px-3 h-8 text-xs font-medium rounded-md border transition-colors disabled:opacity-40 ${data.probationEmailSentAt ? 'text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-700 border-slate-200 bg-white hover:bg-slate-50'}`}
                                            >
                                                {loadingAction === 'probation' ? <Loader2 size={13} className="animate-spin" /> : (data.probationEmailSentAt ? <RefreshCw size={13} /> : <Send size={13} />)}
                                                {data.probationEmailSentAt ? "Resend Probation Mail" : "Send Probation Mail"}
                                            </button>
                                        )}

                                        {showProbationActions && !data.probationEmailSentAt && (
                                            <button
                                                onClick={() => handleAction(onMarkProbation, 'mark')}
                                                disabled={loadingAction === 'mark'}
                                                className="inline-flex items-center gap-2 px-3 h-8 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40"
                                            >
                                                {loadingAction === 'mark' ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                                                Mark Probation Sent
                                            </button>
                                        )}
                                    </div>
                                    <button onClick={onClose} className="inline-flex items-center px-4 h-10 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">Close</button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

// --- Upload Modal ---
const UploadModal = ({ isOpen, onClose, onUploadConfirm, isLoading }) => {
    const [file, setFile] = useState(null);
    const [parsedData, setParsedData] = useState([]);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);
    const { showError } = useAlert();

    useEffect(() => { if (!isOpen) { setFile(null); setParsedData([]); setError(''); } }, [isOpen]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;
        setError(''); setFile(selectedFile);
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const workbook = XLSX.read(event.target.result, { type: 'binary' });
                const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
                if (!data.length) { setError("File is empty."); return; }
                setParsedData(data);
            } catch { showError("Parsing failed."); }
        };
        reader.readAsBinaryString(selectedFile);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-lg bg-white rounded-xl shadow-lg border border-slate-200 p-6" onClick={e => e.stopPropagation()}>
                <h3 className="text-base font-semibold text-slate-900 mb-4">Bulk Import Interviewers</h3>
                <div className="space-y-4">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv, .xlsx" className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 cursor-pointer border border-slate-200 rounded-lg p-2" />
                    {error && <p className="text-red-600 text-sm">{error}</p>}
                    <p className="text-xs text-slate-500">Supported files: .csv, .xlsx. Headers: firstName, email, phoneNumber, etc.</p>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 h-10 text-sm font-medium text-slate-700 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors">Cancel</button>
                    <button onClick={() => onUploadConfirm(parsedData)} disabled={isLoading || !parsedData.length} className="inline-flex items-center gap-2 px-4 h-10 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-40 transition-colors">
                        {isLoading && <Loader2 size={14} className="animate-spin" />} Upload
                    </button>
                </div>
            </div>
        </div>
    );
};

const Interviewers = () => {
    const navigate = useNavigate();
    const { showSuccess, showError } = useAlert();
    const DOMAINS = useDomainOptions();
    const { invalidateInterviewers } = useInvalidateAdmin();
    const [sortConfig, setSortConfig] = useState({ key: 'onboardingDate', direction: 'desc' });
    const [filters, setFilters] = useState({ search: '', status: '', domain: '' });
    const [debouncedFilters, setDebouncedFilters] = useState(filters);
    const [currentPage, setCurrentPage] = useState(1);
    const [modalState, setModalState] = useState({ type: null, data: null });
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, ids: [], isBulk: false });
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const itemsPerPage = 15;
    const [updatingId, setUpdatingId] = useState(null);

    const debouncedUpdate = useMemo(() => debounce((newFilters) => {
        setDebouncedFilters(newFilters);
        setCurrentPage(1);
    }, 400), []);

    useEffect(() => { debouncedUpdate(filters); return () => debouncedUpdate.cancel(); }, [filters, debouncedUpdate]);
    useEffect(() => { setCurrentPage(1); }, [sortConfig]);

    const queryParams = useMemo(() => ({
        page: currentPage, limit: itemsPerPage,
        search: debouncedFilters.search, status: debouncedFilters.status,
        domain: debouncedFilters.domain, sortBy: sortConfig.key, sortOrder: sortConfig.direction,
    }), [currentPage, itemsPerPage, debouncedFilters, sortConfig]);

    const { data, isLoading: loading } = useInterviewers(queryParams, { keepPreviousData: true });
    const interviewers = data?.interviewers || [];
    const totalDocs = data?.totalDocs || 0;
    const totalPages = Math.ceil(totalDocs / itemsPerPage);

    useEffect(() => setSelectedRows([]), [interviewers]);

    // Handlers
    const handleStatusChange = async (id, status) => {
        setUpdatingId(id);
        try { await updateInterviewer(id, { status }); showSuccess('Status updated'); invalidateInterviewers(); }
        catch { showError('Update failed'); } finally { setUpdatingId(null); }
    };

    const handleSendWelcomeEmail = async (id) => {
        try {
            await sendWelcomeEmail(id);
            showSuccess('Welcome email sent successfully!');
            invalidateInterviewers();
            if (modalState.data && modalState.data._id === id) {
                setModalState(prev => ({ ...prev, data: { ...prev.data, welcomeEmailSentAt: new Date().toISOString() } }));
            }
        } catch (e) { showError(e.response?.data?.message || 'Failed to send welcome email.'); }
    };

    const handleSendProbationEmail = async (id) => {
        try {
            await sendProbationEmail(id);
            showSuccess('Probation completion email sent successfully!');
            invalidateInterviewers();
            if (modalState.data && modalState.data._id === id) {
                setModalState(prev => ({ ...prev, data: { ...prev.data, probationEmailSentAt: new Date().toISOString() } }));
            }
        } catch (e) { showError(e.response?.data?.message || 'Failed to send probation email.'); }
    };

    const handleMarkProbationAsSent = async (id) => {
        try {
            await markProbationAsSent(id);
            showSuccess('Successfully marked as sent!');
            invalidateInterviewers();
            if (modalState.data && modalState.data._id === id) {
                setModalState(prev => ({ ...prev, data: { ...prev.data, probationEmailSentAt: new Date().toISOString() } }));
            }
        } catch (e) { showError(e.response?.data?.message || 'Failed to update status.'); }
    };

    const handleBulkDelete = async () => {
        try {
            await bulkDeleteInterviewers(deleteDialog.ids);
            showSuccess(`Deleted ${deleteDialog.ids.length} records`);
            setDeleteDialog({ isOpen: false, ids: [], isBulk: false });
            setSelectedRows([]);
            invalidateInterviewers();
        } catch { showError("Delete failed"); }
    };

    const handleUpload = async (uploadData) => {
        setIsUploading(true);
        try {
            const res = await bulkUploadInterviewers(uploadData);
            showSuccess(`Created: ${res.data.data.created}, Failed: ${res.data.data.failedEntries.length}`);
            setIsUploadModalOpen(false);
            invalidateInterviewers();
        } catch { showError("Upload failed"); } finally { setIsUploading(false); }
    };

    const resetFilters = () => setFilters({ search: '', status: '', domain: '' });

    const handleSort = (key) => setSortConfig(p => ({ key, direction: p.key === key && p.direction === 'asc' ? 'desc' : 'asc' }));

    // ── Table columns ──
    const columns = [
        { key: 'select', title: 'select', minWidth: '50px' },
        { key: 'user.firstName', title: 'Interviewer Name', sortable: true, minWidth: '200px' },
        { key: 'user.email', title: 'Email ID', minWidth: '200px' },
        { key: 'user.phoneNumber', title: 'Mobile No', minWidth: '140px' },
        { key: 'user.whatsappNumber', title: 'WhatsApp', minWidth: '140px' },
        { key: 'yearsOfExperience', title: 'Experience', sortable: true, minWidth: '120px' },
        { key: 'paymentAmount', title: 'Payment', minWidth: '120px' },
        { key: 'source', title: 'Source', minWidth: '110px' },
        { key: 'status', title: 'Status', minWidth: '140px' },
    ];

    const renderCell = (col, r) => {
        switch (col.key) {
            case 'select':
                return <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" checked={selectedRows.includes(r._id)} onChange={() => setSelectedRows(p => p.includes(r._id) ? p.filter(id => id !== r._id) : [...p, r._id])} />;
            case 'user.firstName':
                return (
                    <div className="flex flex-col">
                        <button onClick={() => navigate(`/admin/interviewers/${r._id}`)} className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline text-left transition-colors">
                            {r.user.firstName} {r.user.lastName}
                        </button>
                        <span className="text-xs text-slate-500">{r.jobTitle || 'N/A'}</span>
                    </div>
                );
            case 'user.email':
                return <span className="text-slate-600 text-sm">{r.user.email}</span>;
            case 'user.phoneNumber':
                return <div className="flex items-center gap-2 text-slate-600 text-sm"><Phone className="text-slate-400 w-3 h-3" /> {r.user.phoneNumber}</div>;
            case 'user.whatsappNumber':
                return <div className="flex items-center gap-2 text-slate-600 text-sm"><MessageCircle className="text-emerald-500 w-3 h-3" /> {r.user.whatsappNumber || '-'}</div>;
            case 'yearsOfExperience':
                return <span className="text-slate-900 font-medium text-sm">{r.yearsOfExperience} Years</span>;
            case 'paymentAmount': {
                const EditablePayment = () => {
                    const [val, setVal] = useState(String(r.paymentAmount || '').replace(/[^0-9]/g, ''));
                    const [saving, setSaving] = useState(false);
                    const save = async () => {
                        const clean = val.replace(/[^0-9]/g, '');
                        if (clean === String(r.paymentAmount || '').replace(/[^0-9]/g, '')) return;
                        setSaving(true);
                        try { await updateInterviewer(r._id, { paymentAmount: clean }); showSuccess('Payment updated'); invalidateInterviewers(); }
                        catch { showError('Failed to update'); } finally { setSaving(false); }
                    };
                    return (
                        <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                            <input type="text" value={val} onChange={e => setVal(e.target.value.replace(/[^0-9]/g, ''))} onBlur={save} disabled={saving} placeholder="0"
                                className="w-full pl-6 pr-2 py-1.5 text-xs font-semibold text-slate-900 border border-transparent rounded-lg bg-transparent hover:border-slate-200 focus:bg-white focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-blue-400 text-right transition-all" />
                        </div>
                    );
                };
                return <EditablePayment />;
            }
            case 'source': {
                const isInternal = r.source === 'Internal';
                return (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${isInternal ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                        {isInternal ? 'Internal' : 'External'}
                    </span>
                );
            }
            case 'status':
                return (
                    <div className="relative">
                        <select value={r.status} onChange={(e) => handleStatusChange(r._id, e.target.value)} disabled={updatingId === r._id}
                            className={`w-full text-xs font-semibold pl-2 pr-6 py-1.5 rounded-full appearance-none cursor-pointer focus:outline-none border ${
                                r.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                r.status === 'On Probation' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-slate-50 text-slate-600 border-slate-200'
                            }`}>
                            {Object.values(INTERVIEWER_STATUS).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 opacity-50 pointer-events-none" />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-white rounded-xl border border-slate-200">

            {/* Header Bar */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 flex-1">
                        <div className="relative w-full sm:w-56">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input type="text" value={filters.search} onChange={(e) => setFilters(p => ({ ...p, search: e.target.value }))} placeholder="Search by name, email..."
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all" />
                        </div>
                        <div className="relative">
                            <select value={filters.status} onChange={(e) => setFilters(p => ({ ...p, status: e.target.value }))}
                                className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 block py-2 pl-3 pr-8 cursor-pointer hover:border-slate-300 transition-colors">
                                <option value="">All Status</option>
                                {Object.values(INTERVIEWER_STATUS).map(s => (<option key={s} value={s}>{s}</option>))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        </div>
                        <div className="relative">
                            <select value={filters.domain} onChange={(e) => setFilters(p => ({ ...p, domain: e.target.value }))}
                                className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 block py-2 pl-3 pr-8 cursor-pointer hover:border-slate-300 transition-colors">
                                <option value="">All Domains</option>
                                {DOMAINS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        </div>
                        {(filters.search || filters.status || filters.domain) && (
                            <button onClick={resetFilters} className="text-xs text-slate-500 hover:text-slate-900 font-medium px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors">Clear</button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {selectedRows.length > 0 && (
                            <div className="flex items-center gap-2 bg-slate-800 text-white px-3 py-1.5 rounded-lg mr-1">
                                <span className="text-xs font-semibold">{selectedRows.length} selected</span>
                                {selectedRows.length === 1 && (
                                    <button onClick={() => setModalState({ type: 'edit', data: interviewers.find(i => i._id === selectedRows[0]) })} className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors" title="Edit">
                                        <Edit className="w-3.5 h-3.5" />
                                    </button>
                                )}
                                <button onClick={() => setDeleteDialog({ isOpen: true, ids: selectedRows, isBulk: true })} className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors" title="Delete">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}
                        <button onClick={() => setIsUploadModalOpen(true)} className="inline-flex items-center gap-2 px-4 h-10 text-sm font-medium text-slate-700 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors">
                            <Upload className="h-4 w-4" /> Import
                        </button>
                        <button onClick={() => setModalState({ type: 'add', data: null })} className="inline-flex items-center gap-2 px-4 h-10 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
                            <Plus className="h-4 w-4" /> Add Interviewer
                        </button>
                    </div>
                </div>
            </div>

            {/* Table — local inline implementation */}
            <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                {columns.map((col) => (
                                    <th key={col.key} scope="col"
                                        className={`sticky top-0 px-5 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em] whitespace-nowrap border-b border-slate-200 bg-slate-50/90 backdrop-blur-sm z-10 ${col.sortable ? 'cursor-pointer hover:text-slate-900' : ''}`}
                                        style={{ minWidth: col.minWidth }}
                                        onClick={() => col.sortable && handleSort(col.key)}>
                                        <div className="flex items-center gap-1.5">
                                            {col.key === 'select' ? (
                                                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" onChange={(e) => setSelectedRows(e.target.checked ? interviewers.map(i => i._id) : [])} checked={selectedRows.length === interviewers.length && interviewers.length > 0} />
                                            ) : col.title}
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
                            {loading ? (
                                [...Array(8)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {columns.map((col) => (
                                            <td key={col.key} className="px-5 py-3"><div className="h-4 w-full bg-slate-100 rounded" /></td>
                                        ))}
                                    </tr>
                                ))
                            ) : interviewers.length === 0 ? (
                                <tr><td colSpan={columns.length} className="px-6 py-14 text-center text-sm text-slate-400">No interviewers found</td></tr>
                            ) : (
                                interviewers.map((r) => (
                                    <tr key={r._id} className="hover:bg-slate-50/70 transition-colors group">
                                        {columns.map((col) => (
                                            <td key={col.key} className="px-5 py-2.5 whitespace-nowrap text-sm text-slate-700 align-middle">
                                                {renderCell(col, r)}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && totalDocs > 0 && (
                    <div className="px-6 py-3 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
                        <p className="text-xs text-slate-500 font-medium">
                            Page <span className="font-bold text-slate-900">{currentPage}</span> of {totalPages} ({totalDocs} total)
                        </p>
                        <div className="flex items-center gap-1.5">
                            <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}
                                className="h-9 w-9 rounded-md flex items-center justify-center border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}
                                className="h-9 w-9 rounded-md flex items-center justify-center border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <InterviewerFormModal
                isOpen={modalState.type === 'add' || modalState.type === 'edit'}
                onClose={() => setModalState({ type: null, data: null })}
                onSuccess={() => { setModalState({ type: null, data: null }); invalidateInterviewers(); }}
                interviewerData={modalState.type === 'edit' ? modalState.data : null}
            />

            <ViewDetailsModal
                isOpen={modalState.type === 'view'}
                onClose={() => setModalState({ type: null, data: null })}
                data={modalState.data}
                onSendWelcome={handleSendWelcomeEmail}
                onSendProbation={handleSendProbationEmail}
                onMarkProbation={handleMarkProbationAsSent}
            />

            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, ids: [], isBulk: false })}
                onConfirm={handleBulkDelete}
                title="Delete Interviewer"
                message="Are you sure? This action cannot be undone."
            />

            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUploadConfirm={handleUpload}
                isLoading={isUploading}
            />
        </div>
    );
};

export default Interviewers;
