// client/src/pages/admin/InterviewerDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiEdit, FiUser, FiCalendar, FiDollarSign, FiCheck, FiStar } from 'react-icons/fi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import Loader from '../../components/common/Loader';
import StatusUpdateModal from '../../components/admin/StatusUpdateModal';
import { getInterviewerDetails, updateInterviewerStatus } from '../../api/admin.api';
import { useAlert } from '../../hooks/useAlert';
import { formatDate, formatDateTime, formatCurrency, formatPercentage } from '../../utils/formatters';

const InterviewerDetails = () => {
  const { id } = useParams();
  const { showSuccess, showError } = useAlert();
  const [loading, setLoading] = useState(true);
  const [interviewer, setInterviewer] = useState(null);
  const [applicant, setApplicant] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  
  useEffect(() => {
    const fetchInterviewerDetails = async () => {
      setLoading(true);
      try {
        const response = await getInterviewerDetails(id);
        setInterviewer(response.data.interviewer);
        setApplicant(response.data.applicant);
        setAvailability(response.data.availability);
      } catch (error) {
        console.error('Error fetching interviewer details:', error);
        showError('Failed to load interviewer details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInterviewerDetails();
  }, [id, showError]);
  
  const handleStatusUpdate = async (data) => {
    try {
      await updateInterviewerStatus(id, data);
      
      // Update local state
      setInterviewer(prev => ({
        ...prev,
        status: data.status
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
        <Loader size="lg" text="Loading interviewer details..." />
      </div>
    );
  }
  
  if (!interviewer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Interviewer not found</p>
        <Button
          to="/admin/interviewers"
          variant="primary"
          className="mt-4"
        >
          Back to Interviewers
        </Button>
      </div>
    );
  }
  
  const { user } = interviewer;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/admin/interviewers" className="mr-4">
            <FiArrowLeft className="h-5 w-5 text-gray-500 hover:text-gray-700" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Interviewer Details</h1>
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
            <StatusBadge status={interviewer.status} />
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Full Name</h4>
            <p className="mt-1 text-base text-gray-900">{user.firstName} {user.lastName}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">Email</h4>
            <p className="mt-1 text-base text-gray-900">{user.email}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">Phone Number</h4>
            <p className="mt-1 text-base text-gray-900">{user.phoneNumber}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">WhatsApp Number</h4>
            <p className="mt-1 text-base text-gray-900">{user.whatsappNumber || 'Same as phone number'}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">Current Employer</h4>
            <p className="mt-1 text-base text-gray-900">{interviewer.currentEmployer}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">Job Title</h4>
            <p className="mt-1 text-base text-gray-900">{interviewer.jobTitle}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">Onboarded On</h4>
            <p className="mt-1 text-base text-gray-900">{formatDateTime(interviewer.onboardingDate)}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">Probation End Date</h4>
            <p className="mt-1 text-base text-gray-900">{formatDate(interviewer.probationEndDate)}</p>
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-500">Domains</h4>
          <div className="mt-1 flex flex-wrap gap-2">
            {interviewer.domains.map((domain) => (
              <Badge key={domain} variant="primary">{domain}</Badge>
            ))}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Primary Domain: <strong>{interviewer.primaryDomain}</strong>
          </p>
        </div>
        
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-500">Profile Completeness</h4>
          <ProgressBar 
            value={interviewer.profileCompleteness || 0} 
            variant={interviewer.profileCompleteness < 100 ? 'warning' : 'success'}
            height="h-3"
            className="mt-2"
            showValue
          />
        </div>
      </Card>
      
      {/* Metrics */}
      <Card title="Performance Metrics">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-primary-100 text-primary-700">
                <FiCheck className="h-6 w-6" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Interviews Completed</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{interviewer.metrics?.interviewsCompleted || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-yellow-100 text-yellow-700">
                <FiStar className="h-6 w-6" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Average Rating</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{(interviewer.metrics?.averageRating || 0).toFixed(1)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-green-100 text-green-700">
                <FiCheck className="h-6 w-6" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{formatPercentage(interviewer.metrics?.completionRate || 0)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-blue-100 text-blue-700">
                <FiDollarSign className="h-6 w-6" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{formatCurrency(interviewer.metrics?.totalEarnings || 0)}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-gray-500">Payment Tier</h4>
            <Badge variant="primary" rounded>{interviewer.paymentTier}</Badge>
          </div>
          <p className="text-sm text-gray-500">
            {interviewer.paymentTier === 'Tier 1'
              ? 'Tier 1: ₹500 per interview. Complete 20 interviews with an average rating of 4.0 or above to advance to Tier 2.'
              : interviewer.paymentTier === 'Tier 2'
              ? 'Tier 2: ₹750 per interview. Complete 50 interviews with an average rating of 4.5 or above to advance to Tier 3.'
              : 'Tier 3: ₹1,000 per interview. This is the highest payment tier.'}
          </p>
        </div>
      </Card>
      
      {/* Payment Information */}
      <Card 
        title={
          <div className="flex items-center">
            <FiDollarSign className="mr-2 text-primary-600" />
            <span>Payment Information</span>
          </div>
        }
      >
        {interviewer.bankDetails && Object.values(interviewer.bankDetails).some(value => value) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Account Holder Name</h4>
              <p className="mt-1 text-base text-gray-900">{interviewer.bankDetails.accountName || 'Not provided'}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Bank Name</h4>
              <p className="mt-1 text-base text-gray-900">{interviewer.bankDetails.bankName || 'Not provided'}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Account Number</h4>
              <p className="mt-1 text-base text-gray-900">
                {interviewer.bankDetails.accountNumber ? 
                  `XXXX${interviewer.bankDetails.accountNumber.slice(-4)}` : 
                  'Not provided'}
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">IFSC Code</h4>
              <p className="mt-1 text-base text-gray-900">{interviewer.bankDetails.ifscCode || 'Not provided'}</p>
            </div>
          </div>
        ) : (
          <p className="text-center py-4 text-gray-500">Bank details not provided yet</p>
        )}
      </Card>
      
      {/* Availability */}
      {availability && (
        <Card 
          title={
            <div className="flex items-center">
              <FiCalendar className="mr-2 text-primary-600" />
              <span>Availability</span>
            </div>
          }
        >
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Timezone</h4>
              <p className="text-base text-gray-900">
                {availability.timezone === 'Asia/Kolkata' ? 'India Standard Time (IST)' : availability.timezone}
              </p>
            </div>
            
            {availability.availabilityNotes && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Availability Notes</h4>
                <p className="text-sm text-gray-700 whitespace-pre-line">{availability.availabilityNotes}</p>
              </div>
            )}
            
            {availability.recurringSlots && availability.recurringSlots.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3">Weekly Recurring Slots</h4>
                <div className="space-y-3">
                  {availability.recurringSlots.map((slot, index) => {
                    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    const dayName = dayNames[slot.dayOfWeek];
                    
                    return (
                      <div key={index} className="bg-gray-50 p-3 rounded-md flex justify-between items-center">
                        <div>
                          <span className="font-medium">{dayName}</span>
                        </div>
                        <div>
                          {slot.startTime} - {slot.endTime}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {availability.specificSlots && availability.specificSlots.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3">Specific Date Slots</h4>
                <div className="space-y-3">
                  {availability.specificSlots.map((slot, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-md flex justify-between items-center">
                      <div>
                        <span className="font-medium">{formatDate(slot.date)}</span>
                      </div>
                      <div>
                        {slot.startTime} - {slot.endTime}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {(!availability.recurringSlots || availability.recurringSlots.length === 0) && 
             (!availability.specificSlots || availability.specificSlots.length === 0) && (
              <p className="text-center py-4 text-gray-500">No availability slots set</p>
            )}
          </div>
        </Card>
      )}
      
      {/* Applicant Information */}
      {applicant && (
        <Card 
          title={
            <div className="flex items-center">
              <FiUser className="mr-2 text-primary-600" />
              <span>Application Information</span>
            </div>
          }
        >
          <div className="space-y-6">
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
                <h4 className="text-sm font-medium text-gray-500">Applied On</h4>
                <p className="mt-1 text-base text-gray-900">{formatDate(applicant.createdAt)}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">LinkedIn Profile</h4>
                <div className="mt-1">
                  <a 
                    href={applicant.linkedinProfileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-800 underline"
                  >
                    View Profile
                  </a>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                to={`/admin/applicants/${applicant._id}`}
                variant="outline"
              >
                View Full Application
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
        currentStatus={interviewer.status}
        applicantName={`${user.firstName} ${user.lastName}`}
        allowedStatuses={['On Probation', 'Active', 'Inactive', 'Suspended', 'Terminated']}
      />
    </div>
  );
};

export default InterviewerDetails;