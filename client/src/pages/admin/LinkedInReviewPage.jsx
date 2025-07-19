// client/src/pages/admin/LinkedInReviewPage.jsx

import React, { useEffect, useState, useCallback, useMemo, Fragment } from 'react';
import { FiRefreshCw, FiExternalLink, FiCheck, FiX, FiEye, FiMoreVertical } from 'react-icons/fi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Menu, Transition } from '@headlessui/react';
import StatusBadge from '../../components/common/StatusBadge';
import SearchInput from '../../components/common/SearchInput';
import FilterDropdown from '../../components/common/FilterDropdown';
import { getApplicants, processLinkedInReview } from '../../api/admin.api';
import { APPLICATION_STATUS } from '../../utils/constants';
import { useAlert } from '../../hooks/useAlert';
import { formatDate } from '../../utils/formatters';
import { debounce } from '../../utils/helpers';
import Table from '../../components/common/Table';
import { Link } from 'react-router-dom';

const LinkedInReviewPage = () => {
  const [loading, setLoading] = useState(true);
  const [applicants, setApplicants] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [processingIds, setProcessingIds] = useState(new Set());
  const { showSuccess, showError } = useAlert();

  const statusOptions = useMemo(() => [
    { value: '', label: 'All Review Stages' },
    { value: APPLICATION_STATUS.SUBMITTED, label: 'Pending Review' },
    { value: APPLICATION_STATUS.PROFILE_APPROVED, label: 'Approved' },
    { value: APPLICATION_STATUS.PROFILE_REJECTED, label: 'Rejected' },
  ], []);

  const fetchApplicants = useCallback(async (page = 1) => {
    setLoading(true);
    try {
        const statusesToFetch = statusFilter || [
            APPLICATION_STATUS.SUBMITTED, 
            APPLICATION_STATUS.PROFILE_APPROVED, 
            APPLICATION_STATUS.PROFILE_REJECTED
        ].join(',');
        
        const response = await getApplicants({
            status: statusesToFetch,
            sortBy: 'updatedAt',
            sortOrder: 'desc',
            page,
            limit: 10,
            search: searchTerm,
        });

      const resData = response.data.data;
      setApplicants(resData.applicants || []);
      setPagination({
        currentPage: resData.page || 1,
        totalPages: resData.totalPages || 1,
        totalItems: resData.totalDocs || 0,
      });

    } catch (error) {
      showError('Failed to fetch applicants for review.');
      console.error('Error fetching applicants:', error);
    } finally {
      setLoading(false);
    }
  }, [showError, statusFilter, searchTerm]);

  useEffect(() => {
    const handler = debounce(() => fetchApplicants(1), 300);
    handler();
    return () => handler.cancel();
  }, [fetchApplicants]);

  const handlePageChange = (newPage) => {
    fetchApplicants(newPage);
  };

  const handleReviewDecision = useCallback(async (applicantId, decision) => {
    setProcessingIds(prev => new Set(prev).add(applicantId));
    try {
      await processLinkedInReview(applicantId, {
        decision,
        rejectionReason: decision === 'reject' ? 'Profile did not meet requirements upon review.' : undefined
      });
      showSuccess(`Application ${decision === 'approve' ? 'approved' : 'rejected'} successfully.`);
      fetchApplicants(pagination.currentPage);
    } catch (error) {
      showError(error.response?.data?.message || `Failed to ${decision} application.`);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(applicantId);
        return newSet;
      });
    }
  }, [fetchApplicants, showError, showSuccess, pagination.currentPage]);

  const applicantColumns = useMemo(() => [
    { key: 'fullName', title: 'Applicant', render: (row) => <Link to={`/admin/applicants/${row._id}`} className="font-medium text-primary-600 hover:underline">{row.fullName}</Link> },
    { key: 'email', title: 'Contact', render: (row) => row.email },
    { key: 'linkedinProfileUrl', title: 'LinkedIn Profile', render: (row) => <a href={row.linkedinProfileUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline flex items-center">View <FiExternalLink className="ml-1"/></a>},
    { key: 'status', title: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'updatedAt', title: 'Last Action', render: (row) => formatDate(row.updatedAt)},
    {
        key: 'actions', title: 'Actions', render: (row) => {
            const isProcessing = processingIds.has(row._id);
            const isReviewed = [APPLICATION_STATUS.PROFILE_APPROVED, APPLICATION_STATUS.PROFILE_REJECTED].includes(row.status);
    
            if (isProcessing) {
                return <span className="text-xs text-gray-500 italic">Processing...</span>;
            }
    
            if (isReviewed) {
                // If already reviewed, just show a link to the profile
                return (
                    <Link to={`/admin/applicants/${row._id}`} className="text-primary-600 hover:underline text-sm flex items-center">
                        <FiEye className="mr-1" />
                        View Details
                    </Link>
                );
            }
    
            // If pending review, show primary action buttons
            return (
                <div className="flex items-center space-x-2">
                    <Button
                        variant="success"
                        className="!px-2 !py-1 text-xs"
                        onClick={() => handleReviewDecision(row._id, 'approve')}
                    >
                        <FiCheck className="mr-1 h-3 w-3" /> Approve
                    </Button>
                    <Button
                        variant="danger"
                        className="!px-2 !py-1 text-xs"
                        onClick={() => handleReviewDecision(row._id, 'reject')}
                    >
                        <FiX className="mr-1 h-3 w-3" /> Reject
                    </Button>
                    <Menu as="div" className="relative inline-block text-left">
                        <div>
                            <Menu.Button className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-transparent text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                <span className="sr-only">Open options</span>
                                <FiMoreVertical className="h-5 w-5" aria-hidden="true" />
                            </Menu.Button>
                        </div>
                        <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                            <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div className="py-1">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <Link to={`/admin/applicants/${row._id}`} className={`${
                                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                            } group flex items-center px-4 py-2 text-sm`}>
                                                <FiEye className="mr-3 h-5 w-5 text-gray-400" />
                                                More Details
                                            </Link>
                                        )}
                                    </Menu.Item>
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>
                </div>
            );
        }
    },
  ], [processingIds, handleReviewDecision]);

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 border-b border-gray-200">
          <div className="w-full md:w-1/3">
            <SearchInput 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              onClear={() => setSearchTerm('')} 
              placeholder="Search by name or email..."
            />
          </div>
          <div className="flex items-center space-x-4">
            <FilterDropdown 
              label="Status" 
              options={statusOptions} 
              selectedValue={statusFilter} 
              onChange={setStatusFilter} 
            />
          </div>
        </div>
        
        <Table 
            columns={applicantColumns}
            data={applicants}
            isLoading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            emptyMessage="No applicants found for this status."
        />
      </Card>
    </div>
  );
};

export default LinkedInReviewPage;