import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '@/components/common/Modal';
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
import Loader from '@/components/common/Loader';
import { Badge } from '@/components/ui/badge';

import SlotSubmissionModal from '../../components/interviewer/SlotSubmissionModal';

// ─── Decline Modal ──────────────────────────────────────────────────────────
const DeclineModal = ({ isOpen, onClose, onSubmit, request }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Decline — ${formatDate(request.bookingDate)}`} size="md">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason<span className="text-red-600 ml-1">*</span></label>
          <textarea
            placeholder="Please provide a reason for not being available..."
            {...register('remarks', { required: 'A reason is required to decline.' })}
            rows={3}
            className={`w-full rounded-lg border ${errors.remarks ? 'border-red-300' : 'border-slate-200'} bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 resize-none`}
          />
          {errors.remarks && <p className="mt-1 text-sm text-red-600">{errors.remarks.message}</p>}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button variant="destructive" type="submit" isLoading={isSubmitting}>Confirm Decline</Button>
        </div>
      </form>
    </Modal>
  );
};

const DISPLAY = { fontFamily: 'Fraunces, Georgia, serif' };

// ─── Stat Card ──────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5">
    <div className="flex items-center justify-between">
      <p className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-[0.2em]">{label}</p>
      <div className="h-9 w-9 rounded-full border border-slate-200 bg-white inline-flex items-center justify-center text-slate-700">
        <Icon size={14} />
      </div>
    </div>
    <p style={DISPLAY} className="text-[28px] font-semibold text-slate-900 tracking-tight leading-none mt-4">{value}</p>
  </div>
);

// ─── Status Badge ───────────────────────────────────────────────────────────
const statusPill = 'inline-flex items-center gap-1.5 rounded-full border px-3 h-8 text-[12px] font-semibold';
const StatusIndicator = ({ req, isExpired, canEdit, onProvide, onDecline }) => {
  if (req.bookingStatus === 'Closed') {
    return (
      <div className={`${statusPill} bg-slate-50 text-slate-600 border-slate-200`}>
        <Lock size={13} /> Closed
      </div>
    );
  }

  switch (req.status) {
    case 'Submitted':
      if (canEdit) {
        return (
          <button onClick={() => onProvide(req)}
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/60 text-emerald-700 hover:bg-emerald-100 px-3 h-8 text-[12px] font-semibold transition-colors">
            <CheckCircle size={13} /> Submitted
            <span className="text-[10px] bg-white text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wide">Edit</span>
          </button>
        );
      }
      return (
        <div className={`${statusPill} bg-emerald-50/60 text-emerald-700 border-emerald-200`}>
          <CheckCircle size={13} /> Submitted
        </div>
      );

    case 'Not Available':
      return (
        <div className={`${statusPill} bg-red-50 text-red-600 border-red-200`}>
          <XCircle size={13} /> Declined
        </div>
      );

    default:
      if (isExpired) {
        return (
          <div className={`${statusPill} bg-slate-50 text-slate-500 border-slate-200`}>
            <AlertCircle size={13} /> Expired
          </div>
        );
      }
      return (
        <div className="flex items-center gap-2">
          <button onClick={() => onDecline(req)} className="inline-flex h-8 items-center rounded-full border border-slate-200 px-3 text-[12px] font-semibold text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors">
            Decline
          </button>
          <button onClick={() => onProvide(req)} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-slate-900 px-3 text-[12px] font-semibold text-white hover:bg-[#FF4800] transition-colors">
            Provide slots <ArrowRight size={12} />
          </button>
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
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#FAFAF9]">
      {/* Hero */}
      <section className="border-b border-slate-200 bg-white px-6 lg:px-10 pt-8 pb-6 shrink-0">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 max-w-7xl w-full mx-auto">
          <div>
            <h1 style={DISPLAY} className="text-[32px] sm:text-[38px] font-semibold text-slate-900 tracking-tight leading-none">Availability requests</h1>
            <p className="mt-2 text-[13.5px] text-slate-500">{requests.length} total</p>
          </div>
          <div className="flex bg-slate-100 rounded-full p-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'pending', label: `Pending (${stats.pending})` },
              { id: 'submitted', label: 'Submitted' },
            ].map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className={cn(
                  'px-4 h-8 text-[12px] font-semibold rounded-full transition-colors',
                  filter === f.id ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-slate-900'
                )}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 lg:px-10 py-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Requests" value={stats.total} icon={Calendar} />
            <StatCard label="Pending Action" value={stats.pending} icon={Clock} />
            <StatCard label="Slots Submitted" value={stats.submitted} icon={CheckCircle} />
            <StatCard label="Declined" value={stats.declined} icon={XCircle} />
          </div>

          {/* Request List */}
          {filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 rounded-full border border-slate-200 bg-white inline-flex items-center justify-center mb-4 text-slate-400">
                <Inbox className="h-5 w-5" />
              </div>
              <h3 style={DISPLAY} className="text-[22px] font-semibold text-slate-900 mb-1 tracking-tight">
                {filter === 'all' ? 'No requests yet' : 'No matching requests'}
              </h3>
              <p className="text-[13px] text-slate-500 max-w-xs">
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
                      'bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:border-slate-900',
                      !isActionable && !canEdit && 'opacity-60'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 border',
                        isActionable ? 'bg-white text-slate-900 border-slate-200' : 'bg-slate-50 text-slate-400 border-slate-200'
                      )}>
                        <span className="text-[10px] font-semibold uppercase leading-none tracking-wide">
                          {new Date(req.bookingDate).toLocaleString('default', { month: 'short' })}
                        </span>
                        <span style={DISPLAY} className="text-[18px] font-semibold leading-none mt-1">
                          {new Date(req.bookingDate).getDate()}
                        </span>
                      </div>

                      <div>
                        <p className={cn('text-[13.5px] font-semibold', isActionable || canEdit ? 'text-slate-900' : 'text-slate-500')}>
                          {formatDate(req.bookingDate)}
                        </p>
                        <p className="text-[12px] text-slate-500 mt-0.5">
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
