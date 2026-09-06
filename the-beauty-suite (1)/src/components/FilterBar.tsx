import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
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

  return (
    <div className="bg-white border-b border-slate-200/80 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3">
        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth touch-pan-x pb-1 md:pb-0">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1 flex items-center shrink-0">
            <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" /> Timeframe:
          </span>
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

        {/* Date Picker Range & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
          <div className="flex items-center justify-between sm:justify-start gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 w-full sm:w-auto">
            <div className="flex items-center gap-1">
              <span className="text-slate-400 font-medium">From:</span>
              <input
                id="filter-date-from"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setSelectedTimePreset('custom');
                  onDateRangeChange(e.target.value, endDate);
                }}
                className="text-slate-700 bg-transparent focus:outline-hidden font-medium text-xs cursor-pointer max-w-[120px]"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-400 font-medium ml-1">To:</span>
              <input
                id="filter-date-to"
                type="date"
                value={endDate}
                onChange={(e) => {
                  setSelectedTimePreset('custom');
                  onDateRangeChange(startDate, e.target.value);
                }}
                className="text-slate-700 bg-transparent focus:outline-hidden font-medium text-xs cursor-pointer max-w-[120px]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Category Dropdown */}
            <div className="relative flex-1 sm:flex-initial">
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
            <div className="relative flex-1 sm:flex-initial">
              <select
                id="filter-product"
                value={selectedProductFilter}
                onChange={(e) => setSelectedProductFilter(e.target.value)}
                className="w-full sm:w-auto appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl pl-3 pr-7 py-1.5 focus:outline-hidden focus:border-pink-500 font-medium max-w-full sm:max-w-[160px] truncate cursor-pointer"
              >
                <option value="all">All Products</option>
                {selectableProducts.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
