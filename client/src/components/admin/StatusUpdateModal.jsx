// client/src/components/admin/StatusUpdateModal.jsx
import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import { APPLICATION_STATUS } from '../../utils/constants';

const StatusUpdateModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  currentStatus, 
  applicantName,
  allowedStatuses = []
}) => {
  const [status, setStatus] = useState(currentStatus || '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filter status options based on allowed statuses or show all
  const filteredStatuses = Object.values(APPLICATION_STATUS)
    .filter(statusOption => 
      allowedStatuses.length === 0 || allowedStatuses.includes(statusOption)
    );
  
  const statusOptions = filteredStatuses.map(statusOption => ({
    value: statusOption,
    label: statusOption
  }));
  
  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };
  
  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };
  
  const handleSubmit = async () => {
    if (!status) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit({ status, notes });
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Status for ${applicantName}`}
      size="md"
    >
      <div className="space-y-4">
        <Select
          label="New Status"
          value={status}
          onChange={handleStatusChange}
          options={statusOptions}
          placeholder="Select a new status"
          required
        />
        
        <Textarea
          label="Notes (Optional)"
          value={notes}
          onChange={handleNotesChange}
          placeholder="Add any notes about this status change"
          rows={4}
        />
      </div>
      
      <div className="mt-6 flex justify-end space-x-3">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isSubmitting || !status}
        >
          {isSubmitting ? 'Updating...' : 'Update Status'}
        </Button>
      </div>
    </Modal>
  );
};

export default StatusUpdateModal;