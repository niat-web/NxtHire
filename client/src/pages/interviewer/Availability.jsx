import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '@/components/common/Modal';
import Textarea from '@/components/common/Textarea';
import { declineBookingRequest } from '@/api/interviewer.api';
import { useAlert } from '@/hooks/useAlert';
import {
  Calendar, Clock, CheckCircle, XCircle, Inbox, Lock,
  AlertCircle, ArrowRight, Users, ClipboardCheck
} from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import { useForm } from 'react-hook-form';
import { subDays, startOfDay } from 'date-fns';
import { useBookingRequests, useInvalidateInterviewer } from '@/hooks/useInterviewerQueries';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import SlotSubmissionModal from '../../components/interviewer/SlotSubmissionModal';

// ─── Decline Modal ──────────────────────────────────────────────────────────
const DeclineModal = ({ isOpen, onClose, onSubmit, request }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Decline — ${formatDate(request.bookingDate)}`} size="md">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Textarea
          label="Reason"
          placeholder="Please provide a reason for not being available..."
          {...register('remarks', { required: 'A reason is required to decline.' })}
          error={errors.remarks?.message}
          rows={3}
          required
        />
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button variant="destructive" type="submit" isLoading={isSubmitting}>Confirm Decline</Button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Stat Card ──────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color = 'indigo' }) => {
  const palette = {
    indigo:  'bg-indigo-50 text-indigo-600',
    amber:   'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    red:     'bg-red-50 text-red-600',
    gray:    'bg-gray-100 text-gray-500',
  };
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', palette[color])}>
          <Icon size={16} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
};

// ─── Status Badge ───────────────────────────────────────────────────────────
const StatusIndicator = ({ req, isExpired, canEdit, onProvide, onDecline }) => {
  if (req.bookingStatus === 'Closed') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 text-gray-500 text-sm font-medium border border-gray-200">
        <Lock size={14} /> Closed
      </div>
    );
  }

  switch (req.status) {
    case 'Submitted':
      if (canEdit) {
        return (
          <Button variant="outline" size="sm" onClick={() => onProvide(req)}
            className="rounded-lg border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300">
            <CheckCircle size={14} className="mr-1.5" /> Submitted
            <span className="ml-1.5 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">Edit</span>
          </Button>
        );
      }
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-sm font-medium border border-emerald-100">
          <CheckCircle size={14} /> Submitted
        </div>
      );

    case 'Not Available':
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100">
          <XCircle size={14} /> Declined
        </div>
      );

    default: // Pending
      if (isExpired) {
        return (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 text-gray-500 text-sm font-medium border border-gray-200">
            <AlertCircle size={14} /> Expired
          </div>
        );
      }
      return (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onDecline(req)}
            className="rounded-lg text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300">
            Decline
          </Button>
          <Button size="sm" onClick={() => onProvide(req)} className="rounded-lg">
            Provide Slots <ArrowRight size={13} className="ml-1" />
          </Button>
        </div>
      );
  }
};

// ─── Main Component ─────────────────────────────────────────────────────────
const Availability = () => {
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();
  const [declineModalState, setDeclineModalState] = useState({ isOpen: false, request: null });
  const [submissionModalState, setSubmissionModalState] = useState({ isOpen: false, request: null });
  const [filter, setFilter] = useState('all');

  const { data: rawRequests, isLoading: loading } = useBookingRequests();
  const { invalidateBookings } = useInvalidateInterviewer();

  const requests = useMemo(() => {
    if (!rawRequests) return [];
    return [...rawRequests].sort((a, b) => {
      if (a.bookingStatus === 'Open' && b.bookingStatus !== 'Open') return -1;
      if (a.bookingStatus !== 'Open' && b.bookingStatus === 'Open') return 1;
      return new Date(b.bookingDate) - new Date(a.bookingDate);
    });
  }, [rawRequests]);

  const today = startOfDay(new Date());
  const yesterday = subDays(today, 1);

  // Stats
  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter(r => r.status === 'Pending' && r.bookingStatus === 'Open' && startOfDay(new Date(r.bookingDate)) >= today).length;
    const submitted = requests.filter(r => r.status === 'Submitted').length;
    const declined = requests.filter(r => r.status === 'Not Available').length;
    return { total, pending, submitted, declined };
  }, [requests, today]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    if (filter === 'all') return requests;
    if (filter === 'pending') return requests.filter(r => r.status === 'Pending' && r.bookingStatus === 'Open' && startOfDay(new Date(r.bookingDate)) >= today);
    if (filter === 'submitted') return requests.filter(r => r.status === 'Submitted');
    if (filter === 'declined') return requests.filter(r => r.status === 'Not Available');
    return requests;
  }, [requests, filter, today]);

  const handleProvideAvailability = (request) => setSubmissionModalState({ isOpen: true, request });
  const handleOpenDeclineModal = (request) => setDeclineModalState({ isOpen: true, request });
  const handleCloseDeclineModal = () => setDeclineModalState({ isOpen: false, request: null });
  const handleCloseSubmissionModal = () => setSubmissionModalState({ isOpen: false, request: null });

  const handleDeclineSubmit = async (data) => {
    try {
      await declineBookingRequest(declineModalState.request.bookingId, data);
      showSuccess('Your unavailability has been noted.');
      handleCloseDeclineModal();
      invalidateBookings();
    } catch { showError("Failed to submit. Please try again."); }
  };

  const handleSuccess = () => {
    handleCloseDeclineModal();
    handleCloseSubmissionModal();
    invalidateBookings();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shrink-0 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Availability Requests</h1>
            <p className="text-xs text-gray-400 mt-0.5">{requests.length} total requests</p>
          </div>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {[
              { id: 'all', label: 'All' },
              { id: 'pending', label: `Pending (${stats.pending})` },
              { id: 'submitted', label: 'Submitted' },
            ].map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className={cn(
                  'px-3 py-1.5 text-xs font-semibold rounded-md transition-all',
                  filter === f.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                )}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Total Requests" value={stats.total} icon={Calendar} color="indigo" />
            <StatCard label="Pending Action" value={stats.pending} icon={Clock} color="amber" />
            <StatCard label="Slots Submitted" value={stats.submitted} icon={CheckCircle} color="emerald" />
            <StatCard label="Declined" value={stats.declined} icon={XCircle} color="red" />
          </div>

          {/* Request List */}
          {filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Inbox className="h-7 w-7 text-gray-300" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                {filter === 'all' ? 'No Requests Yet' : 'No Matching Requests'}
              </h3>
              <p className="text-sm text-gray-500 max-w-xs">
                {filter === 'all'
                  ? 'You have no availability requests at this time.'
                  : 'Try changing the filter above.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRequests.map((req) => {
                const requestDate = startOfDay(new Date(req.bookingDate));
                const isExpired = requestDate < today;
                const canEdit = requestDate >= yesterday;
                const isActionable = req.status === 'Pending' && req.bookingStatus === 'Open' && !isExpired;

                return (
                  <div
                    key={req.bookingId}
                    className={cn(
                      'bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 hover:shadow-md hover:border-gray-200',
                      !isActionable && !canEdit && 'opacity-60'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      {/* Date badge */}
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 border',
                        isActionable ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-gray-50 text-gray-400 border-gray-200'
                      )}>
                        <span className="text-[10px] font-bold uppercase leading-none">
                          {new Date(req.bookingDate).toLocaleString('default', { month: 'short' })}
                        </span>
                        <span className="text-base font-black leading-none">
                          {new Date(req.bookingDate).getDate()}
                        </span>
                      </div>

                      <div>
                        <p className={cn('text-sm font-semibold', isActionable || canEdit ? 'text-gray-900' : 'text-gray-500')}>
                          {formatDate(req.bookingDate)}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {req.bookingStatus === 'Open' ? 'Open request' : 'Closed by admin'}
                        </p>
                      </div>
                    </div>

                    <StatusIndicator
                      req={req}
                      isExpired={isExpired}
                      canEdit={canEdit}
                      onProvide={handleProvideAvailability}
                      onDecline={handleOpenDeclineModal}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {declineModalState.isOpen && (
        <DeclineModal
          isOpen={declineModalState.isOpen}
          onClose={handleCloseDeclineModal}
          onSubmit={handleDeclineSubmit}
          request={declineModalState.request}
        />
      )}
      {submissionModalState.isOpen && (
        <SlotSubmissionModal
          isOpen={submissionModalState.isOpen}
          onClose={handleCloseSubmissionModal}
          request={submissionModalState.request}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default Availability;
