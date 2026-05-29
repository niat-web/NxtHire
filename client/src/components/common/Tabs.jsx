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
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => handleTabClick(index)}
              className={`
                whitespace-nowrap py-3.5 px-1 border-b-2 text-[13px] font-semibold transition-colors
                ${
                  activeTab === index
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-primary/40'
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
                      ? 'bg-primary text-white'
                      : 'bg-muted text-foreground/80'
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
