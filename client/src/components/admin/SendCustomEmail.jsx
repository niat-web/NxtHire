// client/src/components/admin/SendCustomEmail.jsx
import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useForm, Controller } from 'react-hook-form';
import DOMPurify from 'dompurify';
import { sendBulkCustomEmail } from '@/api/admin.api';
import { useAlert } from '@/hooks/useAlert';
import { Mail, Users, File, CheckCircle, Loader2, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';

const LocalButton = ({ children, onClick, type = 'button', isLoading = false, icon: Icon, variant = 'primary', className = '', disabled = false }) => {
    const variantMap = { primary: 'default', secondary: 'secondary', outline: 'outline', danger: 'destructive', ghost: 'ghost' };
    return (
        <Button type={type} onClick={onClick} isLoading={isLoading} disabled={disabled} variant={variantMap[variant] || 'default'} className={className}>
            {Icon && <Icon className={`h-4 w-4 ${children ? 'mr-2' : ''}`} />}
            {children}
        </Button>
    );
};

// Modern File Input Component
const FileInput = ({ onFileParsed, requiredColumns }) => {
    const [fileName, setFileName] = useState('');
    const [recipientCount, setRecipientCount] = useState(0);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            setFileName('');
            setRecipientCount(0);
            onFileParsed([]);
            return;
        }

        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (event) => {
            const workbook = XLSX.read(event.target.result, { type: 'binary' });
            const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
            setRecipientCount(data.length);
            onFileParsed(data);
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div>
            <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1.5">Recipients CSV/XLSX</label>
            <div className="flex items-center gap-4">
                <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-lg font-medium text-slate-700 hover:text-slate-900 border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50 shadow-md"
                >
                    <span>Choose File</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".csv, .xlsx" />
                </label>
                <div className="flex-1 text-sm text-gray-500 truncate">
                    {fileName || "No file chosen"}
                </div>
                {recipientCount > 0 && (
                    <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                        <CheckCircle />
                        <span>{recipientCount} recipient{recipientCount > 1 ? 's' : ''} loaded.</span>
                    </div>
                )}
            </div>
            <p className="mt-2 text-xs text-gray-400">Required columns: {requiredColumns.join(', ')}</p>
        </div>
    );
};

const SendCustomEmail = ({ templates }) => {
    const { showSuccess, showError } = useAlert();
    const [recipients, setRecipients] = useState([]);
    const [isSending, setIsSending] = useState(false);
    const { control, handleSubmit, watch } = useForm();
    
    const selectedTemplateId = watch('template');
    
    const selectedTemplate = useMemo(() => {
        return templates.find(t => t._id === selectedTemplateId);
    }, [selectedTemplateId, templates]);

    const previewContent = useMemo(() => {
        if (!selectedTemplate || recipients.length === 0) return { subject: '', body: '' };
        
        const firstRecipient = recipients[0];
        let body = selectedTemplate.body;
        let subject = selectedTemplate.subject;

        // Replace placeholders with data from the first row
        for (const key in firstRecipient) {
            const placeholder = `{{${key}}}`;
            body = body.replace(new RegExp(placeholder, 'g'), firstRecipient[key] || '');
            subject = subject.replace(new RegExp(placeholder, 'g'), firstRecipient[key] || '');
        }

        return { subject, body: DOMPurify.sanitize(body) };
    }, [selectedTemplate, recipients]);

    const onSubmit = async (data) => {
        if (!data.template) { return showError("Please select an email template."); }
        if (recipients.length === 0) { return showError("Please upload a file with recipients."); }

        setIsSending(true);
        try {
            await sendBulkCustomEmail({
                templateId: data.template,
                recipients: recipients,
            });
            showSuccess(`Email sent to ${recipients.length} recipients successfully!`);
        } catch (err) {
            showError(err.response?.data?.message || "Failed to send emails.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col h-full overflow-hidden">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">

                {/* --- MIDDLE SCROLLABLE AREA --- */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {/* Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1.5">Select Template</label>
                            <Controller
                                name="template"
                                control={control}
                                render={({ field }) => (
                                    <select {...field} className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium focus:ring-1 focus:ring-gray-900 focus:border-gray-900 cursor-pointer shadow-md transition-all">
                                        <option value="">Select a template...</option>
                                        {templates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                    </select>
                                )}
                            />
                        </div>

                        <FileInput onFileParsed={setRecipients} requiredColumns={['Email', 'Fullname', 'Report Link']} />
                    </div>

                    {/* Live Preview */}
                    {selectedTemplate && recipients.length > 0 && (
                        <div>
                            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Live Preview (From First Row of Data)</label>
                            
                            {/* Gmail-style Preview */}
                            <div className="border border-gray-200 rounded-xl shadow-md bg-white">
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <h2 className="text-xl font-semibold text-gray-800">{previewContent.subject}</h2>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="h-10 w-10 bg-slate-700 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                            N
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">NxtWave<span className="font-normal text-gray-500 text-sm">&lt;interviewercommunity@nxtwave.in&gt;</span></p>
                                            <p className="text-sm text-gray-500">to me</p>
                                        </div>
                                    </div>
                                    <div 
                                        className="prose prose-sm max-w-none text-gray-800" 
                                        dangerouslySetInnerHTML={{ __html: previewContent.body }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* --- STICKY FOOTER --- */}
                <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-white flex justify-end items-center">
                    <LocalButton 
                        type="submit" 
                        isLoading={isSending} 
                        disabled={isSending || recipients.length === 0 || !selectedTemplate}
                        icon={Send}
                        variant="primary"
                    >
                        Send to {recipients.length} Recipient{recipients.length !== 1 ? 's' : ''}
                    </LocalButton>
                </div>
            </form>
        </div>
    );
};

export default SendCustomEmail;
