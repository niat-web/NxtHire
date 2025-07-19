// client/src/pages/admin/StudentBookings.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/common/Card';
import Tabs from '@/components/common/Tabs';
import Table from '@/components/common/Table';
import Loader from '@/components/common/Loader';
import Button from '@/components/common/Button';
import Textarea from '@/components/common/Textarea';
import { getPublicBookings, updatePublicBookingLink, getConfirmedStudentBookings } from '@/api/admin.api';
import { useAlert } from '@/hooks/useAlert';
import { formatDateTime, formatDate } from '@/utils/formatters';

const ManagePublicLinks = () => {
    const { showSuccess, showError } = useAlert();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [publicBookings, setPublicBookings] = useState([]);
    const [emailInputs, setEmailInputs] = useState({});
    const [savingId, setSavingId] = useState(null);

    const fetchPublicBookings = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getPublicBookings();
            setPublicBookings(response.data.data);
            const initialEmails = response.data.data.reduce((acc, booking) => {
                // Keep the textareas empty for new input
                acc[booking._id] = '';
                return acc;
            }, {});
            setEmailInputs(initialEmails);
        } catch (err) {
            showError("Failed to fetch public booking links.");
        } finally {
            setLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        fetchPublicBookings();
    }, [fetchPublicBookings]);

    const handleEmailChange = (id, value) => {
        setEmailInputs(prev => ({ ...prev, [id]: value }));
    };

    const handleSaveAndSend = async (id) => {
        setSavingId(id);
        const newEmails = emailInputs[id].split(',').map(e => e.trim()).filter(e => e);
        
        if (newEmails.length === 0) {
            showError("Please enter at least one email address to send.");
            setSavingId(null);
            return;
        }

        try {
            const response = await updatePublicBookingLink(id, { allowedEmails: newEmails });
            showSuccess(response.data.message || 'Invitations sent!');
            // After success, clear the input for the next batch
            setEmailInputs(prev => ({ ...prev, [id]: '' }));
            // Refresh all data silently to update tooltips etc.
            const updatedBookings = await getPublicBookings();
            setPublicBookings(updatedBookings.data.data);
        } catch (err) {
            showError('Failed to save and send invitations.');
        } finally {
            setSavingId(null);
        }
    };

    const columns = [
        { key: 'createdAt', title: 'Created At', render: row => formatDateTime(row.createdAt) },
        { key: 'publicId', title: 'Public Link', render: row => <a href={`/book/${row.publicId}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">/book/{row.publicId}</a> },
        { 
            key: 'interviewers', 
            title: 'Interviewers', 
            render: (row) => {
                const uniqueInterviewers = [...new Set(
                    row.interviewerSlots.map(s => `${s.interviewer.user.firstName} ${s.interviewer.user.lastName}`)
                )];

                return (
                    <div className="relative group flex items-center">
                        <span className="font-medium text-gray-700">
                            {uniqueInterviewers.length} Interviewer{uniqueInterviewers.length > 1 ? 's' : ''}
                        </span>
                        <div className="absolute left-0 bottom-full mb-2 w-max max-w-xs p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            <ul className="space-y-1">
                                {uniqueInterviewers.map((name, index) => (
                                    <li key={index}>{name}</li>
                                ))}
                            </ul>
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-[-4px] w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                    </div>
                );
            }
        },
        { key: 'emails', title: 'Authorize New Emails', render: row => <Textarea value={emailInputs[row._id] || ''} onChange={(e) => handleEmailChange(row._id, e.target.value)} rows={2} placeholder="jane@example.com, john@example.com" /> },
        {
            key: 'emailtrackingpage',
            title: 'Email Tracking',
            render: (row) => (
                <button
                    onClick={() => navigate(`/admin/public-bookings/${row._id}/tracking`)}
                    className="font-medium text-primary-600 hover:underline"
                >
                    page
                </button>
            )
        },
        { key: 'action', title: 'Action', render: row => <Button isLoading={savingId === row._id} onClick={() => handleSaveAndSend(row._id)}>Save & Send</Button> },
    ];

    return <Table columns={columns} data={publicBookings} isLoading={loading} emptyMessage="No public links created yet." />;
};

const ConfirmedStudentSlots = () => {
    const { showError } = useAlert();
    const [loading, setLoading] = useState(true);
    const [studentBookings, setStudentBookings] = useState([]);
    
    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            try {
                const response = await getConfirmedStudentBookings();
                setStudentBookings(response.data.data);
            } catch (err) {
                showError("Failed to fetch confirmed student bookings.");
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [showError]);
    
    const columns = [
        { key: 'studentName', title: 'Student Name' },
        { key: 'studentEmail', title: 'Student Email' },
        { key: 'studentPhone', title: 'Student Phone' },
        { key: 'interviewer', title: 'Interviewer', render: row => `${row.bookedInterviewer.user.firstName} ${row.bookedInterviewer.user.lastName}` },
        { key: 'date', title: 'Interview Date', render: row => formatDate(row.bookingDate) },
        { key: 'slot', title: 'Confirmed Slot', render: row => `${row.bookedSlot.startTime} - ${row.bookedSlot.endTime}` },
    ];
    
    return <Table columns={columns} data={studentBookings} isLoading={loading} emptyMessage="No students have booked a slot yet." />;
};

const StudentBookings = () => {
    const tabs = [
        { label: "Manage Public Links", content: <ManagePublicLinks /> },
        { label: "Confirmed Student Slots", content: <ConfirmedStudentSlots /> }
    ];

    return (
            <Tabs tabs={tabs} />
    );
};

export default StudentBookings;