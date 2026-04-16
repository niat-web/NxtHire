// client/src/pages/interviewer/PaymentDetails.jsx
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAlert } from '@/hooks/useAlert';
import { startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, format } from 'date-fns';
import {
  Clock, Calendar, IndianRupee, Briefcase, TrendingUp,
  ArrowUpRight, ChevronRight, FileText,
} from 'lucide-react';
import { usePaymentHistory } from '@/hooks/useInterviewerQueries';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Loader from '@/components/common/Loader';

const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const PaymentDetails = () => {
  const [activeFilter, setActiveFilter] = useState('This Month');
  const [dateRange, setDateRange] = useState({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
  });
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const filters = ['This Month', 'Last Month', 'Last 6 Months', 'This Year'];

  const handleFilter = (filter) => {
    setActiveFilter(filter);
    setShowCustom(false);
    const now = new Date();
    const ranges = {
      'This Month': [startOfMonth(now), endOfMonth(now)],
      'Last Month': [startOfMonth(subMonths(now, 1)), endOfMonth(subMonths(now, 1))],
      'Last 6 Months': [startOfMonth(subMonths(now, 5)), endOfMonth(now)],
      'This Year': [startOfYear(now), endOfYear(now)],
    };
    const [s, e] = ranges[filter] || ranges['This Month'];
    setDateRange({ startDate: s, endDate: e });
  };

  const applyCustom = () => {
    if (customStart && customEnd) {
      setDateRange({ startDate: new Date(customStart), endDate: new Date(customEnd) });
      setActiveFilter('Custom');
      setShowCustom(false);
    }
  };

  const params = useMemo(() => {
    if (!dateRange.startDate || !dateRange.endDate) return null;
    return { startDate: dateRange.startDate.toISOString(), endDate: dateRange.endDate.toISOString() };
  }, [dateRange]);

  const { data: paymentData = { breakdown: [], totalAmount: 0, totalInterviews: 0 }, isLoading } = usePaymentHistory(
    params, { enabled: !!(dateRange.startDate && dateRange.endDate) }
  );

  const fmt = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

  const dateLabel = dateRange.startDate && dateRange.endDate
    ? `${format(dateRange.startDate, 'MMM d, yyyy')} — ${format(dateRange.endDate, 'MMM d, yyyy')}`
    : '';

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-5xl mx-auto p-6 space-y-5">
        {/* Filter bar */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp}
          className="bg-white rounded-xl border border-gray-100 p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">Time Period</p>
            <p className="text-xs text-gray-400">{dateLabel}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => handleFilter(f)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                  activeFilter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {f}
              </button>
            ))}
            <button
              onClick={() => setShowCustom(!showCustom)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5',
                activeFilter === 'Custom'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              <Calendar size={13} /> Custom
            </button>
          </div>

          {showCustom && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
                <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
                <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <Button onClick={applyCustom} disabled={!customStart || !customEnd} size="sm" className="rounded-lg">
                Apply
              </Button>
            </div>
          )}
        </motion.div>

        {/* Stat cards */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Interviews */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">Total Interviews</p>
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Briefcase size={18} />
              </div>
            </div>
            {isLoading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              <p className="text-3xl font-bold text-gray-900">{paymentData.totalInterviews}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">Completed in selected period</p>
          </div>

          {/* Earnings */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">Total Earnings</p>
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <IndianRupee size={18} />
              </div>
            </div>
            {isLoading ? (
              <Skeleton className="h-9 w-24" />
            ) : (
              <p className="text-3xl font-bold text-gray-900">{fmt(paymentData.totalAmount)}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">Gross amount earned</p>
          </div>
        </motion.div>

        {/* Breakdown table */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp}
          className="bg-white rounded-xl border border-gray-100 overflow-hidden"
        >
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={15} className="text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-900">Earnings Breakdown</h2>
            </div>
            {!isLoading && paymentData.breakdown.length > 0 && (
              <span className="text-xs text-gray-400">{paymentData.breakdown.length} domains</span>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader size="lg" />
            </div>
          ) : paymentData.breakdown.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {paymentData.breakdown.map((row, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Briefcase size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{row.domain}</p>
                      <p className="text-xs text-gray-400">{row.interviewsCompleted} interview{row.interviewsCompleted !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{fmt(row.amount)}</p>
                </div>
              ))}

              {/* Total row */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-gray-50/80">
                <p className="text-sm font-semibold text-gray-700">Total</p>
                <p className="text-sm font-bold text-blue-600">{fmt(paymentData.totalAmount)}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                <Clock size={20} className="text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">No payments found</p>
              <p className="text-xs text-gray-400 max-w-xs">No completed interviews found for the selected period. Try a different time range.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentDetails;
