// client/src/components/common/ConfirmDialog.jsx
import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { FiAlertCircle } from 'react-icons/fi';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to perform this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  icon = <FiAlertCircle className="h-6 w-6 text-red-600" />,
  isLoading = false
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      showCloseButton={false}
      closeOnOverlayClick={!isLoading}
    >
      <div className="flex items-start mb-4">
        {icon && <div className="mr-3 flex-shrink-0">{icon}</div>}
        <div>
          <p className="text-sm text-gray-500">{message}</p>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end space-x-3">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
        >
          {cancelText}
        </Button>
        <Button
          variant={confirmVariant}
          onClick={onConfirm}
          disabled={isLoading}
          isLoading={isLoading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;