// client/src/components/common/Modal.jsx
import { Fragment } from 'react';
import { Dialog, Transition, DialogPanel, DialogTitle } from '@headlessui/react';
import { FiX } from 'react-icons/fi';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true
}) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    full: 'max-w-full'
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog 
        as="div" 
        className="relative z-50"
        onClose={closeOnOverlayClick ? onClose : () => {}}
      >
        <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
        >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel 
              className={`relative w-full ${sizeClasses[size]} my-8 flex flex-col bg-white shadow-xl rounded-lg max-h-[90vh]`}
            >
              {title && (
                <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <DialogTitle
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    {title}
                  </DialogTitle>
                  {showCloseButton && (
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close</span>
                      <FiX className="h-5 w-5" />
                    </button>
                  )}
                </div>
              )}
              
              <div className="flex-1 p-6 overflow-y-auto no-scrollbar">
                {children}
              </div>
              
              {footer && (
                <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                  {footer}
                </div>
              )}
            </DialogPanel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;