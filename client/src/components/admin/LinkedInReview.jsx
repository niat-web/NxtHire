// client/src/components/admin/LinkedInReview.jsx
import React, { useState } from 'react';
import { FiThumbsUp, FiThumbsDown, FiExternalLink } from 'react-icons/fi';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Textarea from '../common/Textarea';
import StatusBadge from '../common/StatusBadge';
import { processLinkedInReview } from '../../api/admin.api';
import { useAlert } from '../../hooks/useAlert';

const LinkedInReview = ({ applicant, onReviewComplete }) => {
  const { showSuccess, showError } = useAlert();
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleApprove = async () => {
    setIsSubmitting(true);
    
    try {
      await processLinkedInReview(applicant._id, {
        decision: 'approve',
        notes
      });
      
      showSuccess('Profile approved successfully!');
      if (onReviewComplete) {
        onReviewComplete('approve');
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to approve profile. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsApproveModalOpen(false);
    }
  };
  
  const handleReject = async () => {
    if (!rejectionReason) {
      showError('Please provide a reason for rejection.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await processLinkedInReview(applicant._id, {
        decision: 'reject',
        notes,
        rejectionReason
      });
      
      showSuccess('Profile rejected successfully.');
      if (onReviewComplete) {
        onReviewComplete('reject');
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to reject profile. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsRejectModalOpen(false);
    }
  };

  return (
    <div>
      <Card title="Applicant Profile Review">
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
              <h4 className="text-sm font-medium text-gray-500">Phone Number</h4>
              <p className="mt-1 text-base text-gray-900">{applicant.phoneNumber}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Status</h4>
              <div className="mt-1">
                <StatusBadge status={applicant.status} />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">LinkedIn Profile</h4>
            <div className="mt-2">
              <a 
                href={applicant.linkedinProfileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary-600 hover:text-primary-800"
              >
                <span className="underline">View LinkedIn Profile</span>
                <FiExternalLink className="ml-1" />
              </a>
            </div>
          </div>
          
          {applicant.additionalComments && (
            <div>
              <h4 className="text-sm font-medium text-gray-500">Additional Comments</h4>
              <p className="mt-1 text-sm text-gray-700">{applicant.additionalComments}</p>
            </div>
          )}
          
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              icon={<FiThumbsDown className="text-red-500" />}
              iconPosition="left"
              onClick={() => setIsRejectModalOpen(true)}
            >
              Reject
            </Button>
            
            <Button
              variant="primary"
              icon={<FiThumbsUp />}
              iconPosition="left"
              onClick={() => setIsApproveModalOpen(true)}
            >
              Approve
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Approve Modal */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="Approve Applicant"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            You are about to approve {applicant.fullName}'s profile. This will move them to the Skill Assessment stage.
          </p>
          
          <Textarea
            label="Review Notes (Optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this applicant"
            rows={4}
          />
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => setIsApproveModalOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleApprove}
            disabled={isSubmitting}
            icon={<FiThumbsUp />}
            iconPosition="left"
          >
            {isSubmitting ? 'Processing...' : 'Confirm Approval'}
          </Button>
        </div>
      </Modal>
      
      {/* Reject Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Applicant"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            You are about to reject {applicant.fullName}'s profile. Please provide a reason for rejection.
          </p>
          
          <Textarea
            label="Rejection Reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Explain why this applicant is being rejected"
            rows={4}
            required
            error={isSubmitting && !rejectionReason ? 'Rejection reason is required' : null}
          />
          
          <Textarea
            label="Additional Notes (Optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any internal notes (not shared with applicant)"
            rows={3}
          />
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => setIsRejectModalOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleReject}
            disabled={isSubmitting}
            icon={<FiThumbsDown />}
            iconPosition="left"
          >
            {isSubmitting ? 'Processing...' : 'Confirm Rejection'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default LinkedInReview;