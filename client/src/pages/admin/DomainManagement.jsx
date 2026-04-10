// client/src/pages/admin/DomainManagement.jsx
import React, { useState } from 'react';
import DomainsTab from '@/components/admin/DomainsTab';
import DomainFieldsTab from '@/components/admin/DomainFieldsTab';
import { useDomains } from '@/hooks/useAdminQueries';
import { Grid, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DomainManagement = () => {
    const { data: domains = [], isLoading: loading, refetch: fetchDomains } = useDomains();
    const [activeTab, setActiveTab] = useState('domains'); // 'domains' or 'fields'
    const [selectedDomainForFields, setSelectedDomainForFields] = useState(null);

    const handleDomainClick = (domain) => {
        const domainOption = domains.find(d => d._id === domain._id);
        if (domainOption) {
            setSelectedDomainForFields({ value: domainOption._id, label: domainOption.name });
            setActiveTab('fields');
        }
    };
    
    if (loading) {
        return (
            <div className="flex h-full items-center justify-center bg-[#F5F7F9]">
                <div className="flex flex-col items-center">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4"></div>
                    <span className="text-base font-medium text-gray-500">Loading Evaluation Setup...</span>
                </div>
            </div>
        );
    }

    const NavBtn = ({ id, label, icon: Icon }) => (
        <Button
            onClick={() => setActiveTab(id)}
            variant={activeTab === id ? 'default' : 'ghost'}
            className={`flex items-center gap-2 font-medium ${activeTab === id ? 'bg-gray-900 text-white hover:bg-black shadow-md' : 'text-gray-600 hover:bg-gray-200'}`}
        >
            <Icon className="h-4 w-4" /> {label}
        </Button>
    );

    return (
        <div className="h-full w-full flex flex-col bg-[#F5F7F9]">
             <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0 flex justify-between items-center z-10 shadow-md">
                <h1 className="text-xl font-semibold text-gray-900"></h1>
                <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
                    <NavBtn id="domains" label="Domains" icon={Grid} />
                    <NavBtn id="fields" label="Domain Fields" icon={Settings} />
                </div>
             </div>
             
             <div className="flex-grow overflow-y-auto custom-scrollbar">
                <div className="h-full max-w-7xl mx-auto">
                    {activeTab === 'domains' && (
                        <DomainsTab domains={domains} onUpdate={fetchDomains} onDomainClick={handleDomainClick} /> 
                    )}
                    {activeTab === 'fields' && (
                        <DomainFieldsTab domains={domains} selectedDomain={selectedDomainForFields} setSelectedDomain={setSelectedDomainForFields} />
                    )}
                </div>
             </div>
        </div>
    );
};

export default DomainManagement;
