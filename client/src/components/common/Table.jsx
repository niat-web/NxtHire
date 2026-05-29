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
        return <Minus className="h-3.5 w-3.5 text-muted-foreground/40" />;
    }
    if (sortConfig.direction === 'asc') {
        return <ChevronsUp className="h-3.5 w-3.5 text-foreground" />;
    }
    return <ChevronsDown className="h-3.5 w-3.5 text-foreground" />;
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
                      'sticky top-0 px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground whitespace-nowrap border-b border-border bg-muted/40 backdrop-blur-sm',
                      column.isSticky ? 'left-0 z-20' : 'z-10',
                      column.sortable && 'cursor-pointer hover:text-foreground'
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
              <tbody className="bg-white divide-y divide-border">
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
                    <tr key={row._id || `row-${rowIndex}`} className="hover:bg-muted/30 transition-colors duration-150 group">
                      {columns.map((column) => (
                        <td
                          key={`${column.key}-${row._id || rowIndex}`}
                          className={cn(
                            'px-5 py-3.5 whitespace-nowrap text-foreground/90 align-middle',
                            column.isSticky && 'sticky left-0 z-[1] bg-white group-hover:bg-muted/30'
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
          <nav className="flex items-center justify-between border-t border-border bg-white px-6 py-3.5">
              <p className="text-[12px] text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{showingFrom}</span>–<span className="font-semibold text-foreground">{showingTo}</span> of <span className="font-semibold text-foreground">{pagination.totalItems}</span>
              </p>
              <div className="flex items-center gap-1.5">
                  <button
                    aria-label="Previous page"
                    onClick={handlePreviousPage}
                    disabled={pagination.currentPage === 1}
                    className="h-9 w-9 rounded-full flex items-center justify-center border border-border bg-white text-foreground/80 hover:bg-primary hover:text-white hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-foreground/80 disabled:hover:border-border transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    aria-label="Next page"
                    onClick={handleNextPage}
                    disabled={pagination.currentPage >= pagination.totalPages}
                    className="h-9 w-9 rounded-full flex items-center justify-center border border-border bg-white text-foreground/80 hover:bg-primary hover:text-white hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-foreground/80 disabled:hover:border-border transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
              </div>
          </nav>
      )}
    </div>
  );
};

export default Table;
