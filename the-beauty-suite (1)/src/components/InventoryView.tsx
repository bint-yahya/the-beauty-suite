import React from 'react';
import { Package, Truck, AlertTriangle, AlertCircle, FilterX } from 'lucide-react';
import { InventoryStockItem, formatNaira } from '../types';

interface InventoryViewProps {
  inventoryList: InventoryStockItem[];
  totalCount?: number;
  selectedCategory?: string;
  selectedProductFilter?: string;
  onResetFilters?: () => void;
  onOpenStockIn: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventoryList,
  totalCount,
  selectedCategory = 'all',
  selectedProductFilter = 'all',
  onResetFilters,
  onOpenStockIn
}) => {
  const isFilterActive = (totalCount !== undefined && totalCount !== inventoryList.length) ||
    selectedCategory !== 'all' ||
    selectedProductFilter !== 'all';

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="w-5 h-5 text-pink-600" />
            Live Inventory & Stock Health
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregates total stock-in units against all single sales and combo package components.
          </p>
        </div>
        <button
          id="btn-restock-inventory"
          onClick={onOpenStockIn}
          className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs shadow-pink-300 transition-all cursor-pointer"
        >
          <Truck className="w-4 h-4" />
          <span>Restock Inventory</span>
        </button>
      </div>

      {/* Notice banner if global Category or Product filter is applied */}
      {isFilterActive && onResetFilters && (
        <div className="flex items-center justify-between bg-pink-50/80 border border-pink-200 px-4 py-2.5 rounded-2xl text-xs text-pink-800 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-pink-600 shrink-0" />
            <span>
              <strong>Filter Active:</strong> Showing {inventoryList.length} of {totalCount ?? inventoryList.length} total inventory items based on your selected Category / Product filter.
            </span>
          </div>
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-xs font-bold text-pink-700 hover:text-pink-900 bg-white px-2.5 py-1 rounded-lg border border-pink-300 hover:bg-pink-100 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <FilterX className="w-3.5 h-3.5" />
            <span>Reset Filter</span>
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {inventoryList.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="w-10 h-10 mx-auto opacity-30 text-pink-500" />
            <div>
              <p className="font-semibold text-slate-700 text-sm">
                {isFilterActive ? 'No inventory items match active filter' : 'No inventory items found'}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {isFilterActive
                  ? 'Try changing or clearing the Category and Product filters in the top bar to view other items.'
                  : 'Receive stock batches to establish initial product inventory levels.'}
              </p>
            </div>
            {isFilterActive && onResetFilters && (
              <div className="pt-2">
                <button
                  onClick={onResetFilters}
                  className="px-4 py-2 bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Mobile View: Clean Stock Health Cards (Hidden on sm screens and up) */}
            <div className="block sm:hidden divide-y divide-slate-100">
              {inventoryList.map((st) => {
                const isLow = st.currentStock <= st.lowStockThreshold;
                const isOut = st.currentStock <= 0;

                return (
                  <div key={st.product.id} className="p-4 space-y-3 hover:bg-pink-50/20 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded border border-pink-200">
                            {st.product.code}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">{st.product.category}</span>
                        </div>
                        <h3 className="font-bold text-slate-800 text-sm mt-1">{st.product.name}</h3>
                      </div>

                      {isOut ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200 shrink-0">
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1 shrink-0">
                          <AlertTriangle className="w-3 h-3" /> Reorder Soon
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                          Optimal
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Stocked In</span>
                        <span className="font-semibold text-slate-700">{st.totalStockedIn} pcs</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Sold</span>
                        <span className="font-semibold text-pink-600">{st.totalSold} pcs</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">On Hand</span>
                        <span className={`font-bold ${isLow ? 'text-amber-600' : 'text-slate-800'}`}>
                          {st.currentStock} pcs
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-0.5">
                      <span className="text-slate-500 font-medium">Cost Valuation:</span>
                      <span className="font-bold text-slate-800">
                        {formatNaira(st.currentStock > 0 ? st.totalStockCostValue : 0)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop View: Full-featured Table (Hidden on small mobile screens) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Code</th>
                    <th className="py-3.5 px-4 font-semibold">Product Name</th>
                    <th className="py-3.5 px-4 font-semibold">Category</th>
                    <th className="py-3.5 px-4 text-right font-semibold">Total Stocked In</th>
                    <th className="py-3.5 px-4 text-right font-semibold">Total Sold</th>
                    <th className="py-3.5 px-4 text-right font-semibold">Stock On Hand</th>
                    <th className="py-3.5 px-4 text-right font-semibold">Cost Valuation</th>
                    <th className="py-3.5 px-4 text-center font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inventoryList.map((st) => {
                    const isLow = st.currentStock <= st.lowStockThreshold;
                    const isOut = st.currentStock <= 0;

                    return (
                      <tr key={st.product.id} className="hover:bg-pink-50/20 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-pink-600">{st.product.code}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{st.product.name}</td>
                        <td className="py-3.5 px-4 text-slate-500">{st.product.category}</td>
                        <td className="py-3.5 px-4 text-right font-medium text-slate-700">{st.totalStockedIn} pcs</td>
                        <td className="py-3.5 px-4 text-right font-medium text-pink-600">{st.totalSold} pcs</td>
                        <td className={`py-3.5 px-4 text-right font-bold text-sm ${isLow ? 'text-amber-600' : 'text-slate-800'}`}>
                          {st.currentStock} pcs
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium text-slate-600">
                          {formatNaira(st.currentStock > 0 ? st.totalStockCostValue : 0)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {isOut ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200">
                              Out of Stock
                            </span>
                          ) : isLow ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Reorder Soon
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Optimal
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
