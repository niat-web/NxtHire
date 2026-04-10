// client/src/pages/admin/Interviewers.jsx
import React, { useEffect, useState, useMemo, useRef, Fragment } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import {
    User, Search, Edit, Trash2, Plus, Upload, CheckCircle,
    AlertTriangle, Loader2, X, ChevronLeft, ChevronRight, 
    Users, ChevronDown, Eye, Phone, MessageCircle, Briefcase, CreditCard,
    Send, RefreshCw
} from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';

// Common Components Imports
import Table from '../../components/common/Table';
import {
    updateInterviewer, bulkUploadInterviewers, bulkDeleteInterviewers,
    sendWelcomeEmail, sendProbationEmail, markProbationAsSent
} from '../../api/admin.api';
import { INTERVIEWER_STATUS, DOMAINS } from '../../utils/constants';
import { debounce } from '../../utils/helpers';
import { useInterviewers, useInvalidateAdmin } from '../../hooks/useAdminQueries';
import { formatDateTime } from '../../utils/formatters';
import { useAlert } from '../../hooks/useAlert';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import InterviewerFormModal from './InterviewerFormModal';
import { Button as ShadcnButton } from '@/components/ui/button';

// --- Styled Components ---

const LocalButton = ({ children, onClick, type = 'button', isLoading = false, variant = 'primary', icon: Icon, disabled = false, size = 'md', className = '', title = '' }) => {
    const variantMap = { primary: 'default', accent: 'default', outline: 'outline', danger: 'destructive', text: 'link', icon: 'ghost', ghost: 'ghost' };
    const sizeMap = { xs: 'xs', sm: 'sm', md: 'default', lg: 'lg', icon: 'icon' };
    return (
        <ShadcnButton type={type} onClick={onClick} isLoading={isLoading} disabled={disabled} variant={variantMap[variant] || 'default'} size={sizeMap[size] || 'default'} className={className} title={title}>
            {Icon && <Icon className={`${children ? 'mr-2' : ''} ${size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />}
            {children}
        </ShadcnButton>
    );
};

const CustomSelect = ({ value, onChange, options, placeholder }) => (
    <div className="relative">
        <select
            value={value}
            onChange={onChange}
            className="appearance-none bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 block py-2 pl-3 pr-8 cursor-pointer hover:border-gray-300 transition-colors"
        >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
    </div>
);

// --- View Details Modal ---
const ViewDetailsModal = ({ isOpen, onClose, data, onSendWelcome, onSendProbation, onMarkProbation }) => {
    if (!data) return null;

    const [loadingAction, setLoadingAction] = useState(null); // 'welcome', 'probation', 'mark'

    const handleAction = async (actionFn, actionType) => {
        setLoadingAction(actionType);
        await actionFn(data._id);
        setLoadingAction(null);
    };

    const DetailItem = ({ label, value, icon: Icon }) => (
        <div className="flex flex-col gap-1 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                {Icon && <Icon className="w-3 h-3" />} {label}
            </span>
            <span className="text-sm font-medium text-gray-900 break-words">{value || <span className="text-gray-400 italic">N/A</span>}</span>
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
                            <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-md transition-all flex flex-col max-h-[90vh]">
                                {/* Header */}
                                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg font-semibold">
                                            {data.user?.firstName?.[0]}{data.user?.lastName?.[0]}
                                        </div>
                                        <div>
                                            <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900 leading-tight">
                                                {data.user?.firstName} {data.user?.lastName}
                                            </Dialog.Title>
                                            <p className="text-sm text-gray-500">{data.jobTitle} • <span className={`font-semibold ${data.status === 'Active' ? 'text-green-600' : 'text-amber-600'}`}>{data.status}</span></p>
                                        </div>
                                    </div>
                                    <ShadcnButton variant="ghost" size="icon" onClick={onClose} className="rounded-full"><X className="h-5 w-5 text-gray-500" /></ShadcnButton>
                                </div>

                                {/* Scrollable Content */}
                                <div className="p-6 overflow-y-auto custom-scrollbar">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Contact Info */}
                                        <div className="col-span-1 md:col-span-2"><h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2"><User /> Contact Information</h4></div>
                                        <DetailItem label="Email Address" value={data.user?.email} />
                                        <DetailItem label="Phone Number" value={data.user?.phoneNumber} />
                                        <DetailItem label="WhatsApp" value={data.user?.whatsappNumber} />
                                        <DetailItem label="Onboarded Date" value={data.onboardingDate ? formatDateTime(data.onboardingDate) : 'N/A'} />

                                        {/* Professional Info */}
                                        <div className="col-span-1 md:col-span-2 mt-2"><h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2"><Briefcase /> Professional Details</h4></div>
                                        <DetailItem label="Current Employer" value={data.currentEmployer} />
                                        <DetailItem label="Total Experience" value={`${data.yearsOfExperience} Years`} />
                                        <DetailItem label="Company Type" value={data.companyType} />
                                        <DetailItem label="Domains" value={data.domains?.join(', ')} />
                                        <DetailItem label="Interviewer ID" value={data.interviewerId} />
                                        <DetailItem label="Payout ID" value={data.payoutId} />
                                        <DetailItem label="Interviews Completed" value={data.metrics?.interviewsCompleted || 0} />

                                        {/* Banking Info */}
                                        <div className="col-span-1 md:col-span-2 mt-2"><h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2"><CreditCard /> Bank Details</h4></div>
                                        <DetailItem label="Bank Name" value={data.bankDetails?.bankName} />
                                        <DetailItem label="Account Name" value={data.bankDetails?.accountName} />
                                        <DetailItem label="Account Number" value={data.bankDetails?.accountNumber} />
                                        <DetailItem label="IFSC Code" value={data.bankDetails?.ifscCode} />
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap justify-between items-center gap-3">
                                    <div className="flex gap-2">
                                        {/* Welcome Email Button */}
                                        <LocalButton 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => handleAction(onSendWelcome, 'welcome')}
                                            isLoading={loadingAction === 'welcome'}
                                            icon={data.welcomeEmailSentAt ? RefreshCw : Send}
                                            className={data.welcomeEmailSentAt ? "text-green-600 border-green-200 bg-green-50 hover:bg-green-100" : ""}
                                        >
                                            {data.welcomeEmailSentAt ? "Resend Welcome Mail" : "Send Welcome Mail"}
                                        </LocalButton>

                                        {/* Probation Email Button */}
                                        {showProbationActions && (
                                            <LocalButton 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => handleAction(onSendProbation, 'probation')}
                                                isLoading={loadingAction === 'probation'}
                                                icon={data.probationEmailSentAt ? RefreshCw : Send}
                                                className={data.probationEmailSentAt ? "text-green-600 border-green-200 bg-green-50 hover:bg-green-100" : ""}
                                            >
                                                {data.probationEmailSentAt ? "Resend Probation Mail" : "Send Probation Mail"}
                                            </LocalButton>
                                        )}

                                        {/* Mark Probation Sent Button */}
                                        {showProbationActions && !data.probationEmailSentAt && (
                                            <LocalButton 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => handleAction(onMarkProbation, 'mark')}
                                                isLoading={loadingAction === 'mark'}
                                                icon={CheckCircle}
                                            >
                                                Mark Probation Sent
                                            </LocalButton>
                                        )}
                                    </div>
                                    <LocalButton variant="primary" onClick={onClose}>Close</LocalButton>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

// --- Upload Modal (Minified for brevity) ---
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
            <div className="w-full max-w-lg bg-white rounded-xl shadow-md p-6" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Import Interviewers</h3>
                <div className="space-y-4">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv, .xlsx" className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 cursor-pointer border border-gray-200 rounded-lg p-2" />
                    {error && <p className="text-red-600 text-sm">{error}</p>}
                    <p className="text-xs text-gray-500">Supported files: .csv, .xlsx. Headers: firstName, email, phoneNumber, etc.</p>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <LocalButton variant="outline" onClick={onClose}>Cancel</LocalButton>
                    <LocalButton variant="primary" onClick={() => onUploadConfirm(parsedData)} isLoading={isLoading} disabled={!parsedData.length}>Upload</LocalButton>
                </div>
            </div>
        </div>
    );
};

const Interviewers = () => {
    const { showSuccess, showError } = useAlert();
    const { invalidateInterviewers } = useInvalidateAdmin();
    const [sortConfig, setSortConfig] = useState({ key: 'onboardingDate', direction: 'desc' });
    const [filters, setFilters] = useState({ search: '', status: '', domain: '' });
    const [debouncedFilters, setDebouncedFilters] = useState(filters);
    const [currentPage, setCurrentPage] = useState(1);
    const [modalState, setModalState] = useState({ type: null, data: null }); // 'add', 'edit', 'view'
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, ids: [], isBulk: false });
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const itemsPerPage = 15;
    const [updatingId, setUpdatingId] = useState(null);

    // Debounce filter/sort changes to avoid excessive queries
    const debouncedUpdate = useMemo(() => debounce((newFilters) => {
        setDebouncedFilters(newFilters);
        setCurrentPage(1);
    }, 400), []);

    useEffect(() => { debouncedUpdate(filters); return () => debouncedUpdate.cancel(); }, [filters, debouncedUpdate]);

    // Reset to page 1 when sort changes
    useEffect(() => { setCurrentPage(1); }, [sortConfig]);

    // Memoized query params
    const queryParams = useMemo(() => ({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedFilters.search,
        status: debouncedFilters.status,
        domain: debouncedFilters.domain,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
    }), [currentPage, itemsPerPage, debouncedFilters, sortConfig]);

    // TanStack Query
    const { data, isLoading: loading } = useInterviewers(queryParams, {
        keepPreviousData: true,
    });

    const interviewers = data?.interviewers || [];
    const totalDocs = data?.totalDocs || 0;
    const totalPages = Math.ceil(totalDocs / itemsPerPage);

    useEffect(() => setSelectedRows([]), [interviewers]);

    // Handlers
    const handleStatusChange = async (id, status) => {
        setUpdatingId(id);
        try {
            await updateInterviewer(id, { status });
            showSuccess('Status updated');
            invalidateInterviewers();
        } catch { showError('Update failed'); } finally { setUpdatingId(null); }
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

    // Table Columns Configuration - As per specific requirement
    const columns = useMemo(() => [
        { 
            key: 'select', 
            title: <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900" onChange={(e) => setSelectedRows(e.target.checked ? interviewers.map(i => i._id) : [])} checked={selectedRows.length === interviewers.length && interviewers.length > 0} />, 
            render: (r) => <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900" checked={selectedRows.includes(r._id)} onChange={() => setSelectedRows(p => p.includes(r._id) ? p.filter(id => id !== r._id) : [...p, r._id])} />,
            minWidth: '50px'
        },
        { 
            key: 'user.firstName', 
            title: 'Interviewer Name', 
            sortable: true, 
            minWidth: '200px',
            render: (r) => (
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-xs border border-gray-200">
                        {r.user.firstName?.[0]}{r.user.lastName?.[0]}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 text-sm">{r.user.firstName} {r.user.lastName}</span>
                        <span className="text-xs text-gray-500">{r.jobTitle || 'N/A'}</span>
                    </div>
                </div>
            ) 
        },
        { 
            key: 'user.email', 
            title: 'Email ID', 
            minWidth: '200px', 
            render: (r) => <span className="text-gray-600 text-sm">{r.user.email}</span> 
        },
        { 
            key: 'user.phoneNumber', 
            title: 'Mobile No', 
            minWidth: '140px', 
            render: (r) => <div className="flex items-center gap-2 text-gray-600 text-sm"><Phone className="text-gray-400 w-3 h-3" /> {r.user.phoneNumber}</div> 
        },
        { 
            key: 'user.whatsappNumber', 
            title: 'WhatsApp', 
            minWidth: '140px', 
            render: (r) => <div className="flex items-center gap-2 text-gray-600 text-sm"><MessageCircle className="text-green-500 w-3 h-3" /> {r.user.whatsappNumber || '-'}</div> 
        },
        { 
            key: 'yearsOfExperience', 
            title: 'Experience', 
            sortable: true, 
            minWidth: '120px', 
            render: (r) => <span className="text-gray-900 font-medium text-sm">{r.yearsOfExperience} Years</span> 
        },
        { 
            key: 'status', 
            title: 'Status', 
            minWidth: '140px', 
            render: (r) => (
                <div className="relative">
                    <select 
                        value={r.status} 
                        onChange={(e) => handleStatusChange(r._id, e.target.value)} 
                        disabled={updatingId === r._id}
                        className={`w-full text-xs font-semibold pl-2 pr-6 py-1.5 rounded-full appearance-none cursor-pointer focus:outline-none border ${
                            r.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 
                            r.status === 'On Probation' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                            'bg-gray-50 text-gray-600 border-gray-200'
                        }`}
                    >
                        {Object.values(INTERVIEWER_STATUS).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 opacity-50 pointer-events-none" />
                </div>
            ) 
        },
        {
            key: 'actions',
            title: '',
            minWidth: '60px',
            render: (r) => (
                <ShadcnButton
                    variant="ghost"
                    size="icon"
                    onClick={() => setModalState({ type: 'view', data: r })}
                    className="h-7 w-7 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                    title="View Details"
                >
                    <Eye className="w-4 h-4" />
                </ShadcnButton>
            )
        }
    ], [interviewers, selectedRows, updatingId]);

    return (
        <div className="flex flex-col h-full overflow-hidden">

            {/* Header Bar */}
            <div className="bg-white border-b border-gray-200 px-5 py-3 flex-shrink-0">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 flex-1">
                        <div className="relative w-full sm:w-56">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => setFilters(p => ({ ...p, search: e.target.value }))}
                                placeholder="Search by name, email..."
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                            />
                        </div>
                        <CustomSelect
                            value={filters.status}
                            onChange={(e) => setFilters(p => ({ ...p, status: e.target.value }))}
                            options={Object.values(INTERVIEWER_STATUS).map(s => ({ value: s, label: s }))}
                            placeholder="All Status"
                        />
                        <CustomSelect
                            value={filters.domain}
                            onChange={(e) => setFilters(p => ({ ...p, domain: e.target.value }))}
                            options={DOMAINS}
                            placeholder="All Domains"
                        />
                        {(filters.search || filters.status || filters.domain) && (
                            <ShadcnButton variant="ghost" size="sm" onClick={resetFilters} className="text-xs text-gray-500 hover:text-gray-900 font-medium px-2">Clear</ShadcnButton>
                        )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {selectedRows.length > 0 && (
                            <div className="flex items-center gap-2 bg-slate-800 text-white px-3 py-1.5 rounded-lg shadow mr-1">
                                <span className="text-xs font-semibold">{selectedRows.length} selected</span>
                                {selectedRows.length === 1 && (
                                    <ShadcnButton variant="ghost" size="icon" onClick={() => setModalState({ type: 'edit', data: interviewers.find(i => i._id === selectedRows[0]) })} className="h-7 w-7 hover:bg-slate-700 text-white" title="Edit">
                                        <Edit className="w-3.5 h-3.5" />
                                    </ShadcnButton>
                                )}
                                <ShadcnButton variant="ghost" size="icon" onClick={() => setDeleteDialog({ isOpen: true, ids: selectedRows, isBulk: true })} className="h-7 w-7 hover:bg-slate-700 text-white" title="Delete">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </ShadcnButton>
                            </div>
                        )}
                        <LocalButton variant="outline" icon={Upload} onClick={() => setIsUploadModalOpen(true)}>Import</LocalButton>
                        <LocalButton variant="primary" icon={Plus} onClick={() => setModalState({ type: 'add', data: null })}>Add Interviewer</LocalButton>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-auto">
                        <Table 
                            columns={columns} 
                            data={interviewers} 
                            isLoading={loading} 
                            sortConfig={sortConfig} 
                            onSort={(key) => setSortConfig(p => ({ key, direction: p.key === key && p.direction === 'asc' ? 'desc' : 'asc' }))} 
                            emptyMessage="No interviewers found" 
                        />
                    </div>
                    
                {/* Pagination */}
                {!loading && totalDocs > 0 && (
                    <div className="px-5 py-3 border-t border-gray-200 bg-white flex items-center justify-between shrink-0">
                        <p className="text-xs text-gray-500">
                            Page <b className="text-gray-900">{currentPage}</b> of {totalPages} ({totalDocs} total)
                        </p>
                        <div className="flex items-center gap-1.5">
                            <ShadcnButton variant="outline" size="icon" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}
                                className="h-8 w-8 disabled:opacity-30">
                                <ChevronLeft className="w-4 h-4" />
                            </ShadcnButton>
                            <ShadcnButton variant="outline" size="icon" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}
                                className="h-8 w-8 disabled:opacity-30">
                                <ChevronRight className="w-4 h-4" />
                            </ShadcnButton>
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
