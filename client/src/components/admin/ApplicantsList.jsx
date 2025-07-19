// client/src/components/admin/ApplicantsList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiFilter, FiSearch, FiRefreshCw } from 'react-icons/fi';
import Table from '../common/Table';
import Button from '../common/Button';
import SearchInput from '../common/SearchInput';
import FilterDropdown from '../common/FilterDropdown';
import StatusBadge from '../common/StatusBadge';
import { getApplicants } from '../../api/admin.api';
import { formatDate } from '../../utils/formatters';
import { APPLICATION_STATUS, DOMAINS } from '../../utils/constants';
import { debounce } from '../../utils/helpers';
import Alert from '../common/Alert';

const ApplicantsList = () => {
  const [loading, setLoading] = useState(true);
  const [applicants, setApplicants] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    showingFrom: 0,
    showingTo: 0
  });
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  
  const [error, setError] = useState('');
  
  // Convert application statuses to options for filter dropdown
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    ...Object.values(APPLICATION_STATUS).map(status => ({
      value: status,
      label: status
    }))
  ];
  
  // Convert domains to options for filter dropdown
  const domainOptions = [
    { value: '', label: 'All Domains' },
    ...DOMAINS
  ];
  
  const fetchApplicants = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const response = await getApplicants({
        page,
        limit: 10,
        search: searchTerm,
        status: statusFilter,
        domain: domainFilter,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      setApplicants(response.data.applicants || []);
      setPagination({
        currentPage: response.data.page,
        totalPages: response.data.totalPages,
        totalItems: response.data.totalDocs,
        showingFrom: ((response.data.page - 1) * response.data.limit) + 1,
        showingTo: Math.min(response.data.page * response.data.limit, response.data.totalDocs)
      });
    } catch (error) {
      setError('Failed to fetch applicants. Please try again.');
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Debounced search
  const debouncedSearch = debounce(() => {
    fetchApplicants(1); // Reset to first page on search
  }, 300);
  
  useEffect(() => {
    debouncedSearch();
  }, [searchTerm, statusFilter, domainFilter]);
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleStatusChange = (value) => {
    setStatusFilter(value);
  };
  
  const handleDomainChange = (value) => {
    setDomainFilter(value);
  };
  
  const handlePageChange = (page) => {
    fetchApplicants(page);
  };
  
  const clearSearch = () => {
    setSearchTerm('');
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setDomainFilter('');
  };
  
  const applicantColumns = [
    {
      key: 'fullName',
      title: 'Name',
      render: (row) => row.fullName
    },
    {
      key: 'email',
      title: 'Email',
      render: (row) => row.email
    },
    {
      key: 'domain',
      title: 'Domain',
      render: (row) => row.domain || 'N/A'
    },
    {
      key: 'status',
      title: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'createdAt',
      title: 'Applied On',
      render: (row) => formatDate(row.createdAt)
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (row) => (
        <Link
          to={`/admin/applicants/${row._id}`}
          className="text-primary-600 hover:text-primary-800"
        >
          <FiEye className="h-5 w-5" />
        </Link>
      )
    }
  ];
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-4 md:space-y-0">
        <div className="w-full md:w-1/2">
          <SearchInput
            value={searchTerm}
            onChange={handleSearchChange}
            onClear={clearSearch}
            placeholder="Search by name or email"
          />
        </div>
        
        <div className="flex space-x-4">
          <FilterDropdown
            label="Status"
            options={statusOptions}
            selectedValue={statusFilter}
            onChange={handleStatusChange}
          />
          
          <FilterDropdown
            label="Domain"
            options={domainOptions}
            selectedValue={domainFilter}
            onChange={handleDomainChange}
          />
          
          <Button
            variant="outline"
            icon={<FiRefreshCw />}
            iconPosition="left"
            onClick={() => fetchApplicants(1)}
          >
            Refresh
          </Button>
          <Button variant="ghost" onClick={clearFilters}>Clear Filters</Button>
        </div>
      </div>
      
      {error && <Alert type="error" message={error} />}
      
      <Table
        columns={applicantColumns}
        data={applicants}
        isLoading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        emptyMessage={error ? 'Unable to load applicants.' : 'No applicants found matching your criteria'}
      />
    </div>
  );
};

export default ApplicantsList;