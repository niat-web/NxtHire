// // client/src/components/admin/DomainFieldsTab.jsx

// import React, { useState, useEffect, useCallback } from 'react';
// import { useForm, useFieldArray } from 'react-hook-form';
// import { 
//     FiPlus, 
//     FiTrash2, 
//     FiSave, 
//     FiEdit, 
//     FiEye,
//     FiAlertCircle,
//     FiChevronDown,
//     FiChevronUp,
//     FiClipboard // *** NEW *** Icon for the paste button
// } from 'react-icons/fi';
// import { getEvaluationSheet, updateEvaluationSheet } from '@/api/admin.api';
// import { useAlert } from '@/hooks/useAlert';
// import Select from 'react-select';

// // *** NEW ***: Modal component for pasting spreadsheet data
// const BulkAddOptionsModal = ({ isOpen, onClose, onAdd }) => {
//     const [pastedText, setPastedText] = useState('');

//     const handleProcessPaste = () => {
//         if (!pastedText.trim()) {
//             onClose();
//             return;
//         }

//         const newOptions = pastedText
//             .trim()
//             .split('\n') // Split by new line for each row
//             .map(row => {
//                 const parts = row.split('\t'); // Split by tab for columns
//                 const label = (parts[0] || '').trim();
//                 // If a second column for value exists, use it. Otherwise, use the label as the value.
//                 const value = (parts[1] || label).trim();
//                 return { label, value };
//             })
//             .filter(opt => opt.label); // Filter out any completely empty rows

//         onAdd(newOptions);
//         onClose();
//     };

//     return (
//         // Using a basic modal structure for simplicity
//         <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}>
//             <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
//                 <div className="px-6 py-4 border-b">
//                     <h3 className="text-lg font-semibold text-gray-900">Paste Options from Spreadsheet</h3>
//                 </div>
//                 <div className="p-6">
//                     <p className="text-sm text-gray-600 mb-2">
//                         Copy cells from your spreadsheet (e.g., Excel, Google Sheets) and paste them here.
//                     </p>
//                     <ul className="text-xs text-gray-500 list-disc list-inside mb-4 space-y-1">
//                         <li>The first column will be the <strong>Label</strong> (what the user sees).</li>
//                         <li>The second column will be the <strong>Value</strong> (for scoring).</li>
//                         <li>If only one column is pasted, the Label will be used as the Value.</li>
//                     </ul>
//                     <textarea
//                         value={pastedText}
//                         onChange={(e) => setPastedText(e.target.value)}
//                         placeholder="Paste your data here...
// Confident & Fluent	5
// Mostly Fluent	4"
//                         className="w-full h-40 p-2 border border-gray-300 rounded-md font-mono text-sm"
//                         autoFocus
//                     />
//                 </div>
//                 <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
//                     <button type="button" className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-50" onClick={onClose}>Cancel</button>
//                     <button type="button" className="px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700" onClick={handleProcessPaste}>Add Options</button>
//                 </div>
//             </div>
//         </div>
//     );
// };


// const Button = ({ 
//     children, 
//     onClick, 
//     icon: Icon, 
//     isLoading, 
//     type = 'button', 
//     variant = 'primary', 
//     size = 'md', 
//     className = '',
//     disabled = false,
// }) => {
//     const baseClasses = "inline-flex items-center justify-center font-medium rounded-md border focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200";
    
//     const sizeClasses = { 
//         sm: 'px-2.5 py-1.5 text-xs gap-1.5',
//         md: 'px-4 py-2 text-sm gap-2',
//         lg: 'px-5 py-2.5 text-base gap-2'
//     };
    
//     const variantClasses = {
//         primary: 'bg-indigo-600 text-white border-transparent hover:bg-indigo-700 shadow-sm',
//         secondary: 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 shadow-sm',
//         outline: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 shadow-sm',
//         ghost: 'bg-transparent text-gray-500 border-transparent hover:bg-gray-100',
//         success: 'bg-green-600 text-white border-transparent hover:bg-green-700 shadow-sm',
//         danger: 'bg-red-500 text-white border-transparent hover:bg-red-600 shadow-sm',
//     };
    
//     const combinedClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;
    
//     return (
//         <button 
//             type={type} 
//             onClick={onClick} 
//             disabled={isLoading || disabled} 
//             className={combinedClasses}
//         >
//             {isLoading ? (
//                 <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
//             ) : (
//                 Icon && <Icon className="h-4 w-4 flex-shrink-0" />
//             )}
//             {children}
//         </button>
//     );
// };


// const Card = ({ children, className = '' }) => (
//     <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
//         {children}
//     </div>
// );

// const Badge = ({ children, variant = 'default' }) => {
//     const variants = {
//         default: 'bg-gray-100 text-gray-800',
//         primary: 'bg-indigo-100 text-indigo-800',
//     };
    
//     return (
//         <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
//             {children}
//         </span>
//     );
// };

// const PreviewComponent = ({ sheetData }) => {
//     const { columnGroups = [] } = sheetData;
    
//     const categoryColors = [
//         'bg-purple-100 text-purple-800', 'bg-blue-100 text-blue-800', 'bg-teal-100 text-teal-800',
//         'bg-amber-100 text-amber-800', 'bg-emerald-100 text-emerald-800',
//     ];

//     // *** MODIFIED: This function now only returns text color and font weight classes ***
//     const getOptionStyle = (value) => {
//         const stringValue = String(value).trim();
//         switch (stringValue) {
//             case '5': return 'text-green-700 font-bold';
//             case '4': return 'text-green-600 font-medium';
//             case '3': return 'text-yellow-600 font-medium';
//             case '2': return 'text-red-500 font-medium';
//             case '1': return 'text-red-700 font-bold';
//             default: return 'text-gray-800';
//         }
//     };
    
//     if (columnGroups.length === 0) {
//         return (
//             <Card className="p-6 text-center">
//                 <FiAlertCircle className="mx-auto h-10 w-10 text-gray-400 mb-4" />
//                 <h3 className="text-lg font-medium text-gray-900 mb-2">No Evaluation Parameters</h3>
//                 <p className="text-gray-500">Add categories to see the preview</p>
//             </Card>
//         );
//     }

//     return (
//         <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
//             <div className="overflow-x-auto max-h-96">
//                 <table className="min-w-full text-sm border-collapse">
//                     <thead className="sticky top-0 z-10">
//                         <tr>
//                             {columnGroups.map((group, groupIndex) => (
//                                 <th 
//                                     key={groupIndex} 
//                                     colSpan={group.columns?.length || 1} 
//                                     className={`p-2 border-r border-gray-200 text-center font-semibold ${categoryColors[groupIndex % categoryColors.length]}`}
//                                 >
//                                     {group.title || `Category ${groupIndex + 1}`}
//                                 </th>
//                             ))}
//                         </tr>
//                         <tr>
//                             {columnGroups.map((group, groupIndex) =>
//                                 (group.columns?.length > 0) ? (
//                                     group.columns.map((column, colIndex) => (
//                                         <th key={`${groupIndex}-${colIndex}`} className="p-2.5 border border-gray-200 text-center font-semibold bg-gray-50 whitespace-nowrap">
//                                             {column.header || ``}
//                                         </th>
//                                     ))
//                                 ) : null
//                             )}
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {Array.from({ length: 5 }).map((_, rowIndex) => (
//                             <tr key={rowIndex} className="hover:bg-gray-50">
//                                 {columnGroups.map((group, groupIndex) =>
//                                     (group.columns?.length > 0) ? (
//                                         group.columns.map((column, colIndex) => (
//                                             <td key={`${rowIndex}-${groupIndex}-${colIndex}`} className="p-0 border border-gray-200">
//                                                 <select className="w-full h-full p-2 border-0 focus:ring-1 focus:outline-none bg-transparent" defaultValue="">
//                                                     <option value="" className="text-gray-400">Select...</option>
//                                                     {column.options?.map((opt, optIndex) => (
//                                                         <option key={optIndex} value={opt.value} className={getOptionStyle(opt.value)}>
//                                                             {opt.label}
//                                                         </option>
//                                                     ))}
//                                                 </select>
//                                             </td>
//                                         ))
//                                     ) : null
//                                 )}
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };

// const OptionsArray = ({ groupIndex, colIndex, control, register, onBulkAddClick }) => { // *** NEW ***: Add onBulkAddClick prop
//     const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({ 
//         control, 
//         name: `columnGroups.${groupIndex}.columns.${colIndex}.options` 
//     });
    
//     return (
//         <div className="space-y-1.5">
//             <div className="space-y-1.5 max-h-32 overflow-y-auto pr-2">
//                 {optionFields.map((opt, optIndex) => (
//                     <div key={opt.id} className="flex items-center gap-1.5 p-1.5 bg-gray-50/70 rounded">
//                         <input {...register(`columnGroups.${groupIndex}.columns.${colIndex}.options.${optIndex}.label`)} placeholder="Label" className="w-full p-1.5 text-xs border border-gray-200 rounded" />
//                         <input {...register(`columnGroups.${groupIndex}.columns.${colIndex}.options.${optIndex}.value`)} placeholder="Value" className="w-1/2 p-1.5 text-xs border border-gray-200 rounded" />
//                         <button type="button" className="text-red-400 hover:text-red-600 p-1" onClick={() => removeOption(optIndex)}>
//                             <FiTrash2 className="h-3.5 w-3.5" />
//                         </button>
//                     </div>
//                 ))}
//             </div>
//             <div className="flex gap-2"> {/* *** NEW ***: Flex container for buttons */}
//                 <Button type="button" variant="outline" size="sm" icon={FiPlus} onClick={() => appendOption({label: '', value: ''})} className="flex-grow !py-1">
//                     Add Option
//                 </Button>
//                 {/* *** NEW ***: Button to trigger bulk add modal */}
//                 <Button type="button" variant="outline" size="sm" icon={FiClipboard} onClick={onBulkAddClick} className="!py-1" title="Paste from Spreadsheet"></Button>
//             </div>
//         </div>
//     );
// };

// const ColumnGroup = ({ groupIndex, control, register, removeGroup, onBulkAddClick }) => { // *** NEW ***: Add onBulkAddClick prop
//     const { fields: columnFields, append: appendColumn, remove: removeColumn } = useFieldArray({ 
//         control, 
//         name: `columnGroups.${groupIndex}.columns` 
//     });
    
//     const [collapsed, setCollapsed] = useState(false);
    
//     return (
//         <Card>
//             <div className=" bg-gray-50 border-b">
//                 <div className="flex items-center justify-between p-2">
//                     <div className="flex items-center gap-2 flex-1">
//                         <button type="button" className="text-gray-500 hover:bg-gray-200 p-1 rounded-sm" onClick={() => setCollapsed(!collapsed)}>
//                             {collapsed ? <FiChevronDown className="h-4 w-4" /> : <FiChevronUp className="h-4 w-4" />}
//                         </button>
//                         <input {...register(`columnGroups.${groupIndex}.title`)} className="text-base font-bold border-none p-1 bg-transparent flex-1 focus:ring-1 focus:ring-indigo-300 rounded-sm" placeholder="Enter category title" />
//                     </div>
//                     <div className="flex items-center gap-4">
//                         <Button
//                             type="button"
//                             variant="secondary"
//                             size="sm"
//                             icon={FiPlus}
//                             onClick={() => {
//                                 appendColumn({ header: '', options: [] });
//                                 if (collapsed) setCollapsed(false);
//                             }}
//                         >
//                           Add Parameter
//                         </Button>
//                         <Badge variant="primary">{columnFields.length} parameters</Badge>
//                         <button type="button" className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-full" onClick={() => removeGroup(groupIndex)}>
//                             <FiTrash2 className="h-4 w-4" />
//                         </button>
//                     </div>
//                 </div>
//             </div>
            
//             {!collapsed && (
//                 <div className="p-3">
//                     <div className="flex items-start overflow-x-auto gap-3 pb-3">
//                         {columnFields.map((col, colIndex) => (
//                             <div key={col.id} className="p-3 border rounded-md bg-white shadow-sm space-y-2 w-72 flex-shrink-0">
//                                 <div className="flex justify-between items-start">
//                                     <input {...register(`columnGroups.${groupIndex}.columns.${colIndex}.header`)} className="font-semibold text-sm border-none p-1 bg-transparent flex-1 -ml-1 focus:ring-1 focus:ring-indigo-300 rounded-sm" placeholder="Parameter name"/>
//                                     <button type="button" className="text-red-400 hover:text-red-600 p-1" onClick={() => removeColumn(colIndex)}>
//                                         <FiTrash2 className="h-4 w-4" />
//                                     </button>
//                                 </div>
//                                 {/* *** NEW ***: Pass onBulkAddClick with column index */}
//                                 <OptionsArray groupIndex={groupIndex} colIndex={colIndex} control={control} register={register} onBulkAddClick={() => onBulkAddClick(groupIndex, colIndex)}/>
//                             </div>
//                         ))}
//                          {columnFields.length === 0 && (
//                              <div className="text-center w-full py-4 text-gray-500">
//                                 <p>No parameters added yet. Click "Add Parameter" in the header to get started.</p>
//                              </div>
//                         )}
//                     </div>
//                 </div>
//             )}
//         </Card>
//     );
// };


// const EditorComponent = ({ control, register, groupFields, removeGroup, appendGroup, onBulkAddClick }) => { // *** NEW ***: Add onBulkAddClick prop
//     return (
//         <div className="space-y-3">
//             {groupFields.length === 0 ? (
//                 <Card className="p-6 text-center">
//                     <FiAlertCircle className="mx-auto h-10 w-10 text-gray-400 mb-3" />
//                     <h3 className="text-lg font-medium text-gray-900 mb-1">No Categories Yet</h3>
//                     <p className="text-gray-500 mb-4 text-sm">Start by adding your first evaluation category.</p>
//                     <Button type="button" icon={FiPlus} onClick={() => appendGroup({ title: '', columns: [] })}>
//                         Create First Category
//                     </Button>
//                 </Card>
//             ) : (
//                 <>
//                     {groupFields.map((group, groupIndex) => (
//                         <ColumnGroup key={group.id} control={control} register={register} groupIndex={groupIndex} removeGroup={removeGroup} onBulkAddClick={onBulkAddClick} />
//                     ))}
//                 </>
//             )}
//         </div>
//     );
// };

// const DomainFieldsTab = ({ domains }) => {
//     const { showSuccess, showError } = useAlert();
//     const [selectedDomain, setSelectedDomain] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [mode, setMode] = useState('edit');
//     // *** NEW ***: State to control the bulk add modal
//     const [bulkAddModal, setBulkAddModal] = useState({ isOpen: false, groupIndex: null, colIndex: null });

//     const { register, control, handleSubmit, reset, formState: { isSubmitting }, getValues, setValue } = useForm({ 
//         defaultValues: { columnGroups: [] } 
//     });
    
//     const { fields: groupFields, append: appendGroup, remove: removeGroup } = useFieldArray({
//         control,
//         name: "columnGroups"
//     });
    
//     const domainOptions = domains?.map(d => ({ value: d._id, label: d.name })) || [];

//     const fetchSheet = useCallback(async (domainId) => {
//         setLoading(true);
//         try {
//             const res = await getEvaluationSheet(domainId);
//             reset(res.data.data || { columnGroups: [] });
//         } catch (error) { 
//             showError("Failed to load evaluation sheet for this domain."); 
//         } finally { 
//             setLoading(false); 
//         }
//     }, [reset, showError]);

//     useEffect(() => {
//         if (selectedDomain) {
//             fetchSheet(selectedDomain.value);
//         } else {
//             reset({ columnGroups: [] });
//         }
//     }, [selectedDomain, fetchSheet, reset]);

//     const onSubmit = async (data) => {
//         try {
//             await updateEvaluationSheet(selectedDomain.value, data);
//             showSuccess(`Evaluation sheet for "${selectedDomain.label}" saved successfully.`);
//         } catch (error) {
//             showError("Failed to save evaluation sheet.");
//         }
//     };

//     // *** NEW ***: Function to handle adding the pasted options to the form state
//     const handleBulkAddOptions = (newOptions) => {
//         const { groupIndex, colIndex } = bulkAddModal;
//         if (groupIndex === null || colIndex === null) return;
        
//         const path = `columnGroups.${groupIndex}.columns.${colIndex}.options`;
//         const currentOptions = getValues(path) || [];
//         const updatedOptions = [...currentOptions, ...newOptions];
        
//         setValue(path, updatedOptions);
//         showSuccess(`${newOptions.length} options added successfully.`);
//     };
    
//     // *** NEW ***: Function to open the modal and set the target indexes
//     const openBulkAddModal = (groupIndex, colIndex) => {
//         setBulkAddModal({ isOpen: true, groupIndex, colIndex });
//     };

//     const customSelectStyles = {
//         control: (base) => ({ 
//             ...base, 
//             borderColor: '#d1d5db', 
//             borderRadius: '0.375rem', 
//             minHeight: '38px',
//             boxShadow: 'none',
//              '&:hover': { borderColor: '#a5b4fc' },
//         }),
//         valueContainer: (base) => ({
//             ...base,
//             padding: '0px 8px'
//         }),
//         indicatorsContainer: (base) => ({
//             ...base,
//             height: '38px',
//         })
//     };
    
//     return (
//         <form onSubmit={handleSubmit(onSubmit)}>
//             <div className="space-y-4">
//                 <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
//                     <div>
//                         {selectedDomain && (
//                             <div className="bg-gray-100 inline-flex rounded-lg p-1">
//                                 <button type="button" onClick={() => setMode('edit')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center ${mode === 'edit' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}> 
//                                     <FiEdit className="h-4 w-4 mr-1.5" /> Edit
//                                 </button>
//                                 <button type="button" onClick={() => setMode('preview')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center ${mode === 'preview' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}> 
//                                     <FiEye className="h-4 w-4 mr-1.5" /> Preview
//                                 </button>
//                             </div>
//                         )}
//                     </div>
                    
//                     <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto">
//                         <div className="w-full md:w-64">
//                             <Select options={domainOptions} value={selectedDomain} onChange={setSelectedDomain} isClearable placeholder="Choose a domain..." styles={customSelectStyles} isSearchable />
//                         </div>
//                          {selectedDomain && mode === 'edit' && (
//                             <>
//                                <Button type="button" icon={FiPlus} variant="outline" onClick={() => appendGroup({ title: '', columns: [] })}>
//                                     Add Category
//                                </Button>
//                                <Button
//                                     type="submit"
//                                     icon={isSubmitting ? null : FiSave}
//                                     isLoading={isSubmitting}
//                                     variant="success"
//                                     disabled={groupFields.length === 0}
//                                >
//                                     {isSubmitting ? 'Saving...' : 'Save Sheet'}
//                                </Button>
//                             </>
//                         )}
//                     </div>
//                 </div>

//                 {selectedDomain ? (
//                     loading ? (
//                         <Card className="p-6 text-center"><div className="flex flex-col items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mb-3"></div><span className="text-gray-500">Loading evaluation sheet...</span></div></Card>
//                     ) : (
//                         <div>
//                             {mode === 'edit' 
//                                 ? <EditorComponent control={control} register={register} groupFields={groupFields} removeGroup={removeGroup} appendGroup={appendGroup} onBulkAddClick={openBulkAddModal} /> // *** NEW ***: Pass prop
//                                 : <PreviewComponent sheetData={getValues()} />}
//                         </div>
//                     )
//                 ) : (
//                     <Card className="p-6 text-center">
//                         <FiAlertCircle className="mx-auto h-10 w-10 text-gray-300 mb-3" />
//                         <h3 className="text-lg font-medium text-gray-900 mb-1">Select a Domain</h3>
//                         <p className="text-gray-500 max-w-md mx-auto text-sm">Choose a domain from the dropdown above to start configuring its evaluation sheet.</p>
//                     </Card>
//                 )}
//             </div>
//             {/* *** NEW ***: Render the modal */}
//             <BulkAddOptionsModal
//                 isOpen={bulkAddModal.isOpen}
//                 onClose={() => setBulkAddModal({ isOpen: false, groupIndex: null, colIndex: null })}
//                 onAdd={handleBulkAddOptions}
//             />
//         </form>
//     );
// };

// export default DomainFieldsTab;


// C:\Users\NxtWave\Desktop\Testing\Interviewer community\interviewer-hiring-system\interviewer-hiring-system\client\src\components\admin\DomainFieldsTab.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { 
    FiPlus, FiTrash2, FiSave, FiEdit, FiEye, FiAlertCircle, FiChevronDown, FiChevronUp, 
    FiClipboard, FiCopy, FiX, FiChevronsRight, FiSearch, FiType 
} from 'react-icons/fi';
import { getEvaluationSheet, updateEvaluationSheet, getAllEvaluationParameters } from '@/api/admin.api';
import { useAlert } from '@/hooks/useAlert';
import Select from 'react-select';
import { motion, AnimatePresence } from 'framer-motion';

// ... (All sub-components like ImportModal, BulkAddOptionsModal, Button, Card, Badge, etc. are included and formatted below) ...

const ImportModal = ({ isOpen, onClose, onImportOptions, onImportAllOptions, onImportParameter, allParameters, targetCategoryName }) => {
    const [selectedDomain, setSelectedDomain] = useState(null);
    const [selectedParameter, setSelectedParameter] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setSelectedDomain(null);
            setSelectedParameter(null);
            setSearchTerm('');
        }
    }, [isOpen]);

    const filteredDomains = useMemo(() => {
        if (!allParameters) return [];
        if (!searchTerm) return allParameters;
        
        const lowerSearch = searchTerm.toLowerCase();
        return allParameters
            .map(domain => ({
                ...domain,
                categories: domain.categories
                    .map(cat => ({
                        ...cat,
                        parameters: cat.parameters.filter(p => 
                            p.parameterName.toLowerCase().includes(lowerSearch) || 
                            cat.categoryName.toLowerCase().includes(lowerSearch)
                        ),
                    }))
                    .filter(cat => cat.parameters.length > 0),
            }))
            .filter(domain => domain.categories.length > 0 || domain.domainName.toLowerCase().includes(lowerSearch));
    }, [allParameters, searchTerm]);
    
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full max-w-4xl h-[80vh] bg-white rounded-lg shadow-xl flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="px-6 py-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">Import Evaluation Data</h3>
                            <button type="button" onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200"><FiX /></button>
                        </div>

                        <div className="p-4 border-b">
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by domain, category, or parameter name..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        </div>

                        <div className="flex-grow flex overflow-hidden">
                            <div className="w-1/4 border-r overflow-y-auto">
                                <ul className="p-2 space-y-1">
                                    {filteredDomains.map(domain => (
                                        <li key={domain.domainName}>
                                            <button 
                                                type="button"
                                                onClick={() => { setSelectedDomain(domain); setSelectedParameter(null); }}
                                                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${selectedDomain?.domainName === domain.domainName ? 'bg-indigo-100 text-indigo-800 font-semibold' : 'hover:bg-gray-100'}`}
                                            >
                                                {domain.domainName}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="w-1/2 border-r overflow-y-auto bg-gray-50/50">
                                {selectedDomain ? (
                                    <div className="p-2">
                                        {selectedDomain.categories.map(category => (
                                            <div key={category.categoryName} className="mb-3">
                                                <h4 className="text-xs uppercase font-bold text-gray-500 px-3 py-1">{category.categoryName}</h4>
                                                <ul className="space-y-1">
                                                    {category.parameters.map(param => (
                                                        <li key={param.parameterName}>
                                                            <div className={`group flex justify-between items-center rounded-md transition-colors ${selectedParameter?.parameterName === param.parameterName && selectedParameter?.categoryName === category.categoryName ? 'bg-indigo-200' : 'hover:bg-gray-200'}`}>
                                                                <button type="button" onClick={() => setSelectedParameter({ ...param, categoryName: category.categoryName })} className="flex-grow text-left px-3 py-2 text-sm">
                                                                    {param.parameterName}
                                                                </button>
                                                                <button type="button" onClick={() => onImportParameter(param)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity">Import Parameter</button>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">Select a domain</div>
                                )}
                            </div>
                            <div className="w-1/4 flex flex-col">
                                {selectedParameter ? (
                                    <div className="p-4 flex-grow flex flex-col">
                                        <h4 className="text-sm font-bold text-gray-800 mb-2">Options for "{selectedParameter.parameterName}"</h4>
                                        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 flex-grow overflow-y-auto mb-4">
                                            <ul className="text-xs space-y-1">
                                                {selectedParameter.options.map((opt, i) => (
                                                    <li key={i} className="flex justify-between p-1 rounded bg-white">
                                                        <span>{opt.label}</span>
                                                        <span className="font-mono text-gray-500">{opt.value}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="space-y-2">
                                            <Button variant="primary" size="sm" className="w-full" onClick={() => onImportOptions(selectedParameter.options)}>
                                                Import for this parameter only
                                            </Button>
                                            <Button variant="secondary" size="sm" className="w-full" onClick={() => onImportAllOptions(selectedParameter.options)}>
                                                Import for all in '{targetCategoryName}'
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                     <div className="flex items-center justify-center h-full text-gray-400">Select a parameter</div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const BulkAddOptionsModal = ({ isOpen, onClose, onAdd }) => {
    const [pastedText, setPastedText] = useState('');
    useEffect(() => { if (isOpen) setPastedText(''); }, [isOpen]);
    const handleProcessPaste = () => {
        if (!pastedText.trim()) { onClose(); return; }
        const newOptions = pastedText.trim().split('\n').map(row => {
            const parts = row.split('\t');
            const label = (parts[0] || '').trim();
            const value = (parts[1] || label).trim();
            return { label, value };
        }).filter(opt => opt.label);
        onAdd(newOptions);
        onClose();
    };
    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}>
            <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="px-6 py-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">Paste Options from Spreadsheet</h3>
                </div>
                <div className="p-6">
                    <p className="text-sm text-gray-600 mb-2">Copy cells from your spreadsheet and paste them here.</p>
                    <ul className="text-xs text-gray-500 list-disc list-inside mb-4 space-y-1">
                        <li>The first column will be the <strong>Label</strong>.</li>
                        <li>The second column will be the <strong>Value</strong>.</li>
                        <li>If only one column is pasted, the Label will be used as the Value.</li>
                    </ul>
                    <textarea value={pastedText} onChange={(e) => setPastedText(e.target.value)} placeholder={"Paste your data here...\nExcellent\t5\nGood\t4\nAverage\t3"} className="w-full h-40 p-2 border border-gray-300 rounded-md font-mono text-sm" autoFocus />
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                    <button type="button" className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-50" onClick={onClose}>Cancel</button>
                    <button type="button" className="px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700" onClick={handleProcessPaste}>Add Options</button>
                </div>
            </div>
        </div>
    );
};

const Button = ({ children, onClick, icon: Icon, isLoading, type = 'button', variant = 'primary', size = 'md', className = '', disabled = false }) => {
    const baseClasses = "inline-flex items-center justify-center font-medium rounded-md border focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200";
    const sizeClasses = { sm: 'px-2.5 py-1.5 text-xs gap-1.5', md: 'px-4 py-2 text-sm gap-2', lg: 'px-5 py-2.5 text-base gap-2' };
    const variantClasses = {
        primary: 'bg-indigo-600 text-white border-transparent hover:bg-indigo-700 shadow-sm',
        secondary: 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 shadow-sm',
        outline: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 shadow-sm',
        ghost: 'bg-transparent text-gray-500 border-transparent hover:bg-gray-100',
        success: 'bg-green-600 text-white border-transparent hover:bg-green-700 shadow-sm',
        danger: 'bg-red-500 text-white border-transparent hover:bg-red-600 shadow-sm'
    };
    const combinedClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;
    return (
        <button type={type} onClick={onClick} disabled={isLoading || disabled} className={combinedClasses}>
            {isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : (Icon && <Icon className="h-4 w-4 flex-shrink-0" />)}
            {children}
        </button>
    );
};

const Card = ({ children, className = '' }) => (<div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>{children}</div>);

const Badge = ({ children, variant = 'default' }) => {
    const variants = {
        default: 'bg-gray-100 text-gray-800',
        primary: 'bg-indigo-100 text-indigo-800'
    };
    return (<span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>{children}</span>);
};

const PreviewComponent = ({ sheetData }) => {
    const { columnGroups = [] } = sheetData;
    const categoryColors = ['bg-purple-100 text-purple-800', 'bg-blue-100 text-blue-800', 'bg-teal-100 text-teal-800', 'bg-amber-100 text-amber-800', 'bg-emerald-100 text-emerald-800'];
    const getOptionStyle = (value) => {
        const stringValue = String(value).trim();
        switch (stringValue) {
            case '5': return 'text-green-700 font-bold';
            case '4': return 'text-green-600 font-medium';
            case '3': return 'text-yellow-600 font-medium';
            case '2': return 'text-red-500 font-medium';
            case '1': return 'text-red-700 font-bold';
            default: return 'text-gray-800';
        }
    };
    if (!columnGroups || columnGroups.length === 0) return (<Card className="p-6 text-center"><FiAlertCircle className="mx-auto h-10 w-10 text-gray-400 mb-4" /><h3 className="text-lg font-medium text-gray-900 mb-2">No Evaluation Parameters</h3><p className="text-gray-500">Add categories to see the preview</p></Card>);
    return (
        <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto max-h-96">
                <table className="min-w-full text-sm border-collapse">
                    <thead className="sticky top-0 z-10">
                        <tr>{columnGroups.map((group, groupIndex) => (<th key={groupIndex} colSpan={group.columns?.length || 1} className={`p-2 border-r border-gray-200 text-center font-semibold ${categoryColors[groupIndex % categoryColors.length]}`}>{group.title || `Category ${groupIndex + 1}`}</th>))}</tr>
                        <tr>{columnGroups.map((group) => group.columns?.map((column, colIndex) => (<th key={`${group.title}-${colIndex}`} className="p-2.5 border border-gray-200 text-center font-semibold bg-gray-50 whitespace-nowrap">{column.header || ''}</th>)))}</tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 5 }).map((_, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-50">
                                {columnGroups.map((group) => group.columns?.map((column, colIndex) => (
                                    <td key={`${rowIndex}-${group.title}-${colIndex}`} className="p-0 border border-gray-200">
                                        {column.type === 'text' ? (
                                            <input type="text" placeholder="Type here..." className="w-full h-full p-2 border-0 focus:ring-1 focus:outline-none bg-transparent" />
                                        ) : (
                                            <select className="w-full h-full p-2 border-0 focus:ring-1 focus:outline-none bg-transparent" defaultValue="">
                                                <option value="" className="text-gray-400">Select...</option>
                                                {column.options?.map((opt, optIndex) => (<option key={optIndex} value={opt.value} className={getOptionStyle(opt.value)}>{opt.label}</option>))}
                                            </select>
                                        )}
                                    </td>
                                )))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const OptionsArray = ({ groupIndex, colIndex, control, register, onBulkAddClick, onImportClick }) => {
    const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({ control, name: `columnGroups.${groupIndex}.columns.${colIndex}.options` });
    return (
        <div className="space-y-1.5">
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-2">
                {optionFields.map((opt, optIndex) => (
                    <div key={opt.id} className="flex items-center gap-1.5 p-1.5 bg-gray-50/70 rounded">
                        <input {...register(`columnGroups.${groupIndex}.columns.${colIndex}.options.${optIndex}.label`)} placeholder="Label" className="w-full p-1.5 text-xs border border-gray-200 rounded" />
                        <input {...register(`columnGroups.${groupIndex}.columns.${colIndex}.options.${optIndex}.value`)} placeholder="Value" className="w-1/2 p-1.5 text-xs border border-gray-200 rounded" />
                        <button type="button" className="text-red-400 hover:text-red-600 p-1" onClick={() => removeOption(optIndex)}><FiTrash2 className="h-3.5 w-3.5" /></button>
                    </div>
                ))}
                {optionFields.length === 0 && <p className="text-center text-xs text-gray-400 py-2">No options added.</p>}
            </div>
            <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" icon={FiPlus} onClick={() => appendOption({label: '', value: ''})} className="flex-grow !py-1">Add Option</Button>
                <Button type="button" variant="outline" size="sm" icon={FiCopy} onClick={onImportClick} className="!py-1" title="Import from existing parameter" />
                <Button type="button" variant="outline" size="sm" icon={FiClipboard} onClick={onBulkAddClick} className="!py-1" title="Paste from Spreadsheet" />
            </div>
        </div>
    );
};

const ColumnGroup = ({ groupIndex, control, register, removeGroup, onBulkAddClick, onImportClick, watch, errors }) => {
    const { fields: columnFields, append: appendColumn, remove: removeColumn } = useFieldArray({ control, name: `columnGroups.${groupIndex}.columns` });
    const [collapsed, setCollapsed] = useState(false);
    const titleError = errors?.columnGroups?.[groupIndex]?.title;
    return (
        <Card>
            <div className={`p-2 border-b ${titleError ? 'bg-red-50' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                        <button type="button" className="text-gray-500 hover:bg-gray-200 p-1 rounded-sm" onClick={() => setCollapsed(!collapsed)}>{collapsed ? <FiChevronDown className="h-4 w-4" /> : <FiChevronUp className="h-4 w-4" />}</button>
                        <div className="flex-1">
                            <input {...register(`columnGroups.${groupIndex}.title`, { required: 'Category title cannot be empty' })} className={`text-base font-bold border-none p-1 bg-transparent w-full focus:ring-1 rounded-sm ${titleError ? 'focus:ring-red-300 ring-1 ring-red-300' : 'focus:ring-indigo-300'}`} placeholder="Enter category title" />
                            {titleError && <p className="text-xs text-red-600 mt-1 pl-1">{titleError.message}</p>}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button type="button" variant="secondary" size="sm" icon={FiType} onClick={() => { appendColumn({ header: '', options: [], type: 'text' }); if (collapsed) setCollapsed(false); }} title="Add Text Field Parameter" />
                        <Button type="button" variant="secondary" size="sm" icon={FiPlus} onClick={() => { appendColumn({ header: '', options: [], type: 'select' }); if (collapsed) setCollapsed(false); }} title="Add Select/Dropdown Parameter" />
                        <Badge variant="primary">{columnFields.length} parameters</Badge>
                        <button type="button" className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-full" onClick={() => removeGroup(groupIndex)}><FiTrash2 className="h-4 w-4" /></button>
                    </div>
                </div>
            </div>
            {!collapsed && (
                <div className="p-3">
                    <div className="flex items-start overflow-x-auto gap-3 pb-3">
                        {columnFields.map((field, colIndex) => {
                            const fieldType = watch(`columnGroups.${groupIndex}.columns.${colIndex}.type`, 'select');
                            return (
                                <div key={field.id} className="p-3 border rounded-md bg-white shadow-sm space-y-2 w-72 flex-shrink-0">
                                    <div className="flex justify-between items-start">
                                        <input {...register(`columnGroups.${groupIndex}.columns.${colIndex}.header`)} className="font-semibold text-sm border-none p-1 bg-transparent flex-1 -ml-1 focus:ring-1 focus:ring-indigo-300 rounded-sm" placeholder="Parameter name" />
                                        <button type="button" className="text-red-400 hover:text-red-600 p-1" onClick={() => removeColumn(colIndex)}><FiTrash2 className="h-4 w-4" /></button>
                                    </div>
                                    {fieldType === 'text' ? (
                                        <div className="text-center py-6 text-gray-400 text-sm bg-gray-50 rounded-md">Text Input Field</div>
                                    ) : (
                                        <OptionsArray groupIndex={groupIndex} colIndex={colIndex} control={control} register={register} onBulkAddClick={() => onBulkAddClick(groupIndex, colIndex)} onImportClick={() => onImportClick(groupIndex, colIndex)} />
                                    )}
                                </div>
                            );
                        })}
                        {columnFields.length === 0 && <div className="text-center w-full py-4 text-gray-500"><p>No parameters added yet. Click an "Add" button in the header to get started.</p></div>}
                    </div>
                </div>
            )}
        </Card>
    );
};

const EditorComponent = ({ control, register, groupFields, removeGroup, appendGroup, onBulkAddClick, onImportClick, watch, errors }) => (
    <div className="space-y-3">
        {groupFields.length === 0 ? (
            <Card className="p-6 text-center">
                <FiAlertCircle className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No Categories Yet</h3>
                <p className="text-gray-500 mb-4 text-sm">Start by adding your first evaluation category.</p>
                <Button type="button" icon={FiPlus} onClick={() => appendGroup({ title: '', columns: [] })}>Create First Category</Button>
            </Card>
        ) : (
            groupFields.map((group, groupIndex) => (
                <ColumnGroup
                    key={group.id}
                    control={control}
                    register={register}
                    groupIndex={groupIndex}
                    removeGroup={removeGroup}
                    onBulkAddClick={onBulkAddClick}
                    onImportClick={onImportClick}
                    watch={watch}
                    errors={errors}
                />
            ))
        )}
    </div>
);

const DomainFieldsTab = ({ domains, selectedDomain, setSelectedDomain }) => {
    const { showSuccess, showError } = useAlert();
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('edit');
    const [allParameters, setAllParameters] = useState([]);
    const [importModal, setImportModal] = useState({ isOpen: false, target: null });
    const [bulkAddModal, setBulkAddModal] = useState({ isOpen: false, groupIndex: null, colIndex: null });
    
    const { register, control, handleSubmit, reset, formState: { errors, isSubmitting }, getValues, setValue, watch } = useForm({
        defaultValues: { columnGroups: [] }
    });
    
    const { fields: groupFields, append: appendGroup, remove: removeGroup } = useFieldArray({ control, name: "columnGroups" });
    const watchedGroups = watch("columnGroups");
    const domainOptions = domains?.map(d => ({ value: d._id, label: d.name })) || [];
    
    const fetchSheet = useCallback(async (domainId) => {
        setLoading(true);
        try {
            const res = await getEvaluationSheet(domainId);
            reset(res.data.data || { columnGroups: [] });
        } catch (error) {
            showError("Failed to load evaluation sheet for this domain.");
        } finally {
            setLoading(false);
        }
    }, [reset, showError]);

    useEffect(() => {
        getAllEvaluationParameters().then(res => setAllParameters(res.data.data)).catch(() => showError("Could not load existing parameters for import feature."));
    }, [showError]);

    useEffect(() => {
        if (selectedDomain) {
            fetchSheet(selectedDomain.value);
        } else {
            reset({ columnGroups: [] });
        }
    }, [selectedDomain, fetchSheet, reset]);

    const onSubmit = async (data) => {
        try {
            await updateEvaluationSheet(selectedDomain.value, data);
            showSuccess(`Evaluation sheet for "${selectedDomain.label}" saved successfully.`);
        } catch (error) {
            showError("Failed to save evaluation sheet. Check for empty category titles.");
        }
    };
    
    const openImportModal = (groupIndex, colIndex) => setImportModal({ isOpen: true, target: { groupIndex, colIndex } });

    const handleImportParameter = (parameter) => {
        const { groupIndex } = importModal.target;
        const currentGroup = watchedGroups[groupIndex];
        const newColumns = [...(currentGroup.columns || []), { header: parameter.parameterName, options: parameter.options, type: 'select' }];
        setValue(`columnGroups.${groupIndex}.columns`, newColumns);
        showSuccess(`Parameter "${parameter.parameterName}" imported successfully.`);
    };

    const handleImportOptions = (options) => {
        const { groupIndex, colIndex } = importModal.target;
        setValue(`columnGroups.${groupIndex}.columns.${colIndex}.options`, options);
        showSuccess(`${options.length} options imported successfully.`);
        setImportModal({ isOpen: false, target: null });
    };
    
    const handleImportAllOptions = (options) => {
        const { groupIndex } = importModal.target;
        const currentGroup = watchedGroups[groupIndex];
        if (!currentGroup || !currentGroup.columns) return;
        const updatedColumns = currentGroup.columns.map(col => ({ ...col, options: col.type === 'select' ? options : [] }));
        setValue(`columnGroups.${groupIndex}.columns`, updatedColumns);
        showSuccess(`Applied options to all applicable parameters in the category.`);
        setImportModal({ isOpen: false, target: null });
    };
    
    const handleBulkAddOptions = (newOptions) => {
        const { groupIndex, colIndex } = bulkAddModal;
        if (groupIndex === null || colIndex === null) return;
        const path = `columnGroups.${groupIndex}.columns.${colIndex}.options`;
        const currentOptions = getValues(path) || [];
        const updatedOptions = [...currentOptions, ...newOptions];
        setValue(path, updatedOptions);
        showSuccess(`${newOptions.length} options added successfully.`);
    };
    
    const openBulkAddModal = (groupIndex, colIndex) => setBulkAddModal({ isOpen: true, groupIndex, colIndex });
    
    const customSelectStyles = {
        control: (base) => ({ ...base, borderColor: '#d1d5db', borderRadius: '0.375rem', minHeight: '38px', boxShadow: 'none', '&:hover': { borderColor: '#a5b4fc' } }),
        valueContainer: (base) => ({...base, padding: '0px 8px'}),
        indicatorsContainer: (base) => ({...base, height: '38px'})
    };
    
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div>
                        {selectedDomain && (
                            <div className="bg-gray-100 inline-flex rounded-lg p-1">
                                <button type="button" onClick={() => setMode('edit')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center ${mode === 'edit' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}><FiEdit className="h-4 w-4 mr-1.5" /> Edit</button>
                                <button type="button" onClick={() => setMode('preview')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center ${mode === 'preview' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}><FiEye className="h-4 w-4 mr-1.5" /> Preview</button>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto">
                        <div className="w-full md:w-64">
                            <Select options={domainOptions} value={selectedDomain} onChange={setSelectedDomain} isClearable placeholder="Choose a domain..." styles={customSelectStyles} isSearchable />
                        </div>
                        {selectedDomain && mode === 'edit' && (
                            <>
                               <Button type="button" icon={FiPlus} variant="outline" onClick={() => appendGroup({ title: '', columns: [] })}>Add Category</Button>
                               <Button type="submit" icon={isSubmitting ? null : FiSave} isLoading={isSubmitting} variant="success" disabled={groupFields.length === 0}>{isSubmitting ? 'Saving...' : 'Save Sheet'}</Button>
                            </>
                        )}
                    </div>
                </div>

                {selectedDomain ? (
                    loading ? (
                        <Card className="p-6 text-center">
                            <div className="flex flex-col items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mb-3"></div>
                                <span className="text-gray-500">Loading evaluation sheet...</span>
                            </div>
                        </Card>
                    ) : (
                        <div>
                            {mode === 'edit' ? <EditorComponent control={control} register={register} groupFields={groupFields} removeGroup={removeGroup} appendGroup={appendGroup} onBulkAddClick={openBulkAddModal} onImportClick={openImportModal} watch={watch} errors={errors} /> : <PreviewComponent sheetData={getValues()} />}
                        </div>
                    )
                ) : (
                    <Card className="p-6 text-center">
                        <FiAlertCircle className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Select a Domain</h3>
                        <p className="text-gray-500 max-w-md mx-auto text-sm">Choose a domain to start configuring its evaluation sheet.</p>
                    </Card>
                )}
            </div>
            
            <ImportModal isOpen={importModal.isOpen} onClose={() => setImportModal({ isOpen: false, target: null })} onImportParameter={handleImportParameter} onImportOptions={handleImportOptions} onImportAllOptions={handleImportAllOptions} allParameters={allParameters} targetCategoryName={importModal.target ? getValues(`columnGroups.${importModal.target.groupIndex}.title`) : ''} />
            <BulkAddOptionsModal isOpen={bulkAddModal.isOpen} onClose={() => setBulkAddModal({ isOpen: false, groupIndex: null, colIndex: null })} onAdd={handleBulkAddOptions} />
        </form>
    );
};

export default DomainFieldsTab;
