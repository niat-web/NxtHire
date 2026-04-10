// client/src/pages/admin/EmailTrackingPage.jsx
import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, Mail, AlertTriangle, X, CheckCircle, Users, Clock, Eye } from 'lucide-react';
import { sendBookingReminders } from '@/api/admin.api';
import { usePublicBookingDetails } from '@/hooks/useAdminQueries';
import { useAlert } from '@/hooks/useAlert';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const Loader = ({ text }) => (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="mt-4">{text}</p>
    </div>
);

const Table = ({ columns, data, isLoading, emptyMessage, emptyIcon: EmptyIcon }) => (
    <div className="w-full overflow-x-auto">
        <table className="min-w-full bg-white divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>{columns.map(col => <th key={col.key} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{col.title}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {isLoading ? ( <tr><td colSpan={columns.length}><Loader text="Loading data..." /></td></tr>
                ) : data.length === 0 ? ( <tr><td colSpan={columns.length}><div className="text-center py-16 text-gray-500"><EmptyIcon className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-2 text-sm font-medium text-gray-900">No Data</h3><p className="mt-1 text-sm text-gray-500">{emptyMessage}</p></div></td></tr>
                ) : (
                    data.map((row, index) => (
                        <tr key={row.email || index} className="hover:bg-gray-50">
                            {columns.map(col => (
                                <td key={col.key} className="px-6 py-3 whitespace-nowrap text-sm text-gray-700 align-middle">
                                    {col.render ? col.render(row, index) : row[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    </div>
);

const Modal = ({ isOpen, onClose, title, children, footer }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-md flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex-shrink-0 px-6 py-4 border-b flex justify-between items-center"><h3 className="text-lg font-semibold text-gray-900">{title}</h3><Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500"><X className="h-5 w-5" /></Button></div>
                <div className="flex-grow p-6 overflow-y-auto">{children}</div>
                {footer && <div className="flex-shrink-0 px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">{footer}</div>}
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card className="p-6">
        <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <Icon className={cn('h-5 w-5', color)} />
        </div>
        <p className="text-3xl font-semibold text-gray-900 mt-2">{value}</p>
    </Card>
);

const StatusBadge = ({ status }) => {
    const isSubmitted = status === 'Submitted';
    return (
        <Badge variant={isSubmitted ? 'success' : 'warning'} className="gap-1.5">
            {isSubmitted ? <CheckCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
            {isSubmitted ? 'Booked' : 'Pending'}
        </Badge>
    );
};

const ReminderModal = ({ isOpen, onClose, onConfirm, isLoading, students = [] }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Confirm Reminders"
            footer={
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button variant="success" onClick={onConfirm} isLoading={isLoading}>
                        {!isLoading && <Send className="mr-2 h-4 w-4" />}
                        {`Send ${students.length} Reminder(s)`}
                    </Button>
                </div>
            }
        >
            <p className="text-sm text-gray-600 mb-4">
                You are about to send a reminder email to the following <span className="font-semibold">{students.length}</span> student(s) who have not yet booked their slot. Please confirm.
            </p>
            <div className="border border-gray-200 rounded-xl max-h-[50vh] overflow-y-auto">
                 <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email ID</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {students.map((student, index) => (
                            <tr key={index}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{student.domain}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{student.userId}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{student.fullName}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Modal>
    );
};


// --- MAIN PAGE COMPONENT ---
const EmailTrackingPage = () => {
    const { id } = useParams();
    const { showSuccess, showError, showInfo } = useAlert();
    const { data: bookingDetails, isLoading: loading } = usePublicBookingDetails(id, {
        onError: () => showError("Failed to fetch booking details."),
    });
    const [isSending, setIsSending] = useState(false);
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);

    const studentsToRemind = useMemo(() =>
        (bookingDetails?.trackedEmails || []).filter(student => student.status === 'Not Submitted'),
        [bookingDetails]
    );

    const { totalInvited, totalBooked, totalPending } = useMemo(() => {
        const total = bookingDetails?.trackedEmails?.length || 0;
        const booked = total - studentsToRemind.length;
        return { totalInvited: total, totalBooked: booked, totalPending: studentsToRemind.length };
    }, [bookingDetails, studentsToRemind]);

    const handleSendReminders = async () => {
        setIsSending(true);
        try {
            const response = await sendBookingReminders(id);
            showSuccess(response.data.message || "Reminders sent successfully!");
            setIsReminderModalOpen(false);
        } catch (err) {
            showError(err.response?.data?.message || "Failed to send reminders.");
        } finally {
            setIsSending(false);
        }
    };

    const columns = useMemo(() => [
        { key: 'index', title: '#', render: (row, index) => index + 1 },
        { key: 'fullName', title: 'Full Name' },
        { key: 'email', title: 'Email ID' },
        { key: 'domain', title: 'Domain' },
        { key: 'userId', title: 'User ID' },
        { key: 'status', title: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    ], []);

    if (loading) return <div className="p-6"><Loader text="Loading Tracking Details..." /></div>;
    
    if (!bookingDetails) return (
        <div className="p-6 text-center text-gray-600">Error loading booking data.</div>
    );
    
    return (
        <div className="h-full w-full flex flex-col bg-white overflow-hidden">
            {/* New Header */}
            <div className="flex-shrink-0 p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <Link to="/admin/bookings/student-bookings" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center mb-1">
                        <ArrowLeft className="mr-1.5 h-4 w-4"/> Back to Manage Links
                    </Link>
                </div>
                <Button variant="success" onClick={() => setIsReminderModalOpen(true)} isLoading={isSending} disabled={studentsToRemind.length === 0}>
                    {!isSending && <Send className="mr-2 h-4 w-4" />} Send Reminders
                </Button>
            </div>
            
            {/* New Stats Cards */}
            <div className="flex-shrink-0 grid grid-cols-1 sm:grid-cols-3 gap-6 p-5 bg-gray-50 border-b border-gray-200">
                <StatCard title="Total Invited" value={totalInvited} icon={Users} color="text-indigo-500" />
                <StatCard title="Slots Booked" value={totalBooked} icon={CheckCircle} color="text-green-500" />
                <StatCard title="Pending" value={totalPending} icon={Clock} color="text-yellow-500" />
            </div>

            {/* Table Area */}
            <div className="flex-grow overflow-auto">
                <Table
                    columns={columns}
                    data={bookingDetails.trackedEmails || []}
                    isLoading={loading}
                    emptyMessage="No students have been authorized for this link yet."
                    emptyIcon={Users}
                />
            </div>

            {isReminderModalOpen && (
                <ReminderModal
                    isOpen={isReminderModalOpen}
                    onClose={() => setIsReminderModalOpen(false)}
                    onConfirm={handleSendReminders}
                    students={studentsToRemind}
                    isLoading={isSending}
                />
            )}
        </div>
    );
};

export default EmailTrackingPage;
