import React from 'react';
import { X, ShoppingBag, Truck, Tag, Sparkles, Trash2, Plus, Package, Box, Gift, RefreshCw, Settings2 } from 'lucide-react';
import { ProductItem, ComboItem, InventoryStockItem, SalesChannel, DEFAULT_SALES_CHANNELS, formatNaira, generateUniqueSKU } from '../types';

interface ModalsProps {
  showAddSaleModal: boolean;
  setShowAddSaleModal: (val: boolean) => void;
  newSale: any;
  setNewSale: (val: any) => void;
  editingSaleId?: string | null;
  onCloseSaleModal?: () => void;
  handleSaveSale: (e: React.FormEvent) => void;
  salesChannels?: SalesChannel[];
  onOpenManageChannels?: () => void;

  showAddBatchModal: boolean;
  setShowAddBatchModal: (val: boolean) => void;
  newBatch: any;
  setNewBatch: (val: any) => void;
  editingBatchId?: string | null;
  onCloseBatchModal?: () => void;
  handleSaveBatch: (e: React.FormEvent) => void;

  showAddProductModal: boolean;
  setShowAddProductModal: (val: boolean) => void;
  newProd: any;
  setNewProd: (val: any) => void;
  editingProductId?: string | null;
  onCloseProductModal?: () => void;
  handleSaveProduct: (e: React.FormEvent) => void;

  showAddComboModal: boolean;
  setShowAddComboModal: (val: boolean) => void;
  newCombo: any;
  setNewCombo: (val: any) => void;
  handleSaveCombo: (e: React.FormEvent) => void;

  products: ProductItem[];
  combos: ComboItem[];
  inventoryStock?: Record<string, InventoryStockItem>;
  getComboCostBreakdown: (c: ComboItem) => any;
  getProductCostBreakdown?: (p: ProductItem) => any;
}

export const Modals: React.FC<ModalsProps> = ({
  showAddSaleModal,
  setShowAddSaleModal,
  newSale,
  setNewSale,
  editingSaleId,
  onCloseSaleModal,
  handleSaveSale,
  salesChannels = DEFAULT_SALES_CHANNELS,
  onOpenManageChannels,

  showAddBatchModal,
  setShowAddBatchModal,
  newBatch,
  setNewBatch,
  editingBatchId,
  onCloseBatchModal,
  handleSaveBatch,

  showAddProductModal,
  setShowAddProductModal,
  newProd,
  setNewProd,
  editingProductId,
  onCloseProductModal,
  handleSaveProduct,

  showAddComboModal,
  setShowAddComboModal,
  newCombo,
  setNewCombo,
  handleSaveCombo,

  products,
  combos,
  inventoryStock,
  getComboCostBreakdown
}) => {
  return (
    <>
      {/* MODAL 1: RECORD OR EDIT SALE */}
      {showAddSaleModal && (() => {
        // Safe access to items list
        const saleItems = (newSale.items && newSale.items.length > 0) ? newSale.items : [
          {
            productId: newSale.itemId || products[0]?.id || '',
            qty: Number(newSale.qty) || 1,
            unitPrice: Number(newSale.sellingPrice) >= 0 ? Number(newSale.sellingPrice) : (products[0]?.sellingPrice || 3500)
          }
        ];

        const handleAddProductLine = () => {
          const existingIds = new Set(saleItems.map((i: any) => i.productId));
          const nextProd = products.find(p => !existingIds.has(p.id)) || products[0];
          const newItem = {
            productId: nextProd?.id || '',
            qty: 1,
            unitPrice: nextProd?.sellingPrice || 3500
          };
          const updatedItems = [...saleItems, newItem];
          setNewSale({
            ...newSale,
            items: updatedItems,
            itemId: updatedItems[0]?.productId || '',
            qty: updatedItems.reduce((acc: number, it: any) => acc + (Number(it.qty) || 0), 0),
            sellingPrice: updatedItems[0]?.unitPrice || 0
          });
        };

        const handleUpdateProductLine = (idx: number, field: string, val: any) => {
          const updatedItems = saleItems.map((it: any, i: number) => {
            if (i !== idx) return it;
            const updated = { ...it };
            if (field === 'productId') {
              updated.productId = val;
              const p = products.find(prod => prod.id === val);
              if (p) {
                updated.unitPrice = p.sellingPrice;
              }
            } else if (field === 'qty') {
              updated.qty = Math.max(1, Number(val) || 1);
            } else if (field === 'unitPrice') {
              updated.unitPrice = Math.max(0, Number(val) || 0);
            }
            return updated;
          });

          setNewSale({
            ...newSale,
            items: updatedItems,
            itemId: updatedItems[0]?.productId || '',
            qty: updatedItems.reduce((acc: number, it: any) => acc + (Number(it.qty) || 0), 0),
            sellingPrice: updatedItems[0]?.unitPrice || 0
          });
        };

        const handleRemoveProductLine = (idx: number) => {
          if (saleItems.length <= 1) return;
          const updatedItems = saleItems.filter((_: any, i: number) => i !== idx);
          setNewSale({
            ...newSale,
            items: updatedItems,
            itemId: updatedItems[0]?.productId || '',
            qty: updatedItems.reduce((acc: number, it: any) => acc + (Number(it.qty) || 0), 0),
            sellingPrice: updatedItems[0]?.unitPrice || 0
          });
        };

        // Real-time calculation of transaction totals
        let saleTotalRevenue = 0;
        let saleTotalUnits = 0;
        let saleTotalCost = 0;
        const currentSalePackaging = Number(newSale.packagingCost) >= 0 ? Number(newSale.packagingCost) : 0;
        const currentGiftCost = newSale.hasGift && newSale.gift ? Math.max(0, Number(newSale.gift.cost) || 0) : 0;

        if (newSale.type === 'combo') {
          const cmbId = newSale.comboId || newSale.itemId || combos[0]?.id;
          const cmb = combos.find(c => c.id === cmbId);
          const qty = Math.max(1, Number(newSale.comboQty || newSale.qty) || 1);
          const price = Number(newSale.comboSellingPrice !== undefined ? newSale.comboSellingPrice : newSale.sellingPrice) || 0;
          saleTotalRevenue = qty * price;
          saleTotalUnits = qty;
          if (cmb) {
            const breakdown = getComboCostBreakdown(cmb);
            saleTotalCost = (breakdown.totalCost * qty) + currentSalePackaging + currentGiftCost;
          } else {
            saleTotalCost = currentSalePackaging + currentGiftCost;
          }
        } else {
          let itemsBaseCost = 0;
          saleItems.forEach((it: any) => {
            const q = Number(it.qty) || 0;
            const p = Number(it.unitPrice) || 0;
            saleTotalRevenue += q * p;
            saleTotalUnits += q;
            const prod = products.find(pr => pr.id === it.productId);
            if (prod) {
              const unitBase = Number(prod.unitLandedCost) || 0;
              itemsBaseCost += unitBase * q;
            }
          });
          saleTotalCost = itemsBaseCost + currentSalePackaging + currentGiftCost;
        }

        const saleNetProfit = saleTotalRevenue - saleTotalCost;
        const saleMarginPercent = saleTotalRevenue > 0 ? (saleNetProfit / saleTotalRevenue) * 100 : 0;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-pink-600" />
                    {editingSaleId ? `Edit Sale Record (${editingSaleId})` : 'Record Sale — the beauty suite'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {editingSaleId
                      ? 'Update items, quantities, packaging, or customer details'
                      : 'Log a customer purchase with single or multiple products and custom packaging'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (onCloseSaleModal) onCloseSaleModal();
                    else setShowAddSaleModal(false);
                  }}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveSale} className="space-y-4 text-xs">
                {/* Date & Sale Type Selector */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Sale Date</label>
                    <input
                      type="date"
                      required
                      value={newSale.date}
                      onChange={(e) => setNewSale({ ...newSale, date: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium focus:bg-white focus:border-pink-500 outline-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Sale Type</label>
                    <select
                      value={newSale.type}
                      onChange={(e) => {
                        const typeVal = e.target.value as 'single' | 'combo';
                        setNewSale({
                          ...newSale,
                          type: typeVal
                        });
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium focus:bg-white focus:border-pink-500 outline-none cursor-pointer"
                    >
                      <option value="single">Single / Multi-Product Order</option>
                      <option value="combo">Predefined Bundle Combo</option>
                    </select>
                  </div>
                </div>

                {/* Customer Details & Sales Channel */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Customer Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Amina Bello"
                      value={newSale.customer}
                      onChange={(e) => setNewSale({ ...newSale, customer: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 focus:bg-white focus:border-pink-500 outline-none"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-600 block">Sales Channel</label>
                      {onOpenManageChannels && (
                        <button
                          type="button"
                          onClick={onOpenManageChannels}
                          className="text-[11px] text-pink-600 hover:text-pink-700 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                          title="Add, edit, or delete sales channels"
                        >
                          <Settings2 className="w-3 h-3" />
                          <span>Manage</span>
                        </button>
                      )}
                    </div>
                    <select
                      value={newSale.channel}
                      onChange={(e) => {
                        if (e.target.value === '__manage_channels__') {
                          onOpenManageChannels?.();
                        } else {
                          setNewSale({ ...newSale, channel: e.target.value });
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium focus:bg-white focus:border-pink-500 outline-none cursor-pointer"
                    >
                      {salesChannels.map((ch) => (
                        <option key={ch.id} value={ch.name}>
                          {ch.name}
                        </option>
                      ))}
                      {/* If existing sale has a custom or deleted channel, preserve selection */}
                      {newSale.channel &&
                        !salesChannels.some((c) => c.name === newSale.channel) &&
                        newSale.channel !== '__manage_channels__' && (
                          <option value={newSale.channel}>{newSale.channel} (Custom)</option>
                        )}
                      <option value="__manage_channels__" className="font-bold text-pink-600 bg-pink-50">
                        + Add / Manage Sales Channels...
                      </option>
                    </select>
                  </div>
                </div>

                {/* Payment Status & Delivery Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1 flex items-center justify-between">
                      <span>Payment Status</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                        (newSale.paymentStatus || 'Paid') === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : (newSale.paymentStatus || 'Paid') === 'Partially Paid'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {newSale.paymentStatus || 'Paid'}
                      </span>
                    </label>
                    <select
                      value={newSale.paymentStatus || 'Paid'}
                      onChange={(e) => setNewSale({ ...newSale, paymentStatus: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium focus:bg-white focus:border-pink-500 outline-none cursor-pointer text-xs"
                    >
                      <option value="Paid">Paid (Full Payment)</option>
                      <option value="Pending">Pending (Payment Due)</option>
                      <option value="Partially Paid">Partially Paid (Deposit)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1 flex items-center justify-between">
                      <span>Delivery Status</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                        (newSale.deliveryStatus || 'Delivered') === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : (newSale.deliveryStatus || 'Delivered') === 'Shipped'
                          ? 'bg-sky-100 text-sky-800'
                          : (newSale.deliveryStatus || 'Delivered') === 'Processing'
                          ? 'bg-purple-100 text-purple-800'
                          : (newSale.deliveryStatus || 'Delivered') === 'Cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {newSale.deliveryStatus || 'Delivered'}
                      </span>
                    </label>
                    <select
                      value={newSale.deliveryStatus || 'Delivered'}
                      onChange={(e) => setNewSale({ ...newSale, deliveryStatus: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium focus:bg-white focus:border-pink-500 outline-none cursor-pointer text-xs"
                    >
                      <option value="Delivered">Delivered</option>
                      <option value="Shipped">Shipped (In Transit)</option>
                      <option value="Processing">Processing</option>
                      <option value="Pending">Pending Dispatch</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* SECTION A: SINGLE OR MULTI-PRODUCT ORDER */}
                {newSale.type === 'single' ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-pink-600" />
                        <span className="font-bold text-slate-700 text-xs">Products in this Sale</span>
                        <span className="bg-pink-100 text-pink-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                          {saleItems.length} SKU{saleItems.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">Total: {saleTotalUnits} unit(s)</span>
                    </div>

                    {/* Dynamic Product Rows */}
                    <div className="space-y-2.5 max-h-[36vh] overflow-y-auto pr-1">
                      {saleItems.map((item: any, idx: number) => {
                        const prod = products.find(p => p.id === item.productId);
                        const rowTotal = (Number(item.qty) || 0) * (Number(item.unitPrice) || 0);

                        return (
                          <div
                            key={idx}
                            className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-2.5 space-y-2 relative hover:border-pink-300 transition-colors"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-bold uppercase text-slate-400">
                                Product #{idx + 1}
                              </span>
                              {saleItems.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveProductLine(idx)}
                                  className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Remove item"
                                  aria-label={`Remove item ${idx + 1}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            {/* Product Selector */}
                            <div>
                              <select
                                value={item.productId}
                                onChange={(e) => handleUpdateProductLine(idx, 'productId', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-medium text-slate-800 focus:border-pink-500 outline-none cursor-pointer text-xs"
                              >
                                {products
                                  .filter(p => !p.isArchived || p.id === item.productId)
                                  .map(p => (
                                    <option key={p.id} value={p.id}>
                                      {p.name} [{p.category}]{p.isArchived ? ' (Archived)' : ''} — {formatNaira(p.sellingPrice)}
                                    </option>
                                  ))}
                              </select>
                            </div>

                            {/* Quantity, Unit Price & Line Total */}
                            <div className="grid grid-cols-3 gap-2 items-center">
                              <div>
                                <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Quantity</label>
                                <input
                                  type="number"
                                  min="1"
                                  required
                                  value={item.qty}
                                  onChange={(e) => handleUpdateProductLine(idx, 'qty', e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-800 text-xs focus:border-pink-500 outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Unit Price (₦)</label>
                                <input
                                  type="number"
                                  min="0"
                                  required
                                  value={item.unitPrice}
                                  onChange={(e) => handleUpdateProductLine(idx, 'unitPrice', e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 font-bold text-pink-600 text-xs focus:border-pink-500 outline-none"
                                />
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-slate-400 block mb-0.5">Subtotal</span>
                                <span className="font-bold text-slate-700 text-xs block">{formatNaira(rowTotal)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Button to Add More Products to this Sale */}
                    <button
                      type="button"
                      onClick={handleAddProductLine}
                      className="w-full py-2 border border-dashed border-pink-300 hover:border-pink-500 bg-pink-50/40 hover:bg-pink-50 text-pink-700 font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Another Product to this Sale</span>
                    </button>
                  </div>
                ) : (
                  /* SECTION B: PREDEFINED COMBO BUNDLE ORDER */
                  <div className="space-y-3">
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1">Select Bundle Combo</label>
                      <select
                        value={newSale.comboId || newSale.itemId || combos[0]?.id || ''}
                        onChange={(e) => {
                          const cmbId = e.target.value;
                          const cmb = combos.find(c => c.id === cmbId);
                          const price = cmb ? getComboCostBreakdown(cmb).finalSellingPrice : 5400;
                          setNewSale({
                            ...newSale,
                            comboId: cmbId,
                            itemId: cmbId,
                            comboSellingPrice: price,
                            sellingPrice: price
                          });
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium focus:bg-white focus:border-pink-500 outline-none cursor-pointer"
                      >
                        {combos.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({formatNaira(getComboCostBreakdown(c).finalSellingPrice)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-600 block mb-1">Bundle Quantity</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={newSale.comboQty !== undefined ? newSale.comboQty : (newSale.qty || 1)}
                          onChange={(e) => {
                            const q = Number(e.target.value);
                            setNewSale({ ...newSale, comboQty: q, qty: q });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-800 focus:bg-white focus:border-pink-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-600 block mb-1">Selling Price per Bundle (₦)</label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={newSale.comboSellingPrice !== undefined ? newSale.comboSellingPrice : (newSale.sellingPrice || 0)}
                          onChange={(e) => {
                            const p = Number(e.target.value);
                            setNewSale({ ...newSale, comboSellingPrice: p, sellingPrice: p });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-pink-600 focus:bg-white focus:border-pink-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 1. ORDER PACKAGING (Unified single box for any sale, editable cost) */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                      <Box className="w-4 h-4 text-pink-600" />
                      <span>Order Packaging Cost (₦)</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Shipping box, pouch, or wrapping</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₦</span>
                    <input
                      type="number"
                      min="0"
                      value={newSale.packagingCost !== undefined ? newSale.packagingCost : ''}
                      onChange={(e) => setNewSale({ ...newSale, packagingCost: Math.max(0, Number(e.target.value) || 0) })}
                      className="w-full pl-6 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:border-pink-500 outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* 2. OPTIONAL GIFTS / FREEBIES */}
                <div className="bg-pink-50/40 border border-pink-200/80 rounded-xl p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                      <Gift className="w-4 h-4 text-pink-600" />
                      <span>Gift / Promotional Freebie</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={Boolean(newSale.hasGift)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          if (!checked) {
                            setNewSale({
                              ...newSale,
                              hasGift: false,
                              gift: undefined
                            });
                          } else {
                            const defaultProd = products[0];
                            const defaultCost = defaultProd ? Number(defaultProd.unitLandedCost) || 0 : 0;
                            setNewSale({
                              ...newSale,
                              hasGift: true,
                              gift: {
                                hasGift: true,
                                isProduct: true,
                                productId: defaultProd?.id || '',
                                productName: defaultProd?.name || '',
                                qty: 1,
                                cost: defaultCost,
                                description: ''
                              }
                            });
                          }
                        }}
                        className="rounded text-pink-600 focus:ring-pink-500 h-3.5 w-3.5 cursor-pointer"
                      />
                      <span className="text-[11px] font-semibold text-pink-700">Include Gift with this Sale</span>
                    </label>
                  </div>

                  {newSale.hasGift && newSale.gift && (
                    <div className="space-y-2.5 pt-1 border-t border-pink-200/60 animate-in fade-in duration-150">
                      {/* Gift Type Choice: Product from Master vs Custom Gift */}
                      <div className="flex items-center gap-4 text-xs font-medium text-slate-700">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="giftType"
                            checked={Boolean(newSale.gift.isProduct)}
                            onChange={() => {
                              const currentProd = products.find(p => p.id === newSale.gift?.productId) || products[0];
                              const qty = Math.max(1, Number(newSale.gift?.qty) || 1);
                              const cost = (currentProd?.unitLandedCost || 0) * qty;
                              setNewSale({
                                ...newSale,
                                gift: {
                                  ...newSale.gift,
                                  isProduct: true,
                                  productId: currentProd?.id || '',
                                  productName: currentProd?.name || '',
                                  qty,
                                  cost
                                }
                              });
                            }}
                            className="text-pink-600 focus:ring-pink-500 cursor-pointer"
                          />
                          <span>Product from Product Master (reduces inventory)</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="giftType"
                            checked={!newSale.gift.isProduct}
                            onChange={() => {
                              setNewSale({
                                ...newSale,
                                gift: {
                                  ...newSale.gift,
                                  isProduct: false,
                                  productId: undefined,
                                  description: newSale.gift?.description || 'Satin Hair Scrunchie',
                                  cost: newSale.gift?.cost || 150
                                }
                              });
                            }}
                            className="text-pink-600 focus:ring-pink-500 cursor-pointer"
                          />
                          <span>Custom / External Item (cost only)</span>
                        </label>
                      </div>

                      {/* If Product from Master */}
                      {newSale.gift.isProduct ? (
                        <div className="space-y-2 bg-white/80 p-2.5 rounded-lg border border-pink-100">
                          <div>
                            <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                              Select Catalog Product for Gift
                            </label>
                            <select
                              value={newSale.gift.productId || products[0]?.id || ''}
                              onChange={(e) => {
                                const selId = e.target.value;
                                const p = products.find(prod => prod.id === selId);
                                const qty = Math.max(1, Number(newSale.gift?.qty) || 1);
                                const autoCost = (Number(p?.unitLandedCost) || 0) * qty;
                                setNewSale({
                                  ...newSale,
                                  gift: {
                                    ...newSale.gift,
                                    productId: selId,
                                    productName: p?.name || '',
                                    cost: autoCost
                                  }
                                });
                              }}
                              className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-medium text-slate-800 text-xs focus:border-pink-500 outline-none cursor-pointer"
                            >
                              {products
                                .filter(p => !p.isArchived || p.id === newSale.gift?.productId)
                                .map(p => {
                                  const stockInfo = inventoryStock ? inventoryStock[p.id]?.currentStock : undefined;
                                  return (
                                    <option key={p.id} value={p.id}>
                                      {p.name} [{p.code}]{p.isArchived ? ' (Archived)' : ''} {stockInfo !== undefined ? `— ${stockInfo} in stock` : ''} (Landed: {formatNaira(p.unitLandedCost)})
                                    </option>
                                  );
                                })}
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Gift Quantity</label>
                              <input
                                type="number"
                                min="1"
                                required
                                value={newSale.gift.qty || 1}
                                onChange={(e) => {
                                  const q = Math.max(1, Number(e.target.value) || 1);
                                  const p = products.find(prod => prod.id === newSale.gift?.productId);
                                  const autoCost = (Number(p?.unitLandedCost) || 0) * q;
                                  setNewSale({
                                    ...newSale,
                                    gift: {
                                      ...newSale.gift,
                                      qty: q,
                                      cost: autoCost
                                    }
                                  });
                                }}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-800 text-xs focus:border-pink-500 outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Gift Cost (₦)</label>
                              <input
                                type="number"
                                min="0"
                                required
                                value={newSale.gift.cost !== undefined ? newSale.gift.cost : ''}
                                onChange={(e) => {
                                  setNewSale({
                                    ...newSale,
                                    gift: {
                                      ...newSale.gift,
                                      cost: Math.max(0, Number(e.target.value) || 0)
                                    }
                                  });
                                }}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 font-bold text-pink-600 text-xs focus:border-pink-500 outline-none"
                              />
                            </div>
                          </div>
                          <p className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 flex items-center gap-1">
                            <Package className="w-3 h-3 shrink-0" />
                            <span>
                              Reflected in inventory: pulls <strong>{newSale.gift.qty || 1} unit(s)</strong> of this product from stock and adds <strong>{formatNaira(newSale.gift.cost || 0)}</strong> to order expenses.
                            </span>
                          </p>
                        </div>
                      ) : (
                        /* Custom Gift Option */
                        <div className="space-y-2 bg-white/80 p-2.5 rounded-lg border border-pink-100">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Gift Description</label>
                              <input
                                type="text"
                                placeholder="e.g. Satin Scrunchie / Sample Vial"
                                value={newSale.gift.description || ''}
                                onChange={(e) => {
                                  setNewSale({
                                    ...newSale,
                                    gift: {
                                      ...newSale.gift,
                                      description: e.target.value
                                    }
                                  });
                                }}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 font-medium text-slate-800 text-xs focus:border-pink-500 outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Gift Cost (₦)</label>
                              <input
                                type="number"
                                min="0"
                                required
                                value={newSale.gift.cost !== undefined ? newSale.gift.cost : ''}
                                onChange={(e) => {
                                  setNewSale({
                                    ...newSale,
                                    gift: {
                                      ...newSale.gift,
                                      cost: Math.max(0, Number(e.target.value) || 0)
                                    }
                                  });
                                }}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 font-bold text-pink-600 text-xs focus:border-pink-500 outline-none"
                                placeholder="150"
                              />
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-500">
                            Promotional non-inventory gift item (adds to order cost, does not reduce product inventory).
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* TRANSACTION FINANCIAL BREAKDOWN & PROFIT ESTIMATE */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Items Ordered:</span>
                    <span className="font-semibold text-slate-700">
                      {saleTotalUnits} unit(s) {newSale.type === 'single' ? `(${saleItems.length} product${saleItems.length > 1 ? 's' : ''})` : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Order Packaging:</span>
                    <span className="font-semibold text-amber-700">{formatNaira(currentSalePackaging)}</span>
                  </div>
                  {newSale.hasGift && newSale.gift && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        Gift ({newSale.gift.isProduct ? (newSale.gift.productName || 'Catalog Product') : (newSale.gift.description || 'Custom')}{newSale.gift.isProduct && newSale.gift.qty ? ` ×${newSale.gift.qty}` : ''}):
                      </span>
                      <span className="font-semibold text-pink-600">{formatNaira(currentGiftCost)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs border-t border-slate-200/60 pt-1.5">
                    <span className="font-bold text-slate-700">Total Transaction:</span>
                    <span className="text-sm font-bold text-pink-600">{formatNaira(saleTotalRevenue)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Estimated Net Profit:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-emerald-600">{formatNaira(saleNetProfit)}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${saleMarginPercent >= 30 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {saleMarginPercent.toFixed(1)}% margin
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (onCloseSaleModal) onCloseSaleModal();
                      else setShowAddSaleModal(false);
                    }}
                    className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-save-sale-submit"
                    type="submit"
                    className="w-1/2 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold shadow-md shadow-pink-300 transition-all cursor-pointer active:scale-95"
                  >
                    {editingSaleId ? 'Update Sale Record' : 'Confirm Sale'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* MODAL 2: ADD OR EDIT STOCK IN BATCH */}
      {showAddBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-pink-600" />
                  {editingBatchId ? `Edit Batch Order (${editingBatchId})` : 'Log Batch Inventory Order'}
                </h3>
                <p className="text-xs text-slate-400">
                  {editingBatchId ? 'Update supplier details, delivery fee, and product line items' : 'Delivery fee will be allocated evenly across all batch units'}
                </p>
              </div>
              <button
                onClick={() => {
                  if (onCloseBatchModal) onCloseBatchModal();
                  else setShowAddBatchModal(false);
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBatch} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Batch Order Date</label>
                  <input
                    type="date"
                    required
                    value={newBatch.date}
                    onChange={(e) => setNewBatch({ ...newBatch, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium focus:bg-white focus:border-pink-500 outline-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Supplier / Factory</label>
                  <input
                    type="text"
                    placeholder="e.g. Lagos Lab Supplier"
                    value={newBatch.supplier}
                    onChange={(e) => setNewBatch({ ...newBatch, supplier: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium focus:bg-white focus:border-pink-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Batch Total Delivery Fee (₦)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newBatch.totalDeliveryFee}
                  onChange={(e) => setNewBatch({ ...newBatch, totalDeliveryFee: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-pink-600 focus:bg-white focus:border-pink-500 outline-none"
                />
              </div>

              {/* Dynamic Batch Items list */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 uppercase text-[11px] tracking-wider">Batch Product Line Items</span>
                  <button
                    type="button"
                    onClick={() => {
                      setNewBatch({
                        ...newBatch,
                        items: [...newBatch.items, { productId: products[0]?.id || '', qty: 12, batchPurchasePrice: 12000 }]
                      });
                    }}
                    className="text-xs font-semibold text-pink-600 hover:text-pink-700 cursor-pointer"
                  >
                    + Add Product Line
                  </button>
                </div>

                {newBatch.items.map((it: any, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                    <select
                      value={it.productId}
                      onChange={(e) => {
                        const items = [...newBatch.items];
                        items[idx].productId = e.target.value;
                        setNewBatch({ ...newBatch, items });
                      }}
                      className="w-1/2 bg-white border border-slate-200 rounded-lg p-1.5 cursor-pointer outline-none text-slate-800"
                    >
                      {products
                        .filter(p => !p.isArchived || p.id === it.productId)
                        .map(p => (
                          <option key={p.id} value={p.id}>{p.name}{p.isArchived ? ' (Archived)' : ''}</option>
                        ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={it.qty}
                      onChange={(e) => {
                        const items = [...newBatch.items];
                        items[idx].qty = Number(e.target.value);
                        setNewBatch({ ...newBatch, items });
                      }}
                      className="w-1/4 bg-white border border-slate-200 rounded-lg p-1.5 font-bold text-slate-800 outline-none"
                    />

                    <input
                      type="number"
                      min="0"
                      placeholder="Total ₦"
                      value={it.batchPurchasePrice}
                      onChange={(e) => {
                        const items = [...newBatch.items];
                        items[idx].batchPurchasePrice = Number(e.target.value);
                        setNewBatch({ ...newBatch, items });
                      }}
                      className="w-1/4 bg-white border border-slate-200 rounded-lg p-1.5 font-bold text-pink-600 outline-none"
                    />

                    {newBatch.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setNewBatch({
                            ...newBatch,
                            items: newBatch.items.filter((_: any, i: number) => i !== idx)
                          });
                        }}
                        className="text-slate-400 hover:text-pink-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="Optional delivery reference or supplier notes"
                  value={newBatch.notes}
                  onChange={(e) => setNewBatch({ ...newBatch, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 focus:bg-white focus:border-pink-500 outline-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onCloseBatchModal) onCloseBatchModal();
                    else setShowAddBatchModal(false);
                  }}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="btn-save-batch-submit"
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold shadow-md shadow-pink-300 transition-all cursor-pointer active:scale-95"
                >
                  {editingBatchId ? 'Update Batch & Recalculate' : 'Save Batch & Update Costs'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD OR EDIT PRODUCT */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-pink-600" />
                  {editingProductId ? `Edit Catalog Product (${editingProductId})` : 'Add Product to Catalog'}
                </h3>
                {editingProductId && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    Update product specifications, landed cost, packaging, or selling price
                  </p>
                )}
              </div>
              <button
                id="btn-close-product-modal"
                onClick={() => {
                  if (onCloseProductModal) onCloseProductModal();
                  else setShowAddProductModal(false);
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cherry Velvet Lip Tint"
                  value={newProd.name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    const autoSKU = generateUniqueSKU(newName, newProd.category, products, editingProductId);
                    setNewProd({ ...newProd, name: newName, code: autoSKU });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold focus:bg-white focus:border-pink-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Category</label>
                  <select
                    value={newProd.category}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      const autoSKU = generateUniqueSKU(newProd.name, newCat, products, editingProductId);
                      setNewProd({ ...newProd, category: newCat, code: autoSKU });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium focus:bg-white focus:border-pink-500 outline-none cursor-pointer"
                  >
                    <option value="Lip Gloss">Lip Gloss</option>
                    <option value="Lip Liner">Lip Liner</option>
                    <option value="Lip Balm">Lip Balm</option>
                    <option value="Lip Care">Lip Care</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-600">Auto SKU Code</label>
                    <button
                      type="button"
                      onClick={() => {
                        const autoSKU = generateUniqueSKU(newProd.name, newProd.category, products, editingProductId);
                        setNewProd({ ...newProd, code: autoSKU });
                      }}
                      className="text-[10px] text-pink-600 hover:text-pink-700 font-semibold inline-flex items-center gap-0.5 cursor-pointer"
                      title="Regenerate unique SKU from name and category"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      <span>Regenerate</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LG-CV-01"
                    value={newProd.code}
                    onChange={(e) => setNewProd({ ...newProd, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono uppercase font-bold text-pink-600 focus:bg-white focus:border-pink-500 outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Unique tracking code auto-derived from name & category</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Unit Landed Cost (₦)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newProd.unitLandedCost}
                    onChange={(e) => setNewProd({ ...newProd, unitLandedCost: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium focus:bg-white focus:border-pink-500 outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Purchasing/factory base cost</p>
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Selling Price (₦)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newProd.sellingPrice}
                    onChange={(e) => setNewProd({ ...newProd, sellingPrice: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-pink-600 focus:bg-white focus:border-pink-500 outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Customer retail price</p>
                </div>
              </div>

              {/* Live Unit Economics Preview */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">Unit Net Profit</span>
                  <span className="font-bold text-emerald-600 text-sm">
                    {formatNaira(Math.max(0, (Number(newProd.sellingPrice) || 0) - (Number(newProd.unitLandedCost) || 0)))}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-[10px] block">Gross Margin</span>
                  <span className="font-bold text-pink-600 text-sm">
                    {Number(newProd.sellingPrice) > 0
                      ? (((Number(newProd.sellingPrice) - Number(newProd.unitLandedCost)) / Number(newProd.sellingPrice)) * 100).toFixed(1)
                      : '0.0'}%
                  </span>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  id="btn-cancel-product-modal"
                  onClick={() => {
                    if (onCloseProductModal) onCloseProductModal();
                    else setShowAddProductModal(false);
                  }}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-save-product-modal"
                  className="w-1/2 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold shadow-md shadow-pink-300 transition-all cursor-pointer"
                >
                  {editingProductId ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CREATE COMBO */}
      {showAddComboModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-600" /> Create Combo / Bundle Package
              </h3>
              <button
                onClick={() => setShowAddComboModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCombo} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Combo Bundle Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Luscious Lip Trio & Scrub"
                  value={newCombo.name}
                  onChange={(e) => setNewCombo({ ...newCombo, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold focus:bg-white focus:border-pink-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Combo Code</label>
                  <input
                    type="text"
                    placeholder="e.g. CMB-TRIO"
                    value={newCombo.code}
                    onChange={(e) => setNewCombo({ ...newCombo, code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono uppercase focus:bg-white focus:border-pink-500 outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Custom Bundle Box (₦)</label>
                  <input
                    type="number"
                    value={newCombo.comboPackagingCost}
                    onChange={(e) => setNewCombo({ ...newCombo, comboPackagingCost: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 focus:bg-white focus:border-pink-500 outline-none"
                  />
                </div>
              </div>

              {/* Items in Combo */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 uppercase text-[11px] tracking-wider">Bundle Components</span>
                  <button
                    type="button"
                    onClick={() => {
                      setNewCombo({
                        ...newCombo,
                        items: [...newCombo.items, { productId: products[0]?.id || '', qty: 1 }]
                      });
                    }}
                    className="text-xs font-semibold text-pink-600 hover:text-pink-700 cursor-pointer"
                  >
                    + Add Product
                  </button>
                </div>

                {newCombo.items.map((it: any, idx: number) => (
                  <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                    <select
                      value={it.productId}
                      onChange={(e) => {
                        const items = [...newCombo.items];
                        items[idx].productId = e.target.value;
                        setNewCombo({ ...newCombo, items });
                      }}
                      className="w-3/4 bg-white border border-slate-200 rounded-lg p-1.5 cursor-pointer outline-none text-slate-800"
                    >
                      {products
                        .filter(p => !p.isArchived || p.id === it.productId)
                        .map(p => (
                          <option key={p.id} value={p.id}>{p.name}{p.isArchived ? ' (Archived)' : ''} ({formatNaira(p.sellingPrice)})</option>
                        ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={it.qty}
                      onChange={(e) => {
                        const items = [...newCombo.items];
                        items[idx].qty = Number(e.target.value);
                        setNewCombo({ ...newCombo, items });
                      }}
                      className="w-1/4 bg-white border border-slate-200 rounded-lg p-1.5 font-bold text-slate-800 outline-none"
                    />

                    {newCombo.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setNewCombo({
                            ...newCombo,
                            items: newCombo.items.filter((_: any, i: number) => i !== idx)
                          });
                        }}
                        className="text-slate-400 hover:text-pink-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Discount Strategy */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Discount Type</label>
                  <select
                    value={newCombo.discountType}
                    onChange={(e) => setNewCombo({ ...newCombo, discountType: e.target.value as 'percentage' | 'fixed' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium focus:bg-white focus:border-pink-500 outline-none cursor-pointer"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₦)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Discount Value</label>
                  <input
                    type="number"
                    min="0"
                    value={newCombo.discountValue}
                    onChange={(e) => setNewCombo({ ...newCombo, discountValue: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-pink-600 focus:bg-white focus:border-pink-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddComboModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold shadow-md shadow-pink-300 transition-all cursor-pointer"
                >
                  Save Combo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
