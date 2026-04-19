import React, { useState, useEffect } from 'react';

const Tabs = ({ tabs, defaultTab = 0, onChange, activeTab: controlledActiveTab, onTabChange, className = '' }) => {
  const isControlled = controlledActiveTab !== undefined;
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab);

  const activeTab = isControlled ? controlledActiveTab : internalActiveTab;

  const handleTabClick = (index) => {
    if (isControlled) {
      if (onTabChange) {
        onTabChange(index);
      }
    } else {
      setInternalActiveTab(index);
      if (onChange) {
        onChange(index);
      }
    }
  };

  useEffect(() => {
    if (!isControlled) {
      setInternalActiveTab(defaultTab);
    }
  }, [defaultTab, isControlled]);

  return (
    <div className={className}>
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => handleTabClick(index)}
              className={`
                whitespace-nowrap py-3.5 px-1 border-b-2 text-[13px] font-semibold transition-colors
                ${
                  activeTab === index
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }
              `}
              aria-current={activeTab === index ? 'page' : undefined}
            >
              {tab.icon && <span className="mr-2 inline-flex items-center">{tab.icon}</span>}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`ml-2 py-0.5 px-2 rounded-full text-[11px] font-semibold ${
                    activeTab === index
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-4">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
};

export default Tabs;
