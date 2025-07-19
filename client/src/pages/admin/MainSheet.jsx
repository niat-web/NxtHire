// client/src/pages/admin/MainSheet.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiDownload, FiPlus, FiGrid, FiUsers, FiEdit, FiTrash2, FiLink, FiMoreVertical } from 'react-icons/fi'; // FiMoreVertical added
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Table from '@/components/common/Table';
import SearchInput from '@/components/common/SearchInput';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import DropdownMenu from '@/components/common/DropdownMenu'; // Import DropdownMenu
import { getMainSheetEntries, deleteMainSheetEntry } from '@/api/admin.api';
import { useAlert } from '@/hooks/useAlert';
import { debounce } from '@/utils/helpers';
import { formatDate } from '@/utils/formatters';

const MainSheet = () => {
    const { showSuccess, showError } = useAlert();
    const navigate = useNavigate();
    const [view, setView] = useState('student');
    const [loading, setLoading] = useState(true);
    const [entries, setEntries] = useState([]);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState(null);

    const fetchEntries = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await getMainSheetEntries({ search, page, limit: 15 });
            setEntries(response.data.data.entries || []);
            setPagination(response.data.data);
        } catch (error) {
            showError("Failed to fetch main sheet data.");
        } finally {
            setLoading(false);
        }
    }, [search, showError]);

    const debouncedFetch = useMemo(() => debounce(() => fetchEntries(1), 300), [fetchEntries]);

    useEffect(() => {
        debouncedFetch();
        return () => debouncedFetch.cancel();
    }, [debouncedFetch]);

    const handleDeleteRequest = useCallback((entry) => {
        setEntryToDelete(entry);
        setIsDeleteDialogOpen(true);
    }, []);

    const handleDeleteConfirm = async () => {
        if (!entryToDelete) return;
        try {
            await deleteMainSheetEntry(entryToDelete._id);
            showSuccess('Entry deleted successfully!');
            setIsDeleteDialogOpen(false);
            setEntryToDelete(null);
            fetchEntries(pagination.currentPage); // Refetch current page
        } catch (error) {
            showError('Failed to delete entry.');
            setIsDeleteDialogOpen(false);
        }
    };
    
    const handleExport = () => {
        const simplifiedEntries = entries.map(entry => ({
            'Hiring Name': entry.hiringName, 'Tech Stack': entry.techStack, 'Interview ID': entry.interviewId,
            'UID': entry.uid, 'Candidate Name': entry.candidateName, 'Mobile Number': entry.mobileNumber,
            'Mail ID': entry.mailId, 'Candidate Resume': entry.candidateResume, 'Meeting Link': entry.meetingLink,
            'Interview Date': entry.interviewDate ? formatDate(entry.interviewDate) : '', 'Interview Time': entry.interviewTime,
            'Interview Duration': entry.interviewDuration, 'Interview Status': entry.interviewStatus, 'Remarks': entry.remarks,
            'Interviewer Name': entry.interviewer ? `${entry.interviewer.user.firstName} ${entry.interviewer.user.lastName}` : 'N/A',
            'Interviewer Mail ID': entry.interviewer ? entry.interviewer.user.email : 'N/A'
        }));
        const worksheet = XLSX.utils.json_to_sheet(simplifiedEntries);
        const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        saveAs(data, `MainSheet_${new Date().toISOString().slice(0,10)}.xlsx`);
    };

    const columns = useMemo(() => [
        { key: 'hiringName', title: 'Hiring Name' },
        { key: 'techStack', title: 'Tech Stack' },
        { key: 'interviewId', title: 'Interview ID'},
        { key: 'uid', title: 'UID' },
        { key: 'candidateName', title: 'Candidate' },
        { key: 'mobileNumber', title: 'Mobile' },
        { key: 'mailId', title: "Mail ID" },
        { key: 'candidateResume', title: 'Resume', render: (row) => row.candidateResume ? <a href={row.candidateResume} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a> : 'N/A' },
        { key: 'meetingLink', title: 'Meeting', render: (row) => row.meetingLink ? <a href={row.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a> : 'N/A' },
        { key: 'interviewDate', title: 'Date', render: (row) => row.interviewDate ? formatDate(row.interviewDate) : 'N/A' },
        { key: 'interviewTime', title: 'Time' },
        { key: 'interviewDuration', title: 'Duration' },
        { key: 'interviewStatus', title: 'Status', render: (row) => <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ row.interviewStatus === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{row.interviewStatus || 'N/A'}</span> },
        { key: 'remarks', title: 'Remarks' },
        { key: 'interviewerName', title: 'Interviewer', render: (row) => row.interviewer ? `${row.interviewer.user.firstName} ${row.interviewer.user.lastName}` : 'N/A' },
        { key: 'interviewerMail', title: "Interviewer Mail", render: (row) => row.interviewer ? row.interviewer.user.email : 'N/A' },
        { 
            key: 'actions', 
            title: 'Actions', 
            minWidth: '60px', // Reduced width for compactness
            render: (row) => (
                <DropdownMenu 
                    options={[
                        { label: 'Edit', icon: FiEdit, onClick: () => navigate(`/admin/main-sheet/edit/${row._id}`) },
                        { label: 'Delete', icon: FiTrash2, isDestructive: true, onClick: () => handleDeleteRequest(row) },
                    ]}
                />
            )
        }
    ], [navigate, handleDeleteRequest]);

    return (
        <div className="space-y-4">
            <Card>
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
                        <h2 className="text-xl font-bold text-gray-800">Master Data</h2>
                        <div className="flex items-center gap-2 flex-wrap">
                            <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." onClear={() => setSearch('')} className="w-full sm:w-48"/>
                            <Button variant="outline" icon={<FiDownload />} onClick={handleExport}>Export</Button>
                            <Button variant="primary" icon={<FiPlus />} onClick={() => navigate('/admin/main-sheet/add')}>Add Entries</Button>
                        </div>
                    </div>
                </div>
                 <div className="overflow-x-auto">
                    <Table
                        columns={columns} data={entries} isLoading={loading} emptyMessage="No entries found in the main sheet."
                        pagination={pagination} onPageChange={(page) => fetchEntries(page)}
                        tableClassName="min-w-full divide-y divide-gray-200 border-collapse"
                        thClassName="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border border-gray-200 whitespace-nowrap"
                        tdClassName="px-2 py-2 text-sm text-gray-700 border border-gray-200 whitespace-nowrap"
                        hover
                    />
                </div>
            </Card>

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Entry"
                message={`Are you sure you want to delete the entry for "${entryToDelete?.candidateName}"? This action cannot be undone.`}
            />
        </div>
    );
};

export default MainSheet;