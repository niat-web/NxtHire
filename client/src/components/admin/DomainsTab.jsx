// client/src/components/admin/DomainsTab.jsx
import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import {
    Plus,
    Edit,
    Trash2,
    AlertTriangle,
    Link2,
    Search,
    Download,
    CheckCircle,
    Settings,
    X
} from 'lucide-react';
import { createDomain, updateDomain, deleteDomain } from '@/api/admin.api';
import { useAlert } from '@/hooks/useAlert';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const LocalModal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm" onClick={onClose}>
            <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-200 text-gray-500"><X className="h-5 w-5"/></button>
                </div>
                {children}
            </div>
        </div>
    );
};

const LocalInput = React.forwardRef(({ label, name, error, ...props }, ref) => (
    <div className="w-full">
        <label htmlFor={name} className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1.5">{label}</label>
        <input
            id={name} name={name} ref={ref} {...props}
            className={cn('w-full px-3 py-2.5 border rounded-lg text-sm bg-white focus:outline-none focus:ring-1 transition-colors', error ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-gray-900 focus:ring-gray-900')}
        />
        {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
    </div>
));
LocalInput.displayName = 'LocalInput';

const LocalConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }) => (
     <LocalModal isOpen={isOpen} onClose={onClose} title={title}>
         <div className="p-6 flex flex-col items-center text-center">
             <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center mb-4 border border-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
             </div>
             <p className="text-sm text-gray-500">{message}</p>
         </div>
         <div className="bg-gray-50 px-6 py-4 flex justify-center gap-3 border-t border-gray-100 rounded-b-xl">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button variant="destructive" onClick={onConfirm}>Confirm</Button>
        </div>
     </LocalModal>
);

// --- MAIN DOMAINS TAB COMPONENT ---
const DomainsTab = ({ domains, onUpdate, onDomainClick }) => {
    const { showSuccess, showError } = useAlert();
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
    const [modalState, setModalState] = useState({ isOpen: false, data: null });
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });
    const [searchTerm, setSearchTerm] = useState('');

    const filteredDomains = useMemo(() => {
        if (!searchTerm) return domains;
        return domains.filter(d => d.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [domains, searchTerm]);

    const openModal = (data = null) => {
        reset(data || { name: '', eventTitle: '', interviewHelpDoc: '' });
        setModalState({ isOpen: true, data });
    };

    const closeModal = () => setModalState({ isOpen: false, data: null });

    const onSubmit = async (data) => {
        try {
            if (modalState.data) await updateDomain(modalState.data._id, data);
            else await createDomain(data);
            showSuccess(`Domain ${modalState.data ? 'updated' : 'created'} successfully.`);
            onUpdate();
            closeModal();
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to save domain.');
        }
    };
    
    const handleDelete = async () => {
        try {
            await deleteDomain(deleteDialog.id);
            showSuccess('Domain deleted successfully.');
            onUpdate();
            setDeleteDialog({ isOpen: false, id: null });
        } catch (error) {
            showError('Failed to delete domain.');
        }
    };

    const handleExport = () => {
        if (!domains?.length) return showError("No domains to export.");
        const data = domains.map(d => ({ 'Domain Name': d.name, 'Event Title': d.eventTitle, 'Help Doc': d.interviewHelpDoc }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Domains');
        saveAs(new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })]), `Domains_Export.xlsx`);
        showSuccess("Export started.");
    };

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input 
                        type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search domains..."
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleExport}><Download className="mr-2 h-4 w-4" />Export</Button>
                    <Button onClick={() => openModal()}><Plus className="mr-2 h-4 w-4" />Add Domain</Button>
                </div>
            </div>
            
            {/* Table Body */}
            <div className="flex-1 overflow-y-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Domain</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Event Title</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Help Doc</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredDomains.map((domain) => (
                            <tr key={domain._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-semibold text-gray-900 flex items-center gap-2">
                                    {/* --- CHECKMARK INDICATOR --- */}
                                    {domain.hasEvaluationSheet ? (
                                        <CheckCircle 
                                            className="h-4 w-4 text-green-500 flex-shrink-0" 
                                            title="Evaluation sheet is configured" 
                                        />
                                    ) : (
                                        <div className="w-4 h-4 flex-shrink-0" title="No evaluation sheet configured"></div>
                                    )}
                                    {domain.name}
                                </td>
                                <td className="px-6 py-4 text-gray-600">{domain.eventTitle}</td>
                                <td className="px-6 py-4">
                                    {domain.interviewHelpDoc ? (
                                        <a href={domain.interviewHelpDoc} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium text-xs">
                                            <Link2 /> View Link
                                        </a>
                                    ) : <span className="text-gray-400 text-xs">-</span>}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => onDomainClick(domain)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Configure Fields"><Settings /></button>
                                        <button onClick={() => openModal(domain)} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg" title="Edit Domain"><Edit /></button>
                                        <button onClick={() => setDeleteDialog({ isOpen: true, id: domain._id })} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete Domain"><Trash2 /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {domains.length > 0 && filteredDomains.length === 0 && (
                    <div className="p-8 text-center text-gray-500">No domains match your search.</div>
                )}
                {domains.length === 0 && (
                    <div className="p-8 text-center text-gray-500">No domains added yet.</div>
                )}
            </div>
            
            <LocalModal isOpen={modalState.isOpen} onClose={closeModal} title={modalState.data ? 'Edit Domain' : 'Add New Domain'}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="p-6 space-y-4">
                        <LocalInput label="Domain Name" name="name" {...register('name', { required: 'Required' })} error={errors.name?.message} />
                        <LocalInput label="Event Title" name="eventTitle" {...register('eventTitle')} />
                        <LocalInput label="Help Document URL" name="interviewHelpDoc" {...register('interviewHelpDoc')} />
                    </div>
                    <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100 rounded-b-xl">
                        <Button variant="outline" type="button" onClick={closeModal}>Cancel</Button>
                        <Button type="submit" isLoading={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Domain'}</Button>
                    </div>
                </form>
            </LocalModal>
            
            <LocalConfirmDialog 
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, id: null })}
                onConfirm={handleDelete}
                title="Delete Domain"
                message="Are you sure? This will also delete any evaluation sheet associated with this domain."
            />
        </div>
    );
};

export default DomainsTab;
