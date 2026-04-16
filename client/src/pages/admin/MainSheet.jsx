// client/src/pages/admin/MainSheet.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import CreatableSelect from 'react-select/creatable';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import { Download, Plus, Edit, Trash2, MoreVertical, Search, Inbox, AlertTriangle, ChevronLeft, ChevronRight, ChevronDown, RefreshCw, Upload, Filter, X, Loader2, ExternalLink } from 'lucide-react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { deleteMainSheetEntry, bulkUpdateMainSheetEntries, refreshRecordingLinks, bulkUploadMainSheetEntries as bulkUpload, exportMainSheet } from '@/api/admin.api';
import { useMainSheetEntries, useInterviewers, useHiringNames, useDomains, useInvalidateAdmin } from '@/hooks/useAdminQueries';
import { useAlert } from '@/hooks/useAlert';
import { debounce } from '@/utils/helpers';
import { formatDate, formatTime } from '@/utils/formatters'; // <-- Ensure formatTime is imported
import { MAIN_SHEET_INTERVIEW_STATUSES } from '@/utils/constants';
import { Button as ShadcnButton } from '@/components/ui/button';

// --- SELF-CONTAINED UI COMPONENTS (Definitions omitted for brevity, assumed functional) ---
// (LocalButton, LocalSearchInput, LocalConfirmDialog, LocalDropdownMenu, LocalEmptyState, SkeletonRow, LocalTable, EditableHiringName, EditableDomainCell, UploadModal, RemarksModal, EditableCell)

const LocalButton = ({ children, onClick, isLoading = false, variant = 'primary', icon: Icon, className = '', disabled = false, type = 'button' }) => {
    const variantMap = { primary: 'default', outline: 'outline', danger: 'destructive', ghost: 'ghost' };
    return (
        <ShadcnButton type={type} onClick={onClick} isLoading={isLoading} disabled={disabled} variant={variantMap[variant] || 'default'} className={className}>
            {Icon && <Icon className={`h-4 w-4 ${children ? 'mr-1.5' : ''}`} />}
            {children}
        </ShadcnButton>
    );
};

const LocalSearchInput = ({ value, onChange, placeholder }) => (
    <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full pl-10 pr-3 h-10 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 text-sm text-slate-900 placeholder:text-slate-400 transition-colors"
        />
    </div>
);

// ... (other local components: LocalConfirmDialog, LocalDropdownMenu, LocalEmptyState, SkeletonRow, LocalTable, EditableHiringName, EditableDomainCell, UploadModal, RemarksModal, EditableCell are omitted for brevity, assumed functional) ...

const skeletonWidths = {
    candidateName: 'w-32', interviewId: 'w-16', uniqueId: 'w-44', mobileNumber: 'w-20', mailId: 'w-36',
    resumeLink: 'w-8', meetingLink: 'w-10', interviewDate: 'w-20', interviewTime: 'w-24',
    interviewDuration: 'w-12', interviewStatus: 'w-20', remarks: 'w-28', interviewerName: 'w-28',
    interviewerMail: 'w-32', interviewerRemarks: 'w-28', hiringName: 'w-20', techStack: 'w-20', actions: 'w-6',
};
const SkeletonRow = ({ columns }) => (
    <tr className="animate-pulse">
        {columns.map(col => (
            <td key={col.key} className={`px-3 py-2 whitespace-nowrap text-sm align-middle ${col.isSticky ? 'sticky left-0 z-[1] bg-white' : ''}`}>
                <div className={`h-3.5 ${skeletonWidths[col.key] || 'w-24'} bg-gray-100 rounded-md`}></div>
            </td>
        ))}
    </tr>
);

const LocalConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, isLoading }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
            <div className="relative w-full max-w-md bg-white rounded-xl shadow-lg" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex items-start">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                            <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
                            <div className="mt-2"><p className="text-sm text-gray-500">{message}</p></div>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-xl">
                    <LocalButton variant="danger" onClick={onConfirm} isLoading={isLoading} className="w-full sm:ml-3 sm:w-auto">Confirm</LocalButton>
                    <LocalButton variant="outline" onClick={onClose} className="mt-3 w-full sm:mt-0 sm:w-auto">Cancel</LocalButton>
                </div>
            </div>
        </div>
    );
};

const LocalDropdownMenu = ({ options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const buttonRef = useRef(null);
    const menuRef = useRef(null);
    const toggleMenu = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPosition({ top: rect.bottom + window.scrollY + 5, left: rect.right + window.scrollX - 192 });
        }
        setIsOpen(!isOpen);
    };
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && menuRef.current && !menuRef.current.contains(event.target) && !buttonRef.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const MenuContent = () => (
        <div ref={menuRef} className="fixed z-50 w-48 origin-top-right bg-white rounded-xl shadow-xl shadow-slate-900/10 border border-slate-200 focus:outline-none overflow-hidden" style={{ top: `${position.top}px`, left: `${position.left}px` }}>
            <div className="py-1.5">
                {options.map((option) => (
                    <button key={option.label} onClick={() => { option.onClick(); setIsOpen(false); }} className={`group flex items-center gap-2.5 w-full px-4 py-2 text-sm font-medium transition-colors ${option.isDestructive ? 'text-rose-600 hover:bg-rose-50' : 'text-slate-700 hover:bg-slate-50'}`}>
                        {option.icon && <option.icon className={`h-4 w-4 ${option.isDestructive ? 'text-rose-400' : 'text-slate-400'}`} />}
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={toggleMenu}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
                <MoreVertical className="h-4 w-4" />
            </button>
            {isOpen && createPortal(<MenuContent />, document.body)}
        </div>
    );
};

const ActionsMenu = ({ onAddEntries, onReload, onExport, onImport, isRefreshing, isExporting }) => {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const buttonRef = useRef(null);
    const menuRef = useRef(null);

    const toggleMenu = () => {
        if (!open && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + 8,
                left: rect.right - 192, // 192 = w-48
            });
        }
        setOpen(!open);
    };

    useEffect(() => {
        const handler = (e) => {
            if (open && menuRef.current && !menuRef.current.contains(e.target) && buttonRef.current && !buttonRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const items = [
        { label: 'Add Entries', icon: Plus, onClick: () => { onAddEntries(); setOpen(false); } },
        { label: isRefreshing ? 'Reloading...' : 'Reload', icon: RefreshCw, onClick: () => { onReload(); setOpen(false); }, disabled: isRefreshing },
        { label: isExporting ? 'Exporting...' : 'Export', icon: Download, onClick: () => { onExport(); setOpen(false); }, disabled: isExporting },
        { label: 'Import', icon: Upload, onClick: () => { onImport(); setOpen(false); } },
    ];

    return (
        <>
            <button
                ref={buttonRef}
                onClick={toggleMenu}
                className="h-10 w-10 rounded-xl flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-600 transition-colors"
            >
                <MoreVertical className="h-4 w-4" />
            </button>
            {open && createPortal(
                <div
                    ref={menuRef}
                    className="fixed w-48 bg-white rounded-xl shadow-xl shadow-slate-900/10 border border-slate-200 py-1.5 z-[9999] overflow-hidden"
                    style={{ top: `${position.top}px`, left: `${position.left}px` }}
                >
                    {items.map((item, i) => (
                        <button key={item.label} onClick={item.onClick} disabled={item.disabled}
                            className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-medium disabled:opacity-40 transition-colors ${i === 0 ? 'text-blue-600 hover:bg-blue-50' : 'text-slate-700 hover:bg-slate-50'}`}>
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </button>
                    ))}
                </div>,
                document.body
            )}
        </>
    );
};

const LocalEmptyState = ({ message, icon: Icon }) => (
    <div className="text-center py-20 px-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60 shadow-sm mb-4">
            <Icon className="h-6 w-6 text-slate-400" />
        </div>
        <h3 className="text-sm font-bold text-slate-900">No entries yet</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">{message}</p>
    </div>
);

const LocalTable = ({ columns, data, isLoading, emptyMessage, emptyIcon, sortConfig, onSort }) => (
    <div className="w-full h-full overflow-auto">
        <table className="min-w-full bg-white border-collapse">
            <thead>
                <tr>
                    {columns.map(col => (
                        <th
                           key={col.key}
                           scope="col"
                           onClick={() => col.sortable && onSort && onSort(col.key)}
                           className={`sticky top-0 z-10 px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em] whitespace-nowrap border-b border-slate-200 ${col.sortable ? 'cursor-pointer hover:text-slate-900' : ''} ${col.isSticky ? 'left-0 z-20' : ''} bg-slate-50/90 backdrop-blur-sm`}
                           style={{ minWidth: col.minWidth }}
                        >
                            <div className="flex items-center gap-1.5">
                                {col.title}
                                {col.sortable && (
                                    <span className="text-[10px]">
                                        {sortConfig.key === col.key ? (sortConfig.direction === 'asc' ? '▲' : '▼') : <span className="text-slate-300">⇅</span>}
                                    </span>
                                )}
                            </div>
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                    [...Array(15)].map((_, i) => <SkeletonRow key={i} columns={columns} />)
                ) : data.length === 0 ? (
                    <tr><td colSpan={columns.length}><LocalEmptyState message={emptyMessage} icon={emptyIcon} /></td></tr>
                ) : (
                    data.map((row, rowIndex) => (
                        <tr key={row._id || rowIndex} className="hover:bg-slate-50/70 transition-colors group h-px">
                            {columns.map(col => (
                                <td
                                    key={col.key}
                                    className={`${col.isCustomCell ? 'p-0' : 'px-4 py-0.5'} whitespace-nowrap text-sm text-slate-700 align-middle h-full ${col.isSticky ? 'sticky left-0 z-[1] bg-white group-hover:bg-slate-50/70' : ''}`}
                                >
                                    {col.render ? col.render(row, rowIndex) : row[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    </div>
);

const EditableHiringName = ({ entry, options, onSave }) => {
    const { showSuccess, showError } = useAlert();
    const [isLoading, setIsLoading] = useState(false);
    const [currentValue, setCurrentValue] = useState(entry.hiringName ? { label: entry.hiringName, value: entry.hiringName } : null);

    const handleChange = async (newValue) => {
        const newName = newValue ? newValue.value : '';
        if (newName === (entry.hiringName || '')) return;
        setIsLoading(true);
        setCurrentValue(newValue);
        try {
            await onSave(entry._id, 'hiringName', newName);
            showSuccess("Hiring Name updated successfully.");
        } catch (err) {
            showError("Failed to update Hiring Name.");
            setCurrentValue(entry.hiringName ? { label: entry.hiringName, value: entry.hiringName } : null);
        } finally {
            setIsLoading(false);
        }
    };
    const selectStyles = { menuPortal: base => ({ ...base, zIndex: 9999 }), control: (base) => ({ ...base, fontSize: '0.875rem', minHeight: '38px', minWidth: '150px' }), menu: (base) => ({ ...base, fontSize: '0.875rem' }) };
    return (<CreatableSelect isClearable isDisabled={isLoading} isLoading={isLoading} onChange={handleChange} value={currentValue} options={options} placeholder="Select or create..." menuPortalTarget={document.body} menuPosition={'fixed'} styles={selectStyles}/>);
};

const EditableDomainCell = ({ entry, domainOptions, onSave }) => {
    const { showSuccess, showError } = useAlert();
    const [currentValue, setCurrentValue] = useState(entry.techStack || '');
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => { setCurrentValue(entry.techStack || ''); }, [entry.techStack]);
    
    const handleSave = async (newDomain) => {
        if (newDomain === currentValue) return;
        setIsLoading(true);
        setCurrentValue(newDomain);
        try {
            await onSave(entry._id, 'techStack', newDomain);
            showSuccess("Tech Stack updated successfully.");
        } catch (err) {
            showError("Failed to update Tech Stack.");
            setCurrentValue(entry.techStack || '');
        } finally { setIsLoading(false); }
    };

    return (<select value={currentValue} onChange={(e) => handleSave(e.target.value)} disabled={isLoading} className={`w-full text-xs font-semibold px-2 py-1.5 border rounded-md shadow-sm focus:outline-none focus:ring-1 transition-colors cursor-pointer bg-gray-50 hover:bg-gray-100 ${isLoading ? 'opacity-50' : ''}`} onClick={(e) => e.stopPropagation()}><option value="" disabled>Select Domain</option>{domainOptions.map(opt => (opt.value && <option key={opt.value} value={opt.value}>{opt.label}</option>))}</select>);
};

const UploadModal = ({ isOpen, onClose, onUploadConfirm, title, instructions, requiredHeaders, isLoading }) => {
    const [file, setFile] = useState(null);
    const [parsedData, setParsedData] = useState([]);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);
    const { showError } = useAlert();

    useEffect(() => {
        if (!isOpen) {
            setFile(null);
            setParsedData([]);
            setError('');
            if(fileInputRef.current) fileInputRef.current.value = null;
        }
    }, [isOpen]);
    
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;
        setError('');
        setFile(selectedFile);
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const workbook = XLSX.read(event.target.result, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(sheet);

                if (data.length === 0) {
                    setError("The selected file is empty."); return;
                }
                const headers = Object.keys(data[0]);
                const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

                if (missingHeaders.length > 0) {
                    setError(`File is missing required headers: ${missingHeaders.join(', ')}`); return;
                }
                setParsedData(data);
            } catch (err) {
                showError("Failed to parse file. Please ensure it is a valid CSV or XLSX format.");
                setError("Parsing failed. Check file format.");
            }
        };
        reader.readAsBinaryString(selectedFile);
    };

    const handleConfirm = () => { if(parsedData.length > 0) { onUploadConfirm(parsedData); } };

    return isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
            <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-lg flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b"><h3 className="text-lg font-semibold text-gray-800">{title}</h3></div>
                <div className="p-6 flex-grow overflow-y-auto space-y-4">
                    <div className="flex items-center gap-4"><input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv, .xlsx" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>{error && <p className="text-red-600 text-sm font-semibold">{error}</p>}</div>
                    {parsedData.length > 0 && (<div className="border border-gray-200 rounded-xl max-h-80 overflow-auto"><table className="min-w-full text-xs"><thead className="bg-gray-100 sticky top-0"><tr className="text-left font-semibold text-gray-600">{Object.keys(parsedData[0]).map(h => <th key={h} className="p-2 border-b">{h}</th>)}</tr></thead><tbody>{parsedData.slice(0, 10).map((row, i) => (<tr key={i} className="bg-white border-b">{Object.values(row).map((val, j) => <td key={j} className="p-2 truncate" title={val}>{String(val)}</td>)}</tr>))}</tbody></table>{parsedData.length > 10 && <div className="p-2 text-center text-sm bg-gray-50">...and {parsedData.length - 10} more rows</div>}</div>)}
                </div>
                <div className="bg-gray-50 p-4 flex justify-between items-center border-t">
                    <p className="text-sm text-gray-600">{parsedData.length > 0 ? `${parsedData.length} records detected and ready for import.` : "Please select a file to preview."}</p>
                    <div>
                        <LocalButton variant="outline" className="mr-2" onClick={onClose}>Cancel</LocalButton>
                        <LocalButton variant="primary" onClick={handleConfirm} isLoading={isLoading} disabled={!file || error || parsedData.length === 0} icon={Upload}>Upload {parsedData.length > 0 ? parsedData.length : ''} Entries</LocalButton>
                    </div>
                </div>
            </div>
        </div>
    ) : null;
};
// --- Remarks Modal ---
const RemarksModal = ({ isOpen, onClose, content }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-lg bg-white rounded-xl shadow-lg"
                onClick={e => e.stopPropagation()}
            >
                <div className="px-6 py-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Full Remarks</h3>
                    <ShadcnButton variant="ghost" size="icon" onClick={onClose} className="rounded-full text-gray-400 hover:bg-gray-200">
                        <X className="h-5 w-5"/>
                    </ShadcnButton>
                </div>
                <div className="p-6">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{content}</p>
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-end rounded-b-xl">
                    <LocalButton variant="outline" onClick={onClose}>Close</LocalButton>
                </div>
            </div>

        </div>
    );
};
const EditableCell = ({ value, onSave, isLoading, fieldName, rowId }) => {
    const [currentValue, setCurrentValue] = useState(value || '');

    useEffect(() => {
        setCurrentValue(value || '');
    }, [value]);

    const handleSave = () => {
        if (currentValue.trim() !== (value || '').trim()) {
            onSave(rowId, fieldName, currentValue.trim());
        }
    };

    return (
        <div className="relative h-full">
            <textarea
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                onBlur={handleSave}
                disabled={isLoading}
                placeholder=""
                className="block w-full h-full min-h-[28px] text-xs px-3 py-2 border-0 bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-inset focus:ring-blue-400 resize-none leading-tight transition-colors"
            />
            {isLoading && <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />}
        </div>
    );
};


const MainSheet = () => {
    const { showSuccess, showError } = useAlert();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [filterMenuPos, setFilterMenuPos] = useState({ top: 0, left: 0 });
    const [tempFilters, setTempFilters] = useState({ interviewDate: null, interviewStatus: '' });
    const [activeFilters, setActiveFilters] = useState({ interviewDate: null, interviewStatus: '' });
    const filterMenuRef = useRef(null);
    const filterButtonRef = useRef(null);

    const toggleFilterMenu = () => {
        if (!isFilterMenuOpen && filterButtonRef.current) {
            const rect = filterButtonRef.current.getBoundingClientRect();
            setFilterMenuPos({ top: rect.bottom + 8, left: rect.right - 320 }); // 320 = w-80
        }
        setIsFilterMenuOpen(!isFilterMenuOpen);
    };

    useEffect(() => {
        const handler = (e) => {
            if (isFilterMenuOpen && filterMenuRef.current && !filterMenuRef.current.contains(e.target) && filterButtonRef.current && !filterButtonRef.current.contains(e.target)) {
                setIsFilterMenuOpen(false);
            }
        };
        if (isFilterMenuOpen) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isFilterMenuOpen]);
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, entry: null, isLoading: false });
    const [updatingId, setUpdatingId] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'interviewId', direction: 'desc' });
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [remarksModal, setRemarksModal] = useState({ isOpen: false, content: '' });

    const { invalidateMainSheet } = useInvalidateAdmin();

    // --- TanStack Query: build query params ---
    const queryParams = useMemo(() => {
        const params = { search: debouncedSearch, page: currentPage, limit: 100, ...activeFilters, sortBy: sortConfig.key, sortOrder: sortConfig.direction };
        if (activeFilters.interviewDate) {
            params.interviewDate = format(activeFilters.interviewDate, 'yyyy-MM-dd');
        }
        return params;
    }, [debouncedSearch, currentPage, activeFilters, sortConfig]);

    const { data: entriesData, isLoading: loading } = useMainSheetEntries(queryParams);
    const entries = entriesData?.entries || [];
    const pagination = {
        currentPage: entriesData?.page || 1,
        totalPages: entriesData?.totalPages || 1,
        totalItems: entriesData?.totalDocs || 0,
    };

    const { data: interviewersData } = useInterviewers({ limit: 500, status: 'Active,On Probation' });
    const interviewerOptions = useMemo(() =>
        (interviewersData?.interviewers || []).map(i => ({ value: i._id, label: `${i.user.firstName} ${i.user.lastName}`, email: i.user.email })),
        [interviewersData]
    );

    const { data: hiringNamesData } = useHiringNames();
    const hiringNames = hiringNamesData || [];

    const { data: domainsData } = useDomains();
    const domainOptions = useMemo(() =>
        (domainsData || []).map(d => ({ value: d.name, label: d.name })),
        [domainsData]
    );

    // --- Debounce search input to update query params ---
    const debouncedSetSearch = useMemo(() => debounce((value) => {
        setDebouncedSearch(value);
        setCurrentPage(1);
    }, 300), []);
    useEffect(() => { debouncedSetSearch(search); return () => debouncedSetSearch.cancel(); }, [search, debouncedSetSearch]);

    const handleSort = (key) => {
        setSortConfig(prevConfig => {
            const isAsc = prevConfig.key === key && prevConfig.direction === 'asc';
            return {
                key: key,
                direction: isAsc ? 'desc' : 'asc'
            };
        });
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
                setIsFilterMenuOpen(false);
            }
        };
        if (isFilterMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isFilterMenuOpen]);
    
    const handleCellSave = async (entryId, fieldKey, newValue) => {
        setUpdatingId(entryId);
        try {
            const entry = entries.find(e => e._id === entryId);
            if (!entry) throw new Error("Entry not found");
            await bulkUpdateMainSheetEntries([{ ...entry, [fieldKey]: newValue }]);
            invalidateMainSheet();
        } catch (error) {
            showError(`Failed to update ${fieldKey}.`);
        } finally {
            setUpdatingId(null);
        }
    };
    
    const handleRefreshRecordings = async () => {
        setIsRefreshing(true);
        try {
            const response = await refreshRecordingLinks();
            showSuccess(response.data.message);
            invalidateMainSheet();
        } catch (error) {
            showError('Failed to refresh recording links.');
        } finally {
            setIsRefreshing(false);
        }
    };
    
    const handleUploadConfirm = async (data) => {
        setIsUploading(true);
        try {
            const response = await bulkUpload(data);
            const { created, errors } = response.data.data;
            if (errors && errors.length > 0) {
                showError(`${errors.length} rows failed to import. Please check your data and try again.`);
            }
            showSuccess(`${created} entries imported successfully!`);
            setIsUploadModalOpen(false);
            invalidateMainSheet();
        } catch(err) {
            showError(err.response?.data?.message || 'Bulk upload failed. Please ensure the data format is correct.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleStatusChange = async (entryId, newStatus) => {
        await handleCellSave(entryId, 'interviewStatus', newStatus);
    };
    
    const handleInterviewerChange = async (entryId, newInterviewerId) => {
        const valueToSend = newInterviewerId === '' ? null : newInterviewerId;
        await handleCellSave(entryId, 'interviewer', valueToSend);
    };

    const handleDeleteRequest = useCallback((entry) => setDeleteDialog({ isOpen: true, entry, isLoading: false }), []);
    
    const handleDeleteConfirm = async () => {
        if (!deleteDialog.entry) return;
        setDeleteDialog(prev => ({ ...prev, isLoading: true }));
        try {
            await deleteMainSheetEntry(deleteDialog.entry._id);
            showSuccess('Entry deleted successfully!');
            invalidateMainSheet();
        } catch (error) { showError('Failed to delete entry.'); } 
        finally { setDeleteDialog({ isOpen: false, entry: null, isLoading: false }); }
    };
    
    const handleExport = async () => {
        setIsExporting(true);
        try {
            const response = await exportMainSheet(activeFilters);
            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, `MainSheet_Export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
            showSuccess("Export started successfully.");
        } catch (err) {
            showError("Failed to export Main Sheet data.");
        } finally {
            setIsExporting(false);
        }
    };

    const handleApplyFilters = () => {
        setActiveFilters(tempFilters);
        setIsFilterMenuOpen(false);
    };

    const handleClearFilters = () => {
        setTempFilters({ interviewDate: null, interviewStatus: '' });
        setActiveFilters({ interviewDate: null, interviewStatus: '' });
        setIsFilterMenuOpen(false);
    };

    const openRemarksModal = useCallback((remarks) => {
        setRemarksModal({ isOpen: true, content: remarks });
    }, []);

    const isFilterActive = activeFilters.interviewDate || activeFilters.interviewStatus;
    
    const hiringNamesOptions = useMemo(() => hiringNames.map(name => ({ label: name, value: name })), [hiringNames]);

    const columns = useMemo(() => [
        { key: 'candidateName', title: 'Candidate Name', minWidth: '200px', isSticky: true },
        { key: 'interviewId', title: 'Interview ID', minWidth: '150px', sortable: true},
        { key: 'uid', title: 'UID', minWidth: '120px' },
        { key: 'mobileNumber', title: 'Mobile', minWidth: '120px' },
        { key: 'mailId', title: "Mail ID", minWidth: '200px' },
        { key: 'candidateResume', title: 'Resume', render: (row) => row.candidateResume ? <a href={row.candidateResume} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors" title={row.candidateResume}>Link <ExternalLink className="h-3 w-3" /></a> : <span className="text-gray-300">—</span> },
        { key: 'meetingLink', title: 'Meeting Link', minWidth: '110px', render: (row) => row.meetingLink ? (<a href={row.meetingLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors" title={row.meetingLink}>Link <ExternalLink className="h-3 w-3" /></a>) : <span className="text-gray-300">—</span> },
        { key: 'recordingLink', title: 'Recording Link', minWidth: '120px', render: (row) => row.recordingLink ? (<a href={row.recordingLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors" title={row.recordingLink}>Link <ExternalLink className="h-3 w-3" /></a>) : <span className="text-gray-300">—</span> },
        { key: 'transcriptLink', title: 'Transcript Link', minWidth: '120px', render: (row) => row.transcriptLink ? (<a href={row.transcriptLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors" title={row.transcriptLink}>Link <ExternalLink className="h-3 w-3" /></a>) : <span className="text-gray-300">—</span> },
        { key: 'interviewDate', title: 'Date', render: (row) => row.interviewDate ? formatDate(row.interviewDate) : '' },
        { 
            key: 'interviewTime', 
            title: 'Time',
            // --- MODIFICATION START ---
            render: (row) => {
                const timeSlot = row.interviewTime;
                if (!timeSlot || !timeSlot.includes('-')) return timeSlot || '';

                const [startTimeStr, endTimeStr] = timeSlot.split('-').map(t => t.trim());
                return `${formatTime(startTimeStr)} - ${formatTime(endTimeStr)}`;
            }
            // --- MODIFICATION END ---
        },
        { key: 'interviewDuration', title: 'Duration' },
        { key: 'interviewStatus', title: 'Status', minWidth: '140px', isCustomCell: true, render: (row) => {
            const statusColors = {
                'Completed': 'bg-emerald-50 text-emerald-700',
                'Scheduled': 'bg-amber-50 text-amber-700',
                'InProgress': 'bg-blue-50 text-blue-700',
                'Cancelled': 'bg-red-50 text-red-700',
            };
            return (
                <div className="relative h-full">
                    <select
                        value={row.interviewStatus || ''}
                        onChange={(e) => handleStatusChange(row._id, e.target.value)}
                        disabled={updatingId === row._id}
                        className={`block w-full h-full min-h-[28px] text-xs font-semibold pl-3 pr-7 py-2 border-0 rounded-none cursor-pointer appearance-none focus:outline-none focus:ring-1 focus:ring-inset focus:ring-blue-400 transition-colors ${statusColors[row.interviewStatus] || 'bg-white text-gray-500'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <option value="" disabled>Select</option>
                        {MAIN_SHEET_INTERVIEW_STATUSES.map(status => (
                            <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                </div>
            );
        } },
        { key: 'remarks', title: 'Remarks', minWidth: '250px', isCustomCell: true, render: (row) => <EditableCell value={row.remarks} onSave={handleCellSave} fieldName="remarks" rowId={row._id} isLoading={updatingId === row._id} /> },
        { key: 'interviewerName', title: 'Interviewer', minWidth: '200px', isCustomCell: true, render: (row) => (
            <div className="relative h-full">
                <select
                    value={row.interviewer?._id || ''}
                    onChange={(e) => handleInterviewerChange(row._id, e.target.value)}
                    disabled={updatingId === row._id}
                    className="block w-full h-full min-h-[28px] pl-3 pr-7 py-2 text-xs border-0 rounded-none bg-white cursor-pointer appearance-none focus:outline-none focus:ring-1 focus:ring-inset focus:ring-blue-400 text-gray-700 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                >
                    <option value="">Unassigned</option>
                    {interviewerOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            </div>
        ) },
        { key: 'interviewerMail', title: "Interviewer Mail", minWidth: '200px', render: (row) => row.interviewer?.user?.email || '' },
        { key: 'interviewerRemarks', title: 'Interviewer Remarks', minWidth: '250px', render: (row) => {
            const remarks = row.interviewerRemarks;
            const charLimit = 50;
            if (!remarks) { return <span className="text-gray-400"></span>; }
            if (remarks.length <= charLimit) { return <div className="p-2 whitespace-normal break-words" title={remarks}></div>; }
            return (
                <div className="flex items-center overflow-hidden p-2">
                    <span className="truncate" title={remarks}>{remarks.substring(0, charLimit)}...</span>
                    <ShadcnButton variant="link" size="sm" onClick={() => openRemarksModal(remarks)} className="ml-1 text-blue-600 hover:text-blue-800 text-xs font-semibold flex-shrink-0 p-0 h-auto">more</ShadcnButton>
                </div>
            );
        }},
        { key: 'hiringName', title: 'Hiring Name', minWidth: '150px', render: (row) => <EditableHiringName entry={row} options={hiringNamesOptions} onSave={handleCellSave} /> },
        { key: 'techStack', title: 'Tech Stack', minWidth: '150px', render: (row) => <EditableDomainCell entry={row} domainOptions={domainOptions} onSave={handleCellSave} /> },
        { key: 'actions', title: 'Actions', minWidth: '60px', render: (row) => (<LocalDropdownMenu options={[{ label: 'Edit', icon: Edit, onClick: () => navigate(`/admin/main-sheet/edit/${row._id}`) }, { label: 'Delete', icon: Trash2, isDestructive: true, onClick: () => handleDeleteRequest(row) },]}/>)}
    ], [navigate, handleDeleteRequest, handleStatusChange, handleInterviewerChange, updatingId, interviewerOptions, hiringNamesOptions, handleCellSave, domainOptions, openRemarksModal]);
    
    const mainSheetUploadProps = {
        isOpen: isUploadModalOpen,
        onClose: () => setIsUploadModalOpen(false),
        onUploadConfirm: handleUploadConfirm,
        title: "Import Main Sheet Entries",
        instructions: [ "This creates new entries. To update, edit directly in the sheet.", "Required headers: `candidateName`, `mailId`.", "Optional header: `interviewerName` (must match an existing interviewer's full name).", "Other fields like `hiringName`, `techStack`, `remarks`, etc., will be imported as provided." ],
        requiredHeaders: ['candidateName', 'mailId'],
        isLoading: isUploading,
    };

    const showingFrom = pagination.totalItems > 0 ? (pagination.currentPage - 1) * 100 + 1 : 0;
    const showingTo = Math.min(pagination.currentPage * 100, pagination.totalItems);

    return (
        <div className="h-full w-full flex flex-col overflow-hidden bg-[#f5f7fb]">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Main Sheet</h1>
                        {pagination.totalItems > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">
                                {pagination.totalItems} records
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2.5">
                        <div className="w-64">
                            <LocalSearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search candidates..." />
                        </div>
                        <button
                            ref={filterButtonRef}
                            onClick={toggleFilterMenu}
                            className={`h-10 inline-flex items-center gap-2 px-4 text-sm font-semibold rounded-xl border transition-colors ${isFilterActive ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                        >
                            <Filter className="h-3.5 w-3.5" />
                            Filter
                            {isFilterActive && (
                                <span
                                    onClick={(e) => { e.stopPropagation(); handleClearFilters(); }}
                                    className="ml-0.5 p-0.5 rounded-full hover:bg-blue-100"
                                >
                                    <X className="h-3 w-3 text-blue-600" />
                                </span>
                            )}
                        </button>
                        {isFilterMenuOpen && createPortal(
                            <div
                                ref={filterMenuRef}
                                className="fixed w-80 bg-white rounded-xl shadow-xl shadow-slate-900/10 border border-slate-200 z-[9999] p-5"
                                style={{ top: `${filterMenuPos.top}px`, left: `${filterMenuPos.left}px` }}
                            >
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-2">Date</label>
                                        <DatePicker
                                            selected={tempFilters.interviewDate}
                                            onChange={(date) => setTempFilters(prev => ({ ...prev, interviewDate: date }))}
                                            isClearable
                                            placeholderText="Select a date"
                                            className="w-full h-10 px-3 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors"
                                            portalId="datepicker-portal"
                                            popperClassName="!z-[10000]"
                                            popperProps={{ strategy: 'fixed' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-2">Status</label>
                                        <select
                                            value={tempFilters.interviewStatus}
                                            onChange={(e) => setTempFilters(prev => ({ ...prev, interviewStatus: e.target.value }))}
                                            className="w-full h-10 px-3 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 cursor-pointer transition-colors"
                                        >
                                            <option value="">All Statuses</option>
                                            {MAIN_SHEET_INTERVIEW_STATUSES.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end gap-2">
                                    <button
                                        onClick={handleClearFilters}
                                        className="h-9 px-4 text-xs font-medium text-slate-600 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors"
                                    >
                                        Clear
                                    </button>
                                    <button
                                        onClick={handleApplyFilters}
                                        className="h-9 px-4 text-xs font-medium text-white rounded-md bg-blue-600 hover:bg-blue-700 transition-all"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>,
                            document.body
                        )}
                        {/* Actions dropdown */}
                        <ActionsMenu
                            onAddEntries={() => navigate('/admin/main-sheet/add')}
                            onReload={handleRefreshRecordings}
                            onExport={handleExport}
                            onImport={() => setIsUploadModalOpen(true)}
                            isRefreshing={isRefreshing}
                            isExporting={isExporting}
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden bg-white">
                <LocalTable
                    columns={columns}
                    data={entries}
                    isLoading={loading}
                    emptyMessage="No entries found in the main sheet."
                    emptyIcon={Inbox}
                    onSort={handleSort}
                    sortConfig={sortConfig}
                />
            </div>

            {!loading && pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-3 flex-shrink-0">
                    <p className="text-xs text-slate-500 font-medium">
                        Showing <span className="font-bold text-slate-900">{showingFrom}</span>–<span className="font-bold text-slate-900">{showingTo}</span> of <span className="font-bold text-slate-900">{pagination.totalItems}</span>
                    </p>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setCurrentPage(pagination.currentPage - 1)}
                            disabled={loading || pagination.currentPage <= 1}
                            className="h-9 w-9 rounded-md flex items-center justify-center border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <div className="hidden md:flex items-center gap-1">
                            {(() => {
                                const pages = [];
                                const total = pagination.totalPages;
                                const current = pagination.currentPage;
                                const range = 2;
                                for (let i = 1; i <= total; i++) {
                                    if (i === 1 || i === total || (i >= current - range && i <= current + range)) {
                                        pages.push(i);
                                    } else if (pages[pages.length - 1] !== '...') {
                                        pages.push('...');
                                    }
                                }
                                return pages.map((p, idx) =>
                                    p === '...' ? (
                                        <span key={`dots-${idx}`} className="px-1.5 text-xs text-slate-400">…</span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => setCurrentPage(p)}
                                            className={`h-9 min-w-[36px] px-2.5 rounded-md text-xs font-medium transition-all ${
                                                p === current
                                                    ? 'text-white bg-blue-600'
                                                    : 'text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    )
                                );
                            })()}
                        </div>
                        <button
                            onClick={() => setCurrentPage(pagination.currentPage + 1)}
                            disabled={loading || pagination.currentPage >= pagination.totalPages}
                            className="h-9 w-9 rounded-md flex items-center justify-center border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            <LocalConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, entry: null, isLoading: false })}
                onConfirm={handleDeleteConfirm}
                title="Delete Entry"
                message={`Are you sure you want to delete the entry for "${deleteDialog.entry?.candidateName}"? This action is permanent.`}
                isLoading={deleteDialog.isLoading}
            />
            <UploadModal {...mainSheetUploadProps} />
            <RemarksModal
                isOpen={remarksModal.isOpen}
                onClose={() => setRemarksModal({ isOpen: false, content: '' })}
                content={remarksModal.content}
            />
        </div>
    );
};

export default MainSheet;
