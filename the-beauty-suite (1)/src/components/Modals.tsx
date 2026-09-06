import React from 'react';
import { X, ShoppingBag, Truck, Tag, Sparkles, Trash2 } from 'lucide-react';
import { ProductItem, ComboItem, formatNaira } from '../types';

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
  getComboCostBreakdown
}) => {
  return (
    <>
      {/* MODAL 1: RECORD OR EDIT SALE */}
      {showAddSaleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-pink-600" />
                  {editingSaleId ? `Edit Sale Record (${editingSaleId})` : 'Record Sale — the beauty suite'}
                </h3>
                {editingSaleId && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    Update customer, channel, quantity, or sale price
                  </p>
                )}
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

            <form onSubmit={handleSaveSale} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Date</label>
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
                      const firstItem = typeVal === 'single' ? products[0] : combos[0];
                      const price = typeVal === 'single' ? (firstItem?.sellingPrice || 3500) : (firstItem?.customSellingPrice || 5400);
                      setNewSale({
                        ...newSale,
                        type: typeVal,
                        itemId: firstItem?.id || '',
                        sellingPrice: price
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium focus:bg-white focus:border-pink-500 outline-none cursor-pointer"
                  >
                    <option value="single">Single SKU</option>
                    <option value="combo">Bundle Combo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Select Item</label>
                <select
                  value={newSale.itemId || (newSale.type === 'single' ? products[0]?.id : combos[0]?.id) || ''}
                  onChange={(e) => {
                    const id = e.target.value;
                    let price = newSale.sellingPrice;
                    if (newSale.type === 'single') {
                      const p = products.find(prod => prod.id === id);
                      if (p) price = p.sellingPrice;
                    } else {
                      const cmb = combos.find(c => c.id === id);
                      if (cmb) price = getComboCostBreakdown(cmb).finalSellingPrice;
                    }
                    setNewSale({ ...newSale, itemId: id, sellingPrice: price });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium focus:bg-white focus:border-pink-500 outline-none cursor-pointer"
                >
                  {newSale.type === 'single'
                    ? products.map(p => <option key={p.id} value={p.id}>{p.name} ({formatNaira(p.sellingPrice)})</option>)
                    : combos.map(c => <option key={c.id} value={c.id}>{c.name} ({formatNaira(getComboCostBreakdown(c).finalSellingPrice)})</option>)
                  }
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newSale.qty}
                    onChange={(e) => setNewSale({ ...newSale, qty: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-800 focus:bg-white focus:border-pink-500 outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Unit Selling Price (₦)</label>
                  <input
                    type="number"
                    required
                    value={newSale.sellingPrice}
                    onChange={(e) => setNewSale({ ...newSale, sellingPrice: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-pink-600 focus:bg-white focus:border-pink-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Customer Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Amina"
                    value={newSale.customer}
                    onChange={(e) => setNewSale({ ...newSale, customer: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 focus:bg-white focus:border-pink-500 outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Sales Channel</label>
                  <select
                    value={newSale.channel}
                    onChange={(e) => setNewSale({ ...newSale, channel: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium focus:bg-white focus:border-pink-500 outline-none cursor-pointer"
                  >
                    <option value="Snapchat">Snapchat</option>
                    <option value="Instagram DM">Instagram DM</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Website">Website</option>
                    <option value="Pop-Up Fair">Pop-Up Fair</option>
                    <option value="Tiktok Shop">Tiktok Shop</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                <span className="font-semibold text-slate-600">Total Transaction:</span>
                <span className="text-base font-bold text-pink-600">
                  {formatNaira((Number(newSale.qty) || 0) * (Number(newSale.sellingPrice) || 0))}
                </span>
              </div>

              <div className="flex gap-2.5 pt-2">
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
      )}

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
