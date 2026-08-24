"use client";

import React, { ReactNode } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => ReactNode;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  width?: string;
  className?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  onRowClick?: (item: T) => void;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (columnKey: string) => void;
  isLoading?: boolean;
  loadingRowCount?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  onResetFilters?: () => void;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  sortBy,
  sortOrder = "desc",
  onSort,
  isLoading = false,
  loadingRowCount = 10,
  emptyTitle = "No transactions found",
  emptyDescription = "Try adjusting your search query, status, date, or category filters.",
  onResetFilters,
  error,
  onRetry,
  className,
}: TableProps<T>) {
  // Render loading skeleton rows
  if (isLoading) {
    return (
      <div className={cn("table-wrapper", className)}>
        <table className="custom-table" role="table" aria-label="Transactions table loading">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={cn(col.align === "right" && "text-right", col.className)}
                >
                  <div className="th-content">{col.header}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: loadingRowCount }).map((_, idx) => (
              <tr key={`skeleton-${idx}`} className="animate-pulse">
                {columns.map((col, colIdx) => (
                  <td key={`skeleton-cell-${idx}-${colIdx}`}>
                    <div
                      className="skeleton-box h-4 rounded"
                      style={{
                        width: colIdx === 0 ? "80%" : colIdx === 1 ? "60%" : "90%",
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={cn("table-wrapper p-12 text-center", className)}>
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-3 rounded-full bg-rose-500/10 text-rose-400">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h4 className="text-base font-semibold text-slate-100">Unable to load data</h4>
          <p className="text-sm text-slate-400 max-w-md">{error}</p>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Retry Loading
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Render empty state
  if (!data || data.length === 0) {
    return (
      <div className={cn("table-wrapper p-12 text-center", className)}>
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-4 rounded-full bg-indigo-500/10 text-indigo-400">
            <ArrowUpDown className="h-8 w-8" />
          </div>
          <h4 className="text-base font-semibold text-slate-100">{emptyTitle}</h4>
          <p className="text-sm text-slate-400 max-w-md">{emptyDescription}</p>
          {onResetFilters && (
            <Button
              variant="primary"
              size="sm"
              onClick={onResetFilters}
              className="mt-2"
            >
              Clear All Filters
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("table-wrapper", className)}>
      <table
        className="custom-table"
        role="table"
        aria-label="Financial Transactions Data Table"
      >
        <thead>
          <tr>
            {columns.map((col) => {
              const isSorted = sortBy === col.key;
              return (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={cn(
                    col.sortable && "sortable",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.className
                  )}
                  onClick={() => {
                    if (col.sortable && onSort) {
                      onSort(col.key);
                    }
                  }}
                  tabIndex={col.sortable ? 0 : undefined}
                  role={col.sortable ? "columnheader" : undefined}
                  aria-sort={
                    col.sortable
                      ? isSorted
                        ? sortOrder === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                      : undefined
                  }
                  onKeyDown={(e) => {
                    if (col.sortable && onSort && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      onSort(col.key);
                    }
                  }}
                >
                  <div
                    className={cn(
                      "th-content",
                      col.align === "right" && "justify-end",
                      col.align === "center" && "justify-center"
                    )}
                  >
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="inline-flex text-slate-400 ml-1">
                        {isSorted ? (
                          sortOrder === "asc" ? (
                            <ArrowUp className="h-3.5 w-3.5 text-indigo-400" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5 text-indigo-400" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40 hover:opacity-100" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => {
            const key = keyExtractor(item, index);
            return (
              <tr
                key={key}
                onClick={() => onRowClick && onRowClick(item)}
                tabIndex={onRowClick ? 0 : undefined}
                role="row"
                onKeyDown={(e) => {
                  if (onRowClick && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onRowClick(item);
                  }
                }}
              >
                {columns.map((col) => {
                  const val = (item as any)[col.key];
                  return (
                    <td
                      key={`${key}-${col.key}`}
                      className={cn(
                        col.align === "right" && "text-right",
                        col.align === "center" && "text-center",
                        col.className
                      )}
                    >
                      {col.render ? col.render(item, index) : val !== undefined ? String(val) : "-"}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
