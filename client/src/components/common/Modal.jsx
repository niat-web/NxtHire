// client/src/components/common/Modal.jsx
import { Fragment } from 'react';
import { Dialog, Transition, DialogPanel, DialogTitle } from '@headlessui/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
  theme = 'light'
}) => {
  const sizeClasses = {
    sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl', '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl', '4xl': 'max-w-4xl', '5xl': 'max-w-5xl', full: 'max-w-full'
  };

  const themeStyles = {
    light: {
      panel: 'bg-background border border-border shadow-md',
      header: 'border-border',
      title: 'text-foreground',
      closeButton: 'text-muted-foreground hover:text-foreground',
      footer: 'border-border bg-muted/50',
    },
    dark: {
      panel: 'bg-[#14162B]/80 backdrop-blur-lg border border-white/10 shadow-md shadow-black/30',
      header: 'border-white/10',
      title: 'text-gray-100',
      closeButton: 'text-gray-400 hover:text-white',
      footer: 'border-white/10 bg-black/20',
    }
  };

  const currentTheme = themeStyles[theme];

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeOnOverlayClick ? onClose : () => {}}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
            leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className={cn(
              'relative w-full my-8 flex flex-col rounded-xl max-h-[90vh]',
              sizeClasses[size],
              currentTheme.panel
            )}>
              {title && (
                <div className={cn('flex-shrink-0 px-6 py-4 border-b flex justify-between items-center', currentTheme.header)}>
                  <DialogTitle as="h3" className={cn('text-lg font-semibold leading-6', currentTheme.title)}>
                    {title}
                  </DialogTitle>
                  {showCloseButton && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={cn('rounded-full h-8 w-8', currentTheme.closeButton)}
                      onClick={onClose}
                    >
                      <span className="sr-only">Close</span>
                      <X className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              )}

              <div className="flex-1 p-6 overflow-y-auto no-scrollbar">
                {children}
              </div>

              {footer && (
                <div className={cn('flex-shrink-0 px-6 py-4 border-t flex justify-end space-x-3', currentTheme.footer)}>
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
