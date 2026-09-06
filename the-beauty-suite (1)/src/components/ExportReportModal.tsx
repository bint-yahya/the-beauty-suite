import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  X,
  Calendar,
  CheckCircle2,
  Filter,
  Sparkles,
  DollarSign,
  TrendingUp,
  Package,
  Layers,
  Percent,
  BarChart3
} from 'lucide-react';
import { formatNaira, ProductItem, ComboItem, BatchOrder, SaleRecord, InventoryStockItem } from '../types';
import { UserProfile } from '../lib/auth';
import { AccentPresetId, ACCENT_PRESETS } from '../lib/theme';
import { generateBusinessReportPDF, PDFExportOptions } from '../lib/pdfExport';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: {
    totalRevenue: number;
    totalNetProfit: number;
    profitMargin: number;
    totalItemsSold: number;
    totalOrders: number;
    averageOrderValue: number;
    totalInventoryValue: number;
    lowStockCount: number;
    topProductsList: { name: string; count: number }[];
  };
  filteredSales: SaleRecord[];
  allSales: SaleRecord[];
  products: ProductItem[];
  combos: ComboItem[];
  batches: BatchOrder[];
  inventoryList: InventoryStockItem[];
  currentUser: UserProfile | null;
  currentPreset?: AccentPresetId;
  onSelectPreset?: (preset: AccentPresetId) => void;
  startDate: string;
  endDate: string;
  selectedCategory: string;
  selectedProductFilter: string;
  getProductCostBreakdown: (p: ProductItem) => any;
  getComboCostBreakdown: (c: ComboItem) => any;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  metrics,
  filteredSales,
  allSales,
  products,
  combos,
  batches,
  inventoryList,
  currentUser,
  currentPreset = 'soft-pink',
  onSelectPreset,
  startDate,
  endDate,
  selectedCategory,
  selectedProductFilter,
  getProductCostBreakdown,
  getComboCostBreakdown
}) => {
  const [reportType, setReportType] = useState<'full' | 'sales' | 'executive' | 'inventory' | 'financials'>('financials');
  const [selectedPreset, setSelectedPreset] = useState<AccentPresetId>(currentPreset || 'soft-pink');
  const [useCurrentFilters, setUseCurrentFilters] = useState(true);
  const [includeMonthlyPerformance, setIncludeMonthlyPerformance] = useState(true);
  const [includeMarginBlueprint, setIncludeMarginBlueprint] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(true);
  const [customNotes, setCustomNotes] = useState(
    'Official operational, landed costing & financial record generated from the beauty suite for bookkeeping, pricing audits, and executive performance reviews.'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Sync selectedPreset when currentPreset changes
  React.useEffect(() => {
    if (currentPreset) {
      setSelectedPreset(currentPreset);
    }
  }, [currentPreset]);

  // Determine available historical months
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    allSales.forEach(s => {
      if (s.date && s.date.length >= 7) {
        monthsSet.add(s.date.slice(0, 7));
      }
    });
    const curCalMonth = new Date().toISOString().slice(0, 7);
    monthsSet.add(curCalMonth);
    return Array.from(monthsSet).sort((a, b) => b.localeCompare(a));
  }, [allSales]);

  const [selectedMonth, setSelectedMonth] = useState<string>(availableMonths[0] || new Date().toISOString().slice(0, 7));

  const activePresetConfig = ACCENT_PRESETS[selectedPreset] || ACCENT_PRESETS['soft-pink'];

  if (!isOpen) return null;

  const salesToExport = useCurrentFilters ? filteredSales : allSales;

  const handleThemeChange = (presetKey: AccentPresetId) => {
    setSelectedPreset(presetKey);
    if (onSelectPreset) {
      onSelectPreset(presetKey);
    }
  };

  const handleExport = () => {
    setIsGenerating(true);
    setDownloadSuccess(null);

    try {
      const options: PDFExportOptions = {
        reportType,
        currentPreset: selectedPreset,
        includeMonthlyPerformance,
        includeMarginBlueprint,
        selectedMonth,
        startDate: useCurrentFilters ? startDate : undefined,
        endDate: useCurrentFilters ? endDate : undefined,
        categoryFilter: useCurrentFilters && selectedCategory !== 'all' ? selectedCategory : undefined,
        productFilter: useCurrentFilters && selectedProductFilter !== 'all' ? selectedProductFilter : undefined,
        preparedBy: currentUser?.name || 'Store Manager',
        notes: includeNotes ? customNotes : undefined
      };

      const filename = generateBusinessReportPDF(
        {
          metrics,
          sales: salesToExport,
          allSales,
          products,
          combos,
          batches,
          inventoryList,
          currentUser,
          getProductCostBreakdown,
          getComboCostBreakdown
        },
        options
      );

      setDownloadSuccess(filename);
      setTimeout(() => {
        setIsGenerating(false);
      }, 600);
    } catch (err) {
      console.error('Error generating PDF report:', err);
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl border border-slate-100 space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: activePresetConfig.primaryColor }}
            >
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-800">
                  Export Business PDF Report
                </h3>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider"
                  style={{
                    backgroundColor: activePresetConfig.previewClass,
                    color: activePresetConfig.primaryColor,
                    borderColor: `${activePresetConfig.primaryColor}40`
                  }}
                >
                  {activePresetConfig.name}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official financial, pricing blueprint & operational audit for {currentUser?.brandName || 'the beauty suite'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Accent Preset Matcher (Direct in PDF Modal) */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div>
            <p className="text-xs font-bold text-slate-700">PDF Accent Styling</p>
            <p className="text-[11px] text-slate-500">Matches tables, KPI badges & banners in exported document</p>
          </div>
          <div className="flex items-center gap-1.5 self-stretch sm:self-auto">
            {(Object.keys(ACCENT_PRESETS) as AccentPresetId[]).map((key) => {
              const preset = ACCENT_PRESETS[key];
              const isSelected = selectedPreset === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleThemeChange(key)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-white shadow-xs text-slate-900'
                      : 'bg-white/60 text-slate-600 hover:bg-white border-transparent'
                  }`}
                  style={isSelected ? { borderColor: preset.primaryColor } : {}}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: preset.primaryColor }}
                  />
                  <span>{preset.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Report Type Selector Cards */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Select Report Scope
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Financial & Margin Blueprint (User Primary Target) */}
            <button
              type="button"
              onClick={() => setReportType('financials')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                reportType === 'financials'
                  ? 'bg-slate-50 border-slate-300 ring-2'
                  : 'bg-slate-50/70 hover:bg-slate-100/70 border-slate-200 text-slate-700'
              }`}
              style={
                reportType === 'financials'
                  ? {
                      borderColor: activePresetConfig.primaryColor,
                      boxShadow: `0 0 0 2px ${activePresetConfig.primaryColor}25`
                    }
                  : {}
              }
            >
              <div
                className="p-1.5 rounded-lg shrink-0 text-white"
                style={{
                  backgroundColor: reportType === 'financials' ? activePresetConfig.primaryColor : '#94a3b8'
                }}
              >
                <Percent className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Financial & Margin Blueprint</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Landed costs, bundle combo margins, MoM velocity, channels & inventory valuation</p>
              </div>
            </button>

            {/* Complete 360 */}
            <button
              type="button"
              onClick={() => setReportType('full')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                reportType === 'full'
                  ? 'bg-slate-50 border-slate-300 ring-2'
                  : 'bg-slate-50/70 hover:bg-slate-100/70 border-slate-200 text-slate-700'
              }`}
              style={
                reportType === 'full'
                  ? {
                      borderColor: activePresetConfig.primaryColor,
                      boxShadow: `0 0 0 2px ${activePresetConfig.primaryColor}25`
                    }
                  : {}
              }
            >
              <div
                className="p-1.5 rounded-lg shrink-0 text-white"
                style={{
                  backgroundColor: reportType === 'full' ? activePresetConfig.primaryColor : '#94a3b8'
                }}
              >
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Complete 360° Audit</p>
                <p className="text-[11px] text-slate-500 mt-0.5">All KPIs, MoM Summary, Margin Blueprint, Channels, Ledger & Stock Valuation</p>
              </div>
            </button>

            {/* Sales Ledger */}
            <button
              type="button"
              onClick={() => setReportType('sales')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                reportType === 'sales'
                  ? 'bg-slate-50 border-slate-300 ring-2'
                  : 'bg-slate-50/70 hover:bg-slate-100/70 border-slate-200 text-slate-700'
              }`}
              style={
                reportType === 'sales'
                  ? {
                      borderColor: activePresetConfig.primaryColor,
                      boxShadow: `0 0 0 2px ${activePresetConfig.primaryColor}25`
                    }
                  : {}
              }
            >
              <div
                className="p-1.5 rounded-lg shrink-0 text-white"
                style={{
                  backgroundColor: reportType === 'sales' ? activePresetConfig.primaryColor : '#94a3b8'
                }}
              >
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Sales Ledger & Orders</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Itemized transaction records, unit prices, profits & channels</p>
              </div>
            </button>

            {/* Inventory & Valuation */}
            <button
              type="button"
              onClick={() => setReportType('inventory')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                reportType === 'inventory'
                  ? 'bg-slate-50 border-slate-300 ring-2'
                  : 'bg-slate-50/70 hover:bg-slate-100/70 border-slate-200 text-slate-700'
              }`}
              style={
                reportType === 'inventory'
                  ? {
                      borderColor: activePresetConfig.primaryColor,
                      boxShadow: `0 0 0 2px ${activePresetConfig.primaryColor}25`
                    }
                  : {}
              }
            >
              <div
                className="p-1.5 rounded-lg shrink-0 text-white"
                style={{
                  backgroundColor: reportType === 'inventory' ? activePresetConfig.primaryColor : '#94a3b8'
                }}
              >
                <Package className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Inventory & Landed Cost</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Unit landed costs, stock levels, reorder alerts & valuations</p>
              </div>
            </button>
          </div>
        </div>

        {/* Section Inclusions (Monthly Performance & Margin Blueprint) */}
        <div
          className="p-3.5 rounded-2xl border space-y-2.5"
          style={{
            backgroundColor: `${activePresetConfig.primaryColor}08`,
            borderColor: `${activePresetConfig.primaryColor}30`
          }}
        >
          <div className="flex items-center justify-between">
            <p
              className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5"
              style={{ color: activePresetConfig.primaryColor }}
            >
              <Sparkles className="w-3.5 h-3.5" /> Advanced Financial Modules Included
            </p>
            <span className="text-[10px] text-slate-500">
              Month: {selectedMonth}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <label
              className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200/80 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={includeMonthlyPerformance}
                onChange={(e) => setIncludeMonthlyPerformance(e.target.checked)}
                className="rounded w-3.5 h-3.5 cursor-pointer"
                style={{ accentColor: activePresetConfig.primaryColor }}
              />
              <span className="font-semibold text-slate-700">Monthly Performance & MoM Velocity</span>
            </label>

            <label
              className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200/80 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={includeMarginBlueprint}
                onChange={(e) => setIncludeMarginBlueprint(e.target.checked)}
                className="rounded w-3.5 h-3.5 cursor-pointer"
                style={{ accentColor: activePresetConfig.primaryColor }}
              />
              <span className="font-semibold text-slate-700">Margin & Landed Cost Blueprint</span>
            </label>
          </div>
        </div>

        {/* Scope and Filter Summary Card */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" style={{ color: activePresetConfig.primaryColor }} /> Timeframe & Filter Scope
            </span>
            <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={useCurrentFilters}
                onChange={(e) => setUseCurrentFilters(e.target.checked)}
                className="rounded w-3.5 h-3.5 cursor-pointer"
                style={{ accentColor: activePresetConfig.primaryColor }}
              />
              <span className="font-semibold">Apply active filters</span>
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
            <div className="bg-white p-2 rounded-xl border border-slate-200/80 text-center">
              <p className="text-[10px] uppercase font-semibold text-slate-400">Date Range</p>
              <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">
                {useCurrentFilters ? `${startDate || 'Start'} → ${endDate || 'End'}` : 'All Time'}
              </p>
            </div>

            <div className="bg-white p-2 rounded-xl border border-slate-200/80 text-center">
              <p className="text-[10px] uppercase font-semibold text-slate-400">Total Rev</p>
              <p
                className="text-xs font-bold mt-0.5"
                style={{ color: activePresetConfig.primaryColor }}
              >
                {formatNaira(metrics.totalRevenue)}
              </p>
            </div>

            <div className="bg-white p-2 rounded-xl border border-slate-200/80 text-center">
              <p className="text-[10px] uppercase font-semibold text-slate-400">Net Profit</p>
              <p className="text-xs font-bold text-emerald-600 mt-0.5">
                {formatNaira(metrics.totalNetProfit)}
              </p>
            </div>

            <div className="bg-white p-2 rounded-xl border border-slate-200/80 text-center">
              <p className="text-[10px] uppercase font-semibold text-slate-400">Sales Records</p>
              <p className="text-xs font-bold text-slate-800 mt-0.5">
                {salesToExport.length} entries
              </p>
            </div>
          </div>
        </div>

        {/* Custom Business Notes */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700">
              Audit & Bookkeeping Notes (Printed in PDF Footer)
            </label>
            <label className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer">
              <input
                type="checkbox"
                checked={includeNotes}
                onChange={(e) => setIncludeNotes(e.target.checked)}
                className="rounded w-3 h-3 cursor-pointer"
                style={{ accentColor: activePresetConfig.primaryColor }}
              />
              <span>Include Notes</span>
            </label>
          </div>
          {includeNotes && (
            <textarea
              rows={2}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Enter bookkeeping or tax declaration notes..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 font-medium focus:bg-white outline-none resize-none"
            />
          )}
        </div>

        {/* Download Success Notification */}
        {downloadSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Report generated successfully in <strong>{activePresetConfig.name}</strong> accent styling: <strong>{downloadSuccess}</strong>
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="btn-download-pdf-confirm"
            type="button"
            disabled={isGenerating}
            onClick={handleExport}
            className="px-5 py-2.5 rounded-xl disabled:opacity-50 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            style={{
              backgroundColor: activePresetConfig.primaryColor,
              boxShadow: `0 4px 12px ${activePresetConfig.primaryColor}40`
            }}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Formatting {activePresetConfig.name} PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download {activePresetConfig.name} PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
