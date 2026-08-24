"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Calendar, TrendingUp } from "lucide-react";
import { formatINR, formatCoins } from "@/lib/utils";
import { MonthlyTrendResponse, MonthlyTrendItem } from "@/types";

interface MonthlyTrendChartProps {
  data?: MonthlyTrendResponse | null;
  selectedMonth?: string;
  onSelectMonth?: (monthKey: string) => void;
  isLoading?: boolean;
}

export function MonthlyTrendChart({
  data,
  selectedMonth,
  onSelectMonth,
  isLoading = false,
}: MonthlyTrendChartProps) {
  const months = data?.months || [];
  const totalSpend = data?.total_spend || 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item: MonthlyTrendItem = payload[0].payload;
      return (
        <div className="rounded-xl bg-slate-950/95 border border-slate-700 p-3.5 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <span className="font-semibold text-xs text-indigo-300">
              {item.month_label}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {item.transaction_count} txns
            </span>
          </div>
          <div className="text-base font-extrabold text-slate-100 font-mono">
            {formatINR(item.total_spend)}
          </div>
          <div className="mt-1.5 pt-1.5 border-t border-slate-800 flex items-center justify-between gap-4 text-xs">
            <span className="text-emerald-400 font-medium">
              {item.success_count} success
            </span>
            <span className="text-amber-400 font-medium font-mono">
              +{formatCoins(item.coins_earned)} coins
            </span>
          </div>
          {onSelectMonth && (
            <p className="text-[10px] text-indigo-400 mt-1 pt-1 border-t border-slate-800">
              Click bar to filter date range
            </p>
          )}
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
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Monthly Spend Trend
            </h3>
            <p className="text-xs text-slate-400">
              Spend trajectory across billing cycles
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-semibold uppercase text-slate-400">
            Avg Monthly
          </span>
          <div className="text-sm font-extrabold text-slate-200 font-mono">
            {months.length > 0
              ? formatINR(totalSpend / months.length)
              : formatINR(0)}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center min-h-[260px]">
          <div className="w-40 h-40 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        </div>
      ) : months.length === 0 ? (
        <div className="flex-1 flex items-center justify-center min-h-[260px] text-xs text-slate-400">
          No monthly data available for current filters.
        </div>
      ) : (
        <div className="flex-1 min-h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={months}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              onClick={(state) => {
                if (state && state.activePayload && state.activePayload.length && onSelectMonth) {
                  onSelectMonth(state.activePayload[0].payload.month_key);
                }
              }}
            >
              <defs>
                <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="month_label"
                tick={{ fill: "#94A3B8", fontSize: 11 }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#94A3B8", fontSize: 11 }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                tickLine={false}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="total_spend"
                fill="url(#spendGradient)"
                radius={[6, 6, 0, 0]}
                cursor="pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
