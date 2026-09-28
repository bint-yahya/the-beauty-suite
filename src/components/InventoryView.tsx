import React, { useMemo } from 'react';
import { Package, Truck, AlertTriangle, AlertCircle, FilterX, Gift, CheckCircle2, ShoppingBag, Layers, DollarSign } from 'lucide-react';
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

  const totals = useMemo(() => {
    let stockedIn = 0;
    let sold = 0;
    let gifted = 0;
    let onHand = 0;
    let valuation = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    inventoryList.forEach(st => {
      stockedIn += Number(st.totalStockedIn) || 0;
      sold += Number(st.totalSold) || 0;
      gifted += Number(st.totalGifted) || 0;
      onHand += Number(st.currentStock) || 0;
      if (st.currentStock > 0) {
        valuation += Number(st.totalStockCostValue) || 0;
      }
      if (st.currentStock <= 0) {
        outOfStockCount++;
      } else if (st.currentStock <= st.lowStockThreshold) {
        lowStockCount++;
      }
    });

    return { stockedIn, sold, gifted, onHand, valuation, lowStockCount, outOfStockCount };
  }, [inventoryList]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="w-5 h-5 text-pink-600" />
            Live Inventory & Stock Health
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregates total stock-in units against all customer sales and promotional gift deductions with 100% batch reconciliation.
          </p>
        </div>
        <button
          id="btn-restock-inventory"
          onClick={onOpenStockIn}
          className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs shadow-pink-300 transition-all cursor-pointer shrink-0"
        >
          <Truck className="w-4 h-4" />
          <span>Restock Inventory</span>
        </button>
      </div>

      {/* Real-time Inventory Reconciliation KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Total Stocked In</span>
            <Truck className="w-4 h-4 text-pink-600" />
          </div>
          <div className="text-xl font-bold text-slate-800">{totals.stockedIn} pcs</div>
          <div className="text-[10px] text-slate-400">Total batch inbound</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Units Sold</span>
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-pink-600">{totals.sold} pcs</div>
          <div className="text-[10px] text-slate-400">Customer purchases</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Gifted / Freebies</span>
            <Gift className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-purple-600">{totals.gifted} pcs</div>
          <div className="text-[10px] text-slate-400">Catalog promotional units</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-emerald-200/80 bg-emerald-50/20 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800">Live On Hand</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-700">{totals.onHand} pcs</div>
          <div className="text-[10px] font-semibold text-emerald-600">Active stock ready to sell</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Asset Cost Value</span>
            <DollarSign className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-xl font-bold text-slate-800">{formatNaira(totals.valuation)}</div>
          <div className="text-[10px] text-slate-400">Landed valuation</div>
        </div>
      </div>

      {/* Reconciliation Formula Banner */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-700">Stock Tally:</span>
          <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800 font-semibold">
            {totals.stockedIn} Stocked In
          </span>
          <span className="text-slate-400 font-bold">−</span>
          <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-pink-600 font-semibold">
            {totals.sold} Sold
          </span>
          <span className="text-slate-400 font-bold">−</span>
          <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-purple-700 font-semibold">
            {totals.gifted} Gifted
          </span>
          <span className="text-slate-400 font-bold">=</span>
          <span className="font-mono bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300 text-emerald-800 font-bold">
            {totals.onHand} pcs Live On Hand
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>✓ 100% In Tally with Inbound Batches</span>
        </div>
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

                    <div className="grid grid-cols-4 gap-1.5 text-xs bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Stocked</span>
                        <span className="font-semibold text-slate-700">{st.totalStockedIn}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Sold</span>
                        <span className="font-semibold text-pink-600">{st.totalSold}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Gifted</span>
                        <span className={`font-semibold ${st.totalGifted > 0 ? 'text-purple-600 font-bold' : 'text-slate-500'}`}>
                          {st.totalGifted || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">On Hand</span>
                        <span className={`font-bold ${isLow ? 'text-amber-600' : 'text-slate-800'}`}>
                          {st.currentStock}
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
                    <th className="py-3.5 px-4 font-semibold">SKU Code</th>
                    <th className="py-3.5 px-4 font-semibold">Product Name</th>
                    <th className="py-3.5 px-4 font-semibold">Category</th>
                    <th className="py-3.5 px-4 text-right font-semibold">Stocked In</th>
                    <th className="py-3.5 px-4 text-right font-semibold">Sold</th>
                    <th className="py-3.5 px-4 text-right font-semibold">Gifted / Freebies</th>
                    <th className="py-3.5 px-4 text-right font-semibold">On Hand</th>
                    <th className="py-3.5 px-4 text-right font-semibold">Asset Value</th>
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
                        <td className="py-3.5 px-4 text-right font-medium">
                          {st.totalGifted > 0 ? (
                            <span className="inline-flex items-center gap-1 text-purple-700 font-bold bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full text-[10px]">
                              <Gift className="w-3 h-3 text-purple-600" />
                              {st.totalGifted} pcs
                            </span>
                          ) : (
                            <span className="text-slate-400">0 pcs</span>
                          )}
                        </td>
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
