// client/src/pages/admin/UserManagement.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  FiEdit, FiPlus, FiTrash2, FiChevronLeft, FiChevronRight,
  FiSearch, FiChevronDown, FiLoader, FiShield, FiUser
} from 'react-icons/fi';
import { deleteUser, updateUser } from '../../api/admin.api';
import { useUsers, useInvalidateAdmin } from '../../hooks/useAdminQueries';
import { formatDateTime } from '../../utils/formatters';
import { debounce } from '../../utils/helpers';
import { useAlert } from '../../hooks/useAlert';
import UserFormModal from './UserFormModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Table from '../../components/common/Table';

const UserManagement = () => {
    const { showSuccess, showError } = useAlert();
    const { invalidateUsers } = useInvalidateAdmin();
    const [activeTab, setActiveTab] = useState('admin');
    const [page, setPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [modalState, setModalState] = useState({ type: null, data: null });
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, user: null });
    const itemsPerPage = 15;

    useEffect(() => {
        const handler = debounce(() => setDebouncedSearch(search), 300);
        handler();
        return () => handler.cancel();
    }, [search]);

    useEffect(() => { setPage(1); }, [debouncedSearch, activeTab, sortConfig]);

    const queryParams = useMemo(() => ({
        page, limit: itemsPerPage,
        search: debouncedSearch,
        role: activeTab,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
    }), [page, itemsPerPage, debouncedSearch, activeTab, sortConfig]);

    const { data, isLoading: loading, error } = useUsers(queryParams);

    useEffect(() => { if (error) showError('Failed to fetch user data.'); }, [error, showError]);

    const users = data?.users || [];
    const pagination = {
        currentPage: data?.page || 1,
        totalPages: data?.totalPages || 1,
        totalItems: data?.totalDocs || 0,
    };

    const toggleActiveStatus = async (user) => {
        try {
            await updateUser(user._id, { isActive: !user.isActive });
            showSuccess('Status updated.');
            invalidateUsers();
        } catch { showError('Failed to update status.'); }
    };

    const handleDelete = async () => {
        if (!deleteDialog.user) return;
        try {
            await deleteUser(deleteDialog.user._id);
            showSuccess('User deleted.');
            setDeleteDialog({ isOpen: false, user: null });
            invalidateUsers();
        } catch { showError('Failed to delete user.'); }
    };

    const getInitials = (first = '', last = '') => `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();

    const avatarColors = [
        'bg-indigo-50 text-indigo-600 border-indigo-100',
        'bg-purple-50 text-purple-600 border-purple-100',
        'bg-pink-50 text-pink-600 border-pink-100',
        'bg-amber-50 text-amber-600 border-amber-100',
        'bg-sky-50 text-sky-600 border-sky-100',
        'bg-rose-50 text-rose-600 border-rose-100',
    ];
    const getAvatarColor = (id) => {
        if (!id) return 'bg-gray-100 text-gray-600 border-gray-200';
        const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        return avatarColors[hash % avatarColors.length];
    };

    const columns = useMemo(() => [
        {
            key: 'name', title: 'User', minWidth: '240px', sortable: true,
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] border ${getAvatarColor(row._id)}`}>
                        {getInitials(row.firstName, row.lastName)}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900">{row.firstName} {row.lastName}</p>
                        <p className="text-xs text-gray-400">{row.email}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'isActive', title: 'Status', sortable: true, minWidth: '100px',
            render: (row) => (
                <button onClick={() => toggleActiveStatus(row)}
                    className={`relative w-9 h-5 rounded-full transition-colors ${row.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}
                    title={row.isActive ? 'Active' : 'Inactive'}>
                    <span className={`block w-3.5 h-3.5 rounded-full bg-white shadow transform transition-transform mt-[3px] ml-[3px] ${row.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
            )
        },
        {
            key: 'lastLogin', title: 'Last Login', sortable: true, minWidth: '180px',
            render: (row) => (
                <span className={`text-xs ${row.lastLogin ? 'text-gray-600' : 'text-gray-300 italic'}`}>
                    {row.lastLogin ? formatDateTime(row.lastLogin) : 'Never logged in'}
                </span>
            )
        },
        {
            key: 'createdAt', title: 'Created', sortable: true, minWidth: '150px',
            render: (row) => <span className="text-xs text-gray-500">{formatDateTime(row.createdAt)}</span>
        },
        {
            key: 'actions', title: '', minWidth: '80px',
            render: (row) => (
                <div className="flex items-center gap-0.5">
                    <button onClick={() => setModalState({ type: 'edit', data: row })}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                        <FiEdit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleteDialog({ isOpen: true, user: row })}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            ),
        },
    ], [toggleActiveStatus]);

    // Count all users per role (approximate from current page data - actual counts come from API)
    const tabCounts = useMemo(() => {
        return { admin: activeTab === 'admin' ? pagination.totalItems : '–', interviewer: activeTab === 'interviewer' ? pagination.totalItems : '–' };
    }, [activeTab, pagination.totalItems]);

    return (
        <div className="flex flex-col h-full bg-[#F5F7F9]">

            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">User Management</h1>
                        <p className="text-xs text-gray-400 mt-0.5">{pagination.totalItems} {activeTab === 'admin' ? 'administrators' : 'interviewers'}</p>
                    </div>
                    <button onClick={() => setModalState({ type: 'add', data: null })}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-black text-white text-sm font-semibold rounded-lg transition-colors">
                        <FiPlus className="w-4 h-4" /> Add User
                    </button>
                </div>

                {/* Tabs + Search */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex bg-gray-100 rounded-lg p-0.5">
                        <button onClick={() => setActiveTab('admin')}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${
                                activeTab === 'admin' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}>
                            <FiShield className="w-4 h-4" />
                            Admins
                        </button>
                        <button onClick={() => setActiveTab('interviewer')}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${
                                activeTab === 'interviewer' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}>
                            <FiUser className="w-4 h-4" />
                            Interviewers
                        </button>
                    </div>

                    <div className="relative w-full sm:w-72">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name or email..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-auto">
                    <Table
                        columns={columns}
                        data={users}
                        isLoading={loading}
                        sortConfig={sortConfig}
                        onSort={(key) => setSortConfig(p => ({ key, direction: p.key === key && p.direction === 'asc' ? 'desc' : 'asc' }))}
                        emptyMessage={`No ${activeTab === 'admin' ? 'administrators' : 'interviewers'} found.`}
                    />
                </div>

                {/* Pagination */}
                {!loading && pagination.totalItems > 0 && (
                    <div className="px-6 py-3 border-t border-gray-200 bg-white flex items-center justify-between shrink-0">
                        <p className="text-xs text-gray-500">
                            Showing {((pagination.currentPage - 1) * itemsPerPage) + 1}–{Math.min(pagination.currentPage * itemsPerPage, pagination.totalItems)} of {pagination.totalItems}
                        </p>
                        <div className="flex items-center gap-1.5">
                            <button onClick={() => setPage(p => p - 1)} disabled={pagination.currentPage === 1}
                                className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                <FiChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-xs font-medium text-gray-600 px-2">
                                Page <b className="text-gray-900">{pagination.currentPage}</b> of {pagination.totalPages}
                            </span>
                            <button onClick={() => setPage(p => p + 1)} disabled={pagination.currentPage === pagination.totalPages}
                                className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                <FiChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {modalState.type && (
                <UserFormModal
                    isOpen={!!modalState.type}
                    onClose={() => setModalState({ type: null, data: null })}
                    onSuccess={() => { setModalState({ type: null, data: null }); invalidateUsers(); }}
                    userData={modalState.data}
                />
            )}
            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, user: null })}
                onConfirm={handleDelete}
                title="Delete User"
                message={deleteDialog.user ? `Delete "${deleteDialog.user.firstName} ${deleteDialog.user.lastName}"? This action cannot be undone.` : ''}
                confirmVariant="danger"
            />
        </div>
    );
};

export default UserManagement;
