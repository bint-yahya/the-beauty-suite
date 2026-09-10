// Shared TypeScript types and starter data for Glow & Care - the beauty suite

export interface ProductItem {
  id: string;
  name: string;
  code: string;
  category: string;
  unitLandedCost: number;
  packagingCost: number;
  giftCost: number;
  miscCost: number;
  sellingPrice: number;
}

export interface ComboItemEntry {
  productId: string;
  qty: number;
}

export interface ComboItem {
  id: string;
  name: string;
  code: string;
  items: ComboItemEntry[];
  comboPackagingCost: number;
  giftCost: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  customSellingPrice: number;
}

export interface BatchItemEntry {
  productId: string;
  qty: number;
  batchPurchasePrice: number;
}

export interface BatchOrder {
  id: string;
  date: string;
  supplier: string;
  totalDeliveryFee: number;
  items: BatchItemEntry[];
  notes?: string;
  status?: 'Active' | 'Depleted';
}

export interface SaleItemEntry {
  productId: string;
  qty: number;
  unitPrice: number;
}

export interface SaleRecord {
  id: string;
  date: string;
  type: 'single' | 'combo';
  itemId: string; // for backward compatibility: primary productId or comboId
  qty: number; // total units in sale
  sellingPrice: number; // primary unit price or average unit price
  customer?: string;
  channel?: string;
  // Multi-product sale and order-level packaging:
  items?: SaleItemEntry[];
  packagingCost?: number;
  notes?: string;
}

export interface InventoryStockItem {
  product: ProductItem;
  totalStockedIn: number;
  totalSold: number;
  currentStock: number;
  lowStockThreshold: number;
  totalStockCostValue: number;
}

export const formatNaira = (val: number | string | undefined | null) => {
  const num = Number(val) || 0;
  return '₦' + num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Universal helper functions for SaleRecord (guarantees 100% backward compatibility)
export const getSaleTotalRevenue = (sale: SaleRecord): number => {
  if (sale.items && sale.items.length > 0) {
    return sale.items.reduce((sum, it) => sum + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0), 0);
  }
  return (Number(sale.qty) || 0) * (Number(sale.sellingPrice) || 0);
};

export const getSaleTotalQty = (sale: SaleRecord): number => {
  if (sale.items && sale.items.length > 0) {
    return sale.items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0);
  }
  return Number(sale.qty) || 0;
};

export const getSaleCost = (
  sale: SaleRecord,
  products: ProductItem[],
  combos: ComboItem[]
): number => {
  if (sale.type === 'combo') {
    const cmb = combos.find(c => c.id === sale.itemId);
    if (!cmb) return 0;
    let itemsCost = 0;
    (cmb.items || []).forEach(ci => {
      const p = products.find(prod => prod.id === ci.productId);
      if (p) itemsCost += (Number(p.unitLandedCost) || 0) * ci.qty;
    });
    const comboPkg = Number(cmb.comboPackagingCost) || 0;
    const gift = Number(cmb.giftCost) || 0;
    return (itemsCost + comboPkg + gift) * (Number(sale.qty) || 1);
  }

  // Multi-item or modern single item with items array
  if (sale.items && sale.items.length > 0) {
    let itemsBaseCost = 0;
    let fallbackPackaging = 0;
    sale.items.forEach(it => {
      const p = products.find(prod => prod.id === it.productId);
      if (p) {
        const itemQty = Number(it.qty) || 0;
        const baseCostPerUnit = (Number(p.unitLandedCost) || 0) + (Number(p.giftCost) || 0) + (Number(p.miscCost) || 0);
        itemsBaseCost += baseCostPerUnit * itemQty;
        fallbackPackaging += (Number(p.packagingCost) || 0) * itemQty;
      }
    });
    const packaging = sale.packagingCost !== undefined ? (Number(sale.packagingCost) || 0) : fallbackPackaging;
    return itemsBaseCost + packaging;
  }

  // Legacy single sale without items array:
  const prod = products.find(p => p.id === sale.itemId);
  if (!prod) return 0;
  const unitCost = (Number(prod.unitLandedCost) || 0) + (Number(prod.packagingCost) || 0) + (Number(prod.giftCost) || 0) + (Number(prod.miscCost) || 0);
  return unitCost * (Number(sale.qty) || 0);
};

export const getSaleProfit = (
  sale: SaleRecord,
  products: ProductItem[],
  combos: ComboItem[]
): number => {
  return getSaleTotalRevenue(sale) - getSaleCost(sale, products, combos);
};

export const INITIAL_PRODUCTS: ProductItem[] = [
  { id: 'PRD-001', name: 'Velvet Berry Lip Gloss', code: 'VBG-01', category: 'Lip Gloss', unitLandedCost: 1250, packagingCost: 200, giftCost: 50, miscCost: 50, sellingPrice: 3500 },
  { id: 'PRD-002', name: 'Hydra Glow Clear Gloss', code: 'HGC-02', category: 'Lip Gloss', unitLandedCost: 1100, packagingCost: 200, giftCost: 50, miscCost: 50, sellingPrice: 3000 },
  { id: 'PRD-003', name: 'Ruby Wine Matte Liner', code: 'RWL-03', category: 'Lip Liner', unitLandedCost: 850, packagingCost: 150, giftCost: 50, miscCost: 30, sellingPrice: 2500 },
  { id: 'PRD-004', name: 'Nude Silk Lip Liner', code: 'NSL-04', category: 'Lip Liner', unitLandedCost: 850, packagingCost: 150, giftCost: 50, miscCost: 30, sellingPrice: 2500 },
  { id: 'PRD-005', name: 'Vanilla Honey Lip Balm', code: 'VHB-05', category: 'Lip Balm', unitLandedCost: 650, packagingCost: 120, giftCost: 30, miscCost: 20, sellingPrice: 1800 },
  { id: 'PRD-006', name: 'Rose Petal Lip Butter', code: 'RPB-06', category: 'Lip Balm', unitLandedCost: 750, packagingCost: 150, giftCost: 30, miscCost: 20, sellingPrice: 2000 },
  { id: 'PRD-007', name: 'Sugar Kiss Lip Scrub', code: 'SKS-07', category: 'Lip Care', unitLandedCost: 950, packagingCost: 250, giftCost: 50, miscCost: 40, sellingPrice: 2800 },
  { id: 'PRD-008', name: 'Overnight Lip Plump Mask', code: 'OLM-08', category: 'Lip Care', unitLandedCost: 1400, packagingCost: 250, giftCost: 60, miscCost: 50, sellingPrice: 4200 }
];

export const INITIAL_COMBOS: ComboItem[] = [
  {
    id: 'CMB-001',
    name: 'Gloss & Liner Duo (Berry Edition)',
    code: 'GLD-BERRY',
    items: [
      { productId: 'PRD-001', qty: 1 },
      { productId: 'PRD-003', qty: 1 }
    ],
    comboPackagingCost: 350,
    giftCost: 100,
    discountType: 'percentage',
    discountValue: 10,
    customSellingPrice: 5400
  },
  {
    id: 'CMB-002',
    name: 'Ultimate 4-Step Lip Care Trio & Scrub',
    code: 'ULT-CARE',
    items: [
      { productId: 'PRD-005', qty: 1 },
      { productId: 'PRD-007', qty: 1 },
      { productId: 'PRD-008', qty: 1 }
    ],
    comboPackagingCost: 500,
    giftCost: 200,
    discountType: 'fixed',
    discountValue: 1000,
    customSellingPrice: 7800
  }
];

export const INITIAL_BATCHES: BatchOrder[] = [
  {
    id: 'BAT-2024-001',
    date: '2024-01-10',
    supplier: 'GlowCraft Cosmetics Lab',
    totalDeliveryFee: 15000,
    items: [
      { productId: 'PRD-001', qty: 50, batchPurchasePrice: 52500 },
      { productId: 'PRD-002', qty: 50, batchPurchasePrice: 45000 },
      { productId: 'PRD-003', qty: 40, batchPurchasePrice: 28000 },
      { productId: 'PRD-004', qty: 40, batchPurchasePrice: 28000 }
    ],
    notes: 'First launch batch from Lagos dispatch'
  },
  {
    id: 'BAT-2024-002',
    date: '2024-02-05',
    supplier: 'Nectar Lip Essentials',
    totalDeliveryFee: 12000,
    items: [
      { productId: 'PRD-005', qty: 60, batchPurchasePrice: 30000 },
      { productId: 'PRD-006', qty: 60, batchPurchasePrice: 36000 },
      { productId: 'PRD-007', qty: 40, batchPurchasePrice: 32000 },
      { productId: 'PRD-008', qty: 30, batchPurchasePrice: 37500 }
    ],
    notes: 'Hydration line restock'
  }
];

export const DEFAULT_SALES_CHANNELS: string[] = [
  'Instagram DM',
  'WhatsApp',
  'Website',
  'Snapchat',
  'Pop-Up Fair',
  'Tiktok Shop'
];

export const INITIAL_SALES: SaleRecord[] = [
  { id: 'SAL-001', date: '2024-01-12', type: 'single', itemId: 'PRD-001', qty: 4, sellingPrice: 3500, customer: 'Amina B.', channel: 'Instagram DM' },
  { id: 'SAL-002', date: '2024-01-15', type: 'combo', itemId: 'CMB-001', qty: 2, sellingPrice: 5400, customer: 'Chioma E.', channel: 'WhatsApp' },
  { id: 'SAL-003', date: '2024-01-18', type: 'single', itemId: 'PRD-002', qty: 5, sellingPrice: 3000, customer: 'Zainab T.', channel: 'Website' },
  { id: 'SAL-004', date: '2024-01-22', type: 'single', itemId: 'PRD-003', qty: 6, sellingPrice: 2500, customer: 'Blessing K.', channel: 'Pop-Up Fair' },
  { id: 'SAL-005', date: '2024-02-01', type: 'single', itemId: 'PRD-001', qty: 8, sellingPrice: 3500, customer: 'Folake O.', channel: 'Website' },
  { id: 'SAL-006', date: '2024-02-10', type: 'combo', itemId: 'CMB-002', qty: 3, sellingPrice: 7800, customer: 'Halima M.', channel: 'Instagram DM' },
  { id: 'SAL-007', date: '2024-02-14', type: 'single', itemId: 'PRD-004', qty: 10, sellingPrice: 2500, customer: 'Valentine Promo (Bulk)', channel: 'WhatsApp' },
  { id: 'SAL-008', date: '2024-02-20', type: 'single', itemId: 'PRD-006', qty: 7, sellingPrice: 2000, customer: 'Ngozi A.', channel: 'Website' },
  { id: 'SAL-009', date: '2024-03-02', type: 'single', itemId: 'PRD-008', qty: 4, sellingPrice: 4200, customer: 'Khadijah S.', channel: 'Instagram DM' },
  { id: 'SAL-010', date: '2024-03-08', type: 'combo', itemId: 'CMB-001', qty: 5, sellingPrice: 5400, customer: 'IWS Fair Orders', channel: 'Pop-Up Fair' },
  { id: 'SAL-011', date: '2024-03-15', type: 'single', itemId: 'PRD-007', qty: 6, sellingPrice: 2800, customer: 'Rukayat D.', channel: 'Snapchat' },
  { id: 'SAL-012', date: '2024-03-24', type: 'single', itemId: 'PRD-002', qty: 9, sellingPrice: 3000, customer: 'Rita P.', channel: 'WhatsApp' }
];
