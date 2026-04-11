// client/src/pages/admin/DomainManagement.jsx
import { useState } from 'react';
import DomainsTab from '@/components/admin/DomainsTab';
import DomainFieldsTab from '@/components/admin/DomainFieldsTab';
import { useDomains } from '@/hooks/useAdminQueries';
import { Grid, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Loader from '@/components/common/Loader';

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
            <div className="flex h-full items-center justify-center bg-gray-50">
                <Loader size="lg" />
            </div>
        );
    }

    const NavBtn = ({ id, label, icon: Icon }) => (
        <Button
            onClick={() => setActiveTab(id)}
            variant={activeTab === id ? 'default' : 'ghost'}
            className={`flex items-center gap-2 font-medium ${activeTab === id ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'text-gray-600 hover:bg-gray-200'}`}
        >
            <Icon className="h-4 w-4" /> {label}
        </Button>
    );

    return (
        <div className="h-full w-full flex flex-col bg-gray-50">
             <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0 flex justify-between items-center z-10 shadow-sm">
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
