// client/src/components/admin/DomainFieldsTab.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { 
    FiPlus, FiTrash2, FiSave, FiEdit, FiEye, FiAlertCircle, FiChevronDown, FiChevronUp, 
    FiClipboard, FiCopy, FiX, FiSearch, FiType 
} from 'react-icons/fi';
import { getEvaluationSheet, updateEvaluationSheet, getAllEvaluationParameters } from '@/api/admin.api';
import { useAlert } from '@/hooks/useAlert';
import Select from 'react-select';
import { motion, AnimatePresence } from 'framer-motion';

// --- STYLED UI COMPONENTS ---

const LocalButton = ({ children, onClick, type = 'button', isLoading = false, icon: Icon, variant = 'primary', size='md', className = '', disabled = false }) => {
    const base = "inline-flex items-center justify-center font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-[0.98]";
    const sizes = { sm: 'text-xs px-3 py-1.5', md: 'text-sm px-4 py-2.5' };
    const variants = {
        primary: 'bg-gray-900 text-white hover:bg-black border border-transparent shadow-sm focus:ring-gray-900',
        secondary: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200',
        success: 'bg-green-600 text-white hover:bg-green-700 border-transparent shadow-sm focus:ring-green-500',
        outline: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
    };
    return (
        <button type={type} onClick={onClick} disabled={isLoading || disabled} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
            {isLoading ? <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" /> : (Icon && <Icon className="h-4 w-4" />)}
            {children && <span className={Icon ? 'ml-2' : ''}>{children}</span>}
        </button>
    );
};

const Card = ({ children, className = '' }) => (<div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>{children}</div>);

// --- MODALS (Import and Bulk Add) ---

const ImportModal = ({ isOpen, onClose, onImportOptions, onImportAllOptions, onImportParameter, allParameters, targetCategoryName }) => {
    const [selectedDomain, setSelectedDomain] = useState(null);
    const [selectedParameter, setSelectedParameter] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!isOpen) { setSelectedDomain(null); setSelectedParameter(null); setSearchTerm(''); }
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
                        parameters: cat.parameters.filter(p => p.parameterName.toLowerCase().includes(lowerSearch)),
                    }))
                    .filter(cat => cat.parameters.length > 0),
            }))
            .filter(domain => domain.categories.length > 0 || domain.domainName.toLowerCase().includes(lowerSearch));
    }, [allParameters, searchTerm]);
    
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm" onClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full max-w-4xl h-[80vh] bg-white rounded-xl shadow-2xl flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
                            <h3 className="text-lg font-bold text-gray-900">Import Evaluation Parameter</h3>
                            <button type="button" onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-200"><FiX /></button>
                        </div>

                        <div className="p-4 border-b">
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search parameters..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex-grow flex overflow-hidden">
                            <div className="w-1/3 border-r overflow-y-auto custom-scrollbar">
                                <ul className="p-2 space-y-1">
                                    {filteredDomains.map(domain => (
                                        <li key={domain.domainName}>
                                            <button type="button" onClick={() => { setSelectedDomain(domain); setSelectedParameter(null); }}
                                                className={`w-full text-left px-3 py-2 text-sm rounded-md font-medium transition-colors ${selectedDomain?.domainName === domain.domainName ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                                            >
                                                {domain.domainName}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="w-2/3 flex flex-col overflow-hidden bg-gray-50/50">
                                {selectedDomain ? (
                                    <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                                        {selectedDomain.categories.map(category => (
                                            <div key={category.categoryName} className="mb-4">
                                                <h4 className="text-xs uppercase font-bold text-gray-500 px-3 py-1">{category.categoryName}</h4>
                                                <ul className="space-y-1">
                                                    {category.parameters.map(param => (
                                                        <li key={param.parameterName}>
                                                            <div className="group flex justify-between items-center rounded-md bg-white border border-gray-200 hover:border-blue-300 transition-all">
                                                                <button type="button" onClick={() => setSelectedParameter({ ...param, categoryName: category.categoryName })} className="flex-grow text-left px-3 py-2 text-sm font-medium text-gray-800">
                                                                    {param.parameterName}
                                                                </button>
                                                                <div className="flex gap-1 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <LocalButton size="sm" variant="outline" onClick={() => onImportOptions(param.options)}>Options</LocalButton>
                                                                    <LocalButton size="sm" variant="primary" onClick={() => onImportParameter(param)}>All</LocalButton>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-sm text-gray-400">Select a domain to view parameters.</div>
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
        <AnimatePresence>
            {isOpen && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm" onClick={onClose}>
                     <motion.div
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                        className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}
                    >
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
                            <h3 className="text-lg font-bold text-gray-900">Paste from Spreadsheet</h3>
                            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-200 text-gray-500"><FiX className="h-5 w-5"/></button>
                        </div>
                        <div className="p-6">
                            <p className="text-xs text-gray-500 list-disc list-inside mb-4 space-y-1">
                                <li>Paste cells copied from a spreadsheet.</li>
                                <li>First column is the <strong>Label</strong>, second is the <strong>Value</strong>.</li>
                            </p>
                            <textarea value={pastedText} onChange={(e) => setPastedText(e.target.value)} placeholder={"Paste here...\nExcellent\t5\nGood\t4"} className="w-full h-40 p-2 border border-gray-300 rounded-md font-mono text-sm" autoFocus />
                        </div>
                        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100 rounded-b-xl">
                            <LocalButton variant="outline" onClick={onClose}>Cancel</LocalButton>
                            <LocalButton variant="primary" onClick={handleProcessPaste}>Add Options</LocalButton>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const PreviewComponent = ({ sheetData }) => {
    const { columnGroups = [] } = sheetData;
    if (!columnGroups || columnGroups.length === 0) return (<Card className="p-8 text-center"><FiAlertCircle className="mx-auto h-10 w-10 text-gray-300 mb-4" /><h3 className="font-medium text-gray-700">No Parameters Configured</h3><p className="text-sm text-gray-500">Add categories and parameters in Edit mode to see a preview.</p></Card>);
    return (
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm border-collapse">
                    <thead>
                        <tr>{columnGroups.map((group, groupIndex) => (<th key={groupIndex} colSpan={group.columns?.length || 1} className="p-2 border-r border-b border-gray-200 text-center font-bold bg-gray-100">{group.title}</th>))}</tr>
                        <tr>{columnGroups.map((group, groupIndex) => group.columns?.map((column, colIndex) => (<th key={`${groupIndex}-${colIndex}`} className="p-2.5 border border-gray-200 text-center font-semibold bg-gray-50 whitespace-nowrap">{column.header}</th>)))}</tr>
                    </thead>
                    <tbody>
                        <tr className="bg-white">
                            {columnGroups.map((group, groupIndex) => group.columns?.map((column, colIndex) => (
                                <td key={`preview-${groupIndex}-${colIndex}`} className="p-1 border border-gray-200 align-top">
                                    {column.type === 'text' ? (
                                        <input type="text" placeholder="..." className="w-full h-full p-2 border-0 focus:ring-0 focus:outline-none bg-transparent text-xs" />
                                    ) : (
                                        <select className="w-full h-full p-2 border-0 focus:ring-0 focus:outline-none bg-transparent text-xs" defaultValue="">
                                            <option value="" disabled>Select...</option>
                                            {column.options?.map((opt, optIndex) => (<option key={optIndex} value={opt.value}>{opt.label}</option>))}
                                        </select>
                                    )}
                                </td>
                            )))}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const OptionsArray = ({ groupIndex, colIndex, control, register, onBulkAddClick, onImportClick }) => {
    const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({ control, name: `columnGroups.${groupIndex}.columns.${colIndex}.options` });
    return (
        <div className="space-y-2">
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {optionFields.map((opt, optIndex) => (
                    <div key={opt.id} className="flex items-center gap-1.5 p-1.5 bg-gray-50 rounded">
                        <input {...register(`columnGroups.${groupIndex}.columns.${colIndex}.options.${optIndex}.label`)} placeholder="Label" className="w-full p-1.5 text-xs border border-gray-200 rounded" />
                        <input {...register(`columnGroups.${groupIndex}.columns.${colIndex}.options.${optIndex}.value`)} placeholder="Value" className="w-1/2 p-1.5 text-xs border border-gray-200 rounded" />
                        <button type="button" className="text-red-400 hover:text-red-600 p-1" onClick={() => removeOption(optIndex)}><FiTrash2 className="h-3.5 w-3.5" /></button>
                    </div>
                ))}
            </div>
            <div className="flex gap-2">
                <LocalButton type="button" variant="outline" size="sm" icon={FiPlus} onClick={() => appendOption({label: '', value: ''})} className="flex-grow !font-medium" />
                <LocalButton type="button" variant="outline" size="sm" icon={FiCopy} onClick={onImportClick} title="Import" />
                <LocalButton type="button" variant="outline" size="sm" icon={FiClipboard} onClick={onBulkAddClick} title="Bulk Paste" />
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
            <div className={`p-3 border-b border-gray-100 ${titleError ? 'bg-red-50' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                        <button type="button" className="text-gray-400 hover:bg-gray-100 p-1 rounded-sm" onClick={() => setCollapsed(!collapsed)}>{collapsed ? <FiChevronDown /> : <FiChevronUp />}</button>
                        <input {...register(`columnGroups.${groupIndex}.title`, { required: 'Required' })} className={`text-base font-bold border-none p-1 bg-transparent w-full focus:ring-1 rounded-sm ${titleError ? 'focus:ring-red-300 ring-1 ring-red-300' : 'focus:ring-gray-300'}`} placeholder="Enter Category Title" />
                    </div>
                    <div className="flex items-center gap-2">
                        <LocalButton type="button" variant="secondary" size="sm" icon={FiType} onClick={() => { appendColumn({ header: '', options: [], type: 'text' }); setCollapsed(false); }} title="Add Text Field" />
                        <LocalButton type="button" variant="secondary" size="sm" icon={FiPlus} onClick={() => { appendColumn({ header: '', options: [], type: 'select' }); setCollapsed(false); }} title="Add Dropdown" />
                        <button type="button" className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" onClick={() => removeGroup(groupIndex)}><FiTrash2 /></button>
                    </div>
                </div>
                {titleError && <p className="text-xs text-red-600 mt-1 pl-10">{titleError.message}</p>}
            </div>
            {!collapsed && (
                <div className="p-4 bg-gray-50/50">
                    <div className="flex items-start overflow-x-auto gap-4 pb-3 custom-scrollbar">
                        {columnFields.map((field, colIndex) => {
                            const fieldType = watch(`columnGroups.${groupIndex}.columns.${colIndex}.type`, 'select');
                            return (
                                <div key={field.id} className="p-3 border rounded-lg bg-white shadow-sm space-y-3 w-72 flex-shrink-0">
                                    <div className="flex justify-between items-start">
                                        <input {...register(`columnGroups.${groupIndex}.columns.${colIndex}.header`)} className="font-semibold text-sm border-none p-1 bg-transparent flex-1 -ml-1 focus:ring-1 focus:ring-gray-300 rounded-sm" placeholder="Parameter Name" />
                                        <button type="button" className="text-gray-300 hover:text-red-500 p-1" onClick={() => removeColumn(colIndex)}><FiTrash2 className="h-4 w-4" /></button>
                                    </div>
                                    {fieldType === 'text' ? (
                                        <div className="text-center py-6 text-gray-400 text-sm bg-gray-50 rounded-md border">Text Input Field</div>
                                    ) : (
                                        <OptionsArray groupIndex={groupIndex} colIndex={colIndex} control={control} register={register} onBulkAddClick={() => onBulkAddClick(groupIndex, colIndex)} onImportClick={() => onImportClick(groupIndex, colIndex)} />
                                    )}
                                </div>
                            );
                        })}
                        {columnFields.length === 0 && <div className="text-center w-full py-8 text-gray-400 text-sm">No parameters added.</div>}
                    </div>
                </div>
            )}
        </Card>
    );
};

const EditorComponent = ({ control, register, groupFields, removeGroup, appendGroup, onBulkAddClick, onImportClick, watch, errors }) => (
    <div className="space-y-4">
        {groupFields.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                <FiAlertCircle className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                <h3 className="font-medium text-gray-700">No Categories Yet</h3>
                <p className="text-sm text-gray-500 mb-4">Start by adding your first evaluation category.</p>
                <LocalButton type="button" icon={FiPlus} variant="secondary" onClick={() => appendGroup({ title: '', columns: [] })}>Create First Category</LocalButton>
            </div>
        ) : (
            groupFields.map((group, groupIndex) => (
                <ColumnGroup key={group.id} control={control} register={register} groupIndex={groupIndex} removeGroup={removeGroup} onBulkAddClick={onBulkAddClick} onImportClick={onImportClick} watch={watch} errors={errors} />
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
    const domainOptions = domains?.map(d => ({ value: d._id, label: d.name })) || [];
    
    const fetchSheet = useCallback(async (domainId) => {
        setLoading(true);
        try {
            const res = await getEvaluationSheet(domainId);
            reset(res.data.data || { columnGroups: [] });
        } catch (error) { showError("Failed to load evaluation sheet."); } 
        finally { setLoading(false); }
    }, [reset, showError]);

    useEffect(() => {
        getAllEvaluationParameters().then(res => setAllParameters(res.data.data)).catch(() => showError("Could not load existing parameters for import feature."));
    }, [showError]);

    useEffect(() => {
        if (selectedDomain) fetchSheet(selectedDomain.value);
        else reset({ columnGroups: [] });
    }, [selectedDomain, fetchSheet, reset]);

    const onSubmit = async (data) => {
        try {
            await updateEvaluationSheet(selectedDomain.value, data);
            showSuccess(`Evaluation sheet saved.`);
        } catch (error) { showError("Failed to save evaluation sheet."); }
    };
    
    const openImportModal = (groupIndex, colIndex) => setImportModal({ isOpen: true, target: { groupIndex, colIndex } });

    const handleImportParameter = (parameter) => {
        const { groupIndex } = importModal.target;
        const currentGroup = watch(`columnGroups.${groupIndex}`);
        const newColumns = [...(currentGroup.columns || []), { header: parameter.parameterName, options: parameter.options, type: 'select' }];
        setValue(`columnGroups.${groupIndex}.columns`, newColumns);
        showSuccess(`Parameter imported.`);
    };

    const handleImportOptions = (options) => {
        const { groupIndex, colIndex } = importModal.target;
        setValue(`columnGroups.${groupIndex}.columns.${colIndex}.options`, options);
        showSuccess(`${options.length} options imported.`);
        setImportModal({ isOpen: false, target: null });
    };
    
    const handleImportAllOptions = (options) => {
        const { groupIndex } = importModal.target;
        const currentGroup = watch(`columnGroups.${groupIndex}`);
        if (!currentGroup?.columns) return;
        const updatedColumns = currentGroup.columns.map(col => ({ ...col, options: col.type === 'select' ? options : [] }));
        setValue(`columnGroups.${groupIndex}.columns`, updatedColumns);
        showSuccess(`Applied options to all dropdowns in category.`);
        setImportModal({ isOpen: false, target: null });
    };
    
    const handleBulkAddOptions = (newOptions) => {
        const { groupIndex, colIndex } = bulkAddModal;
        if (groupIndex === null || colIndex === null) return;
        const path = `columnGroups.${groupIndex}.columns.${colIndex}.options`;
        const currentOptions = getValues(path) || [];
        setValue(path, [...currentOptions, ...newOptions]);
        showSuccess(`${newOptions.length} options added.`);
    };
    
    const openBulkAddModal = (groupIndex, colIndex) => setBulkAddModal({ isOpen: true, groupIndex, colIndex });
    
    const customSelectStyles = { control: base => ({ ...base, minHeight: '42px', borderRadius: '0.5rem', borderColor: '#d1d5db' }) };
    
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                    <div className="w-full md:w-80">
                        <Select options={domainOptions} value={selectedDomain} onChange={setSelectedDomain} isClearable placeholder="Choose a domain..." styles={customSelectStyles} isSearchable />
                    </div>
                    {selectedDomain && (
                        <div className="flex items-center gap-2">
                             <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                                <button type="button" onClick={() => setMode('edit')} className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 ${mode === 'edit' ? 'bg-white shadow-sm' : 'text-gray-500'}`}><FiEdit /> Edit</button>
                                <button type="button" onClick={() => setMode('preview')} className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 ${mode === 'preview' ? 'bg-white shadow-sm' : 'text-gray-500'}`}><FiEye /> Preview</button>
                            </div>
                            {mode === 'edit' && (
                                <>
                                   <LocalButton type="button" icon={FiPlus} variant="outline" size="sm" onClick={() => appendGroup({ title: '', columns: [] })}>Add Category</LocalButton>
                                   <LocalButton type="submit" icon={isSubmitting ? null : FiSave} isLoading={isSubmitting} variant="primary" size="sm" disabled={groupFields.length === 0}>Save Sheet</LocalButton>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {selectedDomain ? (
                    loading ? (
                        <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-600 border-t-transparent"></div></div>
                    ) : (
                        <div>
                            {mode === 'edit' ? <EditorComponent control={control} register={register} groupFields={groupFields} removeGroup={removeGroup} appendGroup={appendGroup} onBulkAddClick={openBulkAddModal} onImportClick={openImportModal} watch={watch} errors={errors} /> : <PreviewComponent sheetData={getValues()} />}
                        </div>
                    )
                ) : (
                    <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                        <FiAlertCircle className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                        <h3 className="font-medium text-gray-700">Select a Domain</h3>
                        <p className="text-sm text-gray-500">Choose a domain to start configuring its evaluation sheet.</p>
                    </div>
                )}
            </div>
            
            <ImportModal isOpen={importModal.isOpen} onClose={() => setImportModal({ isOpen: false, target: null })} onImportParameter={handleImportParameter} onImportOptions={handleImportOptions} onImportAllOptions={handleImportAllOptions} allParameters={allParameters} targetCategoryName={importModal.target ? getValues(`columnGroups.${importModal.target.groupIndex}.title`) : ''} />
            <BulkAddOptionsModal isOpen={bulkAddModal.isOpen} onClose={() => setBulkAddModal({ isOpen: false, groupIndex: null, colIndex: null })} onAdd={handleBulkAddOptions} />
        </form>
    );
};

export default DomainFieldsTab;
