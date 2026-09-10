import React, { useState } from 'react';
import { Plus, Trash2, Tag, Pencil, AlertCircle, FilterX, Package } from 'lucide-react';
import { ProductItem, formatNaira } from '../types';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface ProductsViewProps {
  products: ProductItem[];
  totalCount?: number;
  selectedCategory?: string;
  selectedProductFilter?: string;
  onResetFilters?: () => void;
  onDeleteProduct: (id: string, name: string) => void;
  onOpenAddProduct: () => void;
  onEditProduct: (product: ProductItem) => void;
  getProductCostBreakdown: (p: ProductItem) => any;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  totalCount,
  selectedCategory = 'all',
  selectedProductFilter = 'all',
  onResetFilters,
  onDeleteProduct,
  onOpenAddProduct,
  onEditProduct,
  getProductCostBreakdown
}) => {
  const [productToDelete, setProductToDelete] = useState<ProductItem | null>(null);

  const isFilterActive = (totalCount !== undefined && totalCount !== products.length) ||
    selectedCategory !== 'all' ||
    selectedProductFilter !== 'all';

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Tag className="w-5 h-5 text-pink-600" />
            Product Master Catalog
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Single beauty & lip care SKUs, landed purchase costs, custom packaging, and profit margins.
          </p>
        </div>
        <button
          id="btn-add-product-main"
          onClick={onOpenAddProduct}
          className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs shadow-pink-300 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Notice banner if global Category or Product filter is applied */}
      {isFilterActive && onResetFilters && (
        <div className="flex items-center justify-between bg-pink-50/80 border border-pink-200 px-4 py-2.5 rounded-2xl text-xs text-pink-800 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-pink-600 shrink-0" />
            <span>
              <strong>Filter Active:</strong> Showing {products.length} of {totalCount ?? products.length} catalog products based on your selected Category / Product filter.
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
        {products.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="w-10 h-10 mx-auto opacity-30 text-pink-500" />
            <div>
              <p className="font-semibold text-slate-700 text-sm">
                {isFilterActive ? 'No products match active filter' : 'No products in catalog yet'}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {isFilterActive
                  ? 'Try clearing the Category or Product filter in the top bar to view other items.'
                  : 'Add your single product SKUs to start tracking sales and profitability.'}
              </p>
            </div>
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
                  onClick={onOpenAddProduct}
                  className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Add First Product
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Mobile View: Product SKU Cards (Hidden on sm screens and up) */}
            <div className="block sm:hidden divide-y divide-slate-100">
          {products.map((prod) => {
            const costCalc = getProductCostBreakdown(prod);
            return (
              <div key={prod.id} className="p-4 space-y-3 hover:bg-pink-50/20 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded border border-pink-200">
                        {prod.code}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{prod.category}</span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm mt-1">{prod.name}</h3>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      id={`btn-edit-product-mobile-${prod.id}`}
                      onClick={() => onEditProduct(prod)}
                      className="text-slate-500 hover:text-pink-600 p-2 rounded-xl bg-slate-50 hover:bg-pink-50 border border-slate-200 hover:border-pink-200 transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                      title="Edit Product Details"
                      aria-label={`Edit product ${prod.name}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`btn-delete-product-mobile-${prod.id}`}
                      onClick={() => setProductToDelete(prod)}
                      className="text-slate-400 hover:text-rose-600 p-2 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                      title="Delete Product"
                      aria-label={`Delete product ${prod.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
                    <span className="text-slate-400 text-[10px] block">Net Profit</span>
                    <span className="font-bold text-emerald-600">{formatNaira(costCalc.netProfit)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-0.5">
                  <span className="text-slate-500 font-medium">Profit Margin:</span>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {costCalc.marginPercent.toFixed(1)}% Margin
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop View: Full-featured Table (Hidden on small mobile screens) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500">
              <tr className="uppercase tracking-wider text-[11px] font-semibold">
                <th className="py-3.5 px-4 font-semibold">Code</th>
                <th className="py-3.5 px-4 font-semibold">Product Name</th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 text-right font-semibold">Landed Cost</th>
                <th className="py-3.5 px-4 text-right font-semibold">Selling Price</th>
                <th className="py-3.5 px-4 text-right font-semibold">Unit Net Profit</th>
                <th className="py-3.5 px-4 text-right font-semibold">Margin %</th>
                <th className="py-3.5 px-4 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((prod) => {
                const costCalc = getProductCostBreakdown(prod);
                return (
                  <tr key={prod.id} className="hover:bg-pink-50/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-pink-600">{prod.code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{prod.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-pink-50 text-pink-700 border border-pink-100">
                        {prod.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-600">
                      {formatNaira(prod.unitLandedCost)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-800">
                      {formatNaira(prod.sellingPrice)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600">
                      {formatNaira(costCalc.netProfit)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {costCalc.marginPercent.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          id={`btn-edit-product-${prod.id}`}
                          onClick={() => onEditProduct(prod)}
                          className="text-slate-400 hover:text-pink-600 p-1.5 rounded-lg hover:bg-pink-50 transition-colors cursor-pointer"
                          title="Edit Product Details"
                          aria-label={`Edit product ${prod.name}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`btn-delete-product-${prod.id}`}
                          onClick={() => setProductToDelete(prod)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Product"
                          aria-label={`Delete product ${prod.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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

      {/* Delete Product In-App Modal */}
      {productToDelete && (
        <ConfirmDeleteModal
          isOpen={true}
          title="Delete Catalog Product"
          description={`Are you sure you want to remove "${productToDelete.name}" from your catalog?`}
          details={[
            { label: 'SKU Code', value: productToDelete.code },
            { label: 'Category', value: productToDelete.category },
            { label: 'Landed Unit Cost', value: formatNaira(productToDelete.unitLandedCost) },
            { label: 'Selling Price', value: formatNaira(productToDelete.sellingPrice), highlight: true }
          ]}
          confirmText="Delete Product"
          onConfirm={() => {
            const { id, name } = productToDelete;
            setProductToDelete(null);
            onDeleteProduct(id, name);
          }}
          onCancel={() => setProductToDelete(null)}
        />
      )}
    </div>
  );
};
