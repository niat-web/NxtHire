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
      panel: 'bg-white border border-border shadow-xl',
      header: 'border-border',
      title: 'text-foreground',
      closeButton: 'text-muted-foreground hover:text-foreground',
      footer: 'border-border bg-muted/30',
    },
    dark: {
      panel: 'bg-primary border border-slate-800 shadow-xl',
      header: 'border-slate-800',
      title: 'text-white',
      closeButton: 'text-muted-foreground/70 hover:text-white',
      footer: 'border-slate-800 bg-slate-950/40',
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
          <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
            leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className={cn(
              'relative w-full my-8 flex flex-col rounded-2xl max-h-[90vh]',
              sizeClasses[size],
              currentTheme.panel
            )}>
              {title && (
                <div className={cn('flex-shrink-0 px-6 py-4 border-b flex justify-between items-center', currentTheme.header)}>
                  <DialogTitle as="h3" className={cn('text-[15px] font-semibold leading-6 tracking-tight', currentTheme.title)} style={{ fontFamily: 'Supreme, "Plus Jakarta Sans", system-ui, sans-serif' }}>
                    {title}
                  </DialogTitle>
                  {showCloseButton && (
                    <button
                      type="button"
                      className={cn('rounded-full h-8 w-8 inline-flex items-center justify-center transition-colors hover:bg-muted', currentTheme.closeButton)}
                      onClick={onClose}
                    >
                      <span className="sr-only">Close</span>
                      <X className="h-4 w-4" />
                    </button>
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
