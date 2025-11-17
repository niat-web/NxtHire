// import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
// import CreatableSelect from 'react-select/creatable';
// import Select from 'react-select';
// import { FiUsers, FiVideo, FiSearch, FiFilter, FiX, FiCheckCircle, FiClock, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
// import DatePicker from 'react-datepicker';
// import "react-datepicker/dist/react-datepicker.css";
// import {
//     getStudentPipeline, updateStudentBooking, getUniqueHostEmails, generateGoogleMeetLink,
//     getDomains, getPublicBookings
// } from '@/api/admin.api';
// import { useAlert } from '@/hooks/useAlert';
// import { formatDate, formatTime, formatDateTime } from '@/utils/formatters';
// import { MAIN_SHEET_INTERVIEW_STATUSES } from '@/utils/constants';

// // --- SELF-CONTAINED UI COMPONENTS ---
// const LocalButton = ({ children, onClick, type = 'button', isLoading = false, variant = 'primary', icon, disabled = false, size = 'md', className = '' }) => {
//     const baseClasses = "inline-flex items-center justify-center rounded-xl font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed";
//     const sizes = {
//         sm: 'text-xs px-3 py-1.5',
//         md: 'text-sm px-4 py-2',
//         lg: 'text-sm px-5 py-2.5',
//     };
//     const variants = {
//         primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
//         outline: 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 focus:ring-blue-500',
//         subtle: 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-400',
//         danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
//         ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
//     };
//     return (
//         <button
//             type={type}
//             onClick={onClick}
//             disabled={isLoading || disabled}
//             className={`${baseClasses} ${sizes[size]} ${variants[variant]} ${className}`}
//         >
//             {isLoading ? (
//                 <span className="inline-flex items-center gap-2">
//                     <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
//                     Processing…
//                 </span>
//             ) : (
//                 <>
//                     {/* --- FIX START: Correctly render the icon prop and handle spacing --- */}
//                     {icon && <span className={children ? 'mr-2' : ''}>{icon}</span>}
//                     {children}
//                     {/* --- FIX END --- */}
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
//     <table className="min-w-full bg-white divide-y divide-gray-200">
//         <thead className="bg-gray-50">
//             <tr>
//                 {columns.map(col => (
//                     <th key={col.key} scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{minWidth: col.minWidth}}>{col.title}</th>
//                 ))}
//             </tr>
//         </thead>
//         <tbody className="divide-y divide-gray-200">
//             {isLoading ? (
//                 <tr><td colSpan={columns.length}><LocalLoader /></td></tr>
//             ) : data.length === 0 ? (
//                 <tr><td colSpan={columns.length}><LocalEmptyState message={emptyMessage} icon={emptyIcon} /></td></tr>
//             ) : (
//                 data.map((row, rowIndex) => (
//                     <tr key={row._id || rowIndex} className="hover:bg-gray-50 transition-colors">
//                         {columns.map(col => (
//                             <td key={col.key} className={`px-4 py-2 whitespace-nowrap text-sm text-gray-700 align-middle`}>
//                                 {col.render ? col.render(row, rowIndex) : row[col.key]}
//                             </td>
//                         ))}
//                     </tr>
//                 ))
//             )}
//         </tbody>
//     </table>
// );

// const PaginationControls = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage, onItemsPerPageChange }) => {
//     if (totalItems === 0) return null;

//     const showingFrom = (currentPage - 1) * itemsPerPage + 1;
//     const showingTo = Math.min(currentPage * itemsPerPage, totalItems);
    
//     const pageButtons = [];
//     const maxVisiblePages = 5;

//     if (totalPages <= maxVisiblePages) {
//         for (let i = 1; i <= totalPages; i++) pageButtons.push(i);
//     } else {
//         pageButtons.push(1);
//         if (currentPage > 3) pageButtons.push('...');
        
//         let startPage = Math.max(2, currentPage - 1);
//         let endPage = Math.min(totalPages - 1, currentPage + 1);

//         if (currentPage <= 2) {
//           startPage = 2;
//           endPage = 3;
//         }
//         if (currentPage >= totalPages - 1) {
//           startPage = totalPages-2;
//           endPage = totalPages-1;
//         }

//         for (let i = startPage; i <= endPage; i++) {
//             if(!pageButtons.includes(i)) pageButtons.push(i);
//         }

//         if (currentPage < totalPages - 2) pageButtons.push('...');
//         if (!pageButtons.includes(totalPages)) pageButtons.push(totalPages);
//     }
    
//     let finalCleanedButtons = pageButtons.filter((item, index) => item !== '...' || pageButtons[index-1] !== '...');

//     return (
//         <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-white flex-shrink-0">
//             <div className="flex items-center space-x-2 text-sm text-gray-700">
//                 <span>Rows per page</span>
//                 <select value={itemsPerPage} onChange={onItemsPerPageChange} className="bg-white border border-gray-300 rounded-lg px-2 py-1 text-gray-800">
//                     {[15, 20, 50, 100].map(size => (
//                         <option key={size} value={size}>{size}</option>
//                     ))}
//                 </select>
//             </div>
//             <div className="text-sm text-gray-700">
//                 {`${showingFrom}-${showingTo} of ${totalItems} rows`}
//             </div>
//             <div className="flex items-center space-x-1">
//                 <LocalButton variant="ghost" icon={<FiChevronsLeft size={16}/>} onClick={() => onPageChange(1)} disabled={currentPage === 1} className="!p-1.5"/>
//                 <LocalButton variant="ghost" icon={<FiChevronLeft size={16}/>} onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="!p-1.5"/>
//                 <div className="flex -space-x-px">
//                     {finalCleanedButtons.map((pageNum, index) => {
//                         if (pageNum === '...') return <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-500">...</span>;
//                         return (<LocalButton key={pageNum} variant={currentPage === pageNum ? "primary" : "ghost"} onClick={() => onPageChange(pageNum)} className="!px-3 !py-1">{pageNum}</LocalButton>);
//                     })}
//                 </div>
//                 <LocalButton variant="ghost" icon={<FiChevronRight size={16}/>} onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="!p-1.5"/>
//                 <LocalButton variant="ghost" icon={<FiChevronsRight size={16}/>} onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className="!p-1.5"/>
//             </div>
//         </div>
//     );
// };

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
//             icon={<FiVideo />}
//             className="!text-xs !py-1.5"
//             title={!canGenerate ? 'All emails and event title are required to generate a link.' : 'Generate Google Meet link'}
//         >
//             Generate
//         </LocalButton>
//     );
// };

// const StatusBadge = ({ status }) => {
//     const statusMap = {
//         Booked: { text: 'Booked', icon: FiCheckCircle, color: 'bg-green-100 text-green-800' },
//         Pending: { text: 'Pending', icon: FiClock, color: 'bg-yellow-100 text-yellow-800' },
//     };
//     const { text, icon: Icon, color } = statusMap[status] || {};
//     return (
//         <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${color}`}>
//             <Icon className="h-3.5 w-3.5" /> {text}
//         </span>
//     );
// };


// const ConfirmedSlotsView = () => {
//     const { showError } = useAlert();
//     const [activeTab, setActiveTab] = useState('confirmed');
//     const [loading, setLoading] = useState(true);
//     const [studentBookings, setStudentBookings] = useState([]);
//     const [hostEmails, setHostEmails] = useState([]);
//     const [domainsList, setDomainsList] = useState([]);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
//     const [tempFilters, setTempFilters] = useState({ date: null, domain: '', publicId: '', invitedOnDate: null });
//     const [activeFilters, setActiveFilters] = useState({ date: null, domain: '', publicId: '', invitedOnDate: null });
//     const [publicBookingOptions, setPublicBookingOptions] = useState([]);
//     const [publicBookingCreationDates, setPublicBookingCreationDates] = useState({});
//     const filterMenuRef = useRef(null);

//     const [confirmedPagination, setConfirmedPagination] = useState({ currentPage: 1, itemsPerPage: 15 });
//     const [pendingPagination, setPendingPagination] = useState({ currentPage: 1, itemsPerPage: 15 });

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
//             const publicBookings = publicBookingsRes.data.data || [];
//             const options = publicBookings.map(b => ({
//                 value: b.publicId,
//                 label: `ID: ${b.publicId} (Created: ${formatDate(b.createdAt)})`,
//             }));
//             setPublicBookingOptions(options);
            
//             const creationDateMap = publicBookings.reduce((acc, b) => {
//                 acc[b.publicId] = b.createdAt;
//                 return acc;
//             }, {});
//             setPublicBookingCreationDates(creationDateMap);
//         } catch (err) {
//             showError("Failed to load student pipeline or filter data.");
//         } finally {
//             setLoading(false);
//         }
//     }, [showError]);
    
//     useEffect(() => { fetchInitialData(); }, [fetchInitialData]);
    
//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (filterMenuRef.current && !filterMenuRef.current.contains(event.target) && !event.target.closest('.react-datepicker-popper')) {
//                 setIsFilterMenuOpen(false);
//             }
//         };
//         if (isFilterMenuOpen) {
//             document.addEventListener("mousedown", handleClickOutside);
//         }
//         return () => {
//             document.removeEventListener("mousedown", handleClickOutside);
//         };
//     }, [isFilterMenuOpen]);

//     const filteredBookings = useMemo(() => {
//         const enhancedData = studentBookings.map(booking => {
//             const invitationCreatedAt = publicBookingCreationDates[booking.publicBookingId] || booking.createdAt || null;
//             return { ...booking, invitationCreatedAt };
//         });

//         let data = [...enhancedData];

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
//                 return new Date(item.bookingDate).toDateString() === filterDate;
//             });
//         }
//         if (activeFilters.invitedOnDate) {
//             const filterInvitedDate = new Date(activeFilters.invitedOnDate).toDateString();
//             data = data.filter(item => {
//                 if (!item.invitationCreatedAt) return false;
//                 return new Date(item.invitationCreatedAt).toDateString() === filterInvitedDate;
//             });
//         }
//         if (activeFilters.domain) {
//             data = data.filter(item => item.domain === activeFilters.domain);
//         }
//         if (activeFilters.publicId) {
//             data = data.filter(item => item.publicBookingId === activeFilters.publicId);
//         }
        
//         return data;
//     }, [studentBookings, searchTerm, activeFilters, publicBookingCreationDates]);
    
//     const { confirmedBookings, pendingInvitations } = useMemo(() => {
//         const confirmed = [];
//         const pending = [];
//         filteredBookings.forEach(booking => {
//             if (booking.bookedInterviewer) {
//                 confirmed.push(booking);
//             } else {
//                 pending.push(booking);
//             }
//         });
//         return { confirmedBookings: confirmed, pendingInvitations: pending };
//     }, [filteredBookings]);

//     const paginatedConfirmedBookings = useMemo(() => {
//         const start = (confirmedPagination.currentPage - 1) * confirmedPagination.itemsPerPage;
//         const end = start + confirmedPagination.itemsPerPage;
//         return confirmedBookings.slice(start, end);
//     }, [confirmedBookings, confirmedPagination]);

//     const paginatedPendingInvitations = useMemo(() => {
//         const start = (pendingPagination.currentPage - 1) * pendingPagination.itemsPerPage;
//         const end = start + pendingPagination.itemsPerPage;
//         return pendingInvitations.slice(start, end);
//     }, [pendingInvitations, pendingPagination]);

//     const handleConfirmedPageChange = (page) => {
//         setConfirmedPagination(prev => ({ ...prev, currentPage: page }));
//     };
    
//     const handlePendingPageChange = (page) => {
//         setPendingPagination(prev => ({ ...prev, currentPage: page }));
//     };

//     const handleConfirmedItemsPerPageChange = (e) => {
//         setConfirmedPagination({ currentPage: 1, itemsPerPage: Number(e.target.value) });
//     };

//     const handlePendingItemsPerPageChange = (e) => {
//         setPendingPagination({ currentPage: 1, itemsPerPage: Number(e.target.value) });
//     };

//     const handleApplyFilters = () => {
//         setActiveFilters(tempFilters);
//         setIsFilterMenuOpen(false);
//     };
    
//     const handleClearFilters = () => {
//         setTempFilters({ date: null, domain: '', publicId: '', invitedOnDate: null });
//         setActiveFilters({ date: null, domain: '', publicId: '', invitedOnDate: null });
//         setIsFilterMenuOpen(false);
//     };

//     const isFilterActive = activeFilters.date || activeFilters.domain || activeFilters.publicId || activeFilters.invitedOnDate;

//     const domainOptions = useMemo(() => [{ value: '', label: 'All Domains' }, ...domainsList.map(domain => ({ value: domain.name, label: domain.name }))], [domainsList]);
    
//     const handleCellSave = (bookingId, fieldKey, newValue) => {
//         setStudentBookings(prev => prev.map(booking => booking._id === bookingId ? { ...booking, [fieldKey]: newValue } : booking));
//         if (fieldKey === 'hostEmail' && newValue && !hostEmails.includes(newValue)) {
//             setHostEmails(prev => [...prev, newValue].sort());
//         }
//     };
    
//     const confirmedColumns = useMemo(() => [
//         { key: 'invitationCreatedAt', title: 'Invited On', render: (row) => formatDate(row.invitationCreatedAt) },
//         { key: 'status', title: 'Status', render: () => <StatusBadge status="Booked" /> },
//         { key: 'studentName', title: 'Student Name' },
//         { key: 'studentEmail', title: 'Student Email' },
//         { key: 'interviewer', title: 'Interviewer', render: row => `${row.bookedInterviewer.user.firstName} ${row.bookedInterviewer.user.lastName}` },
//         { key: 'interviewerEmail', title: 'Interviewer Email', render: row => row.interviewerEmail || 'N/A' },
//         { key: 'bookingDate', title: 'Interview Date', render: row => formatDate(row.bookingDate) },
//         { key: 'slot', title: 'Time Slot', render: row => row.bookedSlot ? `${formatTime(row.bookedSlot.startTime)} - ${formatTime(row.bookedSlot.endTime)}` : '' },
//         { key: 'domain', title: 'Domain', minWidth: '150px', render: (row) => <EditableDomainCell booking={row} domainOptions={domainOptions} onSave={handleCellSave} /> },
//         { key: 'meet', title: 'Meet Link', render: (row) => row.meetLink ? <a href={row.meetLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Join</a> : <MeetLinkCell booking={row} onLinkGenerated={handleCellSave} /> },
//         { key: 'hostEmail', title: 'Host Email', render: (row) => <EditableHostEmail booking={row} hostEmails={hostEmails} onSave={handleCellSave} /> },
//         { key: 'eventTitle', title: 'Event Title', minWidth: "250px", render: row => <EditableInputCell booking={row} fieldKey="eventTitle" value={row.eventTitle} onSave={handleCellSave} /> },
//         { key: 'hiringName', title: 'Hiring Name' },
//         { key: 'interviewId', title: 'Int ID', minWidth: '120px' },
//         { key: 'userId', title: 'User ID' },
//         { key: 'resumeLink', title: 'Resume', render: (row) => row.resumeLink ? <a href={row.resumeLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a> : 'N/A' },
//         { key: 'publicLink', title: 'Public Link', render: (row) => row.publicBookingId ? (<a href={`/book/${row.publicBookingId}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-mono text-xs">{row.publicBookingId}</a>) : ('N/A') },
//         { key: 'createdAt', title: 'Submitted Time', render: (row) => formatDateTime(row.createdAt) },
//     ], [hostEmails, domainOptions, handleCellSave]);

//     const pendingColumns = useMemo(() => [
//         { key: 'invitationCreatedAt', title: 'Invited On', render: (row) => formatDate(row.invitationCreatedAt) },
//         { key: 'status', title: 'Status', render: () => <StatusBadge status="Pending" /> },
//         { key: 'studentName', title: 'Student Name' },
//         { key: 'studentEmail', title: 'Student Email' },
//         { key: 'mobileNumber', title: 'Mobile', render: row => row.mobileNumber || '' },
//         { key: 'hiringName', title: 'Hiring Name', minWidth: '150px' },
//         { key: 'domain', title: 'Domain' },
//         { key: 'userId', title: 'User ID' },
//         { key: 'resumeLink', title: 'Resume', render: (row) => row.resumeLink ? <a href={row.resumeLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a> : 'N/A' },
//         { key: 'publicLink', title: 'Public Link', render: (row) => row.publicBookingId ? (<a href={`/book/${row.publicBookingId}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-mono text-xs">{row.publicBookingId}</a>) : ('N/A') },
//     ], []);
    
//     return (
//         <div className="h-full flex flex-col">
//             <div className="flex justify-between items-center gap-4 p-4 flex-shrink-0">
//                 <div className="w-full max-w-sm"><LocalSearchInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search slots..."/></div>
//                 <div className="relative" ref={filterMenuRef}>
//                     <LocalButton variant="outline" onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}>
//                         <FiFilter className="h-4 w-4 mr-2 text-blue-600"/><span className="text-blue-600">Filter</span>
//                         {isFilterActive && <span onClick={(e) => { e.stopPropagation(); handleClearFilters(); }} className="ml-2 p-1 rounded-full hover:bg-gray-200"><FiX className="h-3 w-3 text-gray-500" /></span>}
//                     </LocalButton>
//                     {isFilterMenuOpen && (
//                          <div className="absolute top-full right-0 mt-2 w-[500px] bg-white rounded-md shadow-lg border z-10 p-4">
//                             <div className="space-y-4">
//                                 <div className="grid grid-cols-2 gap-4">
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-1">Interview Date</label>
//                                         <DatePicker selected={tempFilters.date} onChange={(date) => setTempFilters(prev => ({ ...prev, date }))} isClearable placeholderText="Select a date" className="w-full p-2 border border-gray-300 rounded-md text-sm"/>
//                                     </div>
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-1">Invited On Date</label>
//                                         <DatePicker selected={tempFilters.invitedOnDate} onChange={(date) => setTempFilters(prev => ({ ...prev, invitedOnDate: date }))} isClearable placeholderText="Select a date" className="w-full p-2 border border-gray-300 rounded-md text-sm"/>
//                                     </div>
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
//                                     <select value={tempFilters.domain} onChange={(e) => setTempFilters(prev => ({...prev, domain: e.target.value}))} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm bg-white">{domainOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">Public ID</label>
//                                     <Select
//                                         options={publicBookingOptions}
//                                         value={publicBookingOptions.find(opt => opt.value === tempFilters.publicId) || null}
//                                         onChange={(selectedOption) => setTempFilters(prev => ({ ...prev, publicId: selectedOption ? selectedOption.value : '' }))}
//                                         isClearable isSearchable placeholder="Search or select a Public ID..."
//                                         styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }), control: base => ({...base, fontSize: '0.875rem'}), menu: base => ({...base, fontSize: '0.875rem'})}}
//                                         menuPortalTarget={document.body} menuPosition={'fixed'} />
//                                 </div>
//                             </div>
//                             <div className="mt-4 pt-4 border-t flex justify-end gap-2">
//                                 <LocalButton variant="outline" onClick={handleClearFilters} className="!text-xs">Clear</LocalButton>
//                                 <LocalButton variant="primary" onClick={handleApplyFilters} className="!text-xs">Apply</LocalButton>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>
            
//             <div className="px-4 border-b border-gray-200 flex-shrink-0">
//                 <nav className="-mb-px flex space-x-8" aria-label="Tabs">
//                     <button onClick={() => setActiveTab('confirmed')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'confirmed' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
//                         Confirmed Bookings <span className="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2.5 rounded-full text-xs font-medium">{confirmedBookings.length}</span>
//                     </button>
//                     <button onClick={() => setActiveTab('pending')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'pending' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
//                         Pending Invitations <span className="ml-2 bg-yellow-100 text-yellow-600 py-0.5 px-2.5 rounded-full text-xs font-medium">{pendingInvitations.length}</span>
//                     </button>
//                 </nav>
//             </div>

//             <div className="flex-grow overflow-hidden flex flex-col">
//                 {activeTab === 'confirmed' && (
//                     <div className="flex-1 overflow-hidden flex flex-col">
//                         <div className="flex-1 overflow-auto">
//                             <LocalTable columns={confirmedColumns} data={paginatedConfirmedBookings} isLoading={loading} emptyMessage="No students have confirmed their booking yet." emptyIcon={FiUsers} />
//                         </div>
//                         <PaginationControls currentPage={confirmedPagination.currentPage} totalPages={Math.ceil(confirmedBookings.length / confirmedPagination.itemsPerPage)} onPageChange={handleConfirmedPageChange} totalItems={confirmedBookings.length} itemsPerPage={confirmedPagination.itemsPerPage} onItemsPerPageChange={handleConfirmedItemsPerPageChange} />
//                     </div>
//                 )}
//                 {activeTab === 'pending' && (
//                     <div className="flex-1 overflow-hidden flex flex-col">
//                         <div className="flex-1 overflow-auto">
//                             <LocalTable columns={pendingColumns} data={paginatedPendingInvitations} isLoading={loading} emptyMessage="No pending student invitations." emptyIcon={FiUsers} />
//                         </div>
//                         <PaginationControls currentPage={pendingPagination.currentPage} totalPages={Math.ceil(pendingInvitations.length / pendingPagination.itemsPerPage)} onPageChange={handlePendingPageChange} totalItems={pendingInvitations.length} itemsPerPage={pendingPagination.itemsPerPage} onItemsPerPageChange={handlePendingItemsPerPageChange} />
//                     </div>
//                 )}
//             </div>
//        </div>
//     );
// };

// const ConfirmedSlots = () => {
//     return (
//         <ConfirmedSlotsView />
//     );
// };

// export default ConfirmedSlots;



import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import CreatableSelect from 'react-select/creatable';
import Select from 'react-select';
import { FiUsers, FiVideo, FiSearch, FiFilter, FiX, FiCheckCircle, FiClock, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import {
    getStudentPipeline,
    updateStudentBooking,
    getUniqueHostEmails,
    generateGoogleMeetLink,
    getDomains,
    getPublicBookings,
    manualBookStudentSlot,
    getPublicBookingDetails
} from '@/api/admin.api';
import { useAlert } from '@/hooks/useAlert';
import { formatDate, formatTime, formatDateTime } from '@/utils/formatters';

// --- SELF-CONTAINED UI COMPONENTS ---

const LocalButton = ({ children, onClick, type = 'button', isLoading = false, variant = 'primary', icon, disabled = false, size = 'md', className = '' }) => {
    const baseClasses = "inline-flex items-center justify-center rounded-xl font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed";
    const sizes = { sm: 'text-xs px-3 py-1.5', md: 'text-sm px-4 py-2', lg: 'text-sm px-5 py-2.5' };
    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        outline: 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 focus:ring-blue-500',
        subtle: 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-400',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
    };
    return (
        <button type={type} onClick={onClick} disabled={isLoading || disabled} className={`${baseClasses} ${sizes[size]} ${variants[variant]} ${className}`}>
            {isLoading ? (
                <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
                    Processing…
                </span>
            ) : (
                <>
                    {icon && <span className={children ? 'mr-2' : ''}>{icon}</span>}
                    {children}
                </>
            )}
        </button>
    );
};

const LocalSearchInput = ({ value, onChange, placeholder }) => (
    <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
        />
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
    <table className="min-w-full bg-white divide-y divide-gray-200">
        <thead className="bg-gray-50">
            <tr>
                {columns.map(col => (
                    <th key={col.key} scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: col.minWidth }}>
                        {col.title}
                    </th>
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
                            <td key={col.key} className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 align-middle">
                                {col.render ? col.render(row, rowIndex) : row[col.key]}
                            </td>
                        ))}
                    </tr>
                ))
            )}
        </tbody>
    </table>
);

const PaginationControls = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage, onItemsPerPageChange }) => {
    if (totalItems === 0) return null;
    const showingFrom = (currentPage - 1) * itemsPerPage + 1;
    const showingTo = Math.min(currentPage * itemsPerPage, totalItems);
    const pageButtons = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) { for (let i = 1; i <= totalPages; i++) pageButtons.push(i); } else { pageButtons.push(1); if (currentPage > 3) pageButtons.push('...'); let startPage = Math.max(2, currentPage - 1); let endPage = Math.min(totalPages - 1, currentPage + 1); if (currentPage <= 2) { startPage = 2; endPage = 3; } if (currentPage >= totalPages - 1) { startPage = totalPages - 2; endPage = totalPages - 1; } for (let i = startPage; i <= endPage; i++) { if (!pageButtons.includes(i)) pageButtons.push(i); } if (currentPage < totalPages - 2) pageButtons.push('...'); if (!pageButtons.includes(totalPages)) pageButtons.push(totalPages); }
    let finalCleanedButtons = pageButtons.filter((item, index) => item !== '...' || pageButtons[index - 1] !== '...');

    return (<div className="flex items-center justify-between p-4 border-t border-gray-200 bg-white flex-shrink-0"><div className="flex items-center space-x-2 text-sm text-gray-700"><span>Rows per page</span><select value={itemsPerPage} onChange={onItemsPerPageChange} className="bg-white border border-gray-300 rounded-lg px-2 py-1 text-gray-800">{[15, 20, 50, 100].map(size => (<option key={size} value={size}>{size}</option>))}</select></div><div className="text-sm text-gray-700">{`${showingFrom}-${showingTo} of ${totalItems} rows`}</div><div className="flex items-center space-x-1"><LocalButton variant="ghost" icon={<FiChevronsLeft size={16} />} onClick={() => onPageChange(1)} disabled={currentPage === 1} className="!p-1.5" /><LocalButton variant="ghost" icon={<FiChevronLeft size={16} />} onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="!p-1.5" /><div className="flex -space-x-px">{finalCleanedButtons.map((pageNum, index) => { if (pageNum === '...') return <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-500">...</span>; return (<LocalButton key={pageNum} variant={currentPage === pageNum ? "primary" : "ghost"} onClick={() => onPageChange(pageNum)} className="!px-3 !py-1">{pageNum}</LocalButton>); })}</div><LocalButton variant="ghost" icon={<FiChevronRight size={16} />} onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="!p-1.5" /><LocalButton variant="ghost" icon={<FiChevronsRight size={16} />} onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className="!p-1.5" /></div></div>);
};

const EditableDomainCell = ({ booking, domainOptions, onSave }) => {
    const { showSuccess, showError } = useAlert();
    const [currentValue, setCurrentValue] = useState(booking.domain || '');
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => { setCurrentValue(booking.domain || ''); }, [booking.domain]);
    const handleSave = async (newDomain) => { if (newDomain === currentValue) return; setIsLoading(true); setCurrentValue(newDomain); try { await updateStudentBooking(booking._id, { domain: newDomain }); onSave(booking._id, 'domain', newDomain); showSuccess("Domain updated successfully."); } catch (err) { showError("Failed to update domain."); setCurrentValue(booking.domain || ''); } finally { setIsLoading(false); } };
    return (<select value={currentValue} onChange={(e) => handleSave(e.target.value)} disabled={isLoading} className={`w-full text-xs font-semibold px-2 py-1.5 border rounded-md shadow-sm focus:outline-none focus:ring-1 transition-colors cursor-pointer bg-gray-50 hover:bg-gray-100 ${isLoading ? 'opacity-50' : ''}`} onClick={(e) => e.stopPropagation()}><option value="" disabled>Select Domain</option>{domainOptions.map(opt => (opt.value && <option key={opt.value} value={opt.value}>{opt.label}</option>))}</select>);
};

const EditableHostEmail = ({ booking, hostEmails, onSave }) => {
    const [value, setValue] = useState(booking.hostEmail ? { label: booking.hostEmail, value: booking.hostEmail } : null);
    const [isLoading, setIsLoading] = useState(false);
    const { showSuccess, showError } = useAlert();
    const options = hostEmails.map(email => ({ label: email, value: email }));
    const selectStyles = { menuPortal: base => ({ ...base, zIndex: 9999 }), control: (base) => ({ ...base, fontSize: '0.875rem', minHeight: '38px' }), menu: base => ({ ...base, fontSize: '0.875rem' }) };
    
    useEffect(() => {
        setValue(booking.hostEmail ? { label: booking.hostEmail, value: booking.hostEmail } : null);
    }, [booking.hostEmail]);

    const handleSave = async (selectedOption) => {
        const newEmail = selectedOption ? selectedOption.value : '';
        if (newEmail === (booking.hostEmail || '')) return;
        setIsLoading(true);
        try {
            const id = booking.isPending ? booking.studentEmail : booking._id;
            await updateStudentBooking(id, { hostEmail: newEmail });
            onSave(booking._id, 'hostEmail', newEmail);
            showSuccess("Host email updated.");
        } catch (err) {
            showError("Failed to update host email.");
            setValue(booking.hostEmail ? { label: booking.hostEmail, value: booking.hostEmail } : null);
        } finally { setIsLoading(false); }
    };
    return (<CreatableSelect isClearable isDisabled={isLoading} isLoading={isLoading} onChange={handleSave} value={value} options={options} placeholder="Add or select email..." className="min-w-[250px]" menuPortalTarget={document.body} menuPosition={'fixed'} styles={selectStyles} />);
};

const EditableInputCell = ({ booking, fieldKey, value, onSave, placeholder = "Edit..." }) => {
    const [currentValue, setCurrentValue] = useState(value || '');
    const [isLoading, setIsLoading] = useState(false);
    const { showSuccess, showError } = useAlert();
    useEffect(() => { setCurrentValue(value || ''); }, [value]);
    const handleSave = async () => {
        const originalValue = value || '';
        if (currentValue.trim() === originalValue.trim()) return;
        setIsLoading(true);
        try {
            const id = booking.isPending ? booking.studentEmail : booking._id;
            await updateStudentBooking(id, { [fieldKey]: currentValue.trim() });
            onSave(booking._id, fieldKey, currentValue.trim());
            showSuccess("Field updated successfully.");
        } catch (err) {
            showError(`Failed to update ${fieldKey}.`);
            setCurrentValue(originalValue);
        } finally { setIsLoading(false); }
    };
    return (<input type="text" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} onBlur={handleSave} disabled={isLoading} placeholder={placeholder} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm disabled:bg-gray-100" />);
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
        } finally { setIsLoading(false); }
    };
    return (<LocalButton onClick={handleGenerate} isLoading={isLoading} disabled={!canGenerate} icon={<FiVideo />} className="!text-xs !py-1.5" title={!canGenerate ? 'All emails and event title are required to generate a link.' : 'Generate Google Meet link'}>Generate</LocalButton>);
};

const StatusBadge = ({ status }) => {
    const statusMap = {
        Booked: { text: 'Booked', icon: FiCheckCircle, color: 'bg-green-100 text-green-800' },
        Pending: { text: 'Pending', icon: FiClock, color: 'bg-yellow-100 text-yellow-800' },
    };
    const { text, icon: Icon, color } = statusMap[status] || {};
    return (<span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${color}`}><Icon className="h-3.5 w-3.5" /> {text}</span>);
};

const ManualBookingControls = ({ row, onBooking, publicBookingDetails, onInterviewerSelect }) => {
    const [bookingState, setBookingState] = useState({ date: '', slot: '' });
    const { showError, showSuccess } = useAlert();
    const [isLoading, setIsLoading] = useState(false);

    const availableDates = useMemo(() => {
        if (!publicBookingDetails) return [];
        const uniqueDates = [...new Set(publicBookingDetails.interviewerSlots.map(s => s.date.split('T')[0]))];
        return uniqueDates.map(d => ({ value: d, label: formatDate(d) }));
    }, [publicBookingDetails]);

    const availableSlotsAndInterviewers = useMemo(() => {
        if (!publicBookingDetails || !bookingState.date) return [];
        const slotsOnDate = publicBookingDetails.interviewerSlots.filter(s => s.date.startsWith(bookingState.date));
        const allTimeSlots = slotsOnDate.flatMap(s => s.timeSlots.map(ts => {
            const interviewerName = s.interviewer?.user?.firstName || 'N/A';
            return {
                value: `${ts.startTime}|${ts.endTime}|${s.interviewer._id}`,
                label: `${formatTime(ts.startTime)} - ${formatTime(ts.endTime)} (${interviewerName})`
            };
        }));
        return allTimeSlots;
    }, [publicBookingDetails, bookingState.date]);

    const canBook = bookingState.date && bookingState.slot && row.hostEmail && row.eventTitle;

    const handleSlotChange = (e) => {
        const newSlotValue = e.target.value;
        setBookingState(prev => ({ ...prev, slot: newSlotValue }));
        
        // --- THIS IS THE FIX ---
        // Find the selected interviewer and pass their email up
        const [, , interviewerId] = newSlotValue.split('|');
        const interviewerSlot = publicBookingDetails.interviewerSlots.find(s => s.interviewer._id === interviewerId);
        if (interviewerSlot && interviewerSlot.interviewer.user) {
            onInterviewerSelect(interviewerSlot.interviewer.user.email);
        } else {
            onInterviewerSelect(''); // Clear if not found
        }
    };
    // --- END OF FIX ---
    
    const handleSave = async () => {
        if (!canBook) {
            showError('Please select date, time and ensure Host Email & Event Title are filled to book.');
            return;
        }
        setIsLoading(true);
        try {
            const [startTime, endTime, interviewerId] = bookingState.slot.split('|');
            await onBooking({
                interviewerId,
                date: bookingState.date,
                slot: { startTime, endTime },
            });
            showSuccess('Slot booked manually!');
        } catch (error) {
            showError(error?.response?.data?.message || 'Failed to book slot.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <select value={bookingState.date} onChange={e => setBookingState({ date: e.target.value, slot: '' })} className="p-2 border border-gray-300 rounded-md text-sm w-36">
                <option value="">Select Date</option>
                {availableDates.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
            <select value={bookingState.slot} onChange={handleSlotChange} disabled={!bookingState.date} className="p-2 border border-gray-300 rounded-md text-sm w-48">
                <option value="">Select Time & Interviewer</option>
                {availableSlotsAndInterviewers.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <LocalButton variant="primary" size="md" onClick={handleSave} isLoading={isLoading} disabled={!canBook}>Book</LocalButton>
        </div>
    );
};


const ConfirmedSlotsView = () => {
    const { showError, showSuccess } = useAlert();
    const [activeTab, setActiveTab] = useState('confirmed');
    const [loading, setLoading] = useState(true);
    const [studentBookings, setStudentBookings] = useState([]);
    const [hostEmails, setHostEmails] = useState([]);
    const [domainsList, setDomainsList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [tempFilters, setTempFilters] = useState({ date: null, domain: '', publicId: '', invitedOnDate: null });
    const [activeFilters, setActiveFilters] = useState({ date: null, domain: '', publicId: '', invitedOnDate: null });
    const [publicBookingOptions, setPublicBookingOptions] = useState([]);
    const [publicBookingCreationDates, setPublicBookingCreationDates] = useState({});
    const filterMenuRef = useRef(null);
    const [publicBookingDetailsCache, setPublicBookingDetailsCache] = useState({});
    const [confirmedPagination, setConfirmedPagination] = useState({ currentPage: 1, itemsPerPage: 15 });
    const [pendingPagination, setPendingPagination] = useState({ currentPage: 1, itemsPerPage: 15 });
    const [bookingDetailsLoading, setBookingDetailsLoading] = useState(false);

    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        try {
            const [pipelineRes, emailsRes, domainsRes, publicBookingsRes] = await Promise.all([ getStudentPipeline(), getUniqueHostEmails(), getDomains(), getPublicBookings() ]);
            const domainsWithTitles = new Map(domainsRes.data.data.map(d => [d.name, d.eventTitle]));
            
            const pipelineWithTitles = (pipelineRes.data.data || []).map(p => {
                if (p.isPending && !p.eventTitle) {
                    const domainEventTitle = domainsWithTitles.get(p.domain);
                    p.eventTitle = domainEventTitle ? `${domainEventTitle} || ${p.studentName}` : `${p.domain || 'Interview'} || ${p.studentName}`;
                }
                return p;
            });
            setStudentBookings(pipelineWithTitles);
            
            setHostEmails(emailsRes.data.data);
            setDomainsList(domainsRes.data.data);
            const publicBookings = publicBookingsRes.data.data || [];
            const options = publicBookings.map(b => ({ value: b.publicId, label: `ID: ${b.publicId} (Created: ${formatDate(b.createdAt)})`}));
            setPublicBookingOptions(options);
            const creationDateMap = publicBookings.reduce((acc, b) => { acc[b.publicId] = b.createdAt; return acc; }, {});
            setPublicBookingCreationDates(creationDateMap);
        } catch (err) { showError("Failed to load student pipeline or filter data."); } finally { setLoading(false); }
    }, [showError]);
    
    useEffect(() => { fetchInitialData(); }, [fetchInitialData]);
    
    const { confirmedBookings, pendingInvitations } = useMemo(() => {
        let data = [...studentBookings];
        if (searchTerm) { const lowercasedFilter = searchTerm.toLowerCase(); data = data.filter(item => { const interviewerName = item.bookedInterviewer ? `${item.bookedInterviewer.user.firstName} ${item.bookedInterviewer.user.lastName}` : ''; return Object.values({ studentName: item.studentName, studentEmail: item.studentEmail, interviewer: interviewerName, userId: item.userId, domain: item.domain, }).some(value => String(value).toLowerCase().includes(lowercasedFilter)); }); }
        if (activeFilters.date) { const filterDate = new Date(activeFilters.date).toDateString(); data = data.filter(item => { if (!item.bookingDate) return false; return new Date(item.bookingDate).toDateString() === filterDate; }); }
        if (activeFilters.invitedOnDate) { const filterInvitedDate = new Date(activeFilters.invitedOnDate).toDateString(); data = data.filter(item => { if (!item.invitationCreatedAt) return false; return new Date(item.invitationCreatedAt).toDateString() === filterInvitedDate; }); }
        if (activeFilters.domain) { data = data.filter(item => item.domain === activeFilters.domain); }
        if (activeFilters.publicId) { data = data.filter(item => item.publicBookingId === activeFilters.publicId); }
        const enhancedData = data.map(booking => ({...booking, invitationCreatedAt: publicBookingCreationDates[booking.publicBookingId] || booking.createdAt || null }));
        const confirmed = [], pending = [];
        enhancedData.forEach(booking => { (booking.bookedInterviewer && !booking.isPending) ? confirmed.push(booking) : pending.push(booking); });
        return { confirmedBookings: confirmed, pendingInvitations: pending };
    }, [studentBookings, searchTerm, activeFilters, publicBookingCreationDates]);

    const fetchPublicBookingDetails = useCallback(async (bookingId) => {
        if (!bookingId || publicBookingDetailsCache[bookingId]) { return; }
        setBookingDetailsLoading(true);
        try {
            const res = await getPublicBookingDetails(bookingId);
            setPublicBookingDetailsCache(prev => ({...prev, [bookingId]: res.data.data}));
        } catch { showError('Failed to load available slots.'); } 
        finally { setBookingDetailsLoading(false); }
    }, [publicBookingDetailsCache, showError]);
    
    useEffect(() => {
        pendingInvitations.forEach(row => { if (row.publicBookingId && !publicBookingDetailsCache[row.publicBookingId]) { fetchPublicBookingDetails(row.publicBookingId); } });
    }, [pendingInvitations, publicBookingDetailsCache, fetchPublicBookingDetails]);

    const handleManualBooking = async (student, bookingInfo) => {
        try {
            await manualBookStudentSlot(student.studentEmail, bookingInfo);
            fetchInitialData();
        } catch(err) {
            showError(err?.response?.data?.message || 'Manual booking failed.');
        }
    };
    
    const paginatedConfirmedBookings = useMemo(() => { const start = (confirmedPagination.currentPage - 1) * confirmedPagination.itemsPerPage; const end = start + confirmedPagination.itemsPerPage; return confirmedBookings.slice(start, end);}, [confirmedBookings, confirmedPagination]);
    const paginatedPendingInvitations = useMemo(() => { const start = (pendingPagination.currentPage - 1) * pendingPagination.itemsPerPage; const end = start + pendingPagination.itemsPerPage; return pendingInvitations.slice(start, end);}, [pendingInvitations, pendingPagination]);
    const handleConfirmedPageChange = (page) => { setConfirmedPagination(prev => ({ ...prev, currentPage: page })); };
    const handlePendingPageChange = (page) => { setPendingPagination(prev => ({ ...prev, currentPage: page })); };
    const handleConfirmedItemsPerPageChange = (e) => { setConfirmedPagination({ currentPage: 1, itemsPerPage: Number(e.target.value) }); };
    const handlePendingItemsPerPageChange = (e) => { setPendingPagination({ currentPage: 1, itemsPerPage: Number(e.target.value) }); };
    const handleApplyFilters = () => { setActiveFilters(tempFilters); setIsFilterMenuOpen(false); };
    const handleClearFilters = () => { setTempFilters({ date: null, domain: '', publicId: '', invitedOnDate: null }); setActiveFilters({ date: null, domain: '', publicId: '', invitedOnDate: null }); setIsFilterMenuOpen(false); };
    const isFilterActive = activeFilters.date || activeFilters.domain || activeFilters.publicId || activeFilters.invitedOnDate;
    const domainOptions = useMemo(() => [{ value: '', label: 'All Domains' }, ...domainsList.map(domain => ({ value: domain.name, label: domain.name }))], [domainsList]);
    
    const handleCellSave = (id, fieldKey, newValue) => {
        setStudentBookings(prev =>
            prev.map(booking => {
                if (booking._id === id) {
                    return { ...booking, [fieldKey]: newValue };
                }
                return booking;
            })
        );
        if (fieldKey === 'hostEmail' && newValue && !hostEmails.includes(newValue)) {
            setHostEmails(prev => [...prev, newValue].sort());
        }
    };
    
    const confirmedColumns = useMemo(() => [
        { key: 'status', title: 'Status', render: () => <StatusBadge status="Booked" /> },
        { key: 'studentName', title: 'Student Name' },
        { key: 'interviewer', title: 'Interviewer', render: row => `${row.bookedInterviewer.user.firstName} ${row.bookedInterviewer.user.lastName}` },
        { key: 'bookingDate', title: 'Interview Date', render: row => formatDate(row.bookingDate) },
        { key: 'slot', title: 'Time Slot', render: row => row.bookedSlot ? `${formatTime(row.bookedSlot.startTime)} - ${formatTime(row.bookedSlot.endTime)}` : '' },
        { key: 'domain', title: 'Domain', minWidth: '150px', render: (row) => <EditableDomainCell booking={row} domainOptions={domainOptions} onSave={handleCellSave} /> },
        { key: 'meet', title: 'Meet Link', render: (row) => row.meetLink ? <a href={row.meetLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Join</a> : <MeetLinkCell booking={row} onLinkGenerated={handleCellSave} /> },
        { key: 'hostEmail', title: 'Host Email', minWidth: '250px', render: (row) => <EditableHostEmail booking={row} hostEmails={hostEmails} onSave={handleCellSave} /> },
        { key: 'eventTitle', title: 'Event Title', minWidth: "250px", render: row => <EditableInputCell booking={row} fieldKey="eventTitle" value={row.eventTitle} onSave={handleCellSave} placeholder={`${row.domain} || ${row.studentName}`} /> },
        { key: 'createdAt', title: 'Submitted Time', render: (row) => formatDateTime(row.createdAt) },
    ], [hostEmails, domainOptions, handleCellSave]);
    
    const pendingColumns = useMemo(() => [
        { key: 'status', title: 'Status', render: () => <StatusBadge status="Pending" /> },
        { key: 'studentName', title: 'Student Name' },
        { key: 'studentEmail', title: 'Email' },
        { key: 'manualBooking', title: 'Manual Booking', minWidth: '400px', render: (row) => <ManualBookingControls row={row} onBooking={(bookingInfo) => handleManualBooking(row, bookingInfo)} publicBookingDetails={publicBookingDetailsCache[row.publicBookingId]} onInterviewerSelect={(email) => handleCellSave(row._id, 'interviewerEmail', email)} /> },
        { key: 'domain', title: 'Domain', minWidth: '150px' },
        { key: 'hostEmail', title: 'Host Email', minWidth: '250px', render: row => <EditableHostEmail booking={row} hostEmails={hostEmails} onSave={handleCellSave} /> },
        { key: 'eventTitle', title: 'Event Title', minWidth: '250px', render: row => <EditableInputCell booking={row} fieldKey="eventTitle" value={row.eventTitle} onSave={handleCellSave} placeholder={row.eventTitle} /> },
        { key: 'interviewerEmail', title: 'Interviewer Email', minWidth: '200px', render: row => row.interviewerEmail || '' },
        { key: 'meet', title: 'Meet Link', minWidth: '120px', render: row => (row.meetLink ? <a href={row.meetLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a> : null) },
        { key: 'hiringName', title: 'Hiring Name', minWidth: '150px', render: row => row.hiringName },
        { key: 'mobileNumber', title: 'Mobile', render: row => row.mobileNumber || '' },
        { key: 'interviewId', title: 'Int ID', minWidth: '120px', render: row => row.interviewId },
        { key: 'userId', title: 'User ID' },
        { key: 'resumeLink', title: 'Resume', render: (row) => row.resumeLink ? <a href={row.resumeLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a> : 'N/A' },
        { key: 'publicLink', title: 'Public Link', render: (row) => row.publicBookingId ? (<a href={`/book/${row.publicBookingId}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-mono text-xs">{row.publicBookingId}</a>) : ('N/A') },
    ], [publicBookingDetailsCache, handleCellSave, handleManualBooking, hostEmails]);

    return (
       <div className="h-full flex flex-col">
            <div className="flex justify-between items-center gap-4 p-4 flex-shrink-0">
                <div className="w-full max-w-sm"><LocalSearchInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..."/></div>
                <div className="relative" ref={filterMenuRef}><LocalButton variant="outline" onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}><FiFilter className="h-4 w-4 mr-2 text-blue-600"/><span className="text-blue-600">Filter</span>{isFilterActive && <span onClick={(e) => { e.stopPropagation(); handleClearFilters(); }} className="ml-2 p-1 rounded-full hover:bg-gray-200"><FiX className="h-3 w-3 text-gray-500" /></span>}</LocalButton>{isFilterMenuOpen && ( <div className="absolute top-full right-0 mt-2 w-[500px] bg-white rounded-md shadow-lg border z-10 p-4"><div className="space-y-4"><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Interview Date</label><DatePicker selected={tempFilters.date} onChange={(date) => setTempFilters(prev => ({ ...prev, date }))} isClearable placeholderText="Select a date" className="w-full p-2 border border-gray-300 rounded-md text-sm"/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Invited On Date</label><DatePicker selected={tempFilters.invitedOnDate} onChange={(date) => setTempFilters(prev => ({ ...prev, invitedOnDate: date }))} isClearable placeholderText="Select a date" className="w-full p-2 border border-gray-300 rounded-md text-sm"/></div></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Domain</label><select value={tempFilters.domain} onChange={(e) => setTempFilters(prev => ({...prev, domain: e.target.value}))} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm bg-white">{domainOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Public ID</label><Select options={publicBookingOptions} value={publicBookingOptions.find(opt => opt.value === tempFilters.publicId) || null} onChange={(selectedOption) => setTempFilters(prev => ({ ...prev, publicId: selectedOption ? selectedOption.value : '' }))} isClearable isSearchable placeholder="Search or select a Public ID..." styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }), control: base => ({...base, fontSize: '0.875rem'}), menu: base => ({...base, fontSize: '0.875rem'})}} menuPortalTarget={document.body} menuPosition={'fixed'} /></div></div><div className="mt-4 pt-4 border-t flex justify-end gap-2"><LocalButton variant="outline" onClick={handleClearFilters} className="!text-xs">Clear</LocalButton><LocalButton variant="primary" onClick={handleApplyFilters} className="!text-xs">Apply</LocalButton></div></div>)}</div>
            </div>
            
            <div className="px-4 border-b border-gray-200 flex-shrink-0">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs"><button onClick={() => setActiveTab('confirmed')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'confirmed' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Confirmed Bookings <span className="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2.5 rounded-full text-xs font-medium">{confirmedBookings.length}</span></button><button onClick={() => setActiveTab('pending')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'pending' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Pending Invitations <span className="ml-2 bg-yellow-100 text-yellow-600 py-0.5 px-2.5 rounded-full text-xs font-medium">{pendingInvitations.length}</span></button></nav>
            </div>

            <div className="flex-grow overflow-hidden flex flex-col">
                {activeTab === 'confirmed' && (
                    <div className="flex-1 overflow-hidden flex flex-col">
                        <div className="flex-1 overflow-auto"><LocalTable columns={confirmedColumns} data={paginatedConfirmedBookings} isLoading={loading} emptyMessage="No students have confirmed their booking yet." emptyIcon={FiUsers} /></div>
                        <PaginationControls currentPage={confirmedPagination.currentPage} totalPages={Math.ceil(confirmedBookings.length / confirmedPagination.itemsPerPage)} onPageChange={handleConfirmedPageChange} totalItems={confirmedBookings.length} itemsPerPage={confirmedPagination.itemsPerPage} onItemsPerPageChange={handleConfirmedItemsPerPageChange} />
                    </div>
                )}
                {activeTab === 'pending' && (
                    <div className="flex-1 overflow-hidden flex flex-col">
                        <div className="flex-1 overflow-auto"><LocalTable columns={pendingColumns} data={paginatedPendingInvitations} isLoading={loading || bookingDetailsLoading} emptyMessage="No pending student invitations." emptyIcon={FiUsers} /></div>
                        <PaginationControls currentPage={pendingPagination.currentPage} totalPages={Math.ceil(pendingInvitations.length / pendingPagination.itemsPerPage)} onPageChange={handlePendingPageChange} totalItems={pendingInvitations.length} itemsPerPage={pendingPagination.itemsPerPage} onItemsPerPageChange={handlePendingItemsPerPageChange} />
                    </div>
                )}
            </div>
       </div>
    );
};

const ConfirmedSlots = () => {
    return (<ConfirmedSlotsView />);
};

export default ConfirmedSlots;
