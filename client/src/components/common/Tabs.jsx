// // client/src/components/common/Tabs.jsx
// import React, { useState } from 'react';

// const Tabs = ({ tabs, defaultTab = 0, onChange, className = '' }) => {
//   const [activeTab, setActiveTab] = useState(defaultTab);

//   const handleTabClick = (index) => {
//     setActiveTab(index);
//     if (onChange) {
//       onChange(index);
//     }
//   };

//   return (
//     <div className={className}>
//       <div className="border-b border-gray-200">
//         <nav className="-mb-px flex space-x-8">
//           {tabs.map((tab, index) => (
//             <button
//               key={index}
//               onClick={() => handleTabClick(index)}
//               className={`
//                 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
//                 ${
//                   activeTab === index
//                     ? 'border-primary-500 text-primary-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                 }
//               `}
//               aria-current={activeTab === index ? 'page' : undefined}
//             >
//               {tab.icon && <span className="mr-2">{tab.icon}</span>}
//               {tab.label}
//               {tab.count !== undefined && (
//                 <span
//                   className={`ml-2 py-0.5 px-2 rounded-full text-xs font-medium ${
//                     activeTab === index
//                       ? 'bg-primary-100 text-primary-600'
//                       : 'bg-gray-100 text-gray-900'
//                   }`}
//                 >
//                   {tab.count}
//                 </span>
//               )}
//             </button>
//           ))}
//         </nav>
//       </div>
//       <div className="mt-4">
//         {tabs[activeTab]?.content}
//       </div>
//     </div>
//   );
// };

// export default Tabs;


// C:\Users\NxtWave\Desktop\Testing\Interviewer community\interviewer-hiring-system\interviewer-hiring-system\client\src\components\common\Tabs.jsx
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
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => handleTabClick(index)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === index
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
              aria-current={activeTab === index ? 'page' : undefined}
            >
              {tab.icon && <span className="mr-2">{tab.icon}</span>}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`ml-2 py-0.5 px-2 rounded-full text-xs font-medium ${
                    activeTab === index
                      ? 'bg-primary-100 text-primary-600'
                      : 'bg-gray-100 text-gray-900'
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
