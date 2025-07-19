// client/src/pages/admin/EmailTrackingPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiClipboard } from 'react-icons/fi';
import Card from '@/components/common/Card';
import Table from '@/components/common/Table';
import Loader from '@/components/common/Loader';
import Button from '@/components/common/Button';
import { getPublicBookingDetails } from '@/api/admin.api';
import { useAlert } from '@/hooks/useAlert';
import { formatDateTime } from '@/utils/formatters';

const EmailTrackingPage = () => {
    const { id } = useParams();
    const { showSuccess, showError } = useAlert();
    const [loading, setLoading] = useState(true);
    const [bookingDetails, setBookingDetails] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const response = await getPublicBookingDetails(id);
                setBookingDetails(response.data.data);
            } catch (err) {
                showError("Failed to fetch booking details.");
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id, showError]);

    const copyToClipboard = () => {
        if (bookingDetails?.allowedEmails?.length > 0) {
            navigator.clipboard.writeText(bookingDetails.allowedEmails.join('\n'));
            showSuccess('Emails copied to clipboard!');
        }
    };
    
    const columns = useMemo(() => [
        { key: 'index', title: 'No', render: (row, index) => index + 1 },
        { key: 'email', title: 'Email Address', render: (row) => row.email },
    ], []);
    
    if (loading) {
        return <div className="flex justify-center items-center py-20"><Loader text="Loading Tracking Details..." /></div>;
    }

    if (!bookingDetails) {
        return (
            <div className="text-center py-10">
                <p>Booking details not found.</p>
                <Link to="/admin/student-bookings" className="mt-4 inline-block btn btn-primary">
                    Back to Student Bookings
                </Link>
            </div>
        );
    }

    // Prepare data for the table, ensuring each item is an object
    const emailData = bookingDetails.allowedEmails.map(email => ({ email }));

    return (
        <div className="space-y-4">
            <Link to="/admin/student-bookings" className="text-primary-600 hover:text-primary-700 flex items-center font-medium">
                <FiArrowLeft className="mr-2"/> Back to Student Bookings
            </Link>
            
            <Card>
                <div className="p-4 border-b flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Email Invitation Tracking</h2>
                        <p className="text-sm text-gray-500">
                            Showing all authorized emails for link: 
                            <code className="ml-1 bg-gray-100 text-gray-800 p-1 rounded-md">/book/{bookingDetails.publicId}</code>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Created on: {formatDateTime(bookingDetails.createdAt)}
                        </p>
                    </div>
                    {emailData.length > 0 && (
                        <Button variant="outline" onClick={copyToClipboard} icon={<FiClipboard/>}>
                            Copy All Emails
                        </Button>
                    )}
                </div>
                <Table
                    columns={columns}
                    data={emailData}
                    isLoading={loading}
                    emptyMessage="No emails have been authorized for this link yet."
                />
            </Card>
        </div>
    );
};

export default EmailTrackingPage;