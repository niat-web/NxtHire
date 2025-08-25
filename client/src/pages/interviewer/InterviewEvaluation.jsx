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

// --- SELF-CONTAINED UI COMPONENTS for the Calendar View ---

const LocalLoader = ({ text = "Loading..." }) => (
  <div className="flex h-full w-full items-center justify-center text-center text-gray-500">
    <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin"></div>
    <span className="ml-4">{text}</span>
  </div>
);

const InterviewDetailsModal = ({ isOpen, onClose, interview, onStatusChange }) => {
  const [status, setStatus] = useState('');
  
  useEffect(() => {
    if (interview) {
      setStatus(interview.interviewStatus || '');
    }
  }, [interview]);
  
  const handleStatusChange = (value) => {
    setStatus(value);
  };
  
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
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900 border-b pb-4">
                  Interview Details
                </Dialog.Title>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center">
                    <FiUser className="mr-3 text-gray-500" />
                    <strong className="mr-2">Candidate:</strong> {interview.candidateName}
                  </div>
                  <div className="flex items-center">
                    <FiFileText className="mr-3 text-gray-500" />
                    <strong className="mr-2">Domain:</strong> {interview.techStack}
                  </div>
                  <div className="flex items-center">
                    <FiClock className="mr-3 text-gray-500" />
                    <strong className="mr-2">Time:</strong> {`${interview.interviewTime}`}
                  </div>
                  {interview.meetingLink && (
                    <div className="flex items-center">
                      <FiVideo className="mr-3 text-gray-500" />
                      <strong className="mr-2">Link:</strong> 
                      <a 
                        href={interview.meetingLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-indigo-600 hover:underline truncate"
                      >
                        {interview.meetingLink}
                      </a>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Update Status:
                    </label>
                    <select 
                      value={status} 
                      onChange={(e) => handleStatusChange(e.target.value)} 
                      className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {MAIN_SHEET_INTERVIEW_STATUSES.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button 
                    type="button" 
                    onClick={onClose} 
                    className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    onClick={handleSubmit} 
                    className="px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Save Changes
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// --- NEW: Header section with Schedule Management title and filters ---
const PageHeader = ({ filters, setFilters, domains, onRefresh }) => {
  const statusOptions = MAIN_SHEET_INTERVIEW_STATUSES;
  
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
      <div className="flex items-center">
        <div className="p-3 bg-red-100 rounded-lg text-red-600 mr-4">
          <FiCalendar size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Schedule Management</h1>
          <p className="text-sm text-gray-500">Create and manage interview schedules for your candidates</p>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4 sm:mt-0">
        <select 
          value={filters.domain} 
          onChange={(e) => setFilters(f => ({...f, domain: e.target.value}))} 
          className="w-40 text-sm form-select rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
        >
          <option value="">All Domains</option>
          {domains.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <Listbox value={filters.status} onChange={(val) => setFilters(f => ({...f, status: val}))} multiple>
          <div className="relative">
            <Listbox.Button className="relative w-40 cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left text-sm border border-gray-300 shadow-sm">
              <span className="block truncate">
                {filters.status.length > 0 ? `${filters.status.length} status selected` : 'All Statuses'}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <FiChevronDown className="h-4 w-4 text-gray-400" />
              </span>
            </Listbox.Button>
            <Transition 
              as={Fragment} 
              leave="transition ease-in duration-100" 
              leaveFrom="opacity-100" 
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 z-20 focus:outline-none">
                {statusOptions.map((opt) => (
                  <Listbox.Option 
                    key={opt.value} 
                    value={opt.value} 
                    className={({ active }) => 
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'
                      }`
                    }
                  >
                    {({ selected }) => (
                      <>
                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                          {opt.label}
                        </span>
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                            <FiCheckCircle className="h-4 w-4" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
        <button 
          onClick={onRefresh}
          className="p-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
          title="Refresh interviews"
        >
          <FiRefreshCw size={16} />
        </button>
      </div>
    </div>
  );
};

// --- NEW: Sub-header with week navigation and legend ---
const SubHeader = ({ currentWeekStart, onPrevWeek, onNextWeek, onTodayClick }) => {
  const start = currentWeekStart;
  const end = endOfWeek(start);
  const yearFormat = start.getFullYear() === end.getFullYear() ? '' : ' yyyy';

  const StatusLegendItem = ({ colorClass, label }) => (
    <div className="flex items-center">
      <div className={`w-3 h-3 rounded-full ${colorClass} mr-1.5`}></div>
      <span className="text-xs text-gray-600">{label}</span>
    </div>
  );

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
      <div className="flex items-center">
        <h3 className="text-lg font-semibold text-gray-800">
          Week of {formatDateFns(start, `d'th' MMM`)} to {formatDateFns(end, `d'th' MMM${yearFormat}`)}
        </h3>
        <div className="ml-4 flex items-center gap-1">
          <button 
            onClick={onPrevWeek} 
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500"
            title="Previous week"
          >
            <FiChevronLeft size={20} />
          </button>
          <button 
            onClick={onTodayClick}
            className="px-3 py-1 text-xs font-medium rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
            title="Go to current week"
          >
            Today
          </button>
          <button 
            onClick={onNextWeek} 
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500"
            title="Next week"
          >
            <FiChevronRight size={20} />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-end gap-x-4 gap-y-2 flex-wrap mt-2 sm:mt-0">
        <StatusLegendItem colorClass="bg-indigo-500" label="Scheduled" />
        <StatusLegendItem colorClass="bg-green-500" label="Completed" />
        <StatusLegendItem colorClass="bg-blue-500" label="In Progress" />
        <StatusLegendItem colorClass="bg-red-500" label="Cancelled" />
      </div>
    </div>
  );
};

const InterviewCard = React.memo(({ interview, position, onEventClick }) => {
  const statusColors = {
    'Completed': { bg: 'bg-green-100', border: 'border-l-4 border-green-500', text: 'text-green-800' },
    'Scheduled': { bg: 'bg-indigo-100', border: 'border-l-4 border-indigo-500', text: 'text-indigo-800' },
    'InProgress': { bg: 'bg-blue-100', border: 'border-l-4 border-blue-500', text: 'text-blue-800' },
    'Cancelled': { bg: 'bg-red-100', border: 'border-l-4 border-red-500', text: 'text-red-800' },
  };
  
  const style = { 
    left: `${position.left}%`, 
    top: `${position.top}px`, 
    width: `${position.width}%`, 
    height: `${position.height}px` 
  };
  
  const statusStyle = statusColors[interview.interviewStatus] || { 
    bg: 'bg-gray-100', 
    border: 'border-l-4 border-gray-500', 
    text: 'text-gray-800' 
  };
  
  return (
    <button 
      onClick={() => onEventClick(interview)} 
      className={`absolute p-2 text-left rounded-lg shadow-sm transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg hover:z-20 ${statusStyle.bg} ${statusStyle.border}`} 
      style={style}
      title={`${interview.candidateName} - ${interview.techStack} - ${interview.interviewTime}`}
    >
      <p className={`font-bold text-xs truncate ${statusStyle.text}`}>
        {interview.candidateName}
      </p>
      <p className={`text-[11px] text-gray-600 truncate`}>
        {interview.techStack}
      </p>
      <p className={`text-[10px] text-gray-500 mt-1`}>
        {interview.interviewTime}
      </p>
    </button>
  );
});

const CalendarGrid = ({ weekDays, scheduledInterviews, onEventClick }) => {
  const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 8 AM to 6 PM
  
  return (
    <div className="flex-grow overflow-auto relative bg-white rounded-xl shadow-md border border-gray-200">
      <div className="grid grid-cols-[100px_1fr] h-full" style={{minWidth: '1000px'}}>
        <div className="grid grid-rows-[3.5rem_repeat(11,_5rem)]">
          <div className="sticky top-0 bg-white z-10 p-2 text-center text-sm font-semibold border-b border-r border-gray-200 flex items-center justify-center">
            Time
          </div>
          {hours.map(hour => (
            <div key={hour} className="relative text-center py-2 border-r border-b border-gray-100 px-4">
              <span className="text-sm text-gray-500 font-semibold">
                {formatDateFns(new Date(0, 0, 0, hour), 'h:mm a')}
              </span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 relative">
          {weekDays.map(day => (
            <div 
              key={day.toString()} 
              className={`sticky top-0 p-2 text-center text-sm font-medium border-b border-r border-gray-200 ${isToday(day) ? 'bg-indigo-50/70' : 'bg-gray-50/70'} backdrop-blur-sm z-10 h-[56px]`}
            >
              <span className="text-gray-500 font-semibold">{formatDateFns(day, 'ccc')}</span> <br />
              <span className={`text-lg font-bold ${isToday(day) ? 'text-indigo-700' : 'text-gray-700'}`}>
                {formatDateFns(day, 'd')}
              </span>
            </div>
          ))}
          {hours.map(hour => (
            <div key={`line-${hour}`} className="col-span-7 h-20 border-b border-gray-100"></div>
          ))}
          {scheduledInterviews.map(({ interview, position }) => (
            <InterviewCard 
              key={interview._id} 
              interview={interview} 
              position={position} 
              onEventClick={onEventClick} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ onRefresh }) => (
  <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-md border border-gray-200 p-6">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <FiCalendar size={32} className="text-gray-400" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews found</h3>
    <p className="text-sm text-gray-500 text-center mb-4">
      There are no interviews scheduled for this week that match your filters.
    </p>
    <button 
      onClick={onRefresh}
      className="px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
    >
      Refresh Interviews
    </button>
  </div>
);

const InterviewEvaluation = () => {
  const [allInterviews, setAllInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useAlert();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [filters, setFilters] = useState({ domain: '', status: [] });
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
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
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 }); 
    const hourHeight = 80; // 5rem
    
    const filtered = allInterviews.filter(item => {
      if (!item.interviewDate) return false; 
      const interviewDate = new Date(item.interviewDate);
      
      if (interviewDate < weekStart || interviewDate > weekEnd) return false;
      if (filters.domain && item.techStack !== filters.domain) return false;
      if (filters.status.length > 0 && !filters.status.includes(item.interviewStatus)) return false;
      
      return true;
    });
    
    return filtered.map(interview => {
      const interviewDate = new Date(interview.interviewDate); 
      const dayOfWeek = getDay(interviewDate);
      
      const [startHourStr, startMinuteStr] = interview.interviewTime.split(' ')[0].split(':');
      let startHour = parseInt(startHourStr, 10);
      if(interview.interviewTime.includes('PM') && startHour !== 12) startHour += 12;
      if(interview.interviewTime.includes('AM') && startHour === 12) startHour = 0;
      
      const startMinute = parseInt(startMinuteStr, 10);
      let durationMinutes = 60;
      if (interview.interviewDuration && interview.interviewDuration.includes('mins')) { 
        durationMinutes = parseInt(interview.interviewDuration.replace(' mins', ''));
      }
      
      const topOffset = (startHour - 8 + startMinute / 60) * hourHeight; 
      const eventHeight = (durationMinutes / 60) * hourHeight;
      const columnWidth = 100 / 7;
      
      return { 
        interview, 
        position: { 
          top: topOffset, 
          height: eventHeight - 4, 
          left: dayOfWeek * columnWidth + 0.5, 
          width: columnWidth - 1 
        } 
      };
    });
  }, [allInterviews, currentWeekStart, filters]);

  const weekDays = useMemo(() => 
    eachDayOfInterval({ 
      start: currentWeekStart, 
      end: endOfWeek(currentWeekStart, { weekStartsOn: 0 }) 
    }), 
    [currentWeekStart]
  );
  
  const handleEventClick = useCallback((interview) => { 
    setSelectedInterview(interview); 
    setIsModalOpen(true); 
  }, []);
  
  const handleTodayClick = useCallback(() => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }));
  }, []);
  
  const handleRefresh = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  return (
    <div className="h-full flex flex-col bg-gray-50 p-4 sm:p-6">
      <PageHeader 
        filters={filters} 
        setFilters={setFilters} 
        domains={domains} 
        onRefresh={handleRefresh}
      />
      
      <SubHeader 
        currentWeekStart={currentWeekStart} 
        onPrevWeek={() => setCurrentWeekStart(s => subDays(s, 7))} 
        onNextWeek={() => setCurrentWeekStart(s => addDays(s, 7))} 
        onTodayClick={handleTodayClick}
      />
      
      {loading ? (
        <div className="flex-grow">
          <LocalLoader text="Loading Interviews..." />
        </div>
      ) : scheduledInterviews.length > 0 ? (
        <CalendarGrid 
          weekDays={weekDays} 
          scheduledInterviews={scheduledInterviews} 
          onEventClick={handleEventClick} 
        />
      ) : (
        <EmptyState onRefresh={handleRefresh} />
      )}
      
      <InterviewDetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        interview={selectedInterview} 
        onStatusChange={handleStatusChange} 
      />
    </div>
  );
};

export default InterviewEvaluation;