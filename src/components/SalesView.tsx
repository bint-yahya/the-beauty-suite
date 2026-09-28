import React, { useState } from 'react';
import { ShoppingBag, Plus, Search, Trash2, Pencil, RotateCcw, FileText, FilterX, AlertCircle, Package, Gift, CheckCircle2, Clock, Truck, ChevronDown, Share2 } from 'lucide-react';
import {
  SaleRecord,
  ProductItem,
  ComboItem,
  PaymentStatus,
  DeliveryStatus,
  SalesChannel,
  DEFAULT_SALES_CHANNELS,
  resolveChannelBadge,
  formatNaira,
  getSaleTotalRevenue,
  getSaleTotalQty,
  getSaleProfit as calculateSaleProfit
} from '../types';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface SalesViewProps {
  sales: SaleRecord[];
  filteredSales: SaleRecord[];
  products: ProductItem[];
  combos: ComboItem[];
  salesChannels?: SalesChannel[];
  onOpenRecordSale: () => void;
  onRepeatLastSale?: () => void;
  onEditSale?: (sale: SaleRecord) => void;
  onUpdateSaleStatus?: (saleId: string, paymentStatus?: PaymentStatus, deliveryStatus?: DeliveryStatus) => void;
  onOpenExportReport?: () => void;
  onOpenManageChannels?: () => void;
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
  salesChannels = DEFAULT_SALES_CHANNELS,
  onOpenRecordSale,
  onRepeatLastSale,
  onEditSale,
  onUpdateSaleStatus,
  onOpenExportReport,
  onOpenManageChannels,
  onDeleteSale,
  onResetFilters,
  getProductCostBreakdown,
  getComboCostBreakdown
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [deliveryFilter, setDeliveryFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [saleToDelete, setSaleToDelete] = useState<SaleRecord | null>(null);

  const channelFilterOptions = React.useMemo(() => {
    const list: string[] = [];
    const seen = new Set<string>();
    (salesChannels || []).forEach(c => {
      if (c.name && !seen.has(c.name)) {
        seen.add(c.name);
        list.push(c.name);
      }
    });
    (sales || []).forEach(s => {
      if (s.channel && s.channel.trim() && !seen.has(s.channel.trim())) {
        seen.add(s.channel.trim());
        list.push(s.channel.trim());
      }
    });
    return list;
  }, [salesChannels, sales]);

  const displaySales = filteredSales.filter(s => {
    const pay = s.paymentStatus || 'Paid';
    const del = s.deliveryStatus || 'Delivered';
    const ch = s.channel || 'Direct / Walk-In';

    if (paymentFilter !== 'all' && pay !== paymentFilter) return false;
    if (deliveryFilter !== 'all' && del !== deliveryFilter) return false;
    if (channelFilter !== 'all' && ch !== channelFilter) return false;

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (s.customer && s.customer.toLowerCase().includes(q)) ||
      (s.channel && s.channel.toLowerCase().includes(q)) ||
      s.id.toLowerCase().includes(q) ||
      pay.toLowerCase().includes(q) ||
      del.toLowerCase().includes(q)
    );
  });

  const getItemSummary = (sale: SaleRecord) => {
    if (sale.type === 'combo') {
      const cmb = combos.find(c => c.id === sale.itemId);
      return cmb ? cmb.name : 'Unknown Bundle';
    }
    if (sale.items && sale.items.length > 0) {
      if (sale.items.length === 1) {
        const prod = products.find(p => p.id === sale.items![0].productId);
        return prod ? prod.name : (sale.items![0].productName || sale.itemNameSnapshot || 'Catalog Product');
      }
      return `${sale.items.length} Products Order`;
    }
    const prod = products.find(p => p.id === sale.itemId);
    return prod ? prod.name : (sale.itemNameSnapshot || 'Catalog Product');
  };

  const getSaleProfit = (sale: SaleRecord) => {
    return calculateSaleProfit(sale, products, combos);
  };

  const getPaymentBadge = (status?: PaymentStatus) => {
    const s = status || 'Paid';
    switch (s) {
      case 'Paid':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70',
          dot: 'bg-emerald-500',
          label: 'Paid'
        };
      case 'Partially Paid':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100/70',
          dot: 'bg-blue-500',
          label: 'Partial'
        };
      case 'Pending':
      default:
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/70',
          dot: 'bg-amber-500',
          label: 'Pending'
        };
    }
  };

  const getDeliveryBadge = (status?: DeliveryStatus) => {
    const s = status || 'Delivered';
    switch (s) {
      case 'Delivered':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70',
          dot: 'bg-emerald-500',
          label: 'Delivered'
        };
      case 'Shipped':
        return {
          bg: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100/70',
          dot: 'bg-sky-500',
          label: 'Shipped'
        };
      case 'Processing':
        return {
          bg: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100/70',
          dot: 'bg-purple-500',
          label: 'Processing'
        };
      case 'Pending':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/70',
          dot: 'bg-amber-500',
          label: 'Pending'
        };
      case 'Cancelled':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/70',
          dot: 'bg-rose-500',
          label: 'Cancelled'
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          label: s
        };
    }
  };

  const isFilterActive = filteredSales.length !== sales.length || paymentFilter !== 'all' || deliveryFilter !== 'all';

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-pink-600" />
            Sales Transactions Log
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time orders log, multi-product carts, order-level packaging, and automated stock deductions.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {onOpenManageChannels && (
            <button
              id="btn-manage-channels"
              type="button"
              onClick={onOpenManageChannels}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-pink-50 border border-slate-200 hover:border-pink-300 text-slate-700 hover:text-pink-600 text-xs sm:text-sm font-semibold rounded-xl shadow-2xs transition-all cursor-pointer"
              title="Add, edit, or delete sales channels"
            >
              <Share2 className="w-4 h-4 text-pink-500" />
              <span>Sales Channels</span>
              {salesChannels && (
                <span className="text-[10px] px-1.5 py-0.2 bg-pink-100 text-pink-700 rounded-md font-bold">
                  {salesChannels.length}
                </span>
              )}
            </button>
          )}
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
        {/* Sleek Search bar and Status Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1">
            <div className="flex items-center bg-slate-100 rounded-full px-4 py-1.5 w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search customer, channel, status, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-xs outline-none w-full text-slate-700 font-medium"
              />
            </div>

            {/* Quick Status Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <select
                  aria-label="Filter sales by payment status"
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl pl-3 pr-7 py-1.5 focus:outline-hidden focus:border-pink-500 cursor-pointer transition-colors shadow-2xs"
                >
                  <option value="all">All Payments</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Payment Pending</option>
                  <option value="Partially Paid">Partially Paid</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  aria-label="Filter sales by delivery status"
                  value={deliveryFilter}
                  onChange={(e) => setDeliveryFilter(e.target.value)}
                  className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl pl-3 pr-7 py-1.5 focus:outline-hidden focus:border-pink-500 cursor-pointer transition-colors shadow-2xs"
                >
                  <option value="all">All Deliveries</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Processing">Processing</option>
                  <option value="Pending">Dispatch Pending</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  aria-label="Filter sales by channel"
                  value={channelFilter}
                  onChange={(e) => setChannelFilter(e.target.value)}
                  className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl pl-3 pr-7 py-1.5 focus:outline-hidden focus:border-pink-500 cursor-pointer transition-colors shadow-2xs"
                >
                  <option value="all">All Channels</option>
                  {channelFilterOptions.map((chName) => (
                    <option key={chName} value={chName}>
                      {chName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2 pointer-events-none" />
              </div>

              {(paymentFilter !== 'all' || deliveryFilter !== 'all' || channelFilter !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setPaymentFilter('all');
                    setDeliveryFilter('all');
                    setChannelFilter('all');
                    setSearchQuery('');
                  }}
                  className="text-[11px] font-semibold text-pink-600 hover:text-pink-800 underline cursor-pointer"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          <span className="text-xs font-semibold text-slate-500 shrink-0">
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
                {isFilterActive ? 'Try adjusting your date/category or status filter above.' : 'Click "Record Sale" to log your first order.'}
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
              const totalQty = getSaleTotalQty(sale);
              const totalRev = getSaleTotalRevenue(sale);
              const netProfit = getSaleProfit(sale);
              const isMultiItem = Boolean(sale.items && sale.items.length > 1);
              const payBadge = getPaymentBadge(sale.paymentStatus);
              const delBadge = getDeliveryBadge(sale.deliveryStatus);

              return (
                <div key={sale.id} className="p-4 space-y-3 hover:bg-pink-50/20 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[10px] text-slate-400">{sale.id}</span>
                        <span className="text-xs text-slate-500 font-mono">{sale.date}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                          sale.type === 'combo'
                            ? 'bg-pink-50 text-pink-700 border border-pink-200'
                            : isMultiItem
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {sale.type === 'combo' ? 'Bundle' : isMultiItem ? 'Multi-Item' : 'Single'}
                        </span>
                      </div>

                      {/* Items Listing */}
                      {sale.items && sale.items.length > 0 ? (
                        <div className="mt-1.5 space-y-1">
                          {sale.items.map((it, idx) => {
                            const p = products.find(prod => prod.id === it.productId);
                            return (
                              <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-800">
                                <span className="font-bold">{p?.name || it.productName || sale.itemNameSnapshot || 'Catalog Product'}</span>
                                <span className="text-pink-600 font-mono font-semibold text-[11px]">×{it.qty}</span>
                                <span className="text-slate-400 text-[10px]">({formatNaira(it.unitPrice)})</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <h4 className="font-bold text-slate-800 text-sm mt-1">{getItemSummary(sale)}</h4>
                      )}

                      {/* Packaging & Gift Tags (Mobile) */}
                      {( (sale.packagingCost !== undefined && sale.packagingCost > 0) || sale.gift ) && (
                        <div className="mt-1.5 space-y-1 pt-1 border-t border-slate-100">
                          {sale.packagingCost !== undefined && sale.packagingCost > 0 && (
                            <div className="text-[10px] text-pink-700 font-medium flex items-center gap-1 bg-pink-50/60 px-2 py-0.5 rounded border border-pink-100/80 w-fit">
                              <Package className="w-3 h-3 text-pink-500" />
                              <span>Packaging: {formatNaira(sale.packagingCost)}</span>
                            </div>
                          )}
                          {sale.gift && (
                            <div className="text-[10px] text-purple-700 font-medium flex items-center gap-1 bg-purple-50/70 px-2 py-0.5 rounded border border-purple-100 w-fit">
                              <Gift className="w-3 h-3 text-purple-500 shrink-0" />
                              <span>
                                Gift: {sale.gift.isProduct
                                  ? `${products.find(p => p.id === sale.gift?.productId)?.name || sale.gift.productName || 'Gift Item'} ×${sale.gift.qty || 1}`
                                  : (sale.gift.customDescription || sale.gift.description || 'Custom Gift')}
                                {' '}(Cost: {formatNaira(sale.gift.cost)})
                              </span>
                            </div>
                          )}
                        </div>
                      )}
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

                  {/* Payment & Delivery Quick Statuses on Mobile */}
                  <div className="flex items-center gap-3 pt-1 border-t border-slate-100 flex-wrap">
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="text-slate-400 font-medium">Payment:</span>
                      <div className="relative">
                        <select
                          aria-label={`Payment status for mobile sale ${sale.id}`}
                          value={sale.paymentStatus || 'Paid'}
                          onChange={(e) => onUpdateSaleStatus && onUpdateSaleStatus(sale.id, e.target.value as PaymentStatus, undefined)}
                          className={`appearance-none text-[10px] font-bold pl-2 pr-5 py-0.5 rounded-full border cursor-pointer transition-colors ${payBadge.bg}`}
                        >
                          <option value="Paid">Paid</option>
                          <option value="Pending">Pending</option>
                          <option value="Partially Paid">Partial</option>
                        </select>
                        <ChevronDown className="w-3 h-3 opacity-60 absolute right-1 top-1 pointer-events-none" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="text-slate-400 font-medium">Delivery:</span>
                      <div className="relative">
                        <select
                          aria-label={`Delivery status for mobile sale ${sale.id}`}
                          value={sale.deliveryStatus || 'Delivered'}
                          onChange={(e) => onUpdateSaleStatus && onUpdateSaleStatus(sale.id, undefined, e.target.value as DeliveryStatus)}
                          className={`appearance-none text-[10px] font-bold pl-2 pr-5 py-0.5 rounded-full border cursor-pointer transition-colors ${delBadge.bg}`}
                        >
                          <option value="Delivered">Delivered</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Processing">Processing</option>
                          <option value="Pending">Pending</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <ChevronDown className="w-3 h-3 opacity-60 absolute right-1 top-1 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600 font-medium">{sale.customer || 'Direct Customer'}</span>
                      {(() => {
                        const badge = resolveChannelBadge(sale.channel, salesChannels);
                        return (
                          <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-medium border ${badge.bg} ${badge.text} ${badge.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            <span>{sale.channel || 'Direct'}</span>
                          </span>
                        );
                      })()}
                    </div>
                    <span className="font-semibold text-slate-700">{totalQty} total unit(s)</span>
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
                <th className="py-3 px-3.5">Date</th>
                <th className="py-3 px-3.5">Item(s) Sold</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3.5">Customer / Channel</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Delivery</th>
                <th className="py-3 px-3 text-right">Qty</th>
                <th className="py-3 px-3 text-right">Unit Price</th>
                <th className="py-3 px-3 text-right font-bold">Total Revenue</th>
                <th className="py-3 px-3 text-right font-bold text-emerald-600">Net Profit</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displaySales.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-10 text-slate-400">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-30 text-pink-500" />
                    <p className="font-semibold text-slate-600">No sales transactions found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isFilterActive ? 'Try adjusting your date/category or status filter above.' : 'Click "Record Sale" to log your first order.'}
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
                  const totalQty = getSaleTotalQty(sale);
                  const totalRev = getSaleTotalRevenue(sale);
                  const netProfit = getSaleProfit(sale);
                  const isMultiItem = Boolean(sale.items && sale.items.length > 1);
                  const payBadge = getPaymentBadge(sale.paymentStatus);
                  const delBadge = getDeliveryBadge(sale.deliveryStatus);

                  return (
                    <tr key={sale.id} className="hover:bg-pink-50/20 transition-colors">
                      <td className="py-3 px-3.5 font-mono font-medium text-slate-600">{sale.date}</td>
                      <td className="py-3 px-3.5">
                        <div className="space-y-1 max-w-xs">
                          {sale.type === 'combo' ? (
                            <div>
                              <span className="font-semibold text-slate-800">{getItemSummary(sale)}</span>
                            </div>
                          ) : sale.items && sale.items.length > 0 ? (
                            <div className="space-y-1">
                              {sale.items.map((it, idx) => {
                                const p = products.find(prod => prod.id === it.productId);
                                return (
                                  <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-800">
                                    <span className="font-semibold">{p?.name || it.productName || sale.itemNameSnapshot || 'Catalog Product'}</span>
                                    <span className="text-pink-600 font-mono font-bold text-[11px]">×{it.qty}</span>
                                    {sale.items!.length > 1 && (
                                      <span className="text-slate-400 text-[10px]">({formatNaira(it.unitPrice)})</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div>
                              <span className="font-semibold text-slate-800">{getItemSummary(sale)}</span>
                            </div>
                          )}

                          {/* Desktop Packaging & Gift tags */}
                          {sale.packagingCost !== undefined && sale.packagingCost > 0 && (
                            <div className="text-[10px] text-pink-700 font-medium flex items-center gap-1 bg-pink-50/70 px-1.5 py-0.5 rounded border border-pink-100 w-fit">
                              <Package className="w-3 h-3 text-pink-500" />
                              <span>Packaging: {formatNaira(sale.packagingCost)}</span>
                            </div>
                          )}
                          {sale.gift && (
                            <div className="text-[10px] text-purple-700 font-medium flex items-center gap-1 bg-purple-50/70 px-1.5 py-0.5 rounded border border-purple-100 w-fit">
                              <Gift className="w-3 h-3 text-purple-500 shrink-0" />
                              <span>
                                Gift: {sale.gift.isProduct
                                  ? `${products.find(p => p.id === sale.gift?.productId)?.name || sale.gift.productName || 'Gift Item'} ×${sale.gift.qty || 1}`
                                  : (sale.gift.customDescription || sale.gift.description || 'Custom Gift')}
                                {' '}({formatNaira(sale.gift.cost)})
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          sale.type === 'combo'
                            ? 'bg-pink-50 text-pink-700 border border-pink-200'
                            : isMultiItem
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {sale.type === 'combo' ? 'Bundle' : isMultiItem ? 'Multi' : 'Single'}
                        </span>
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="font-medium text-slate-800">{sale.customer || 'Direct Customer'}</div>
                        {(() => {
                          const badge = resolveChannelBadge(sale.channel, salesChannels);
                          return (
                            <span className={`inline-flex items-center gap-1 mt-0.5 text-[10px] px-2 py-0.2 rounded font-medium border ${badge.bg} ${badge.text} ${badge.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                              <span>{sale.channel || 'Direct'}</span>
                            </span>
                          );
                        })()}
                      </td>

                      {/* Payment Status Dropdown Cell */}
                      <td className="py-3 px-3">
                        <div className="relative inline-block">
                          <select
                            aria-label={`Payment status for sale ${sale.id}`}
                            value={sale.paymentStatus || 'Paid'}
                            onChange={(e) => onUpdateSaleStatus && onUpdateSaleStatus(sale.id, e.target.value as PaymentStatus, undefined)}
                            className={`appearance-none text-[11px] font-bold pl-2.5 pr-6 py-1 rounded-full border cursor-pointer focus:outline-hidden transition-colors ${payBadge.bg}`}
                          >
                            <option value="Paid">Paid</option>
                            <option value="Pending">Pending</option>
                            <option value="Partially Paid">Partial</option>
                          </select>
                          <ChevronDown className="w-3 h-3 opacity-60 absolute right-1.5 top-2 pointer-events-none" />
                        </div>
                      </td>

                      {/* Delivery Status Dropdown Cell */}
                      <td className="py-3 px-3">
                        <div className="relative inline-block">
                          <select
                            aria-label={`Delivery status for sale ${sale.id}`}
                            value={sale.deliveryStatus || 'Delivered'}
                            onChange={(e) => onUpdateSaleStatus && onUpdateSaleStatus(sale.id, undefined, e.target.value as DeliveryStatus)}
                            className={`appearance-none text-[11px] font-bold pl-2.5 pr-6 py-1 rounded-full border cursor-pointer focus:outline-hidden transition-colors ${delBadge.bg}`}
                          >
                            <option value="Delivered">Delivered</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Processing">Processing</option>
                            <option value="Pending">Pending</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <ChevronDown className="w-3 h-3 opacity-60 absolute right-1.5 top-2 pointer-events-none" />
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-slate-800">{totalQty}</td>
                      <td className="py-3 px-3 text-right text-slate-600">
                        {isMultiItem ? (
                          <span title="Weighted average selling price">Avg. {formatNaira(sale.sellingPrice)}</span>
                        ) : (
                          formatNaira(sale.sellingPrice)
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-800">{formatNaira(totalRev)}</td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-600">{formatNaira(netProfit)}</td>
                      <td className="py-3 px-3 text-center">
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
            { label: 'Item(s)', value: getItemSummary(saleToDelete) },
            { label: 'Quantity', value: `${getSaleTotalQty(saleToDelete)} unit(s)` },
            { label: 'Customer / Channel', value: `${saleToDelete.customer || 'Direct'} (${saleToDelete.channel})` },
            { label: 'Total Revenue', value: formatNaira(getSaleTotalRevenue(saleToDelete)), highlight: true },
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
