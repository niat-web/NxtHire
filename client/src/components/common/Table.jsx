// client/src/components/common/Table.jsx
import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsUp, ChevronsDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
    onSort,
    customLoader
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
        return <Minus className="text-muted-foreground/40" />;
    }
    if (sortConfig.direction === 'asc') {
        return <ChevronsUp className="text-primary" />;
    }
    return <ChevronsDown className="text-primary" />;
  };

  return (
    <div className="flow-root">
        <div className="align-middle inline-block min-w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-indigo-50 to-blue-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={cn(
                      'sticky top-0 px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap',
                      column.isSticky ? 'left-0 z-20 bg-gradient-to-r from-indigo-50 to-blue-50 border-r border-indigo-100' : 'z-10 bg-gradient-to-r from-indigo-50 to-blue-50',
                      column.sortable && 'cursor-pointer hover:text-gray-900'
                    )}
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
            {isLoading && customLoader ? customLoader : (
              <tbody className="bg-white divide-y divide-gray-100">
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
                    <tr key={row._id || rowIndex} className="hover:bg-gray-50/80 transition-colors duration-150 group">
                      {columns.map((column) => (
                        <td
                          key={`${column.key}-${rowIndex}`}
                          className={cn(
                            'px-4 py-2.5 whitespace-nowrap text-sm text-gray-700 align-middle',
                            column.isSticky && 'sticky left-0 z-[1] border-r border-gray-100 bg-white group-hover:bg-gray-50/80'
                          )}
                        >
                           {column.render ? column.render(row, rowIndex) : (row[column.key] !== null && row[column.key] !== undefined ? row[column.key].toString() : '')}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            )}
          </table>
        </div>

      {pagination && pagination.totalItems > 10 && (
          <nav className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                  <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={pagination.currentPage === 1}>Previous</Button>
                  <Button variant="outline" size="sm" onClick={handleNextPage} disabled={pagination.currentPage === pagination.totalPages}>Next</Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Showing <span className="font-medium text-gray-900">{showingFrom}</span> to <span className="font-medium text-gray-900">{showingTo}</span> of{' '}
                    <span className="font-medium text-gray-900">{pagination.totalItems}</span> results
                  </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={pagination.currentPage === 1}>
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleNextPage} disabled={pagination.currentPage >= pagination.totalPages}>
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
              </div>
          </nav>
      )}
    </div>
  );
};

export default Table;
