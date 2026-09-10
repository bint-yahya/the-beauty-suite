import React, { useState } from 'react';
import { X, ShoppingBag, Truck, Tag, Sparkles, Trash2, Plus, Package, Box, Sliders } from 'lucide-react';
import { ProductItem, ComboItem, formatNaira, SaleRecord, DEFAULT_SALES_CHANNELS } from '../types';
import { SalesChannelManager } from './SalesChannelManager';

interface ModalsProps {
  showAddSaleModal: boolean;
  setShowAddSaleModal: (val: boolean) => void;
  newSale: any;
  setNewSale: (val: any) => void;
  editingSaleId?: string | null;
  onCloseSaleModal?: () => void;
  handleSaveSale: (e: React.FormEvent) => void;

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
  getComboCostBreakdown: (c: ComboItem) => any;
  getProductCostBreakdown?: (p: ProductItem) => any;

  salesChannels?: string[];
  onAddSalesChannel?: (name: string) => boolean;
  onUpdateSalesChannel?: (oldName: string, newName: string) => boolean;
  onDeleteSalesChannel?: (name: string) => void;
  onResetSalesChannels?: () => void;
  sales?: SaleRecord[];
}

export const Modals: React.FC<ModalsProps> = ({
  showAddSaleModal,
  setShowAddSaleModal,
  newSale,
  setNewSale,
  editingSaleId,
  onCloseSaleModal,
  handleSaveSale,

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
  getComboCostBreakdown,

  salesChannels = DEFAULT_SALES_CHANNELS,
  onAddSalesChannel,
  onUpdateSalesChannel,
  onDeleteSalesChannel,
  onResetSalesChannels,
  sales = []
}) => {
  const [showChannelManager, setShowChannelManager] = useState(false);
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

        if (newSale.type === 'combo') {
          const cmbId = newSale.comboId || newSale.itemId || combos[0]?.id;
          const cmb = combos.find(c => c.id === cmbId);
          const qty = Math.max(1, Number(newSale.comboQty || newSale.qty) || 1);
          const price = Number(newSale.comboSellingPrice !== undefined ? newSale.comboSellingPrice : newSale.sellingPrice) || 0;
          saleTotalRevenue = qty * price;
          saleTotalUnits = qty;
          if (cmb) {
            const breakdown = getComboCostBreakdown(cmb);
            saleTotalCost = breakdown.totalCost * qty;
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
              const unitBase = (Number(prod.unitLandedCost) || 0) + (Number(prod.giftCost) || 0) + (Number(prod.miscCost) || 0);
              itemsBaseCost += unitBase * q;
            }
          });
          saleTotalCost = itemsBaseCost + currentSalePackaging;
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
                      id="input-sale-customer-name"
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
                      <button
                        id="btn-toggle-channel-manager-in-sale"
                        type="button"
                        onClick={() => setShowChannelManager(!showChannelManager)}
                        className="text-[11px] font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1 hover:underline cursor-pointer"
                        title={showChannelManager ? "Done managing channels" : "Add, edit, or delete sales channels"}
                      >
                        <Sliders className="w-3 h-3 text-pink-500" />
                        <span>{showChannelManager ? 'Done' : '+ Manage'}</span>
                      </button>
                    </div>
                    <select
                      id="select-sales-channel-dropdown"
                      value={newSale.channel}
                      onChange={(e) => {
                        if (e.target.value === '__add_or_manage__') {
                          setShowChannelManager(true);
                        } else {
                          setNewSale({ ...newSale, channel: e.target.value });
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium focus:bg-white focus:border-pink-500 outline-none cursor-pointer"
                    >
                      {salesChannels.map((ch) => (
                        <option key={ch} value={ch}>
                          {ch}
                        </option>
                      ))}
                      <option value="__add_or_manage__">
                        ⚙️ + Add, Edit, or Delete Channels...
                      </option>
                    </select>
                  </div>

                  {/* Expandable Inline Sales Channels Manager */}
                  {showChannelManager && (
                    <div className="col-span-2">
                      <SalesChannelManager
                        channels={salesChannels}
                        onAddChannel={(name) => {
                          if (onAddSalesChannel) {
                            return onAddSalesChannel(name);
                          }
                          return false;
                        }}
                        onUpdateChannel={(oldN, newN) => {
                          if (onUpdateSalesChannel) {
                            return onUpdateSalesChannel(oldN, newN);
                          }
                          return false;
                        }}
                        onDeleteChannel={(name) => {
                          if (onDeleteSalesChannel) {
                            onDeleteSalesChannel(name);
                          }
                        }}
                        onResetDefaults={onResetSalesChannels}
                        selectedChannel={newSale.channel}
                        onSelectChannel={(newCh) => {
                          setNewSale({ ...newSale, channel: newCh });
                        }}
                        sales={sales}
                        isInline={true}
                        onClose={() => setShowChannelManager(false)}
                      />
                    </div>
                  )}
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
                                {products.map(p => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} [{p.category}] — {formatNaira(p.sellingPrice)}
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

                    {/* DEDICATED ORDER PACKAGING COST SECTION */}
                    <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                          <Box className="w-4 h-4 text-amber-600" />
                          <span>Order Packaging Cost (₦)</span>
                        </label>
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                          Single packaging for this entire sale
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        One packaging charge for this whole customer purchase (e.g. 1 shipping box or pouch). If the customer bought large quantities requiring multiple packages, adjust the cost here.
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₦</span>
                          <input
                            type="number"
                            min="0"
                            required
                            value={newSale.packagingCost !== undefined ? newSale.packagingCost : ''}
                            onChange={(e) => setNewSale({ ...newSale, packagingCost: Math.max(0, Number(e.target.value) || 0) })}
                            className="w-full pl-6 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:border-pink-500 outline-none"
                            placeholder="e.g. 200"
                          />
                        </div>
                        <div className="flex items-center gap-1 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setNewSale({ ...newSale, packagingCost: 0 })}
                            className="px-2 py-1 rounded-md text-[10px] font-semibold bg-white hover:bg-amber-100 border border-amber-200 text-slate-600 hover:text-amber-800 transition-colors cursor-pointer"
                            title="No packaging / In-person pickup"
                          >
                            ₦0 (None)
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewSale({ ...newSale, packagingCost: 200 })}
                            className="px-2 py-1 rounded-md text-[10px] font-semibold bg-white hover:bg-amber-100 border border-amber-200 text-slate-600 hover:text-amber-800 transition-colors cursor-pointer"
                            title="1 Standard pouch / box"
                          >
                            ₦200 (Standard)
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewSale({ ...newSale, packagingCost: 350 })}
                            className="px-2 py-1 rounded-md text-[10px] font-semibold bg-white hover:bg-amber-100 border border-amber-200 text-slate-600 hover:text-amber-800 transition-colors cursor-pointer"
                            title="1 Medium mailer box"
                          >
                            ₦350 (Medium)
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewSale({ ...newSale, packagingCost: 500 })}
                            className="px-2 py-1 rounded-md text-[10px] font-semibold bg-white hover:bg-amber-100 border border-amber-200 text-slate-600 hover:text-amber-800 transition-colors cursor-pointer"
                            title="Large package or 2 shipping boxes"
                          >
                            ₦500 (2 Boxes)
                          </button>
                        </div>
                      </div>
                    </div>
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

                {/* TRANSACTION FINANCIAL BREAKDOWN & PROFIT ESTIMATE */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Items Ordered:</span>
                    <span className="font-semibold text-slate-700">
                      {saleTotalUnits} unit(s) {newSale.type === 'single' ? `(${saleItems.length} product${saleItems.length > 1 ? 's' : ''})` : ''}
                    </span>
                  </div>
                  {newSale.type === 'single' && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Order Packaging:</span>
                      <span className="font-semibold text-amber-700">{formatNaira(currentSalePackaging)}</span>
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
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
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
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold focus:bg-white focus:border-pink-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Product Code</label>
                  <input
                    type="text"
                    placeholder="e.g. CVT-09"
                    value={newProd.code}
                    onChange={(e) => setNewProd({ ...newProd, code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono uppercase focus:bg-white focus:border-pink-500 outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Category</label>
                  <select
                    value={newProd.category}
                    onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium focus:bg-white focus:border-pink-500 outline-none cursor-pointer"
                  >
                    <option value="Lip Gloss">Lip Gloss</option>
                    <option value="Lip Liner">Lip Liner</option>
                    <option value="Lip Balm">Lip Balm</option>
                    <option value="Lip Care">Lip Care</option>
                  </select>
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
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-500 block mb-1 text-[11px]">Packaging (₦)</label>
                  <input
                    type="number"
                    value={newProd.packagingCost}
                    onChange={(e) => setNewProd({ ...newProd, packagingCost: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-1.5 focus:bg-white focus:border-pink-500 outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-500 block mb-1 text-[11px]">Gifts (₦)</label>
                  <input
                    type="number"
                    value={newProd.giftCost}
                    onChange={(e) => setNewProd({ ...newProd, giftCost: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-1.5 focus:bg-white focus:border-pink-500 outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-500 block mb-1 text-[11px]">Misc (₦)</label>
                  <input
                    type="number"
                    value={newProd.miscCost}
                    onChange={(e) => setNewProd({ ...newProd, miscCost: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-1.5 focus:bg-white focus:border-pink-500 outline-none"
                  />
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
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({formatNaira(p.sellingPrice)})</option>
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
