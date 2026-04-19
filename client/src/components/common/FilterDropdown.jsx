// client/src/components/common/FilterDropdown.jsx
import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDown, Check } from 'lucide-react';

const FilterDropdown = ({
  label,
  options,
  selectedValue,
  onChange,
  buttonClassName = '',
  menuClassName = '',
  disabled = false
}) => {
  const getSelectedLabel = () => {
    const selected = options.find(option => option.value === selectedValue);
    return selected ? selected.label : label;
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button
          className={`inline-flex h-10 items-center justify-center w-full px-4 text-[13px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-full hover:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          } ${buttonClassName}`}
          disabled={disabled}
        >
          {getSelectedLabel()}
          <ChevronDown className="-mr-1 ml-2 h-4 w-4" aria-hidden="true" />
        </Menu.Button>
      </div>

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
          className={`absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-2xl border border-slate-200 bg-white shadow-lg focus:outline-none ${menuClassName}`}
        >
          <div className="py-1.5">
            {options.map((option) => (
              <Menu.Item key={option.value}>
                {({ active }) => (
                  <button
                    onClick={() => onChange(option.value)}
                    className={`${
                      active ? 'bg-slate-50 text-slate-900' : 'text-slate-700'
                    } flex w-full items-center px-4 py-2 text-[13px] transition-colors`}
                  >
                    {selectedValue === option.value && (
                      <Check className="mr-2 h-4 w-4 text-slate-900" />
                    )}
                    <span className={selectedValue === option.value ? 'font-semibold' : ''}>
                      {option.label}
                    </span>
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default FilterDropdown;