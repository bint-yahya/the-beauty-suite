import React, { useState, useMemo } from 'react';
import { Truck, Plus, Trash2, Pencil, Package, Filter, ChevronDown, CheckCircle2, Archive } from 'lucide-react';
import { BatchOrder, ProductItem, SaleRecord, ComboItem, formatNaira } from '../types';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

export type BatchStatusFilter = 'all' | 'active' | 'depleted';

interface StockInViewProps {
  batches: BatchOrder[];
  products: ProductItem[];
  sales?: SaleRecord[];
  combos?: ComboItem[];
  onOpenAddBatch: () => void;
  onEditBatch?: (batch: BatchOrder) => void;
  onDeleteBatch?: (id: string) => void;
}

interface BatchStockDetail {
  totalUnits: number;
  remainingUnits: number;
  status: 'Active' | 'Depleted';
  itemRemaining: Record<number, number>;
}

export const StockInView: React.FC<StockInViewProps> = ({
  batches,
  products,
  sales = [],
  combos = [],
  onOpenAddBatch,
  onEditBatch,
  onDeleteBatch
}) => {
  const [batchToDelete, setBatchToDelete] = useState<BatchOrder | null>(null);
  const [batchStatusFilter, setBatchStatusFilter] = useState<BatchStatusFilter>('all');

  // Compute FIFO batch depletion and remaining stock on hand per batch
  const batchStockMap = useMemo(() => {
    const map = new Map<string, BatchStockDetail>();

    // 1. Calculate total units sold per productId across all single & combo sales
    const soldPerProduct: Record<string, number> = {};
    sales.forEach(s => {
      const qty = Number(s.qty) || 0;
      if (s.type === 'single') {
        soldPerProduct[s.itemId] = (soldPerProduct[s.itemId] || 0) + qty;
      } else if (s.type === 'combo') {
        const cmb = combos.find(c => c.id === s.itemId);
        if (cmb && cmb.items) {
          cmb.items.forEach(ci => {
            soldPerProduct[ci.productId] = (soldPerProduct[ci.productId] || 0) + (Number(ci.qty) || 0) * qty;
          });
        }
      }
    });

    // 2. Initialize stock details for all batches
    batches.forEach(b => {
      const totalUnits = (b.items || []).reduce((acc, i) => acc + (Number(i.qty) || 0), 0);
      map.set(b.id, {
        totalUnits,
        remainingUnits: totalUnits,
        status: totalUnits > 0 ? 'Active' : 'Depleted',
        itemRemaining: {}
      });
    });

    // 3. Chronologically sort batches (FIFO) to consume units per product
    const sortedBatches = [...batches].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    const remainingSoldPool: Record<string, number> = { ...soldPerProduct };

    // Get unique product IDs present in batches
    const productIdsInBatches = new Set<string>();
    batches.forEach(b => (b.items || []).forEach(i => productIdsInBatches.add(i.productId)));

    productIdsInBatches.forEach(prodId => {
      let unallocatedSold = remainingSoldPool[prodId] || 0;

      sortedBatches.forEach(b => {
        const detail = map.get(b.id);
        if (!detail) return;

        (b.items || []).forEach((item, idx) => {
          if (item.productId === prodId) {
            const itemQty = Number(item.qty) || 0;
            const consumed = Math.min(itemQty, unallocatedSold);
            unallocatedSold -= consumed;
            const remaining = Math.max(0, itemQty - consumed);
            detail.itemRemaining[idx] = remaining;
          }
        });
      });
    });

    // 4. Determine final remaining units and Active/Depleted status for each batch
    batches.forEach(b => {
      const detail = map.get(b.id);
      if (!detail) return;

      let remainingUnits = 0;
      (b.items || []).forEach((item, idx) => {
        const r = detail.itemRemaining[idx] !== undefined ? detail.itemRemaining[idx] : (Number(item.qty) || 0);
        remainingUnits += r;
      });

      detail.remainingUnits = remainingUnits;

      if (b.status === 'Active' || b.status === 'Depleted') {
        detail.status = b.status;
      } else {
        detail.status = (remainingUnits > 0 && detail.totalUnits > 0) ? 'Active' : 'Depleted';
      }
    });

    return map;
  }, [batches, sales, combos]);

  const allCount = batches.length;
  const activeCount = batches.filter(b => batchStockMap.get(b.id)?.status === 'Active').length;
  const depletedCount = batches.filter(b => batchStockMap.get(b.id)?.status === 'Depleted').length;

  const displayedBatches = useMemo(() => {
    if (batchStatusFilter === 'active') {
      return batches.filter(b => batchStockMap.get(b.id)?.status === 'Active');
    }
    if (batchStatusFilter === 'depleted') {
      return batches.filter(b => batchStockMap.get(b.id)?.status === 'Depleted');
    }
    return batches;
  }, [batches, batchStatusFilter, batchStockMap]);

  const getBatchSummary = (batch: BatchOrder) => {
    const totalUnits = (batch.items || []).reduce((acc, i) => acc + (Number(i.qty) || 0), 0);
    const totalProductPurchases = (batch.items || []).reduce((acc, i) => acc + (Number(i.batchPurchasePrice) || 0), 0);
    const totalBatchLandedExpense = totalProductPurchases + (Number(batch.totalDeliveryFee) || 0);
    return { totalUnits, totalProductPurchases, totalBatchLandedExpense };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Truck className="w-5 h-5 text-pink-600" />
            Stock In & Batch Order Manager
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log inventory batch orders. Delivery fees are automatically allocated across units to calculate true Landed Cost.
          </p>
        </div>
        <button
          id="btn-add-batch-main"
          onClick={onOpenAddBatch}
          className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs shadow-pink-300 transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Batch Order</span>
        </button>
      </div>

      {/* Batch Status Filter Bar (Declutters Active vs Depleted Batches) */}
      {batches.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-100 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Filter className="w-4 h-4 text-pink-600 shrink-0" />
            <span className="text-xs font-semibold text-slate-700">Batch Status Filter:</span>
            <div className="relative">
              <select
                id="filter-batch-status"
                aria-label="Filter batches by active or depleted status"
                value={batchStatusFilter}
                onChange={(e) => setBatchStatusFilter(e.target.value as BatchStatusFilter)}
                className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl pl-3 pr-8 py-1.5 focus:outline-hidden focus:border-pink-500 cursor-pointer transition-colors shadow-2xs"
              >
                <option value="all">All Batches ({allCount})</option>
                <option value="active">Active Batches ({activeCount})</option>
                <option value="depleted">Depleted Batches ({depletedCount})</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
            </div>
          </div>

          {/* Quick Segmented Toggle Pills */}
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl text-xs font-medium self-start sm:self-auto">
            <button
              id="btn-toggle-batches-all"
              onClick={() => setBatchStatusFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                batchStatusFilter === 'all'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({allCount})
            </button>
            <button
              id="btn-toggle-batches-active"
              onClick={() => setBatchStatusFilter('active')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                batchStatusFilter === 'active'
                  ? 'bg-white text-emerald-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Active ({activeCount})
            </button>
            <button
              id="btn-toggle-batches-depleted"
              onClick={() => setBatchStatusFilter('depleted')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                batchStatusFilter === 'depleted'
                  ? 'bg-white text-slate-800 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              Depleted ({depletedCount})
            </button>
          </div>
        </div>
      )}

      {/* Batches List or Empty States */}
      <div className="space-y-4">
        {batches.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center text-slate-400">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-30 text-pink-500" />
            <p className="font-semibold text-slate-600 text-sm">No batch orders recorded</p>
            <p className="text-xs text-slate-400 mt-1">
              Click &quot;Log New Batch Order&quot; above to log your received shipments and landed costs.
            </p>
          </div>
        ) : displayedBatches.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center space-y-3">
            <Archive className="w-10 h-10 mx-auto opacity-30 text-pink-500" />
            <div>
              <p className="font-bold text-slate-700 text-sm">
                {batchStatusFilter === 'depleted'
                  ? 'No depleted batches found'
                  : 'No active batches found'}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {batchStatusFilter === 'depleted'
                  ? `All ${batches.length} batch orders currently have active inventory remaining in stock.`
                  : `All ${batches.length} recorded batch orders have been fully consumed by sales.`}
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setBatchStatusFilter('all')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                View All Batches ({allCount})
              </button>
            </div>
          </div>
        ) : (
          displayedBatches.map((batch) => {
            const { totalUnits, totalBatchLandedExpense } = getBatchSummary(batch);
            const allocatedDeliveryPerUnit = totalUnits > 0 ? (Number(batch.totalDeliveryFee) || 0) / totalUnits : 0;
            const stockDetail = batchStockMap.get(batch.id) || {
              totalUnits,
              remainingUnits: totalUnits,
              status: 'Active' as const,
              itemRemaining: {}
            };
            const isDepleted = stockDetail.status === 'Depleted';

            return (
              <div
                key={batch.id}
                className={`bg-white rounded-2xl border transition-all p-5 space-y-4 shadow-sm ${
                  isDepleted ? 'border-slate-200/80 bg-slate-50/40 opacity-90' : 'border-slate-100'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-lg border border-pink-200">
                      {batch.id}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm text-slate-800">
                          {batch.supplier || 'Direct Supplier Order'}
                        </h3>
                        {/* Status Badge */}
                        {isDepleted ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            Depleted (0 / {totalUnits} pcs remaining)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Active ({stockDetail.remainingUnits} / {totalUnits} pcs remaining)
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">Order Date: {batch.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs flex-wrap sm:flex-nowrap">
                    <div className="bg-pink-50/60 px-3 py-1.5 rounded-lg border border-pink-100">
                      <span className="text-slate-500">Delivery Fee: </span>
                      <span className="font-bold text-pink-600">{formatNaira(batch.totalDeliveryFee)}</span>
                    </div>
                    <div className="bg-slate-900 text-white px-3 py-1.5 rounded-lg font-bold">
                      Total Landed: {formatNaira(totalBatchLandedExpense)}
                    </div>
                    {onEditBatch && (
                      <button
                        id={`btn-edit-batch-${batch.id}`}
                        onClick={() => onEditBatch(batch)}
                        className="p-2 text-slate-400 hover:text-pink-600 rounded-xl hover:bg-pink-50 border border-transparent hover:border-pink-100 transition-colors cursor-pointer"
                        title="Edit Batch Record"
                        aria-label={`Edit batch ${batch.id}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                    {onDeleteBatch && (
                      <button
                        id={`btn-delete-batch-${batch.id}`}
                        onClick={() => setBatchToDelete(batch)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors cursor-pointer"
                        title="Delete Batch Record"
                        aria-label={`Delete batch ${batch.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Mobile View: Batch Items Cards (Hidden on sm screens and up) */}
                <div className="block sm:hidden divide-y divide-slate-100 bg-slate-50/50 rounded-xl p-2 border border-slate-100">
                  {batch.items.map((item, idx) => {
                    const prod = products.find(p => p.id === item.productId);
                    const itemQty = Number(item.qty) || 1;
                    const unitPurchaseCost = (Number(item.batchPurchasePrice) || 0) / itemQty;
                    const landedCostPerUnit = unitPurchaseCost + allocatedDeliveryPerUnit;
                    const itemRem = stockDetail.itemRemaining[idx] !== undefined
                      ? stockDetail.itemRemaining[idx]
                      : itemQty;

                    return (
                      <div key={idx} className="py-2.5 px-2 space-y-2 first:pt-1 last:pb-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 text-xs">{prod?.name || item.productId}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                              {item.qty} units
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                itemRem > 0
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                  : 'bg-slate-100 text-slate-500 border border-slate-200'
                              }`}
                            >
                              {itemRem > 0 ? `${itemRem} left` : 'Sold out'}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
                          <div>
                            <span className="text-slate-400 block text-[9px]">Purchase / Pc</span>
                            <span className="font-semibold">{formatNaira(unitPurchaseCost)}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px]">Delivery / Pc</span>
                            <span className="font-semibold text-pink-700">+{formatNaira(allocatedDeliveryPerUnit)}</span>
                          </div>
                          <div className="col-span-2 pt-1 border-t border-slate-50 flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Landed Cost / Pc:</span>
                            <span className="font-bold text-emerald-600">{formatNaira(landedCostPerUnit)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop View: Full-featured Table (Hidden on small mobile screens) */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                      <tr className="uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-3">Product Name</th>
                        <th className="py-2.5 px-3 text-right">Initial Quantity</th>
                        <th className="py-2.5 px-3 text-right">Remaining Stock</th>
                        <th className="py-2.5 px-3 text-right">Batch Purchase Cost</th>
                        <th className="py-2.5 px-3 text-right">Purchase / Pc</th>
                        <th className="py-2.5 px-3 text-right bg-pink-50/70 font-bold text-pink-700">Allocated Delivery / Pc</th>
                        <th className="py-2.5 px-3 text-right font-bold text-slate-800">Calculated Landed Cost / Pc</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {batch.items.map((item, idx) => {
                        const prod = products.find(p => p.id === item.productId);
                        const itemQty = Number(item.qty) || 1;
                        const unitPurchaseCost = (Number(item.batchPurchasePrice) || 0) / itemQty;
                        const landedCostPerUnit = unitPurchaseCost + allocatedDeliveryPerUnit;
                        const itemRem = stockDetail.itemRemaining[idx] !== undefined
                          ? stockDetail.itemRemaining[idx]
                          : itemQty;

                        return (
                          <tr key={idx} className="hover:bg-pink-50/20 transition-colors">
                            <td className="py-2.5 px-3 font-semibold text-slate-800">
                              {prod?.name || item.productId}
                            </td>
                            <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                              {item.qty} units
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[11px] ${
                                  itemRem > 0
                                    ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-100'
                                    : 'bg-slate-100 text-slate-500 font-semibold'
                                }`}
                              >
                                {itemRem > 0 ? `${itemRem} units` : '0 (Depleted)'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-medium text-slate-600">
                              {formatNaira(item.batchPurchasePrice)}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-600">
                              {formatNaira(unitPurchaseCost)}
                            </td>
                            <td className="py-2.5 px-3 text-right bg-pink-50/40 font-semibold text-pink-700">
                              + {formatNaira(allocatedDeliveryPerUnit)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                              {formatNaira(landedCostPerUnit)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {batch.notes && (
                  <p className="text-xs text-slate-400 italic">Notes: {batch.notes}</p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Delete Batch In-App Modal */}
      {batchToDelete && (
        <ConfirmDeleteModal
          isOpen={true}
          title="Delete Stock-In Batch Record"
          description={`Are you sure you want to delete batch record "${batchToDelete.id}"?`}
          details={[
            { label: 'Batch ID', value: batchToDelete.id },
            { label: 'Supplier', value: batchToDelete.supplier || 'Direct Supplier' },
            { label: 'Order Date', value: batchToDelete.date },
            { label: 'Total Units', value: `${getBatchSummary(batchToDelete).totalUnits} unit(s)` },
            { label: 'Delivery Fee', value: formatNaira(batchToDelete.totalDeliveryFee) },
            { label: 'Total Landed Cost', value: formatNaira(getBatchSummary(batchToDelete).totalBatchLandedExpense), highlight: true }
          ]}
          confirmText="Delete Batch Record"
          onConfirm={() => {
            if (onDeleteBatch) {
              onDeleteBatch(batchToDelete.id);
            }
            setBatchToDelete(null);
          }}
          onCancel={() => setBatchToDelete(null)}
        />
      )}
    </div>
  );
};
