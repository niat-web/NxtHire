// client/src/pages/admin/UserManagement.jsx
import React, { useState, useEffect, useCallback, useMemo, Fragment } from 'react';
import { FiEdit, FiFilter, FiSearch, FiPlus, FiTrash2, FiToggleLeft, FiToggleRight, FiMoreVertical, FiChevronLeft, FiChevronRight, FiRefreshCw } from 'react-icons/fi';
import { Menu, Transition } from '@headlessui/react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import SearchInput from '../../components/common/SearchInput';
import FilterDropdown from '../../components/common/FilterDropdown';
import { getUsers, deleteUser, updateUser } from '../../api/admin.api';
import { formatDateTime } from '../../utils/formatters';
import { debounce } from '../../utils/helpers';
import { useAlert } from '../../hooks/useAlert';
import UserFormModal from './UserFormModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Table from '../../components/common/Table';
import DropdownMenu from '../../components/common/DropdownMenu';

const UserManagement = () => {
    const { showSuccess, showError } = useAlert();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const [filters, setFilters] = useState({ search: '', role: '' });
    
    const [modalState, setModalState] = useState({ type: null, data: null });
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, user: null });

    function classNames(...classes) {
        return classes.filter(Boolean).join(' ');
    }

    const roleOptions = useMemo(() => [
        { value: '', label: 'All Roles' }, { value: 'admin', label: 'Admin' }, { value: 'interviewer', label: 'Interviewer' },
    ], []);

    const fetchUsers = useCallback((pageToFetch) => {
        setLoading(true);
        const params = {
            page: pageToFetch, limit: 10,
            search: filters.search, role: filters.role,
            sortBy: sortConfig.key, sortOrder: sortConfig.direction,
        };
        getUsers(params)
            .then(response => {
                const { users, page: currentPage, totalPages, totalDocs } = response.data.data;
                setUsers(users || []);
                setPagination({ currentPage, totalPages, totalItems: totalDocs });
            })
            .catch(error => {
                showError('Failed to fetch user data.');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [filters, sortConfig, showError]);

    useEffect(() => {
        const handler = debounce(() => fetchUsers(1), 300);
        handler();
        return () => handler.cancel();
    }, [filters, sortConfig, fetchUsers]);
    
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSort = (key) => {
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
    };
    
    const handlePageChange = (page) => {
        if (page > 0 && page <= pagination.totalPages) {
            fetchUsers(page);
        }
    };
    
    const handleModalSuccess = () => {
        setModalState({ type: null, data: null });
        fetchUsers(pagination.currentPage);
    };

    const handleDelete = async () => {
        if(!deleteDialog.user) return;
        try {
            await deleteUser(deleteDialog.user._id);
            showSuccess(`User ${deleteDialog.user.firstName} ${deleteDialog.user.lastName} has been deactivated.`);
            setDeleteDialog({ isOpen: false, user: null });
            fetchUsers(pagination.currentPage);
        } catch (err) {
            showError('Failed to deactivate user.');
        }
    };

    // --- MODIFICATION START: Implemented optimistic UI update for status toggle ---
    const toggleActiveStatus = async (userToUpdate) => {
        const originalUsers = [...users];
        
        // Optimistically update the UI first
        const optimisticUsers = users.map(user => 
            user._id === userToUpdate._id ? { ...user, isActive: !user.isActive } : user
        );
        setUsers(optimisticUsers);

        try {
            // Make the API call in the background
            await updateUser(userToUpdate._id, { isActive: !userToUpdate.isActive });
            showSuccess('User status updated successfully.');
            // No full reload needed on success
        } catch (err) {
            // If the API call fails, revert the UI and show an error
            showError('Failed to update user status. Reverting change.');
            setUsers(originalUsers);
        }
    };
    // --- MODIFICATION END ---

    const userColumns = useMemo(() => [
        { key: 'name', title: 'User', minWidth: '250px', sortable: true, render: (row) => (
            <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 mr-3 flex-shrink-0">
                    {(row.firstName?.charAt(0) || '')}{(row.lastName?.charAt(0) || '')}
                </div>
                <div>
                    <div className="font-semibold text-gray-800">{`${row.firstName} ${row.lastName}`}</div>
                    <div className="text-xs text-gray-500">{row.email}</div>
                </div>
            </div>
        )},
        {
            key: 'role', title: 'Role', sortable: true, minWidth: '120px', render: (row) => (
                <Badge
                    variant={row.role === 'admin' ? 'info' : 'success'}
                    className="capitalize"
                >
                    {row.role}
                </Badge>
            )
        },
        { 
            key: 'isActive', title: 'Status', sortable: true, minWidth: '120px', render: (row) => (
                <button
                    onClick={() => toggleActiveStatus(row)}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 ease-in-out flex items-center ${
                        row.isActive ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    title={row.isActive ? 'Active (Click to Deactivate)' : 'Inactive (Click to Activate)'}
                >
                    <span className={`block w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
                        row.isActive ? 'translate-x-5' : 'translate-x-0'
                    }`}/>
                </button>
            )
        },
        { key: 'lastLogin', title: 'Last Login', sortable: true, minWidth: '180px', render: (row) => row.lastLogin ? formatDateTime(row.lastLogin) : 'Never' },
        { key: 'actions', title: 'Actions', minWidth: '100px', render: (row) => (
                <DropdownMenu options={[
                    { label: 'Edit', icon: FiEdit, onClick: () => setModalState({ type: 'edit', data: row }) },
                    { 
                        label: row.isActive ? 'Deactivate' : 'Activate', 
                        icon: row.isActive ? FiToggleLeft : FiToggleRight, 
                        onClick: () => toggleActiveStatus(row)
                    },
                    { label: 'Delete (Soft)', icon: FiTrash2, isDestructive: true, onClick: () => setDeleteDialog({ isOpen: true, user: row }) },
                ]} />
            ),
        },
    ], [users, toggleActiveStatus]);

    return (
        <div className="space-y-4">
             {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                <Button variant="primary" icon={<FiPlus />} onClick={() => setModalState({ type: 'add', data: null })}>
                    Add New User
                </Button>
            </div>
            {/* Main Content Area */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Filters */}
                <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-200">
                    <SearchInput 
                        value={filters.search} 
                        onChange={(e) => handleFilterChange('search', e.target.value)} 
                        onClear={() => handleFilterChange('search', '')} 
                        placeholder="Search by name or email..." 
                        className="w-full md:w-72" 
                    />
                    <div className="flex items-center gap-4 flex-wrap">
                        <FilterDropdown label="Role" options={roleOptions} selectedValue={filters.role} onChange={(val) => handleFilterChange('role', val)} />
                        <Button variant="outline" icon={<FiRefreshCw/>} onClick={() => fetchUsers(1)} title="Refresh Data"/>
                    </div>
                </div>
                {/* Table */}
                <Table 
                    columns={userColumns} 
                    data={users} 
                    isLoading={loading} 
                    sortConfig={sortConfig} 
                    onSort={handleSort} 
                    emptyMessage="No users found."
                />
                {/* Pagination */}
                {pagination && pagination.totalItems > 10 && (
                    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{(pagination.currentPage - 1) * 10 + 1}</span> to <span className="font-medium">{Math.min(pagination.currentPage * 10, pagination.totalItems)}</span> of{' '}
                                <span className="font-medium">{pagination.totalItems}</span> results
                            </p>
                        </div>
                        <div className="space-x-2">
                            <Button variant="outline" onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage <= 1}><FiChevronLeft className="h-4 w-4"/></Button>
                            <Button variant="outline" onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage >= pagination.totalPages}><FiChevronRight className="h-4 w-4"/></Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {modalState.type && <UserFormModal isOpen={!!modalState.type} onClose={() => setModalState({ type: null, data: null })} onSuccess={handleModalSuccess} userData={modalState.data} />}
            <ConfirmDialog 
                isOpen={deleteDialog.isOpen} 
                onClose={() => setDeleteDialog({ isOpen: false, user: null })} 
                onConfirm={handleDelete} 
                title="Deactivate User" 
                message={`Are you sure you want to deactivate the user "${deleteDialog.user?.firstName} ${deleteDialog.user?.lastName}"? This can be undone later.`} 
                confirmVariant="danger"
            />
        </div>
    );
};

export default UserManagement;