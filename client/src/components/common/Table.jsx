import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsUp, ChevronsDown, Minus } from 'lucide-react';
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
        return <Minus className="h-3.5 w-3.5 text-slate-300" />;
    }
    if (sortConfig.direction === 'asc') {
        return <ChevronsUp className="h-3.5 w-3.5 text-slate-900" />;
    }
    return <ChevronsDown className="h-3.5 w-3.5 text-slate-900" />;
  };

  return (
    <div className="flow-root">
        <div className="align-middle inline-block min-w-full">
          <table className="min-w-full text-[13px]">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={cn(
                      'sticky top-0 px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500 whitespace-nowrap border-b border-slate-200 bg-slate-50/70 backdrop-blur-sm',
                      column.isSticky ? 'left-0 z-20' : 'z-10',
                      column.sortable && 'cursor-pointer hover:text-slate-900'
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
              <tbody className="bg-white divide-y divide-slate-100">
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
                    <tr key={row._id || `row-${rowIndex}`} className="hover:bg-slate-50/60 transition-colors duration-150 group">
                      {columns.map((column) => (
                        <td
                          key={`${column.key}-${row._id || rowIndex}`}
                          className={cn(
                            'px-5 py-3.5 whitespace-nowrap text-slate-700 align-middle',
                            column.isSticky && 'sticky left-0 z-[1] bg-white group-hover:bg-slate-50/60'
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
          <nav className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-3.5">
              <p className="text-[12px] text-slate-500">
                Showing <span className="font-semibold text-slate-900">{showingFrom}</span>–<span className="font-semibold text-slate-900">{showingTo}</span> of <span className="font-semibold text-slate-900">{pagination.totalItems}</span>
              </p>
              <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePreviousPage}
                    disabled={pagination.currentPage === 1}
                    className="h-9 w-9 rounded-full flex items-center justify-center border border-slate-200 bg-white text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-600 disabled:hover:border-slate-200 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={pagination.currentPage >= pagination.totalPages}
                    className="h-9 w-9 rounded-full flex items-center justify-center border border-slate-200 bg-white text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-600 disabled:hover:border-slate-200 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
              </div>
          </nav>
      )}
    </div>
  );
};

export default Table;
