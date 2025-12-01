// client/src/pages/admin/CustomEmailPage.jsx
import React, {useState, useEffect, useCallback } from 'react';
import Loader from '@/components/common/Loader';
import CreateEmailTemplate from '@/components/admin/CreateEmailTemplate';
import SendCustomEmail from '@/components/admin/SendCustomEmail';
import { getCustomEmailTemplates } from '@/api/admin.api';
import { useAlert } from '@/hooks/useAlert';
import { FiMail, FiEdit, FiSend } from 'react-icons/fi';
import 'react-quill/dist/quill.snow.css';

const CustomEmailPage = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('send'); // 'send' or 'create'
    const { showError } = useAlert();

    const fetchTemplates = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getCustomEmailTemplates();
            setTemplates(res.data.data);
        } catch (error) {
            showError("Failed to fetch email templates.");
        } finally {
            setLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    if (loading && templates.length === 0) {
        return (
            <div className="flex h-full items-center justify-center bg-[#F5F7F9]">
                <div className="flex flex-col items-center">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4"></div>
                    <span className="text-sm font-medium text-gray-500">Loading Email Center...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full flex flex-col bg-[#F5F7F9]">
             {/* Header */}
             <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0 flex justify-between items-center z-10 shadow-sm">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                        <FiMail className="h-5 w-5 text-gray-600" />
                    </div>
                 </div>
                 
                 {/* Custom Tab Switcher */}
                 <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button 
                        onClick={() => setActiveTab('send')} 
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'send' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'}`}
                    >
                        <FiSend className="h-4 w-4" /> Send Emails
                    </button>
                    <button 
                        onClick={() => setActiveTab('create')} 
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'create' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'}`}
                    >
                        <FiEdit className="h-4 w-4" /> Manage Templates
                    </button>
                 </div>
             </div>

             {/* Content Area */}
             <div className="flex-grow p-6 overflow-hidden">
                 <div className="h-full max-w-6xl mx-auto flex flex-col">
                    {activeTab === 'send' ? (
                        <SendCustomEmail 
                            templates={templates} 
                            isLoading={loading}
                            refreshTemplates={fetchTemplates}
                        />
                    ) : (
                        <CreateEmailTemplate refreshTemplates={fetchTemplates} /> 
                    )}
                 </div>
             </div>
        </div>
    );
};

export default CustomEmailPage;
