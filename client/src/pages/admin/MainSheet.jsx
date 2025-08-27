import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import CreatableSelect from 'react-select/creatable'; 
import { FiDownload, FiPlus, FiEdit, FiTrash2, FiMoreVertical, FiSearch, FiInbox, FiAlertTriangle, FiChevronLeft, FiChevronRight, FiRefreshCw, FiUpload } from 'react-icons/fi';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { getMainSheetEntries, deleteMainSheetEntry, getInterviewers, bulkUpdateMainSheetEntries, getUniqueHiringNames, getDomains, refreshRecordingLinks, bulkUploadMainSheetEntries as bulkUpload } from '@/api/admin.api'; 
import { useAlert } from '@/hooks/useAlert';
import { debounce } from '@/utils/helpers';
import { formatDate } from '@/utils/formatters';
import { MAIN_SHEET_INTERVIEW_STATUSES } from '@/utils/constants';

// --- SELF-CONTAINED UI COMPONENTS ---

const LocalButton = ({ children, onClick, isLoading = false, variant = 'primary', icon: Icon, className = '', disabled = false, type = 'button' }) => {
    const baseClasses = "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm";
    const variantClasses = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        outline: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
        danger: 'bg-red-600 text-white hover:bg-red-700',
    };
    const iconOnlyClass = !children && Icon ? '!px-2' : '';
    return (
        <button type={type} onClick={onClick} disabled={isLoading || disabled} className={`${baseClasses} ${variantClasses[variant]} ${iconOnlyClass} ${className}`}>
            {isLoading ? <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg> : (Icon && <Icon className={`h-4 w-4 ${children ? 'mr-2' : ''}`} />)}
            {isLoading ? "Processing..." : children}
        </button>
    );
};

const LocalSearchInput = ({ value, onChange, placeholder }) => (
    <div className="relative"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" value={value} onChange={onChange} placeholder={placeholder} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm" /></div>
);

const LocalConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, isLoading }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
            <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex items-start">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                            <FiAlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
                            <div className="mt-2"><p className="text-sm text-gray-500">{message}</p></div>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
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
        <div ref={menuRef} className="fixed z-50 w-48 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" style={{ top: `${position.top}px`, left: `${position.left}px` }}>
            <div className="py-1">
                {options.map((option) => (
                    <button key={option.label} onClick={() => { option.onClick(); setIsOpen(false); }} className={`group flex items-center w-full px-4 py-2 text-sm ${option.isDestructive ? 'text-red-700 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-100'}`}>
                        {option.icon && <option.icon className={`mr-3 h-5 w-5 ${option.isDestructive ? 'text-red-400' : 'text-gray-400'}`} />}
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
    return (
        <div className="relative"><button ref={buttonRef} onClick={toggleMenu} className="p-2 rounded-full hover:bg-gray-100"><FiMoreVertical /></button>{isOpen && createPortal(<MenuContent />, document.body)}</div>
    );
};

const LocalLoader = () => (
    <div className="flex justify-center items-center py-20 text-center text-gray-500"><div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div><span className="ml-4">Loading data...</span></div>
);
const LocalEmptyState = ({ message, icon: Icon }) => (
    <div className="text-center py-20 text-gray-500"><Icon className="mx-auto h-10 w-10 text-gray-400 mb-2" /><h3 className="font-semibold text-gray-700">No Data Found</h3><p className="text-sm">{message}</p></div>
);
const LocalTable = ({ columns, data, isLoading, emptyMessage, emptyIcon }) => (
    <div className="w-full overflow-x-auto"><table className="min-w-full bg-white divide-y divide-gray-200 border-collapse"><thead className="bg-gray-50 sticky top-0 z-[5]"><tr>{columns.map(col => (<th key={col.key} scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b" style={{ minWidth: col.minWidth }}>{col.title}</th>))}</tr></thead><tbody className="divide-y divide-gray-200">{isLoading ? (<tr><td colSpan={columns.length}><LocalLoader /></td></tr>) : data.length === 0 ? (<tr><td colSpan={columns.length}><LocalEmptyState message={emptyMessage} icon={emptyIcon} /></td></tr>) : (data.map((row, rowIndex) => (<tr key={row._id || rowIndex} className="hover:bg-gray-50 transition-colors align-top">{columns.map(col => (<td key={col.key} className="px-3 whitespace-nowrap text-sm text-gray-700 align-middle">{col.render ? col.render(row, rowIndex) : row[col.key]}</td>))}</tr>)))}</tbody></table></div>
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
            <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b"><h3 className="text-lg font-semibold text-gray-800">{title}</h3></div>
                <div className="p-6 flex-grow overflow-y-auto space-y-4">
                    <div className="flex items-center gap-4"><input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv, .xlsx" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>{error && <p className="text-red-600 text-sm font-semibold">{error}</p>}</div>
                    {parsedData.length > 0 && (<div className="border border-gray-200 rounded-lg overflow-hidden max-h-80 overflow-auto"><table className="min-w-full text-xs"><thead className="bg-gray-100 sticky top-0"><tr className="text-left font-semibold text-gray-600">{Object.keys(parsedData[0]).map(h => <th key={h} className="p-2 border-b">{h}</th>)}</tr></thead><tbody>{parsedData.slice(0, 10).map((row, i) => (<tr key={i} className="bg-white border-b">{Object.values(row).map((val, j) => <td key={j} className="p-2 truncate" title={val}>{String(val)}</td>)}</tr>))}</tbody></table>{parsedData.length > 10 && <div className="p-2 text-center text-sm bg-gray-50">...and {parsedData.length - 10} more rows</div>}</div>)}
                </div>
                <div className="bg-gray-50 p-4 flex justify-between items-center border-t">
                    <p className="text-sm text-gray-600">{parsedData.length > 0 ? `${parsedData.length} records detected and ready for import.` : "Please select a file to preview."}</p>
                    <div>
                        <LocalButton variant="outline" className="mr-2" onClick={onClose}>Cancel</LocalButton>
                        <LocalButton variant="primary" onClick={handleConfirm} isLoading={isLoading} disabled={!file || error || parsedData.length === 0} icon={FiUpload}>Upload {parsedData.length > 0 ? parsedData.length : ''} Entries</LocalButton>
                    </div>
                </div>
            </div>
        </div>
    ) : null;
};


// --- MAIN SHEET COMPONENT ---
const MainSheet = () => {
    const { showSuccess, showError } = useAlert();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [entries, setEntries] = useState([]);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, entry: null, isLoading: false });
    const [updatingId, setUpdatingId] = useState(null);
    const [interviewerOptions, setInterviewerOptions] = useState([]);
    const [hiringNames, setHiringNames] = useState([]);
    const [domainOptions, setDomainOptions] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    // --- silentFetchEntries: Fetches data without showing the main loader ---
    const silentFetchEntries = useCallback(async (page = 1) => {
        // No setLoading(true) here
        try {
            const response = await getMainSheetEntries({ search, page, limit: 20 });
            setEntries(response.data.data.entries || []);
            setPagination(response.data.data);
        } catch (error) { 
            showError("Failed to refresh main sheet data.");
        }
    }, [search, showError]);
    
    // --- fetchEntries: Fetches data and shows the main loader ---
    const fetchEntries = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await getMainSheetEntries({ search, page, limit: 20 });
            setEntries(response.data.data.entries || []);
            setPagination(response.data.data);
        } catch (error) { 
            showError("Failed to fetch main sheet data.");
        } finally { 
            setLoading(false);
        }
    }, [search, showError]);

    useEffect(() => {
        getUniqueHiringNames().then(res => setHiringNames(res.data.data)).catch(() => showError("Failed to load hiring names list."));
        getInterviewers({ limit: 500, status: 'Active,On Probation' }).then(res => {
            const options = (res.data.data.interviewers || []).map(i => ({ value: i._id, label: `${i.user.firstName} ${i.user.lastName}`, email: i.user.email, }));
            setInterviewerOptions(options);
        }).catch(() => showError("Failed to load interviewers list."));
        getDomains().then(res => { const options = (res.data.data || []).map(d => ({ value: d.name, label: d.name })); setDomainOptions(options); }).catch(() => showError("Failed to load domains from Evaluation Setup."));
    }, [showError]);
    
    const debouncedFetch = useMemo(() => debounce(() => fetchEntries(1), 300), [fetchEntries]);
    useEffect(() => { debouncedFetch(); return () => debouncedFetch.cancel(); }, [debouncedFetch]);
    
    const handleCellSave = async (entryId, fieldKey, newValue) => {
        setUpdatingId(entryId);
        try {
            const entry = entries.find(e => e._id === entryId);
            if (!entry) throw new Error("Entry not found");
            await bulkUpdateMainSheetEntries([{ ...entry, [fieldKey]: newValue }]);
            setEntries(current => current.map(e => e._id === entryId ? { ...e, [fieldKey]: newValue } : e));
            if (fieldKey === 'hiringName' && newValue && !hiringNames.includes(newValue)) {
                setHiringNames(prev => [...prev, newValue].sort());
            }
        } catch (error) {
            showError(`Failed to update ${fieldKey}.`);
        } finally {
            setUpdatingId(null);
        }
    };
    
    const handleRefreshRecordings = async () => {
        setIsRefreshing(true); // Show loader on the button
        try {
            const response = await refreshRecordingLinks();
            showSuccess(response.data.message);
            await silentFetchEntries(pagination.currentPage); // SILENTLY refresh data
        } catch (error) {
            showError('Failed to refresh recording links.');
        } finally {
            setIsRefreshing(false); // Hide loader on the button
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
            fetchEntries(1); // Hard reload after upload
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
        const selectedInterviewer = interviewerOptions.find(opt => opt.value === newInterviewerId);
        setEntries(current => current.map(e => e._id === entryId ? { ...e, interviewer: selectedInterviewer ? { _id: selectedInterviewer.value, user: { firstName: selectedInterviewer.label.split(' ')[0], lastName: selectedInterviewer.label.split(' ').slice(1).join(' '), email: selectedInterviewer.email }} : null } : e));
    };

    const handleDeleteRequest = useCallback((entry) => setDeleteDialog({ isOpen: true, entry, isLoading: false }), []);
    
    const handleDeleteConfirm = async () => {
        if (!deleteDialog.entry) return;
        setDeleteDialog(prev => ({ ...prev, isLoading: true }));
        try {
            await deleteMainSheetEntry(deleteDialog.entry._id);
            showSuccess('Entry deleted successfully!');
            silentFetchEntries(pagination.currentPage); // SILENTLY refresh data
        } catch (error) { showError('Failed to delete entry.'); } 
        finally { setDeleteDialog({ isOpen: false, entry: null, isLoading: false }); }
    };
    
    const handleExport = () => {
        // Implement export logic here if needed
        showError("Export functionality is not yet implemented.");
    };
    
    const hiringNamesOptions = useMemo(() => hiringNames.map(name => ({ label: name, value: name })), [hiringNames]);

    const columns = useMemo(() => [
        { key: 'hiringName', title: 'Hiring Name', minWidth: '150px', render: (row) => <EditableHiringName entry={row} options={hiringNamesOptions} onSave={handleCellSave} /> },
        { key: 'techStack', title: 'Tech Stack', minWidth: '150px', render: (row) => <EditableDomainCell entry={row} domainOptions={domainOptions} onSave={handleCellSave} /> },
        { key: 'interviewId', title: 'Interview ID', minWidth: '150px'},
        { key: 'uid', title: 'UID', minWidth: '120px' },
        { key: 'candidateName', title: 'Candidate', minWidth: '180px' },
        { key: 'mobileNumber', title: 'Mobile', minWidth: '120px' },
        { key: 'mailId', title: "Mail ID", minWidth: '200px' },
        { key: 'candidateResume', title: 'Resume', render: (row) => row.candidateResume ? <a href={row.candidateResume} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a> : '' },
        { key: 'meetingLink', title: 'Meeting Link', minWidth: '250px', render: (row) => row.meetingLink ? (<a href={row.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block max-w-[250px]" title={row.meetingLink}>{row.meetingLink}</a>) : '' },
        { key: 'recordingLink', title: 'Recording Link', minWidth: '250px', render: (row) => row.recordingLink ? (<a href={row.recordingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block max-w-[250px]" title={row.recordingLink}>{row.recordingLink}</a>) : '' },
        { key: 'interviewDate', title: 'Date', render: (row) => row.interviewDate ? formatDate(row.interviewDate) : '' },
        { key: 'interviewTime', title: 'Time' },
        { key: 'interviewDuration', title: 'Duration' },
        { key: 'interviewStatus', title: 'Status', minWidth: '150px', render: (row) => { const statusColors = {'Completed': 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200','Scheduled': 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200','InProgress': 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200','Cancelled': 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200' }; return (<select value={row.interviewStatus || ''} onChange={(e) => handleStatusChange(row._id, e.target.value)} disabled={updatingId === row._id} className={`w-full text-xs font-semibold px-2 py-1.5 border rounded-md shadow-sm focus:outline-none focus:ring-1 transition-colors cursor-pointer ${statusColors[row.interviewStatus] || 'bg-gray-100'}`} onClick={(e) => e.stopPropagation()}><option value="" disabled>Select Status</option>{MAIN_SHEET_INTERVIEW_STATUSES.map(status => (<option key={status.value} value={status.value}>{status.label}</option>))}</select>); } },
        { key: 'remarks', title: 'Remarks', minWidth: '200px' },
        { key: 'interviewerName', title: 'Interviewer', minWidth: '180px', render: (row) => (<select value={row.interviewer?._id || ''} onChange={(e) => handleInterviewerChange(row._id, e.target.value)} disabled={updatingId === row._id} className="w-full p-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors" onClick={(e) => e.stopPropagation()}><option value="">Unassigned</option>{interviewerOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}</select>) },
        { key: 'interviewerMail', title: "Interviewer Mail", minWidth: '200px', render: (row) => row.interviewer?.user?.email || '' },
        { key: 'actions', title: 'Actions', minWidth: '60px', render: (row) => (<LocalDropdownMenu options={[{ label: 'Edit', icon: FiEdit, onClick: () => navigate(`/admin/main-sheet/edit/${row._id}`) }, { label: 'Delete', icon: FiTrash2, isDestructive: true, onClick: () => handleDeleteRequest(row) },]}/>)}
    ], [navigate, handleDeleteRequest, handleStatusChange, handleInterviewerChange, updatingId, interviewerOptions, hiringNamesOptions, handleCellSave, domainOptions]);
    
    const mainSheetUploadProps = {
        isOpen: isUploadModalOpen,
        onClose: () => setIsUploadModalOpen(false),
        onUploadConfirm: handleUploadConfirm,
        title: "Import Main Sheet Entries",
        instructions: [
          "This creates new entries. To update, edit directly in the sheet.",
          "Required headers: `candidateName`, `mailId`.",
          "Optional header: `interviewerName` (must match an existing interviewer's full name).",
          "Other fields like `hiringName`, `techStack`, `remarks`, etc., will be imported as provided."
        ],
        requiredHeaders: ['candidateName', 'mailId'],
        isLoading: isUploading,
    };

    return (
        <div className="h-full w-full flex flex-col bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-800">Master Data Sheet</h1>
                <div className="flex items-center gap-2 flex-wrap">
                    <LocalSearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." />
                    <LocalButton variant="outline" icon={FiRefreshCw} onClick={handleRefreshRecordings} isLoading={isRefreshing}>{isRefreshing ? 'Refreshing...' : 'Reload'}</LocalButton>
                    <LocalButton variant="outline" icon={FiDownload} onClick={handleExport}>Export</LocalButton>
                    <LocalButton variant="outline" icon={FiUpload} onClick={() => setIsUploadModalOpen(true)}>Import</LocalButton>
                    <LocalButton variant="primary" icon={FiPlus} onClick={() => navigate('/admin/main-sheet/add')}>Add Entries</LocalButton>
                </div>
            </div>
            <div className="flex-grow overflow-auto">
                <LocalTable columns={columns} data={entries} isLoading={loading} emptyMessage="No entries found in the main sheet." emptyIcon={FiInbox}/>
            </div>
            {pagination && pagination.totalItems > 0 && (
                <div className="p-3 border-t border-gray-200 flex justify-between items-center flex-shrink-0">
                    <p className="text-sm text-gray-600">Showing <span className="font-medium">{(pagination.currentPage - 1) * 20 + 1}</span> to <span className="font-medium">{Math.min(pagination.currentPage * 20, pagination.totalItems)}</span> of <span className="font-medium">{pagination.totalItems}</span> results</p>
                    <div className="flex items-center gap-2">
                        <LocalButton variant="outline" icon={FiChevronLeft} onClick={() => fetchEntries(pagination.currentPage - 1)} disabled={loading || pagination.currentPage <= 1}/>
                        <LocalButton variant="outline" icon={FiChevronRight} onClick={() => fetchEntries(pagination.currentPage + 1)} disabled={loading || pagination.currentPage >= pagination.totalPages}/>
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
        </div>
    );
};

export default MainSheet;
