// client/src/pages/admin/InterviewerBookingTrackingPage.jsx
import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Loader from '@/components/common/Loader';
import { useInterviewBookingDetails } from '@/hooks/useAdminQueries';
import { useAlert } from '@/hooks/useAlert';
import { formatDate } from '@/utils/formatters';
import { Badge } from '@/components/ui/badge';

const StatusBadge = ({ status }) => {
    const variant = status === 'Submitted' ? 'success' : status === 'Not Available' ? 'danger' : 'gray';
    return <Badge variant={variant}>{status}</Badge>;
};


const InterviewerBookingTrackingPage = () => {
    const { id } = useParams();
    const { showError } = useAlert();
    const { data: bookingDetails, isLoading: loading } = useInterviewBookingDetails(id, {
        onError: () => showError('Failed to fetch booking tracking details.'),
    });

    const columns = useMemo(() => [
        { key: 'interviewerId', title: 'Interviewer ID', render: (row) => row.interviewer?.interviewerId || 'N/A' },
        { key: 'name', title: 'Interviewer Name', render: (row) => `${row.interviewer?.user.firstName} ${row.interviewer?.user.lastName}` },
        { key: 'email', title: 'Interviewer Mail', render: (row) => row.interviewer?.user.email },
        { key: 'status', title: 'Provided Status', render: (row) => <StatusBadge status={row.status === 'Submitted' ? 'Available' : row.status} /> },
        { key: 'remarks', title: 'Remarks', render: (row) => <div className="text-wrap min-w-[200px]">{row.remarks || '-'}</div> },
    ], []);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center bg-[#f5f7fb]">
                <Loader size="lg" />
            </div>
        );
    }

    const interviewers = bookingDetails?.interviewers || [];

    return (
        <div className="min-h-screen bg-[#f5f7fb] space-y-6">
            <div className="flex items-center">
                <Link to="/admin/bookings/interviewer-bookings" className="text-blue-600 hover:text-blue-800 flex items-center font-medium transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Bookings
                </Link>
            </div>

            {/* White panel replacing Card */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                {columns.map((column) => (
                                    <th
                                        key={column.key}
                                        scope="col"
                                        className="sticky top-0 px-5 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em] whitespace-nowrap border-b border-slate-200 bg-slate-50/90 backdrop-blur-sm"
                                    >
                                        {column.title}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {interviewers.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="px-5 py-16 text-center">
                                        <p className="text-sm text-slate-400 font-medium">No interviewers found for this booking request.</p>
                                        <p className="text-xs text-slate-300 mt-1">Try adjusting your filters or check back later.</p>
                                    </td>
                                </tr>
                            ) : (
                                interviewers.map((row, rowIndex) => (
                                    <tr key={row._id || `row-${rowIndex}`} className="hover:bg-slate-50/70 transition-colors duration-150">
                                        {columns.map((column) => (
                                            <td
                                                key={`${column.key}-${row._id || rowIndex}`}
                                                className="px-5 py-3 whitespace-nowrap text-sm text-slate-700 align-middle"
                                            >
                                                {column.render ? column.render(row, rowIndex) : (row[column.key] !== null && row[column.key] !== undefined ? row[column.key].toString() : '')}
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
    );
};

export default InterviewerBookingTrackingPage;
