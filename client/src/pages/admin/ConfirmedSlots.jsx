// client/src/pages/admin/ConfirmedSlots.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import CreatableSelect from 'react-select/creatable';
import Select from 'react-select';
import { Users, Video, Search, Filter, X, CheckCircle, Clock, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import {
    updateStudentBooking,
    generateGoogleMeetLink,
    manualBookStudentSlot,
    getPublicBookingDetails
} from '@/api/admin.api';
import { useStudentPipeline, useHostEmails, useDomains, usePublicBookings, useInvalidateAdmin } from '@/hooks/useAdminQueries';
import { useAlert } from '@/hooks/useAlert';
import { formatDate, formatTime, formatDateTime } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import Loader from '@/components/common/Loader';

const DISPLAY = { fontFamily: 'Supreme, "Plus Jakarta Sans", system-ui, sans-serif' };
const ACCENT = '#C0392B';

// --- SELF-CONTAINED UI COMPONENTS ---

const LocalSearchInput = ({ value, onChange, placeholder }) => (
    <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/70" aria-hidden="true" />
        <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 h-9 bg-white border border-border rounded-full text-[13px] placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-colors"
        />
    </div>
);

const LocalLoader = () => (
    <div className="flex justify-center items-center py-20">
        <Loader size="lg" />
    </div>
);

const LocalEmptyState = ({ message, icon: Icon }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="inline-flex items-center justify-center h-12 w-12 rounded-full border border-border bg-white text-muted-foreground/70 mb-4">
            <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <h3 style={DISPLAY} className="text-[20px] font-semibold text-foreground tracking-tight">No data found</h3>
        <p className="mt-1 text-[13px] text-muted-foreground max-w-sm">{message}</p>
    </div>
);

const LocalTable = ({ columns, data, isLoading, emptyMessage, emptyIcon }) => (
    <table className="min-w-full bg-white text-[13px]">
        <thead>
            <tr>
                {columns.map(col => (
                    <th key={col.key} scope="col" className="sticky top-0 px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.15em] border-b border-border bg-muted/40 backdrop-blur z-10" style={{ minWidth: col.minWidth }}>
                        {col.title}
                    </th>
                ))}
            </tr>
        </thead>
        <tbody className="divide-y divide-border">
            {isLoading ? (
                <tr><td colSpan={columns.length}><LocalLoader /></td></tr>
            ) : data.length === 0 ? (
                <tr><td colSpan={columns.length}><LocalEmptyState message={emptyMessage} icon={emptyIcon} /></td></tr>
            ) : (
                data.map((row, rowIndex) => (
                    <tr key={row._id || rowIndex} className="hover:bg-muted/30 transition-colors">
                        {columns.map(col => (
                            <td key={col.key} className="px-4 py-2.5 whitespace-nowrap text-foreground/90 align-middle">
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

    return (
        <div className="flex items-center justify-between px-5 lg:px-6 py-2.5 border-t border-border bg-card flex-shrink-0">
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <span>Rows</span>
                <div className="relative">
                    <select value={itemsPerPage} onChange={onItemsPerPageChange}
                        className="appearance-none h-8 pl-3 pr-7 bg-white border border-border rounded-full text-[12px] text-foreground/90 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-colors">
                        {[15, 20, 50, 100].map(size => (<option key={size} value={size}>{size}</option>))}
                    </select>
                </div>
            </div>
            <p className="text-[12px] text-muted-foreground">
                <span className="font-semibold text-foreground">{showingFrom}</span>–<span className="font-semibold text-foreground">{showingTo}</span> of <span className="font-semibold text-foreground">{totalItems}</span>
            </p>
            <div className="flex items-center gap-1">
                <button aria-label="First page" onClick={() => onPageChange(1)} disabled={currentPage === 1}
                    className="h-8 w-8 rounded-full flex items-center justify-center border border-border bg-white text-foreground/80 hover:bg-primary hover:text-white hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-foreground/80 disabled:hover:border-border transition-colors">
                    <ChevronsLeft className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button aria-label="Previous page" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
                    className="h-8 w-8 rounded-full flex items-center justify-center border border-border bg-white text-foreground/80 hover:bg-primary hover:text-white hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-foreground/80 disabled:hover:border-border transition-colors">
                    <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <div className="flex items-center gap-0.5 mx-1">
                    {finalCleanedButtons.map((pageNum, index) => {
                        if (pageNum === '...') return <span key={`ellipsis-${index}`} className="px-1.5 text-[12px] text-muted-foreground/70">…</span>;
                        const active = currentPage === pageNum;
                        return (
                            <button key={pageNum} onClick={() => onPageChange(pageNum)}
                                className={`h-8 min-w-[32px] px-2.5 rounded-full text-[12px] font-semibold transition-colors ${active ? 'text-white bg-primary' : 'text-foreground/90 border border-border bg-white hover:border-primary hover:text-foreground'}`}>
                                {pageNum}
                            </button>
                        );
                    })}
                </div>
                <button aria-label="Next page" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
                    className="h-8 w-8 rounded-full flex items-center justify-center border border-border bg-white text-foreground/80 hover:bg-primary hover:text-white hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-foreground/80 disabled:hover:border-border transition-colors">
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button aria-label="Last page" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}
                    className="h-8 w-8 rounded-full flex items-center justify-center border border-border bg-white text-foreground/80 hover:bg-primary hover:text-white hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-foreground/80 disabled:hover:border-border transition-colors">
                    <ChevronsRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
            </div>
        </div>
    );
};

const EditableDomainCell = ({ booking, domainOptions, onSave }) => {
    const { showSuccess, showError } = useAlert();
    const [currentValue, setCurrentValue] = useState(booking.domain || '');
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => { setCurrentValue(booking.domain || ''); }, [booking.domain]);
    const handleSave = async (newDomain) => { if (newDomain === currentValue) return; setIsLoading(true); setCurrentValue(newDomain); try { await updateStudentBooking(booking._id, { domain: newDomain }); onSave(booking._id, 'domain', newDomain); showSuccess("Domain updated successfully."); } catch (err) { showError("Failed to update domain."); setCurrentValue(booking.domain || ''); } finally { setIsLoading(false); } };
    return (
        <select value={currentValue} onChange={(e) => handleSave(e.target.value)} disabled={isLoading}
            className={`w-full text-[12px] font-semibold px-3 h-8 border border-border rounded-full bg-white text-foreground/90 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary cursor-pointer transition-colors ${isLoading ? 'opacity-50' : ''}`}
            onClick={(e) => e.stopPropagation()}>
            <option value="" disabled>Select domain</option>
            {domainOptions.map(opt => (opt.value && <option key={opt.value} value={opt.value}>{opt.label}</option>))}
        </select>
    );
};

const EditableHostEmail = ({ booking, hostEmails, onSave }) => {
    const [value, setValue] = useState(booking.hostEmail ? { label: booking.hostEmail, value: booking.hostEmail } : null);
    const [isLoading, setIsLoading] = useState(false);
    const { showSuccess, showError } = useAlert();
    const options = hostEmails.map(email => ({ label: email, value: email }));
    const selectStyles = {
        menuPortal: base => ({ ...base, zIndex: 9999 }),
        control: (base, s) => ({ ...base, fontSize: '13px', minHeight: '34px', borderRadius: '9999px', borderColor: s.isFocused ? '#0f172a' : '#e2e8f0', boxShadow: s.isFocused ? '0 0 0 2px rgba(15,23,42,0.1)' : 'none', '&:hover': { borderColor: '#0f172a' } }),
        menu: base => ({ ...base, fontSize: '13px', borderRadius: '16px', overflow: 'hidden' }),
        option: (base, s) => ({ ...base, backgroundColor: s.isSelected ? '#0f172a' : s.isFocused ? '#f8fafc' : 'white', color: s.isSelected ? 'white' : '#0f172a' }),
    };
    
    useEffect(() => {
        setValue(booking.hostEmail ? { label: booking.hostEmail, value: booking.hostEmail } : null);
    }, [booking.hostEmail]);

    const handleSave = async (selectedOption) => {
        const newEmail = selectedOption ? selectedOption.value : '';
        if (newEmail === (booking.hostEmail || '')) return;
        setIsLoading(true);
        try {
            if (booking.isPending) {
                // For pending students, send email in body with a special flag
                await updateStudentBooking('pending', { studentEmail: booking.studentEmail, hostEmail: newEmail });
            } else {
                await updateStudentBooking(booking._id, { hostEmail: newEmail });
            }
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
            let id, payload;
            if (booking.isPending) {
                id = 'pending';
                payload = { studentEmail: booking.studentEmail, [fieldKey]: currentValue.trim() };
            } else {
                id = booking._id;
                payload = { [fieldKey]: currentValue.trim() };
            }
            await updateStudentBooking(id, payload);
            onSave(booking._id, fieldKey, currentValue.trim());
            showSuccess("Field updated successfully.");
        } catch (err) {
            showError(`Failed to update ${fieldKey}.`);
            setCurrentValue(originalValue);
        } finally { setIsLoading(false); }
    };
    return (
        <input type="text" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} onBlur={handleSave} disabled={isLoading} placeholder={placeholder}
            className="w-full h-9 px-4 border border-border rounded-full bg-white text-[13px] placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary disabled:bg-muted/40 transition-colors" />
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
        } finally { setIsLoading(false); }
    };
    return (<Button onClick={handleGenerate} isLoading={isLoading} disabled={!canGenerate} size="xs" title={!canGenerate ? 'All emails and event title are required to generate a link.' : 'Generate Google Meet link'}><Video className="h-3.5 w-3.5 mr-1.5" />Generate</Button>);
};

const StatusBadge = ({ status }) => {
    const statusMap = {
        Booked:  { text: 'Booked',  Icon: CheckCircle, cls: 'border-emerald-200 bg-emerald-50/60 text-emerald-700' },
        Pending: { text: 'Pending', Icon: Clock,       cls: 'border-amber-200 bg-amber-50/60 text-amber-800' },
    };
    const { text, Icon, cls } = statusMap[status] || { text: status, Icon: Clock, cls: 'border-border bg-muted/40 text-foreground/80' };
    return (
        <span className={`inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide px-2.5 py-0.5 rounded-full border ${cls}`}>
            <Icon className="h-3 w-3" aria-hidden="true" /> {text}
        </span>
    );
};

const ManualBookingControls = ({ row, onBooking, publicBookingDetails, onInterviewerSelect }) => {
    const [bookingState, setBookingState] = useState({ date: '', slot: '' });
    const { showError } = useAlert();
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
        } catch (error) {
            // The parent's catch block now handles the error toast.
            // This catch block simply prevents the code from crashing.
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <select value={bookingState.date} onChange={e => setBookingState({ date: e.target.value, slot: '' })}
                className="h-9 px-3 border border-border rounded-full text-[12.5px] text-foreground/90 bg-white w-36 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-colors">
                <option value="">Select date</option>
                {availableDates.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
            <select value={bookingState.slot} onChange={handleSlotChange} disabled={!bookingState.date}
                className="h-9 px-3 border border-border rounded-full text-[12.5px] text-foreground/90 bg-white w-52 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary disabled:bg-muted/40 transition-colors">
                <option value="">Select time & interviewer</option>
                {availableSlotsAndInterviewers.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <Button variant="default" onClick={handleSave} isLoading={isLoading} disabled={!canBook}>Book</Button>
        </div>
    );
};


const ConfirmedSlotsView = () => {
    const { showError, showSuccess } = useAlert();
    const [activeTab, setActiveTab] = useState('confirmed');
    // TanStack Query — cached & persisted, shows instantly on revisit
    const { data: rawPipelineData, isLoading: pipelineLoading } = useStudentPipeline({ staleTime: 30 * 1000 });
    const { data: hostEmailsData } = useHostEmails();
    const { data: domainsData } = useDomains();
    const { data: publicBookingsData } = usePublicBookings();
    const { invalidateStudentPipeline } = useInvalidateAdmin();

    const loading = pipelineLoading;
    const hostEmails = hostEmailsData || [];
    const domainsList = domainsData || [];
    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [tempFilters, setTempFilters] = useState({ date: null, domain: '', publicId: '', invitedOnDate: null });
    const [activeFilters, setActiveFilters] = useState({ date: null, domain: '', publicId: '', invitedOnDate: null });
    const filterMenuRef = useRef(null);
    const [publicBookingDetailsCache, setPublicBookingDetailsCache] = useState({});
    const [confirmedPagination, setConfirmedPagination] = useState({ currentPage: 1, itemsPerPage: 15 });
    const [pendingPagination, setPendingPagination] = useState({ currentPage: 1, itemsPerPage: 15 });
    const [bookingDetailsLoading, setBookingDetailsLoading] = useState(false);

    // Derive processed data from TanStack Query results
    const studentBookings = useMemo(() => {
        if (!rawPipelineData || !domainsData) return [];
        const domainsWithTitles = new Map(domainsData.map(d => [d.name, d.eventTitle]));
        return (rawPipelineData || []).map(p => {
            if (p.isPending && !p.eventTitle) {
                const domainEventTitle = domainsWithTitles.get(p.domain);
                p.eventTitle = domainEventTitle ? `${domainEventTitle} || ${p.studentName}` : `${p.domain || 'Interview'} || ${p.studentName}`;
            }
            return p;
        });
    }, [rawPipelineData, domainsData]);

    const publicBookingOptions = useMemo(() => {
        if (!publicBookingsData) return [];
        return publicBookingsData.map(b => ({ value: b.publicId, label: `ID: ${b.publicId} (Created: ${formatDate(b.createdAt)})` }));
    }, [publicBookingsData]);

    const publicBookingCreationDates = useMemo(() => {
        if (!publicBookingsData) return {};
        return publicBookingsData.reduce((acc, b) => { acc[b.publicId] = b.createdAt; return acc; }, {});
    }, [publicBookingsData]);
    
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
            const payload = {
                ...bookingInfo,
                hostEmail: student.hostEmail,
                eventTitle: student.eventTitle
            };
            await manualBookStudentSlot(student.studentEmail, payload);
            showSuccess('Slot booked manually!');
            invalidateStudentPipeline(); // Refetch data to move the row from pending to confirmed
        } catch(err) {
            showError(err?.response?.data?.message || 'Manual booking failed.');
            throw err; // Re-throw the error so the child component's catch block works
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
        // Data comes from TanStack Query — invalidate to refetch instead of local state update
        invalidateStudentPipeline();
    };
    
    const confirmedColumns = useMemo(() => [
        { key: 'status', title: 'Status', render: () => <StatusBadge status="Booked" /> },
        { key: 'studentName', title: 'Student Name' },
        { key: 'interviewer', title: 'Interviewer', render: row => `${row.bookedInterviewer.user.firstName} ${row.bookedInterviewer.user.lastName}` },
        { key: 'bookingDate', title: 'Interview Date', render: row => formatDate(row.bookingDate) },
        { key: 'slot', title: 'Time Slot', render: row => row.bookedSlot ? `${formatTime(row.bookedSlot.startTime)} - ${formatTime(row.bookedSlot.endTime)}` : '' },
        { key: 'domain', title: 'Domain', minWidth: '150px', render: (row) => <EditableDomainCell booking={row} domainOptions={domainOptions} onSave={handleCellSave} /> },
        { key: 'meet', title: 'Meet Link', render: (row) => row.meetLink ? <a href={row.meetLink} target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline">Join</a> : <MeetLinkCell booking={row} onLinkGenerated={handleCellSave} /> },
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
        { key: 'meet', title: 'Meet Link', minWidth: '120px', render: row => (row.meetLink ? <a href={row.meetLink} target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline">Link</a> : null) },
        { key: 'hiringName', title: 'Hiring Name', minWidth: '150px', render: row => row.hiringName },
        { key: 'mobileNumber', title: 'Mobile', render: row => row.mobileNumber || '' },
        { key: 'interviewId', title: 'Int ID', minWidth: '120px', render: row => row.interviewId },
        { key: 'userId', title: 'User ID' },
        { key: 'resumeLink', title: 'Resume', render: (row) => row.resumeLink ? <a href={row.resumeLink} target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline">Link</a> : 'N/A' },
        { key: 'publicLink', title: 'Public Link', render: (row) => row.publicBookingId ? (<a href={`/book/${row.publicBookingId}`} target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline font-mono text-xs">{row.publicBookingId}</a>) : ('N/A') },
    ], [publicBookingDetailsCache, handleCellSave, handleManualBooking, hostEmails]);

    return (
       <div className="h-full flex flex-col bg-card overflow-hidden">
            {/* Hero + toolbar + tabs — edge-to-edge slab */}
            <section className="bg-card border-b border-border shrink-0">
                <div className="px-5 lg:px-6 pt-3 pb-2">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h1 style={DISPLAY} className="text-[22px] sm:text-[26px] font-semibold text-foreground tracking-tight leading-none">
                                Confirmed slots
                            </h1>
                            <p className="mt-1 text-[12.5px] text-muted-foreground">
                                {confirmedBookings.length} confirmed · {pendingInvitations.length} pending
                            </p>
                        </div>

                        {/* Search + filter aligned top-right */}
                        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                            <div className="w-full sm:w-72"><LocalSearchInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search name, email, domain, interviewer…"/></div>
                            <div className="relative" ref={filterMenuRef}>
                                <button onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                                    className={`h-9 inline-flex items-center gap-2 px-4 text-[13px] font-semibold rounded-full border transition-colors ${isFilterActive ? 'border-primary bg-primary text-white hover:bg-primary/90 hover:border-[#C0392B]' : 'border-border bg-white text-foreground/90 hover:border-primary hover:text-foreground'}`}>
                                    <Filter className="h-3.5 w-3.5" aria-hidden="true" /> Filter
                                    {isFilterActive && (
                                        <span onClick={(e) => { e.stopPropagation(); handleClearFilters(); }} className="ml-0.5 p-0.5 rounded-full hover:bg-white/15" role="button" aria-label="Clear filters">
                                            <X className="h-3 w-3 text-white" aria-hidden="true" />
                                        </span>
                                    )}
                                </button>
                            {isFilterMenuOpen && (
                                <div className="absolute top-full right-0 mt-2 w-[480px] bg-white rounded-2xl shadow-xl border border-border z-50 p-5">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-2">Interview date</label>
                                                <DatePicker selected={tempFilters.date} onChange={(date) => setTempFilters(prev => ({ ...prev, date }))} isClearable placeholderText="Select a date"
                                                    portalId="datepicker-portal" popperClassName="!z-[10000]" popperProps={{ strategy: 'fixed' }}
                                                    className="w-full h-10 px-4 border border-border rounded-full bg-white text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-colors" />
                                            </div>
                                            <div>
                                                <label className="block text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-2">Invited on</label>
                                                <DatePicker selected={tempFilters.invitedOnDate} onChange={(date) => setTempFilters(prev => ({ ...prev, invitedOnDate: date }))} isClearable placeholderText="Select a date"
                                                    portalId="datepicker-portal" popperClassName="!z-[10000]" popperProps={{ strategy: 'fixed' }}
                                                    className="w-full h-10 px-4 border border-border rounded-full bg-white text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-colors" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-2">Domain</label>
                                            <select value={tempFilters.domain} onChange={(e) => setTempFilters(prev => ({...prev, domain: e.target.value}))}
                                                className="w-full h-10 px-4 border border-border rounded-full bg-white text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary cursor-pointer transition-colors">
                                                {domainOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-2">Public ID</label>
                                            <Select options={publicBookingOptions} value={publicBookingOptions.find(opt => opt.value === tempFilters.publicId) || null}
                                                onChange={(selectedOption) => setTempFilters(prev => ({ ...prev, publicId: selectedOption ? selectedOption.value : '' }))}
                                                isClearable isSearchable placeholder="Search or select…"
                                                styles={{
                                                    menuPortal: base => ({ ...base, zIndex: 9999 }),
                                                    control: (base, s) => ({ ...base, fontSize: '13px', minHeight: '40px', borderRadius: '9999px', borderColor: s.isFocused ? '#0f172a' : '#e2e8f0', boxShadow: s.isFocused ? '0 0 0 2px rgba(15,23,42,0.1)' : 'none', '&:hover': { borderColor: '#0f172a' } }),
                                                    menu: base => ({ ...base, fontSize: '13px', borderRadius: '16px', overflow: 'hidden' }),
                                                    option: (base, s) => ({ ...base, backgroundColor: s.isSelected ? '#0f172a' : s.isFocused ? '#f8fafc' : 'white', color: s.isSelected ? 'white' : '#0f172a' }),
                                                }}
                                                menuPortalTarget={document.body} menuPosition={'fixed'} />
                                        </div>
                                    </div>
                                    <div className="mt-5 pt-4 border-t border-border flex justify-end gap-2">
                                        <button onClick={handleClearFilters} className="h-9 px-4 text-[12px] font-semibold text-foreground/90 rounded-full border border-border hover:border-primary hover:text-foreground transition-colors">Clear</button>
                                        <button onClick={handleApplyFilters} className="h-9 px-4 text-[12px] font-semibold text-white rounded-full bg-primary hover:bg-primary/90 transition-colors">Apply</button>
                                    </div>
                                </div>
                            )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-5 lg:px-6">
                    <nav className="-mb-px flex space-x-6">
                        <button onClick={() => setActiveTab('confirmed')}
                            className={`whitespace-nowrap py-3 border-b-2 text-[13px] font-semibold transition-colors ${activeTab === 'confirmed' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-primary/40'}`}>
                            Confirmed
                            <span className={`ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10.5px] font-semibold ${activeTab === 'confirmed' ? 'bg-primary text-white' : 'bg-muted text-foreground/80'}`}>
                                {confirmedBookings.length}
                            </span>
                        </button>
                        <button onClick={() => setActiveTab('pending')}
                            className={`whitespace-nowrap py-3 border-b-2 text-[13px] font-semibold transition-colors ${activeTab === 'pending' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-primary/40'}`}>
                            Pending
                            <span className={`ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10.5px] font-semibold ${activeTab === 'pending' ? 'bg-primary text-white' : 'bg-muted text-foreground/80'}`}>
                                {pendingInvitations.length}
                            </span>
                        </button>
                    </nav>
                </div>
            </section>

            <div className="flex-grow overflow-hidden flex flex-col">
                {activeTab === 'confirmed' && (
                    <div className="flex-1 overflow-hidden flex flex-col">
                        <div className="flex-1 overflow-auto"><LocalTable columns={confirmedColumns} data={paginatedConfirmedBookings} isLoading={loading} emptyMessage="No students have confirmed their booking yet." emptyIcon={Users} /></div>
                        <PaginationControls currentPage={confirmedPagination.currentPage} totalPages={Math.ceil(confirmedBookings.length / confirmedPagination.itemsPerPage)} onPageChange={handleConfirmedPageChange} totalItems={confirmedBookings.length} itemsPerPage={confirmedPagination.itemsPerPage} onItemsPerPageChange={handleConfirmedItemsPerPageChange} />
                    </div>
                )}
                {activeTab === 'pending' && (
                    <div className="flex-1 overflow-hidden flex flex-col">
                        <div className="flex-1 overflow-auto"><LocalTable columns={pendingColumns} data={paginatedPendingInvitations} isLoading={loading || bookingDetailsLoading} emptyMessage="No pending student invitations." emptyIcon={Users} /></div>
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
