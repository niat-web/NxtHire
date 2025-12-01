// client/src/pages/interviewer/InterviewEvaluation.jsx
import React, { useState, useEffect, useMemo, useCallback, Fragment, useRef } from 'react';
import { getAssignedInterviews, updateInterviewStatus } from '../../api/interviewer.api';
import { useAlert } from '../../hooks/useAlert';
import { 
  format as formatDateFns, startOfWeek, endOfWeek, addDays, subDays, 
  eachDayOfInterval, isToday, isSameDay, getDay 
} from 'date-fns';
import { 
  FiChevronLeft, FiChevronRight, FiVideo, FiUser, FiFileText, FiClock, 
  FiX, FiCheckCircle, FiChevronDown, FiCalendar, FiRefreshCw, FiFilter, FiInfo
} from 'react-icons/fi';
import { Dialog, Transition, Listbox } from '@headlessui/react';
import { MAIN_SHEET_INTERVIEW_STATUSES } from '../../utils/constants';

// --- CONSTANTS & CONFIG ---

const STATUS_CONFIG = {
  'Scheduled': { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-700', hover: 'hover:bg-blue-100', dot: 'bg-blue-500' },
  'InProgress': { bg: 'bg-purple-50', border: 'border-purple-500', text: 'text-purple-700', hover: 'hover:bg-purple-100', dot: 'bg-purple-500' },
  'Completed': { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-700', hover: 'hover:bg-green-100', dot: 'bg-green-500' },
  'Cancelled': { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-700', hover: 'hover:bg-red-100', dot: 'bg-red-500' },
  'default': { bg: 'bg-gray-50', border: 'border-gray-400', text: 'text-gray-700', hover: 'hover:bg-gray-100', dot: 'bg-gray-400' }
};

// --- UI COMPONENTS ---

const LocalLoader = () => (
  <div className="flex flex-col h-full w-full items-center justify-center text-center">
    <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4"></div>
    <span className="text-sm font-semibold text-gray-500">Loading Schedule...</span>
  </div>
);

const LocalButton = ({ children, onClick, variant = 'primary', icon: Icon, className = '' }) => {
    const variants = {
        primary: 'bg-gray-900 text-white hover:bg-black border-transparent shadow-sm',
        outline: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
        ghost: 'bg-transparent text-gray-600 hover:bg-gray-100'
    };
    return (
        <button onClick={onClick} className={`inline-flex items-center justify-center px-3 py-2 text-sm font-bold rounded-lg transition-all active:scale-95 border ${variants[variant]} ${className}`}>
            {Icon && <Icon className="mr-2 h-4 w-4" />}
            {children}
        </button>
    );
};

const InterviewDetailsModal = ({ isOpen, onClose, interview, onStatusChange }) => {
  const [status, setStatus] = useState('');
  
  useEffect(() => {
    if (interview) setStatus(interview.interviewStatus || '');
  }, [interview]);

  const handleSubmit = () => {
    if (interview && status !== interview.interviewStatus) {
      onStatusChange(interview._id, status);
    }
  };
  
  if (!interview) return null;

  const config = STATUS_CONFIG[interview.interviewStatus] || STATUS_CONFIG.default;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all border border-gray-100">
                
                {/* Modal Header */}
                <div className={`px-6 py-4 border-b border-gray-100 flex justify-between items-start bg-gray-50/50`}>
                    <div>
                        <Dialog.Title as="h3" className="text-lg font-bold text-gray-900">Interview Details</Dialog.Title>
                        <p className="text-xs text-gray-500 mt-1 font-mono">{interview.interviewId}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${config.bg} ${config.text} border-transparent`}>
                        {interview.interviewStatus}
                    </span>
                </div>

                <div className="p-6 space-y-5">
                  <div className="space-y-4">
                      <div className="flex items-start">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mr-4"><FiUser className="h-5 w-5"/></div>
                          <div>
                              <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Candidate</p>
                              <p className="text-sm font-semibold text-gray-900">{interview.candidateName}</p>
                              <p className="text-xs text-gray-500">{interview.mailId}</p>
                          </div>
                      </div>
                      
                      <div className="flex items-start">
                          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg mr-4"><FiFileText className="h-5 w-5"/></div>
                          <div>
                              <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Domain</p>
                              <p className="text-sm font-semibold text-gray-900">{interview.techStack}</p>
                          </div>
                      </div>

                      <div className="flex items-start">
                          <div className="p-2 bg-orange-50 text-orange-600 rounded-lg mr-4"><FiClock className="h-5 w-5"/></div>
                          <div>
                              <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Timing</p>
                              <p className="text-sm font-semibold text-gray-900">
                                  {formatDateFns(new Date(interview.interviewDate), 'MMMM do, yyyy')}
                              </p>
                              <p className="text-sm text-gray-700">{interview.interviewTime} ({interview.interviewDuration})</p>
                          </div>
                      </div>

                      {interview.meetingLink && (
                        <div className="flex items-start">
                            <div className="p-2 bg-green-50 text-green-600 rounded-lg mr-4"><FiVideo className="h-5 w-5"/></div>
                            <div className="overflow-hidden">
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Meeting Link</p>
                                <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate block">
                                    {interview.meetingLink}
                                </a>
                            </div>
                        </div>
                      )}
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Update Status</label>
                    <div className="relative">
                        <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full pl-3 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none appearance-none cursor-pointer">
                        {MAIN_SHEET_INTERVIEW_STATUSES.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                            <FiChevronDown />
                        </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100 rounded-b-2xl">
                  <LocalButton variant="outline" onClick={onClose}>Close</LocalButton>
                  <LocalButton variant="primary" onClick={handleSubmit}>Save Changes</LocalButton>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// --- SUB COMPONENTS ---

const FilterListbox = ({ value, onChange, options, label, icon: Icon }) => (
    <Listbox value={value} onChange={onChange} multiple>
      <div className="relative">
        <Listbox.Button className="relative w-full sm:w-48 cursor-pointer rounded-lg bg-white py-2 pl-10 pr-10 text-left border border-gray-200 shadow-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><Icon className="h-4 w-4" /></span>
          <span className="block truncate text-sm font-medium text-gray-700">
            {value.length > 0 ? `${value.length} selected` : label}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"><FiChevronDown className="h-4 w-4 text-gray-400" /></span>
        </Listbox.Button>
        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-sm shadow-xl ring-1 ring-black/5 z-50 focus:outline-none">
            {options.map((opt) => (
                <Listbox.Option key={opt.value} value={opt.value} className={({ active }) => `relative cursor-pointer select-none py-2.5 pl-10 pr-4 ${active ? 'bg-gray-50 text-gray-900' : 'text-gray-600'}`}>
                    {({ selected }) => (
                        <>
                            <span className={`block truncate ${selected ? 'font-bold text-gray-900' : 'font-normal'}`}>{opt.label}</span>
                            {selected ? <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-900"><FiCheckCircle className="h-4 w-4" /></span> : null}
                        </>
                    )}
                </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
);

const InterviewCard = React.memo(({ interview, position, onEventClick }) => {
  const config = STATUS_CONFIG[interview.interviewStatus] || STATUS_CONFIG.default;

  const formatTimeForDisplay = (timeStr) => {
      if (!timeStr || !timeStr.includes(':')) return '';
      const [hour, minute] = timeStr.split(':').map(Number);
      return new Date(1970, 0, 1, hour, minute).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };
  
  const [startTimeStr, endTimeStr] = (interview.interviewTime || '').split('-').map(t => t.trim());
  const displayTime = `${formatTimeForDisplay(startTimeStr)} - ${formatTimeForDisplay(endTimeStr)}`;
  
  return (
    <button 
        onClick={() => onEventClick(interview)} 
        className={`absolute inset-x-1 rounded-md border-l-4 ${config.border} ${config.bg} ${config.hover} shadow-sm hover:shadow-md transition-all duration-200 group overflow-hidden text-left flex flex-col justify-center px-2 py-1 z-10`}
        style={{ top: `${position.top}px`, height: `${position.height}px` }}
        title={`${interview.candidateName} (${interview.interviewStatus})`}
    >
      <div className="flex items-center gap-1.5 mb-0.5">
          <p className={`text-xs font-bold truncate ${config.text}`}>{interview.candidateName}</p>
      </div>
      <p className={`text-[10px] truncate opacity-80 ${config.text}`}>{interview.techStack}</p>
      <p className={`text-[9px] font-mono mt-0.5 opacity-70 ${config.text}`}>{displayTime}</p>
    </button>
  );
});

const CalendarGrid = ({ weekDays, scheduledInterviews, onEventClick }) => {
    const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8 AM to 10 PM
    const rowHeight = 70; // Adjusted for better density
  
    return (
      <div className="flex-1 overflow-auto relative bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="grid" style={{ gridTemplateColumns: '60px repeat(7, 1fr)', gridTemplateRows: `50px repeat(${hours.length}, ${rowHeight}px)`, minWidth: '1000px' }}>
          
          {/* Header Corner */}
          <div className="sticky top-0 left-0 bg-white z-30 border-b border-r border-gray-200 flex items-center justify-center">
              <FiClock className="text-gray-300" />
          </div>

          {/* Day Headers */}
          {weekDays.map(day => {
            const isCurrentDay = isToday(day);
            return (
                <div key={day.toString()} className={`sticky top-0 p-3 text-center border-b border-r border-gray-100 bg-white/95 backdrop-blur-sm z-20 flex flex-col justify-center ${isCurrentDay ? 'bg-blue-50/50' : ''}`}>
                    <span className={`text-xs font-bold uppercase tracking-wider ${isCurrentDay ? 'text-blue-600' : 'text-gray-400'}`}>{formatDateFns(day, 'EEE')}</span>
                    <div className={`mx-auto w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold mt-1 ${isCurrentDay ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-900'}`}>
                        {formatDateFns(day, 'd')}
                    </div>
                </div>
            )
          })}
          
          {/* Grid Body */}
          {hours.map((hour, hourIndex) => (
              <React.Fragment key={hour}>
                  {/* Time Label */}
                  <div className="row-start-[--row] text-right pr-3 pt-2 text-xs font-bold text-gray-400 border-r border-gray-100 bg-white sticky left-0 z-10" style={{'--row': hourIndex + 2}}>
                     {formatDateFns(new Date(0, 0, 0, hour), 'h a')}
                  </div>
                  
                  {/* Grid Cells */}
                  {weekDays.map((_, dayIndex) => (
                      <div key={dayIndex} className="border-b border-r border-gray-100 relative hover:bg-gray-50/30 transition-colors" style={{ gridRow: hourIndex + 2, gridColumn: dayIndex + 2 }}>
                          {/* Half-hour guide line */}
                          <div className="absolute top-1/2 w-full border-t border-gray-50 border-dashed"></div>
                      </div>
                  ))}
              </React.Fragment>
          ))}
          
           {/* Event Cards Placement */}
          {scheduledInterviews.map(({ interview, position }) => (
            <div key={interview._id} className="relative" style={{ gridColumn: position.column + 2, gridRow: 2 }}>
                <InterviewCard interview={interview} position={position} onEventClick={onEventClick} />
            </div>
          ))}
        </div>
      </div>
    );
};

const EmptyState = ({ onRefresh }) => (
  <div className="flex flex-col items-center justify-center h-full bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center">
    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
        <FiCalendar size={36} className="text-gray-300" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">No Interviews Scheduled</h3>
    <p className="text-gray-500 max-w-xs mb-6">There are no interviews scheduled for this week matching your current filters.</p>
    <LocalButton variant="primary" onClick={onRefresh} icon={FiRefreshCw}>Refresh Schedule</LocalButton>
  </div>
);

// --- MAIN PAGE COMPONENT ---

const InterviewEvaluation = () => {
  const [allInterviews, setAllInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useAlert();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [filters, setFilters] = useState({ domain: [], status: [] });
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const parseTime = (timeStr) => {
    if (!timeStr) return { hour: 0, minute: 0 };
    const cleaned = timeStr.trim().toUpperCase(); let hour, minute;
    if (cleaned.includes('AM') || cleaned.includes('PM')) { 
        const period = cleaned.includes('PM') ? 'PM' : 'AM'; 
        const [timePart] = cleaned.split(period); 
        const [h, m] = timePart.trim().split(':'); 
        hour = parseInt(h, 10); minute = m ? parseInt(m, 10) : 0; 
        if (period === 'PM' && hour !== 12) hour += 12; 
        if (period === 'AM' && hour === 12) hour = 0; 
    } else { 
        const [h, m] = cleaned.split(':'); hour = parseInt(h, 10); minute = m ? parseInt(m, 10) : 0; 
    }
    return { hour, minute };
  };
  
  const fetchInterviews = useCallback(async () => { 
    setLoading(true); 
    try { 
      const response = await getAssignedInterviews(); 
      setAllInterviews(response.data.data); 
    } catch (error) { 
      showError('Failed to load interviews.'); 
    } finally { 
      setLoading(false); 
    }
  }, [showError]);
  
  useEffect(() => { fetchInterviews(); }, [fetchInterviews, retryCount]);
  
  const domains = useMemo(() => [...new Set(allInterviews.map(i => i.techStack).filter(Boolean))], [allInterviews]);

  const handleStatusChange = useCallback(async (entryId, newStatus) => {
    try {
      await updateInterviewStatus(entryId, newStatus);
      fetchInterviews(); 
      setSelectedInterview(prev => prev ? {...prev, interviewStatus: newStatus} : null);
      showSuccess('Status updated successfully!');
      setIsModalOpen(false);
    } catch (error) { 
      showError('Failed to update status.'); 
    }
  }, [showSuccess, showError, fetchInterviews]);
  
  const scheduledInterviews = useMemo(() => {
    const weekStart = currentWeekStart; 
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 }); 
    const hourHeight = 70; // Must match rowHeight in Grid
    
    return allInterviews
        .filter(item => {
            if (!item.interviewDate) return false; 
            const interviewDate = new Date(item.interviewDate);
            if (interviewDate < weekStart || interviewDate > weekEnd) return false;
            if (filters.domain.length > 0 && !filters.domain.includes(item.techStack)) return false;
            if (filters.status.length > 0 && !filters.status.includes(item.interviewStatus)) return false;
            return true;
        })
        .map(interview => {
            const interviewDate = new Date(interview.interviewDate); 
            const dayOfWeek = (getDay(interviewDate) + 6) % 7; // Shift to Monday start
            const startTimeStr = (interview.interviewTime || '00:00').split('-')[0].trim();
            const { hour: startHour, minute: startMinute } = parseTime(startTimeStr);
            
            let durationMinutes = 60;
            if (interview.interviewDuration?.includes('mins')) durationMinutes = parseInt(interview.interviewDuration.replace(' mins', ''));
            
            // Calculate top position based on start time (8 AM start offset)
            const topOffset = (startHour - 8 + startMinute / 60) * hourHeight;
            const eventHeight = (durationMinutes / 60) * hourHeight;
            
            return { interview, position: { top: topOffset, height: eventHeight, column: dayOfWeek } };
        });
  }, [allInterviews, currentWeekStart, filters]);

  const weekDays = useMemo(() => eachDayOfInterval({ start: startOfWeek(currentWeekStart, { weekStartsOn: 1 }), end: endOfWeek(currentWeekStart, { weekStartsOn: 1 }) }), [currentWeekStart]);
  
  const handleEventClick = useCallback((interview) => { setSelectedInterview(interview); setIsModalOpen(true); }, []);
  const handleRefresh = useCallback(() => setRetryCount(prev => prev + 1), []);

  return (
    <div className="flex flex-col h-full bg-[#F5F7F9] overflow-hidden">
        
        {/* --- TOP HEADER & CONTROLS --- */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0 flex flex-col lg:flex-row lg:items-center justify-between gap-4 z-40 shadow-sm">
            
            {/* Title & Week Navigation */}
            <div className="flex items-center justify-between lg:justify-start w-full lg:w-auto">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <FiCalendar className="text-gray-400"/> Schedule
                    </h1>
                    <div className="flex items-center mt-1 space-x-2">
                        <span className="text-sm font-medium text-gray-600">
                            {formatDateFns(weekDays[0], 'MMM d')} - {formatDateFns(weekDays[6], 'MMM d, yyyy')}
                        </span>
                        <div className="flex bg-gray-100 rounded-lg p-0.5 ml-2">
                            <button onClick={() => setCurrentWeekStart(s => subDays(s, 7))} className="p-1 rounded-md hover:bg-white hover:shadow-sm text-gray-500 hover:text-gray-900"><FiChevronLeft /></button>
                            <button onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))} className="px-2 py-0.5 text-xs font-bold text-gray-600 hover:text-gray-900">Today</button>
                            <button onClick={() => setCurrentWeekStart(s => addDays(s, 7))} className="p-1 rounded-md hover:bg-white hover:shadow-sm text-gray-500 hover:text-gray-900"><FiChevronRight /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                <FilterListbox label="All Domains" icon={FiFileText} value={filters.domain} options={domains.map(d => ({ value: d, label: d }))} onChange={(v) => setFilters(p => ({ ...p, domain: v }))} />
                <FilterListbox label="All Statuses" icon={FiFilter} value={filters.status} options={MAIN_SHEET_INTERVIEW_STATUSES} onChange={(v) => setFilters(p => ({ ...p, status: v }))} />
                <LocalButton variant="outline" onClick={handleRefresh} icon={FiRefreshCw} className="hidden sm:inline-flex">Refresh</LocalButton>
            </div>
        </div>

        {/* --- MAIN CALENDAR AREA --- */}
        <div className="flex-1 overflow-hidden p-4 sm:p-6 flex flex-col">
            {loading ? (
                <LocalLoader />
            ) : scheduledInterviews.length > 0 ? (
                <CalendarGrid weekDays={weekDays} scheduledInterviews={scheduledInterviews} onEventClick={handleEventClick} />
            ) : (
                <EmptyState onRefresh={handleRefresh} />
            )}
        </div>

        {/* --- LEGEND FOOTER --- */}
        <div className="bg-white border-t border-gray-200 px-6 py-2 flex-shrink-0 flex items-center gap-6 text-xs text-gray-500 overflow-x-auto">
            <span className="font-bold uppercase tracking-wide mr-2">Legend:</span>
            {Object.entries(STATUS_CONFIG).filter(([k]) => k !== 'default').map(([key, config]) => (
                <div key={key} className="flex items-center whitespace-nowrap">
                    <span className={`w-2.5 h-2.5 rounded-full ${config.dot} mr-2`}></span>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
            ))}
        </div>

        <InterviewDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} interview={selectedInterview} onStatusChange={handleStatusChange} />
    </div>
  );
};

export default InterviewEvaluation;
