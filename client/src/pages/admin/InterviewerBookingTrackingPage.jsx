import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, Clock } from 'lucide-react';
import Loader from '@/components/common/Loader';
import { useInterviewBookingDetails } from '@/hooks/useAdminQueries';
import { useAlert } from '@/hooks/useAlert';
import { formatDate } from '@/utils/formatters';

const DISPLAY = { fontFamily: 'Supreme, "Plus Jakarta Sans", system-ui, sans-serif' };
const ACCENT = '#C0392B';

// Editorial status pill — semantic colors only, outlined style.
const StatusBadge = ({ status }) => {
    const map = {
        Submitted: { label: 'Available',  cls: 'border-emerald-200 bg-emerald-50/60 text-emerald-700', Icon: CheckCircle2 },
        Available: { label: 'Available',  cls: 'border-emerald-200 bg-emerald-50/60 text-emerald-700', Icon: CheckCircle2 },
        'Not Available': { label: 'Declined', cls: 'border-red-200 bg-red-50 text-red-700', Icon: XCircle },
        Pending: { label: 'Pending', cls: 'border-amber-200 bg-amber-50/60 text-amber-800', Icon: Clock },
    };
    const m = map[status] || { label: status, cls: 'border-border bg-muted/40 text-foreground/80', Icon: Clock };
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide ${m.cls}`}>
            <m.Icon className="h-3 w-3" aria-hidden="true" /> {m.label}
        </span>
    );
};

const InterviewerBookingTrackingPage = () => {
    const { id } = useParams();
    const { showError } = useAlert();
    const { data: bookingDetails, isLoading: loading } = useInterviewBookingDetails(id, {
        onError: () => showError('Failed to fetch booking tracking details.'),
    });

    const interviewers = bookingDetails?.interviewers || [];

    // Summary counts for the hero meta.
    const counts = useMemo(() => {
        let available = 0, declined = 0, pending = 0;
        interviewers.forEach(row => {
            if (row.status === 'Submitted') available++;
            else if (row.status === 'Not Available') declined++;
            else pending++;
        });
        return { available, declined, pending, total: interviewers.length };
    }, [interviewers]);

    const bookingDate = bookingDetails?.bookingDate ? formatDate(bookingDetails.bookingDate) : '';

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center bg-[#fcfaf8]">
                <Loader size="lg" />
            </div>
        );
    }

    const columns = [
        { key: 'interviewerId', title: 'Interviewer ID', render: (row) => (
            <span className="font-mono text-[12px] text-muted-foreground">{row.interviewer?.interviewerId || '—'}</span>
        ) },
        { key: 'name', title: 'Interviewer', render: (row) => (
            <span className="font-semibold text-foreground">{row.interviewer?.user.firstName} {row.interviewer?.user.lastName}</span>
        ) },
        { key: 'email', title: 'Email', render: (row) => <span className="text-foreground/80">{row.interviewer?.user.email}</span> },
        { key: 'status', title: 'Provided status', render: (row) => <StatusBadge status={row.status} /> },
        { key: 'remarks', title: 'Remarks', render: (row) => (
            <div className="max-w-md text-foreground/90 whitespace-normal break-words">
                {row.remarks || <span className="text-muted-foreground/40">—</span>}
            </div>
        ) },
    ];

    return (
        <div className="min-h-full bg-[#fcfaf8]">
            {/* Hero */}
            <section className="border-b border-border bg-white px-6 lg:px-10 pt-6 pb-6">
                <Link
                    to="/admin/bookings/interviewer-bookings"
                    className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-foreground/90 hover:text-[#C0392B] transition-colors"
                >
                    <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back to bookings
                </Link>

                <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-foreground/80">
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ACCENT }} />
                            Admin · Tracking
                        </span>
                        <h1 style={DISPLAY} className="mt-4 text-[28px] sm:text-[34px] font-semibold text-foreground tracking-tight leading-none">
                            Booking tracking
                        </h1>
                        {bookingDate && (
                            <p className="mt-2 text-[13.5px] text-muted-foreground">
                                Interview date <span className="font-semibold text-foreground">{bookingDate}</span> · {counts.total} interviewers notified
                            </p>
                        )}
                    </div>

                    {/* Summary chips */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-emerald-200 bg-emerald-50/60 text-emerald-700 text-[12px] font-semibold">
                            <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> {counts.available} available
                        </span>
                        <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-red-200 bg-red-50 text-red-700 text-[12px] font-semibold">
                            <XCircle className="h-3 w-3" aria-hidden="true" /> {counts.declined} declined
                        </span>
                        <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-amber-200 bg-amber-50/60 text-amber-800 text-[12px] font-semibold">
                            <Clock className="h-3 w-3" aria-hidden="true" /> {counts.pending} pending
                        </span>
                    </div>
                </div>
            </section>

            {/* Table */}
            <div className="px-6 lg:px-10 py-6">
                <div className="bg-white rounded-2xl border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-[13px]">
                            <thead>
                                <tr>
                                    {columns.map((column) => (
                                        <th
                                            key={column.key}
                                            scope="col"
                                            className="sticky top-0 px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.15em] whitespace-nowrap border-b border-border bg-muted/40 backdrop-blur"
                                        >
                                            {column.title}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {interviewers.length === 0 ? (
                                    <tr>
                                        <td colSpan={columns.length} className="px-5 py-16 text-center">
                                            <p className="text-[13.5px] font-semibold text-foreground">No interviewers found</p>
                                            <p className="text-[12.5px] text-muted-foreground mt-1">Try adjusting your filters or check back later.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    interviewers.map((row, rowIndex) => (
                                        <tr key={row._id || `row-${rowIndex}`} className="hover:bg-muted/30 transition-colors">
                                            {columns.map((column) => (
                                                <td
                                                    key={`${column.key}-${row._id || rowIndex}`}
                                                    className="px-5 py-3.5 whitespace-nowrap text-foreground/90 align-middle"
                                                >
                                                    {column.render ? column.render(row, rowIndex) : ''}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterviewerBookingTrackingPage;
