// client/src/pages/admin/Guidelines.jsx
import React, { useState, useEffect, useMemo, Fragment } from 'react';
import { Eye, Search, Check, X, CheckCircle, XCircle, MoreVertical, ChevronDown, ChevronLeft, ChevronRight, ArrowLeft, Clock, FileText, Mail } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { reviewGuidelinesSubmission } from '../../api/admin.api';
import { formatDateTime } from '../../utils/formatters';
import { APPLICATION_STATUS } from '../../utils/constants';
import { debounce } from '../../utils/helpers';
import { useAlert } from '../../hooks/useAlert';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useGuidelinesSubmissions, useInvalidateAdmin, useDomainOptions } from '../../hooks/useAdminQueries';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

const InlineBadge = ({ variant = 'primary', children }) => {
    const colorMap = {
        primary: 'bg-blue-50 text-blue-700 border-blue-100',
        success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        danger: 'bg-red-50 text-red-700 border-red-100',
        warning: 'bg-amber-50 text-amber-700 border-amber-100',
        info: 'bg-sky-50 text-sky-700 border-sky-100',
    };
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide border ${colorMap[variant] || colorMap.primary}`}>
            {children}
        </span>
    );
};

// Questions data for displaying question text in detail view
const QUESTIONS_MAP = {
    1: "Why is it important to review the candidate's resume before the interview?",
    2: "Why is it important to understand the objective of an interview?",
    3: "Why is it important to prepare a set of questions before the interview?",
    4: "What steps should you take to test the technology before the interview?",
    5: "What are the key considerations for setting up your environment for the interview?",
    6: "How should you start the interview?",
    7: "Why is it important to ask the candidate for a self-introduction?",
    8: "How do you assess the candidate's technical skills?",
    9: "What are key aspects of maintaining professionalism during the interview?",
    10: "How do you handle a situation where a candidate gives an incorrect answer?",
    11: "Why is it important to give the candidate a chance to ask questions at the end?",
    12: "What should you include in the candidate evaluation report?",
    13: "Why is it important to be punctual for the interview?",
    14: "What should you do if you experience technical issues during the interview?",
    15: "How do you ensure fair and unbiased evaluation?",
    16: "What is the significance of providing constructive feedback?",
    17: "Why is maintaining confidentiality important in the interview process?",
};

// ── DETAIL VIEW (shown inline — full page, no gaps) ──
const GuidelinesDetailView = ({ guideline, onBack }) => {
    const applicant = guideline.applicant || {};
    const answers = guideline.answers || [];
    const correctCount = answers.filter(a => a.isCorrect).length;

    return (
        <div className="h-full flex flex-col overflow-hidden bg-white">
            {/* Top bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={onBack}
                        className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                        <ArrowLeft size={15} />
                    </button>
                    <div>
                        <h1 className="text-sm font-semibold text-slate-900">{applicant.fullName || 'Unknown'}</h1>
                        <p className="text-[11px] text-slate-400">{applicant.email || '—'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-5 text-[12px]">
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Score</p>
                            <p className="text-lg font-bold text-slate-900">{guideline.score}%</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Correct</p>
                            <p className="text-lg font-bold text-slate-900">{correctCount}/{answers.length}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Time</p>
                            <p className="text-lg font-bold text-slate-900">{guideline.completionTime}s</p>
                        </div>
                    </div>
                    <InlineBadge variant={guideline.passed ? 'success' : 'danger'}>
                        {guideline.passed ? 'Passed' : 'Failed'}
                    </InlineBadge>
                </div>
            </div>

            {/* Answers table — full page */}
            <div className="flex-1 overflow-y-auto">
                <table className="min-w-full">
                    <thead>
                        <tr>
                            <th className="sticky top-0 w-12 px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] bg-slate-50 border-b border-slate-200 z-10">#</th>
                            <th className="sticky top-0 px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] bg-slate-50 border-b border-slate-200 z-10">Question</th>
                            <th className="sticky top-0 px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] bg-slate-50 border-b border-slate-200 z-10">Selected Option</th>
                            <th className="sticky top-0 w-20 px-4 py-2.5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] bg-slate-50 border-b border-slate-200 z-10">Correct</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {answers.map((answer) => (
                            <tr key={answer.questionNumber} className="hover:bg-slate-50/60 transition-colors">
                                <td className="px-4 py-3 text-[13px] font-semibold text-slate-900 align-top">{answer.questionNumber}</td>
                                <td className="px-4 py-3 text-[13px] text-slate-500 align-top max-w-xs">
                                    {QUESTIONS_MAP[answer.questionNumber] || `Question ${answer.questionNumber}`}
                                </td>
                                <td className="px-4 py-3 text-[13px] text-slate-800 font-medium align-top">{answer.selectedOption}</td>
                                <td className="px-4 py-3 text-center align-top">
                                    {answer.isCorrect
                                        ? <CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" />
                                        : <XCircle className="h-5 w-5 text-red-400 mx-auto" />
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ── MAIN LIST VIEW ──
const Guidelines = () => {
    const DOMAINS = useDomainOptions();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [domainFilter, setDomainFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const { showSuccess, showError } = useAlert();
    const [confirmState, setConfirmState] = useState({ isOpen: false, id: null, action: null });
    const [processingIds, setProcessingIds] = useState(new Set());
    const [selectedGuideline, setSelectedGuideline] = useState(null); // detail view state
    const { invalidateGuidelines, invalidateDashboard } = useInvalidateAdmin();

    const debouncedUpdate = useMemo(() => debounce((value) => {
        setDebouncedSearch(value);
        setCurrentPage(1);
    }, 300), []);

    useEffect(() => { debouncedUpdate(searchTerm); return () => debouncedUpdate.cancel(); }, [searchTerm, debouncedUpdate]);
    useEffect(() => { setCurrentPage(1); }, [statusFilter, domainFilter]);

    const queryParams = useMemo(() => ({
        page: currentPage, limit: 10, search: debouncedSearch, status: statusFilter,
        domain: domainFilter, sortBy: 'createdAt', sortOrder: 'desc',
    }), [currentPage, debouncedSearch, statusFilter, domainFilter]);

    const { data, isLoading: loading } = useGuidelinesSubmissions(queryParams, { keepPreviousData: true });

    const guidelinesData = data?.guidelines || [];
    const pagination = {
        currentPage: data?.currentPage || 1,
        totalPages: data?.totalPages || 1,
        totalItems: data?.totalItems || 0,
    };

    const statusOptions = [
        { value: '', label: 'All Test Results' },
        { value: 'passed', label: 'Passed' },
        { value: 'failed', label: 'Failed' },
    ];

    const domainOptions = [
        { value: '', label: 'All Domains' },
        ...DOMAINS.map(d => ({ value: d.value, label: d.label })),
    ];

    const handleReviewDecision = async (e) => {
        if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
        const { id, action } = confirmState;
        if (!id || !action) return;
        setProcessingIds(prev => new Set(prev).add(id));
        setConfirmState({ isOpen: false, id: null, action: null });
        try {
            await reviewGuidelinesSubmission(id, { decision: action });
            showSuccess(`Submission successfully ${action === 'approve' ? 'approved and applicant onboarded' : 'rejected'}.`);
            invalidateGuidelines();
            invalidateDashboard();
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to process decision.');
        } finally {
            setProcessingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
        }
    };

    // ── If a guideline is selected, show the detail view ──
    if (selectedGuideline) {
        return <GuidelinesDetailView guideline={selectedGuideline} onBack={() => setSelectedGuideline(null)} />;
    }

    const showingFrom = pagination.totalItems > 0 ? ((pagination.currentPage - 1) * 10) + 1 : 0;
    const showingTo = Math.min((pagination.currentPage * 10), pagination.totalItems);

    return (
        <div className="h-full flex flex-col overflow-hidden bg-white">
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Filter bar */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-3 border-b border-slate-200 shrink-0">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name..."
                            className="w-full pl-9 pr-9 h-9 bg-slate-50 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all" />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                    <div className="flex gap-2 items-center">
                        <div className="relative">
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                                className="appearance-none bg-white border border-slate-200 text-slate-700 text-[13px] rounded-lg h-9 pl-3 pr-8 cursor-pointer hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors">
                                {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                        </div>
                        <div className="relative">
                            <select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)}
                                className="appearance-none bg-white border border-slate-200 text-slate-700 text-[13px] rounded-lg h-9 pl-3 pr-8 cursor-pointer hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors">
                                {domainOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <th className="sticky top-0 px-5 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] border-b border-slate-100 bg-slate-50/80 z-10">Applicant</th>
                                <th className="sticky top-0 px-5 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] border-b border-slate-100 bg-slate-50/80 z-10">Domain(s)</th>
                                <th className="sticky top-0 px-5 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] border-b border-slate-100 bg-slate-50/80 z-10">Score</th>
                                <th className="sticky top-0 px-5 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] border-b border-slate-100 bg-slate-50/80 z-10">Result</th>
                                <th className="sticky top-0 px-5 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] border-b border-slate-100 bg-slate-50/80 z-10">Status</th>
                                <th className="sticky top-0 px-5 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] border-b border-slate-100 bg-slate-50/80 z-10" style={{minWidth:'180px'}}>Submitted</th>
                                <th className="sticky top-0 px-5 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] border-b border-slate-100 bg-slate-50/80 z-10">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                [...Array(6)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {[...Array(7)].map((_, j) => <td key={j} className="px-5 py-3"><div className="h-3.5 w-3/4 bg-slate-100 rounded" /></td>)}
                                    </tr>
                                ))
                            ) : guidelinesData.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-14 text-center text-[13px] text-slate-400">No guidelines submissions found.</td></tr>
                            ) : (
                                guidelinesData.map((row) => {
                                    const isProcessing = processingIds.has(row._id);
                                    const isActionable = row.applicantStatus === APPLICATION_STATUS.GUIDELINES_REVIEWED;
                                    return (
                                        <tr key={row._id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-5 py-2.5">
                                                <button onClick={() => setSelectedGuideline(row)} className="text-[13px] font-medium text-blue-600 hover:text-blue-800 hover:underline">
                                                    {row.applicant.fullName}
                                                </button>
                                            </td>
                                            <td className="px-5 py-2.5">
                                                <div className="flex flex-wrap gap-1">
                                                    {(row.domains?.length > 0) ? row.domains.map((d, i) => <InlineBadge key={i} variant="primary">{d}</InlineBadge>) : <span className="text-slate-400 text-xs">N/A</span>}
                                                </div>
                                            </td>
                                            <td className="px-5 py-2.5 text-[13px] font-semibold text-slate-900">{row.score}%</td>
                                            <td className="px-5 py-2.5"><InlineBadge variant={row.passed ? 'success' : 'danger'}>{row.passed ? 'Passed' : 'Failed'}</InlineBadge></td>
                                            <td className="px-5 py-2.5">
                                                <InlineBadge variant={row.applicantStatus === APPLICATION_STATUS.GUIDELINES_REVIEWED ? 'warning' : 'info'}>
                                                    {row.applicantStatus === APPLICATION_STATUS.GUIDELINES_REVIEWED ? 'Pending' : row.applicantStatus}
                                                </InlineBadge>
                                            </td>
                                            <td className="px-5 py-2.5 text-[12px] text-slate-500">{formatDateTime(row.createdAt)}</td>
                                            <td className="px-5 py-2.5">
                                                <Menu as="div" className="relative inline-block text-left">
                                                    <Menu.Button className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Menu.Button>
                                                    <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                                        <Menu.Items className="absolute right-0 z-50 mt-1 w-48 rounded-xl bg-white shadow-xl border border-slate-200 py-1 focus:outline-none">
                                                            <Menu.Item>
                                                                {({ active }) => (<button onClick={() => setSelectedGuideline(row)} className={classNames(active ? 'bg-slate-50' : '', 'flex items-center gap-2 w-full px-3 py-2 text-[13px] text-slate-700')}><Eye className="h-4 w-4 text-slate-400" /> View Scores</button>)}
                                                            </Menu.Item>
                                                            {isActionable && (
                                                                <>
                                                                    <Menu.Item disabled={isProcessing}>
                                                                        {({ active, disabled }) => (<button onClick={() => setConfirmState({ isOpen: true, id: row._id, action: 'approve' })} disabled={disabled} className={classNames(active ? 'bg-slate-50' : '', disabled ? 'opacity-40' : '', 'flex items-center gap-2 w-full px-3 py-2 text-[13px] text-slate-700')}><CheckCircle className="h-4 w-4 text-emerald-500" /> Approve & Onboard</button>)}
                                                                    </Menu.Item>
                                                                    <Menu.Item disabled={isProcessing}>
                                                                        {({ active, disabled }) => (<button onClick={() => setConfirmState({ isOpen: true, id: row._id, action: 'reject' })} disabled={disabled} className={classNames(active ? 'bg-red-50' : '', disabled ? 'opacity-40' : '', 'flex items-center gap-2 w-full px-3 py-2 text-[13px] text-red-600')}><XCircle className="h-4 w-4 text-red-400" /> Reject</button>)}
                                                                    </Menu.Item>
                                                                </>
                                                            )}
                                                        </Menu.Items>
                                                    </Transition>
                                                </Menu>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalItems > 10 && (
                    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-2.5 shrink-0">
                        <p className="text-[11px] text-slate-400">Showing {showingFrom}–{showingTo} of {pagination.totalItems}</p>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setCurrentPage(p => p - 1)} disabled={pagination.currentPage <= 1}
                                className="h-7 w-7 rounded-md flex items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-colors">
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[11px] text-slate-500 px-2">Page {pagination.currentPage} of {pagination.totalPages}</span>
                            <button onClick={() => setCurrentPage(p => p + 1)} disabled={pagination.currentPage >= pagination.totalPages}
                                className="h-7 w-7 rounded-md flex items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-colors">
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={confirmState.isOpen}
                onClose={() => setConfirmState({ isOpen: false, id: null, action: null })}
                onConfirm={(e) => handleReviewDecision(e)}
                title={`Confirm ${confirmState.action}`}
                message={`Are you sure you want to ${confirmState.action} this submission? This action cannot be undone.`}
                confirmText={confirmState.action === 'approve' ? 'Approve & Onboard' : 'Confirm Rejection'}
                confirmVariant={confirmState.action === 'approve' ? 'primary' : 'danger'}
                icon={confirmState.action === 'approve' ? <Check className="h-6 w-6 text-green-600"/> : <X className="h-6 w-6 text-red-600"/>}
                isLoading={processingIds.has(confirmState.id)}
            />
        </div>
    );
};

export default Guidelines;
