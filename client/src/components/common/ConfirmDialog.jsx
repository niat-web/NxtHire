// client/src/components/common/ConfirmDialog.jsx
import React from 'react';
import Modal from './Modal';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Map old variant names to ui/button variants
const variantMap = {
  primary: 'default',
  danger: 'destructive',
  success: 'success',
  outline: 'outline',
  ghost: 'ghost',
};

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to perform this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  icon = <AlertCircle className="h-6 w-6 text-red-600" />,
  isLoading = false
}) => {
  const mappedVariant = variantMap[confirmVariant] || 'default';

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
          <p className="text-sm text-muted-foreground">{message}</p>
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
          variant={mappedVariant}
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
