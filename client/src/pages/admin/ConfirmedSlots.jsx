// // client/src/pages/admin/ConfirmedSlots.jsx
// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import CreatableSelect from 'react-select/creatable';
// import Select from 'react-select';
// import { FiUsers, FiVideo, FiSearch, FiFilter, FiX } from 'react-icons/fi';
// import DatePicker from 'react-datepicker';
// import "react-datepicker/dist/react-datepicker.css";
// import {
//     getStudentPipeline, updateStudentBooking, getUniqueHostEmails, generateGoogleMeetLink,
//     getDomains, getPublicBookings
// } from '@/api/admin.api';
// import { useAlert } from '@/hooks/useAlert';
// import { formatDate } from '@/utils/formatters';

// // --- SELF-CONTAINED UI COMPONENTS ---
// const LocalButton = ({ children, onClick, isLoading = false, variant = 'primary', icon: Icon, className = '', disabled = false, type = 'button' }) => {
//     const baseClasses = "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm";
//     const variantClasses = {
//         primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
//         outline: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm',
//     };
//     return (
//         <button type={type} onClick={onClick} disabled={isLoading || disabled} className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
//             {isLoading ? (
//                 <>
//                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
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
// const LocalSearchInput = ({ value, onChange, placeholder }) => (
//     <div className="relative">
//         <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//         <input type="text" value={value} onChange={onChange} placeholder={placeholder} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm" />
//     </div>
// );
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
// const EditableDomainCell = ({ booking, domainOptions, onSave }) => {
//     const { showSuccess, showError } = useAlert();
//     const [currentValue, setCurrentValue] = useState(booking.domain || '');
//     const [isLoading, setIsLoading] = useState(false);
//     useEffect(() => { setCurrentValue(booking.domain || ''); }, [booking.domain]);
//     const handleSave = async (newDomain) => {
//         if (newDomain === currentValue) return;
//         setIsLoading(true);
//         setCurrentValue(newDomain);
//         try {
//             await updateStudentBooking(booking._id, { domain: newDomain });
//             onSave(booking._id, 'domain', newDomain);
//             showSuccess("Domain updated successfully.");
//         } catch (err) {
//             showError("Failed to update domain.");
//             setCurrentValue(booking.domain || '');
//         } finally {
//             setIsLoading(false);
//         }
//     };
//     return (
//         <select value={currentValue} onChange={(e) => handleSave(e.target.value)} disabled={isLoading} className={`w-full text-xs font-semibold px-2 py-1.5 border rounded-md shadow-sm focus:outline-none focus:ring-1 transition-colors cursor-pointer bg-gray-50 hover:bg-gray-100 ${isLoading ? 'opacity-50' : ''}`} onClick={(e) => e.stopPropagation()}>
//             <option value="" disabled>Select Domain</option>
//             {domainOptions.map(opt => (opt.value && <option key={opt.value} value={opt.value}>{opt.label}</option>))}
//         </select>
//     );
// };
// const EditableHostEmail = ({ booking, hostEmails, onSave }) => {
//     const [value, setValue] = useState(booking.hostEmail ? { label: booking.hostEmail, value: booking.hostEmail } : null);
//     const [isLoading, setIsLoading] = useState(false);
//     const { showSuccess, showError } = useAlert();
//     const options = hostEmails.map(email => ({ label: email, value: email }));
//     const selectStyles = { menuPortal: base => ({ ...base, zIndex: 9999 }), control: (base) => ({...base, fontSize: '0.875rem', minHeight: '38px' }), menu: base => ({...base, fontSize: '0.875rem' }) };
//     const handleChange = (newValue) => {
//         setValue(newValue);
//         handleSave(newValue);
//     };
//     const handleSave = async (selectedOption) => {
//         const newEmail = selectedOption ? selectedOption.value : '';
//         if (newEmail === (booking.hostEmail || '')) return;
//         setIsLoading(true);
//         try {
//             await updateStudentBooking(booking._id, { hostEmail: newEmail });
//             onSave(booking._id, 'hostEmail', newEmail);
//             showSuccess("Host email updated.");
//         } catch (err) {
//             showError("Failed to update host email.");
//             setValue(booking.hostEmail ? { label: booking.hostEmail, value: booking.hostEmail } : null);
//         } finally {
//             setIsLoading(false);
//         }
//     };
//     return (
//         <CreatableSelect
//             isClearable
//             isDisabled={isLoading}
//             isLoading={isLoading}
//             onChange={handleChange}
//             value={value}
//             options={options}
//             placeholder="Add or select email..."
//             className="min-w-[250px]"
//             menuPortalTarget={document.body}
//             menuPosition={'fixed'}
//             styles={selectStyles}
//         />
//     );
// };
// const EditableInputCell = ({ booking, fieldKey, value, onSave }) => {
//     const [currentValue, setCurrentValue] = useState(value || '');
//     const [isLoading, setIsLoading] = useState(false);
//     const { showSuccess, showError } = useAlert();
//     useEffect(() => {
//         setCurrentValue(value || '');
//     }, [value]);
//     const handleSave = async () => {
//         const originalValue = value || '';
//         if (currentValue.trim() === originalValue.trim()) return;
//         setIsLoading(true);
//         try {
//             await updateStudentBooking(booking._id, { [fieldKey]: currentValue.trim() });
//             onSave(booking._id, fieldKey, currentValue.trim());
//             showSuccess("Field updated successfully.");
//         } catch (err) {
//             showError(`Failed to update ${fieldKey}.`);
//             setCurrentValue(originalValue);
//         } finally {
//             setIsLoading(false);
//         }
//     };
//     return (
//         <input
//             type="text"
//             value={currentValue}
//             onChange={(e) => setCurrentValue(e.target.value)}
//             onBlur={handleSave}
//             disabled={isLoading}
//             placeholder="Event Title (auto-generated)"
//             className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm disabled:bg-gray-100"
//         />
//     );
// };
// const MeetLinkCell = ({ booking, onLinkGenerated }) => {
//     const [isLoading, setIsLoading] = useState(false);
//     const { showSuccess, showError } = useAlert();
//     const canGenerate = booking.studentEmail && booking.interviewerEmail && booking.hostEmail && booking.eventTitle;
//     const handleGenerate = async () => {
//         setIsLoading(true);
//         try {
//             const response = await generateGoogleMeetLink(booking._id);
//             onLinkGenerated(booking._id, 'meetLink', response.data.data.meetLink);
//             showSuccess('Google Meet link generated!');
//         } catch (error) {
//             showError(error.response?.data?.message || 'Failed to generate Meet link.');
//         } finally {
//             setIsLoading(false);
//         }
//     };
//     return (
//         <LocalButton
//             onClick={handleGenerate}
//             isLoading={isLoading}
//             disabled={!canGenerate}
//             icon={FiVideo}
//             className="!text-xs !py-1.5"
//             title={!canGenerate ? 'All emails and event title are required to generate a link.' : 'Generate Google Meet link'}
//         >
//             Generate
//         </LocalButton>
//     );
// };

// const ConfirmedSlotsView = () => {
//     const { showError } = useAlert();
//     const [loading, setLoading] = useState(true);
//     const [studentBookings, setStudentBookings] = useState([]);
//     const [hostEmails, setHostEmails] = useState([]);
//     const [domainsList, setDomainsList] = useState([]);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
//     const [tempFilters, setTempFilters] = useState({ date: null, domain: '', publicId: '' });
//     const [activeFilters, setActiveFilters] = useState({ date: null, domain: '', publicId: '' });
//     const [publicBookingOptions, setPublicBookingOptions] = useState([]);

//     const fetchInitialData = useCallback(async () => {
//         setLoading(true);
//         try {
//             const [pipelineRes, emailsRes, domainsRes, publicBookingsRes] = await Promise.all([
//                 getStudentPipeline(),
//                 getUniqueHostEmails(),
//                 getDomains(),
//                 getPublicBookings()
//             ]);
//             setStudentBookings(pipelineRes.data.data);
//             setHostEmails(emailsRes.data.data);
//             setDomainsList(domainsRes.data.data);
//             const options = (publicBookingsRes.data.data || []).map(b => ({
//                 value: b.publicId,
//                 label: `ID: ${b.publicId} (Created: ${formatDate(b.createdAt)})`,
//             }));
//             setPublicBookingOptions(options);
//         } catch (err) {
//             showError("Failed to load student pipeline or filter data.");
//         } finally {
//             setLoading(false);
//         }
//     }, [showError]);
    
//     useEffect(() => { fetchInitialData(); }, [fetchInitialData]);
    
//     const filteredBookings = useMemo(() => {
//         let data = [...studentBookings];
//         if (searchTerm) {
//             const lowercasedFilter = searchTerm.toLowerCase();
//             data = data.filter(item => {
//                 const interviewerName = item.bookedInterviewer ? `${item.bookedInterviewer.user.firstName} ${item.bookedInterviewer.user.lastName}` : '';
//                 return Object.values({ studentName: item.studentName, studentEmail: item.studentEmail, interviewer: interviewerName, userId: item.userId, domain: item.domain, }).some(value => String(value).toLowerCase().includes(lowercasedFilter));
//             });
//         }
//         if (activeFilters.date) {
//             const filterDate = new Date(activeFilters.date).toDateString();
//             data = data.filter(item => {
//                 if (!item.bookingDate) return false;
//                 const itemDate = new Date(item.bookingDate).toDateString();
//                 return itemDate === filterDate;
//             });
//         }
//         if (activeFilters.domain) {
//             data = data.filter(item => item.domain === activeFilters.domain);
//         }
//         if (activeFilters.publicId) {
//             data = data.filter(item => item.publicBookingId === activeFilters.publicId);
//         }
//         return data;
//     }, [studentBookings, searchTerm, activeFilters]);

//     const handleApplyFilters = () => {
//         setActiveFilters(tempFilters);
//         setIsFilterMenuOpen(false);
//     };
    
//     const handleClearFilters = () => {
//         setTempFilters({ date: null, domain: '', publicId: '' });
//         setActiveFilters({ date: null, domain: '', publicId: '' });
//         setIsFilterMenuOpen(false);
//     };

//     const isFilterActive = activeFilters.date || activeFilters.domain || activeFilters.publicId;

//     const domainOptions = useMemo(() => [{ value: '', label: 'All Domains' }, ...domainsList.map(domain => ({ value: domain.name, label: domain.name }))], [domainsList]);
    
//     const handleCellSave = (bookingId, fieldKey, newValue) => {
//         setStudentBookings(prev => prev.map(booking => booking._id === bookingId ? { ...booking, [fieldKey]: newValue } : booking));
//         if (fieldKey === 'hostEmail' && newValue && !hostEmails.includes(newValue)) {
//             setHostEmails(prev => [...prev, newValue].sort());
//         }
//     };
    
//     const columns = useMemo(() => [
//         { key: 'hiringName', title: 'Hiring Name', minWidth: '150px' },
//         { key: 'domain', title: 'Domain', minWidth: '150px', render: (row) => (<EditableDomainCell booking={row} domainOptions={domainOptions} onSave={handleCellSave} />)},
//         { key: 'userId', title: 'User ID' },
//         { key: 'interviewId', title: 'Int ID', minWidth: '120px' },
//         { key: 'studentName', title: 'Student Name' },
//         { key: 'studentEmail', title: 'Student Email' },
//         { key: 'mobileNumber', title: 'Mobile Number', render: row => row.mobileNumber || row.studentPhone || '' },
//         { key: 'resumeLink', title: 'Resume', render: (row) => row.resumeLink ? <a href={row.resumeLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a> : '' },
//         { key: 'publicLink', title: 'Public Link', minWidth: '120px', render: (row) => row.publicBookingId ? (<a href={`/book/${row.publicBookingId}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-mono text-xs" title={`Public Link ID: ${row.publicBookingId}`}>{row.publicBookingId}</a>) : (<div className="flex items-center h-[38px] text-xs text-gray-500 italic">N/A</div>) },
//         { key: 'interviewer', title: 'Interviewer', render: row => row.bookedInterviewer ? `${row.bookedInterviewer.user.firstName} ${row.bookedInterviewer.user.lastName}` : <div className="flex items-center h-[38px] text-xs text-gray-500 italic">Pending Booking</div>  },
//         { key: 'interviewerEmail', title: 'Interviewer Email', render: row => row.interviewerEmail ? row.interviewerEmail : <div className="flex items-center h-[38px] text-xs text-gray-500 italic"></div>  },
//         { key: 'bookingDate', title: 'Interview Date', render: row => row.bookingDate ? formatDate(row.bookingDate) : <div className="flex items-center h-[38px] text-xs text-gray-500 italic"></div>  },
//         { key: 'slot', title: 'Slot', render: row => row.bookedSlot ? `${row.bookedSlot.startTime} - ${row.bookedSlot.endTime}` : <div className="flex items-center h-[38px] text-xs text-gray-500 italic"></div>  },
//         { key: 'hostEmail', title: 'Host Email', render: row => row.bookedInterviewer ? <EditableHostEmail booking={row} hostEmails={hostEmails} onSave={handleCellSave} /> : <div className="flex items-center h-[38px] text-xs text-gray-500 italic"></div>},
//         { key: 'eventTitle', title: 'Event Title', minWidth: "250px", render: row => row.bookedInterviewer ? <EditableInputCell booking={row} fieldKey="eventTitle" value={row.eventTitle} onSave={handleCellSave} /> : <div className="flex items-center h-[38px] text-xs text-gray-500 italic"></div> },
//         { key: 'meet', title: 'Meet', render: (row) => !row.meetLink && row.bookedInterviewer ? <MeetLinkCell booking={row} onLinkGenerated={handleCellSave} /> : <div className="flex items-center h-[38px] text-xs text-gray-500 italic"></div>  },
//         { key: 'meetLink', title: 'Meet Link', render: (row) => row.meetLink ? (<a href={row.meetLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{row.meetLink}</a>) : <div className="flex items-center h-[38px] text-xs text-gray-500 italic"></div>  }
//     ], [hostEmails, handleCellSave, domainOptions]);
    
//     return (
//     <div className="space-y-4">
//         <div className="flex justify-between items-center gap-4">
//             <div className="w-full max-w-sm"><LocalSearchInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search slots..."/></div>
//             <div className="relative">
//                 <LocalButton variant="outline" onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}>
//                     <FiFilter className="h-4 w-4 mr-2 text-blue-600"/><span className="text-blue-600">Filter</span>
//                     {isFilterActive && <span onClick={(e) => { e.stopPropagation(); handleClearFilters(); }} className="ml-2 p-1 rounded-full hover:bg-gray-200"><FiX className="h-3 w-3 text-gray-500" /></span>}
//                 </LocalButton>
//                 {isFilterMenuOpen && (
//                      <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-md shadow-lg border z-10 p-4">
//                         <div className="space-y-4">
//                             <div><label className="block text-sm font-medium text-gray-700 mb-1">Interview Date</label><DatePicker selected={tempFilters.date} onChange={(date) => setTempFilters(prev => ({ ...prev, date }))} isClearable placeholderText="Select a date" className="w-full p-2 border border-gray-300 rounded-md text-sm"/></div>
//                             <div><label className="block text-sm font-medium text-gray-700 mb-1">Domain</label><select value={tempFilters.domain} onChange={(e) => setTempFilters(prev => ({...prev, domain: e.target.value}))} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm bg-white">{domainOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Public ID</label>
//                                 <Select
//                                     options={publicBookingOptions}
//                                     value={publicBookingOptions.find(opt => opt.value === tempFilters.publicId) || null}
//                                     onChange={(selectedOption) => setTempFilters(prev => ({ ...prev, publicId: selectedOption ? selectedOption.value : '' }))}
//                                     isClearable isSearchable placeholder="Search or select a Public ID..."
//                                     styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }), control: base => ({...base, fontSize: '0.875rem'}), menu: base => ({...base, fontSize: '0.875rem'})}}
//                                     menuPortalTarget={document.body} menuPosition={'fixed'} />
//                             </div>
//                         </div>
//                         <div className="mt-4 pt-4 border-t flex justify-end gap-2">
//                             <LocalButton variant="outline" onClick={handleClearFilters} className="!text-xs">Clear</LocalButton>
//                             <LocalButton variant="primary" onClick={handleApplyFilters} className="!text-xs">Apply</LocalButton>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//         <LocalTable columns={columns} data={filteredBookings} isLoading={loading} emptyMessage="No students found in the pipeline." emptyIcon={FiUsers}/>
//     </div>
//     );
// };

// const ConfirmedSlots = () => {
//     return (
//         <div className="h-full w-full flex flex-col bg-white overflow-hidden">
//              <div className="flex-grow overflow-y-auto p-4">
//                 <ConfirmedSlotsView />
//             </div>
//         </div>
//     );
// };

// export default ConfirmedSlots;


// client/src/pages/admin/ConfirmedSlots.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import CreatableSelect from 'react-select/creatable';
import Select from 'react-select';
import { FiUsers, FiVideo, FiSearch, FiFilter, FiX, FiCheckCircle, FiClock } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import {
    getStudentPipeline, updateStudentBooking, getUniqueHostEmails, generateGoogleMeetLink,
    getDomains, getPublicBookings
} from '@/api/admin.api';
import { useAlert } from '@/hooks/useAlert';
import { formatDate, formatTime } from '@/utils/formatters';

// --- SELF-CONTAINED UI COMPONENTS ---
const LocalButton = ({ children, onClick, isLoading = false, variant = 'primary', icon: Icon, className = '', disabled = false, type = 'button' }) => {
    const baseClasses = "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm";
    const variantClasses = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
        outline: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm',
    };
    return (
        <button type={type} onClick={onClick} disabled={isLoading || disabled} className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
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
const LocalSearchInput = ({ value, onChange, placeholder }) => (
    <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input type="text" value={value} onChange={onChange} placeholder={placeholder} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm" />
    </div>
);
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
                                <td key={col.key} className={`px-4 whitespace-nowrap text-sm text-gray-700 align-middle`}>
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
const EditableDomainCell = ({ booking, domainOptions, onSave }) => {
    const { showSuccess, showError } = useAlert();
    const [currentValue, setCurrentValue] = useState(booking.domain || '');
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => { setCurrentValue(booking.domain || ''); }, [booking.domain]);
    const handleSave = async (newDomain) => {
        if (newDomain === currentValue) return;
        setIsLoading(true);
        setCurrentValue(newDomain);
        try {
            await updateStudentBooking(booking._id, { domain: newDomain });
            onSave(booking._id, 'domain', newDomain);
            showSuccess("Domain updated successfully.");
        } catch (err) {
            showError("Failed to update domain.");
            setCurrentValue(booking.domain || '');
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <select value={currentValue} onChange={(e) => handleSave(e.target.value)} disabled={isLoading} className={`w-full text-xs font-semibold px-2 py-1.5 border rounded-md shadow-sm focus:outline-none focus:ring-1 transition-colors cursor-pointer bg-gray-50 hover:bg-gray-100 ${isLoading ? 'opacity-50' : ''}`} onClick={(e) => e.stopPropagation()}>
            <option value="" disabled>Select Domain</option>
            {domainOptions.map(opt => (opt.value && <option key={opt.value} value={opt.value}>{opt.label}</option>))}
        </select>
    );
};
const EditableHostEmail = ({ booking, hostEmails, onSave }) => {
    const [value, setValue] = useState(booking.hostEmail ? { label: booking.hostEmail, value: booking.hostEmail } : null);
    const [isLoading, setIsLoading] = useState(false);
    const { showSuccess, showError } = useAlert();
    const options = hostEmails.map(email => ({ label: email, value: email }));
    const selectStyles = { menuPortal: base => ({ ...base, zIndex: 9999 }), control: (base) => ({...base, fontSize: '0.875rem', minHeight: '38px' }), menu: base => ({...base, fontSize: '0.875rem' }) };
    const handleChange = (newValue) => {
        setValue(newValue);
        handleSave(newValue);
    };
    const handleSave = async (selectedOption) => {
        const newEmail = selectedOption ? selectedOption.value : '';
        if (newEmail === (booking.hostEmail || '')) return;
        setIsLoading(true);
        try {
            await updateStudentBooking(booking._id, { hostEmail: newEmail });
            onSave(booking._id, 'hostEmail', newEmail);
            showSuccess("Host email updated.");
        } catch (err) {
            showError("Failed to update host email.");
            setValue(booking.hostEmail ? { label: booking.hostEmail, value: booking.hostEmail } : null);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <CreatableSelect
            isClearable
            isDisabled={isLoading}
            isLoading={isLoading}
            onChange={handleChange}
            value={value}
            options={options}
            placeholder="Add or select email..."
            className="min-w-[250px]"
            menuPortalTarget={document.body}
            menuPosition={'fixed'}
            styles={selectStyles}
        />
    );
};
const EditableInputCell = ({ booking, fieldKey, value, onSave }) => {
    const [currentValue, setCurrentValue] = useState(value || '');
    const [isLoading, setIsLoading] = useState(false);
    const { showSuccess, showError } = useAlert();
    useEffect(() => {
        setCurrentValue(value || '');
    }, [value]);
    const handleSave = async () => {
        const originalValue = value || '';
        if (currentValue.trim() === originalValue.trim()) return;
        setIsLoading(true);
        try {
            await updateStudentBooking(booking._id, { [fieldKey]: currentValue.trim() });
            onSave(booking._id, fieldKey, currentValue.trim());
            showSuccess("Field updated successfully.");
        } catch (err) {
            showError(`Failed to update ${fieldKey}.`);
            setCurrentValue(originalValue);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <input
            type="text"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            onBlur={handleSave}
            disabled={isLoading}
            placeholder="Event Title (auto-generated)"
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm disabled:bg-gray-100"
        />
    );
};
const MeetLinkCell = ({ booking, onLinkGenerated }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { showSuccess, showError } = useAlert();
    const canGenerate = booking.studentEmail && booking.interviewerEmail && booking.hostEmail && booking.eventTitle;
    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const response = await generateGoogleMeetLink(booking._id);
            onLinkGenerated(booking._id, 'meetLink', response.data.data.meetLink);
            showSuccess('Google Meet link generated!');
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to generate Meet link.');
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <LocalButton
            onClick={handleGenerate}
            isLoading={isLoading}
            disabled={!canGenerate}
            icon={FiVideo}
            className="!text-xs !py-1.5"
            title={!canGenerate ? 'All emails and event title are required to generate a link.' : 'Generate Google Meet link'}
        >
            Generate
        </LocalButton>
    );
};

const StatusBadge = ({ status }) => {
    const statusMap = {
        Booked: { text: 'Booked', icon: FiCheckCircle, color: 'bg-green-100 text-green-800' },
        Pending: { text: 'Pending', icon: FiClock, color: 'bg-yellow-100 text-yellow-800' },
    };
    const { text, icon: Icon, color } = statusMap[status] || {};
    return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${color}`}>
            <Icon className="h-3.5 w-3.5" /> {text}
        </span>
    );
};


const ConfirmedSlotsView = () => {
    const { showError } = useAlert();
    const [activeTab, setActiveTab] = useState('confirmed');
    const [loading, setLoading] = useState(true);
    const [studentBookings, setStudentBookings] = useState([]);
    const [hostEmails, setHostEmails] = useState([]);
    const [domainsList, setDomainsList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [tempFilters, setTempFilters] = useState({ date: null, domain: '', publicId: '' });
    const [activeFilters, setActiveFilters] = useState({ date: null, domain: '', publicId: '' });
    const [publicBookingOptions, setPublicBookingOptions] = useState([]);
    const [publicBookingCreationDates, setPublicBookingCreationDates] = useState({});

    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        try {
            const [pipelineRes, emailsRes, domainsRes, publicBookingsRes] = await Promise.all([
                getStudentPipeline(),
                getUniqueHostEmails(),
                getDomains(),
                getPublicBookings()
            ]);
            setStudentBookings(pipelineRes.data.data);
            setHostEmails(emailsRes.data.data);
            setDomainsList(domainsRes.data.data);
            const publicBookings = publicBookingsRes.data.data || [];
            const options = publicBookings.map(b => ({
                value: b.publicId,
                label: `ID: ${b.publicId} (Created: ${formatDate(b.createdAt)})`,
            }));
            setPublicBookingOptions(options);
            
            const creationDateMap = publicBookings.reduce((acc, b) => {
                acc[b.publicId] = b.createdAt;
                return acc;
            }, {});
            setPublicBookingCreationDates(creationDateMap);
        } catch (err) {
            showError("Failed to load student pipeline or filter data.");
        } finally {
            setLoading(false);
        }
    }, [showError]);
    
    useEffect(() => { fetchInitialData(); }, [fetchInitialData]);
    
    const filteredBookings = useMemo(() => {
        let data = [...studentBookings];
        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            data = data.filter(item => {
                const interviewerName = item.bookedInterviewer ? `${item.bookedInterviewer.user.firstName} ${item.bookedInterviewer.user.lastName}` : '';
                return Object.values({ studentName: item.studentName, studentEmail: item.studentEmail, interviewer: interviewerName, userId: item.userId, domain: item.domain, }).some(value => String(value).toLowerCase().includes(lowercasedFilter));
            });
        }
        if (activeFilters.date) {
            const filterDate = new Date(activeFilters.date).toDateString();
            data = data.filter(item => {
                if (!item.bookingDate) return false;
                const itemDate = new Date(item.bookingDate).toDateString();
                return itemDate === filterDate;
            });
        }
        if (activeFilters.domain) {
            data = data.filter(item => item.domain === activeFilters.domain);
        }
        if (activeFilters.publicId) {
            data = data.filter(item => item.publicBookingId === activeFilters.publicId);
        }

        // Add invitation date to pending students
        return data.map(booking => {
            if (!booking.bookedInterviewer && booking.publicBookingId) {
                return {
                    ...booking,
                    invitationCreatedAt: publicBookingCreationDates[booking.publicBookingId] || booking.createdAt || null
                };
            }
            return {
                ...booking,
                invitationCreatedAt: publicBookingCreationDates[booking.publicBookingId] || null
            };
        });
    }, [studentBookings, searchTerm, activeFilters, publicBookingCreationDates]);
    
    const { confirmedBookings, pendingInvitations } = useMemo(() => {
        const confirmed = [];
        const pending = [];
        filteredBookings.forEach(booking => {
            if (booking.bookedInterviewer) {
                confirmed.push(booking);
            } else {
                pending.push(booking);
            }
        });
        return { confirmedBookings: confirmed, pendingInvitations: pending };
    }, [filteredBookings]);

    const handleApplyFilters = () => {
        setActiveFilters(tempFilters);
        setIsFilterMenuOpen(false);
    };
    
    const handleClearFilters = () => {
        setTempFilters({ date: null, domain: '', publicId: '' });
        setActiveFilters({ date: null, domain: '', publicId: '' });
        setIsFilterMenuOpen(false);
    };

    const isFilterActive = activeFilters.date || activeFilters.domain || activeFilters.publicId;

    const domainOptions = useMemo(() => [{ value: '', label: 'All Domains' }, ...domainsList.map(domain => ({ value: domain.name, label: domain.name }))], [domainsList]);
    
    const handleCellSave = (bookingId, fieldKey, newValue) => {
        setStudentBookings(prev => prev.map(booking => booking._id === bookingId ? { ...booking, [fieldKey]: newValue } : booking));
        if (fieldKey === 'hostEmail' && newValue && !hostEmails.includes(newValue)) {
            setHostEmails(prev => [...prev, newValue].sort());
        }
    };
    
    const confirmedColumns = useMemo(() => [
        { key: 'invitationCreatedAt', title: 'Invited On', render: (row) => formatDate(row.invitationCreatedAt) },
        { key: 'status', title: 'Status', render: () => <StatusBadge status="Booked" /> },
        { key: 'studentName', title: 'Student Name' },
        { key: 'studentEmail', title: 'Student Email' },
        { key: 'interviewer', title: 'Interviewer', render: row => `${row.bookedInterviewer.user.firstName} ${row.bookedInterviewer.user.lastName}` },
        { key: 'interviewerEmail', title: 'Interviewer Email', render: row => row.interviewerEmail || 'N/A' },
        { key: 'bookingDate', title: 'Interview Date', render: row => formatDate(row.bookingDate) },
        { key: 'slot', title: 'Time Slot', render: row => row.bookedSlot ? `${formatTime(row.bookedSlot.startTime)} - ${formatTime(row.bookedSlot.endTime)}` : '' },
        { key: 'domain', title: 'Domain', minWidth: '150px', render: (row) => <EditableDomainCell booking={row} domainOptions={domainOptions} onSave={handleCellSave} /> },
        { key: 'meet', title: 'Meet Link', render: (row) => row.meetLink ? <a href={row.meetLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Join</a> : <MeetLinkCell booking={row} onLinkGenerated={handleCellSave} /> },
        { key: 'hostEmail', title: 'Host Email', render: (row) => <EditableHostEmail booking={row} hostEmails={hostEmails} onSave={handleCellSave} /> },
        { key: 'eventTitle', title: 'Event Title', minWidth: "250px", render: row => <EditableInputCell booking={row} fieldKey="eventTitle" value={row.eventTitle} onSave={handleCellSave} /> },
        { key: 'hiringName', title: 'Hiring Name' },
        { key: 'interviewId', title: 'Int ID', minWidth: '120px' },
        { key: 'userId', title: 'User ID' },
        { key: 'resumeLink', title: 'Resume', render: (row) => row.resumeLink ? <a href={row.resumeLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a> : 'N/A' },
        { key: 'publicLink', title: 'Public Link', render: (row) => row.publicBookingId ? (<a href={`/book/${row.publicBookingId}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-mono text-xs">{row.publicBookingId}</a>) : ('N/A') },
    ], [hostEmails, domainOptions, handleCellSave]);

    const pendingColumns = useMemo(() => [
        { key: 'invitationCreatedAt', title: 'Invited On', render: (row) => formatDate(row.invitationCreatedAt) },
        { key: 'status', title: 'Status', render: () => <StatusBadge status="Pending" /> },
        { key: 'studentName', title: 'Student Name' },
        { key: 'studentEmail', title: 'Student Email' },
        { key: 'mobileNumber', title: 'Mobile', render: row => row.mobileNumber || '' },
        { key: 'hiringName', title: 'Hiring Name', minWidth: '150px' },
        { key: 'domain', title: 'Domain' },
        { key: 'userId', title: 'User ID' },
        { key: 'resumeLink', title: 'Resume', render: (row) => row.resumeLink ? <a href={row.resumeLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a> : 'N/A' },
        { key: 'publicLink', title: 'Public Link', render: (row) => row.publicBookingId ? (<a href={`/book/${row.publicBookingId}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-mono text-xs">{row.publicBookingId}</a>) : ('N/A') },
    ], []);
    
    return (
    <div className="space-y-4">
        <div className="flex justify-between items-center gap-4">
            <div className="w-full max-w-sm"><LocalSearchInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search slots..."/></div>
            <div className="relative">
                <LocalButton variant="outline" onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}>
                    <FiFilter className="h-4 w-4 mr-2 text-blue-600"/><span className="text-blue-600">Filter</span>
                    {isFilterActive && <span onClick={(e) => { e.stopPropagation(); handleClearFilters(); }} className="ml-2 p-1 rounded-full hover:bg-gray-200"><FiX className="h-3 w-3 text-gray-500" /></span>}
                </LocalButton>
                {isFilterMenuOpen && (
                     <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-md shadow-lg border z-10 p-4">
                        <div className="space-y-4">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Interview Date</label><DatePicker selected={tempFilters.date} onChange={(date) => setTempFilters(prev => ({ ...prev, date }))} isClearable placeholderText="Select a date" className="w-full p-2 border border-gray-300 rounded-md text-sm"/></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Domain</label><select value={tempFilters.domain} onChange={(e) => setTempFilters(prev => ({...prev, domain: e.target.value}))} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm bg-white">{domainOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Public ID</label>
                                <Select
                                    options={publicBookingOptions}
                                    value={publicBookingOptions.find(opt => opt.value === tempFilters.publicId) || null}
                                    onChange={(selectedOption) => setTempFilters(prev => ({ ...prev, publicId: selectedOption ? selectedOption.value : '' }))}
                                    isClearable isSearchable placeholder="Search or select a Public ID..."
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }), control: base => ({...base, fontSize: '0.875rem'}), menu: base => ({...base, fontSize: '0.875rem'})}}
                                    menuPortalTarget={document.body} menuPosition={'fixed'} />
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t flex justify-end gap-2">
                            <LocalButton variant="outline" onClick={handleClearFilters} className="!text-xs">Clear</LocalButton>
                            <LocalButton variant="primary" onClick={handleApplyFilters} className="!text-xs">Apply</LocalButton>
                        </div>
                    </div>
                )}
            </div>
        </div>
        
        <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button onClick={() => setActiveTab('confirmed')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'confirmed' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                    Confirmed Bookings <span className="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2.5 rounded-full text-xs font-medium">{confirmedBookings.length}</span>
                </button>
                <button onClick={() => setActiveTab('pending')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'pending' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                    Pending Invitations <span className="ml-2 bg-yellow-100 text-yellow-600 py-0.5 px-2.5 rounded-full text-xs font-medium">{pendingInvitations.length}</span>
                </button>
            </nav>
        </div>
        
        {activeTab === 'confirmed' && (
            <LocalTable columns={confirmedColumns} data={confirmedBookings} isLoading={loading} emptyMessage="No students have confirmed their booking yet." emptyIcon={FiUsers} />
        )}
        {activeTab === 'pending' && (
            <LocalTable columns={pendingColumns} data={pendingInvitations} isLoading={loading} emptyMessage="No pending student invitations." emptyIcon={FiUsers} />
        )}
   </div>
    );
};

const ConfirmedSlots = () => {
    return (
        <div className="h-full w-full flex flex-col bg-white overflow-hidden">
             <div className="flex-grow overflow-y-auto p-4">
                <ConfirmedSlotsView />
            </div>
        </div>
    );
};

export default ConfirmedSlots;
