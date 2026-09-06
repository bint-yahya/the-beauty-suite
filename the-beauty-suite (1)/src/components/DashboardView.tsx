import React, { useState, useMemo, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Package,
  BarChart3,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Calendar,
  Layers,
  ArrowUpDown,
  Percent
} from 'lucide-react';
import { ProductItem, ComboItem, InventoryStockItem, SaleRecord, formatNaira } from '../types';

interface DashboardMetrics {
  totalRevenue: number;
  totalNetProfit: number;
  profitMargin: number;
  totalItemsSold: number;
  totalOrders: number;
  averageOrderValue: number;
  totalInventoryValue: number;
  lowStockCount: number;
  topProductsList: { name: string; count: number }[];
}

interface TimelineData {
  date: string;
  revenue: number;
  profit: number;
  count: number;
}

interface DashboardViewProps {
  metrics: DashboardMetrics;
  timelineData: TimelineData[];
  inventoryList: InventoryStockItem[];
  products: ProductItem[];
  combos: ComboItem[];
  sales?: SaleRecord[];
  onOpenRecordSale: () => void;
  onOpenStockIn: () => void;
  onOpenExportReport?: () => void;
  onNavigateTab: (tab: 'dashboard' | 'products' | 'stockin' | 'costing' | 'sales' | 'inventory') => void;
  getProductCostBreakdown: (p: ProductItem) => any;
  getComboCostBreakdown: (c: ComboItem) => any;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  timelineData,
  inventoryList,
  products,
  combos,
  sales = [],
  onOpenRecordSale,
  onOpenStockIn,
  onOpenExportReport,
  onNavigateTab,
  getProductCostBreakdown,
  getComboCostBreakdown
}) => {
  // Helper to format 'YYYY-MM' into 'Month Year'
  const formatMonthName = (monthKey: string) => {
    if (!monthKey || !monthKey.includes('-')) return monthKey || 'Current Month';
    const [y, m] = monthKey.split('-').map(Number);
    const d = new Date(y, m - 1, 1);
    return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };

  const formatMonthShort = (monthKey: string) => {
    if (!monthKey || !monthKey.includes('-')) return monthKey || 'Month';
    const [y, m] = monthKey.split('-').map(Number);
    const d = new Date(y, m - 1, 1);
    return d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
  };

  // Determine available historical months
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    sales.forEach(s => {
      if (s.date && s.date.length >= 7) {
        monthsSet.add(s.date.slice(0, 7));
      }
    });
    const curCalMonth = new Date().toISOString().slice(0, 7);
    monthsSet.add(curCalMonth);
    return Array.from(monthsSet).sort((a, b) => b.localeCompare(a));
  }, [sales]);

  // Default to the latest month with sales, or current calendar month
  const defaultMonth = useMemo(() => {
    const monthsWithSales = sales
      .map(s => (s.date ? s.date.slice(0, 7) : ''))
      .filter(Boolean)
      .sort((a, b) => b.localeCompare(a));
    return monthsWithSales[0] || new Date().toISOString().slice(0, 7);
  }, [sales]);

  const [selectedMonth, setSelectedMonth] = useState<string>(defaultMonth);

  useEffect(() => {
    if (defaultMonth && (!selectedMonth || !availableMonths.includes(selectedMonth))) {
      setSelectedMonth(defaultMonth);
    }
  }, [defaultMonth, availableMonths, selectedMonth]);

  // Previous month determination
  const previousMonth = useMemo(() => {
    if (!selectedMonth) return '';
    const [y, m] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    return `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
  }, [selectedMonth]);

  // Calculate Month-over-Month Comparison Metrics
  const monthComparison = useMemo(() => {
    const calcMonth = (monthKey: string) => {
      const list = sales.filter(s => s.date && s.date.startsWith(monthKey));
      let rev = 0;
      let cost = 0;
      let itemsCount = 0;
      const skuMap: Record<string, { name: string; count: number; revenue: number }> = {};

      list.forEach(s => {
        const qty = Number(s.qty) || 0;
        const r = qty * (Number(s.sellingPrice) || 0);
        rev += r;
        itemsCount += qty;

        let c = 0;
        let itemName = 'Unknown SKU';
        if (s.type === 'single') {
          const p = products.find(prod => prod.id === s.itemId);
          if (p) {
            itemName = p.name;
            c = getProductCostBreakdown(p).totalCost * qty;
          }
        } else {
          const combo = combos.find(cmb => cmb.id === s.itemId);
          if (combo) {
            itemName = combo.name;
            c = getComboCostBreakdown(combo).totalCost * qty;
          }
        }
        cost += c;
        if (!skuMap[s.itemId]) {
          skuMap[s.itemId] = { name: itemName, count: 0, revenue: 0 };
        }
        skuMap[s.itemId].count += qty;
        skuMap[s.itemId].revenue += r;
      });

      const netProfit = rev - cost;
      const margin = rev > 0 ? (netProfit / rev) * 100 : 0;
      const orders = list.length;
      const aov = orders > 0 ? rev / orders : 0;
      const topSku = Object.values(skuMap).sort((a, b) => b.count - a.count)[0] || null;

      return {
        monthKey,
        salesCount: orders,
        revenue: rev,
        cost,
        netProfit,
        margin,
        itemsCount,
        aov,
        topSku
      };
    };

    const current = calcMonth(selectedMonth);
    const previous = calcMonth(previousMonth);

    // Revenue Growth / Decline
    const revDiff = current.revenue - previous.revenue;
    let revGrowthPct = 0;
    if (previous.revenue > 0) {
      revGrowthPct = ((current.revenue - previous.revenue) / previous.revenue) * 100;
    } else if (current.revenue > 0) {
      revGrowthPct = 100;
    }

    // Profit Growth / Decline
    const profitDiff = current.netProfit - previous.netProfit;
    let profitGrowthPct = 0;
    if (previous.netProfit !== 0) {
      profitGrowthPct = ((current.netProfit - previous.netProfit) / Math.abs(previous.netProfit)) * 100;
    } else if (current.netProfit > 0) {
      profitGrowthPct = 100;
    }

    // Margin points delta
    const marginDiff = current.margin - previous.margin;

    // Items volume delta
    const itemsDiff = current.itemsCount - previous.itemsCount;
    let itemsGrowthPct = 0;
    if (previous.itemsCount > 0) {
      itemsGrowthPct = ((current.itemsCount - previous.itemsCount) / previous.itemsCount) * 100;
    } else if (current.itemsCount > 0) {
      itemsGrowthPct = 100;
    }

    // AOV Delta
    const aovDiff = current.aov - previous.aov;
    let aovGrowthPct = 0;
    if (previous.aov > 0) {
      aovGrowthPct = ((current.aov - previous.aov) / previous.aov) * 100;
    } else if (current.aov > 0) {
      aovGrowthPct = 100;
    }

    return {
      current,
      previous,
      revDiff,
      revGrowthPct,
      profitDiff,
      profitGrowthPct,
      marginDiff,
      itemsDiff,
      itemsGrowthPct,
      aovDiff,
      aovGrowthPct
    };
  }, [sales, selectedMonth, previousMonth, products, combos, getProductCostBreakdown, getComboCostBreakdown]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Welcome / Header with Quick Export PDF Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:px-6 sm:py-4 rounded-2xl border border-slate-100 shadow-2xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
            Executive Operations & Performance Overview
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time profitability tracking, automated landed costing, and channel sales velocity.
          </p>
        </div>
        {onOpenExportReport && (
          <button
            id="btn-export-pdf-dashboard"
            onClick={onOpenExportReport}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <FileText className="w-4 h-4 text-pink-600" />
            <span>Export Executive PDF</span>
          </button>
        )}
      </div>

      {/* 4 Sleek Metric Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div id="card-revenue" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden transition-all hover:border-pink-200">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Sales Revenue</p>
            <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center text-pink-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold mt-2 text-slate-800 tracking-tight">{formatNaira(metrics.totalRevenue)}</p>
          <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1.5">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{metrics.totalOrders} total orders logged</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">Avg {formatNaira(metrics.averageOrderValue)}</span>
          </div>
        </div>

        {/* Net Profit */}
        <div id="card-profit" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden transition-all hover:border-pink-200">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Net Profit</p>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold mt-2 text-emerald-600 tracking-tight">{formatNaira(metrics.totalNetProfit)}</p>
          <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
              {metrics.profitMargin.toFixed(1)}% margin
            </span>
            <span className="text-slate-400">after packaging & gifts</span>
          </div>
        </div>

        {/* Items Sold */}
        <div id="card-items-sold" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden transition-all hover:border-pink-200">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Units Sold</p>
            <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center text-pink-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold mt-2 text-slate-800 tracking-tight">
            {metrics.totalItemsSold.toLocaleString()} <span className="text-sm font-normal text-slate-400">units</span>
          </p>
          <div className="mt-2 text-xs text-pink-600 font-medium">
            Across {products.length} Active Catalog SKUs
          </div>
        </div>

        {/* Inventory Value */}
        <div id="card-inventory-val" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden transition-all hover:border-pink-200">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Stock Valuation</p>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${metrics.lowStockCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-pink-50 text-pink-600'}`}>
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold mt-2 text-slate-800 tracking-tight">{formatNaira(metrics.totalInventoryValue)}</p>
          <div className="mt-2 text-xs font-medium">
            {metrics.lowStockCount > 0 ? (
              <span className="text-amber-600 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {metrics.lowStockCount} items need restock
              </span>
            ) : (
              <span className="text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Optimal stock levels
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION: MONTHLY PERFORMANCE SUMMARY (Current vs Previous Month MoM) */}
      {/* ========================================================================= */}
      <div id="section-monthly-performance" className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 sm:p-6 space-y-5 relative overflow-hidden">
        {/* Subtle Decorative Accent Background */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-pink-50/50 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        {/* Section Header with Dynamic Month Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center shadow-2xs border border-pink-100">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-800">Monthly Performance Summary</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-pink-50 text-pink-700 border border-pink-100">
                  MoM Comparison
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparing <strong className="text-slate-700">{formatMonthName(selectedMonth)}</strong> against{' '}
                <strong className="text-slate-700">{formatMonthName(previousMonth)}</strong>
              </p>
            </div>
          </div>

          {/* Month Selector Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="select-compare-month" className="text-xs text-slate-500 font-medium whitespace-nowrap">
              Target Month:
            </label>
            <select
              id="select-compare-month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 hover:bg-slate-100/80 focus:ring-2 focus:ring-pink-500 focus:outline-hidden transition-all cursor-pointer shadow-2xs"
            >
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {formatMonthName(m)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 4 MoM Metric Comparison Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          {/* Card 1: Monthly Revenue Comparison */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between hover:border-pink-200 transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Monthly Revenue</span>
                <span className="text-[10px] text-slate-400 font-medium">{formatMonthShort(selectedMonth)}</span>
              </div>
              <p className="text-xl font-bold text-slate-900 mt-1">
                {formatNaira(monthComparison.current.revenue)}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Previous: <span className="font-semibold text-slate-600">{formatNaira(monthComparison.previous.revenue)}</span>
              </p>
            </div>

            {/* Growth / Decline Badge */}
            <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
              <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold ${
                monthComparison.revGrowthPct >= 0
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {monthComparison.revGrowthPct >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                )}
                <span>
                  {monthComparison.revGrowthPct >= 0 ? '+' : ''}
                  {monthComparison.revGrowthPct.toFixed(1)}%
                </span>
              </div>
              <span className={`text-[11px] font-semibold ${
                monthComparison.revDiff >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {monthComparison.revDiff >= 0 ? '+' : ''}
                {formatNaira(monthComparison.revDiff)}
              </span>
            </div>
          </div>

          {/* Card 2: Monthly Net Profit Comparison */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between hover:border-pink-200 transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Monthly Net Profit</span>
                <span className="text-[10px] text-slate-400 font-medium">{formatMonthShort(selectedMonth)}</span>
              </div>
              <p className="text-xl font-bold text-emerald-600 mt-1">
                {formatNaira(monthComparison.current.netProfit)}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Previous: <span className="font-semibold text-slate-600">{formatNaira(monthComparison.previous.netProfit)}</span>
              </p>
            </div>

            {/* Growth / Decline Badge */}
            <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
              <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold ${
                monthComparison.profitGrowthPct >= 0
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {monthComparison.profitGrowthPct >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                )}
                <span>
                  {monthComparison.profitGrowthPct >= 0 ? '+' : ''}
                  {monthComparison.profitGrowthPct.toFixed(1)}%
                </span>
              </div>
              <span className={`text-[11px] font-semibold ${
                monthComparison.profitDiff >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {monthComparison.profitDiff >= 0 ? '+' : ''}
                {formatNaira(monthComparison.profitDiff)}
              </span>
            </div>
          </div>

          {/* Card 3: Net Margin & Profitability Shift */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between hover:border-pink-200 transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Profit Margin</span>
                <span className="text-[10px] text-slate-400 font-medium">{formatMonthShort(selectedMonth)}</span>
              </div>
              <p className="text-xl font-bold text-slate-900 mt-1">
                {monthComparison.current.margin.toFixed(1)}%
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Previous Margin: <span className="font-semibold text-slate-600">{monthComparison.previous.margin.toFixed(1)}%</span>
              </p>
            </div>

            {/* Margin Delta */}
            <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
              <span className={`text-xs font-bold flex items-center gap-1 ${
                monthComparison.marginDiff >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {monthComparison.marginDiff >= 0 ? (
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
                )}
                <span>
                  {monthComparison.marginDiff >= 0 ? '+' : ''}
                  {monthComparison.marginDiff.toFixed(1)}% pts
                </span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Margin shift</span>
            </div>
          </div>

          {/* Card 4: Volume & Average Order Value (AOV) */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between hover:border-pink-200 transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Units & Basket Size</span>
                <span className="text-[10px] text-slate-400 font-medium">{monthComparison.current.itemsCount} units</span>
              </div>
              <p className="text-xl font-bold text-slate-900 mt-1">
                {formatNaira(monthComparison.current.aov)}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate" title={monthComparison.current.topSku?.name || 'No sales'}>
                Top SKU: <strong className="text-pink-600 font-semibold">{monthComparison.current.topSku?.name || 'None'}</strong>
              </p>
            </div>

            {/* Order Count Delta */}
            <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                {monthComparison.current.salesCount} orders vs {monthComparison.previous.salesCount}
              </span>
              <span className={`font-bold ${
                monthComparison.itemsGrowthPct >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {monthComparison.itemsGrowthPct >= 0 ? '+' : ''}
                {monthComparison.itemsGrowthPct.toFixed(0)}% vol
              </span>
            </div>
          </div>
        </div>

        {/* Executive Growth Insight Banner */}
        <div className="p-3.5 bg-pink-50/70 rounded-2xl border border-pink-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs relative z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-600 shrink-0" />
            <p className="text-slate-700 font-medium">
              <strong className="text-pink-900 font-bold">{formatMonthName(selectedMonth)} Highlights:</strong>{' '}
              {monthComparison.revGrowthPct >= 0 ? (
                <>
                  Sales revenue expanded by <strong className="text-emerald-700">+{monthComparison.revGrowthPct.toFixed(1)}%</strong> and net profit increased by <strong className="text-emerald-700">+{formatNaira(monthComparison.profitDiff)}</strong> compared to {formatMonthName(previousMonth)}.
                </>
              ) : (
                <>
                  Revenue shifted by <strong className="text-rose-700">{monthComparison.revGrowthPct.toFixed(1)}%</strong> compared to {formatMonthName(previousMonth)} baseline.
                </>
              )}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('sales')}
            className="self-end sm:self-auto font-bold text-pink-700 hover:text-pink-800 flex items-center gap-1 cursor-pointer shrink-0"
          >
            Detailed Sales Ledger <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Middle Section: Sleek Trend & Top Velocity Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-pink-600" />
                Revenue & Net Profit Velocity
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Daily performance in current timeframe</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500" /> Revenue
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Net Profit
              </span>
            </div>
          </div>

          <div className="h-60 w-full flex items-end pt-4 pb-2">
            {timelineData.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
                <ShoppingBag className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs font-medium">No sales recorded in this date range.</p>
                <button
                  onClick={onOpenRecordSale}
                  className="mt-2 text-xs font-semibold text-pink-600 hover:text-pink-700 cursor-pointer"
                >
                  + Log a Sale
                </button>
              </div>
            ) : (
              <div className="w-full h-full flex items-end gap-3 px-2">
                {timelineData.map((d, idx) => {
                  const maxVal = Math.max(...timelineData.map(x => Math.max(x.revenue, x.profit)), 1000);
                  const revHeightPercent = Math.min(100, Math.max(8, (d.revenue / maxVal) * 100));
                  const profitHeightPercent = Math.min(100, Math.max(5, (d.profit / maxVal) * 100));

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer">
                      {/* Sleek Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-14 z-30 bg-slate-900 text-white text-[11px] p-2.5 rounded-xl pointer-events-none whitespace-nowrap shadow-xl border border-slate-700">
                        <p className="font-semibold text-pink-300">{d.date}</p>
                        <p className="text-slate-200">Revenue: {formatNaira(d.revenue)}</p>
                        <p className="text-emerald-400">Profit: {formatNaira(d.profit)}</p>
                      </div>

                      {/* Dual Bars */}
                      <div className="w-full flex items-end justify-center space-x-1.5 max-w-[36px] h-full">
                        <div
                          style={{ height: `${revHeightPercent}%` }}
                          className="w-1/2 bg-pink-500 rounded-t-md transition-all group-hover:bg-pink-600"
                        />
                        <div
                          style={{ height: `${profitHeightPercent}%` }}
                          className="w-1/2 bg-emerald-500 rounded-t-md transition-all group-hover:bg-emerald-600"
                        />
                      </div>

                      <span className="text-[10px] text-slate-400 font-medium mt-2 truncate w-full text-center">
                        {d.date.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Top Velocity Items */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Flame className="w-4 h-4 text-pink-600" />
                Top Velocity Items
              </h3>
              <span className="text-xs text-slate-400 font-medium">By volume</span>
            </div>
            <p className="text-xs text-slate-500 mb-5">Highest velocity beauty products</p>

            <div className="space-y-4">
              {metrics.topProductsList.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-8 text-center">No sales logged yet for ranking.</p>
              ) : (
                metrics.topProductsList.map((item, idx) => {
                  const topCount = metrics.topProductsList[0]?.count || 1;
                  const percent = (item.count / topCount) * 100;
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-800 truncate max-w-[180px]">
                          {idx + 1}. {item.name}
                        </span>
                        <span className="font-bold text-pink-600">{item.count} sold</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${percent}%` }}
                          className="h-full bg-pink-500 rounded-full"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Manage catalog inventory?</span>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="font-semibold text-pink-600 hover:text-pink-700 flex items-center gap-1 cursor-pointer"
            >
              View Stock <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Low Stock Radar & Margin Blueprint */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Radar Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Low Stock & Restock Radar</h3>
                <p className="text-xs text-slate-400">Items with ≤ 10 units remaining</p>
              </div>
            </div>
            <button
              onClick={onOpenStockIn}
              className="text-xs font-semibold text-pink-600 hover:text-pink-700 cursor-pointer"
            >
              + Order Batch
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="pb-2.5 font-medium">Product Name</th>
                  <th className="pb-2.5 font-medium">Category</th>
                  <th className="pb-2.5 text-right font-medium">In Stock</th>
                  <th className="pb-2.5 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventoryList
                  .filter(st => st.currentStock <= st.lowStockThreshold)
                  .slice(0, 5)
                  .map((st, i) => (
                    <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 font-semibold text-slate-800">{st.product.name}</td>
                      <td className="py-2.5 text-slate-500">{st.product.category}</td>
                      <td className="py-2.5 text-right font-bold text-amber-600">
                        {st.currentStock} pcs
                      </td>
                      <td className="py-2.5 text-right">
                        {st.currentStock <= 0 ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-pink-50 text-pink-700 border border-pink-200">
                            Out of Stock
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                            Low ({st.currentStock})
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                {inventoryList.filter(st => st.currentStock <= st.lowStockThreshold).length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400 italic">
                      All beauty items are well stocked!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Margin & Pricing Blueprint */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Margin & Pricing Blueprint</h3>
                <p className="text-xs text-slate-400">Single SKUs vs Bundle Combo Performance</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 my-3">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Singles Avg Margin</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {(
                    products.reduce((acc, p) => acc + getProductCostBreakdown(p).marginPercent, 0) /
                    (products.length || 1)
                  ).toFixed(1)}%
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Across {products.length} single SKUs</p>
              </div>

              <div className="p-4 bg-pink-50/70 rounded-xl border border-pink-100">
                <p className="text-[10px] uppercase font-semibold text-pink-700 tracking-wider">Combos Avg Margin</p>
                <p className="text-2xl font-bold text-pink-950 mt-1">
                  {(
                    combos.reduce((acc, c) => acc + getComboCostBreakdown(c).marginPercent, 0) /
                    (combos.length || 1)
                  ).toFixed(1)}%
                </p>
                <p className="text-[11px] text-pink-600 mt-1">Higher average order value</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Bundling complimentary lip products with liners and gift packaging drives higher cart sizes while protecting unit profit margins.
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Simulate combo discounts?</span>
            <button
              onClick={() => onNavigateTab('costing')}
              className="font-semibold text-pink-600 hover:text-pink-700 flex items-center gap-1 cursor-pointer"
            >
              Open Costing Studio <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
