// // client/src/pages/admin/UserManagement.jsx
// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { 
//   FiEdit, 
//   FiFilter, 
//   FiPlus, 
//   FiTrash2, 
//   FiToggleLeft, 
//   FiToggleRight, 
//   FiChevronLeft, 
//   FiChevronRight, 
//   FiRefreshCw,
//   FiUser,
//   FiUsers,
//   FiAlertCircle
// } from 'react-icons/fi';
// import Button from '../../components/common/Button';
// import Badge from '../../components/common/Badge';
// import SearchInput from '../../components/common/SearchInput';
// import FilterDropdown from '../../components/common/FilterDropdown';
// import { getUsers, deleteUser, updateUser } from '../../api/admin.api';
// import { formatDateTime } from '../../utils/formatters';
// import { debounce } from '../../utils/helpers';
// import { useAlert } from '../../hooks/useAlert';
// import UserFormModal from './UserFormModal';
// import ConfirmDialog from '../../components/common/ConfirmDialog';
// import Table from '../../components/common/Table';
// import DropdownMenu from '../../components/common/DropdownMenu';

// const UserManagement = () => {
//     const { showSuccess, showError } = useAlert();
//     const [loading, setLoading] = useState(true);
//     const [users, setUsers] = useState([]);
//     const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
//     const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
//     const [filters, setFilters] = useState({ search: '', role: '' });
//     const [modalState, setModalState] = useState({ type: null, data: null });
//     const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, user: null });
//     const [stats, setStats] = useState({ total: 0, active: 0, admins: 0, interviewers: 0 });

//     const roleOptions = useMemo(() => [
//         { value: '', label: 'All Roles' }, 
//         { value: 'admin', label: 'Admin' }, 
//         { value: 'interviewer', label: 'Interviewer' },
//     ], []);

//     const fetchUsers = useCallback((pageToFetch) => {
//         setLoading(true);
//         const params = {
//             page: pageToFetch, 
//             limit: 10,
//             search: filters.search, 
//             role: filters.role,
//             sortBy: sortConfig.key, 
//             sortOrder: sortConfig.direction,
//         };
        
//         getUsers(params)
//             .then(response => {
//                 const { users, page: currentPage, totalPages, totalDocs } = response.data.data;
//                 setUsers(users || []);
//                 setPagination({ currentPage, totalPages, totalItems: totalDocs });
                
//                 // Calculate stats based on the full dataset provided by the API
//                 // In a real app, you might want to have a separate API endpoint for stats
//                 if (users) {
//                     setStats({
//                         total: totalDocs,
//                         active: users.filter(user => user.isActive).length,
//                         admins: users.filter(user => user.role === 'admin').length,
//                         interviewers: users.filter(user => user.role === 'interviewer').length
//                     });
//                 }
//             })
//             .catch(error => {
//                 showError('Failed to fetch user data.');
//                 console.error(error);
//             })
//             .finally(() => {
//                 setLoading(false);
//             });
//     }, [filters, sortConfig, showError]);

//     useEffect(() => {
//         const handler = debounce(() => fetchUsers(1), 300);
//         handler();
//         return () => handler.cancel();
//     }, [filters, sortConfig, fetchUsers]);
    
//     const handleFilterChange = (key, value) => {
//         setFilters(prev => ({ ...prev, [key]: value }));
//     };

//     const handleSort = (key) => {
//         setSortConfig(prev => ({ 
//             key, 
//             direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' 
//         }));
//     };
    
//     const handlePageChange = (page) => {
//         if (page > 0 && page <= pagination.totalPages) {
//             fetchUsers(page);
//         }
//     };
    
//     const handleModalSuccess = () => {
//         setModalState({ type: null, data: null });
//         fetchUsers(pagination.currentPage);
//     };

//     const handleDelete = async () => {
//         if(!deleteDialog.user) return;
//         try {
//             await deleteUser(deleteDialog.user._id);
//             showSuccess(`User ${deleteDialog.user.firstName} ${deleteDialog.user.lastName} has been deactivated.`);
//             setDeleteDialog({ isOpen: false, user: null });
//             fetchUsers(pagination.currentPage);
//         } catch (err) {
//             showError('Failed to deactivate user.');
//             console.error(err);
//         }
//     };

//     const toggleActiveStatus = async (userToUpdate) => {
//         const originalUsers = [...users];
        
//         // Optimistically update the UI first
//         const optimisticUsers = users.map(user => 
//             user._id === userToUpdate._id ? { ...user, isActive: !user.isActive } : user
//         );
//         setUsers(optimisticUsers);

//         try {
//             // Make the API call in the background
//             await updateUser(userToUpdate._id, { isActive: !userToUpdate.isActive });
//             showSuccess('User status updated successfully.');
//         } catch (err) {
//             // If the API call fails, revert the UI and show an error
//             showError('Failed to update user status. Reverting change.');
//             setUsers(originalUsers);
//             console.error(err);
//         }
//     };

//     const getInitials = (firstName = '', lastName = '') => {
//         return `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`;
//     };

//     const getAvatarColor = (userId) => {
//         if (!userId) return 'bg-blue-100 text-blue-600';
        
//         const colors = [
//             'bg-blue-100 text-blue-600',
//             'bg-green-100 text-green-600',
//             'bg-purple-100 text-purple-600',
//             'bg-yellow-100 text-yellow-600',
//             'bg-pink-100 text-pink-600',
//             'bg-indigo-100 text-indigo-600'
//         ];
        
//         // Simple hash function to deterministically assign a color based on user ID
//         const hash = userId.split('').reduce((acc, char) => {
//             return acc + char.charCodeAt(0);
//         }, 0);
        
//         return colors[hash % colors.length];
//     };

//     const userColumns = useMemo(() => [
//         { 
//             key: 'name', 
//             title: 'User', 
//             minWidth: '250px', 
//             sortable: true, 
//             render: (row) => (
//                 <div className="flex items-center">
//                     <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mr-3 flex-shrink-0 ${getAvatarColor(row._id)}`}>
//                         {getInitials(row.firstName, row.lastName)}
//                     </div>
//                     <div>
//                         <div className="font-semibold text-gray-800">{`${row.firstName} ${row.lastName}`}</div>
//                         <div className="text-xs text-gray-500">{row.email}</div>
//                     </div>
//                 </div>
//             )
//         },
//         {
//             key: 'role', 
//             title: 'Role', 
//             sortable: true, 
//             minWidth: '120px', 
//             render: (row) => (
//                 <Badge
//                     variant={row.role === 'admin' ? 'info' : 'success'}
//                     className="capitalize"
//                 >
//                     {row.role}
//                 </Badge>
//             )
//         },
//         { 
//             key: 'isActive', 
//             title: 'Status', 
//             sortable: true, 
//             minWidth: '120px', 
//             render: (row) => (
//                 <div className="flex items-center">
//                     <button
//                         onClick={() => toggleActiveStatus(row)}
//                         className={`relative w-11 h-6 rounded-full p-0.5 transition-colors duration-300 ease-in-out flex items-center ${
//                             row.isActive ? 'bg-green-500' : 'bg-gray-300'
//                         }`}
//                         title={row.isActive ? 'Active (Click to Deactivate)' : 'Inactive (Click to Activate)'}
//                     >
//                         <span className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
//                             row.isActive ? 'translate-x-5' : 'translate-x-0'
//                         }`}/>
//                     </button>
//                     <span className={`ml-2 text-sm ${row.isActive ? 'text-green-600' : 'text-gray-500'}`}>
//                         {row.isActive ? 'Active' : 'Inactive'}
//                     </span>
//                 </div>
//             )
//         },
//         { 
//             key: 'lastLogin', 
//             title: 'Last Login', 
//             sortable: true, 
//             minWidth: '180px', 
//             render: (row) => (
//                 <div className="flex items-center">
//                     <span className={`inline-block w-2 h-2 rounded-full mr-2 ${row.lastLogin ? 'bg-green-500' : 'bg-gray-300'}`}></span>
//                     <span>{row.lastLogin ? formatDateTime(row.lastLogin) : 'Never'}</span>
//                 </div>
//             )
//         },
//         { 
//             key: 'actions', 
//             title: 'Actions', 
//             minWidth: '100px', 
//             render: (row) => (
//                 <DropdownMenu 
//                     options={[
//                         { 
//                             label: 'Edit User', 
//                             icon: FiEdit, 
//                             onClick: () => setModalState({ type: 'edit', data: row }) 
//                         },
//                         { 
//                             label: row.isActive ? 'Deactivate User' : 'Activate User', 
//                             icon: row.isActive ? FiToggleLeft : FiToggleRight, 
//                             onClick: () => toggleActiveStatus(row)
//                         },
//                         { 
//                             label: 'Delete User', 
//                             icon: FiTrash2, 
//                             isDestructive: true, 
//                             onClick: () => setDeleteDialog({ isOpen: true, user: row }) 
//                         },
//                     ]} 
//                 />
//             ),
//         },
//     ], [users]);

//     const StatCard = ({ icon, title, value, color }) => (
//         <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center ${color}`}>
//             <div className={`w-12 h-12 rounded-full ${color} bg-opacity-20 flex items-center justify-center mr-4`}>
//                 {icon}
//             </div>
//             <div>
//                 <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
//                 <p className="text-2xl font-bold">{value}</p>
//             </div>
//         </div>
//     );

//     return (
//         <div className="space-y-6">
//             {/* Header with Stats */}
//             <div>
//                 <div className="flex justify-between items-center mb-6">
//                     <div>
//                     </div>
//                     <Button 
//                         variant="primary" 
//                         onClick={() => setModalState({ type: 'add', data: null })}
//                         className="px-4 py-2 shadow-md hover:shadow-lg transition-shadow"
//                     >
//                         Add New User
//                     </Button>
//                 </div>

//                 {/* Stats Cards */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//                     <StatCard 
//                         icon={<FiUsers className="h-6 w-6 text-blue-600" />} 
//                         title="Total Users" 
//                         value={stats.total || 0} 
//                         color="text-blue-600" 
//                     />
//                     <StatCard 
//                         icon={<FiUser className="h-6 w-6 text-green-600" />} 
//                         title="Active Users" 
//                         value={stats.active || 0} 
//                         color="text-green-600" 
//                     />
//                     <StatCard 
//                         icon={<FiUser className="h-6 w-6 text-purple-600" />} 
//                         title="Admins" 
//                         value={stats.admins || 0} 
//                         color="text-purple-600" 
//                     />
//                     <StatCard 
//                         icon={<FiUser className="h-6 w-6 text-yellow-600" />} 
//                         title="Interviewers" 
//                         value={stats.interviewers || 0} 
//                         color="text-yellow-600" 
//                     />
//                 </div>
//             </div>

//             {/* Main Content Area */}
//             <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
//                 {/* Filters */}
//                 <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-200 bg-gray-50">
//                     <div className="w-full md:w-72">
//                         <SearchInput 
//                             value={filters.search} 
//                             onChange={(e) => handleFilterChange('search', e.target.value)} 
//                             onClear={() => handleFilterChange('search', '')} 
//                             placeholder="Search by name or email..." 
//                             className="w-full" 
//                         />
//                     </div>
//                     <div className="flex items-center gap-4 flex-wrap">
//                         <FilterDropdown 
//                             label="Role" 
//                             options={roleOptions} 
//                             selectedValue={filters.role} 
//                             onChange={(val) => handleFilterChange('role', val)} 
//                         />
//                         <Button 
//                             variant="outline" 
//                             icon={<FiRefreshCw className="h-4 w-4" />} 
//                             onClick={() => fetchUsers(1)} 
//                             title="Refresh Data"
//                             className="flex items-center"
//                         >
//                             <span className="ml-1 hidden sm:inline">Refresh</span>
//                         </Button>
//                     </div>
//                 </div>

//                 {/* Table with Empty State */}
//                 {loading ? (
//                     <div className="flex justify-center items-center p-12">
//                         <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
//                     </div>
//                 ) : users.length === 0 ? (
//                     <div className="text-center p-12">
//                         <FiAlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
//                         <h3 className="text-lg font-semibold text-gray-800 mb-2">No users found</h3>
//                         <p className="text-gray-500 mb-6">
//                             {filters.search || filters.role ? 
//                                 'Try adjusting your search or filters to find what you\'re looking for.' : 
//                                 'Get started by adding your first user to the system.'}
//                         </p>
//                         <Button 
//                             variant="primary" 
//                             icon={<FiPlus />} 
//                             onClick={() => setModalState({ type: 'add', data: null })}
//                         >
//                             Add New User
//                         </Button>
//                     </div>
//                 ) : (
//                     <Table 
//                         columns={userColumns} 
//                         data={users} 
//                         isLoading={loading} 
//                         sortConfig={sortConfig} 
//                         onSort={handleSort} 
//                         emptyMessage="No users found."
//                         className="min-w-full divide-y divide-gray-200"
//                         rowClassName="hover:bg-gray-50 transition-colors duration-150"
//                     />
//                 )}

//                 {/* Pagination */}
//                 {!loading && users.length > 0 && pagination && pagination.totalItems > 10 && (
//                     <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
//                         <div>
//                             <p className="text-sm text-gray-700">
//                                 Showing <span className="font-medium">{(pagination.currentPage - 1) * 10 + 1}</span> to <span className="font-medium">{Math.min(pagination.currentPage * 10, pagination.totalItems)}</span> of{' '}
//                                 <span className="font-medium">{pagination.totalItems}</span> results
//                             </p>
//                         </div>
//                         <div className="flex space-x-2">
//                             <Button 
//                                 variant="outline" 
//                                 onClick={() => handlePageChange(pagination.currentPage - 1)} 
//                                 disabled={pagination.currentPage <= 1}
//                                 className="px-3 py-2"
//                             >
//                                 <FiChevronLeft className="h-4 w-4"/>
//                             </Button>
                            
//                             {/* Page numbers */}
//                             <div className="hidden md:flex space-x-1">
//                                 {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
//                                     let pageNumber;
                                    
//                                     if (pagination.totalPages <= 5) {
//                                         pageNumber = i + 1;
//                                     } else if (pagination.currentPage <= 3) {
//                                         pageNumber = i + 1;
//                                     } else if (pagination.currentPage >= pagination.totalPages - 2) {
//                                         pageNumber = pagination.totalPages - 4 + i;
//                                     } else {
//                                         pageNumber = pagination.currentPage - 2 + i;
//                                     }
                                    
//                                     return (
//                                         <Button
//                                             key={i}
//                                             variant={pageNumber === pagination.currentPage ? "primary" : "outline"}
//                                             onClick={() => handlePageChange(pageNumber)}
//                                             className="px-3 py-2 min-w-[40px]"
//                                         >
//                                             {pageNumber}
//                                         </Button>
//                                     );
//                                 })}
//                             </div>
                            
//                             <Button 
//                                 variant="outline" 
//                                 onClick={() => handlePageChange(pagination.currentPage + 1)} 
//                                 disabled={pagination.currentPage >= pagination.totalPages}
//                                 className="px-3 py-2"
//                             >
//                                 <FiChevronRight className="h-4 w-4"/>
//                             </Button>
//                         </div>
//                     </div>
//                 )}
//             </div>

//             {/* Modals */}
//             {modalState.type && (
//                 <UserFormModal 
//                     isOpen={!!modalState.type} 
//                     onClose={() => setModalState({ type: null, data: null })} 
//                     onSuccess={handleModalSuccess} 
//                     userData={modalState.data} 
//                 />
//             )}
            
//             <ConfirmDialog 
//                 isOpen={deleteDialog.isOpen} 
//                 onClose={() => setDeleteDialog({ isOpen: false, user: null })} 
//                 onConfirm={handleDelete} 
//                 title="Deactivate User" 
//                 message={deleteDialog.user ? 
//                     `Are you sure you want to deactivate the user "${deleteDialog.user.firstName} ${deleteDialog.user.lastName}"? This can be undone later.` :
//                     "Are you sure you want to deactivate this user? This can be undone later."
//                 } 
//                 confirmVariant="danger"
//                 confirmText="Deactivate"
//                 cancelText="Cancel"
//             />
//         </div>
//     );
// };

// export default UserManagement;


// client/src/pages/admin/UserManagement.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FiEdit,
  FiFilter,
  FiPlus,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiUser,
  FiAlertCircle
} from 'react-icons/fi';
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

// Self-contained Button for advanced pagination
const LocalButton = ({ children, onClick, type = 'button', icon, variant = 'primary', className = '', disabled = false }) => {
    const baseClasses = "inline-flex items-center justify-center font-medium rounded-md focus:outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed";
    const variantClasses = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
        ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
    };
    return (
        <button type={type} onClick={onClick} disabled={disabled} className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
            {icon}
            {children}
        </button>
    );
};


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
        { value: '', label: 'All Roles' }, 
        { value: 'admin', label: 'Admin' }, 
        { value: 'interviewer', label: 'Interviewer' },
    ], []);

    const fetchUsers = useCallback((pageToFetch) => {
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

    useEffect(() => {
        const handler = debounce(() => fetchUsers(1), 300);
        handler();
        return () => handler.cancel();
    }, [filters, sortConfig, fetchUsers]);
    
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSort = (key) => {
        setSortConfig(prev => ({ 
            key, 
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' 
        }));
    };
    
    const handlePageChange = (page) => {
        if (page > 0 && page <= pagination.totalPages) {
            fetchUsers(page);
        }
    };
    
    const handleItemsPerPageChange = (e) => {
        const newSize = parseInt(e.target.value, 10);
        setPagination(prev => ({ ...prev, itemsPerPage: newSize }));
        fetchUsers(1);
    };

    const handleModalSuccess = () => {
        setModalState({ type: null, data: null });
        fetchUsers(pagination.currentPage);
    };

    const handleDelete = async () => {
        if(!deleteDialog.user) return;
        try {
            await deleteUser(deleteDialog.user._id);
            showSuccess(`User ${deleteDialog.user.firstName} ${deleteDialog.user.lastName} has been permanently deleted.`);
            setDeleteDialog({ isOpen: false, user: null });
            fetchUsers(pagination.currentPage);
        } catch (err) {
            showError('Failed to delete user.');
            console.error(err);
        }
    };

    const toggleActiveStatus = async (userToUpdate) => {
        const originalUsers = [...users];
        
        const optimisticUsers = users.map(user => 
            user._id === userToUpdate._id ? { ...user, isActive: !user.isActive } : user
        );
        setUsers(optimisticUsers);

        try {
            await updateUser(userToUpdate._id, { isActive: !userToUpdate.isActive });
            showSuccess('User status updated successfully.');
        } catch (err) {
            showError('Failed to update user status. Reverting change.');
            setUsers(originalUsers);
            console.error(err);
        }
    };

    const getInitials = (firstName = '', lastName = '') => {
        return `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`;
    };

    const getAvatarColor = (userId) => {
        if (!userId) return 'bg-blue-100 text-blue-600';
        
        const colors = [
            'bg-blue-100 text-blue-600', 'bg-green-100 text-green-600',
            'bg-purple-100 text-purple-600', 'bg-yellow-100 text-yellow-600',
            'bg-pink-100 text-pink-600', 'bg-indigo-100 text-indigo-600'
        ];
        
        const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        
        return colors[hash % colors.length];
    };

    const userColumns = useMemo(() => [
        { 
            key: 'name', 
            title: 'User', 
            minWidth: '250px', 
            sortable: true, 
            render: (row) => (
                <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mr-3 flex-shrink-0 ${getAvatarColor(row._id)}`}>
                        {getInitials(row.firstName, row.lastName)}
                    </div>
                    <div>
                        <div className="font-semibold text-gray-800">{`${row.firstName} ${row.lastName}`}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'email',
            title: 'Email ID',
            sortable: true,
            minWidth: '220px',
            render: (row) => row.email,
        },
        {
            key: 'role', 
            title: 'Role', 
            sortable: true, 
            minWidth: '120px', 
            render: (row) => (
                <Badge
                    variant={row.role === 'admin' ? 'info' : 'success'}
                    className="capitalize"
                >
                    {row.role}
                </Badge>
            )
        },
        { 
            key: 'isActive', 
            title: 'Status', 
            sortable: true, 
            minWidth: '120px', 
            render: (row) => (
                <div className="flex items-center">
                    <button
                        onClick={() => toggleActiveStatus(row)}
                        className={`relative w-11 h-6 rounded-full p-0.5 transition-colors duration-300 ease-in-out flex items-center ${
                            row.isActive ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                        title={row.isActive ? 'Active (Click to Deactivate)' : 'Inactive (Click to Activate)'}
                    >
                        <span className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
                            row.isActive ? 'translate-x-5' : 'translate-x-0'
                        }`}/>
                    </button>
                    <span className={`ml-2 text-sm ${row.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                        {row.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
            )
        },
        { 
            key: 'lastLogin', 
            title: 'Last Login', 
            sortable: true, 
            minWidth: '180px', 
            render: (row) => (
                <div className="flex items-center">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${row.lastLogin ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    <span>{row.lastLogin ? formatDateTime(row.lastLogin) : 'Never'}</span>
                </div>
            )
        },
        { 
            key: 'actions', 
            title: 'Actions', 
            minWidth: '100px', 
            render: (row) => (
                <DropdownMenu 
                    options={[
                        { 
                            label: 'Edit User', 
                            icon: FiEdit, 
                            onClick: () => setModalState({ type: 'edit', data: row }) 
                        },
                        { 
                            label: 'Delete User', 
                            icon: FiTrash2, 
                            isDestructive: true, 
                            onClick: () => setDeleteDialog({ isOpen: true, user: row }) 
                        },
                    ]} 
                />
            ),
        },
    ], [users, toggleActiveStatus]);

    return (
        <div className="h-full flex flex-col">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden flex-1 flex flex-col">
                <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                    <div className="w-full md:w-72">
                        <SearchInput 
                            value={filters.search} 
                            onChange={(e) => handleFilterChange('search', e.target.value)} 
                            onClear={() => handleFilterChange('search', '')} 
                            placeholder="Search by name or email..." 
                            className="w-full" 
                        />
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                        <FilterDropdown 
                            label="Role" 
                            options={roleOptions} 
                            selectedValue={filters.role} 
                            onChange={(val) => handleFilterChange('role', val)} 
                        />
                        <Button
                            variant="primary"
                            icon={<FiPlus className="h-4 w-4" />}
                            onClick={() => setModalState({ type: 'add', data: null })}
                            title="Add New User"
                            className="flex items-center"
                        >
                            <span className="ml-1 hidden sm:inline">Add New User</span>
                        </Button>
                    </div>
                </div>

                <div className="flex-grow overflow-auto">
                    {loading ? (
                        <div className="flex justify-center items-center p-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center p-12">
                            <FiAlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">No users found</h3>
                            <p className="text-gray-500 mb-6">
                                {filters.search || filters.role ? 
                                    'Try adjusting your search or filters to find what you\'re looking for.' : 
                                    'Get started by adding your first user to the system.'}
                            </p>
                            <Button 
                                variant="primary" 
                                icon={<FiPlus />} 
                                onClick={() => setModalState({ type: 'add', data: null })}
                            >
                                Add New User
                            </Button>
                        </div>
                    ) : (
                        <Table 
                            columns={userColumns} 
                            data={users} 
                            isLoading={loading} 
                            sortConfig={sortConfig} 
                            onSort={handleSort} 
                            emptyMessage="No users found."
                            className="min-w-full divide-y divide-gray-200"
                            rowClassName="hover:bg-gray-50 transition-colors duration-150"
                        />
                    )}
                </div>

                {!loading && pagination && pagination.totalItems > 0 && (
                    <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0"> 
                        <div className="flex items-center space-x-2 text-sm text-gray-700"> 
                            <span>Rows per page</span>
                            <select value={pagination.itemsPerPage} onChange={handleItemsPerPageChange} className="bg-white border border-gray-300 rounded-lg px-2 py-1 text-gray-800"> 
                                {[10, 15, 20, 50].map(size => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                            </select>
                        </div>
                        <div className="text-sm text-gray-700"> 
                            {pagination.totalItems === 0 
                                ? '0 of 0 rows' 
                                : `${(pagination.currentPage - 1) * pagination.itemsPerPage + 1}-${Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of ${pagination.totalItems} rows`}
                        </div>
                        <div className="flex items-center space-x-2">
                            <LocalButton variant="ghost" icon={<FiChevronsLeft />} onClick={() => handlePageChange(1)} disabled={pagination.currentPage === 1} className="!p-1.5"/>
                            <LocalButton variant="ghost" icon={<FiChevronLeft />} onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1} className="!p-1.5"/>
                            <div className="flex -space-x-px">
                                {(() => {
                                    const pageButtons = [];
                                    const totalPages = pagination.totalPages;
                                    const currentPage = pagination.currentPage;
                                    const maxVisiblePages = 5;
                                    if (totalPages <= maxVisiblePages) {
                                        for (let i = 1; i <= totalPages; i++) pageButtons.push(i);
                                    } else {
                                        pageButtons.push(1, 2);
                                        if (currentPage > 4) pageButtons.push('...');
                                        let start = Math.max(3, currentPage - 1);
                                        let end = Math.min(totalPages - 2, currentPage + 1);
                                        if (currentPage <= 3) { end = 5; start = 3; } 
                                        else if (currentPage >= totalPages - 2) { start = totalPages - 4; end = totalPages - 2; }
                                        for (let i = start; i <= end; i++) { if (!pageButtons.includes(i)) pageButtons.push(i); }
                                        if (currentPage < totalPages - 3 && !pageButtons.includes('...')) pageButtons.push('...');
                                        if (totalPages > 2 && !pageButtons.includes(totalPages-1)) pageButtons.push(totalPages-1);
                                        if (totalPages > 1 && !pageButtons.includes(totalPages)) pageButtons.push(totalPages);
                                    }
                                    let finalCleanedButtons = [];
                                    for (let i = 0; i < pageButtons.length; i++) {
                                        if (pageButtons[i] === '...' && i > 0 && pageButtons[i-1] === '...') continue;
                                        finalCleanedButtons.push(pageButtons[i]);
                                    }
                                    if (finalCleanedButtons.length === 0 && totalPages >= 1) { 
                                         for(let i =1; i<= Math.min(5, totalPages); i++) finalCleanedButtons.push(i);
                                         if(totalPages > 5) finalCleanedButtons.push('...');
                                         if(totalPages > 5 && !finalCleanedButtons.includes(totalPages)) finalCleanedButtons.push(totalPages);
                                    }
                                    return finalCleanedButtons.map((pageNum, index) => {
                                      if (pageNum === '...') return <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-500">...</span>;
                                      return (<LocalButton key={pageNum} variant={pagination.currentPage === pageNum ? "primary" : "ghost"} onClick={() => handlePageChange(pageNum)} className="!px-3 !py-1">{pageNum}</LocalButton>);
                                  });
                                })()}
                            </div>
                            <LocalButton variant="ghost" icon={<FiChevronRight />} onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages} className="!p-1.5"/>
                            <LocalButton variant="ghost" icon={<FiChevronsRight />} onClick={() => handlePageChange(pagination.totalPages)} disabled={pagination.currentPage === pagination.totalPages} className="!p-1.5"/>
                        </div>
                    </div>
                )}
            </div>

            {modalState.type && (
                <UserFormModal 
                    isOpen={!!modalState.type} 
                    onClose={() => setModalState({ type: null, data: null })} 
                    onSuccess={handleModalSuccess} 
                    userData={modalState.data} 
                />
            )}
            
            <ConfirmDialog 
                isOpen={deleteDialog.isOpen} 
                onClose={() => setDeleteDialog({ isOpen: false, user: null })} 
                onConfirm={handleDelete} 
                title="Permanently Delete User" 
                message={deleteDialog.user ? 
                    `Are you sure you want to permanently delete "${deleteDialog.user.firstName} ${deleteDialog.user.lastName}"? This action cannot be undone and will also delete their interviewer profile.` :
                    "Are you sure you want to permanently delete this user?"
                } 
                confirmVariant="danger"
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    );
};

export default UserManagement;
