// client/src/pages/interviewer/InterviewEvaluation.jsx
import React, { useState, useEffect, useMemo, useCallback, Fragment, useRef } from 'react';
import { getAssignedInterviews, updateInterviewStatus } from '@/api/interviewer.api';
import { useAlert } from '@/hooks/useAlert';
import { 
  format as formatDateFns, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  subDays, 
  eachDayOfInterval, 
  isSameDay, 
  getDay,
  isToday 
} from 'date-fns';
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiVideo, 
  FiUser, 
  FiFileText, 
  FiClock, 
  FiX, 
  FiCheckCircle, 
  FiChevronDown, 
  FiCalendar,
  FiRefreshCw
} from 'react-icons/fi';
import { Dialog, Transition, Listbox } from '@headlessui/react';
import { MAIN_SHEET_INTERVIEW_STATUSES } from '@/utils/constants';

// --- SELF-CONTAINED, STYLED UI COMPONENTS ---

const LocalLoader = ({ text = "Loading..." }) => (
  <div className="flex h-full w-full items-center justify-center text-center text-slate-500">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
    <span className="ml-4 font-medium">{text}</span>
  </div>
);

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

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-xl bg-white text-left align-middle shadow-2xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-slate-900 border-b border-slate-200 p-6">
                  Interview Details
                </Dialog.Title>
                <div className="p-6 space-y-4">
                  <div className="flex items-center text-sm"><FiUser className="mr-3 text-slate-500" /><strong className="mr-2 text-slate-600">Candidate:</strong> {interview.candidateName}</div>
                  <div className="flex items-center text-sm"><FiFileText className="mr-3 text-slate-500" /><strong className="mr-2 text-slate-600">Domain:</strong> {interview.techStack}</div>
                  <div className="flex items-center text-sm"><FiClock className="mr-3 text-slate-500" /><strong className="mr-2 text-slate-600">Time:</strong> {interview.interviewTime}</div>
                  {interview.meetingLink && (
                    <div className="flex items-center text-sm">
                      <FiVideo className="mr-3 text-slate-500" /><strong className="mr-2 text-slate-600">Link:</strong> 
                      <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline truncate">{interview.meetingLink}</a>
                    </div>
                  )}
                  <div className='pt-2'>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Update Status:</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm">
                      {MAIN_SHEET_INTERVIEW_STATUSES.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                    </select>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 flex justify-end space-x-3 rounded-b-xl">
                  <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100">Cancel</button>
                  <button type="button" onClick={handleSubmit} className="px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700">Save Changes</button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

const PageHeader = ({ filters, setFilters, domains, onRefresh }) => {
  const statusOptions = MAIN_SHEET_INTERVIEW_STATUSES;
  const domainOptions = domains.map(d => ({ value: d, label: d }));

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
      <div className="flex items-center">
        <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600 mr-4">
          <FiCalendar size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Schedule Management</h1>
          <p className="text-sm text-slate-500">View and manage your interview schedules for candidates</p>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4 sm:mt-0">
        <Listbox value={filters.domain} onChange={(val) => setFilters(f => ({...f, domain: val}))} multiple>
          <div className="relative">
            <Listbox.Button className="relative w-40 cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left text-sm border border-slate-300 shadow-sm">
              <span className="block truncate">{filters.domain.length > 0 ? `${filters.domain.length} domain selected` : 'All Domains'}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"><FiChevronDown className="h-4 w-4 text-slate-400" /></span>
            </Listbox.Button>
            <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
              <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 z-20 focus:outline-none">
                {domainOptions.map((opt) => (<Listbox.Option key={opt.value} value={opt.value} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-indigo-100 text-indigo-900' : 'text-slate-900'}`}>{({ selected }) => (<><span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>{opt.label}</span>{selected ? <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600"><FiCheckCircle className="h-4 w-4" /></span> : null}</>)}</Listbox.Option>))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
        <Listbox value={filters.status} onChange={(val) => setFilters(f => ({...f, status: val}))} multiple>
          <div className="relative">
            <Listbox.Button className="relative w-40 cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left text-sm border border-slate-300 shadow-sm">
              <span className="block truncate">{filters.status.length > 0 ? `${filters.status.length} status selected` : 'All Statuses'}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"><FiChevronDown className="h-4 w-4 text-slate-400" /></span>
            </Listbox.Button>
            <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
              <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 z-20 focus:outline-none">
                {statusOptions.map((opt) => (<Listbox.Option key={opt.value} value={opt.value} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-indigo-100 text-indigo-900' : 'text-slate-900'}`}>{({ selected }) => (<><span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>{opt.label}</span>{selected ? <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600"><FiCheckCircle className="h-4 w-4" /></span> : null}</>)}</Listbox.Option>))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
        <button onClick={onRefresh} className="p-2.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition" title="Refresh interviews"><FiRefreshCw size={16} /></button>
      </div>
    </div>
  );
};

const SubHeader = ({ currentWeekStart, onPrevWeek, onNextWeek, onTodayClick }) => {
  const start = startOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const end = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const yearFormat = start.getFullYear() === end.getFullYear() ? '' : ' yyyy';

  const StatusLegendItem = ({ colorClass, label }) => (<div className="flex items-center"><div className={`w-3 h-3 rounded-full ${colorClass} mr-2`}></div><span className="text-xs text-slate-600">{label}</span></div>);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
      <div className="flex items-center">
        <h3 className="text-lg font-semibold text-slate-800">Week of {formatDateFns(start, `d`)} - {formatDateFns(end, `d MMM${yearFormat}`)}</h3>
        <div className="ml-4 flex items-center gap-1">
          <button onClick={onPrevWeek} className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500" title="Previous week"><FiChevronLeft size={20} /></button>
          <button onClick={onTodayClick} className="px-3 py-1 text-xs font-medium rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200" title="Go to current week">Today</button>
          <button onClick={onNextWeek} className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500" title="Next week"><FiChevronRight size={20} /></button>
        </div>
      </div>
      <div className="flex items-center justify-end gap-x-4 gap-y-2 flex-wrap mt-2 sm:mt-0">
        <StatusLegendItem colorClass="bg-indigo-500" label="Scheduled" /><StatusLegendItem colorClass="bg-green-500" label="Completed" /><StatusLegendItem colorClass="bg-blue-500" label="In Progress" /><StatusLegendItem colorClass="bg-red-500" label="Cancelled" />
      </div>
    </div>
  );
};

const InterviewCard = React.memo(({ interview, position, onEventClick }) => {
  const statusColors = { 'Completed': 'bg-green-500', 'Scheduled': 'bg-indigo-500', 'InProgress': 'bg-blue-500', 'Cancelled': 'bg-red-500' };
  const statusStyle = statusColors[interview.interviewStatus] || 'bg-slate-500';

  const formatTimeForDisplay = (timeStr) => {
      if (!timeStr || !timeStr.includes(':')) return '';
      const [hour, minute] = timeStr.split(':').map(Number);
      return new Date(1970, 0, 1, hour, minute).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };
  
  const [startTimeStr, endTimeStr] = (interview.interviewTime || '').split('-').map(t => t.trim());
  const displayTime = `${formatTimeForDisplay(startTimeStr)} - ${formatTimeForDisplay(endTimeStr)}`;
  
  return (
    <button onClick={() => onEventClick(interview)} className="absolute p-2.5 text-left rounded-lg bg-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 group overflow-hidden" style={{ left: `${position.left}%`, top: `${position.top}px`, width: `${position.width}%`, height: `${position.height}px` }} title={`${interview.candidateName} - ${displayTime}`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${statusStyle}`}></div>
      <p className="font-bold text-xs text-slate-800 truncate pl-2">{interview.candidateName}</p>
      <p className="text-[11px] text-slate-600 truncate pl-2">{interview.techStack}</p>
      <p className="text-[10px] text-slate-500 mt-1 pl-2">{displayTime}</p>
    </button>
  );
});

const CalendarGrid = ({ weekDays, scheduledInterviews, onEventClick }) => {
    const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8 AM to 10 PM
    const rowHeight = 80; // in pixels
  
    return (
      <div className="flex-grow overflow-auto relative bg-white rounded-xl shadow-inner border border-slate-200">
        <div 
            className="grid"
            style={{
                gridTemplateColumns: '60px repeat(7, 1fr)',
                gridTemplateRows: `40px repeat(${hours.length}, ${rowHeight}px)`,
                minWidth: '1000px'
            }}
        >
          {/* Top-left empty cell */}
          <div className="sticky top-0 bg-slate-50 z-20 border-b border-slate-200"></div>

          {/* Day Headers */}
          {weekDays.map(day => (
            <div 
            key={day.toString()} 
            className={`sticky top-0 p-2 text-center text-sm font-medium border-b border-l border-slate-200 ${isToday(day) ? 'bg-indigo-50' : 'bg-slate-50'} z-20`}
          >
            <span className={`font-bold ${isToday(day) ? 'text-indigo-700' : 'text-slate-700'}`}>
              {formatDateFns(day, 'ccc d')}
            </span>
          </div>
          ))}
          
          {/* Time Labels and Grid Cells */}
          {hours.map((hour, hourIndex) => (
              <React.Fragment key={hour}>
                  {/* Time label cell */}
                  <div className="row-start-[--row] text-center border-r border-slate-200 -mt-[10px]" style={{'--row': hourIndex + 2}}>
                     <span className="text-xs text-slate-500 font-semibold bg-white pr-2">{formatDateFns(new Date(0, 0, 0, hour), 'h a')}</span>
                  </div>
                  {/* Grid cells for the row */}
                  {weekDays.map((_, dayIndex) => (
                      <div 
                          key={dayIndex} 
                          className="border-t border-l border-slate-100" 
                          style={{
                              gridRow: hourIndex + 2,
                              gridColumn: dayIndex + 2
                          }}
                      ></div>
                  ))}
              </React.Fragment>
          ))}
          
           {/* Event Cards */}
          {scheduledInterviews.map(({ interview, position }) => (
            <div 
                key={interview._id} 
                className="relative" 
                style={{ 
                    gridColumn: position.column + 2, 
                    gridRow: 2, 
                    marginTop: `${position.top}px`
                }}
            >
                <InterviewCard 
                    interview={interview}
                    position={{...position, top: 0, left: 2, width: 96, height: position.height - 4 }} // Adjust position for relative container
                    onEventClick={onEventClick} 
                />
            </div>
          ))}
        </div>
      </div>
    );
};

const EmptyState = ({ onRefresh }) => (
  <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-md border border-slate-200 p-6">
    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4"><FiCalendar size={32} className="text-slate-400" /></div>
    <h3 className="text-lg font-medium text-slate-900 mb-2">No interviews found</h3>
    <p className="text-sm text-slate-500 text-center mb-4">There are no interviews scheduled for this week that match your filters.</p>
    <button onClick={onRefresh} className="px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700">Refresh Interviews</button>
  </div>
);

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
    if (cleaned.includes('AM') || cleaned.includes('PM')) { const period = cleaned.includes('PM') ? 'PM' : 'AM'; const [timePart] = cleaned.split(period); const [h, m] = timePart.trim().split(':'); hour = parseInt(h, 10); minute = m ? parseInt(m, 10) : 0; if (period === 'PM' && hour !== 12) hour += 12; if (period === 'AM' && hour === 12) hour = 0; }
    else { const [h, m] = cleaned.split(':'); hour = parseInt(h, 10); minute = m ? parseInt(m, 10) : 0; }
    return { hour, minute };
  };
  
  const fetchInterviews = useCallback(async () => { 
    setLoading(true); 
    try { 
      const response = await getAssignedInterviews(); 
      setAllInterviews(response.data.data); 
    } catch (error) { 
      showError('Failed to load your assigned interviews.'); 
      console.error('Error fetching interviews:', error);
    } finally { 
      setLoading(false); 
    }
  }, [showError]);
  
  useEffect(() => { 
    fetchInterviews(); 
  }, [fetchInterviews, retryCount]);
  
  const domains = useMemo(() => 
    [...new Set(allInterviews.map(i => i.techStack).filter(Boolean))], 
    [allInterviews]
  );

  const handleStatusChange = useCallback(async (entryId, newStatus) => {
    try {
      await updateInterviewStatus(entryId, newStatus);
      fetchInterviews(); 
      setSelectedInterview(prev => prev ? {...prev, interviewStatus: newStatus} : null);
      showSuccess('Interview status updated!');
      setIsModalOpen(false);
    } catch (error) { 
      showError('Failed to update status.'); 
      console.error('Error updating status:', error);
    }
  }, [showSuccess, showError, fetchInterviews]);
  
  const scheduledInterviews = useMemo(() => {
    const weekStart = currentWeekStart; 
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 }); 
    const hourHeight = 80; // height of one hour row in px
    
    const filtered = allInterviews.filter(item => {
      if (!item.interviewDate) return false; 
      const interviewDate = new Date(item.interviewDate);
      if (interviewDate < weekStart || interviewDate > weekEnd) return false;
      if (filters.domain.length > 0 && !filters.domain.includes(item.techStack)) return false;
      if (filters.status.length > 0 && !filters.status.includes(item.interviewStatus)) return false;
      return true;
    });
    
    return filtered.map(interview => {
      const interviewDate = new Date(interview.interviewDate); 
      const dayOfWeek = (getDay(interviewDate) + 6) % 7;
      const startTimeStr = (interview.interviewTime || '00:00').split('-')[0].trim();
      const { hour: startHour, minute: startMinute } = parseTime(startTimeStr);
      let durationMinutes = 60;
      if (interview.interviewDuration && interview.interviewDuration.includes('mins')) { 
        durationMinutes = parseInt(interview.interviewDuration.replace(' mins', ''));
      }
      const topOffset = (startHour - 8 + startMinute / 60) * hourHeight;
      const eventHeight = (durationMinutes / 60) * hourHeight;
      return { 
          interview, 
          position: { 
              top: topOffset, 
              height: eventHeight,
              column: dayOfWeek
          } 
      };
    });
  }, [allInterviews, currentWeekStart, filters]);

  const weekDays = useMemo(() => 
    eachDayOfInterval({ 
      start: startOfWeek(currentWeekStart, { weekStartsOn: 1 }), 
      end: endOfWeek(currentWeekStart, { weekStartsOn: 1 }) 
    }), 
    [currentWeekStart]
  );
  
  const handleEventClick = useCallback((interview) => { setSelectedInterview(interview); setIsModalOpen(true); }, []);
  const handleTodayClick = useCallback(() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 })), []);
  const handleRefresh = useCallback(() => setRetryCount(prev => prev + 1), []);

  return (
    <div className="h-full flex flex-col bg-slate-50 p-4 sm:p-6">
      <PageHeader filters={filters} setFilters={setFilters} domains={domains} onRefresh={handleRefresh} />
      <SubHeader currentWeekStart={currentWeekStart} onPrevWeek={() => setCurrentWeekStart(s => subDays(s, 7))} onNextWeek={() => setCurrentWeekStart(s => addDays(s, 7))} onTodayClick={handleTodayClick} />
      {loading ? <div className="flex-grow"><LocalLoader text="Loading Interviews..." /></div> : scheduledInterviews.length > 0 ? <CalendarGrid weekDays={weekDays} scheduledInterviews={scheduledInterviews} onEventClick={handleEventClick} /> : <EmptyState onRefresh={handleRefresh} />}
      <InterviewDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} interview={selectedInterview} onStatusChange={handleStatusChange} />
    </div>
  );
};

export default InterviewEvaluation;
