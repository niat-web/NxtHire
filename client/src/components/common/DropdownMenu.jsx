// client/src/components/common/DropdownMenu.jsx
import { Fragment } from 'react';
import { Menu, Transition, Portal } from '@headlessui/react'; // *** MODIFIED: Import Portal ***
import { FiMoreVertical } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useFloating, flip, shift, offset, autoUpdate } from '@floating-ui/react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const DropdownMenu = ({ options }) => {
  // Floating UI hook setup (no changes here from the last fix)
  const { refs, floatingStyles, context } = useFloating({
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(8),
      flip(),
      shift({ padding: 5 }), // Add a little padding from the edge of the screen
    ],
  });

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button 
          ref={refs.setReference}
          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-transparent text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <span className="sr-only">Open options</span>
          <FiMoreVertical className="h-5 w-5" aria-hidden="true" />
        </Menu.Button>
      </div>
      
      {/* *** NEW: Wrap the Transition and Menu.Items in a Portal *** */}
      {/* This renders the menu outside the clipping table container */}
      <Portal>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items 
            ref={refs.setFloating}
            style={floatingStyles}
            className="z-50 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" // Increased z-index
          >
            <div className="py-1">
              {options.map((option) => (
                <Menu.Item key={option.label} disabled={option.disabled}>
                  {({ active, disabled }) => {
                    const itemClasses = classNames(
                      active && !disabled ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                      'group flex items-center px-4 py-2 text-sm'
                    );
                    const destructiveClasses = option.isDestructive && !disabled ? 'text-red-700' : '';
                    const destructiveActiveClasses = option.isDestructive && active && !disabled ? 'bg-red-50' : '';
                    
                    const content = (
                      <>
                        {option.icon && <option.icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />}
                        <span>{option.label}</span>
                      </>
                    );

                    if (option.to && !disabled) {
                      return (
                        <Link to={option.to} className={`${itemClasses} ${destructiveClasses}`}>
                          {content}
                        </Link>
                      );
                    }
                    
                    if (option.to && disabled) {
                      return (
                          <span className={`${itemClasses} ${destructiveClasses}`}>{content}</span>
                      );
                    }
                    
                    return (
                      <button
                        type="button"
                        onClick={option.onClick}
                        disabled={disabled}
                        className={`${itemClasses} ${destructiveClasses} ${destructiveActiveClasses} w-full`}
                      >
                        {content}
                      </button>
                    );
                  }}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Portal>
      {/* --- END OF PORTAL WRAPPER --- */}
    </Menu>
  );
};

export default DropdownMenu;