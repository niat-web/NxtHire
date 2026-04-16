// client/src/pages/admin/UserManagement.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Edit, Plus, Trash2, ChevronLeft, ChevronRight,
  Search, Shield, User
} from 'lucide-react';
import { deleteUser, updateUser } from '../../api/admin.api';
import { useUsers, useInvalidateAdmin } from '../../hooks/useAdminQueries';
import { formatDateTime } from '../../utils/formatters';
import { useAlert } from '../../hooks/useAlert';
import UserFormModal from './UserFormModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';

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
        const timer = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(timer);
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

    const handleSort = (key) => setSortConfig(p => ({ key, direction: p.key === key && p.direction === 'asc' ? 'desc' : 'asc' }));

    const columns = [
        { key: 'name', title: 'Name', sortable: true, minWidth: '200px' },
        { key: 'email', title: 'Email', sortable: true, minWidth: '240px' },
        { key: 'isActive', title: 'Status', sortable: true, minWidth: '110px' },
        { key: 'lastLogin', title: 'Last Login', sortable: true, minWidth: '180px' },
        { key: 'createdAt', title: 'Created', sortable: true, minWidth: '160px' },
        { key: 'actions', title: '', minWidth: '90px' },
    ];

    const renderCell = (col, row) => {
        switch (col.key) {
            case 'name':
                return <span className="text-[13px] font-medium text-slate-900">{row.firstName} {row.lastName}</span>;
            case 'email':
                return <span className="text-[13px] text-slate-500">{row.email}</span>;
            case 'isActive':
                return (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => toggleActiveStatus(row)}
                            className={`relative w-8 h-[18px] rounded-full transition-colors ${row.isActive ? 'bg-blue-600' : 'bg-slate-200'}`}
                            title={row.isActive ? 'Active' : 'Inactive'}
                        >
                            <span className={`block w-3.5 h-3.5 rounded-full bg-white shadow-sm transform transition-transform mt-[2px] ml-[2px] ${row.isActive ? 'translate-x-[14px]' : 'translate-x-0'}`} />
                        </button>
                        <span className={`text-[11px] font-semibold ${row.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {row.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                );
            case 'lastLogin':
                return (
                    <span className={`text-[12px] ${row.lastLogin ? 'text-slate-500' : 'text-slate-300 italic'}`}>
                        {row.lastLogin ? formatDateTime(row.lastLogin) : 'Never'}
                    </span>
                );
            case 'createdAt':
                return <span className="text-[12px] text-slate-500">{formatDateTime(row.createdAt)}</span>;
            case 'actions':
                return (
                    <div className="flex items-center gap-0.5">
                        <button onClick={() => setModalState({ type: 'edit', data: row })}
                            className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
                            <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteDialog({ isOpen: true, user: row })}
                            className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden">

            {/* Single header row: tabs + search + add button */}
            <div className="bg-white border-b border-slate-200 px-5 py-3 shrink-0">
                <div className="flex items-center gap-3">
                    {/* Tabs */}
                    <div className="inline-flex bg-slate-100 rounded-lg p-0.5 shrink-0">
                        <button
                            onClick={() => setActiveTab('admin')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded-md transition-all ${
                                activeTab === 'admin'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <Shield className="w-3 h-3" /> Admins
                        </button>
                        <button
                            onClick={() => setActiveTab('interviewer')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded-md transition-all ${
                                activeTab === 'interviewer'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <User className="w-3 h-3" /> Interviewers
                        </button>
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Search — right side */}
                    <div className="relative w-64 shrink-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
                            className="w-full pl-9 pr-3 h-9 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 focus:bg-white transition-colors" />
                    </div>

                    {/* Add button */}
                    <button onClick={() => setModalState({ type: 'add', data: null })}
                        className="inline-flex items-center gap-2 h-9 px-4 text-[13px] font-medium text-white rounded-md bg-blue-600 hover:bg-blue-700 transition-colors shrink-0">
                        <Plus className="w-3.5 h-3.5" /> Add User
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                {columns.map((col) => (
                                    <th key={col.key} scope="col"
                                        className={`sticky top-0 px-5 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] whitespace-nowrap border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm z-10 ${col.sortable ? 'cursor-pointer hover:text-slate-600' : ''}`}
                                        style={{ minWidth: col.minWidth }}
                                        onClick={() => col.sortable && handleSort(col.key)}>
                                        <div className="flex items-center gap-1">
                                            {col.title}
                                            {col.sortable && (
                                                <span className="text-[9px]">
                                                    {sortConfig.key === col.key ? (sortConfig.direction === 'asc' ? '▲' : '▼') : <span className="text-slate-300">⇅</span>}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100/80">
                            {loading ? (
                                [...Array(6)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {columns.map((col) => (
                                            <td key={col.key} className="px-5 py-3"><div className="h-3.5 w-3/4 bg-slate-100 rounded" /></td>
                                        ))}
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr><td colSpan={columns.length} className="px-6 py-14 text-center text-[13px] text-slate-400">No {activeTab === 'admin' ? 'administrators' : 'interviewers'} found.</td></tr>
                            ) : (
                                users.map((row) => (
                                    <tr key={row._id} className="hover:bg-slate-50/60 transition-colors">
                                        {columns.map((col) => (
                                            <td key={col.key} className="px-5 py-2.5 whitespace-nowrap align-middle">
                                                {renderCell(col, row)}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && pagination.totalItems > 0 && (
                    <div className="px-5 py-2.5 border-t border-slate-100 bg-white flex items-center justify-between shrink-0">
                        <p className="text-[11px] text-slate-400">
                            Showing {((pagination.currentPage - 1) * itemsPerPage) + 1}–{Math.min(pagination.currentPage * itemsPerPage, pagination.totalItems)} of {pagination.totalItems}
                        </p>
                        <div className="flex items-center gap-3">
                            <span className="text-[11px] text-slate-500">
                                Page {pagination.currentPage} of {pagination.totalPages}
                            </span>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setPage(p => p - 1)} disabled={pagination.currentPage === 1}
                                    className="h-7 w-7 rounded-md flex items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => setPage(p => p + 1)} disabled={pagination.currentPage === pagination.totalPages}
                                    className="h-7 w-7 rounded-md flex items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
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
