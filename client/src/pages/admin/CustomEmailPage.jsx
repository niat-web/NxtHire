// client/src/pages/admin/CustomEmailPage.jsx
import React, { useState } from 'react';
import CreateEmailTemplate from '@/components/admin/CreateEmailTemplate';
import SendCustomEmail from '@/components/admin/SendCustomEmail';
import { useCustomEmailTemplates, useInvalidateAdmin } from '@/hooks/useAdminQueries';
import { Send, Edit, Mail, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import 'react-quill/dist/quill.snow.css';

const CustomEmailPage = () => {
    const [activeTab, setActiveTab] = useState('send');
    const { data: templates = [], isLoading: loading } = useCustomEmailTemplates();
    const { invalidateCustomEmails } = useInvalidateAdmin();

    if (loading && templates.length === 0) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-slate-700 rounded-full animate-spin mx-auto mb-4" />
                    <span className="text-sm text-gray-500">Loading Email Center...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex overflow-hidden">

            {/* Left Sidebar */}
            <div className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h2 className="text-base font-semibold text-gray-900">Email Center</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{templates.length} templates</p>
                </div>

                <nav className="flex-1 p-3 space-y-0.5">
                    <Button onClick={() => setActiveTab('send')}
                        variant={activeTab === 'send' ? 'default' : 'ghost'}
                        className={`flex items-center gap-2.5 w-full justify-start px-3 py-2.5 text-sm font-medium`}>
                        <Send className={`w-4 h-4 ${activeTab === 'send' ? 'text-white' : 'text-gray-400'}`} />
                        Send Emails
                    </Button>
                    <Button onClick={() => setActiveTab('create')}
                        variant={activeTab === 'create' ? 'default' : 'ghost'}
                        className={`flex items-center gap-2.5 w-full justify-start px-3 py-2.5 text-sm font-medium`}>
                        <FileText className={`w-4 h-4 ${activeTab === 'create' ? 'text-white' : 'text-gray-400'}`} />
                        Manage Templates
                    </Button>
                </nav>

                {/* Quick Stats */}
                <div className="p-4 border-t border-gray-100">
                    <div className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Templates</span>
                        </div>
                        <div className="space-y-1.5">
                            {templates.slice(0, 4).map(t => (
                                <p key={t._id} className="text-xs text-gray-600 truncate" title={t.name}>{t.name}</p>
                            ))}
                            {templates.length > 4 && (
                                <p className="text-xs text-gray-400">+{templates.length - 4} more</p>
                            )}
                            {templates.length === 0 && (
                                <p className="text-xs text-gray-400 italic">No templates yet</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden flex flex-col bg-gray-50">
                {activeTab === 'send' ? (
                    <SendCustomEmail templates={templates} isLoading={loading} refreshTemplates={invalidateCustomEmails} />
                ) : (
                    <CreateEmailTemplate refreshTemplates={invalidateCustomEmails} />
                )}
            </div>
        </div>
    );
};

export default CustomEmailPage;
