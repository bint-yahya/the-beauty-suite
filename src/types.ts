// Shared TypeScript types and starter data for Glow & Care - the beauty suite

export interface ProductItem {
  id: string;
  name: string;
  code: string;
  category: string;
  unitLandedCost: number;
  sellingPrice: number;
  // Optional legacy fields for backward compatibility
  packagingCost?: number;
  giftCost?: number;
  miscCost?: number;
  // Lifecycle & Archival:
  isArchived?: boolean;
  archivedAt?: string;
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
  productName?: string;
  unitLandedCost?: number;
}

export interface SaleGift {
  hasGift: boolean;
  isProduct: boolean;
  productId?: string;
  productName?: string;
  qty?: number;
  cost: number;
  description?: string;
  customDescription?: string;
}

export type PaymentStatus = 'Paid' | 'Pending' | 'Partially Paid';
export type DeliveryStatus = 'Delivered' | 'Pending' | 'Shipped' | 'Processing' | 'Cancelled';

export interface SaleRecord {
  id: string;
  date: string;
  type: 'single' | 'combo';
  itemId: string; // for backward compatibility: primary productId or comboId
  qty: number; // total units in sale
  sellingPrice: number; // primary unit price or average unit price
  customer?: string;
  channel?: string;
  // Payment and Delivery statuses
  paymentStatus?: PaymentStatus;
  deliveryStatus?: DeliveryStatus;
  // Multi-product sale and order-level packaging:
  items?: SaleItemEntry[];
  packagingCost?: number;
  gift?: SaleGift;
  giftCost?: number; // legacy fallback
  notes?: string;
  itemNameSnapshot?: string;
  itemLandedCostSnapshot?: number;
}

export interface SalesChannel {
  id: string;
  name: string;
  color?: string; // 'pink' | 'emerald' | 'sky' | 'amber' | 'purple' | 'indigo' | 'rose' | 'teal' | 'slate'
  description?: string;
  isDefault?: boolean;
}

export const DEFAULT_SALES_CHANNELS: SalesChannel[] = [
  { id: 'chan-ig', name: 'Instagram DM', color: 'pink', description: 'Direct messages & story orders', isDefault: true },
  { id: 'chan-wa', name: 'WhatsApp', color: 'emerald', description: 'WhatsApp Business & catalog inquiries', isDefault: true },
  { id: 'chan-web', name: 'Website', color: 'sky', description: 'Online eCommerce storefront checkout', isDefault: true },
  { id: 'chan-snap', name: 'Snapchat', color: 'amber', description: 'Snapchat story & chat orders', isDefault: true },
  { id: 'chan-fair', name: 'Pop-Up Fair', color: 'purple', description: 'In-person events, exhibitions & pop-ups', isDefault: true },
  { id: 'chan-tiktok', name: 'Tiktok Shop', color: 'slate', description: 'TikTok live streams & shop links', isDefault: true }
];

export const CHANNEL_COLOR_PRESETS: { id: string; label: string; bg: string; text: string; border: string; dot: string }[] = [
  { id: 'pink', label: 'Berry Pink', bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200', dot: 'bg-pink-500' },
  { id: 'emerald', label: 'Emerald Green', bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  { id: 'sky', label: 'Sky Blue', bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-200', dot: 'bg-sky-500' },
  { id: 'amber', label: 'Warm Amber', bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200', dot: 'bg-amber-500' },
  { id: 'purple', label: 'Royal Violet', bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200', dot: 'bg-purple-500' },
  { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  { id: 'rose', label: 'Soft Rose', bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-200', dot: 'bg-rose-500' },
  { id: 'teal', label: 'Ocean Teal', bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200', dot: 'bg-teal-500' },
  { id: 'slate', label: 'Neutral Slate', bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-200', dot: 'bg-slate-500' }
];

export const getChannelColorClasses = (colorName?: string) => {
  const match = CHANNEL_COLOR_PRESETS.find(p => p.id === colorName);
  if (match) return match;
  return { id: 'pink', label: 'Berry Pink', bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200', dot: 'bg-pink-500' };
};

export const resolveChannelBadge = (channelName?: string, customChannels?: SalesChannel[]) => {
  if (!channelName) {
    return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400' };
  }
  const found = customChannels?.find(c => c.name.toLowerCase() === channelName.toLowerCase());
  if (found && found.color) {
    return getChannelColorClasses(found.color);
  }
  const lower = channelName.toLowerCase();
  if (lower.includes('snap')) return getChannelColorClasses('amber');
  if (lower.includes('insta') || lower.includes('ig')) return getChannelColorClasses('pink');
  if (lower.includes('whats') || lower.includes('wa')) return getChannelColorClasses('emerald');
  if (lower.includes('web') || lower.includes('store') || lower.includes('online')) return getChannelColorClasses('sky');
  if (lower.includes('pop') || lower.includes('fair') || lower.includes('event')) return getChannelColorClasses('purple');
  if (lower.includes('tik') || lower.includes('tok')) return getChannelColorClasses('slate');
  return { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', dot: 'bg-pink-400' };
};

export interface InventoryStockItem {
  product: ProductItem;
  totalStockedIn: number;
  totalSold: number;
  totalGifted: number;
  currentStock: number;
  lowStockThreshold: number;
  totalStockCostValue: number;
}

export const formatNaira = (val: number | string | undefined | null) => {
  const num = Number(val) || 0;
  return '₦' + num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Automatic SKU generation logic based on product name and category
export const getCategoryPrefix = (category: string): string => {
  const cat = (category || '').trim().toLowerCase();
  if (cat.includes('gloss')) return 'LG';
  if (cat.includes('liner')) return 'LL';
  if (cat.includes('balm') || cat.includes('butter')) return 'LB';
  if (cat.includes('scrub') || cat.includes('mask') || cat.includes('care')) return 'LC';
  if (cat.includes('stick')) return 'LS';
  if (cat.includes('oil')) return 'LO';
  if (cat.includes('tint')) return 'LT';

  const words = (category || '').trim().split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    return words.map(w => w[0].toUpperCase()).join('').slice(0, 3);
  }
  return (category || '').trim().slice(0, 3).toUpperCase() || 'PRD';
};

export const getNameInitials = (name: string, category: string): string => {
  if (!name || !name.trim()) return 'SKU';
  const categoryWords = new Set((category || '').toLowerCase().split(/\s+/).filter(Boolean));
  
  const words = name
    .trim()
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  // Filter out redundant category words like 'lip', 'gloss', 'liner', etc. if other descriptive words exist
  const significantWords = words.filter(w => !categoryWords.has(w.toLowerCase()));
  const targetWords = significantWords.length > 0 ? significantWords : words;

  if (targetWords.length === 1) {
    return targetWords[0].slice(0, 3).toUpperCase();
  }
  if (targetWords.length === 2) {
    // e.g. "Velvet Berry" -> "VB"
    return (targetWords[0][0] + targetWords[1][0]).toUpperCase();
  }
  // 3 or more words -> take first letters e.g. "Hydra Glow Clear" -> "HGC"
  return targetWords.map(w => w[0].toUpperCase()).join('').slice(0, 4);
};

export const generateUniqueSKU = (
  name: string,
  category: string,
  existingProducts: { id?: string; code?: string }[],
  currentProductId?: string | null
): string => {
  const catPrefix = getCategoryPrefix(category);
  const nameInitials = getNameInitials(name, category);
  const basePrefix = `${catPrefix}-${nameInitials}`;

  const existingCodes = new Set(
    existingProducts
      .filter(p => !currentProductId || p.id !== currentProductId)
      .map(p => (p.code || '').toUpperCase().trim())
  );

  let counter = 1;
  let candidate = `${basePrefix}-${String(counter).padStart(2, '0')}`;
  while (existingCodes.has(candidate)) {
    counter++;
    candidate = `${basePrefix}-${String(counter).padStart(2, '0')}`;
  }
  return candidate;
};

// Universal helper functions for SaleRecord
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

export const getSaleGiftCost = (sale: SaleRecord, products?: ProductItem[]): number => {
  if (sale.gift && sale.gift.hasGift) {
    if (sale.gift.cost !== undefined && sale.gift.cost !== null && Number(sale.gift.cost) >= 0) {
      return Number(sale.gift.cost);
    }
    if (sale.gift.isProduct && sale.gift.productId && products) {
      const p = products.find(prod => prod.id === sale.gift?.productId) || INITIAL_PRODUCTS.find(prod => prod.id === sale.gift?.productId);
      return (Number(p?.unitLandedCost) || 0) * (Number(sale.gift.qty) || 1);
    }
  }
  return Number(sale.giftCost) || 0;
};

export const getSaleCost = (
  sale: SaleRecord,
  products: ProductItem[],
  combos: ComboItem[]
): number => {
  const giftCost = getSaleGiftCost(sale, products);
  const packaging = Number(sale.packagingCost) >= 0 ? Number(sale.packagingCost) : 0;

  if (sale.type === 'combo') {
    const cmb = combos.find(c => c.id === sale.itemId);
    if (!cmb) return giftCost + packaging;
    let itemsCost = 0;
    (cmb.items || []).forEach(ci => {
      const p = products.find(prod => prod.id === ci.productId) || INITIAL_PRODUCTS.find(prod => prod.id === ci.productId);
      if (p) itemsCost += (Number(p.unitLandedCost) || 0) * ci.qty;
    });
    const comboPkg = Number(cmb.comboPackagingCost) || 0;
    const comboGift = Number(cmb.giftCost) || 0;
    const baseCost = (itemsCost + comboPkg + comboGift) * (Number(sale.qty) || 1);
    return baseCost + packaging + giftCost;
  }

  // Multi-item or modern single item with items array
  if (sale.items && sale.items.length > 0) {
    let itemsBaseCost = 0;
    sale.items.forEach(it => {
      const p = products.find(prod => prod.id === it.productId) || INITIAL_PRODUCTS.find(prod => prod.id === it.productId);
      const unitLanded = p
        ? (Number(p.unitLandedCost) || 0)
        : (Number(it.unitLandedCost) || 0);
      const itemQty = Number(it.qty) || 0;
      itemsBaseCost += unitLanded * itemQty;
    });
    return itemsBaseCost + packaging + giftCost;
  }

  // Legacy single sale without items array:
  const prod = products.find(p => p.id === sale.itemId) || INITIAL_PRODUCTS.find(prod => prod.id === sale.itemId);
  const unitLanded = prod
    ? (Number(prod.unitLandedCost) || 0)
    : (Number(sale.itemLandedCostSnapshot) || 0);
  return (unitLanded * (Number(sale.qty) || 0)) + packaging + giftCost;
};

export const getSaleProfit = (
  sale: SaleRecord,
  products: ProductItem[],
  combos: ComboItem[]
): number => {
  return getSaleTotalRevenue(sale) - getSaleCost(sale, products, combos);
};

export const INITIAL_PRODUCTS: ProductItem[] = [
  { id: 'PRD-001', name: 'Velvet Berry Lip Gloss', code: 'LG-VB-01', category: 'Lip Gloss', unitLandedCost: 1250, sellingPrice: 3500 },
  { id: 'PRD-002', name: 'Hydra Glow Clear Gloss', code: 'LG-HGC-02', category: 'Lip Gloss', unitLandedCost: 1100, sellingPrice: 3000 },
  { id: 'PRD-003', name: 'Ruby Wine Matte Liner', code: 'LL-RW-03', category: 'Lip Liner', unitLandedCost: 850, sellingPrice: 2500 },
  { id: 'PRD-004', name: 'Nude Silk Lip Liner', code: 'LL-NS-04', category: 'Lip Liner', unitLandedCost: 850, sellingPrice: 2500 },
  { id: 'PRD-005', name: 'Vanilla Honey Lip Balm', code: 'LB-VH-05', category: 'Lip Balm', unitLandedCost: 650, sellingPrice: 1800 },
  { id: 'PRD-006', name: 'Rose Petal Lip Butter', code: 'LB-RP-06', category: 'Lip Balm', unitLandedCost: 750, sellingPrice: 2000 },
  { id: 'PRD-007', name: 'Sugar Kiss Lip Scrub', code: 'LC-SK-07', category: 'Lip Care', unitLandedCost: 950, sellingPrice: 2800 },
  { id: 'PRD-008', name: 'Overnight Lip Plump Mask', code: 'LC-OP-08', category: 'Lip Care', unitLandedCost: 1400, sellingPrice: 4200 }
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

export const INITIAL_SALES: SaleRecord[] = [
  {
    id: 'SAL-001',
    date: '2024-01-12',
    type: 'single',
    itemId: 'PRD-001',
    qty: 4,
    sellingPrice: 3500,
    customer: 'Amina B.',
    channel: 'Instagram DM',
    packagingCost: 200,
    paymentStatus: 'Paid',
    deliveryStatus: 'Delivered',
    gift: {
      hasGift: true,
      isProduct: true,
      productId: 'PRD-005',
      productName: 'Vanilla Honey Lip Balm',
      qty: 1,
      cost: 650
    }
  },
  { id: 'SAL-002', date: '2024-01-15', type: 'combo', itemId: 'CMB-001', qty: 2, sellingPrice: 5400, customer: 'Chioma E.', channel: 'WhatsApp', packagingCost: 350, paymentStatus: 'Paid', deliveryStatus: 'Delivered' },
  { id: 'SAL-003', date: '2024-01-18', type: 'single', itemId: 'PRD-002', qty: 5, sellingPrice: 3000, customer: 'Zainab T.', channel: 'Website', packagingCost: 200, paymentStatus: 'Paid', deliveryStatus: 'Delivered' },
  {
    id: 'SAL-004',
    date: '2024-01-22',
    type: 'single',
    itemId: 'PRD-003',
    qty: 6,
    sellingPrice: 2500,
    customer: 'Blessing K.',
    channel: 'Pop-Up Fair',
    packagingCost: 0,
    paymentStatus: 'Paid',
    deliveryStatus: 'Delivered',
    gift: {
      hasGift: true,
      isProduct: false,
      description: 'Satin Hair Scrunchie',
      qty: 1,
      cost: 150
    }
  },
  { id: 'SAL-005', date: '2024-02-01', type: 'single', itemId: 'PRD-001', qty: 8, sellingPrice: 3500, customer: 'Folake O.', channel: 'Website', packagingCost: 200, paymentStatus: 'Paid', deliveryStatus: 'Delivered' },
  { id: 'SAL-006', date: '2024-02-10', type: 'combo', itemId: 'CMB-002', qty: 3, sellingPrice: 7800, customer: 'Halima M.', channel: 'Instagram DM', packagingCost: 500, paymentStatus: 'Paid', deliveryStatus: 'Delivered' },
  { id: 'SAL-007', date: '2024-02-14', type: 'single', itemId: 'PRD-004', qty: 10, sellingPrice: 2500, customer: 'Valentine Promo (Bulk)', channel: 'WhatsApp', packagingCost: 350, paymentStatus: 'Paid', deliveryStatus: 'Delivered' },
  { id: 'SAL-008', date: '2024-02-20', type: 'single', itemId: 'PRD-006', qty: 7, sellingPrice: 2000, customer: 'Ngozi A.', channel: 'Website', packagingCost: 200, paymentStatus: 'Paid', deliveryStatus: 'Delivered' },
  { id: 'SAL-009', date: '2024-03-02', type: 'single', itemId: 'PRD-008', qty: 4, sellingPrice: 4200, customer: 'Khadijah S.', channel: 'Instagram DM', packagingCost: 200, paymentStatus: 'Pending', deliveryStatus: 'Processing' },
  { id: 'SAL-010', date: '2024-03-08', type: 'combo', itemId: 'CMB-001', qty: 5, sellingPrice: 5400, customer: 'IWS Fair Orders', channel: 'Pop-Up Fair', packagingCost: 350, paymentStatus: 'Paid', deliveryStatus: 'Delivered' },
  { id: 'SAL-011', date: '2024-03-15', type: 'single', itemId: 'PRD-007', qty: 6, sellingPrice: 2800, customer: 'Rukayat D.', channel: 'Snapchat', packagingCost: 200, paymentStatus: 'Partially Paid', deliveryStatus: 'Shipped' },
  { id: 'SAL-012', date: '2024-03-24', type: 'single', itemId: 'PRD-002', qty: 9, sellingPrice: 3000, customer: 'Rita P.', channel: 'WhatsApp', packagingCost: 200, paymentStatus: 'Paid', deliveryStatus: 'Delivered' }
];
