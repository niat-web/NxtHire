// client/src/components/common/Table.jsx
import React from 'react';
import { FiChevronLeft, FiChevronRight, FiChevronsUp, FiChevronsDown, FiMinus } from 'react-icons/fi';
import Button from './Button';
import Loader from './Loader';
import EmptyState from './EmptyState';

const Table = ({ 
    columns, 
    data, 
    isLoading = false, 
    pagination, 
    onPageChange, 
    emptyMessage = "No data available",
    sortConfig,
    onSort
}) => {

  const handlePreviousPage = () => {
    if (pagination && pagination.currentPage > 1) {
      onPageChange(pagination.currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination && pagination.currentPage < pagination.totalPages) {
      onPageChange(pagination.currentPage + 1);
    }
  };
  
  const showingFrom = pagination?.totalItems > 0 ? ((pagination.currentPage - 1) * 10) + 1 : 0;
  const showingTo = Math.min((pagination?.currentPage * 10), pagination?.totalItems);


  const getSortIcon = (key) => {
    if (!sortConfig || !onSort) {
        return null;
    }
    if (sortConfig.key !== key) {
        return <FiMinus className="text-gray-300" />;
    }
    if (sortConfig.direction === 'asc') {
        return <FiChevronsUp className="text-primary-600" />;
    }
    return <FiChevronsDown className="text-primary-600" />;
  };

  return (
    <div className="flow-root">
        <div className="align-middle inline-block min-w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={`sticky top-0 px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap ${
                        column.isSticky ? 'left-0 z-20 bg-gray-50 border-r' : 'z-10 bg-gray-50/95 backdrop-blur-sm'
                    } ${column.sortable ? 'cursor-pointer hover:text-gray-800' : ''}`}
                    style={{ minWidth: column.minWidth }}
                    onClick={() => column.sortable && onSort && onSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                        {column.title}
                        {column.sortable && getSortIcon(column.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="py-24">
                    <Loader text="Loading data..." />
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length}>
                    <EmptyState title={emptyMessage} description="Try adjusting your filters or check back later." />
                  </td>
                </tr>
              ) : (
                data.map((row, rowIndex) => (
                  <tr key={row._id || rowIndex} className="even:bg-gray-50 hover:bg-indigo-50 transition-colors duration-150 group">
                    {columns.map((column) => (
                      <td 
                        key={`${column.key}-${rowIndex}`} 
                        className={`px-4 py-2 whitespace-nowrap text-sm text-gray-700 align-middle ${
                            column.isSticky ? 'sticky left-0 z-1 border-r bg-white group-even:bg-gray-50 group-hover:bg-indigo-50' : ''
                        }`}
                      >
                         {column.render ? column.render(row, rowIndex) : (row[column.key] !== null && row[column.key] !== undefined ? row[column.key].toString() : '')}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      
      {pagination && pagination.totalItems > 10 && (
          <nav className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                  <Button variant="outline" onClick={handlePreviousPage} disabled={pagination.currentPage === 1}>Previous</Button>
                  <Button variant="outline" onClick={handleNextPage} disabled={pagination.currentPage === pagination.totalPages}>Next</Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{showingFrom}</span> to <span className="font-medium">{showingTo}</span> of{' '}
                    <span className="font-medium">{pagination.totalItems}</span> results
                  </p>
                </div>
                <div>
                    <Button variant="outline" onClick={handlePreviousPage} disabled={pagination.currentPage === 1} icon={<FiChevronLeft />}>Previous</Button>
                    <Button variant="outline" onClick={handleNextPage} disabled={pagination.currentPage >= pagination.totalPages} icon={<FiChevronRight />} iconPosition="right" className="ml-3">Next</Button>
                </div>
              </div>
          </nav>
      )}
    </div>
  );
};

export default Table;
