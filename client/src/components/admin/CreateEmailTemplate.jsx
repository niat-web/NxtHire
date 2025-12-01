// client/src/components/admin/CreateEmailTemplate.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { createCustomEmailTemplate, updateCustomEmailTemplate, getCustomEmailTemplates, deleteCustomEmailTemplate } from '@/api/admin.api';
import { useAlert } from '@/hooks/useAlert';
import { FiEdit, FiTrash2, FiPlus, FiSave, FiEye, FiClipboard, FiInbox, FiCheck, FiCode } from 'react-icons/fi';
import DOMPurify from 'dompurify';
import ConfirmDialog from '../common/ConfirmDialog';

// Styled Button Component
const LocalButton = ({ children, onClick, type = 'button', isLoading = false, icon: Icon, variant = 'primary', className = '' }) => {
    const base = "inline-flex items-center justify-center font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-[0.98] text-sm px-4 py-2.5";
    const variants = {
        primary: 'bg-gray-900 text-white hover:bg-black border border-transparent shadow-sm focus:ring-gray-900',
        secondary: 'bg-[#FFD130] text-gray-900 hover:bg-[#FFC400] border border-[#FFD130] shadow-sm',
        outline: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400',
        danger: 'bg-white text-red-600 border border-red-200 hover:bg-red-50',
    };

    return (
        <button type={type} onClick={onClick} disabled={isLoading} className={`${base} ${variants[variant]} ${className}`}>
            {isLoading ? <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div> : (Icon && <Icon className={`h-4 w-4 ${children ? 'mr-2' : ''}`} />)}
            {children}
        </button>
    );
};

const CreateEmailTemplate = ({ refreshTemplates }) => {
    const { showSuccess, showError, showInfo } = useAlert();
    const [templates, setTemplates] = useState([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState(null);
    const [viewMode, setViewMode] = useState('editor');
    const [isSaving, setIsSaving] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });
    const [isCreating, setIsCreating] = useState(false);
    const quillRef = useRef(null);
    
    const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm({
        defaultValues: { name: '', subject: '', body: '' }
    });

    useEffect(() => {
        getCustomEmailTemplates().then(res => setTemplates(res.data.data)).catch(() => showError('Could not load templates.'));
    }, [showError]);
    
    useEffect(() => {
        const template = templates.find(t => t._id === selectedTemplateId);
        if (template) {
            reset({ name: template.name, subject: template.subject, body: template.body });
        } else {
            reset({ name: '', subject: '', body: '' });
        }
    }, [selectedTemplateId, templates, reset]);

    const handleCreateNew = () => {
        setSelectedTemplateId(null);
        reset({ name: '', subject: '', body: '' });
        setIsCreating(true);
    };
    
    const handleTemplateSelectChange = (e) => {
        const newId = e.target.value;
        setSelectedTemplateId(newId);
        setIsCreating(false); 
        if (!newId) {
            handleCreateNew();
            setIsCreating(false);
        }
    };
    
    const onSubmit = async (data) => {
        setIsSaving(true);
        try {
            if (selectedTemplateId) {
                await updateCustomEmailTemplate(selectedTemplateId, data);
                showSuccess('Template updated successfully!');
            } else {
                await createCustomEmailTemplate(data);
                showSuccess('Template created successfully!');
                handleCreateNew();
            }
            refreshTemplates(); 
            getCustomEmailTemplates().then(res => setTemplates(res.data.data)); 
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to save template.');
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDelete = async () => {
        if (!deleteDialog.id) return;
        try {
            await deleteCustomEmailTemplate(deleteDialog.id);
            showSuccess("Template deleted.");
            handleCreateNew();
            refreshTemplates();
            getCustomEmailTemplates().then(res => setTemplates(res.data.data));
        } catch (error) {
            showError("Failed to delete template.");
        } finally {
            setDeleteDialog({isOpen: false, id: null});
        }
    };
    
    const bodyContent = watch('body');
    const commonPlaceholders = ['Fullname', 'Email', 'Report Link'];
    
    const handlePlaceholderClick = (placeholder) => {
        const text = `{{${placeholder}}}`;
        navigator.clipboard.writeText(text);
        showInfo(`"${text}" copied to clipboard!`);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
            
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-gray-100 bg-gray-50/50 gap-4">
                 <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select
                        value={selectedTemplateId || ''}
                        onChange={handleTemplateSelectChange}
                        className="w-full sm:w-72 px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium focus:ring-1 focus:ring-gray-900 focus:border-gray-900 cursor-pointer shadow-sm transition-all"
                    >
                        <option value="">Select a Template to Edit</option>
                        {templates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>
                     {selectedTemplateId && (
                        <LocalButton variant="danger" icon={FiTrash2} onClick={() => setDeleteDialog({isOpen: true, id: selectedTemplateId})} className="!px-3" />
                     )}
                 </div>
                <LocalButton variant="secondary" icon={FiPlus} onClick={handleCreateNew}>New Template</LocalButton>
            </div>

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                { !isCreating && !selectedTemplateId && templates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <FiInbox className="h-8 w-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No Templates Found</h3>
                        <p className="text-sm text-gray-500 mt-1">Click "New Template" to create one.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Template Name</label>
                                <input {...register('name', { required: "Required" })} placeholder="e.g., Shortlisted Email" className={`w-full px-3 py-2.5 border rounded-lg text-sm bg-white focus:outline-none focus:ring-1 transition-colors ${errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-gray-900 focus:ring-gray-900'}`} />
                                {errors.name && <p className="text-xs text-red-600 mt-1 font-medium">{errors.name.message}</p>}
                            </div>
                             <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Email Subject</label>
                                <input {...register('subject', { required: "Required" })} placeholder="Subject line..." className={`w-full px-3 py-2.5 border rounded-lg text-sm bg-white focus:outline-none focus:ring-1 transition-colors ${errors.subject ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-gray-900 focus:ring-gray-900'}`}/>
                                 {errors.subject && <p className="text-xs text-red-600 mt-1 font-medium">{errors.subject.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Available Variables (Click to Copy)</label>
                            <div className="flex flex-wrap gap-2">
                                {commonPlaceholders.map(p => (
                                    <button key={p} type="button" onClick={() => handlePlaceholderClick(p)} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 text-xs font-mono font-medium px-2.5 py-1.5 rounded-md hover:bg-blue-100 transition-colors">
                                        <FiClipboard size={12}/>{`{{${p}}}`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                             <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100 bg-gray-50">
                                 <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Content Editor</label>
                                <div className="flex gap-1 bg-white p-1 rounded-lg border border-gray-200">
                                    <button type="button" onClick={() => setViewMode('editor')} className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'editor' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}><FiEdit /> Edit</button>
                                    <button type="button" onClick={() => setViewMode('preview')} className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'preview' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}><FiEye /> Preview</button>
                                </div>
                             </div>
                            
                            {viewMode === 'editor' ? (
                                 <Controller 
                                    name="body" 
                                    control={control} 
                                    rules={{ required: "Body cannot be empty" }} 
                                    render={({ field }) => {
                                        const quillModules = useMemo(() => ({
                                            toolbar: {
                                                container: [
                                                    [{ 'header': [1, 2, false] }],
                                                    ['bold', 'italic', 'underline', 'strike'],
                                                    [{'list': 'ordered'}, {'list': 'bullet'}],
                                                    ['link', 'clean'],
                                                    ['code-block'] 
                                                ],
                                                handlers: {
                                                    'code-block': function() {
                                                        const quill = this.quill;
                                                        const isHtmlView = quill.root.dataset.view === 'source';
                                                        if (isHtmlView) {
                                                            const html = quill.root.textContent;
                                                            quill.root.innerHTML = html;
                                                            delete quill.root.dataset.view;
                                                        } else {
                                                            const html = quill.root.innerHTML;
                                                            quill.root.textContent = html;
                                                            quill.root.dataset.view = 'source';
                                                        }
                                                    }
                                                }
                                            }
                                        }), []);

                                        return (
                                            <div className="quill-wrapper">
                                                <style>{`
                                                    .ql-toolbar { border: none !important; border-bottom: 1px solid #f3f4f6 !important; background: white; }
                                                    .ql-container { border: none !important; font-family: inherit; font-size: 0.95rem; min-height: 250px; }
                                                    .ql-editor { padding: 1.5rem; }
                                                    .ql-editor[data-view="source"] { font-family: monospace; background: #111827; color: #e5e7eb; }
                                                `}</style>
                                                <ReactQuill 
                                                    ref={quillRef} 
                                                    theme="snow" 
                                                    modules={quillModules} 
                                                    value={field.value} 
                                                    onChange={field.onChange} 
                                                /> 
                                            </div>
                                        );
                                    }}
                                />
                            ) : (
                                <div className="p-6 prose prose-sm max-w-none min-h-[250px] bg-white text-gray-800" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(bodyContent) }}></div>
                            )}
                        </div>
                        {errors.body && <p className="text-xs text-red-600 font-medium">{errors.body.message}</p>}

                        <div className="flex justify-end pt-2 pb-6">
                            <LocalButton type="submit" icon={FiSave} variant="primary" isLoading={isSaving} className="w-full sm:w-auto min-w-[150px]">
                                {isSaving ? 'Saving Template...' : 'Save Template'}
                            </LocalButton>
                        </div>
                    </form>
                )}
            </div>

            <ConfirmDialog isOpen={deleteDialog.isOpen} onClose={() => setDeleteDialog({isOpen: false, id: null})} onConfirm={handleDelete} title="Delete Template" message="Are you sure? This action cannot be undone." />
        </div>
    );
};

export default CreateEmailTemplate;
