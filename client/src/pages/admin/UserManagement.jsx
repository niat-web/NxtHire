// client/src/pages/admin/UserManagement.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FiEdit, FiPlus, FiTrash2, FiChevronLeft, FiChevronRight,
  FiSearch, FiChevronDown, FiLoader
} from 'react-icons/fi';

// API & Hooks
import { getUsers, deleteUser, updateUser } from '../../api/admin.api';
import { formatDateTime } from '../../utils/formatters';
import { debounce } from '../../utils/helpers';
import { useAlert } from '../../hooks/useAlert';

// Components
import UserFormModal from './UserFormModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Table from '../../components/common/Table';

// --- Styled Components ---

const LocalButton = ({ children, onClick, type = 'button', isLoading = false, variant = 'primary', icon: Icon, disabled = false, size = 'md', className = '', title = '' }) => {
    const base = 'inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] whitespace-nowrap focus:outline-none';
    
    const sizes = {
        xs: 'text-xs px-2 py-1 rounded',
        sm: 'text-xs px-3 py-2 rounded-lg',
        md: 'text-sm px-5 py-2.5 rounded-lg',
        icon: 'p-2 rounded-lg',
    };

    const variants = {
        primary: 'bg-gray-900 text-white hover:bg-black border border-transparent shadow-sm', // Black
        accent: 'bg-[#FFD130] text-gray-900 hover:bg-[#FFC400] border border-[#FFD130] shadow-sm', // Yellow
        outline: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50', // White/Gray
        ghost: 'bg-transparent text-gray-500 hover:text-gray-900 px-0', // Clear All
        danger: 'bg-white text-red-600 border border-red-200 hover:bg-red-50',
    };

    return (
        <button type={type} onClick={onClick} disabled={isLoading || disabled} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} title={title}>
            {isLoading ? <FiLoader className="animate-spin h-4 w-4" /> : (
                <>
                    {Icon && <Icon className={`${children ? 'mr-2' : ''} ${size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />}
                    {children}
                </>
            )}
        </button>
    );
};

const CustomSelect = ({ value, onChange, options, placeholder }) => (
    <div className="relative w-full">
        <select
            value={value}
            onChange={onChange}
            className="w-full appearance-none bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 block p-2.5 pr-8 cursor-pointer hover:border-gray-300 transition-colors"
        >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
        <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
    </div>
);

// --- Main Component ---

const UserManagement = () => {
    const { showSuccess, showError } = useAlert();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 15 });
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const [filters, setFilters] = useState({ search: '', role: '' });
    const [modalState, setModalState] = useState({ type: null, data: null });
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, user: null });
    
    const roleOptions = useMemo(() => [
        { value: 'admin', label: 'Admin' }, 
        { value: 'interviewer', label: 'Interviewer' },
    ], []);

    const fetchUsers = useCallback((pageToFetch = 1) => {
        setLoading(true);
        const params = {
            page: pageToFetch, 
            limit: pagination.itemsPerPage,
            search: filters.search, 
            role: filters.role,
            sortBy: sortConfig.key, 
            sortOrder: sortConfig.direction,
        };
        
        getUsers(params)
            .then(response => {
                const { users, page: currentPage, totalPages, totalDocs } = response.data.data;
                setUsers(users || []);
                setPagination(prev => ({ ...prev, currentPage, totalPages, totalItems: totalDocs }));
            })
            .catch(error => {
                showError('Failed to fetch user data.');
                console.error(error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [filters, sortConfig, showError, pagination.itemsPerPage]);

    // Debounce search (auto-trigger search when typing)
    useEffect(() => {
        const handler = debounce(() => fetchUsers(1), 300);
        handler();
        return () => handler.cancel();
    }, [filters, sortConfig, fetchUsers]);

    const resetFilters = () => setFilters({ search: '', role: '' });

    const toggleActiveStatus = async (userToUpdate) => {
        const originalUsers = [...users];
        // Optimistic update
        setUsers(users.map(user => user._id === userToUpdate._id ? { ...user, isActive: !user.isActive } : user));

        try {
            await updateUser(userToUpdate._id, { isActive: !userToUpdate.isActive });
            showSuccess('User status updated successfully.');
        } catch (err) {
            showError('Failed to update status.');
            setUsers(originalUsers);
        }
    };

    const handleDelete = async () => {
        if(!deleteDialog.user) return;
        try {
            await deleteUser(deleteDialog.user._id);
            showSuccess(`User deleted successfully.`);
            setDeleteDialog({ isOpen: false, user: null });
            fetchUsers(pagination.currentPage);
        } catch (err) {
            showError('Failed to delete user.');
        }
    };

    const getInitials = (firstName = '', lastName = '') => `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`;

    const getAvatarColor = (userId) => {
        if (!userId) return 'bg-gray-100 text-gray-600';
        const colors = [
            'bg-blue-50 text-blue-600 border-blue-100', 
            'bg-purple-50 text-purple-600 border-purple-100', 
            'bg-pink-50 text-pink-600 border-pink-100', 
            'bg-amber-50 text-amber-600 border-amber-100',
            'bg-emerald-50 text-emerald-600 border-emerald-100'
        ];
        const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    // Table Columns
    const columns = useMemo(() => [
        { 
            key: 'name', 
            title: 'User Name', 
            minWidth: '220px', 
            sortable: true, 
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border ${getAvatarColor(row._id)}`}>
                        {getInitials(row.firstName, row.lastName)}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 text-sm">{`${row.firstName} ${row.lastName}`}</span>
                    </div>
                </div>
            )
        },
        {
            key: 'email',
            title: 'Email Address',
            sortable: true,
            minWidth: '220px',
            render: (row) => <span className="text-gray-600 text-sm">{row.email}</span>,
        },
        {
            key: 'role', 
            title: 'Role', 
            sortable: true, 
            minWidth: '120px', 
            render: (row) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium capitalize border ${
                    row.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                    {row.role}
                </span>
            )
        },
        { 
            key: 'isActive', 
            title: 'Status', 
            sortable: true, 
            minWidth: '120px', 
            render: (row) => (
                <button
                    onClick={() => toggleActiveStatus(row)}
                    className={`relative w-10 h-5 rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                        row.isActive ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    title={row.isActive ? 'Active' : 'Inactive'}
                >
                    <span className={`block w-3.5 h-3.5 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out mt-[3px] ml-[3px] ${
                        row.isActive ? 'translate-x-5' : 'translate-x-0'
                    }`}/>
                </button>
            )
        },
        { 
            key: 'lastLogin', 
            title: 'Last Login', 
            sortable: true, 
            minWidth: '180px', 
            render: (row) => (
                <span className="text-gray-500 text-xs">
                    {row.lastLogin ? formatDateTime(row.lastLogin) : 'Never logged in'}
                </span>
            )
        },
        { 
            key: 'actions', 
            title: 'Actions', 
            minWidth: '100px', 
            render: (row) => (
                <div className="flex items-center gap-1">
                     <button 
                        onClick={() => setModalState({ type: 'edit', data: row })}
                        className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" 
                        title="Edit User"
                    >
                        <FiEdit className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setDeleteDialog({ isOpen: true, user: row })}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                        title="Delete User"
                    >
                        <FiTrash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ], [users, toggleActiveStatus]);

    return (
        <div className="flex flex-col h-full bg-[#F5F7F9]">
            
            {/* 1. Filters & Actions Card */}
            <div className="p-6 flex-shrink-0">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-end justify-between gap-4">
                    {/* Filters */}
                    <div className="flex flex-wrap items-end gap-3 w-full md:w-auto">
                        <div className="w-full sm:w-64">
                            <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Search</label>
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    value={filters.search} 
                                    onChange={(e) => setFilters(p => ({ ...p, search: e.target.value }))} 
                                    placeholder="Search by name or email..." 
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors" 
                                />
                            </div>
                        </div>

                        <div className="w-full sm:w-44">
                            <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Role</label>
                            <CustomSelect 
                                value={filters.role} 
                                onChange={(e) => setFilters(p => ({ ...p, role: e.target.value }))} 
                                options={roleOptions} 
                                placeholder="All Roles" 
                            />
                        </div>

                        {(filters.search || filters.role) && (
                            <LocalButton variant="ghost" size="sm" onClick={resetFilters} className="mb-0.5">CLEAR ALL</LocalButton>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                        <LocalButton variant="accent" icon={FiPlus} onClick={() => setModalState({ type: 'add', data: null })}>Add New User</LocalButton>
                    </div>
                </div>
            </div>

            {/* 2. Table Area (Full Fit) */}
            <div className="flex-1 px-6 pb-6 overflow-hidden">
                <div className="h-full bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex-1 overflow-auto">
                        <Table 
                            columns={columns} 
                            data={users} 
                            isLoading={loading} 
                            sortConfig={sortConfig} 
                            onSort={(key) => setSortConfig(p => ({ key, direction: p.key === key && p.direction === 'asc' ? 'desc' : 'asc' }))} 
                            emptyMessage="No users found."
                        />
                    </div>

                    {/* Pagination Footer */}
                    {!loading && pagination.totalItems > 0 && (
                        <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center bg-white rounded-b-xl gap-4">
                            <div className="flex items-center gap-2">
                                <LocalButton variant="outline" size="icon" icon={FiChevronLeft} onClick={() => fetchUsers(pagination.currentPage - 1)} disabled={pagination.currentPage === 1} />
                                <span className="text-sm font-medium text-gray-600">
                                    Page <b className="text-gray-900">{pagination.currentPage}</b> of {pagination.totalPages}
                                </span>
                                <LocalButton variant="outline" size="icon" icon={FiChevronRight} onClick={() => fetchUsers(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages} />
                            </div>

                            <div className="text-xs text-gray-500 font-medium">
                                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} - {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} users
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {modalState.type && (
                <UserFormModal 
                    isOpen={!!modalState.type} 
                    onClose={() => setModalState({ type: null, data: null })} 
                    onSuccess={() => { setModalState({ type: null, data: null }); fetchUsers(pagination.currentPage); }} 
                    userData={modalState.data} 
                />
            )}
            
            <ConfirmDialog 
                isOpen={deleteDialog.isOpen} 
                onClose={() => setDeleteDialog({ isOpen: false, user: null })} 
                onConfirm={handleDelete} 
                title="Delete User" 
                message={deleteDialog.user ? `Are you sure you want to delete "${deleteDialog.user.firstName} ${deleteDialog.user.lastName}"?` : "Confirm deletion?"} 
                confirmVariant="danger"
            />
        </div>
    );
};

export default UserManagement;
