// // client/src/components/admin/DomainsTab.jsx
// import React, { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { FiPlus, FiEdit, FiTrash2, FiAlertTriangle } from 'react-icons/fi';
// import { createDomain, updateDomain, deleteDomain } from '@/api/admin.api';
// import { useAlert } from '@/hooks/useAlert';

// // --- SELF-CONTAINED UI COMPONENTS USING TAILWIND CSS ---

// const LocalButton = ({ children, onClick, variant = 'primary', icon: Icon, disabled = false, isLoading = false, type = 'button', className = '' }) => {
//     const baseClasses = "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
//     const variantClasses = {
//         primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
//         danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
//         outline: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500',
//         ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-indigo-500 shadow-none !p-2',
//     };
    
//     const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;
    
//     return (
//         <button
//             type={type}
//             onClick={onClick}
//             disabled={disabled || isLoading}
//             className={combinedClasses}
//         >
//             {isLoading ? (
//                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
//             ) : (Icon && <Icon className="mr-2 h-4 w-4" />)}
//             {children}
//         </button>
//     );
// };

// const LocalModal = ({ isOpen, onClose, title, children }) => {
//     if (!isOpen) return null;
//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
//             <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
//                 <div className="px-6 py-4 border-b">
//                     <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
//                 </div>
//                 <div className="p-6">{children}</div>
//             </div>
//         </div>
//     );
// };

// const LocalInput = React.forwardRef(({ label, name, error, ...props }, ref) => (
//     <div className="w-full">
//         <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
//         <input
//             id={name}
//             name={name}
//             ref={ref}
//             {...props}
//             className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
//         />
//         {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
//     </div>
// ));
// LocalInput.displayName = 'LocalInput';


// const LocalConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }) => (
//      <LocalModal isOpen={isOpen} onClose={onClose} title={title}>
//          <div className="flex items-start">
//             <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
//                 <FiAlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
//             </div>
//             <div className="ml-4">
//                 <p className="text-sm text-gray-500">{message}</p>
//             </div>
//          </div>
//         <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
//             <LocalButton variant="danger" onClick={onConfirm}>Confirm</LocalButton>
//             <LocalButton variant="outline" onClick={onClose}>Cancel</LocalButton>
//         </div>
//      </LocalModal>
// );

// // --- MAIN DOMAINS TAB COMPONENT ---
// const DomainsTab = ({ domains, onUpdate }) => {
//     const { showSuccess, showError } = useAlert();
//     const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

//     const [modalState, setModalState] = useState({ isOpen: false, data: null });
//     const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });

//     const openModal = (data = null) => {
//         reset(data ? { name: data.name, eventTitle: data.eventTitle } : { name: '', eventTitle: '' });
//         setModalState({ isOpen: true, data });
//     };

//     const closeModal = () => setModalState({ isOpen: false, data: null });

//     const onSubmit = async (data) => {
//         try {
//             if (modalState.data) {
//                 await updateDomain(modalState.data._id, data);
//                 showSuccess('Domain updated successfully.');
//             } else {
//                 await createDomain(data);
//                 showSuccess('Domain created successfully.');
//             }
//             onUpdate();
//             closeModal();
//         } catch (error) {
//             showError(error.response?.data?.message || 'Failed to save domain.');
//         }
//     };
    
//     const handleDelete = async () => {
//         try {
//             await deleteDomain(deleteDialog.id);
//             showSuccess('Domain deleted successfully.');
//             onUpdate();
//             setDeleteDialog({ isOpen: false, id: null });
//         } catch (error) {
//             showError('Failed to delete domain.');
//         }
//     };

//     return (
//         <div>
//             <div className="flex justify-between items-center mb-4">
//                 <p className="text-gray-600">Manage the technical domains used across the platform.</p>
//                 <LocalButton icon={FiPlus} onClick={() => openModal()}>Add Domain</LocalButton>
//             </div>
            
//             <div className="bg-white border rounded-lg overflow-hidden">
//                 <ul className="divide-y divide-gray-200">
//                     {domains.map((domain) => (
//                         <li key={domain._id} className="p-4 flex justify-between items-center hover:bg-gray-50/50 transition-colors">
//                             <div className="flex flex-col">
//                                 <span className="font-medium text-gray-800">{domain.name}</span>
//                                 {domain.eventTitle && (
//                                     <span className="text-sm text-gray-500">{domain.eventTitle}</span>
//                                 )}
//                             </div>
//                             <div className="flex items-center space-x-1">
//                                 <LocalButton variant="ghost" onClick={() => openModal(domain)}><FiEdit/></LocalButton>
//                                 <LocalButton variant="ghost" onClick={() => setDeleteDialog({ isOpen: true, id: domain._id })}><FiTrash2 className="text-red-500"/></LocalButton>
//                             </div>
//                         </li>
//                     ))}
//                     {domains.length === 0 && (
//                         <li className="p-8 text-center text-gray-500">
//                             No domains have been added yet.
//                         </li>
//                     )}
//                 </ul>
//             </div>
            
//             <LocalModal isOpen={modalState.isOpen} onClose={closeModal} title={modalState.data ? 'Edit Domain' : 'Add New Domain'}>
//                 <form onSubmit={handleSubmit(onSubmit)}>
//                     <div className="space-y-4">
//                         <LocalInput
//                             label="Domain Name"
//                             name="name"
//                             {...register('name', { required: 'Domain name is required.' })}
//                             error={errors.name?.message}
//                         />
//                         <LocalInput
//                             label="Domain Event Title"
//                             name="eventTitle"
//                             {...register('eventTitle')}
//                             error={errors.eventTitle?.message}
//                         />
//                     </div>
//                     <div className="flex justify-end gap-3 mt-6">
//                         <LocalButton variant="outline" type="button" onClick={closeModal}>Cancel</LocalButton>
//                         <LocalButton type="submit" isLoading={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</LocalButton>
//                     </div>
//                 </form>
//             </LocalModal>
            
//             <LocalConfirmDialog 
//                 isOpen={deleteDialog.isOpen}
//                 onClose={() => setDeleteDialog({ isOpen: false, id: null })}
//                 onConfirm={handleDelete}
//                 title="Delete Domain"
//                 message="Are you sure? This will also delete any evaluation sheet associated with this domain. This action cannot be undone."
//             />
//         </div>
//     );
// };

// export default DomainsTab;


// C:/Users/NxtWave/Desktop/Testing/Interviewer community/interviewer-hiring-system/interviewer-hiring-system/client/src/components/admin/DomainsTab.jsx
import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { 
    FiPlus, 
    FiEdit, 
    FiTrash2, 
    FiAlertTriangle, 
    FiLink, 
    FiSearch, 
    FiDownload, 
    FiCheckCircle 
} from 'react-icons/fi';
import { createDomain, updateDomain, deleteDomain } from '@/api/admin.api';
import { useAlert } from '@/hooks/useAlert';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// --- SELF-CONTAINED UI COMPONENTS USING TAILWIND CSS ---

const LocalButton = ({ children, onClick, variant = 'primary', icon: Icon, disabled = false, isLoading = false, type = 'button', className = '' }) => {
    const baseClasses = "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variantClasses = {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        outline: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500',
        ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-indigo-500 shadow-none !p-2',
    };
    
    const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;
    
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || isLoading}
            className={combinedClasses}
        >
            {isLoading ? (
                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
            ) : (Icon && <Icon className="mr-2 h-4 w-4" />)}
            {children}
        </button>
    );
};

const LocalModal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="px-6 py-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};

const LocalInput = React.forwardRef(({ label, name, error, ...props }, ref) => (
    <div className="w-full">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
            id={name}
            name={name}
            ref={ref}
            {...props}
            className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
));
LocalInput.displayName = 'LocalInput';

const LocalConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }) => (
     <LocalModal isOpen={isOpen} onClose={onClose} title={title}>
         <div className="flex items-start">
            <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <FiAlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <div className="ml-4">
                <p className="text-sm text-gray-500">{message}</p>
            </div>
         </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
            <LocalButton variant="danger" onClick={onConfirm}>Confirm</LocalButton>
            <LocalButton variant="outline" onClick={onClose}>Cancel</LocalButton>
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
        const lowercasedFilter = searchTerm.toLowerCase();
        return domains.filter(domain =>
            (domain.name?.toLowerCase().includes(lowercasedFilter)) ||
            (domain.eventTitle?.toLowerCase().includes(lowercasedFilter)) ||
            (domain.interviewHelpDoc?.toLowerCase().includes(lowercasedFilter))
        );
    }, [domains, searchTerm]);

    const openModal = (data = null) => {
        reset(data ? { name: data.name, eventTitle: data.eventTitle, interviewHelpDoc: data.interviewHelpDoc } : { name: '', eventTitle: '', interviewHelpDoc: '' });
        setModalState({ isOpen: true, data });
    };

    const closeModal = () => setModalState({ isOpen: false, data: null });

    const onSubmit = async (data) => {
        try {
            if (modalState.data) {
                await updateDomain(modalState.data._id, data);
                showSuccess('Domain updated successfully.');
            } else {
                await createDomain(data);
                showSuccess('Domain created successfully.');
            }
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
        if (!domains || domains.length === 0) {
            showError("No domains to export.");
            return;
        }
        const dataToExport = domains.map(domain => ({
            'Domain Name': domain.name,
            'Event Title': domain.eventTitle || '',
            'Interview Help Document': domain.interviewHelpDoc || ''
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Domains');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        saveAs(blob, `Domains_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
        showSuccess("Export started successfully.");
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div className="relative w-full md:w-1/2">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by domain, event title, or document link..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <LocalButton variant="outline" icon={FiDownload} onClick={handleExport}>Export</LocalButton>
                    <LocalButton icon={FiPlus} onClick={() => openModal()}>Add Domain</LocalButton>
                </div>
            </div>
            
            <div className="bg-white border rounded-lg overflow-hidden">
                <ul className="divide-y divide-gray-200">
                    {filteredDomains.map((domain) => (
                        <li key={domain._id} className="p-4 flex justify-between items-center hover:bg-gray-50/50 transition-colors">
                            <div className="flex-grow grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-1 items-center pr-4">
                                <div className="md:col-span-3 flex items-center gap-3">
                                    {domain.hasEvaluationSheet ? (
                                        <FiCheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" title="Evaluation fields configured" />
                                    ) : (
                                        <div className="w-5 h-5 flex-shrink-0" />
                                    )}
                                    <button
                                        onClick={() => onDomainClick(domain)}
                                        className="font-medium text-blue-600 text-left hover:text-blue-800 hover:underline transition-colors focus:outline-none truncate"
                                        title={domain.name}
                                    >
                                        {domain.name}
                                    </button>
                                </div>
                                <div className="md:col-span-4 text-sm text-gray-500 truncate" title={domain.eventTitle}>
                                    {domain.eventTitle}
                                </div>
                                <div className="md:col-span-5">
                                    {domain.interviewHelpDoc && (
                                        <div>
                                            <a href={domain.interviewHelpDoc} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs text-blue-500 hover:text-blue-700">
                                                <FiLink className="mr-1 h-3 w-3" />
                                                Interview Help Document
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center space-x-1 flex-shrink-0">
                                <LocalButton variant="ghost" onClick={() => openModal(domain)}><FiEdit/></LocalButton>
                                <LocalButton variant="ghost" onClick={() => setDeleteDialog({ isOpen: true, id: domain._id })}><FiTrash2 className="text-red-500"/></LocalButton>
                            </div>
                        </li>
                    ))}
                    {domains.length > 0 && filteredDomains.length === 0 && (
                        <li className="p-8 text-center text-gray-500">
                            No domains match your search.
                        </li>
                    )}
                    {domains.length === 0 && (
                        <li className="p-8 text-center text-gray-500">
                            No domains have been added yet.
                        </li>
                    )}
                </ul>
            </div>
            
            <LocalModal isOpen={modalState.isOpen} onClose={closeModal} title={modalState.data ? 'Edit Domain' : 'Add New Domain'}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <LocalInput
                            label="Domain Name"
                            name="name"
                            {...register('name', { required: 'Domain name is required.' })}
                            error={errors.name?.message}
                        />
                        <LocalInput
                            label="Domain Event Title"
                            name="eventTitle"
                            {...register('eventTitle')}
                            error={errors.eventTitle?.message}
                        />
                        <LocalInput
                            label="Interview Help Document"
                            name="interviewHelpDoc"
                            {...register('interviewHelpDoc')}
                            error={errors.interviewHelpDoc?.message}
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <LocalButton variant="outline" type="button" onClick={closeModal}>Cancel</LocalButton>
                        <LocalButton type="submit" isLoading={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</LocalButton>
                    </div>
                </form>
            </LocalModal>
            
            <LocalConfirmDialog 
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, id: null })}
                onConfirm={handleDelete}
                title="Delete Domain"
                message="Are you sure? This will also delete any evaluation sheet associated with this domain. This action cannot be undone."
            />
        </div>
    );
};

export default DomainsTab;
