"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { PieChart as PieIcon, Filter } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { CategorySpendResponse, CategorySpendItem } from "@/types";

interface CategorySpendChartProps {
  data?: CategorySpendResponse | null;
  selectedCategory?: string;
  onSelectCategory: (category: string) => void;
  isLoading?: boolean;
}

const DEFAULT_COLORS = [
  "#3B82F6", // Blue
  "#EC4899", // Pink
  "#F59E0B", // Amber
  "#10B981", // Emerald
  "#06B6D4", // Cyan
  "#8B5CF6", // Purple
  "#F97316", // Orange
  "#84CC16", // Lime
  "#EF4444", // Red
  "#6366F1", // Indigo
  "#64748B", // Slate
];

export function CategorySpendChart({
  data,
  selectedCategory,
  onSelectCategory,
  isLoading = false,
}: CategorySpendChartProps) {
  const categories = data?.categories || [];
  const totalSpend = data?.total_spend || 0;

  const chartData = categories.map((cat, index) => ({
    name: cat.category,
    value: cat.total_amount,
    percentage: cat.percentage,
    count: cat.transaction_count,
    color: cat.color_hint || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-xl bg-slate-950/95 border border-slate-700 p-3 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-semibold text-xs text-slate-200">
              {item.name}
            </span>
          </div>
          <div className="text-base font-extrabold text-slate-100 font-mono">
            {formatINR(item.value)}
          </div>
          <div className="flex items-center justify-between gap-4 mt-1 text-[11px] text-slate-400">
            <span>{item.count} transactions</span>
            <span className="font-semibold text-indigo-300">{item.percentage}%</span>
          </div>
          <p className="text-[10px] text-indigo-400 mt-1.5 pt-1 border-t border-slate-800">
            Click slice to filter table
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-white/[0.08] p-6 backdrop-blur-md shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <PieIcon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Spend by Category
            </h3>
            <p className="text-xs text-slate-400">
              Click slice to filter transactions
            </p>
          </div>
        </div>

        {selectedCategory && selectedCategory !== "all" && (
          <button
            onClick={() => onSelectCategory("all")}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors"
          >
            <Filter className="h-3 w-3" />
            Filtered: {selectedCategory} (Clear)
          </button>
        )}
      </div>

      {/* Chart Canvas */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center min-h-[260px]">
          <div className="w-40 h-40 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center min-h-[260px] text-xs text-slate-400">
          No category data available for current filters.
        </div>
      ) : (
        <div className="flex-1 min-h-[280px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                onClick={(entry) => onSelectCategory(entry.name)}
                cursor="pointer"
              >
                {chartData.map((entry, index) => {
                  const isSelected = selectedCategory === entry.name;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={isSelected ? "#FFFFFF" : "#0F172A"}
                      strokeWidth={isSelected ? 3 : 1.5}
                      style={{
                        filter: isSelected
                          ? "drop-shadow(0px 0px 8px rgba(255,255,255,0.4))"
                          : undefined,
                        opacity:
                          !selectedCategory || selectedCategory === "all" || isSelected
                            ? 1
                            : 0.4,
                      }}
                    />
                  );
                })}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Donut Center Summary */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[11px] font-semibold uppercase text-slate-400">
              Total Spend
            </span>
            <span className="text-sm font-extrabold text-slate-100 font-mono">
              {formatINR(totalSpend)}
            </span>
          </div>
        </div>
      )}

      {/* Category Pills Legend */}
      <div className="mt-4 pt-3 border-t border-white/[0.06] flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
        {chartData.map((c) => {
          const isSelected = selectedCategory === c.name;
          return (
            <button
              key={c.name}
              onClick={() => onSelectCategory(isSelected ? "all" : c.name)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                isSelected
                  ? "bg-slate-800 text-white border border-white/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: c.color }}
              />
              <span>{c.name}</span>
              <span className="text-slate-400 font-mono text-[10px]">
                ({c.percentage}%)
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
