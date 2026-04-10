// client/src/pages/admin/InterviewerBookingTrackingPage.jsx
import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Card from '@/components/common/Card';
import Table from '@/components/common/Table';
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
        return <div className="flex justify-center p-10"><Loader2 className="animate-spin h-8 w-8 text-primary-600"/></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center">
                <Link to="/admin/bookings/interviewer-bookings" className="text-primary-600 hover:text-primary-800 flex items-center font-medium">
                    <ArrowLeft className="mr-2"/> Back to Bookings
                </Link>
            </div>
            <Card
                
            >
                <Table
                    columns={columns}
                    data={bookingDetails?.interviewers || []}
                    isLoading={loading}
                    emptyMessage="No interviewers found for this booking request."
                />
            </Card>
        </div>
    );
};

export default InterviewerBookingTrackingPage;
