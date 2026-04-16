// client/src/components/admin/ApplicantDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, User, FileText, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Loader from '../../components/common/Loader';
import StatusUpdateModal from '../../components/admin/StatusUpdateModal';
import { getApplicantDetails, updateApplicantStatus } from '../../api/admin.api';
import { useAlert } from '../../hooks/useAlert';
import { formatDate, formatDateTime } from '../../utils/formatters';

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
    'Active': 'bg-emerald-50 text-emerald-700',
    'On Probation': 'bg-amber-50 text-amber-700',
    'Inactive': 'bg-slate-100 text-slate-600',
    'Suspended': 'bg-red-50 text-red-700',
};

const InlineStatusBadge = ({ status }) => (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${statusColors[status] || 'bg-slate-100 text-slate-600'}`}>
        {status}
    </span>
);

// ── Inline panel ──
const Panel = ({ title, children }) => (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {title && (
            <div className="px-6 py-4 border-b border-slate-100">
                <div className="text-sm font-semibold text-slate-900">{title}</div>
            </div>
        )}
        <div className="px-6 py-5">{children}</div>
    </div>
);

// ── Inline detail field ──
const Field = ({ label, children }) => (
    <div>
        <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{label}</h4>
        <div className="mt-1 text-sm text-slate-900">{children || <span className="text-slate-300">—</span>}</div>
    </div>
);

const ApplicantDetails = () => {
  const { id } = useParams();
  const { showSuccess, showError } = useAlert();
  const [loading, setLoading] = useState(true);
  const [applicant, setApplicant] = useState(null);
  const [skillAssessment, setSkillAssessment] = useState(null);
  const [interviewer, setInterviewer] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  useEffect(() => {
    const fetchApplicantDetails = async () => {
      setLoading(true);
      try {
        const response = await getApplicantDetails(id);
        setApplicant(response.data.applicant);
        setSkillAssessment(response.data.skillAssessment);
        setInterviewer(response.data.interviewer);
      } catch (error) {
        console.error('Error fetching applicant details:', error);
        showError('Failed to load applicant details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchApplicantDetails();
  }, [id, showError]);

  const handleStatusUpdate = async (data) => {
    try {
      await updateApplicantStatus(id, data);
      setApplicant(prev => ({
        ...prev,
        status: data.status,
        statusHistory: [
          ...prev.statusHistory,
          { status: data.status, timestamp: new Date().toISOString(), notes: data.notes }
        ]
      }));
      showSuccess('Status updated successfully!');
      setIsStatusModalOpen(false);
    } catch (error) {
      console.error('Error updating status:', error);
      showError('Failed to update status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" text="Loading applicant details..." />
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Applicant not found</p>
        <Link to="/admin/applicants" className="inline-flex items-center mt-4 px-4 h-10 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
          Back to Applicants
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link to="/admin/hiring/applicants" className="w-9 h-9 rounded-lg flex items-center justify-center border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <h1 className="text-lg font-semibold text-slate-900">Applicant Details</h1>
        </div>
        <button onClick={() => setIsStatusModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 h-10 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
          <Edit size={16} /> Update Status
        </button>
      </div>

      {/* Basic Information */}
      <Panel title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><User size={16} className="text-blue-600" /> Basic Information</div>
          <InlineStatusBadge status={applicant.status} />
        </div>
      }>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Full Name">{applicant.fullName}</Field>
          <Field label="Email">{applicant.email}</Field>
          <Field label="Phone Number">{applicant.phoneNumber}</Field>
          <Field label="WhatsApp Number">{applicant.whatsappNumber || 'Same as phone number'}</Field>
          <Field label="Applied On">{formatDateTime(applicant.createdAt)}</Field>
          <Field label="Last Updated">{formatDateTime(applicant.updatedAt)}</Field>
        </div>

        <div className="mt-5">
          <Field label="LinkedIn Profile">
            {applicant.linkedinProfileUrl && (
              <a href={applicant.linkedinProfileUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800">
                <span className="underline">{applicant.linkedinProfileUrl}</span>
                <ExternalLink size={14} />
              </a>
            )}
          </Field>
        </div>

        {applicant.additionalComments && (
          <div className="mt-5"><Field label="Additional Comments"><p className="whitespace-pre-line text-sm text-slate-700">{applicant.additionalComments}</p></Field></div>
        )}
        {applicant.reviewNotes && (
          <div className="mt-5"><Field label="Review Notes"><p className="whitespace-pre-line text-sm text-slate-700">{applicant.reviewNotes}</p></Field></div>
        )}
      </Panel>

      {/* Status History */}
      <Panel title="Status History">
        <div className="flow-root">
          <ul className="-mb-8">
            {applicant.statusHistory.map((statusItem, index) => (
              <li key={index}>
                <div className="relative pb-8">
                  {index !== applicant.statusHistory.length - 1 && (
                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                  )}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center ring-8 ring-white">
                        <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-slate-900">
                          Status changed to <span className="font-semibold">{statusItem.status}</span>
                          {statusItem.notes && <span className="text-slate-500"> — {statusItem.notes}</span>}
                        </p>
                      </div>
                      <div className="text-right text-xs whitespace-nowrap text-slate-500 font-medium">
                        {formatDateTime(statusItem.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Panel>

      {/* Skill Assessment */}
      {skillAssessment && (
        <Panel title={<div className="flex items-center gap-2"><FileText size={16} className="text-blue-600" /> Skill Assessment</div>}>
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Field label="Current Employer">{skillAssessment.currentEmployer}</Field>
              <Field label="Job Title">{skillAssessment.jobTitle}</Field>
              <Field label="Years of Experience">{skillAssessment.yearsOfExperience}</Field>
              <Field label="Domain">
                <Badge variant="default">{skillAssessment.domain}</Badge>
                {skillAssessment.autoCategorizedDomain !== skillAssessment.domain && (
                  <p className="mt-1 text-xs text-slate-400">Auto-categorized: {skillAssessment.autoCategorizedDomain}</p>
                )}
              </Field>
              <Field label="Status">{skillAssessment.status}</Field>
              <Field label="Submitted On">{formatDateTime(skillAssessment.createdAt)}</Field>
            </div>

            <div>
              <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-3">Technical Skills</h4>
              <div className="space-y-3">
                {skillAssessment.technicalSkills.map((skill, index) => (
                  <div key={index} className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-semibold text-slate-900">{skill.skill}</h4>
                      <Badge variant={skill.proficiencyLevel === 'Expert' ? 'purple' : skill.proficiencyLevel === 'Advanced' ? 'success' : skill.proficiencyLevel === 'Intermediate' ? 'info' : 'gray'}>
                        {skill.proficiencyLevel}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{skill.yearsOfExperience} {skill.yearsOfExperience === 1 ? 'year' : 'years'} of experience</p>
                  </div>
                ))}
              </div>
            </div>

            {skillAssessment.additionalNotes && (
              <Field label="Additional Notes"><p className="whitespace-pre-line text-sm text-slate-700">{skillAssessment.additionalNotes}</p></Field>
            )}
          </div>
        </Panel>
      )}

      {/* Interviewer Information */}
      {interviewer && (
        <Panel title={<div className="flex items-center gap-2"><User size={16} className="text-blue-600" /> Interviewer Information</div>}>
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Name">{interviewer.user?.firstName} {interviewer.user?.lastName}</Field>
              <Field label="Email">{interviewer.user?.email}</Field>
              <Field label="Status"><InlineStatusBadge status={interviewer.status} /></Field>
              <Field label="Payment Tier"><Badge variant="default">{interviewer.paymentTier}</Badge></Field>
              <Field label="Primary Domain">{interviewer.primaryDomain}</Field>
              <Field label="Onboarding Date">{formatDate(interviewer.onboardingDate)}</Field>
            </div>

            <div>
              <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-3">Metrics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Interviews Completed', value: interviewer.metrics?.interviewsCompleted || 0 },
                  { label: 'Average Rating', value: (interviewer.metrics?.averageRating || 0).toFixed(1) },
                  { label: 'Completion Rate', value: `${(interviewer.metrics?.completionRate || 0).toFixed(1)}%` },
                  { label: 'Profile Completeness', value: `${interviewer.profileCompleteness || 0}%` },
                ].map((m) => (
                  <div key={m.label} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{m.label}</p>
                    <p className="text-lg font-bold text-slate-900 mt-0.5">{m.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Link to={`/admin/interviewers/${interviewer._id}`}
                className="inline-flex items-center px-4 h-10 text-sm font-medium text-slate-700 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors">
                View Full Interviewer Profile
              </Link>
            </div>
          </div>
        </Panel>
      )}

      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onSubmit={handleStatusUpdate}
        currentStatus={applicant.status}
        applicantName={applicant.fullName}
      />
    </div>
  );
};

export default ApplicantDetails;
