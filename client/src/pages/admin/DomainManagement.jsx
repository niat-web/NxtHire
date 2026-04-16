// client/src/pages/admin/DomainManagement.jsx
import { useState } from 'react';
import DomainsTab from '@/components/admin/DomainsTab';
import DomainFieldsTab from '@/components/admin/DomainFieldsTab';
import { useDomains } from '@/hooks/useAdminQueries';
import { Grid, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import Loader from '@/components/common/Loader';

const navItems = [
  { id: 'domains', label: 'Domains', icon: Grid },
  { id: 'fields', label: 'Domain Fields', icon: Settings },
];

const DomainManagement = () => {
    const { data: domains = [], isLoading: loading, refetch: fetchDomains } = useDomains();
    const [activeTab, setActiveTab] = useState('domains');
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
            <div className="flex h-full items-center justify-center bg-[#f5f7fb]">
                <Loader size="lg" />
            </div>
        );
    }

    return (
        <div className="flex h-full w-full overflow-hidden">
            {/* Left sidebar */}
            <aside className="w-56 shrink-0 bg-[#f0f4fa] border-r border-slate-200/80 flex flex-col">
                <nav className="flex-1 p-3 space-y-1">
                    {navItems.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={cn(
                                'group relative flex items-center w-full gap-2.5 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all duration-200',
                                activeTab === id
                                    ? 'bg-white text-blue-700 shadow-sm border border-slate-200/60'
                                    : 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{label}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Right content */}
            <main className="flex-1 overflow-y-auto bg-[#f5f7fb] custom-scrollbar">
                <div className="h-full">
                    {activeTab === 'domains' && (
                        <DomainsTab domains={domains} onUpdate={fetchDomains} onDomainClick={handleDomainClick} />
                    )}
                    {activeTab === 'fields' && (
                        <DomainFieldsTab domains={domains} selectedDomain={selectedDomainForFields} setSelectedDomain={setSelectedDomainForFields} />
                    )}
                </div>
            </main>
        </div>
    );
};

export default DomainManagement;
