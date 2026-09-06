import React, { useState } from 'react';
import { ShoppingBag, Plus, Search, Trash2, Pencil, RotateCcw, FileText, FilterX, AlertCircle } from 'lucide-react';
import { SaleRecord, ProductItem, ComboItem, formatNaira } from '../types';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface SalesViewProps {
  sales: SaleRecord[];
  filteredSales: SaleRecord[];
  products: ProductItem[];
  combos: ComboItem[];
  onOpenRecordSale: () => void;
  onRepeatLastSale?: () => void;
  onEditSale?: (sale: SaleRecord) => void;
  onOpenExportReport?: () => void;
  onDeleteSale: (id: string) => void;
  onResetFilters?: () => void;
  getProductCostBreakdown: (p: ProductItem) => any;
  getComboCostBreakdown: (c: ComboItem) => any;
}

export const SalesView: React.FC<SalesViewProps> = ({
  sales,
  filteredSales,
  products,
  combos,
  onOpenRecordSale,
  onRepeatLastSale,
  onEditSale,
  onOpenExportReport,
  onDeleteSale,
  onResetFilters,
  getProductCostBreakdown,
  getComboCostBreakdown
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [saleToDelete, setSaleToDelete] = useState<SaleRecord | null>(null);

  const displaySales = filteredSales.filter(s => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (s.customer && s.customer.toLowerCase().includes(q)) ||
      (s.channel && s.channel.toLowerCase().includes(q)) ||
      s.id.toLowerCase().includes(q)
    );
  });

  const getItemName = (sale: SaleRecord) => {
    if (sale.type === 'single') {
      const prod = products.find(p => p.id === sale.itemId);
      return prod ? prod.name : 'Unknown Product';
    } else {
      const cmb = combos.find(c => c.id === sale.itemId);
      return cmb ? cmb.name : 'Unknown Bundle';
    }
  };

  const getSaleProfit = (sale: SaleRecord) => {
    const qty = Number(sale.qty) || 0;
    const unitPrice = Number(sale.sellingPrice) || 0;
    if (sale.type === 'single') {
      const prod = products.find(p => p.id === sale.itemId);
      return prod ? (unitPrice - getProductCostBreakdown(prod).totalCost) * qty : 0;
    } else {
      const cmb = combos.find(c => c.id === sale.itemId);
      return cmb ? (unitPrice - getComboCostBreakdown(cmb).totalCost) * qty : 0;
    }
  };

  const isFilterActive = filteredSales.length !== sales.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-pink-600" />
            Sales Transactions Log
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time orders log, multi-channel tracking (Snapchat, IG, WhatsApp, Website, Pop-ups), and automated stock deductions.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {onOpenExportReport && (
            <button
              id="btn-export-pdf-sales"
              onClick={onOpenExportReport}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-pink-50 border border-slate-200 hover:border-pink-300 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-pink-600" />
              <span>Export PDF Report</span>
            </button>
          )}
          {onRepeatLastSale && (
            <button
              id="btn-repeat-last-sale"
              onClick={onRepeatLastSale}
              disabled={sales.length === 0}
              title={sales.length === 0 ? "No recorded sales to repeat yet" : "Pre-populate new sale modal with most recent transaction"}
              className={`inline-flex items-center gap-2 px-3.5 py-2 border text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                sales.length === 0
                  ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                  : 'bg-white hover:bg-pink-50 border-pink-200 text-pink-700 hover:border-pink-300 shadow-2xs cursor-pointer active:scale-95'
              }`}
            >
              <RotateCcw className="w-4 h-4 text-pink-600" />
              <span>Repeat Last Sale</span>
            </button>
          )}
          <button
            id="btn-record-sale-main"
            onClick={onOpenRecordSale}
            className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs shadow-pink-300 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Record Sale</span>
          </button>
        </div>
      </div>

      {/* Notice banner if global date/category filter is hiding some recorded sales */}
      {isFilterActive && onResetFilters && (
        <div className="flex items-center justify-between bg-pink-50/80 border border-pink-200 px-4 py-2.5 rounded-2xl text-xs text-pink-800 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-pink-600 shrink-0" />
            <span>
              <strong>Filter Active:</strong> Showing {filteredSales.length} of {sales.length} total logged sales based on your selected date/category filter.
            </span>
          </div>
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-xs font-bold text-pink-700 hover:text-pink-900 bg-white px-2.5 py-1 rounded-lg border border-pink-300 hover:bg-pink-100 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <FilterX className="w-3.5 h-3.5" />
            <span>View All ({sales.length})</span>
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Sleek Search bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center bg-slate-100 rounded-full px-4 py-1.5 w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search by customer, channel, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-xs outline-none w-full text-slate-700 font-medium"
            />
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Showing {displaySales.length} of {sales.length} records
          </span>
        </div>

        {/* Mobile View: High-clarity Cards (Hidden on sm screens and up) */}
        <div className="block sm:hidden divide-y divide-slate-100">
          {displaySales.length === 0 ? (
            <div className="text-center py-10 px-4 text-slate-400">
              <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-30 text-pink-500" />
              <p className="font-semibold text-slate-600">No sales transactions found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isFilterActive ? 'Try adjusting your date/category filter above.' : 'Click "Record Sale" to log your first order.'}
              </p>
              {isFilterActive && onResetFilters && (
                <button
                  onClick={onResetFilters}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-xl text-xs font-semibold border border-pink-200 cursor-pointer"
                >
                  <FilterX className="w-3.5 h-3.5" />
                  <span>Show All Time Records</span>
                </button>
              )}
            </div>
          ) : (
            displaySales.map((sale) => {
              const qty = Number(sale.qty) || 0;
              const unitPrice = Number(sale.sellingPrice) || 0;
              const totalRev = qty * unitPrice;
              const netProfit = getSaleProfit(sale);
              const itemName = getItemName(sale);

              return (
                <div key={sale.id} className="p-4 space-y-3 hover:bg-pink-50/20 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-400">{sale.id}</span>
                        <span className="text-xs text-slate-500 font-mono">{sale.date}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                          sale.type === 'combo' ? 'bg-pink-50 text-pink-700 border border-pink-200' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {sale.type === 'combo' ? 'Bundle' : 'Single'}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm mt-1">{itemName}</h4>
                    </div>

                    {/* Touch-Friendly Action Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      {onEditSale && (
                        <button
                          id={`btn-edit-sale-mobile-${sale.id}`}
                          onClick={() => onEditSale(sale)}
                          className="text-slate-500 hover:text-pink-600 p-2 rounded-xl bg-slate-50 hover:bg-pink-50 border border-slate-200 hover:border-pink-200 transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                          title="Edit Sale"
                          aria-label={`Edit sale ${sale.id}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        id={`btn-delete-sale-mobile-${sale.id}`}
                        onClick={() => setSaleToDelete(sale)}
                        className="text-slate-500 hover:text-rose-600 p-2 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                        title="Delete Sale"
                        aria-label={`Delete sale ${sale.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600 font-medium">{sale.customer || 'Direct Customer'}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                        sale.channel === 'Snapchat'
                          ? 'bg-amber-100/80 text-amber-800 border border-amber-200'
                          : sale.channel === 'Instagram DM'
                          ? 'bg-pink-100 text-pink-700 border border-pink-200'
                          : sale.channel === 'WhatsApp'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {sale.channel || 'Direct'}
                      </span>
                    </div>
                    <span className="font-semibold text-slate-700">{qty} unit(s) × {formatNaira(unitPrice)}</span>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-2.5 flex items-center justify-between text-xs border border-slate-100">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Revenue</span>
                      <span className="font-bold text-slate-800">{formatNaira(totalRev)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] block">Net Profit</span>
                      <span className="font-bold text-emerald-600">{formatNaira(netProfit)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Full-featured Table (Hidden on small mobile screens) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Item Sold</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Customer / Channel</th>
                <th className="py-3 px-4 text-right">Qty</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-right font-bold">Total Revenue</th>
                <th className="py-3 px-4 text-right font-bold text-emerald-600">Net Profit</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displaySales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-400">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-30 text-pink-500" />
                    <p className="font-semibold text-slate-600">No sales transactions found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isFilterActive ? 'Try adjusting your date/category filter above.' : 'Click "Record Sale" to log your first order.'}
                    </p>
                    {isFilterActive && onResetFilters && (
                      <button
                        onClick={onResetFilters}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-xl text-xs font-semibold border border-pink-200 cursor-pointer"
                      >
                        <FilterX className="w-3.5 h-3.5" />
                        <span>Show All Time Records</span>
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                displaySales.map((sale) => {
                  const qty = Number(sale.qty) || 0;
                  const unitPrice = Number(sale.sellingPrice) || 0;
                  const totalRev = qty * unitPrice;
                  const netProfit = getSaleProfit(sale);
                  const itemName = getItemName(sale);

                  return (
                    <tr key={sale.id} className="hover:bg-pink-50/20 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-600">{sale.date}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{itemName}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          sale.type === 'combo' ? 'bg-pink-50 text-pink-700 border border-pink-200' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {sale.type === 'combo' ? 'Bundle Combo' : 'Single SKU'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{sale.customer || 'Direct Customer'}</div>
                        <span className={`inline-block mt-0.5 text-[10px] px-2 py-0.2 rounded font-medium ${
                          sale.channel === 'Snapchat'
                            ? 'bg-amber-100/80 text-amber-800 border border-amber-200'
                            : sale.channel === 'Instagram DM'
                            ? 'bg-pink-100 text-pink-700 border border-pink-200'
                            : sale.channel === 'WhatsApp'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {sale.channel || 'Direct'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-800">{qty}</td>
                      <td className="py-3 px-4 text-right text-slate-600">{formatNaira(unitPrice)}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-800">{formatNaira(totalRev)}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600">{formatNaira(netProfit)}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {onEditSale && (
                            <button
                              id={`btn-edit-sale-${sale.id}`}
                              onClick={() => onEditSale(sale)}
                              className="text-slate-400 hover:text-pink-600 p-1.5 rounded-lg hover:bg-pink-50 transition-colors cursor-pointer"
                              title="Edit Sale"
                              aria-label={`Edit sale ${sale.id}`}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            id={`btn-delete-sale-${sale.id}`}
                            onClick={() => setSaleToDelete(sale)}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Sale"
                            aria-label={`Delete sale ${sale.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* In-app Delete Confirmation Modal */}
      {saleToDelete && (
        <ConfirmDeleteModal
          isOpen={true}
          title="Delete Sales Record"
          description="Are you sure you want to permanently remove this transaction from your sales ledger?"
          details={[
            { label: 'Transaction ID', value: saleToDelete.id },
            { label: 'Date', value: saleToDelete.date },
            { label: 'Item', value: getItemName(saleToDelete) },
            { label: 'Quantity', value: `${saleToDelete.qty} unit(s)` },
            { label: 'Customer / Channel', value: `${saleToDelete.customer || 'Direct'} (${saleToDelete.channel})` },
            { label: 'Total Revenue', value: formatNaira(Number(saleToDelete.qty) * Number(saleToDelete.sellingPrice)), highlight: true },
            { label: 'Net Profit', value: formatNaira(getSaleProfit(saleToDelete)) }
          ]}
          confirmText="Delete Sale Record"
          onConfirm={() => {
            const id = saleToDelete.id;
            setSaleToDelete(null);
            onDeleteSale(id);
          }}
          onCancel={() => setSaleToDelete(null)}
        />
      )}
    </div>
  );
};
