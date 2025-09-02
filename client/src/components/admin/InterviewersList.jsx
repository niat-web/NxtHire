// client/src/components/admin/InterviewersList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiFilter, FiSearch, FiRefreshCw } from 'react-icons/fi';
import Table from '../common/Table';
import Button from '../common/Button';
import SearchInput from '../common/SearchInput';
import FilterDropdown from '../common/FilterDropdown';
import StatusBadge from '../common/StatusBadge';
import Badge from '../common/Badge';
import { getInterviewers } from '../../api/admin.api';
import { formatDate } from '../../utils/formatters';
import { INTERVIEWER_STATUS, DOMAINS, PAYMENT_TIERS } from '../../utils/constants';
import { debounce } from '../../utils/helpers';

const InterviewersList = () => {
    const [loading, setLoading] = useState(true);
    const [interviewers, setInterviewers] = useState([]);
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
    const [tierFilter, setTierFilter] = useState('');
    
    // Convert interviewer statuses to options for filter dropdown
    const statusOptions = [
      { value: '', label: 'All Statuses' },
      ...Object.values(INTERVIEWER_STATUS).map(status => ({
        value: status,
        label: status
      }))
    ];
    
    // Convert domains to options for filter dropdown
    const domainOptions = [
      { value: '', label: 'All Domains' },
      ...DOMAINS
    ];
    
    // Convert payment tiers to options for filter dropdown
    const tierOptions = [
      { value: '', label: 'All Tiers' },
      ...PAYMENT_TIERS.map(tier => ({
        value: tier.value,
        label: tier.label
      }))
    ];
    
    const fetchInterviewers = async (page = 1) => {
      setLoading(true);
      try {
        const response = await getInterviewers({
          page,
          limit: 10,
          search: searchTerm,
          status: statusFilter,
          domain: domainFilter,
          paymentTier: tierFilter,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        });
        
        setInterviewers(response.data.interviewers || []);
        setPagination({
          currentPage: response.data.page,
          totalPages: response.data.totalPages,
          totalItems: response.data.totalDocs,
          showingFrom: ((response.data.page - 1) * response.data.limit) + 1,
          showingTo: Math.min(response.data.page * response.data.limit, response.data.totalDocs)
        });
      } catch (error) {
        console.error('Error fetching interviewers:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Debounced search
    const debouncedSearch = debounce(() => {
      fetchInterviewers(1); // Reset to first page on search
    }, 300);
    
    useEffect(() => {
      debouncedSearch();
    }, [searchTerm, statusFilter, domainFilter, tierFilter]);
    
    const handleSearchChange = (e) => {
      setSearchTerm(e.target.value);
    };
    
    const handleStatusChange = (value) => {
      setStatusFilter(value);
    };
    
    const handleDomainChange = (value) => {
      setDomainFilter(value);
    };
    
    const handleTierChange = (value) => {
      setTierFilter(value);
    };
    
    const handlePageChange = (page) => {
      fetchInterviewers(page);
    };
    
    const clearSearch = () => {
      setSearchTerm('');
    };
    
    const interviewerColumns = [
      {
        key: 'name',
        title: 'Name',
        render: (row) => `${row.user?.firstName || ''} ${row.user?.lastName || ''}`
      },
      {
        key: 'email',
        title: 'Email',
        render: (row) => row.user?.email || ''
      },
      {
        key: 'domains',
        title: 'Domains',
        render: (row) => (
            <div className="flex flex-wrap gap-1">
                {(row.domains || []).map((domain, index) => (
                    <Badge key={index} variant="primary" size="sm">{domain}</Badge>
                ))}
            </div>
        )
      },
      {
        key: 'status',
        title: 'Status',
        render: (row) => <StatusBadge status={row.status} />
      },
      {
        key: 'paymentTier',
        title: 'Tier',
        render: (row) => (
          <Badge variant="primary" rounded>
            {row.paymentTier}
          </Badge>
        )
      },
      {
        key: 'metrics',
        title: 'Interviews',
        render: (row) => row.metrics?.interviewsCompleted || 0
      },
      {
        key: 'onboardingDate',
        title: 'Onboarded',
        render: (row) => formatDate(row.onboardingDate)
      },
      {
        key: 'actions',
        title: 'Actions',
        render: (row) => (
          <Button
            to={`/admin/interviewers/${row._id}`}
            variant="ghost"
            className="text-primary-600 hover:text-primary-800"
            icon={<FiUser />}
          />
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
          
          <div className="flex flex-wrap gap-4">
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
            
            <FilterDropdown
              label="Tier"
              options={tierOptions}
              selectedValue={tierFilter}
              onChange={handleTierChange}
            />
            
            <Button
              variant="outline"
              icon={<FiRefreshCw />}
              iconPosition="left"
              onClick={() => fetchInterviewers(1)}
            >
              Refresh
            </Button>
          </div>
        </div>
        
        <Table
          columns={interviewerColumns}
          data={interviewers}
          isLoading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          emptyMessage="No interviewers found matching your criteria"
        />
      </div>
    );
  };
  
  export default InterviewersList;
