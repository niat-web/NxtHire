// client/src/pages/admin/LinkedInReviewPage.jsx

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { RefreshCw, ExternalLink, Check, X, Eye, Search, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { processLinkedInReview } from '../../api/admin.api';
import { APPLICATION_STATUS } from '../../utils/constants';
import { useAlert } from '../../hooks/useAlert';
import { formatDate } from '../../utils/formatters';
import { debounce } from '../../utils/helpers';
import { Link } from 'react-router-dom';
import { useApplicants, useInvalidateAdmin } from '../../hooks/useAdminQueries';

const getStatusBadge = (status) => {
  const map = {
    [APPLICATION_STATUS.SUBMITTED]: { label: 'Submitted', cls: 'bg-blue-50 text-blue-700 border-blue-100' },
    [APPLICATION_STATUS.PROFILE_APPROVED]: { label: 'Profile Approved', cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    [APPLICATION_STATUS.PROFILE_REJECTED]: { label: 'Profile Rejected', cls: 'bg-red-50 text-red-700 border-red-100' },
  };
  const config = map[status] || { label: status || 'Unknown', cls: 'bg-slate-50 text-slate-600 border-slate-100' };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] border ${config.cls}`}>
      {config.label}
    </span>
  );
};

const LinkedInReviewPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [processingIds, setProcessingIds] = useState(new Set());
  const { showSuccess, showError } = useAlert();
  const { invalidateApplicants, invalidateDashboard } = useInvalidateAdmin();

  // Debounce search input
  const debouncedUpdate = useMemo(() => debounce((value) => {
      setDebouncedSearch(value);
      setCurrentPage(1);
  }, 300), []);

  useEffect(() => { debouncedUpdate(searchTerm); return () => debouncedUpdate.cancel(); }, [searchTerm, debouncedUpdate]);

  // Reset to page 1 when filter changes
  useEffect(() => { setCurrentPage(1); }, [statusFilter]);

  const defaultStatuses = useMemo(() => [
      APPLICATION_STATUS.SUBMITTED,
      APPLICATION_STATUS.PROFILE_APPROVED,
      APPLICATION_STATUS.PROFILE_REJECTED
  ].join(','), []);

  const queryParams = useMemo(() => ({
      status: statusFilter || defaultStatuses,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
      page: currentPage,
      limit: 10,
      search: debouncedSearch,
  }), [statusFilter, currentPage, debouncedSearch, defaultStatuses]);

  const { data, isLoading: loading } = useApplicants(queryParams, {
      keepPreviousData: true,
  });

  const applicants = data?.applicants || [];
  const pagination = {
      currentPage: data?.page || 1,
      totalPages: data?.totalPages || 1,
      totalItems: data?.totalDocs || 0,
  };

  const statusOptions = useMemo(() => [
    { value: '', label: 'All Review Stages' },
    { value: APPLICATION_STATUS.SUBMITTED, label: 'Pending Review' },
    { value: APPLICATION_STATUS.PROFILE_APPROVED, label: 'Approved' },
    { value: APPLICATION_STATUS.PROFILE_REJECTED, label: 'Rejected' },
  ], []);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleReviewDecision = useCallback(async (applicantId, decision) => {
    setProcessingIds(prev => new Set(prev).add(applicantId));
    try {
      await processLinkedInReview(applicantId, {
        decision,
        rejectionReason: decision === 'reject' ? 'Profile did not meet requirements upon review.' : undefined
      });
      showSuccess(`Application ${decision === 'approve' ? 'approved' : 'rejected'} successfully.`);
      invalidateApplicants();
      invalidateDashboard();
    } catch (error) {
      showError(error.response?.data?.message || `Failed to ${decision} application.`);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(applicantId);
        return newSet;
      });
    }
  }, [showError, showSuccess, invalidateApplicants, invalidateDashboard]);

  const columns = [
    { key: 'fullName', title: 'Applicant', minWidth: '180px' },
    { key: 'email', title: 'Contact', minWidth: '200px' },
    { key: 'linkedinProfileUrl', title: 'LinkedIn Profile', minWidth: '140px' },
    { key: 'status', title: 'Status', minWidth: '150px' },
    { key: 'updatedAt', title: 'Last Action', minWidth: '140px' },
    { key: 'actions', title: 'Actions', minWidth: '200px' },
  ];

  const renderCell = (col, row) => {
    switch (col.key) {
      case 'fullName':
        return <span className="text-sm font-medium text-slate-900">{row.fullName}</span>;
      case 'email':
        return <span className="text-sm text-slate-600">{row.email}</span>;
      case 'linkedinProfileUrl':
        return (
          <a href={row.linkedinProfileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center text-sm">
            View <ExternalLink className="ml-1 h-3.5 w-3.5" />
          </a>
        );
      case 'status':
        return getStatusBadge(row.status);
      case 'updatedAt':
        return <span className="text-sm text-slate-600">{formatDate(row.updatedAt)}</span>;
      case 'actions': {
        const isProcessing = processingIds.has(row._id);
        const isReviewed = [APPLICATION_STATUS.PROFILE_APPROVED, APPLICATION_STATUS.PROFILE_REJECTED].includes(row.status);

        if (isProcessing) {
          return <span className="text-xs text-gray-500 italic">Processing...</span>;
        }

        if (isReviewed) {
          return (
            <Link to={`/admin/applicants/${row._id}`} className="text-blue-600 hover:underline text-sm flex items-center">
              <Eye className="mr-1 h-3.5 w-3.5" />
              View Details
            </Link>
          );
        }

        return (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleReviewDecision(row._id, 'approve')}
              className="inline-flex items-center px-2 h-7 text-xs font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors"
            >
              <Check className="mr-1 h-3 w-3" /> Approve
            </button>
            <button
              onClick={() => handleReviewDecision(row._id, 'reject')}
              className="inline-flex items-center px-2 h-7 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
            >
              <X className="mr-1 h-3 w-3" /> Reject
            </button>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Bar with Search & Filter */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 block py-2 pl-3 pr-8 cursor-pointer hover:border-slate-300 transition-colors"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className="sticky top-0 px-5 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em] whitespace-nowrap border-b border-slate-200 bg-slate-50/90 backdrop-blur-sm z-10"
                    style={{ minWidth: col.minWidth }}
                  >
                    {col.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {columns.map((col) => (
                      <td key={col.key} className="px-5 py-3">
                        <div className="h-4 w-full bg-slate-100 rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : applicants.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-14 text-center text-sm text-slate-400">
                    No applicants found for this status.
                  </td>
                </tr>
              ) : (
                applicants.map((row) => (
                  <tr key={row._id} className="hover:bg-slate-50/70 transition-colors group">
                    {columns.map((col) => (
                      <td key={col.key} className="px-5 py-2.5 whitespace-nowrap text-sm text-slate-700 align-middle">
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
          <div className="px-6 py-3 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
            <p className="text-xs text-slate-500 font-medium">
              Page <span className="font-bold text-slate-900">{pagination.currentPage}</span> of {pagination.totalPages} ({pagination.totalItems} total)
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="h-9 w-9 rounded-md flex items-center justify-center border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="h-9 w-9 rounded-md flex items-center justify-center border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkedInReviewPage;
