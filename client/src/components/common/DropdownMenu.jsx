// client/src/components/common/DropdownMenu.jsx
import { Menu, Portal } from '@headlessui/react';
import { MoreVertical } from 'lucide-react';
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
          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-colors"
        >
          <span className="sr-only">Open options</span>
          <MoreVertical className="h-4 w-4" aria-hidden="true" />
        </Menu.Button>
      </div>
      
      {/* *** NEW: Wrap the Transition and Menu.Items in a Portal *** */}
      {/* This renders the menu outside the clipping table container */}
      <Portal>
        <Menu.Items
          ref={refs.setFloating}
          style={floatingStyles}
          className="z-50 w-52 rounded-2xl bg-white border border-slate-200 shadow-lg focus:outline-none"
        >
          <div className="py-1.5">
            {options.map((option) => (
              <Menu.Item key={option.label} disabled={option.disabled}>
                {({ active, disabled }) => {
                  const itemClasses = classNames(
                    active && !disabled ? 'bg-slate-50 text-slate-900' : 'text-slate-700',
                    disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                    'group flex items-center px-4 py-2 text-[13px] transition-colors'
                  );
                  const destructiveClasses = option.isDestructive && !disabled ? 'text-red-600' : '';
                  const destructiveActiveClasses = option.isDestructive && active && !disabled ? 'bg-red-50 text-red-700' : '';

                  const content = (
                    <>
                      {option.icon && <option.icon className="mr-3 h-4 w-4 text-slate-400 group-hover:text-slate-700" aria-hidden="true" />}
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
      </Portal>
      {/* --- END OF PORTAL WRAPPER --- */}
    </Menu>
  );
};

export default DropdownMenu;