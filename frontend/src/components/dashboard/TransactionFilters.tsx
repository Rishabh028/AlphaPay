"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, X, Calendar, DollarSign, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { FilterState, FilterOptions } from "@/types";

interface TransactionFiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  filterOptions?: FilterOptions | null;
  totalFilteredCount?: number;
}

export function TransactionFilters({
  filters,
  onFilterChange,
  onResetFilters,
  filterOptions,
  totalFilteredCount,
}: TransactionFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Debounced search typing handler
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFilterChange({ search: searchInput, page: 1 });
      }
    }, 280);

    return () => clearTimeout(handler);
  }, [searchInput, filters.search, onFilterChange]);

  // Sync external search updates
  useEffect(() => {
    setSearchInput(filters.search || "");
  }, [filters.search]);

  // Calculate active filter count
  const activeFiltersCount = [
    Boolean(filters.search),
    Boolean(filters.category && filters.category !== "all"),
    Boolean(filters.status && filters.status !== "all"),
    Boolean(filters.paymentMethod && filters.paymentMethod !== "all"),
    Boolean(filters.minAmount !== undefined),
    Boolean(filters.maxAmount !== undefined),
    Boolean(filters.startDate),
    Boolean(filters.endDate),
  ].filter(Boolean).length;

  const categories = filterOptions?.categories || [
    "Travel",
    "Shopping",
    "Food & Dining",
    "Health",
    "Utilities",
    "Entertainment",
    "Education",
    "Groceries",
    "Fuel",
    "Insurance",
  ];

  const statuses = [
    { label: "All Statuses", value: "all" },
    { label: "Success", value: "SUCCESS" },
    { label: "Failed", value: "FAILED" },
    { label: "Pending", value: "PENDING" },
  ];

  return (
    <div className="space-y-4 rounded-2xl bg-slate-900/90 border border-white/[0.08] p-5 backdrop-blur-md shadow-xl">
      {/* Primary Bar: Search, Category, Status Pills, Advanced Toggle */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Search input with live debounce */}
        <div className="flex-1 relative">
          <Input
            placeholder="Search by merchant name or TXN ID..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            rightIcon={
              searchInput ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    onFilterChange({ search: "", page: 1 });
                  }}
                  className="p-1 text-slate-400 hover:text-slate-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null
            }
          />
        </div>

        {/* Category Selector */}
        <div className="w-full sm:w-52">
          <Select
            value={filters.category || "all"}
            onChange={(e) => onFilterChange({ category: e.target.value, page: 1 })}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center rounded-lg bg-slate-950/80 p-1 border border-white/[0.06] overflow-x-auto">
          {statuses.map((st) => {
            const isActive = (filters.status || "all") === st.value;
            return (
              <button
                key={st.value}
                onClick={() => onFilterChange({ status: st.value, page: 1 })}
                className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                {st.label}
              </button>
            );
          })}
        </div>

        {/* Advanced Filters Button */}
        <div className="flex items-center gap-2">
          <Button
            variant={showAdvanced ? "secondary" : "outline"}
            size="md"
            onClick={() => setShowAdvanced(!showAdvanced)}
            leftIcon={<SlidersHorizontal className="h-4 w-4" />}
          >
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-indigo-500 text-[10px] font-bold text-white">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="md"
              onClick={onResetFilters}
              leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
              title="Reset all filters"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filter Drawer Section (Amount Range, Dates, Payment Method) */}
      {showAdvanced && (
        <div className="pt-4 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
          {/* Min Amount */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Min Amount (₹)
            </label>
            <Input
              type="number"
              placeholder="Min amount"
              value={filters.minAmount !== undefined ? filters.minAmount : ""}
              onChange={(e) => {
                const val = e.target.value ? parseFloat(e.target.value) : undefined;
                onFilterChange({ minAmount: val, page: 1 });
              }}
              leftIcon={<DollarSign className="h-3.5 w-3.5" />}
            />
          </div>

          {/* Max Amount */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Max Amount (₹)
            </label>
            <Input
              type="number"
              placeholder="Max amount"
              value={filters.maxAmount !== undefined ? filters.maxAmount : ""}
              onChange={(e) => {
                const val = e.target.value ? parseFloat(e.target.value) : undefined;
                onFilterChange({ maxAmount: val, page: 1 });
              }}
              leftIcon={<DollarSign className="h-3.5 w-3.5" />}
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              From Date
            </label>
            <Input
              type="date"
              value={filters.startDate ? filters.startDate.split("T")[0] : ""}
              onChange={(e) => {
                const val = e.target.value ? `${e.target.value}T00:00:00Z` : undefined;
                onFilterChange({ startDate: val, page: 1 });
              }}
              leftIcon={<Calendar className="h-3.5 w-3.5" />}
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              To Date
            </label>
            <Input
              type="date"
              value={filters.endDate ? filters.endDate.split("T")[0] : ""}
              onChange={(e) => {
                const val = e.target.value ? `${e.target.value}T23:59:59Z` : undefined;
                onFilterChange({ endDate: val, page: 1 });
              }}
              leftIcon={<Calendar className="h-3.5 w-3.5" />}
            />
          </div>
        </div>
      )}
    </div>
  );
}
