// client/src/pages/admin/ApplicantDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiEdit, FiUser, FiFileText, FiCheck, FiX, FiExternalLink } from 'react-icons/fi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import StatusUpdateModal from '../../components/admin/StatusUpdateModal';
import { getApplicantDetails, updateApplicantStatus } from '../../api/admin.api';
import { useAlert } from '../../hooks/useAlert';
import { formatDate, formatDateTime } from '../../utils/formatters';

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
      
      // Update local state
      setApplicant(prev => ({
        ...prev,
        status: data.status,
        statusHistory: [
          ...prev.statusHistory,
          {
            status: data.status,
            timestamp: new Date().toISOString(),
            notes: data.notes
          }
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
        <p className="text-gray-500">Applicant not found</p>
        <Button
          to="/admin/applicants"
          variant="primary"
          className="mt-4"
        >
          Back to Applicants
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/admin/applicants" className="mr-4">
            <FiArrowLeft className="h-5 w-5 text-gray-500 hover:text-gray-700" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Applicant Details</h1>
        </div>
        
        <div className="flex space-x-4">
          
          <Button
            variant="primary"
            icon={<FiEdit />}
            iconPosition="left"
            onClick={() => setIsStatusModalOpen(true)}
          >
            Update Status
          </Button>
        </div>
      </div>
      
      {/* Basic Information */}
      <Card 
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FiUser className="mr-2 text-primary-600" />
              <span>Basic Information</span>
            </div>
            <StatusBadge status={applicant.status} />
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Full Name</h4>
            <p className="mt-1 text-base text-gray-900">{applicant.fullName}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">Email</h4>
            <p className="mt-1 text-base text-gray-900">{applicant.email}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">Phone Number</h4>
            <p className="mt-1 text-base text-gray-900">{applicant.phoneNumber}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">WhatsApp Number</h4>
            <p className="mt-1 text-base text-gray-900">{applicant.whatsappNumber || 'Same as phone number'}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">Applied On</h4>
            <p className="mt-1 text-base text-gray-900">{formatDateTime(applicant.createdAt)}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">Last Updated</h4>
            <p className="mt-1 text-base text-gray-900">{formatDateTime(applicant.updatedAt)}</p>
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-500">LinkedIn Profile</h4>
          <div className="mt-1">
            <a 
              href={applicant.linkedinProfileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-primary-600 hover:text-primary-800"
            >
              <span className="underline">{applicant.linkedinProfileUrl}</span>
              <FiExternalLink className="ml-1" />
            </a>
          </div>
        </div>
        
        {applicant.additionalComments && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-500">Additional Comments</h4>
            <p className="mt-1 text-sm text-gray-700 whitespace-pre-line">{applicant.additionalComments}</p>
          </div>
        )}
        
        {applicant.reviewNotes && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-500">Review Notes</h4>
            <p className="mt-1 text-sm text-gray-700 whitespace-pre-line">{applicant.reviewNotes}</p>
          </div>
        )}
      </Card>
      
      {/* Status History */}
      <Card title="Status History">
        <div className="flow-root">
          <ul className="-mb-8">
            {applicant.statusHistory.map((statusItem, index) => (
              <li key={index}>
                <div className="relative pb-8">
                  {index !== applicant.statusHistory.length - 1 && (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    ></span>
                  )}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center ring-8 ring-white">
                        <span className="h-2.5 w-2.5 rounded-full bg-primary-600"></span>
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-900">
                          Status changed to <span className="font-medium">{statusItem.status}</span>
                          {statusItem.notes && (
                            <span className="text-gray-500"> - {statusItem.notes}</span>
                          )}
                        </p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        {formatDateTime(statusItem.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Card>
      
      {/* Skill Assessment */}
      {skillAssessment && (
        <Card 
          title={
            <div className="flex items-center">
              <FiFileText className="mr-2 text-primary-600" />
              <span>Skill Assessment</span>
            </div>
          }
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Current Employer</h4>
                <p className="mt-1 text-base text-gray-900">{skillAssessment.currentEmployer}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Job Title</h4>
                <p className="mt-1 text-base text-gray-900">{skillAssessment.jobTitle}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Years of Experience</h4>
                <p className="mt-1 text-base text-gray-900">{skillAssessment.yearsOfExperience}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Domain</h4>
                <div className="mt-1">
                  <Badge variant="primary">{skillAssessment.domain}</Badge>
                  {skillAssessment.autoCategorizedDomain !== skillAssessment.domain && (
                    <div className="mt-1 text-xs text-gray-500">
                      Auto-categorized as: {skillAssessment.autoCategorizedDomain}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                <p className="mt-1 text-base text-gray-900">{skillAssessment.status}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Submitted On</h4>
                <p className="mt-1 text-base text-gray-900">{formatDateTime(skillAssessment.createdAt)}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Technical Skills</h4>
              <div className="space-y-4">
                {skillAssessment.technicalSkills.map((skill, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <h4 className="text-base font-medium text-gray-900">{skill.skill}</h4>
                      <Badge 
                        variant={
                          skill.proficiencyLevel === 'Expert' ? 'primary' :
                          skill.proficiencyLevel === 'Advanced' ? 'success' :
                          skill.proficiencyLevel === 'Intermediate' ? 'info' :
                          'gray'
                        }
                      >
                        {skill.proficiencyLevel}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      {skill.yearsOfExperience} {skill.yearsOfExperience === 1 ? 'year' : 'years'} of experience
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            {skillAssessment.additionalNotes && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Additional Notes</h4>
                <p className="mt-1 text-sm text-gray-700 whitespace-pre-line">{skillAssessment.additionalNotes}</p>
              </div>
            )}
          </div>
        </Card>
      )}
      
      {/* Interviewer Information */}
      {interviewer && (
        <Card 
          title={
            <div className="flex items-center">
              <FiUser className="mr-2 text-primary-600" />
              <span>Interviewer Information</span>
            </div>
          }
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Name</h4>
                <p className="mt-1 text-base text-gray-900">
                  {interviewer.user?.firstName} {interviewer.user?.lastName}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Email</h4>
                <p className="mt-1 text-base text-gray-900">{interviewer.user?.email}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                <div className="mt-1">
                  <StatusBadge status={interviewer.status} />
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Payment Tier</h4>
                <div className="mt-1">
                  <Badge variant="primary" rounded>
                    {interviewer.paymentTier}
                  </Badge>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Primary Domain</h4>
                <p className="mt-1 text-base text-gray-900">{interviewer.primaryDomain}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Onboarding Date</h4>
                <p className="mt-1 text-base text-gray-900">{formatDate(interviewer.onboardingDate)}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Metrics</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-xs text-gray-500">Interviews Completed</p>
                  <p className="text-lg font-medium text-gray-900">{interviewer.metrics?.interviewsCompleted || 0}</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-xs text-gray-500">Average Rating</p>
                  <p className="text-lg font-medium text-gray-900">{(interviewer.metrics?.averageRating || 0).toFixed(1)}</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-xs text-gray-500">Completion Rate</p>
                  <p className="text-lg font-medium text-gray-900">{(interviewer.metrics?.completionRate || 0).toFixed(1)}%</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-xs text-gray-500">Profile Completeness</p>
                  <p className="text-lg font-medium text-gray-900">{interviewer.profileCompleteness || 0}%</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                to={`/admin/interviewers/${interviewer._id}`}
                variant="outline"
              >
                View Full Interviewer Profile
              </Button>
            </div>
          </div>
        </Card>
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