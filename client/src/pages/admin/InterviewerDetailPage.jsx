import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Mail, Phone, MessageCircle, Briefcase, Building2,
  Calendar, CreditCard, Hash, Send, Check, Edit, Trash2,
  Loader2, Shield, Clock, Star, ChevronDown, ExternalLink,
} from 'lucide-react';
import { useInterviewerDetails, useInvalidateAdmin } from '../../hooks/useAdminQueries';
import { updateInterviewer, deleteInterviewer, sendWelcomeEmail, sendProbationEmail, markProbationAsSent } from '../../api/admin.api';
import { formatDateTime } from '../../utils/formatters';
import { INTERVIEWER_STATUS } from '../../utils/constants';
import { useAlert } from '../../hooks/useAlert';
import Loader from '../../components/common/Loader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import InterviewerFormModal from './InterviewerFormModal';

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const InfoField = ({ label, value, icon: Icon }) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
    {Icon && (
      <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
    )}
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] mb-0.5">{label}</p>
      <p className="text-sm font-medium text-slate-900 break-all">{value || <span className="text-slate-300 italic">Not set</span>}</p>
    </div>
  </div>
);

const SectionCard = ({ title, children, className = '' }) => (
  <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
    <div className="px-6 py-4 border-b border-slate-100">
      <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
    </div>
    <div className="px-6 py-4">{children}</div>
  </div>
);

const InterviewerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const { invalidateInterviewers } = useInvalidateAdmin();

  const { data: interviewer, isLoading, error } = useInterviewerDetails(id);

  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader size="xl" />
      </div>
    );
  }

  if (error || !interviewer) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
        <div className="w-14 h-14 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center">
          <Shield className="h-6 w-6 text-rose-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Interviewer not found</h2>
        <p className="text-sm text-slate-500">The record may have been deleted or the ID is invalid.</p>
        <button onClick={() => navigate('/admin/interviewers')} className="text-sm font-semibold text-blue-600 hover:text-blue-800">
          <ArrowLeft className="inline h-4 w-4 mr-1" /> Back to Interviewers
        </button>
      </div>
    );
  }

  const user = interviewer.user || {};
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  const showProbationActions = (interviewer.status === 'On Probation' || interviewer.status === 'Active') && (interviewer.metrics?.interviewsCompleted >= 5);

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await updateInterviewer(id, { status: newStatus });
      showSuccess('Status updated');
      invalidateInterviewers();
    } catch { showError('Failed to update status'); }
    finally { setUpdatingStatus(false); }
  };

  const handleAction = async (type) => {
    setActionLoading(type);
    try {
      if (type === 'welcome') { await sendWelcomeEmail(id); showSuccess('Welcome email sent.'); }
      if (type === 'probation') { await sendProbationEmail(id); showSuccess('Probation email sent.'); }
      if (type === 'markProbation') { await markProbationAsSent(id); showSuccess('Marked as sent.'); }
      invalidateInterviewers();
    } catch (e) { showError(e.response?.data?.message || 'Action failed.'); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async () => {
    try {
      await deleteInterviewer(id);
      showSuccess('Interviewer deleted.');
      navigate('/admin/interviewers');
    } catch { showError('Failed to delete.'); }
  };

  const statusColors = {
    'Active': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'On Probation': 'bg-amber-50 text-amber-700 border-amber-200',
    'Inactive': 'bg-slate-100 text-slate-600 border-slate-200',
    'Suspended': 'bg-rose-50 text-rose-700 border-rose-200',
    'Terminated': 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50">
      <div className="px-6 py-5 space-y-5 max-w-6xl mx-auto w-full">

        {/* Back + Actions bar */}
        <motion.div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" initial="hidden" animate="visible" variants={fadeUp}>
          <button
            onClick={() => navigate('/admin/interviewers')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Interviewers
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditModalOpen(true)}
              className="h-9 inline-flex items-center gap-2 px-4 text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Edit className="h-3.5 w-3.5" /> Edit
            </button>
            <button
              onClick={() => setDeleteDialog(true)}
              className="h-9 inline-flex items-center gap-2 px-4 text-sm font-semibold rounded-xl border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        </motion.div>

        {/* Header card */}
        <motion.div
          className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-white via-white to-emerald-50/30 shadow-sm p-6 lg:p-7"
          initial="hidden" animate="visible" variants={fadeUp}
        >
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{fullName}</h1>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${statusColors[interviewer.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                  {interviewer.status}
                </span>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                  interviewer.source === 'Internal' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                }`}>
                  {interviewer.source || 'External'}
                </span>
              </div>
              <p className="text-sm text-slate-500">{interviewer.jobTitle || 'N/A'} at {interviewer.currentEmployer || 'N/A'}</p>
              <p className="text-xs text-slate-400 mt-1">ID: {interviewer.interviewerId} &middot; Onboarded {interviewer.onboardingDate ? formatDateTime(interviewer.onboardingDate) : 'N/A'}</p>
            </div>

            {/* Status change */}
            <div className="relative shrink-0">
              <select
                value={interviewer.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updatingStatus}
                className={`text-xs font-semibold pl-3 pr-7 py-2 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-100 border transition-colors ${statusColors[interviewer.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}
              >
                {Object.values(INTERVIEWER_STATUS).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </motion.div>

        {/* Content grid */}
        <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-5" initial="hidden" animate="visible" variants={fadeUp}>

          {/* Left column */}
          <div className="lg:col-span-2 space-y-5">
            <SectionCard title="Contact Information">
              <InfoField label="Email Address" value={user.email} icon={Mail} />
              <InfoField label="Phone Number" value={user.phoneNumber} icon={Phone} />
              <InfoField label="WhatsApp" value={user.whatsappNumber || user.phoneNumber} icon={MessageCircle} />
            </SectionCard>

            <SectionCard title="Professional Details">
              <InfoField label="Current Employer" value={interviewer.currentEmployer} icon={Building2} />
              <InfoField label="Job Title" value={interviewer.jobTitle} icon={Briefcase} />
              <InfoField label="Years of Experience" value={interviewer.yearsOfExperience ? `${interviewer.yearsOfExperience} Years` : null} icon={Clock} />
              <InfoField label="Company Type" value={interviewer.companyType} icon={Star} />
              <InfoField
                label="Domains"
                value={interviewer.domains?.length ? (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {interviewer.domains.map(d => (
                      <span key={d} className="inline-flex px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                        {d}
                      </span>
                    ))}
                  </div>
                ) : null}
                icon={Hash}
              />
            </SectionCard>

            <SectionCard title="Bank Details">
              <InfoField label="Bank Name" value={interviewer.bankDetails?.bankName} icon={CreditCard} />
              <InfoField label="Account Name" value={interviewer.bankDetails?.accountName} icon={CreditCard} />
              <InfoField label="Account Number" value={interviewer.bankDetails?.accountNumber} icon={Hash} />
              <InfoField label="IFSC Code" value={interviewer.bankDetails?.ifscCode} icon={Hash} />
            </SectionCard>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            <SectionCard title="Metrics & IDs">
              <InfoField label="Interviewer ID" value={interviewer.interviewerId} icon={Hash} />
              <InfoField label="Payout ID" value={interviewer.payoutId} icon={CreditCard} />
              <InfoField label="Payment / Interview" value={interviewer.paymentAmount ? `₹${String(interviewer.paymentAmount).replace(/[^0-9]/g, '')}` : null} icon={Star} />
              <InfoField label="Interviews Completed" value={interviewer.metrics?.interviewsCompleted ?? 0} icon={Check} />
              <InfoField label="Onboarding Date" value={interviewer.onboardingDate ? formatDateTime(interviewer.onboardingDate) : null} icon={Calendar} />
            </SectionCard>

            <SectionCard title="Email Actions">
              <div className="space-y-2.5">
                <button
                  onClick={() => handleAction('welcome')}
                  disabled={actionLoading === 'welcome'}
                  className="w-full h-10 inline-flex items-center justify-center gap-2 text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-lg transition-all disabled:opacity-50"
                >
                  {actionLoading === 'welcome' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {interviewer.welcomeEmailSentAt ? 'Resend Welcome Email' : 'Send Welcome Email'}
                </button>
                {interviewer.welcomeEmailSentAt && (
                  <p className="text-[10px] text-slate-400 text-center">Sent {formatDateTime(interviewer.welcomeEmailSentAt)}</p>
                )}

                {showProbationActions && (
                  <>
                    <button
                      onClick={() => handleAction('probation')}
                      disabled={actionLoading === 'probation'}
                      className="w-full h-10 inline-flex items-center justify-center gap-2 text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === 'probation' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                      {interviewer.probationEmailSentAt ? 'Resend Probation Email' : 'Send Probation Email'}
                    </button>
                    {!interviewer.probationEmailSentAt && (
                      <button
                        onClick={() => handleAction('markProbation')}
                        disabled={actionLoading === 'markProbation'}
                        className="w-full h-10 inline-flex items-center justify-center gap-2 text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === 'markProbation' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        Mark Probation Sent
                      </button>
                    )}
                    {interviewer.probationEmailSentAt && (
                      <p className="text-[10px] text-slate-400 text-center">Sent {formatDateTime(interviewer.probationEmailSentAt)}</p>
                    )}
                  </>
                )}
              </div>
            </SectionCard>
          </div>
        </motion.div>
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <InterviewerFormModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSuccess={() => { setEditModalOpen(false); invalidateInterviewers(); }}
          interviewerData={interviewer}
        />
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Interviewer"
        message={`Permanently delete "${fullName}" and their user account? This cannot be undone.`}
        confirmVariant="danger"
      />
    </div>
  );
};

export default InterviewerDetailPage;
