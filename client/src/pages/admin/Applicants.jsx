// client/src/pages/admin/Applicants.jsx
import React, { useState, useMemo } from 'react';
import { CheckCircle, Download, RefreshCw, Edit, Trash2, Plus, MoreVertical } from 'lucide-react';
import Button from '../../components/common/Button';
import { Button as ShadcnButton } from '@/components/ui/button';
import SearchInput from '../../components/common/SearchInput';
import FilterDropdown from '../../components/common/FilterDropdown';
import StatusBadge from '../../components/common/StatusBadge';
import { deleteApplicant, exportApplicants } from '../../api/admin.api';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { APPLICATION_STATUS } from '../../utils/constants';
import { debounce } from '../../utils/helpers';
import { useAlert } from '../../hooks/useAlert';
import { useApplicants, useInvalidateAdmin } from '../../hooks/useAdminQueries';
import DropdownMenu from '../../components/common/DropdownMenu';
import Table from '../../components/common/Table';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ApplicantFormModal from './ApplicantFormModal';
import { saveAs } from 'file-saver';
import Modal from '../../components/common/Modal'; // Import Modal for history

const Applicants = () => {
    const { showSuccess, showError } = useAlert();
    const { invalidateApplicants } = useInvalidateAdmin();

    // *** FIX START: State for modals ***
    const [modalState, setModalState] = useState({ type: null, data: null });
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });
    const [historyModal, setHistoryModal] = useState({ isOpen: false, data: [], name: '' });
    // *** FIX END ***

    const [pagination, setPagination] = useState({ currentPage: 1 });
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const [filters, setFilters] = useState({ search: '', status: '' });

    const queryParams = useMemo(() => ({
        page: pagination.currentPage,
        limit: 15,
        search: filters.search,
        status: filters.status,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
    }), [pagination.currentPage, filters.search, filters.status, sortConfig.key, sortConfig.direction]);

    const { data, isLoading, error } = useApplicants(queryParams);

    const applicants = data?.applicants || [];
    const totalPages = data?.totalPages || 1;
    const totalItems = data?.totalDocs || 0;

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    };

    const debouncedFilterChange = debounce((key, value) => {
      setFilters(prev => ({ ...prev, [key]: value }));
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    }, 300);

    const handleFilterChange = (key, value) => debouncedFilterChange(key, value);

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handleDelete = async () => {
        if (!deleteDialog.id) return;
        try {
            await deleteApplicant(deleteDialog.id);
            showSuccess('Applicant deleted successfully.');
            setDeleteDialog({ isOpen: false, id: null });
            invalidateApplicants();
        } catch (err) {
            showError('Failed to delete applicant.');
        }
    };

    const handleExport = async () => {
        try {
            const response = await exportApplicants({ status: filters.status, search: filters.search });
            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, `applicants_${new Date().toISOString().slice(0,10)}.xlsx`);
            showSuccess("Export started successfully.");
        } catch (err) {
            showError("Failed to export data.");
        }
    };

    const handleModalSuccess = () => {
        setModalState({ type: null, data: null });
        invalidateApplicants();
    };

    // *** FIX START: New detailed column definitions based on the prompt ***
    const columns = useMemo(() => [
        { key: 'fullName', title: 'Full Name', minWidth: '180px', sortable: true },
        { key: 'email', title: 'Email', minWidth: '220px', sortable: true },
        { key: 'phoneNumber', title: 'Phone', minWidth: '130px' },
        { key: 'linkedinProfileUrl', title: 'LinkedIn', minWidth: '120px', render: (row) => ( <a href={row.linkedinProfileUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">View Profile</a> )},
        { key: 'interestedInJoining', title: 'Interested', minWidth: '100px', render: (row) => row.interestedInJoining ? <CheckCircle className="text-green-500 mx-auto" size={18} /> : '' },
        { key: 'sourcingChannel', title: 'Source', minWidth: '120px', sortable: true },
        { key: 'status', title: 'Status', minWidth: '180px', sortable: true, render: (row) => <StatusBadge status={row.status} /> },
        { key: 'history', title: 'History', minWidth: '100px', render: (row) => (<ShadcnButton variant="link" size="sm" onClick={() => setHistoryModal({ isOpen: true, data: row.statusHistory, name: row.fullName })} className="text-blue-600 hover:text-blue-800 text-sm font-medium p-0 h-auto">View</ShadcnButton>) },
        { key: 'createdAt', title: 'Applied On', minWidth: '180px', sortable: true, render: (row) => formatDateTime(row.createdAt) },
        { key: 'actions', title: 'Actions', minWidth: '80px', render: (row) => (
            <DropdownMenu options={[
                { label: 'Edit', icon: Edit, onClick: () => setModalState({ type: 'edit', data: row }) },
                { label: 'Delete', icon: Trash2, isDestructive: true, onClick: () => setDeleteDialog({ isOpen: true, id: row._id }) },
            ]} />
        )}
    ], []);
    // *** FIX END ***
    
    const statusOptions = useMemo(() => [
        { value: '', label: 'All Statuses' },
        ...Object.values(APPLICATION_STATUS).map(status => ({ value: status, label: status })),
    ], []);

    return (
        <div className="h-full flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header section with title and controls */}
            <div className="px-6 py-4 bg-white border-b border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4 flex-shrink-0 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 self-start md:self-center">Applicants</h2>
                <div className="flex items-center gap-2 flex-wrap">
                    <SearchInput value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} placeholder="Search..." className="w-full sm:w-48" />
                    <FilterDropdown label="Status" options={statusOptions} selectedValue={filters.status} onChange={(val) => handleFilterChange('status', val)}/>
                    <Button variant="outline" icon={<Download size={20} />} onClick={handleExport} className="!px- !py-2"></Button>
                    <Button variant="primary" icon={<Plus size={20} />} onClick={() => setModalState({ type: 'add', data: null })}>Add</Button>
                </div>
            </div>
            
            {/* Table section within a scrolling container */}
            <div className="overflow-auto flex-grow">
                <Table
                    columns={columns}
                    data={applicants}
                    isLoading={isLoading}
                    onSort={handleSort}
                    sortConfig={sortConfig}
                    emptyMessage="No applicants found."
                />
            </div>

            {/* Pagination outside the scrolling container */}
            {totalItems > 15 && (
                 <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3 flex-shrink-0">
                    <p className="text-xs text-gray-500"> Page <span className="font-medium text-gray-900">{pagination.currentPage}</span> of <span className="font-medium text-gray-900">{totalPages}</span></p>
                    <div className="space-x-2">
                       <Button variant="outline" onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage <= 1}>Previous</Button>
                       <Button variant="outline" onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage >= totalPages}>Next</Button>
                    </div>
                 </div>
            )}
           
            {/* All Modals */}
            {modalState.type && (
                <ApplicantFormModal isOpen={!!modalState.type} onClose={() => setModalState({ type: null, data: null })} onSuccess={handleModalSuccess} applicantData={modalState.data}/>
            )}

            <ConfirmDialog isOpen={deleteDialog.isOpen} onClose={() => setDeleteDialog({ isOpen: false, id: null })} onConfirm={handleDelete} title="Delete Applicant" message="Are you sure you want to delete this applicant? This action cannot be undone."/>

            <Modal isOpen={historyModal.isOpen} onClose={() => setHistoryModal({ isOpen: false, data: [], name: '' })} title={`Status History for ${historyModal.name}`} size="lg">
                <div className="overflow-y-auto max-h-[60vh]">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-indigo-50 to-blue-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {historyModal.data.map((historyItem, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{historyItem.status}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(historyItem.timestamp)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Modal>
        </div>
    );
};

export default Applicants;
