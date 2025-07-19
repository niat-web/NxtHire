// client/src/components/common/FilterDropdown.jsx
import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { FiChevronDown, FiCheck } from 'react-icons/fi';

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
          className={`inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          } ${buttonClassName}`}
          disabled={disabled}
        >
          {getSelectedLabel()}
          <FiChevronDown className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
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
          // *** FIX START: Added z-20 to ensure the menu appears above the z-10 sticky header ***
          className={`absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${menuClassName}`}
          // *** FIX END ***
        >
          <div className="py-1">
            {options.map((option) => (
              <Menu.Item key={option.value}>
                {({ active }) => (
                  <button
                    onClick={() => onChange(option.value)}
                    className={`${
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    } flex w-full items-center px-4 py-2 text-sm`}
                  >
                    {selectedValue === option.value && (
                      <FiCheck className="mr-2 h-4 w-4 text-primary-600" />
                    )}
                    <span className={selectedValue === option.value ? 'font-medium' : ''}>
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