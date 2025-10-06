// // client/src/pages/admin/Interviewers.jsx
// import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
// import { FiUser, FiFilter, FiSearch, FiEdit, FiTrash2, FiPlus, FiUpload, FiCheckCircle, FiAlertTriangle, FiLoader, FiSend, FiDownload, FiX } from 'react-icons/fi';
// import * as XLSX from 'xlsx';
// import Card from '../../components/common/Card';
// import Button from '../../components/common/Button';
// import Table from '../../components/common/Table';
// import SearchInput from '../../components/common/SearchInput';
// import FilterDropdown from '../../components/common/FilterDropdown';
// import Badge from '../../components/common/Badge';
// import { getInterviewers, updateInterviewer, bulkUploadInterviewers, bulkDeleteInterviewers, sendWelcomeEmail } from '../../api/admin.api';
// import { formatDate } from '../../utils/formatters';
// import { INTERVIEWER_STATUS, DOMAINS } from '../../utils/constants';
// import { debounce } from '../../utils/helpers';
// import { useAlert } from '../../hooks/useAlert';
// import ConfirmDialog from '../../components/common/ConfirmDialog';
// import InterviewerFormModal from './InterviewerFormModal'; 
// import { saveAs } from 'file-saver';
// import DropdownMenu from '../../components/common/DropdownMenu';

// const generateErrorLogText = (failedEntries) => {
//     let logContent = `Bulk Import Error Report - ${new Date().toLocaleString()}\n`;
//     logContent += `Total Failed Entries: ${failedEntries.length}\n`;
//     logContent += "========================================================\n\n";

//     failedEntries.forEach(entry => {
//         logContent += `ROW ${entry.rowNumber}: FAILED\n`;
//         logContent += `  Data: ${JSON.stringify(entry.data)}\n`;
//         entry.errors.forEach(error => {
//             logContent += `  - ERROR (${error.field}): ${error.message}\n`;
//         });
//         logContent += "\n--------------------------------------------------------\n\n";
//     });

//     return logContent;
// };

// const EditableCell = ({ value, onSave, isLoading, fieldName, rowId }) => {
//     const [currentValue, setCurrentValue] = useState(value || '');

//     useEffect(() => {
//         setCurrentValue(value || '');
//     }, [value]);

//     const handleSave = () => {
//         if (currentValue.trim() !== (value || '').trim()) {
//             onSave(rowId, fieldName, currentValue.trim());
//         }
//     };

//     return (
//         <div className="relative">
//             <input
//                 type="text"
//                 value={currentValue}
//                 onChange={(e) => setCurrentValue(e.target.value)}
//                 onBlur={handleSave}
//                 disabled={isLoading}
//                 placeholder="N/A"
//                 className="w-full text-xs p-2 border border-transparent rounded-md bg-transparent focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
//             />
//             {isLoading && <FiLoader className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />}
//         </div>
//     );
// };

// const UploadModal = ({ isOpen, onClose, onUploadConfirm, title, instructions, requiredHeaders, isLoading }) => {
//     const [file, setFile] = useState(null);
//     const [parsedData, setParsedData] = useState([]);
//     const [error, setError] = useState('');
//     const fileInputRef = useRef(null);
//     const { showError } = useAlert();

//     useEffect(() => {
//         if (!isOpen) {
//             setFile(null);
//             setParsedData([]);
//             setError('');
//             if(fileInputRef.current) fileInputRef.current.value = null;
//         }
//     }, [isOpen]);
    
//     const handleFileChange = (e) => {
//         const selectedFile = e.target.files[0];
//         if (!selectedFile) return;

//         setError('');
//         setFile(selectedFile);
//         const reader = new FileReader();
//         reader.onload = (event) => {
//             try {
//                 const workbook = XLSX.read(event.target.result, { type: 'binary' });
//                 const sheetName = workbook.SheetNames[0];
//                 const sheet = workbook.Sheets[sheetName];
//                 const data = XLSX.utils.sheet_to_json(sheet);

//                 if (data.length === 0) {
//                     setError("The selected file is empty.");
//                     return;
//                 }
//                 const headers = Object.keys(data[0]);
//                 const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

//                 if (missingHeaders.length > 0) {
//                     setError(`File is missing required headers: ${missingHeaders.join(', ')}`);
//                     return;
//                 }
//                 setParsedData(data);
//             } catch (err) {
//                 showError("Failed to parse file. Please ensure it is a valid CSV or XLSX format.");
//                 setError("Parsing failed. Check file format.");
//             }
//         };
//         reader.readAsBinaryString(selectedFile);
//     };

//     const handleConfirm = () => {
//         if(parsedData.length > 0) {
//             onUploadConfirm(parsedData);
//         }
//     };
//     return isOpen ? (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
//             <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
//                 <div className="p-4 border-b"><h3 className="text-lg font-semibold text-gray-800">{title}</h3></div>
//                 <div className="p-6 flex-grow overflow-y-auto space-y-4">
                    
//                     <div className="flex items-center gap-4">
//                         <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv, .xlsx" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
//                         {error && <p className="text-red-600 text-sm font-semibold">{error}</p>}
//                     </div>
//                     {parsedData.length > 0 && (
//                         <div className="border border-gray-200 rounded-lg max-h-80 overflow-auto">
//                             <table className="min-w-full text-xs">
//                                 <thead className="bg-gray-100 sticky top-0"><tr className="text-left font-semibold text-gray-600">
//                                     {Object.keys(parsedData[0]).map(h => <th key={h} className="p-2 border-b whitespace-nowrap">{h}</th>)}
//                                 </tr></thead>
//                                 <tbody>
//                                     {parsedData.slice(0, 10).map((row, i) => (<tr key={i} className="bg-white border-b">{Object.values(row).map((val, j) => <td key={j} className="p-2 whitespace-nowrap" title={val}>{String(val)}</td>)}</tr>))}
//                                 </tbody>
//                             </table>
//                              {parsedData.length > 10 && <div className="p-2 text-center text-sm bg-gray-50">...and {parsedData.length - 10} more rows</div>}
//                         </div>
//                     )}
//                 </div>
//                 <div className="bg-gray-50 p-4 flex justify-between items-center border-t">
//                     <p className="text-sm text-gray-600">
//                         {parsedData.length > 0 ? `${parsedData.length} records detected and ready for import.` : "Please select a file to preview."}
//                     </p>
//                     <div>
//                         <Button variant="outline" className="mr-2" onClick={onClose}>Cancel</Button>
//                         <Button variant="primary" onClick={handleConfirm} isLoading={isLoading} disabled={!file || error || parsedData.length === 0} icon={<FiUpload />}>Upload {parsedData.length > 0 ? parsedData.length : ''} Entries</Button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     ) : null;
// };

// const Interviewers = () => {
//     const { showSuccess, showError } = useAlert();
//     const [loading, setLoading] = useState(true);
//     const [interviewers, setInterviewers] = useState([]);
    
//     const [filteredCount, setFilteredCount] = useState(0);
//     const [absoluteTotal, setAbsoluteTotal] = useState(0);
    
//     const [sortConfig, setSortConfig] = useState({ key: 'onboardingDate', direction: 'desc' });
//     const [filters, setFilters] = useState({ search: '', status: '', domain: '', paymentTier: '' });
    
//     const [updatingId, setUpdatingId] = useState(null);
//     const [sendingEmailId, setSendingEmailId] = useState(null);

//     const [modalState, setModalState] = useState({ type: null, data: null });
//     const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, ids: [], isBulk: false });
    
//     const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
//     const [isUploading, setIsUploading] = useState(false);

//     const [selectedRows, setSelectedRows] = useState([]);

//     const [uploadErrorLog, setUploadErrorLog] = useState(null);

//     const fetchInterviewers = useCallback(async () => {
//         setLoading(true);
//         try {
//             const params = {
//                 search: filters.search, 
//                 status: filters.status, 
//                 domain: filters.domain, 
//                 paymentTier: filters.paymentTier,
//                 sortBy: sortConfig.key, 
//                 sortOrder: sortConfig.direction,
//             };
//             const response = await getInterviewers(params);
//             const resData = response.data.data;
//             setInterviewers(resData.interviewers || []);
//             setFilteredCount(resData.totalDocs || 0);
//             setAbsoluteTotal(resData.absoluteTotal || 0);
//         } catch (error) {
//             showError('Error fetching interviewers:', error);
//         } finally {
//             setLoading(false);
//         }
//     }, [filters, sortConfig, showError]);
    
//     const debouncedFetch = useMemo(() => debounce(fetchInterviewers, 300), [fetchInterviewers]);

//     useEffect(() => {
//         debouncedFetch();
//         return () => debouncedFetch.cancel();
//     }, [filters, sortConfig, debouncedFetch]);

//     useEffect(() => {
//         setSelectedRows([]);
//     }, [interviewers]);

//     const handleFieldSave = async (interviewerId, fieldName, value) => {
//         const originalInterviewer = interviewers.find(i => i._id === interviewerId);
//         if (originalInterviewer && (originalInterviewer[fieldName] || '') !== value) {
//             setUpdatingId(interviewerId);
//             try {
//                 await updateInterviewer(interviewerId, { [fieldName]: value });
//                 showSuccess(`${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} updated successfully!`);
//                 setInterviewers(prev => prev.map(i => i._id === interviewerId ? { ...i, [fieldName]: value } : i));
//             } catch (err) {
//                 showError(`Failed to update ${fieldName}.`);
//             } finally {
//                 setUpdatingId(null);
//             }
//         }
//     };
    
//     const handleStatusChange = useCallback(async (interviewerId, newStatus) => {
//         setUpdatingId(interviewerId);
//         try {
//             await updateInterviewer(interviewerId, { status: newStatus });
//             showSuccess('Status updated successfully!');
//             setInterviewers(prev => prev.map(i => i._id === interviewerId ? { ...i, status: newStatus } : i));
//         } catch(err) {
//             showError('Failed to update status.');
//         } finally {
//             setUpdatingId(null);
//         }
//     }, [showError, showSuccess]);

//     const handleSendWelcomeEmail = async (interviewerId) => {
//         setSendingEmailId(interviewerId);
//         try {
//             await sendWelcomeEmail(interviewerId);
//             showSuccess('Welcome email sent successfully!');
//             setInterviewers(prev => 
//                 prev.map(i => i._id === interviewerId ? { ...i, welcomeEmailSentAt: new Date().toISOString() } : i)
//             );
//         } catch (error) {
//             showError(error.response?.data?.message || 'Failed to send welcome email.');
//         } finally {
//             setSendingEmailId(null);
//         }
//     };
    
//     const handleFilterChange = (key, value) => {
//         setFilters(prev => ({ ...prev, [key]: value }));
//     };

//     const handleSort = (key) => {
//         setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
//     };
    
//     const handleBulkDelete = async () => {
//         if (!deleteDialog.ids || deleteDialog.ids.length === 0) return;
//         try {
//             await bulkDeleteInterviewers(deleteDialog.ids);
//             showSuccess(`${deleteDialog.ids.length} interviewer(s) deleted successfully`);
//             setDeleteDialog({ isOpen: false, ids: [], isBulk: false });
//             setSelectedRows([]);
//             fetchInterviewers();
//         } catch(err) {
//             showError("Failed to delete interviewers.");
//         }
//     };
    
//     const handleModalSuccess = () => {
//         setModalState({ type: null, data: null });
//         fetchInterviewers();
//     };

//     const handleUploadConfirm = async (data) => {
//         setIsUploading(true);
//         setUploadErrorLog(null);
//         try {
//             const response = await bulkUploadInterviewers(data);
//             const { created, failedEntries } = response.data.data;
            
//             let finalMessage = `Import finished: ${created} created, ${failedEntries.length} failed.`;
//             showSuccess(finalMessage);

//             if (failedEntries && failedEntries.length > 0) {
//                 const errorLogText = generateErrorLogText(failedEntries);
//                 setUploadErrorLog(errorLogText);
//                 showError(`${failedEntries.length} entries failed to import. An error log is available for download.`);
//             }

//             setIsUploadModalOpen(false);
//             fetchInterviewers();
//         } catch(err) {
//             showError(err.response?.data?.message || 'Bulk upload failed. Please ensure your data is correct and try again.');
//         } finally {
//             setIsUploading(false);
//         }
//     };

//     const downloadErrorLog = () => {
//         const blob = new Blob([uploadErrorLog], { type: 'text/plain;charset=utf-8' });
//         saveAs(blob, `interviewer-import-errors-${new Date().getTime()}.txt`);
//     };
    
//     const handleSelectAll = (e) => {
//         if (e.target.checked) {
//             setSelectedRows(interviewers.map(i => i._id));
//         } else {
//             setSelectedRows([]);
//         }
//     };
    
//     const handleSelectRow = (id) => {
//         setSelectedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id] );
//     };

//     const columns = useMemo(() => [
//         { key: 'user.firstName', title: 'Name', sortable: true, minWidth: '180px', isSticky: true, render: (row) => `${row.user.firstName || ''} ${row.user.lastName || ''}` },
//         { key: 'select', title: (<input type="checkbox" className="form-checkbox" onChange={handleSelectAll} checked={selectedRows.length === interviewers.length && interviewers.length > 0} />), render: (row) => (<input type="checkbox" className="form-checkbox" checked={selectedRows.includes(row._id)} onChange={() => handleSelectRow(row._id)} />) },
//         { key: 'status', title: 'Status', sortable: true, minWidth: '150px', render: (row) => (<select value={row.status} onChange={(e) => handleStatusChange(row._id, e.target.value)} disabled={updatingId === row._id} className={`w-full text-xs font-semibold px-2 py-1.5 border rounded-md shadow-sm focus:outline-none focus:ring-1 transition-colors cursor-pointer ${ row.status === 'Active' ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' : row.status === 'On Probation' ? 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200' : 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'}`} onClick={(e) => e.stopPropagation()}>{Object.values(INTERVIEWER_STATUS).map(statusValue => (<option key={statusValue} value={statusValue}>{statusValue}</option>))}</select>) },
//         { key: 'domains', title: 'Domain(s)', minWidth: '200px', render: (row) => (<div className="flex flex-wrap gap-1">{(row.domains && row.domains.length > 0) ? ( row.domains.map((domain, index) => (<Badge key={index} variant="primary" size="sm">{domain}</Badge>))) : (<Badge variant="gray" size="sm">N/A</Badge>)}</div>) },
//         { key: 'sendWelcome', title: 'Send Welcome', minWidth: '140px', render: (row) => (
//             row.welcomeEmailSentAt ? (
//                 <div className="flex items-center text-green-600">
//                     <FiCheckCircle className="mr-2"/>
//                     Sent
//                 </div>
//             ) : (
//                 <Button 
//                     variant="primary" 
//                     className="!text-xs !py-1 !px-3" 
//                     onClick={() => handleSendWelcomeEmail(row._id)}
//                     isLoading={sendingEmailId === row._id}
//                 >
//                     Send Welcome
//                 </Button>
//             )
//         )},
//         { key: 'metrics.interviewsCompleted', title: 'Interviews', sortable: true, minWidth: '110px', render: (row) => <div className="text-center">{row.metrics?.interviewsCompleted || 0}</div> },
//         { key: 'onboardingDate', title: 'Onboarded', sortable: true, minWidth: '120px', render: (row) => formatDate(row.onboardingDate) },
//         { key: 'paymentAmount', title: 'Amount', minWidth: '120px', render: (row) => <EditableCell value={row.paymentAmount} onSave={handleFieldSave} fieldName="paymentAmount" rowId={row._id} isLoading={updatingId === row._id} /> },
//         { key: 'interviewerId', title: 'Interviewer ID', minWidth: '280px', sortable: true, render: (row) => <EditableCell value={row.interviewerId} onSave={handleFieldSave} fieldName="interviewerId" rowId={row._id} isLoading={updatingId === row._id} /> },
//         { key: 'payoutId', title: 'Payout ID', minWidth: '280px', sortable: true, render: (row) => <EditableCell value={row.payoutId} onSave={handleFieldSave} fieldName="payoutId" rowId={row._id} isLoading={updatingId === row._id} /> },
//         { key: 'user.email', title: 'Email', sortable: true, minWidth: '220px', render: (row) => row.user.email || '' },
//         { key: 'user.phoneNumber', title: 'Phone', minWidth: '150px', render: (row) => row.user.phoneNumber || '' },
//         { key: 'user.whatsappNumber', title: 'WhatsApp', minWidth: '150px', render: (row) => row.user.whatsappNumber || '' },
//         { key: 'currentEmployer', title: 'Employer', minWidth: '180px', render: (row) => row.currentEmployer || '' },
//         { key: 'jobTitle', title: 'Job Title', minWidth: '180px', render: (row) => row.jobTitle || '' },
//         { key: 'yearsOfExperience', title: 'Experience', minWidth: '120px', render: (row) => <div className="text-center">{row.yearsOfExperience || 0} yrs</div>, sortable: true },
//         { key: 'companyType', title: 'Company Type', minWidth: '150px', render: (row) => row.companyType || '', sortable: true },
//         { key: 'bankDetails.accountName', title: 'Account Name', minWidth: '180px', render: (row) => row.bankDetails?.accountName || '' },
//         { key: 'bankDetails.bankName', title: 'Bank Name', minWidth: '180px', render: (row) => row.bankDetails?.bankName || '' },
//         { key: 'bankDetails.accountNumber', title: 'Account Number', minWidth: '160px', render: (row) => row.bankDetails?.accountNumber || '' },
//         { key: 'bankDetails.ifscCode', title: 'IFSC Code', minWidth: '120px', render: (row) => row.bankDetails?.ifscCode || '' },
//         { key: 'actions', title: 'Actions', minWidth: '80px', render: (row) => (
//             <DropdownMenu 
//                 options={[
//                     { 
//                         label: 'Edit User', 
//                         icon: FiEdit, 
//                         onClick: () => setModalState({ type: 'edit', data: row }) 
//                     },
//                     { 
//                         label: 'Delete User', 
//                         icon: FiTrash2, 
//                         isDestructive: true, 
//                         onClick: () => setDeleteDialog({ isOpen: true, ids: [row._id], isBulk: false }) 
//                     },
//                 ]} 
//             />
//         ) },
//     ], [interviewers, selectedRows, updatingId, sendingEmailId, handleStatusChange, handleSelectAll, handleSelectRow, handleFieldSave]);
  
//     const interviewerUploadProps = {
//         isOpen: isUploadModalOpen,
//         onClose: () => setIsUploadModalOpen(false),
//         onUploadConfirm: handleUploadConfirm,
//         title: "Bulk Import Interviewers",
//         instructions: [""],
//         requiredHeaders: ['firstName', 'email', 'phoneNumber', 'domains', 'temporaryPassword'],
//         isLoading: isUploading
//     };
  
//     return (
//         <div className="space-y-6">
//             <Card>
//                 <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
//                     <SearchInput value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} onClear={() => handleFilterChange('search', '')} placeholder="Search interviewers..." className="w-full md:w-72" />
//                     <div className="flex items-center gap-4 flex-wrap">
//                         <FilterDropdown label="Status" options={[{ value: '', label: 'All Statuses' }, ...Object.values(INTERVIEWER_STATUS).map(s => ({ value: s, label: s }))]} selectedValue={filters.status} onChange={(val) => handleFilterChange('status', val)} />
//                         <FilterDropdown label="Domain" options={[{ value: '', label: 'All Domains' }, ...DOMAINS.map(d => ({ value: d.value, label: d.label }))]} selectedValue={filters.domain} onChange={(val) => handleFilterChange('domain', val)} />
//                         <Button variant="outline" icon={<FiUpload />} onClick={() => setIsUploadModalOpen(true)}>Import</Button>
//                         <Button variant="primary" icon={<FiPlus size={20} />} onClick={() => setModalState({ type: 'add', data: null })}>Add</Button>
//                     </div>
//                 </div>

//                 {uploadErrorLog && (
//                     <div className="px-4 py-3 bg-red-50 border-y border-red-200 flex items-center justify-between">
//                         <div className="flex items-center">
//                             <FiAlertTriangle className="h-5 w-5 text-red-600 mr-3" />
//                             <p className="text-sm font-semibold text-red-800">
//                                 Some records failed to import. Download the log for details.
//                             </p>
//                         </div>
//                         <div className="flex items-center gap-2">
//                            <Button variant="outline" className="!text-sm !py-1 !px-3" icon={<FiDownload size={14}/>} onClick={downloadErrorLog}>
//                                Download Log
//                            </Button>
//                            <button onClick={() => setUploadErrorLog(null)} className="p-1 rounded-full hover:bg-red-100">
//                                 <FiX className="h-4 w-4 text-red-700" />
//                            </button>
//                         </div>
//                     </div>
//                 )}

//                 {selectedRows.length > 0 && (
//                     <div className="px-4 py-2 bg-blue-50 border-y border-blue-200 flex items-center justify-between">
//                         <span className="text-sm font-semibold text-blue-800">{selectedRows.length} selected</span>
//                         <div className="space-x-2">
//                             <Button
//                                 variant="outline"
//                                 className="!text-sm !py-1 !px-3"
//                                 icon={<FiEdit size={14}/>}
//                                 disabled={selectedRows.length !== 1}
//                                 onClick={() => {
//                                     const selectedInterviewer = interviewers.find(i => i._id === selectedRows[0]);
//                                     setModalState({ type: 'edit', data: selectedInterviewer });
//                                 }}
//                             >
//                                 Edit
//                             </Button>
//                             <Button
//                                 variant="outline"
//                                 className="!text-sm !py-1 !px-3 !text-red-600 !border-red-300 hover:!bg-red-50"
//                                 icon={<FiTrash2 size={14}/>}
//                                 onClick={() => setDeleteDialog({ isOpen: true, ids: selectedRows, isBulk: true })}
//                             >
//                                 Delete
//                             </Button>
//                         </div>
//                     </div>
//                 )}
                
//                 <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
//                     <p className="text-sm font-medium text-gray-600">
//                         Showing <span className="font-bold text-gray-800">{filteredCount}</span> of <span className="font-bold text-gray-800">{absoluteTotal}</span> total interviewers.
//                     </p>
//                 </div>
                
//                 <div className="overflow-x-auto">
//                     <Table 
//                         columns={columns}
//                         data={interviewers}
//                         isLoading={loading}
//                         sortConfig={sortConfig}
//                         onSort={handleSort}
//                         emptyMessage="No interviewers found."
//                     />
//                 </div>
//             </Card>

//             <InterviewerFormModal 
//                 isOpen={!!modalState.type} 
//                 onClose={() => setModalState({ type: null, data: null })} 
//                 onSuccess={handleModalSuccess} 
//                 interviewerData={modalState.data} 
//             />
            
//             <ConfirmDialog 
//                 isOpen={deleteDialog.isOpen} 
//                 onClose={() => setDeleteDialog({ isOpen: false, ids: [], isBulk: false })} 
//                 onConfirm={handleBulkDelete} 
//                 title={`Delete Interviewer(s)`} 
//                 message={`Are you sure you want to delete these ${deleteDialog.ids.length} interviewer(s)? This will also permanently delete their user accounts.`}
//             />

//             <UploadModal {...interviewerUploadProps} />
//         </div>
//     );
// };

// export default Interviewers;




// // client/src/pages/admin/Interviewers.jsx
// import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
// import { FiUser, FiFilter, FiSearch, FiEdit, FiTrash2, FiPlus, FiUpload, FiCheckCircle, FiAlertTriangle, FiLoader, FiSend, FiDownload, FiX, FiRefreshCw } from 'react-icons/fi';
// import * as XLSX from 'xlsx';
// import Card from '../../components/common/Card';
// import Button from '../../components/common/Button';
// import Table from '../../components/common/Table';
// import SearchInput from '../../components/common/SearchInput';
// import FilterDropdown from '../../components/common/FilterDropdown';
// import Badge from '../../components/common/Badge';
// import { getInterviewers, updateInterviewer, bulkUploadInterviewers, bulkDeleteInterviewers, sendWelcomeEmail } from '../../api/admin.api';
// import { formatDate, formatDateTime } from '../../utils/formatters';
// import { INTERVIEWER_STATUS, DOMAINS } from '../../utils/constants';
// import { debounce } from '../../utils/helpers';
// import { useAlert } from '../../hooks/useAlert';
// import ConfirmDialog from '../../components/common/ConfirmDialog';
// import InterviewerFormModal from './InterviewerFormModal'; 
// import { saveAs } from 'file-saver';
// import DropdownMenu from '../../components/common/DropdownMenu';

// const generateErrorLogText = (failedEntries) => {
//     let logContent = `Bulk Import Error Report - ${new Date().toLocaleString()}\n`;
//     logContent += `Total Failed Entries: ${failedEntries.length}\n`;
//     logContent += "========================================================\n\n";

//     failedEntries.forEach(entry => {
//         logContent += `ROW ${entry.rowNumber}: FAILED\n`;
//         logContent += `  Data: ${JSON.stringify(entry.data)}\n`;
//         entry.errors.forEach(error => {
//             logContent += `  - ERROR (${error.field}): ${error.message}\n`;
//         });
//         logContent += "\n--------------------------------------------------------\n\n";
//     });

//     return logContent;
// };

// const EditableCell = ({ value, onSave, isLoading, fieldName, rowId }) => {
//     const [currentValue, setCurrentValue] = useState(value || '');

//     useEffect(() => {
//         setCurrentValue(value || '');
//     }, [value]);

//     const handleSave = () => {
//         if (currentValue.trim() !== (value || '').trim()) {
//             onSave(rowId, fieldName, currentValue.trim());
//         }
//     };

//     return (
//         <div className="relative">
//             <input
//                 type="text"
//                 value={currentValue}
//                 onChange={(e) => setCurrentValue(e.target.value)}
//                 onBlur={handleSave}
//                 disabled={isLoading}
//                 placeholder="N/A"
//                 className="w-full text-xs p-2 border border-transparent rounded-md bg-transparent focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
//             />
//             {isLoading && <FiLoader className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />}
//         </div>
//     );
// };

// const UploadModal = ({ isOpen, onClose, onUploadConfirm, title, instructions, requiredHeaders, isLoading }) => {
//     const [file, setFile] = useState(null);
//     const [parsedData, setParsedData] = useState([]);
//     const [error, setError] = useState('');
//     const fileInputRef = useRef(null);
//     const { showError } = useAlert();

//     useEffect(() => {
//         if (!isOpen) {
//             setFile(null);
//             setParsedData([]);
//             setError('');
//             if(fileInputRef.current) fileInputRef.current.value = null;
//         }
//     }, [isOpen]);
    
//     const handleFileChange = (e) => {
//         const selectedFile = e.target.files[0];
//         if (!selectedFile) return;

//         setError('');
//         setFile(selectedFile);
//         const reader = new FileReader();
//         reader.onload = (event) => {
//             try {
//                 const workbook = XLSX.read(event.target.result, { type: 'binary' });
//                 const sheetName = workbook.SheetNames[0];
//                 const sheet = workbook.Sheets[sheetName];
//                 const data = XLSX.utils.sheet_to_json(sheet);

//                 if (data.length === 0) {
//                     setError("The selected file is empty.");
//                     return;
//                 }
//                 const headers = Object.keys(data[0]);
//                 const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

//                 if (missingHeaders.length > 0) {
//                     setError(`File is missing required headers: ${missingHeaders.join(', ')}`);
//                     return;
//                 }
//                 setParsedData(data);
//             } catch (err) {
//                 showError("Failed to parse file. Please ensure it is a valid CSV or XLSX format.");
//                 setError("Parsing failed. Check file format.");
//             }
//         };
//         reader.readAsBinaryString(selectedFile);
//     };

//     const handleConfirm = () => {
//         if(parsedData.length > 0) {
//             onUploadConfirm(parsedData);
//         }
//     };
//     return isOpen ? (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
//             <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
//                 <div className="p-4 border-b"><h3 className="text-lg font-semibold text-gray-800">{title}</h3></div>
//                 <div className="p-6 flex-grow overflow-y-auto space-y-4">
                    
//                     <div className="flex items-center gap-4">
//                         <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv, .xlsx" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
//                         {error && <p className="text-red-600 text-sm font-semibold">{error}</p>}
//                     </div>
//                     {parsedData.length > 0 && (
//                         <div className="border border-gray-200 rounded-lg max-h-80 overflow-auto">
//                             <table className="min-w-full text-xs">
//                                 <thead className="bg-gray-100 sticky top-0"><tr className="text-left font-semibold text-gray-600">
//                                     {Object.keys(parsedData[0]).map(h => <th key={h} className="p-2 border-b whitespace-nowrap">{h}</th>)}
//                                 </tr></thead>
//                                 <tbody>
//                                     {parsedData.slice(0, 10).map((row, i) => (<tr key={i} className="bg-white border-b">{Object.values(row).map((val, j) => <td key={j} className="p-2 whitespace-nowrap" title={val}>{String(val)}</td>)}</tr>))}
//                                 </tbody>
//                             </table>
//                              {parsedData.length > 10 && <div className="p-2 text-center text-sm bg-gray-50">...and {parsedData.length - 10} more rows</div>}
//                         </div>
//                     )}
//                 </div>
//                 <div className="bg-gray-50 p-4 flex justify-between items-center border-t">
//                     <p className="text-sm text-gray-600">
//                         {parsedData.length > 0 ? `${parsedData.length} records detected and ready for import.` : "Please select a file to preview."}
//                     </p>
//                     <div>
//                         <Button variant="outline" className="mr-2" onClick={onClose}>Cancel</Button>
//                         <Button variant="primary" onClick={handleConfirm} isLoading={isLoading} disabled={!file || error || parsedData.length === 0} icon={<FiUpload />}>Upload {parsedData.length > 0 ? parsedData.length : ''} Entries</Button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     ) : null;
// };

// const Interviewers = () => {
//     const { showSuccess, showError } = useAlert();
//     const [loading, setLoading] = useState(true);
//     const [interviewers, setInterviewers] = useState([]);
    
//     const [filteredCount, setFilteredCount] = useState(0);
//     const [absoluteTotal, setAbsoluteTotal] = useState(0);
    
//     const [sortConfig, setSortConfig] = useState({ key: 'onboardingDate', direction: 'desc' });
//     const [filters, setFilters] = useState({ search: '', status: '', domain: '', paymentTier: '' });
    
//     const [updatingId, setUpdatingId] = useState(null);
//     const [sendingEmailId, setSendingEmailId] = useState(null);

//     const [modalState, setModalState] = useState({ type: null, data: null });
//     const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, ids: [], isBulk: false });
    
//     const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
//     const [isUploading, setIsUploading] = useState(false);

//     const [selectedRows, setSelectedRows] = useState([]);

//     const [uploadErrorLog, setUploadErrorLog] = useState(null);

//     const fetchInterviewers = useCallback(async () => {
//         setLoading(true);
//         try {
//             const params = {
//                 search: filters.search, 
//                 status: filters.status, 
//                 domain: filters.domain, 
//                 paymentTier: filters.paymentTier,
//                 sortBy: sortConfig.key, 
//                 sortOrder: sortConfig.direction,
//             };
//             const response = await getInterviewers(params);
//             const resData = response.data.data;
//             setInterviewers(resData.interviewers || []);
//             setFilteredCount(resData.totalDocs || 0);
//             setAbsoluteTotal(resData.absoluteTotal || 0);
//         } catch (error) {
//             showError('Error fetching interviewers:', error);
//         } finally {
//             setLoading(false);
//         }
//     }, [filters, sortConfig, showError]);
    
//     const debouncedFetch = useMemo(() => debounce(fetchInterviewers, 300), [fetchInterviewers]);

//     useEffect(() => {
//         debouncedFetch();
//         return () => debouncedFetch.cancel();
//     }, [filters, sortConfig, debouncedFetch]);

//     useEffect(() => {
//         setSelectedRows([]);
//     }, [interviewers]);

//     const handleFieldSave = async (interviewerId, fieldName, value) => {
//         const originalInterviewer = interviewers.find(i => i._id === interviewerId);
//         if (originalInterviewer && (originalInterviewer[fieldName] || '') !== value) {
//             setUpdatingId(interviewerId);
//             try {
//                 await updateInterviewer(interviewerId, { [fieldName]: value });
//                 showSuccess(`${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} updated successfully!`);
//                 setInterviewers(prev => prev.map(i => i._id === interviewerId ? { ...i, [fieldName]: value } : i));
//             } catch (err) {
//                 showError(`Failed to update ${fieldName}.`);
//             } finally {
//                 setUpdatingId(null);
//             }
//         }
//     };
    
//     const handleStatusChange = useCallback(async (interviewerId, newStatus) => {
//         setUpdatingId(interviewerId);
//         try {
//             await updateInterviewer(interviewerId, { status: newStatus });
//             showSuccess('Status updated successfully!');
//             setInterviewers(prev => prev.map(i => i._id === interviewerId ? { ...i, status: newStatus } : i));
//         } catch(err) {
//             showError('Failed to update status.');
//         } finally {
//             setUpdatingId(null);
//         }
//     }, [showError, showSuccess]);

//     const handleSendWelcomeEmail = useCallback(async (interviewerId) => {
//         setSendingEmailId(interviewerId);
//         try {
//             await sendWelcomeEmail(interviewerId);
//             showSuccess('Welcome email sent successfully!');
//             setInterviewers(prev => 
//                 prev.map(i => i._id === interviewerId ? { ...i, welcomeEmailSentAt: new Date().toISOString() } : i)
//             );
//         } catch (error) {
//             showError(error.response?.data?.message || 'Failed to send welcome email.');
//         } finally {
//             setSendingEmailId(null);
//         }
//     }, [showSuccess, showError]);
    
//     const handleFilterChange = (key, value) => {
//         setFilters(prev => ({ ...prev, [key]: value }));
//     };

//     const handleSort = (key) => {
//         setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
//     };
    
//     const handleBulkDelete = async () => {
//         if (!deleteDialog.ids || deleteDialog.ids.length === 0) return;
//         try {
//             await bulkDeleteInterviewers(deleteDialog.ids);
//             showSuccess(`${deleteDialog.ids.length} interviewer(s) deleted successfully`);
//             setDeleteDialog({ isOpen: false, ids: [], isBulk: false });
//             setSelectedRows([]);
//             fetchInterviewers();
//         } catch(err) {
//             showError("Failed to delete interviewers.");
//         }
//     };
    
//     const handleModalSuccess = () => {
//         setModalState({ type: null, data: null });
//         fetchInterviewers();
//     };

//     const handleUploadConfirm = async (data) => {
//         setIsUploading(true);
//         setUploadErrorLog(null);
//         try {
//             const response = await bulkUploadInterviewers(data);
//             const { created, failedEntries } = response.data.data;
            
//             let finalMessage = `Import finished: ${created} created, ${failedEntries.length} failed.`;
//             showSuccess(finalMessage);

//             if (failedEntries && failedEntries.length > 0) {
//                 const errorLogText = generateErrorLogText(failedEntries);
//                 setUploadErrorLog(errorLogText);
//                 showError(`${failedEntries.length} entries failed to import. An error log is available for download.`);
//             }

//             setIsUploadModalOpen(false);
//             fetchInterviewers();
//         } catch(err) {
//             showError(err.response?.data?.message || 'Bulk upload failed. Please ensure your data is correct and try again.');
//         } finally {
//             setIsUploading(false);
//         }
//     };

//     const downloadErrorLog = () => {
//         const blob = new Blob([uploadErrorLog], { type: 'text/plain;charset=utf-8' });
//         saveAs(blob, `interviewer-import-errors-${new Date().getTime()}.txt`);
//     };
    
//     const handleSelectAll = (e) => {
//         if (e.target.checked) {
//             setSelectedRows(interviewers.map(i => i._id));
//         } else {
//             setSelectedRows([]);
//         }
//     };
    
//     const handleSelectRow = (id) => {
//         setSelectedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id] );
//     };

//     const columns = useMemo(() => [
//         { key: 'user.firstName', title: 'Name', sortable: true, minWidth: '180px', isSticky: true, render: (row) => `${row.user.firstName || ''} ${row.user.lastName || ''}` },
//         { key: 'select', title: (<input type="checkbox" className="form-checkbox" onChange={handleSelectAll} checked={selectedRows.length === interviewers.length && interviewers.length > 0} />), render: (row) => (<input type="checkbox" className="form-checkbox" checked={selectedRows.includes(row._id)} onChange={() => handleSelectRow(row._id)} />) },
//         { key: 'status', title: 'Status', sortable: true, minWidth: '150px', render: (row) => (<select value={row.status} onChange={(e) => handleStatusChange(row._id, e.target.value)} disabled={updatingId === row._id} className={`w-full text-xs font-semibold px-2 py-1.5 border rounded-md shadow-sm focus:outline-none focus:ring-1 transition-colors cursor-pointer ${ row.status === 'Active' ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' : row.status === 'On Probation' ? 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200' : 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'}`} onClick={(e) => e.stopPropagation()}>{Object.values(INTERVIEWER_STATUS).map(statusValue => (<option key={statusValue} value={statusValue}>{statusValue}</option>))}</select>) },
//         { key: 'domains', title: 'Domain(s)', minWidth: '200px', render: (row) => (<div className="flex flex-wrap gap-1">{(row.domains && row.domains.length > 0) ? ( row.domains.map((domain, index) => (<Badge key={index} variant="primary" size="sm">{domain}</Badge>))) : (<Badge variant="gray" size="sm">N/A</Badge>)}</div>) },
//         {
//             key: 'sendWelcome',
//             title: 'Welcome Mail',
//             minWidth: '140px',
//             render: (row) => {
//                 const isSending = sendingEmailId === row._id;
                
//                 if (isSending) {
//                     return (
//                         <div className="flex items-center justify-center text-gray-500">
//                             <FiLoader className="animate-spin h-5 w-5" />
//                         </div>
//                     );
//                 }

//                 if (row.welcomeEmailSentAt) {
//                     return (
//                         <div className="flex items-center justify-center space-x-2">
//                             <FiCheckCircle className="text-green-500" size={20} title={`Sent on ${formatDateTime(row.welcomeEmailSentAt)}`} />
//                             <button
//                                 onClick={() => handleSendWelcomeEmail(row._id)}
//                                 className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
//                                 title="Resend welcome email"
//                             >
//                                 <FiRefreshCw size={16} />
//                             </button>
//                         </div>
//                     );
//                 } else {
//                     return (
//                          <div className="flex items-center justify-center">
//                             <button
//                                 onClick={() => handleSendWelcomeEmail(row._id)}
//                                 className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
//                                 title="Send welcome email"
//                             >
//                                 <FiSend size={18} />
//                             </button>
//                         </div>
//                     );
//                 }
//             }
//         },
//         { key: 'metrics.interviewsCompleted', title: 'Interviews', sortable: true, minWidth: '110px', render: (row) => <div className="text-center">{row.metrics?.interviewsCompleted || 0}</div> },
//         { key: 'onboardingDate', title: 'Onboarded', sortable: true, minWidth: '120px', render: (row) => formatDate(row.onboardingDate) },
//         { key: 'paymentAmount', title: 'Amount', minWidth: '120px', render: (row) => <EditableCell value={row.paymentAmount} onSave={handleFieldSave} fieldName="paymentAmount" rowId={row._id} isLoading={updatingId === row._id} /> },
//         { key: 'interviewerId', title: 'Interviewer ID', minWidth: '280px', sortable: true, render: (row) => <EditableCell value={row.interviewerId} onSave={handleFieldSave} fieldName="interviewerId" rowId={row._id} isLoading={updatingId === row._id} /> },
//         { key: 'payoutId', title: 'Payout ID', minWidth: '280px', sortable: true, render: (row) => <EditableCell value={row.payoutId} onSave={handleFieldSave} fieldName="payoutId" rowId={row._id} isLoading={updatingId === row._id} /> },
//         { key: 'user.email', title: 'Email', sortable: true, minWidth: '220px', render: (row) => row.user.email || '' },
//         { key: 'user.phoneNumber', title: 'Phone', minWidth: '150px', render: (row) => row.user.phoneNumber || '' },
//         { key: 'user.whatsappNumber', title: 'WhatsApp', minWidth: '150px', render: (row) => row.user.whatsappNumber || '' },
//         { key: 'currentEmployer', title: 'Employer', minWidth: '180px', render: (row) => row.currentEmployer || '' },
//         { key: 'jobTitle', title: 'Job Title', minWidth: '180px', render: (row) => row.jobTitle || '' },
//         { key: 'yearsOfExperience', title: 'Experience', minWidth: '120px', render: (row) => <div className="text-center">{row.yearsOfExperience || 0} yrs</div>, sortable: true },
//         { key: 'companyType', title: 'Company Type', minWidth: '150px', render: (row) => row.companyType || '', sortable: true },
//         { key: 'bankDetails.accountName', title: 'Account Name', minWidth: '180px', render: (row) => row.bankDetails?.accountName || '' },
//         { key: 'bankDetails.bankName', title: 'Bank Name', minWidth: '180px', render: (row) => row.bankDetails?.bankName || '' },
//         { key: 'bankDetails.accountNumber', title: 'Account Number', minWidth: '160px', render: (row) => row.bankDetails?.accountNumber || '' },
//         { key: 'bankDetails.ifscCode', title: 'IFSC Code', minWidth: '120px', render: (row) => row.bankDetails?.ifscCode || '' },
//         { key: 'actions', title: 'Actions', minWidth: '80px', render: (row) => (
//             <DropdownMenu 
//                 options={[
//                     { 
//                         label: 'Edit User', 
//                         icon: FiEdit, 
//                         onClick: () => setModalState({ type: 'edit', data: row }) 
//                     },
//                     { 
//                         label: 'Delete User', 
//                         icon: FiTrash2, 
//                         isDestructive: true, 
//                         onClick: () => setDeleteDialog({ isOpen: true, ids: [row._id], isBulk: false }) 
//                     },
//                 ]} 
//             />
//         ) },
//     ], [interviewers, selectedRows, updatingId, sendingEmailId, handleStatusChange, handleSelectAll, handleSelectRow, handleFieldSave, handleSendWelcomeEmail]);
  
//     const interviewerUploadProps = {
//         isOpen: isUploadModalOpen,
//         onClose: () => setIsUploadModalOpen(false),
//         onUploadConfirm: handleUploadConfirm,
//         title: "Bulk Import Interviewers",
//         instructions: [""],
//         requiredHeaders: ['firstName', 'email', 'phoneNumber', 'domains', 'temporaryPassword'],
//         isLoading: isUploading
//     };
  
//     return (
//         <div className="space-y-6">
//             <Card>
//                 <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
//                     <SearchInput value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} onClear={() => handleFilterChange('search', '')} placeholder="Search interviewers..." className="w-full md:w-72" />
//                     <div className="flex items-center gap-4 flex-wrap">
//                         <FilterDropdown label="Status" options={[{ value: '', label: 'All Statuses' }, ...Object.values(INTERVIEWER_STATUS).map(s => ({ value: s, label: s }))]} selectedValue={filters.status} onChange={(val) => handleFilterChange('status', val)} />
//                         <FilterDropdown label="Domain" options={[{ value: '', label: 'All Domains' }, ...DOMAINS.map(d => ({ value: d.value, label: d.label }))]} selectedValue={filters.domain} onChange={(val) => handleFilterChange('domain', val)} />
//                         <Button variant="outline" icon={<FiUpload />} onClick={() => setIsUploadModalOpen(true)}>Import</Button>
//                         <Button variant="primary" icon={<FiPlus size={20} />} onClick={() => setModalState({ type: 'add', data: null })}>Add</Button>
//                     </div>
//                 </div>

//                 {uploadErrorLog && (
//                     <div className="px-4 py-3 bg-red-50 border-y border-red-200 flex items-center justify-between">
//                         <div className="flex items-center">
//                             <FiAlertTriangle className="h-5 w-5 text-red-600 mr-3" />
//                             <p className="text-sm font-semibold text-red-800">
//                                 Some records failed to import. Download the log for details.
//                             </p>
//                         </div>
//                         <div className="flex items-center gap-2">
//                            <Button variant="outline" className="!text-sm !py-1 !px-3" icon={<FiDownload size={14}/>} onClick={downloadErrorLog}>
//                                Download Log
//                            </Button>
//                            <button onClick={() => setUploadErrorLog(null)} className="p-1 rounded-full hover:bg-red-100">
//                                 <FiX className="h-4 w-4 text-red-700" />
//                            </button>
//                         </div>
//                     </div>
//                 )}

//                 {selectedRows.length > 0 && (
//                     <div className="px-4 py-2 bg-blue-50 border-y border-blue-200 flex items-center justify-between">
//                         <span className="text-sm font-semibold text-blue-800">{selectedRows.length} selected</span>
//                         <div className="space-x-2">
//                             <Button
//                                 variant="outline"
//                                 className="!text-sm !py-1 !px-3"
//                                 icon={<FiEdit size={14}/>}
//                                 disabled={selectedRows.length !== 1}
//                                 onClick={() => {
//                                     const selectedInterviewer = interviewers.find(i => i._id === selectedRows[0]);
//                                     setModalState({ type: 'edit', data: selectedInterviewer });
//                                 }}
//                             >
//                                 Edit
//                             </Button>
//                             <Button
//                                 variant="outline"
//                                 className="!text-sm !py-1 !px-3 !text-red-600 !border-red-300 hover:!bg-red-50"
//                                 icon={<FiTrash2 size={14}/>}
//                                 onClick={() => setDeleteDialog({ isOpen: true, ids: selectedRows, isBulk: true })}
//                             >
//                                 Delete
//                             </Button>
//                         </div>
//                     </div>
//                 )}
                
//                 <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
//                     <p className="text-sm font-medium text-gray-600">
//                         Showing <span className="font-bold text-gray-800">{filteredCount}</span> of <span className="font-bold text-gray-800">{absoluteTotal}</span> total interviewers.
//                     </p>
//                 </div>
                
//                 <div className="overflow-x-auto">
//                     <Table 
//                         columns={columns}
//                         data={interviewers}
//                         isLoading={loading}
//                         sortConfig={sortConfig}
//                         onSort={handleSort}
//                         emptyMessage="No interviewers found."
//                     />
//                 </div>
//             </Card>

//             <InterviewerFormModal 
//                 isOpen={!!modalState.type} 
//                 onClose={() => setModalState({ type: null, data: null })} 
//                 onSuccess={handleModalSuccess} 
//                 interviewerData={modalState.data} 
//             />
            
//             <ConfirmDialog 
//                 isOpen={deleteDialog.isOpen} 
//                 onClose={() => setDeleteDialog({ isOpen: false, ids: [], isBulk: false })} 
//                 onConfirm={handleBulkDelete} 
//                 title={`Delete Interviewer(s)`} 
//                 message={`Are you sure you want to delete these ${deleteDialog.ids.length} interviewer(s)? This will also permanently delete their user accounts.`}
//             />

//             <UploadModal {...interviewerUploadProps} />
//         </div>
//     );
// };

// export default Interviewers;


// client/src/pages/admin/Interviewers.jsx
import React, { useEffect, useState, useMemo, useCallback, useRef, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FiUser, FiFilter, FiSearch, FiEdit, FiTrash2, FiPlus, FiUpload, FiCheckCircle, FiAlertTriangle, FiLoader, FiSend, FiDownload, FiX, FiRefreshCw, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import { Menu, Transition, Portal } from '@headlessui/react';
import { useFloating, flip, shift, offset, autoUpdate } from '@floating-ui/react';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import SearchInput from '../../components/common/SearchInput';
import FilterDropdown from '../../components/common/FilterDropdown';
import Badge from '../../components/common/Badge';
import { getInterviewers, updateInterviewer, bulkUploadInterviewers, bulkDeleteInterviewers, sendWelcomeEmail, sendProbationEmail, markProbationAsSent } from '../../api/admin.api';
import { formatDateTime } from '../../utils/formatters';
import { INTERVIEWER_STATUS, DOMAINS } from '../../utils/constants';
import { debounce } from '../../utils/helpers';
import { useAlert } from '../../hooks/useAlert';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import InterviewerFormModal from './InterviewerFormModal';
import DropdownMenu from '../../components/common/DropdownMenu';

// Self-contained Button for advanced pagination
const LocalButton = ({ children, onClick, type = 'button', icon, variant = 'primary', className = '', disabled = false }) => {
    const baseClasses = "inline-flex items-center justify-center font-medium rounded-md focus:outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed";
    const variantClasses = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
        ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
    };
    return (
        <button type={type} onClick={onClick} disabled={disabled} className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
            {icon}
            {children}
        </button>
    );
};

// --- NEW COMPONENT FOR COMPACT & INTELLIGENT DOMAIN DISPLAY ---
const DomainDisplay = ({ domains }) => {
    if (!domains || domains.length === 0) {
        return <Badge variant="gray" size="sm">N/A</Badge>;
    }

    const { refs, floatingStyles } = useFloating({
        placement: 'bottom-start',
        whileElementsMounted: autoUpdate,
        middleware: [
            offset(5),
            flip({ padding: 10 }), // This handles intelligent positioning
            shift({ padding: 10 }),
        ],
    });

    const firstDomain = domains[0];
    const otherDomainsCount = domains.length - 1;

    if (otherDomainsCount === 0) {
        return <Badge variant="primary" size="sm">{firstDomain}</Badge>;
    }

    return (
        <div className="flex items-center gap-1">
            <Badge variant="primary" size="sm">{firstDomain}</Badge>
            <Menu as="div" className="relative">
                <Menu.Button ref={refs.setReference} className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition-colors">
                    +{otherDomainsCount}
                </Menu.Button>
                <Portal>
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <Menu.Items
                            ref={refs.setFloating}
                            style={floatingStyles}
                            className="z-50 w-auto rounded-md bg-white p-2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none flex flex-col items-start gap-1"
                        >
                            {domains.map((domain, index) => (
                                <Menu.Item key={index} as="div">
                                    <Badge variant="primary" size="sm">{domain}</Badge>
                                </Menu.Item>
                            ))}
                        </Menu.Items>
                    </Transition>
                </Portal>
            </Menu>
        </div>
    );
};

const SkeletonRow = ({ columns }) => (
    <tr className="animate-pulse">
        {columns.map(col => (
            <td key={col.key} className={`px-3 py-3 whitespace-nowrap text-sm align-middle ${col.isSticky ? 'sticky left-0 z-1 bg-white' : ''}`}>
                <div className={`h-4 ${col.key === 'actions' || col.key === 'select' ? 'w-10' : 'w-full'} bg-gray-200 rounded`}></div>
            </td>
        ))}
    </tr>
);

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
    
    const [filteredCount, setFilteredCount] = useState(0);
    const [absoluteTotal, setAbsoluteTotal] = useState(0);
    
    const [sortConfig, setSortConfig] = useState({ key: 'onboardingDate', direction: 'desc' });
    const [filters, setFilters] = useState({ search: '', status: '', domain: '', paymentTier: '' });
    
    const [updatingId, setUpdatingId] = useState(null);
    const [sendingEmailId, setSendingEmailId] = useState(null);
    const [sendingProbationEmailId, setSendingProbationEmailId] = useState(null);

    const [modalState, setModalState] = useState({ type: null, data: null });
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, ids: [], isBulk: false });
    
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [selectedRows, setSelectedRows] = useState([]);

    const [uploadErrorLog, setUploadErrorLog] = useState(null);
    
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 15 });
    

    const fetchInterviewers = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                page, 
                limit: pagination.itemsPerPage, 
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

            setPagination(prev => ({ 
                ...prev,
                currentPage: page, 
                totalPages: Math.ceil((resData.totalDocs || 0) / prev.itemsPerPage), 
                totalItems: resData.totalDocs || 0 
            }));
            
        } catch (error) {
            showError('Error fetching interviewers:', error);
        } finally {
            setLoading(false);
        }
    }, [filters, sortConfig, showError, pagination.itemsPerPage]);
    
    const handleItemsPerPageChange = (e) => {
        const newSize = parseInt(e.target.value, 10);
        setPagination(prev => ({ ...prev, itemsPerPage: newSize }));
        fetchInterviewers(1); 
    };

    const handlePageChange = (page) => {
        if (page > 0 && page <= pagination.totalPages) {
            fetchInterviewers(page);
        }
    };
    
    const debouncedFetch = useMemo(() => debounce(() => fetchInterviewers(1), 300), [fetchInterviewers]);

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

    const handleSendWelcomeEmail = useCallback(async (interviewerId) => {
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
    }, [showSuccess, showError]);

    const handleSendProbationEmail = useCallback(async (interviewerId) => {
        setSendingProbationEmailId(interviewerId);
        try {
            await sendProbationEmail(interviewerId);
            showSuccess('Probation completion email sent successfully!');
            setInterviewers(prev => 
                prev.map(i => i._id === interviewerId ? { ...i, probationEmailSentAt: new Date().toISOString() } : i)
            );
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to send probation email.');
        } finally {
            setSendingProbationEmailId(null);
        }
    }, [showSuccess, showError]);

    const handleMarkProbationAsSent = useCallback(async (interviewerId) => {
        setSendingProbationEmailId(interviewerId);
        try {
            await markProbationAsSent(interviewerId);
            showSuccess('Successfully marked as sent!');
            setInterviewers(prev => 
                prev.map(i => i._id === interviewerId ? { ...i, probationEmailSentAt: new Date().toISOString() } : i)
            );
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to update status.');
        } finally {
            setSendingProbationEmailId(null);
        }
    }, [showSuccess, showError]);
    
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
            fetchInterviewers(1); 
        } catch(err) {
            showError("Failed to delete interviewers.");
        }
    };
    
    const handleModalSuccess = () => {
        setModalState({ type: null, data: null });
        fetchInterviewers(pagination.currentPage); 
    };

    const handleUploadConfirm = async (data) => {
        setIsUploading(true);
        setUploadErrorLog(null);
        try {
            const response = await bulkUploadInterviewers(data);
            const { created, failedEntries } = response.data.data;
            
            let finalMessage = `Import finished: ${created} created, ${failedEntries.length} failed.`;
            showSuccess(finalMessage);

            if (failedEntries && failedEntries.length > 0) {
                const errorLogText = generateErrorLogText(failedEntries);
                setUploadErrorLog(errorLogText);
                showError(`${failedEntries.length} entries failed to import. An error log is available for download.`);
            }

            setIsUploadModalOpen(false);
            fetchInterviewers(1);
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

    const columns = useMemo(() => {
        const baseColumns = [
            { key: 'select', title: (<input type="checkbox" className="form-checkbox" onChange={handleSelectAll} checked={selectedRows.length === interviewers.length && interviewers.length > 0} />), render: (row) => (<input type="checkbox" className="form-checkbox" checked={selectedRows.includes(row._id)} onChange={() => handleSelectRow(row._id)} />) },
            { key: 'user.firstName', title: 'Name', sortable: true, minWidth: '180px', isSticky: true, render: (row) => `${row.user.firstName || ''} ${row.user.lastName || ''}` },
            { key: 'status', title: 'Status', sortable: true, minWidth: '150px', render: (row) => (<select value={row.status} onChange={(e) => handleStatusChange(row._id, e.target.value)} disabled={updatingId === row._id} className={`w-full text-xs font-semibold px-2 py-1.5 border rounded-md shadow-sm focus:outline-none focus:ring-1 transition-colors cursor-pointer ${ row.status === 'Active' ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' : row.status === 'On Probation' ? 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200' : 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'}`} onClick={(e) => e.stopPropagation()}>{Object.values(INTERVIEWER_STATUS).map(statusValue => (<option key={statusValue} value={statusValue}>{statusValue}</option>))}</select>) },
            { key: 'domains', title: 'Domain(s)', minWidth: '110px', render: (row) => <DomainDisplay domains={row.domains} /> },
            {
                key: 'sendWelcome',
                title: 'Welcome Mail',
                minWidth: '140px',
                render: (row) => {
                    const isSending = sendingEmailId === row._id;
                    if (isSending) return <div className="flex items-center justify-center text-gray-500"><FiLoader className="animate-spin h-5 w-5" /></div>;
                    if (row.welcomeEmailSentAt) {
                        return (
                            <div className="flex items-center justify-center space-x-2">
                                <FiCheckCircle className="text-green-500" size={20} title={`Sent on ${formatDateTime(row.welcomeEmailSentAt)}`} />
                                <button onClick={() => handleSendWelcomeEmail(row._id)} className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors" title="Resend welcome email"><FiRefreshCw size={16} /></button>
                            </div>
                        );
                    } else {
                        return (
                            <div className="flex items-center justify-center">
                                <button onClick={() => handleSendWelcomeEmail(row._id)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors" title="Send welcome email"><FiSend size={18} /></button>
                            </div>
                        );
                    }
                }
            },
            { key: 'metrics.interviewsCompleted', title: 'Interviews', sortable: true, minWidth: '110px', render: (row) => <div className="text-center">{row.metrics?.interviewsCompleted || 0}</div> },
            { key: 'onboardingDate', title: 'Onboarded', sortable: true, minWidth: '120px', render: (row) => row.onboardingDate ? new Date(row.onboardingDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric'}) : ''},
            { key: 'paymentAmount', title: 'Amount', minWidth: '120px', render: (row) => <EditableCell value={row.paymentAmount} onSave={handleFieldSave} fieldName="paymentAmount" rowId={row._id} isLoading={updatingId === row._id} /> },
            { key: 'interviewerId', title: 'Interviewer ID', minWidth: '280px', sortable: true, render: (row) => <EditableCell value={row.interviewerId} onSave={handleFieldSave} fieldName="interviewerId" rowId={row._id} isLoading={updatingId === row._id} /> },
            { key: 'payoutId', title: 'Payout ID', minWidth: '280px', sortable: true, render: (row) => <EditableCell value={row.payoutId} onSave={handleFieldSave} fieldName="payoutId" rowId={row._id} isLoading={updatingId === row._id} /> },
            { key: 'user.email', title: 'Email', sortable: true, minWidth: '220px', render: (row) => row.user.email || '' },
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
            { 
                key: 'actions', 
                title: 'Actions', 
                minWidth: '80px', 
                render: (row) => {
                    const isEligibleForProbationAction = 
                        (row.status === 'On Probation' || row.status === 'Active') && 
                        row.metrics?.interviewsCompleted >= 5;

                    const dropdownOptions = [
                        { label: 'Edit User', icon: FiEdit, onClick: () => setModalState({ type: 'edit', data: row }) }
                    ];
                    
                    if (isEligibleForProbationAction && !row.probationEmailSentAt) {
                        dropdownOptions.push({
                            label: 'Mark Probation Sent',
                            icon: FiCheckCircle,
                            onClick: () => handleMarkProbationAsSent(row._id)
                        });
                    }

                    dropdownOptions.push({ 
                        label: 'Delete User', 
                        icon: FiTrash2, 
                        isDestructive: true, 
                        onClick: () => setDeleteDialog({ isOpen: true, ids: [row._id], isBulk: false }) 
                    });
                    
                    return <DropdownMenu options={dropdownOptions} />;
                }
            }
        ];

        const ifscCodeIndex = baseColumns.findIndex(col => col.key === 'bankDetails.ifscCode');
        const probationColumn = {
            key: 'completionProbation',
            title: 'Completion Probation',
            minWidth: '140px',
            render: (row) => {
                const isEligible = (row.status === 'On Probation' || row.status === 'Active') && row.metrics?.interviewsCompleted >= 5;
                const isSending = sendingProbationEmailId === row._id;

                if (isSending) {
                    return <div className="flex items-center justify-center text-gray-500"><FiLoader className="animate-spin h-5 w-5" /></div>;
                }
                
                if (row.probationEmailSentAt) {
                    return (
                        <div className="flex items-center justify-center space-x-2">
                            <FiCheckCircle className="text-green-500" size={20} title={`Sent on ${formatDateTime(row.probationEmailSentAt)}`} />
                            <button onClick={() => handleSendProbationEmail(row._id)} className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors" title="Resend email"><FiRefreshCw size={16} /></button>
                        </div>
                    );
                }
                
                if (isEligible) {
                     return (
                        <div className="flex items-center justify-center">
                            <button onClick={() => handleSendProbationEmail(row._id)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors" title="Send probation completion email"><FiSend size={18} /></button>
                        </div>
                    );
                }

                return <span className="text-gray-400 text-center block">-</span>;
            }
        };

        if (ifscCodeIndex !== -1) {
            baseColumns.splice(ifscCodeIndex + 1, 0, probationColumn);
        } else {
            const actionsIndex = baseColumns.findIndex(col => col.key === 'actions');
            if (actionsIndex !== -1) {
                baseColumns.splice(actionsIndex, 0, probationColumn);
            } else {
                baseColumns.push(probationColumn);
            }
        }
        
        return baseColumns;

    }, [interviewers, selectedRows, updatingId, sendingEmailId, sendingProbationEmailId, handleStatusChange, handleSelectAll, handleSelectRow, handleFieldSave, handleSendWelcomeEmail, handleSendProbationEmail, handleMarkProbationAsSent]);
  
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
        <div className="h-full flex flex-col">
            <div className="p-4 bg-white border-b border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4 flex-shrink-0">
                <SearchInput value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} onClear={() => handleFilterChange('search', '')} placeholder="Search interviewers..." className="w-full md:w-72" />
                <div className="flex items-center gap-2 flex-wrap justify-end">
                    <FilterDropdown label="Status" options={[{ value: '', label: 'All Statuses' }, ...Object.values(INTERVIEWER_STATUS).map(s => ({ value: s, label: s }))]} selectedValue={filters.status} onChange={(val) => handleFilterChange('status', val)} />
                    <FilterDropdown label="Domain" options={[{ value: '', label: 'All Domains' }, ...DOMAINS.map(d => ({ value: d.value, label: d.label }))]} selectedValue={filters.domain} onChange={(val) => handleFilterChange('domain', val)} />
                    <Button variant="outline" icon={<FiUpload />} onClick={() => setIsUploadModalOpen(true)}>Import</Button>
                    <Button variant="primary" icon={<FiPlus size={16} />} onClick={() => setModalState({ type: 'add', data: null })}>Add</Button>
                </div>
            </div>

            {uploadErrorLog && (
                <div className="px-4 py-3 bg-red-50 border-y border-red-200 flex items-center justify-between">
                    <div className="flex items-center"><FiAlertTriangle className="h-5 w-5 text-red-600 mr-3" /><p className="text-sm font-semibold text-red-800">Some records failed to import. Download the log for details.</p></div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="!text-sm !py-1 !px-3" icon={<FiDownload size={14}/>} onClick={downloadErrorLog}>Download Log</Button>
                        <button onClick={() => setUploadErrorLog(null)} className="p-1 rounded-full hover:bg-red-100"><FiX className="h-4 w-4 text-red-700" /></button>
                    </div>
                </div>
            )}
            {selectedRows.length > 0 && (
                <div className="px-4 py-2 bg-blue-50 border-y border-blue-200 flex items-center justify-between">
                    <span className="text-sm font-semibold text-blue-800">{selectedRows.length} selected</span>
                    <div className="space-x-2">
                        <Button variant="outline" className="!text-sm !py-1 !px-3" icon={<FiEdit size={14}/>} disabled={selectedRows.length !== 1} onClick={() => { const selectedInterviewer = interviewers.find(i => i._id === selectedRows[0]); setModalState({ type: 'edit', data: selectedInterviewer }); }}>Edit</Button>
                        <Button variant="outline" className="!text-sm !py-1 !px-3 !text-red-600 !border-red-300 hover:!bg-red-50" icon={<FiTrash2 size={14}/>} onClick={() => setDeleteDialog({ isOpen: true, ids: selectedRows, isBulk: true })}>Delete</Button>
                    </div>
                </div>
            )}
            
            <div className="flex-grow overflow-auto">
                <Table
                    columns={columns}
                    data={interviewers}
                    isLoading={loading}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    emptyMessage="No interviewers found."
                    customLoader={
                        <tbody>{[...Array(pagination.itemsPerPage)].map((_, i) => <SkeletonRow key={i} columns={columns} />)}</tbody>
                    }
                />
            </div>
            {!loading && pagination && pagination.totalItems > 0 && (
                <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0"> 
                    <div className="flex items-center space-x-2 text-sm text-gray-700">
                        <select value={pagination.itemsPerPage} onChange={handleItemsPerPageChange} className="bg-white border border-gray-300 rounded-lg px-2 py-1 text-gray-800"> 
                            {[15, 20, 50, 100].map(size => (<option key={size} value={size}>{size}</option>))}
                        </select>
                         <span>rows per page</span>
                    </div>
                    <div className="text-sm text-gray-700">Page <span className="font-semibold">{pagination.currentPage}</span> of <span className="font-semibold">{pagination.totalPages}</span> ({pagination.totalItems} items)</div>
                    <div className="flex items-center space-x-1">
                        <LocalButton variant="ghost" icon={<FiChevronsLeft size={16}/>} onClick={() => handlePageChange(1)} disabled={pagination.currentPage === 1} className="!p-2"/>
                        <LocalButton variant="ghost" icon={<FiChevronLeft size={16}/>} onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1} className="!p-2"/>
                        <LocalButton variant="ghost" icon={<FiChevronRight size={16}/>} onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages} className="!p-2"/>
                        <LocalButton variant="ghost" icon={<FiChevronsRight size={16}/>} onClick={() => handlePageChange(pagination.totalPages)} disabled={pagination.currentPage === pagination.totalPages} className="!p-2"/>
                    </div>
                </div>
            )}

            <InterviewerFormModal isOpen={!!modalState.type} onClose={() => setModalState({ type: null, data: null })} onSuccess={handleModalSuccess} interviewerData={modalState.data} />
            <ConfirmDialog isOpen={deleteDialog.isOpen} onClose={() => setDeleteDialog({ isOpen: false, ids: [], isBulk: false })} onConfirm={handleBulkDelete} title={`Delete Interviewer(s)`} message={`Are you sure you want to delete ${deleteDialog.ids.length} interviewer(s)? This will also permanently delete their user accounts.`} />
            <UploadModal {...interviewerUploadProps} />
        </div>
    );
};

export default Interviewers;
