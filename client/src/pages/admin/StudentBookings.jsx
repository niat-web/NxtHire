// // client/src/pages/admin/StudentBookings.jsx
// import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import * as XLSX from 'xlsx';
// import { FiEye, FiInfo, FiSend, FiInbox, FiLink, FiUsers, FiUpload, FiClipboard, FiCheckCircle, FiAlertTriangle, FiX, FiTrash2 } from 'react-icons/fi';
// import { getPublicBookings, updatePublicBookingLink } from '@/api/admin.api';
// import { useAlert } from '@/hooks/useAlert';
// import { formatDateTime } from '@/utils/formatters';

// // --- SELF-CONTAINED UI COMPONENTS ---
// const LocalButton = ({ children, onClick, isLoading = false, variant = 'primary', icon: Icon, className = '', disabled = false, type = 'button' }) => {
//     const baseClasses = "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm";
//     const variantClasses = {
//         primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
//         outline: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm',
//     };
//     return (
//         <button
//             type={type}
//             onClick={onClick}
//             disabled={isLoading || disabled}
//             className={`${baseClasses} ${variantClasses[variant]} ${className}`}
//         >
//             {isLoading ? (
//                 <>
//                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
//                     </svg>
//                     Loading...
//                 </>
//             ) : (
//                 <>
//                     {Icon && <Icon className="mr-2 h-4 w-4" />}
//                     {children}
//                 </>
//             )}
//         </button>
//     );
// };
// const LocalLoader = () => (
//     <div className="flex justify-center items-center py-20 text-center text-gray-500">
//         <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
//         <span className="ml-4">Loading data...</span>
//     </div>
// );
// const LocalEmptyState = ({ message, icon: Icon }) => (
//     <div className="text-center py-20 text-gray-500">
//         <Icon className="mx-auto h-10 w-10 text-gray-400 mb-2" />
//         <h3 className="font-semibold text-gray-700">No Data Found</h3>
//         <p className="text-sm">{message}</p>
//     </div>
// );
// const LocalTable = ({ columns, data, isLoading, emptyMessage, emptyIcon }) => (
//     <div className="w-full overflow-x-auto">
//         <table className="min-w-full bg-white divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//                 <tr>
//                     {columns.map(col => (
//                         <th key={col.key} scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{minWidth: col.minWidth}}>{col.title}</th>
//                     ))}
//                 </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//                 {isLoading ? (
//                     <tr><td colSpan={columns.length}><LocalLoader /></td></tr>
//                 ) : data.length === 0 ? (
//                     <tr><td colSpan={columns.length}><LocalEmptyState message={emptyMessage} icon={emptyIcon} /></td></tr>
//                 ) : (
//                     data.map((row, rowIndex) => (
//                         <tr key={row._id || rowIndex} className="hover:bg-gray-50 transition-colors">
//                             {columns.map(col => (
//                                 <td key={col.key} className={`px-4 whitespace-nowrap text-sm text-gray-700 align-middle`}>
//                                     {col.render ? col.render(row, rowIndex) : row[col.key]}
//                                 </td>
//                             ))}
//                         </tr>
//                     ))
//                 )}
//             </tbody>
//         </table>
//     </div>
// );

// const AuthorizeStudentsModal = ({ isOpen, onClose, onSave, publicBookingId }) => {
//     const { showError, showSuccess } = useAlert();
//     const fileInputRef = useRef(null);
//     const [pastedText, setPastedText] = useState('');
//     const [students, setStudents] = useState([]);
//     const [isLoading, setIsLoading] = useState(false);

//     useEffect(() => {
//         if (!isOpen) {
//             setPastedText('');
//             setStudents([]);
//             setIsLoading(false);
//             if(fileInputRef.current) fileInputRef.current.value = null;
//         }
//     }, [isOpen]);

//     const processData = (data) => {
//         if (!data) return;
//         const rows = data.trim().split('\n');
//         const parsed = rows
//             .map(row => {
//                 const columns = row.split(/\t|,/);
//                 if (columns.length > 0 && columns.some(c => c.trim() !== '')) {
//                     return {
//                         hiringName: columns[0]?.trim() || '',
//                         domain: columns[1]?.trim() || '',
//                         userId: columns[2]?.trim() || '',
//                         fullName: columns[3]?.trim() || '',
//                         email: columns[4]?.trim().toLowerCase() || '',
//                         mobileNumber: columns[5]?.trim() || '',
//                         resumeLink: columns[6]?.trim() || ''
//                     };
//                 }
//                 return null;
//             }).filter(Boolean);

//         const validated = parsed.map(student => {
//             if (!student.email || !/\S+@\S+\.\S+/.test(student.email)) return { ...student, _isValid: false, _error: 'Invalid or missing email.' };
//             if (!student.fullName) return { ...student, _isValid: false, _error: 'Full Name is required.' };
//             return { ...student, _isValid: true, _error: null };
//         });

//         setStudents(validated);
//         setPastedText(data);
//     };

//     const handleFileChange = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             const reader = new FileReader();
//             reader.onload = (event) => processData(event.target.result);
//             reader.readAsText(file);
//         }
//     };

//     const handleClear = () => {
//         setStudents([]);
//         setPastedText('');
//         if(fileInputRef.current) fileInputRef.current.value = null;
//     };
    
//     const handleSave = async () => {
//         const validStudents = students.filter(s => s._isValid).map(({ _isValid, _error, ...rest }) => rest);
//         if (validStudents.length === 0) return showError("No valid student data found.");
        
//         setIsLoading(true);
//         await onSave(publicBookingId, validStudents);
//         setIsLoading(false);
//         onClose();
//     };

//     const validCount = students.filter(s => s._isValid).length;
//     const invalidCount = students.length - validCount;
    
//     return isOpen ? (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
//             <div className="relative w-full max-w-7xl bg-white rounded-xl shadow-xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
//                 <div className="p-5 border-b flex justify-between items-center">
//                     <h3 className="text-xl font-semibold text-gray-900">Authorize & Invite Students</h3>
//                     <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100"><FiX size={20}/></button>
//                 </div>
                
//                 <div className="p-6 flex-grow overflow-y-auto space-y-5 bg-gray-50/50">
//                     <div className="relative">
//                         <textarea
//                             value={pastedText}
//                             onChange={(e) => processData(e.target.value)}
//                             placeholder="Paste your student data here..."
//                             className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm resize-none"
//                         />
//                          <div className="absolute top-4 right-4">
//                              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" id="csv-upload" />
//                              <label htmlFor="csv-upload" className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-full px-3 py-1.5 cursor-pointer hover:bg-blue-50">
//                                 <FiUpload size={14}/>
//                                 Upload CSV
//                             </label>
//                          </div>
//                     </div>
//                     {students.length > 0 && (
//                         <div className="space-y-3 animate-fade-in">
//                             <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
//                                 <div className="flex items-center gap-4 text-sm font-medium">
//                                     {validCount > 0 && <span className="flex items-center text-green-700"><FiCheckCircle className="mr-1.5"/>{validCount} Valid</span>}
//                                     {invalidCount > 0 && <span className="flex items-center text-red-700"><FiAlertTriangle className="mr-1.5"/>{invalidCount} Invalid</span>}
//                                 </div>
//                                 <LocalButton variant="outline" icon={FiTrash2} onClick={handleClear} className="!text-xs !py-1 !px-2">Clear Data</LocalButton>
//                             </div>
//                             <div className="border border-gray-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
//                                 <table className="min-w-full text-sm">
//                                     <thead className="bg-gray-100 sticky top-0"><tr className="text-left text-xs font-semibold text-gray-600 uppercase">
//                                         <th className="p-2 w-12 text-center">Status</th>
//                                         <th className="p-2">Hiring Name</th>
//                                         <th className="p-2">Domain</th>
//                                         <th className="p-2">User ID</th>
//                                         <th className="p-2">Full Name</th>
//                                         <th className="p-2">Email ID</th>
//                                         <th className="p-2">Mobile Number</th>
//                                         <th className="p-2">Resume Link</th>
//                                     </tr></thead>
//                                     <tbody className="divide-y divide-gray-200">
//                                         {students.map((s, i) => (
//                                             <tr key={i} className={!s._isValid ? 'bg-red-50' : 'bg-white'}>
//                                                 <td className="p-2 text-center">{s._isValid ? <FiCheckCircle className="text-green-500 mx-auto"/> : <FiAlertTriangle className="text-red-500 mx-auto" title={s._error}/>}</td>
//                                                 <td className="p-2">{s.hiringName}</td>
//                                                 <td className="p-2">{s.domain}</td>
//                                                 <td className="p-2">{s.userId}</td>
//                                                 <td className="p-2 font-medium">{s.fullName}</td>
//                                                 <td className="p-2 text-gray-600">{s.email}</td>
//                                                 <td className="p-2 text-gray-600">{s.mobileNumber}</td>
//                                                 <td className="p-2 text-gray-600">
//                                                     {s.resumeLink ? <a href={s.resumeLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a> : 'N/A'}
//                                                 </td>
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </div>
//                     )}
//                 </div>
                
//                 <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-2xl border-t">
//                     <LocalButton variant="outline" onClick={onClose}>Cancel</LocalButton>
//                     <LocalButton variant="primary" icon={FiSend} onClick={handleSave} isLoading={isLoading} disabled={validCount === 0}>
//                         {isLoading ? 'Processing...' : `Save & Invite ${validCount} Students`}
//                     </LocalButton>
//                 </div>
//             </div>
//         </div>
//     ) : null;
// };

// const ManagePublicLinks = () => {
//     const { showSuccess, showError } = useAlert();
//     const navigate = useNavigate();
//     const [loading, setLoading] = useState(true);
//     const [publicBookings, setPublicBookings] = useState([]);
//     const [modal, setModal] = useState({ isOpen: false, id: null });
//     const [savingId, setSavingId] = useState(null);

//     const fetchPublicBookings = useCallback(async () => {
//         setLoading(true);
//         try {
//             const response = await getPublicBookings();
//             setPublicBookings(response.data.data);
//         } catch (err) {
//             showError("Failed to fetch public booking links.");
//         } finally {
//             setLoading(false);
//         }
//     }, [showError]);
    
//     useEffect(() => {
//         fetchPublicBookings();
//     }, [fetchPublicBookings]);

//     const handleAuthorize = async (id, students) => {
//         setSavingId(id);
//         try {
//             const response = await updatePublicBookingLink(id, { students });
//             showSuccess(response.data.message || 'Invitations processed successfully!');
//             fetchPublicBookings();
//         } catch (err) {
//             showError('Failed to send invitations.');
//         } finally {
//             setSavingId(null);
//         }
//     };
    
//     const columns = useMemo(() => [
//         { key: 'createdAt', title: 'Created', render: row => formatDateTime(row.createdAt), minWidth: '180px' },
//         { key: 'publicId', title: 'Public Link', render: row => <a href={`/book/${row.publicId}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-mono text-xs">/book/{row.publicId}</a> },
//         { key: 'interviewers', title: 'Interviewers', render: (row) => {
//             const uniqueInterviewers = [...new Set(row.interviewerSlots.map(s => `${s.interviewer.user.firstName} ${s.interviewer.user.lastName}`))];
//             return (
//                 <div className="relative group flex items-center gap-2">
//                     <span className="font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-md text-xs">{uniqueInterviewers.length} Assigned</span>
//                     <FiInfo className="text-gray-400 cursor-pointer"/>
//                     <div className="absolute left-0 bottom-full mb-2 w-max max-w-xs p-2 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
//                         <ul className="list-disc list-inside">
//                             {uniqueInterviewers.map((name, index) => <li key={index}>{name}</li>)}
//                         </ul>
//                     </div>
//                 </div>
//             );
//         }},
//         { key: 'authorizedCount', title: 'Authorized Students', render: row => `${row.allowedStudents?.length || 0} students`},
//         { key: 'actions', title: 'Actions', render: row => (
//             <div className="flex items-center gap-2">
//                 <LocalButton isLoading={savingId === row._id} onClick={() => setModal({isOpen: true, id: row._id})} icon={FiUsers} className="!text-xs !py-1.5">
//                     Authorize & Invite
//                 </LocalButton>
//                 <LocalButton variant="outline" onClick={() => navigate(`/admin/public-bookings/${row._id}/tracking`)} className="!p-2">
//                     <FiEye/>
//                 </LocalButton>
//             </div>
//         )},
//     ], [navigate, savingId]);

//     return <>
//         <LocalTable columns={columns} data={publicBookings} isLoading={loading} emptyMessage="No public links have been created yet." emptyIcon={FiLink} />
//         <AuthorizeStudentsModal isOpen={modal.isOpen} onClose={() => setModal({isOpen: false, id: null})} onSave={handleAuthorize} publicBookingId={modal.id} />
//     </>;
// };

// const StudentBookings = () => {
//     return (
//         <div className="h-full w-full flex flex-col bg-white overflow-hidden">
//              <div className="flex-grow p-4 overflow-y-auto">
//                 <ManagePublicLinks />
//             </div>
//         </div>
//     )
// };

// export default StudentBookings;


// client/src/pages/admin/StudentBookings.jsx

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { FiEye, FiInfo, FiSend, FiInbox, FiLink, FiUsers, FiUpload, FiClipboard, FiCheckCircle, FiAlertTriangle, FiX, FiTrash2 } from 'react-icons/fi';
import { getPublicBookings, updatePublicBookingLink } from '@/api/admin.api';
import { useAlert } from '@/hooks/useAlert';
import { formatDateTime } from '@/utils/formatters';

// --- SELF-CONTAINED UI COMPONENTS (To keep this file independent) ---

const LocalButton = ({ children, onClick, isLoading = false, variant = 'primary', icon: Icon, className = '', disabled = false, type = 'button' }) => {
    const baseClasses = "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm";
    const variantClasses = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
        outline: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm',
    };
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={isLoading || disabled}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        >
            {isLoading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                    Loading...
                </>
            ) : (
                <>
                    {Icon && <Icon className="mr-2 h-4 w-4" />}
                    {children}
                </>
            )}
        </button>
    );
};

const LocalLoader = () => (
    <div className="flex justify-center items-center py-20 text-center text-gray-500">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
        <span className="ml-4">Loading data...</span>
    </div>
);

const LocalEmptyState = ({ message, icon: Icon }) => (
    <div className="text-center py-20 text-gray-500">
        <Icon className="mx-auto h-10 w-10 text-gray-400 mb-2" />
        <h3 className="font-semibold text-gray-700">No Data Found</h3>
        <p className="text-sm">{message}</p>
    </div>
);

const LocalTable = ({ columns, data, isLoading, emptyMessage, emptyIcon }) => (
    <div className="w-full overflow-x-auto">
        <table className="min-w-full bg-white divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    {columns.map(col => (
                        <th key={col.key} scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{minWidth: col.minWidth}}>{col.title}</th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                    <tr><td colSpan={columns.length}><LocalLoader /></td></tr>
                ) : data.length === 0 ? (
                    <tr><td colSpan={columns.length}><LocalEmptyState message={emptyMessage} icon={emptyIcon} /></td></tr>
                ) : (
                    data.map((row, rowIndex) => (
                        <tr key={row._id || rowIndex} className="hover:bg-gray-50 transition-colors">
                            {columns.map(col => (
                                <td key={col.key} className={`px-4 py-3 whitespace-nowrap text-sm text-gray-700 align-middle`}>
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

const AuthorizeStudentsModal = ({ isOpen, onClose, onSave, publicBookingId }) => {
    const { showError, showSuccess } = useAlert();
    const fileInputRef = useRef(null);
    const [pastedText, setPastedText] = useState('');
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setPastedText('');
            setStudents([]);
            setIsLoading(false);
            if(fileInputRef.current) fileInputRef.current.value = null;
        }
    }, [isOpen]);

    const processData = (data) => {
        if (!data) return;
        const rows = data.trim().split('\n');
        const parsed = rows
            .map(row => {
                const columns = row.split(/\t|,/);
                if (columns.length > 0 && columns.some(c => c.trim() !== '')) {
                    return {
                        hiringName: columns[0]?.trim() || '',
                        domain: columns[1]?.trim() || '',
                        userId: columns[2]?.trim() || '',
                        fullName: columns[3]?.trim() || '',
                        email: columns[4]?.trim().toLowerCase() || '',
                        mobileNumber: columns[5]?.trim() || '',
                        resumeLink: columns[6]?.trim() || ''
                    };
                }
                return null;
            }).filter(Boolean);

        const validated = parsed.map(student => {
            if (!student.email || !/\S+@\S+\.\S+/.test(student.email)) return { ...student, _isValid: false, _error: 'Invalid or missing email.' };
            if (!student.fullName) return { ...student, _isValid: false, _error: 'Full Name is required.' };
            return { ...student, _isValid: true, _error: null };
        });

        setStudents(validated);
        setPastedText(data);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => processData(event.target.result);
            reader.readAsText(file);
        }
    };

    const handleClear = () => {
        setStudents([]);
        setPastedText('');
        if(fileInputRef.current) fileInputRef.current.value = null;
    };
    
    const handleSave = async () => {
        const validStudents = students.filter(s => s._isValid).map(({ _isValid, _error, ...rest }) => rest);
        if (validStudents.length === 0) return showError("No valid student data found.");
        
        setIsLoading(true);
        await onSave(publicBookingId, validStudents);
        setIsLoading(false);
        onClose();
    };

    const validCount = students.filter(s => s._isValid).length;
    const invalidCount = students.length - validCount;
    
    return isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="relative w-full max-w-7xl bg-white rounded-xl shadow-xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-900">Authorize & Invite Students</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100"><FiX size={20}/></button>
                </div>
                
                <div className="p-6 flex-grow overflow-y-auto space-y-5 bg-gray-50/50">
                    <div className="relative">
                        <textarea
                            value={pastedText}
                            onChange={(e) => processData(e.target.value)}
                            placeholder={"Paste student data here using columns: \nHiring Name, Domain, User ID, Full Name, Email, Mobile, Resume Link"}
                            className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm resize-none"
                        />
                         <div className="absolute top-4 right-4">
                             <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" id="csv-upload" />
                             <label htmlFor="csv-upload" className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-full px-3 py-1.5 cursor-pointer hover:bg-blue-50">
                                <FiUpload size={14}/>
                                Upload CSV
                            </label>
                         </div>
                    </div>
                    {students.length > 0 && (
                        <div className="space-y-3 animate-fade-in">
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                                <div className="flex items-center gap-4 text-sm font-medium">
                                    {validCount > 0 && <span className="flex items-center text-green-700"><FiCheckCircle className="mr-1.5"/>{validCount} Valid</span>}
                                    {invalidCount > 0 && <span className="flex items-center text-red-700"><FiAlertTriangle className="mr-1.5"/>{invalidCount} Invalid</span>}
                                </div>
                                <LocalButton variant="outline" icon={FiTrash2} onClick={handleClear} className="!text-xs !py-1 !px-2">Clear Data</LocalButton>
                            </div>
                            <div className="border border-gray-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-100 sticky top-0"><tr className="text-left text-xs font-semibold text-gray-600 uppercase">
                                        <th className="p-2 w-12 text-center">Status</th>
                                        <th className="p-2">Hiring Name</th>
                                        <th className="p-2">Domain</th>
                                        <th className="p-2">User ID</th>
                                        <th className="p-2">Full Name</th>
                                        <th className="p-2">Email ID</th>
                                        <th className="p-2">Mobile Number</th>
                                        <th className="p-2">Resume Link</th>
                                    </tr></thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {students.map((s, i) => (
                                            <tr key={i} className={!s._isValid ? 'bg-red-50' : 'bg-white'}>
                                                <td className="p-2 text-center">{s._isValid ? <FiCheckCircle className="text-green-500 mx-auto"/> : <FiAlertTriangle className="text-red-500 mx-auto" title={s._error}/>}</td>
                                                <td className="p-2">{s.hiringName}</td>
                                                <td className="p-2">{s.domain}</td>
                                                <td className="p-2">{s.userId}</td>
                                                <td className="p-2 font-medium">{s.fullName}</td>
                                                <td className="p-2 text-gray-600">{s.email}</td>
                                                <td className="p-2 text-gray-600">{s.mobileNumber}</td>
                                                <td className="p-2 text-gray-600">
                                                    {s.resumeLink ? <a href={s.resumeLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a> : 'N/A'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-2xl border-t">
                    <LocalButton variant="outline" onClick={onClose}>Cancel</LocalButton>
                    <LocalButton variant="primary" icon={FiSend} onClick={handleSave} isLoading={isLoading} disabled={validCount === 0}>
                        {isLoading ? 'Processing...' : `Save & Invite ${validCount} Students`}
                    </LocalButton>
                </div>
            </div>
        </div>
    ) : null;
};

// --- MAIN PAGE COMPONENT ---
const StudentBookings = () => {
    const { showSuccess, showError } = useAlert();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [publicBookings, setPublicBookings] = useState([]);
    const [modal, setModal] = useState({ isOpen: false, id: null });
    const [savingId, setSavingId] = useState(null);

    const fetchPublicBookings = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getPublicBookings();
            setPublicBookings(response.data.data);
        } catch (err) {
            showError("Failed to fetch public booking links.");
        } finally {
            setLoading(false);
        }
    }, [showError]);
    
    useEffect(() => {
        fetchPublicBookings();
    }, [fetchPublicBookings]);

    const handleAuthorize = async (id, students) => {
        setSavingId(id);
        try {
            const response = await updatePublicBookingLink(id, { students });
            showSuccess(response.data.message || 'Invitations processed successfully!');
            fetchPublicBookings();
        } catch (err) {
            showError('Failed to send invitations.');
        } finally {
            setSavingId(null);
        }
    };
    
    const columns = useMemo(() => [
        { key: 'createdAt', title: 'Created', render: row => formatDateTime(row.createdAt), minWidth: '180px' },
        { 
            key: 'publicId', 
            title: 'Public Link', 
            render: row => {
                const url = `${window.location.origin}/book/${row.publicId}`;
                return (
                    <div className="flex items-center gap-2">
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-mono text-xs">{row.publicId}</a>
                        <button onClick={() => navigator.clipboard.writeText(url).then(() => showSuccess("Link copied!"))} title="Copy link">
                            <FiClipboard className="h-4 w-4 text-gray-400 hover:text-blue-600" />
                        </button>
                    </div>
                );
            } 
        },
        { 
            key: 'interviewers', 
            title: 'Interviewers', 
            render: (row) => {
                // *** THE FIX IS HERE: Using optional chaining `?.` ***
                // This prevents the code from breaking if `slot.interviewer` or `slot.interviewer.user` is null or undefined.
                const uniqueInterviewers = [...new Set(
                    row.interviewerSlots
                        .map(slot => slot.interviewer?.user 
                            ? `${slot.interviewer.user.firstName} ${slot.interviewer.user.lastName}`
                            : 'Unknown Interviewer') // Provide a fallback name
                        .filter(Boolean) // Filter out any falsy values just in case
                )];
                return (
                    <div className="relative group flex items-center gap-2">
                        <span className="font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-md text-xs">{uniqueInterviewers.length} Assigned</span>
                        {uniqueInterviewers.length > 0 && <FiInfo className="text-gray-400 cursor-pointer"/>}
                        <div className="absolute left-0 bottom-full mb-2 w-max max-w-xs p-2 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                            <ul className="list-disc list-inside">
                                {uniqueInterviewers.map((name, index) => <li key={index}>{name}</li>)}
                            </ul>
                        </div>
                    </div>
                );
            }
        },
        { key: 'authorizedCount', title: 'Authorized Students', render: row => `${row.allowedStudents?.length || 0} students`},
        { key: 'actions', title: 'Actions', render: row => (
            <div className="flex items-center gap-2">
                <LocalButton isLoading={savingId === row._id} onClick={() => setModal({isOpen: true, id: row._id})} icon={FiUsers} className="!text-xs !py-1.5">
                    Authorize & Invite
                </LocalButton>
                <LocalButton variant="outline" onClick={() => navigate(`/admin/public-bookings/${row._id}/tracking`)} className="!p-2">
                    <FiEye/>
                </LocalButton>
            </div>
        )},
    ], [navigate, savingId, showSuccess]);

    return (
        <div className="h-full w-full flex flex-col bg-white overflow-hidden">
            <div className="flex-grow p-4 overflow-y-auto">
                <LocalTable 
                    columns={columns} 
                    data={publicBookings} 
                    isLoading={loading} 
                    emptyMessage="No public links have been created yet." 
                    emptyIcon={FiLink} 
                />
            </div>
            <AuthorizeStudentsModal 
                isOpen={modal.isOpen} 
                onClose={() => setModal({isOpen: false, id: null})} 
                onSave={handleAuthorize} 
                publicBookingId={modal.id} 
            />
        </div>
    );
};

export default StudentBookings;
