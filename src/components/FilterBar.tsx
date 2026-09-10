import React from 'react';
import { Calendar, ChevronDown, Filter, FilterX, Layers } from 'lucide-react';
import { ProductItem } from '../types';

interface FilterBarProps {
  startDate: string;
  endDate: string;
  selectedTimePreset: string;
  selectedCategory: string;
  selectedProductFilter: string;
  categories: string[];
  products: ProductItem[];
  onPresetSelect: (preset: string) => void;
  onDateRangeChange: (start: string, end: string) => void;
  setSelectedCategory: (cat: string) => void;
  setSelectedProductFilter: (prod: string) => void;
  setSelectedTimePreset: (preset: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  startDate,
  endDate,
  selectedTimePreset,
  selectedCategory,
  selectedProductFilter,
  categories,
  products,
  onPresetSelect,
  onDateRangeChange,
  setSelectedCategory,
  setSelectedProductFilter,
  setSelectedTimePreset
}) => {
  const presets = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'year', label: 'This Year' },
    { id: 'all', label: 'All Time' }
  ];

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    if (cat !== 'all' && selectedProductFilter !== 'all') {
      const prod = products.find(p => p.id === selectedProductFilter);
      if (prod && prod.category !== cat) {
        setSelectedProductFilter('all');
      }
    }
  };

  const selectableProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const hasActiveFilter = selectedCategory !== 'all' || selectedProductFilter !== 'all' || selectedTimePreset !== 'all';

  return (
    <div className="bg-white border-b border-slate-200/80 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 sm:gap-3">
        {/* Quick Timeframe Presets - flex-wrap to neatly fit mobile viewports */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1 flex items-center shrink-0">
            <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" /> Timeframe:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {presets.map((p) => (
              <button
                key={p.id}
                id={`btn-preset-${p.id}`}
                onClick={() => onPresetSelect(p.id)}
                className={`text-xs px-2.5 sm:px-3 py-1 rounded-lg transition-all font-medium whitespace-nowrap cursor-pointer shrink-0 ${
                  selectedTimePreset === p.id
                    ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Picker Range & Select Dropdown Filters - Wrapping for Mobile Screens */}
        <div className="flex flex-wrap items-center gap-2 text-xs w-full lg:w-auto">
          {/* Date Picker Range Box */}
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-start gap-1.5 sm:gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 w-full sm:w-auto">
            <div className="flex items-center gap-1 flex-1 sm:flex-initial min-w-[110px]">
              <span className="text-slate-400 font-medium shrink-0">From:</span>
              <input
                id="filter-date-from"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setSelectedTimePreset('custom');
                  onDateRangeChange(e.target.value, endDate);
                }}
                className="text-slate-700 bg-transparent focus:outline-hidden font-medium text-xs cursor-pointer w-full sm:w-auto max-w-[130px]"
              />
            </div>
            <span className="hidden sm:inline text-slate-300 font-light">|</span>
            <div className="flex items-center gap-1 flex-1 sm:flex-initial min-w-[110px]">
              <span className="text-slate-400 font-medium shrink-0">To:</span>
              <input
                id="filter-date-to"
                type="date"
                value={endDate}
                onChange={(e) => {
                  setSelectedTimePreset('custom');
                  onDateRangeChange(startDate, e.target.value);
                }}
                className="text-slate-700 bg-transparent focus:outline-hidden font-medium text-xs cursor-pointer w-full sm:w-auto max-w-[130px]"
              />
            </div>
          </div>

          {/* Category & Product Dropdowns - Wrapped for Mobile */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
            {/* Category Dropdown */}
            <div className="relative flex-1 sm:flex-initial min-w-[130px]">
              <select
                id="filter-category"
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full sm:w-auto appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl pl-3 pr-7 py-1.5 focus:outline-hidden focus:border-pink-500 font-medium cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2 pointer-events-none" />
            </div>

            {/* Product Selector Filter */}
            <div className="relative flex-1 sm:flex-initial min-w-[130px]">
              <select
                id="filter-product"
                value={selectedProductFilter}
                onChange={(e) => setSelectedProductFilter(e.target.value)}
                className="w-full sm:w-auto appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl pl-3 pr-7 py-1.5 focus:outline-hidden focus:border-pink-500 font-medium max-w-full sm:max-w-[180px] truncate cursor-pointer"
              >
                <option value="all">All Products</option>
                {selectableProducts.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2 pointer-events-none" />
            </div>

            {/* Reset Filter Button if active */}
            {hasActiveFilter && (
              <button
                id="btn-reset-filters"
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedProductFilter('all');
                  onPresetSelect('all');
                }}
                className="text-xs text-pink-600 hover:text-pink-700 font-semibold px-2 py-1.5 rounded-xl hover:bg-pink-50 border border-pink-200/80 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                title="Reset all filters to default"
              >
                <FilterX className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
