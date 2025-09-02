// client/src/pages/admin/Interviewers.jsx
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { FiUser, FiFilter, FiSearch, FiEdit, FiTrash2, FiPlus, FiUpload, FiCheckCircle, FiAlertTriangle, FiLoader, FiSend, FiDownload, FiX } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import SearchInput from '../../components/common/SearchInput';
import FilterDropdown from '../../components/common/FilterDropdown';
import Badge from '../../components/common/Badge';
import { getInterviewers, updateInterviewer, bulkUploadInterviewers, bulkDeleteInterviewers, sendWelcomeEmail } from '../../api/admin.api';
import { formatDate } from '../../utils/formatters';
import { INTERVIEWER_STATUS, DOMAINS } from '../../utils/constants';
import { debounce } from '../../utils/helpers';
import { useAlert } from '../../hooks/useAlert';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import InterviewerFormModal from './InterviewerFormModal'; 
import { saveAs } from 'file-saver';

// --- NEW HELPER FUNCTION TO GENERATE THE LOG FILE CONTENT ---
const generateErrorLogText = (failedEntries) => {
    let logContent = `Bulk Import Error Report - ${new Date().toLocaleString()}\n`;
    logContent += `Total Failed Entries: ${failedEntries.length}\n`;
    logContent += "========================================================\n\n";

    failedEntries.forEach(entry => {
        logContent += `ROW ${entry.rowNumber}: FAILED\n`;
        logContent += `  Data: ${JSON.stringify(entry.data)}\n`;
        entry.errors.forEach(error => {
            logContent += `  - ERROR (${error.field}): ${error.message}\n`;
        });
        logContent += "\n--------------------------------------------------------\n\n";
    });

    return logContent;
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
        <div className="relative">
            <input
                type="text"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                onBlur={handleSave}
                disabled={isLoading}
                placeholder="N/A"
                className="w-full text-xs p-2 border border-transparent rounded-md bg-transparent focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
            {isLoading && <FiLoader className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />}
        </div>
    );
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
                    setError("The selected file is empty.");
                    return;
                }
                const headers = Object.keys(data[0]);
                const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

                if (missingHeaders.length > 0) {
                    setError(`File is missing required headers: ${missingHeaders.join(', ')}`);
                    return;
                }
                setParsedData(data);
            } catch (err) {
                showError("Failed to parse file. Please ensure it is a valid CSV or XLSX format.");
                setError("Parsing failed. Check file format.");
            }
        };
        reader.readAsBinaryString(selectedFile);
    };

    const handleConfirm = () => {
        if(parsedData.length > 0) {
            onUploadConfirm(parsedData);
        }
    };
    return isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
            <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b"><h3 className="text-lg font-semibold text-gray-800">{title}</h3></div>
                <div className="p-6 flex-grow overflow-y-auto space-y-4">
                    
                    <div className="flex items-center gap-4">
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv, .xlsx" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                        {error && <p className="text-red-600 text-sm font-semibold">{error}</p>}
                    </div>
                    {parsedData.length > 0 && (
                        <div className="border border-gray-200 rounded-lg max-h-80 overflow-auto">
                            <table className="min-w-full text-xs">
                                <thead className="bg-gray-100 sticky top-0"><tr className="text-left font-semibold text-gray-600">
                                    {Object.keys(parsedData[0]).map(h => <th key={h} className="p-2 border-b whitespace-nowrap">{h}</th>)}
                                </tr></thead>
                                <tbody>
                                    {parsedData.slice(0, 10).map((row, i) => (<tr key={i} className="bg-white border-b">{Object.values(row).map((val, j) => <td key={j} className="p-2 whitespace-nowrap" title={val}>{String(val)}</td>)}</tr>))}
                                </tbody>
                            </table>
                             {parsedData.length > 10 && <div className="p-2 text-center text-sm bg-gray-50">...and {parsedData.length - 10} more rows</div>}
                        </div>
                    )}
                </div>
                <div className="bg-gray-50 p-4 flex justify-between items-center border-t">
                    <p className="text-sm text-gray-600">
                        {parsedData.length > 0 ? `${parsedData.length} records detected and ready for import.` : "Please select a file to preview."}
                    </p>
                    <div>
                        <Button variant="outline" className="mr-2" onClick={onClose}>Cancel</Button>
                        <Button variant="primary" onClick={handleConfirm} isLoading={isLoading} disabled={!file || error || parsedData.length === 0} icon={<FiUpload />}>Upload {parsedData.length > 0 ? parsedData.length : ''} Entries</Button>
                    </div>
                </div>
            </div>
        </div>
    ) : null;
};

const Interviewers = () => {
    const { showSuccess, showError } = useAlert();
    const [loading, setLoading] = useState(true);
    const [interviewers, setInterviewers] = useState([]);
    
    // --- MODIFICATION START: State for filtered and total counts ---
    const [filteredCount, setFilteredCount] = useState(0);
    const [absoluteTotal, setAbsoluteTotal] = useState(0);
    // --- MODIFICATION END ---
    
    const [sortConfig, setSortConfig] = useState({ key: 'onboardingDate', direction: 'desc' });
    const [filters, setFilters] = useState({ search: '', status: '', domain: '', paymentTier: '' });
    
    const [updatingId, setUpdatingId] = useState(null);
    const [sendingEmailId, setSendingEmailId] = useState(null);

    const [modalState, setModalState] = useState({ type: null, data: null });
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, ids: [], isBulk: false });
    
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [selectedRows, setSelectedRows] = useState([]);

    const [uploadErrorLog, setUploadErrorLog] = useState(null);

    // --- MODIFICATION START: Updated fetchInterviewers function ---
    const fetchInterviewers = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                search: filters.search, 
                status: filters.status, 
                domain: filters.domain, 
                paymentTier: filters.paymentTier,
                sortBy: sortConfig.key, 
                sortOrder: sortConfig.direction,
            };
            const response = await getInterviewers(params);
            const resData = response.data.data;
            setInterviewers(resData.interviewers || []);
            setFilteredCount(resData.totalDocs || 0);
            setAbsoluteTotal(resData.absoluteTotal || 0);
        } catch (error) {
            showError('Error fetching interviewers:', error);
        } finally {
            setLoading(false);
        }
    }, [filters, sortConfig, showError]);
    // --- MODIFICATION END ---
    
    const debouncedFetch = useMemo(() => debounce(fetchInterviewers, 300), [fetchInterviewers]);

    useEffect(() => {
        debouncedFetch();
        return () => debouncedFetch.cancel();
    }, [filters, sortConfig, debouncedFetch]);

    useEffect(() => {
        setSelectedRows([]);
    }, [interviewers]);

    const handleFieldSave = async (interviewerId, fieldName, value) => {
        const originalInterviewer = interviewers.find(i => i._id === interviewerId);
        if (originalInterviewer && (originalInterviewer[fieldName] || '') !== value) {
            setUpdatingId(interviewerId);
            try {
                await updateInterviewer(interviewerId, { [fieldName]: value });
                showSuccess(`${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} updated successfully!`);
                setInterviewers(prev => prev.map(i => i._id === interviewerId ? { ...i, [fieldName]: value } : i));
            } catch (err) {
                showError(`Failed to update ${fieldName}.`);
            } finally {
                setUpdatingId(null);
            }
        }
    };
    
    const handleStatusChange = useCallback(async (interviewerId, newStatus) => {
        setUpdatingId(interviewerId);
        try {
            await updateInterviewer(interviewerId, { status: newStatus });
            showSuccess('Status updated successfully!');
            setInterviewers(prev => prev.map(i => i._id === interviewerId ? { ...i, status: newStatus } : i));
        } catch(err) {
            showError('Failed to update status.');
        } finally {
            setUpdatingId(null);
        }
    }, [showError, showSuccess]);

    const handleSendWelcomeEmail = async (interviewerId) => {
        setSendingEmailId(interviewerId);
        try {
            await sendWelcomeEmail(interviewerId);
            showSuccess('Welcome email sent successfully!');
            setInterviewers(prev => 
                prev.map(i => i._id === interviewerId ? { ...i, welcomeEmailSentAt: new Date().toISOString() } : i)
            );
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to send welcome email.');
        } finally {
            setSendingEmailId(null);
        }
    };
    
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSort = (key) => {
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
    };
    
    const handleBulkDelete = async () => {
        if (!deleteDialog.ids || deleteDialog.ids.length === 0) return;
        try {
            await bulkDeleteInterviewers(deleteDialog.ids);
            showSuccess(`${deleteDialog.ids.length} interviewer(s) deleted successfully`);
            setDeleteDialog({ isOpen: false, ids: [], isBulk: false });
            setSelectedRows([]);
            fetchInterviewers();
        } catch(err) {
            showError("Failed to delete interviewers.");
        }
    };
    
    const handleModalSuccess = () => {
        setModalState({ type: null, data: null });
        fetchInterviewers();
    };

    const handleUploadConfirm = async (data) => {
        setIsUploading(true);
        setUploadErrorLog(null); // Clear previous logs
        try {
            const response = await bulkUploadInterviewers(data);
            const { created, failedEntries } = response.data.data;
            
            let finalMessage = `Import finished: ${created} created, ${failedEntries.length} failed.`;
            showSuccess(finalMessage);

            // --- NEW: LOG GENERATION ---
            if (failedEntries && failedEntries.length > 0) {
                const errorLogText = generateErrorLogText(failedEntries);
                setUploadErrorLog(errorLogText);
                showError(`${failedEntries.length} entries failed to import. An error log is available for download.`);
            }
            // --- END: LOG GENERATION ---

            setIsUploadModalOpen(false);
            fetchInterviewers(); // Refresh the list
        } catch(err) {
            showError(err.response?.data?.message || 'Bulk upload failed. Please ensure your data is correct and try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const downloadErrorLog = () => {
        const blob = new Blob([uploadErrorLog], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, `interviewer-import-errors-${new Date().getTime()}.txt`);
    };
    
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedRows(interviewers.map(i => i._id));
        } else {
            setSelectedRows([]);
        }
    };
    
    const handleSelectRow = (id) => {
        setSelectedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id] );
    };

    const columns = useMemo(() => [
        { key: 'select', title: (<input type="checkbox" className="form-checkbox" onChange={handleSelectAll} checked={selectedRows.length === interviewers.length && interviewers.length > 0} />), render: (row) => (<input type="checkbox" className="form-checkbox" checked={selectedRows.includes(row._id)} onChange={() => handleSelectRow(row._id)} />) },
        { key: 'interviewerId', title: 'Interviewer ID', minWidth: '280px', sortable: true, render: (row) => <EditableCell value={row.interviewerId} onSave={handleFieldSave} fieldName="interviewerId" rowId={row._id} isLoading={updatingId === row._id} /> },
        { key: 'payoutId', title: 'Payout ID', minWidth: '280px', sortable: true, render: (row) => <EditableCell value={row.payoutId} onSave={handleFieldSave} fieldName="payoutId" rowId={row._id} isLoading={updatingId === row._id} /> },
        { key: 'user.firstName', title: 'Name', sortable: true, minWidth: '180px', render: (row) => `${row.user.firstName || ''} ${row.user.lastName || ''}` },
        { key: 'user.email', title: 'Email', sortable: true, minWidth: '220px', render: (row) => row.user.email || '' },
        { key: 'sendWelcome', title: 'Send Welcome', minWidth: '140px', render: (row) => (
            row.welcomeEmailSentAt ? (
                <div className="flex items-center text-green-600">
                    <FiCheckCircle className="mr-2"/>
                    Sent
                </div>
            ) : (
                <Button 
                    variant="primary" 
                    className="!text-xs !py-1 !px-3" 
                    onClick={() => handleSendWelcomeEmail(row._id)}
                    isLoading={sendingEmailId === row._id}
                >
                    Send Welcome
                </Button>
            )
        )},
        { key: 'domains', title: 'Domain(s)', minWidth: '200px', render: (row) => (<div className="flex flex-wrap gap-1">{(row.domains && row.domains.length > 0) ? ( row.domains.map((domain, index) => (<Badge key={index} variant="primary" size="sm">{domain}</Badge>))) : (<Badge variant="gray" size="sm">N/A</Badge>)}</div>) },
        { key: 'status', title: 'Status', sortable: true, minWidth: '150px', render: (row) => (<select value={row.status} onChange={(e) => handleStatusChange(row._id, e.target.value)} disabled={updatingId === row._id} className={`w-full text-xs font-semibold px-2 py-1.5 border rounded-md shadow-sm focus:outline-none focus:ring-1 transition-colors cursor-pointer ${ row.status === 'Active' ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' : row.status === 'On Probation' ? 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200' : 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'}`} onClick={(e) => e.stopPropagation()}>{Object.values(INTERVIEWER_STATUS).map(statusValue => (<option key={statusValue} value={statusValue}>{statusValue}</option>))}</select>) },
        { key: 'paymentAmount', title: 'Amount', minWidth: '120px', render: (row) => <EditableCell value={row.paymentAmount} onSave={handleFieldSave} fieldName="paymentAmount" rowId={row._id} isLoading={updatingId === row._id} /> },
        { key: 'metrics.interviewsCompleted', title: 'Interviews', sortable: true, minWidth: '110px', render: (row) => <div className="text-center">{row.metrics?.interviewsCompleted || 0}</div> },
        { key: 'onboardingDate', title: 'Onboarded', sortable: true, minWidth: '120px', render: (row) => formatDate(row.onboardingDate) },
        { key: 'user.phoneNumber', title: 'Phone', minWidth: '150px', render: (row) => row.user.phoneNumber || '' },
        { key: 'user.whatsappNumber', title: 'WhatsApp', minWidth: '150px', render: (row) => row.user.whatsappNumber || '' },
        { key: 'currentEmployer', title: 'Employer', minWidth: '180px', render: (row) => row.currentEmployer || '' },
        { key: 'jobTitle', title: 'Job Title', minWidth: '180px', render: (row) => row.jobTitle || '' },
        { key: 'yearsOfExperience', title: 'Experience', minWidth: '120px', render: (row) => <div className="text-center">{row.yearsOfExperience || 0} yrs</div>, sortable: true },
        { key: 'companyType', title: 'Company Type', minWidth: '150px', render: (row) => row.companyType || '', sortable: true },
        { key: 'bankDetails.accountName', title: 'Account Name', minWidth: '180px', render: (row) => row.bankDetails?.accountName || '' },
        { key: 'bankDetails.bankName', title: 'Bank Name', minWidth: '180px', render: (row) => row.bankDetails?.bankName || '' },
        { key: 'bankDetails.accountNumber', title: 'Account Number', minWidth: '160px', render: (row) => row.bankDetails?.accountNumber || '' },
        { key: 'bankDetails.ifscCode', title: 'IFSC Code', minWidth: '120px', render: (row) => row.bankDetails?.ifscCode || '' },
    ], [interviewers, selectedRows, updatingId, sendingEmailId, handleStatusChange, handleSelectAll, handleSelectRow, handleFieldSave]);
  
    const interviewerUploadProps = {
        isOpen: isUploadModalOpen,
        onClose: () => setIsUploadModalOpen(false),
        onUploadConfirm: handleUploadConfirm,
        title: "Bulk Import Interviewers",
        instructions: [""],
        requiredHeaders: ['firstName', 'email', 'phoneNumber', 'domains', 'temporaryPassword'],
        isLoading: isUploading
    };
  
    return (
        <div className="space-y-6">
            <Card>
                <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <SearchInput value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} onClear={() => handleFilterChange('search', '')} placeholder="Search interviewers..." className="w-full md:w-72" />
                    <div className="flex items-center gap-4 flex-wrap">
                        <FilterDropdown label="Status" options={[{ value: '', label: 'All Statuses' }, ...Object.values(INTERVIEWER_STATUS).map(s => ({ value: s, label: s }))]} selectedValue={filters.status} onChange={(val) => handleFilterChange('status', val)} />
                        <FilterDropdown label="Domain" options={[{ value: '', label: 'All Domains' }, ...DOMAINS.map(d => ({ value: d.value, label: d.label }))]} selectedValue={filters.domain} onChange={(val) => handleFilterChange('domain', val)} />
                        <Button variant="outline" icon={<FiUpload />} onClick={() => setIsUploadModalOpen(true)}>Import</Button>
                        <Button variant="primary" icon={<FiPlus size={20} />} onClick={() => setModalState({ type: 'add', data: null })}>Add</Button>
                    </div>
                </div>

                {uploadErrorLog && (
                    <div className="px-4 py-3 bg-red-50 border-y border-red-200 flex items-center justify-between">
                        <div className="flex items-center">
                            <FiAlertTriangle className="h-5 w-5 text-red-600 mr-3" />
                            <p className="text-sm font-semibold text-red-800">
                                Some records failed to import. Download the log for details.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                           <Button variant="outline" className="!text-sm !py-1 !px-3" icon={<FiDownload size={14}/>} onClick={downloadErrorLog}>
                               Download Log
                           </Button>
                           <button onClick={() => setUploadErrorLog(null)} className="p-1 rounded-full hover:bg-red-100">
                                <FiX className="h-4 w-4 text-red-700" />
                           </button>
                        </div>
                    </div>
                )}

                {selectedRows.length > 0 && (
                    <div className="px-4 py-2 bg-blue-50 border-y border-blue-200 flex items-center justify-between">
                        <span className="text-sm font-semibold text-blue-800">{selectedRows.length} selected</span>
                        <div className="space-x-2">
                            <Button
                                variant="outline"
                                className="!text-sm !py-1 !px-3"
                                icon={<FiEdit size={14}/>}
                                disabled={selectedRows.length !== 1}
                                onClick={() => {
                                    const selectedInterviewer = interviewers.find(i => i._id === selectedRows[0]);
                                    setModalState({ type: 'edit', data: selectedInterviewer });
                                }}
                            >
                                Edit
                            </Button>
                            <Button
                                variant="outline"
                                className="!text-sm !py-1 !px-3 !text-red-600 !border-red-300 hover:!bg-red-50"
                                icon={<FiTrash2 size={14}/>}
                                onClick={() => setDeleteDialog({ isOpen: true, ids: selectedRows, isBulk: true })}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                )}
                
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-600">
                        Showing <span className="font-bold text-gray-800">{filteredCount}</span> of <span className="font-bold text-gray-800">{absoluteTotal}</span> total interviewers.
                    </p>
                </div>
                
                <div className="overflow-x-auto">
                    <Table 
                        columns={columns}
                        data={interviewers}
                        isLoading={loading}
                        sortConfig={sortConfig}
                        onSort={handleSort}
                        emptyMessage="No interviewers found."
                    />
                </div>
            </Card>

            <InterviewerFormModal 
                isOpen={!!modalState.type} 
                onClose={() => setModalState({ type: null, data: null })} 
                onSuccess={handleModalSuccess} 
                interviewerData={modalState.data} 
            />
            
            <ConfirmDialog 
                isOpen={deleteDialog.isOpen} 
                onClose={() => setDeleteDialog({ isOpen: false, ids: [], isBulk: false })} 
                onConfirm={handleBulkDelete} 
                title={`Delete Interviewer(s)`} 
                message={`Are you sure you want to delete these ${deleteDialog.ids.length} interviewer(s)? This will also permanently delete their user accounts.`}
            />

            <UploadModal {...interviewerUploadProps} />
        </div>
    );
};

export default Interviewers;
