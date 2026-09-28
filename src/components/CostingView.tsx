import React, { useState } from 'react';
import { DollarSign, Sparkles, Plus, Trash2, AlertCircle, FilterX, Package } from 'lucide-react';
import { ProductItem, ComboItem, formatNaira } from '../types';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface CostingViewProps {
  products: ProductItem[];
  combos: ComboItem[];
  totalProductsCount?: number;
  totalCombosCount?: number;
  selectedCategory?: string;
  selectedProductFilter?: string;
  onResetFilters?: () => void;
  onOpenAddCombo: () => void;
  onDeleteCombo: (id: string, name: string) => void;
  getProductCostBreakdown: (p: ProductItem) => any;
  getComboCostBreakdown: (c: ComboItem) => any;
}

export const CostingView: React.FC<CostingViewProps> = ({
  products,
  combos,
  totalProductsCount,
  totalCombosCount,
  selectedCategory = 'all',
  selectedProductFilter = 'all',
  onResetFilters,
  onOpenAddCombo,
  onDeleteCombo,
  getProductCostBreakdown,
  getComboCostBreakdown
}) => {
  const [comboToDelete, setComboToDelete] = useState<ComboItem | null>(null);

  const isFilterActive = (totalProductsCount !== undefined && totalProductsCount !== products.length) ||
    (totalCombosCount !== undefined && totalCombosCount !== combos.length) ||
    selectedCategory !== 'all' ||
    selectedProductFilter !== 'all';

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Notice banner if global Category or Product filter is applied */}
      {isFilterActive && onResetFilters && (
        <div className="flex items-center justify-between bg-pink-50/80 border border-pink-200 px-4 py-2.5 rounded-2xl text-xs text-pink-800 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-pink-600 shrink-0" />
            <span>
              <strong>Filter Active:</strong> Showing {products.length} single SKUs and {combos.length} bundle packages matching your selected Category / Product filter.
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

      {/* Section 1: Singles Costing Engine */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-pink-600" />
            Single Product Unit Costing & Profit Margin Engine
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Unit landed costs, selling prices, and catalog gross & net profit margins.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {products.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <Package className="w-9 h-9 mx-auto opacity-30 text-pink-500" />
              <p className="font-semibold text-slate-700 text-sm">
                {isFilterActive ? 'No single products match active filter' : 'No products available for costing'}
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {isFilterActive
                  ? 'Try selecting "All Products" or "All Categories" from the top bar to view other items.'
                  : 'Add product SKUs to your catalog to calculate landed costs and profit margins.'}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile View: Single Product Costing Cards (Hidden on sm screens and up) */}
              <div className="block sm:hidden divide-y divide-slate-100">
            {products.map((prod) => {
              const breakdown = getProductCostBreakdown(prod);
              return (
                <div key={prod.id} className="p-4 space-y-3 hover:bg-pink-50/20 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded border border-pink-200">
                        {prod.code}
                      </span>
                      <h4 className="font-bold text-slate-800 text-sm mt-1">{prod.name}</h4>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-md font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs shrink-0">
                      {breakdown.marginPercent.toFixed(1)}% Margin
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Landed Cost</span>
                      <span className="font-semibold text-slate-700">{formatNaira(prod.unitLandedCost)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Selling Price</span>
                      <span className="font-bold text-slate-800">{formatNaira(prod.sellingPrice)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Net Profit / Unit</span>
                      <span className="font-bold text-emerald-600">{formatNaira(breakdown.netProfit)}</span>
                    </div>
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
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-right">Landed Cost</th>
                  <th className="py-3 px-3 text-right font-bold">Selling Price</th>
                  <th className="py-3 px-3 text-right font-bold text-emerald-600">Unit Net Profit</th>
                  <th className="py-3 px-3 text-right">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((prod) => {
                  const breakdown = getProductCostBreakdown(prod);
                  return (
                    <tr key={prod.id} className="hover:bg-pink-50/30 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        <span className="font-mono text-pink-600 font-bold mr-1.5">{prod.code}</span>
                        {prod.name}
                      </td>
                      <td className="py-3 px-3 text-slate-500">{prod.category}</td>
                      <td className="py-3 px-3 text-right font-medium text-slate-600">{formatNaira(prod.unitLandedCost)}</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-800">
                        {formatNaira(prod.sellingPrice)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-600">
                        {formatNaira(breakdown.netProfit)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="px-2 py-0.5 rounded-md font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px]">
                          {breakdown.marginPercent.toFixed(1)}%
                        </span>
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

      {/* Section 2: Combo & Bundle Pricing Studio */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-600" />
              Combo & Bundle Pricing Studio (with Automated Discounting)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Combine multiple SKUs, apply percentage or fixed discounts, and review net margins in real time.
            </p>
          </div>
          <button
            id="btn-create-combo-main"
            onClick={onOpenAddCombo}
            className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs shadow-pink-300 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Combo</span>
          </button>
        </div>

        {combos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center space-y-3">
            <Sparkles className="w-9 h-9 mx-auto opacity-30 text-pink-500" />
            <p className="font-semibold text-slate-700 text-sm">
              {isFilterActive ? 'No combo bundles match active filter' : 'No combo packages created'}
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {isFilterActive
                ? 'Try clearing the Category or Product filter to view all bundle offers.'
                : 'Bundle multiple SKUs together with special discounts to boost average order value.'}
            </p>
            {isFilterActive && onResetFilters ? (
              <div className="pt-2">
                <button
                  onClick={onResetFilters}
                  className="px-4 py-2 bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="pt-2">
                <button
                  onClick={onOpenAddCombo}
                  className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Create First Combo
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {combos.map((combo) => {
            const comboCalc = getComboCostBreakdown(combo);
            return (
              <div key={combo.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-md border border-pink-200">
                      {combo.code}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {comboCalc.marginPercent.toFixed(1)}% Net Margin
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mt-2.5">{combo.name}</h3>

                  {/* Components list */}
                  <div className="mt-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                    <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider block">
                      Included Components:
                    </span>
                    {comboCalc.itemDetails.map((it: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-slate-600">
                        <span>• {it.product?.name || 'Product'} × {it.qty}</span>
                        <span className="font-medium text-slate-400">Retail: {formatNaira(it.price)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Cost & Pricing breakdown */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <span className="text-slate-400 block text-[10px]">Total Component Cost</span>
                      <span className="font-bold text-slate-700">{formatNaira(comboCalc.totalCost)}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <span className="text-slate-400 block text-[10px]">Individual Value</span>
                      <span className="font-bold text-slate-400 line-through">{formatNaira(comboCalc.itemsTotalSelling)}</span>
                    </div>
                    <div className="p-2.5 bg-pink-50/70 rounded-lg border border-pink-100/60">
                      <span className="text-slate-400 block text-[10px]">Discount Applied</span>
                      <span className="font-bold text-pink-700">
                        {combo.discountType === 'percentage' ? `${combo.discountValue}% Off` : `- ${formatNaira(combo.discountValue)}`}
                      </span>
                    </div>
                    <div className="p-2.5 bg-emerald-50/60 rounded-lg">
                      <span className="text-slate-400 block text-[10px]">Net Profit / Combo</span>
                      <span className="font-bold text-emerald-600">{formatNaira(comboCalc.netProfit)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Final Selling Price</span>
                    <span className="text-lg font-bold text-slate-800">{formatNaira(comboCalc.finalSellingPrice)}</span>
                  </div>
                  <button
                    onClick={() => setComboToDelete(combo)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete combo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>

      {/* Delete Combo In-App Modal */}
      {comboToDelete && (
        <ConfirmDeleteModal
          isOpen={true}
          title="Delete Combo Bundle"
          description={`Are you sure you want to delete bundle "${comboToDelete.name}"?`}
          details={[
            { label: 'Bundle Code', value: comboToDelete.code },
            { label: 'Components', value: `${comboToDelete.items.length} product(s)` },
            { label: 'Final Selling Price', value: formatNaira(getComboCostBreakdown(comboToDelete).finalSellingPrice), highlight: true }
          ]}
          confirmText="Delete Bundle"
          onConfirm={() => {
            const { id, name } = comboToDelete;
            setComboToDelete(null);
            onDeleteCombo(id, name);
          }}
          onCancel={() => setComboToDelete(null)}
        />
      )}
    </div>
  );
};
