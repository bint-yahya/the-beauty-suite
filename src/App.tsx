import React, { useState, useMemo, useEffect } from 'react';
import {
  ProductItem,
  ComboItem,
  BatchOrder,
  SaleRecord,
  SaleItemEntry,
  InventoryStockItem,
  getSaleTotalRevenue,
  getSaleTotalQty,
  getSaleCost,
  getSaleProfit,
  INITIAL_PRODUCTS,
  INITIAL_COMBOS,
  INITIAL_BATCHES,
  INITIAL_SALES,
  DEFAULT_SALES_CHANNELS
} from './types';
import { HeaderNav, ActiveTabType } from './components/HeaderNav';
import { FilterBar } from './components/FilterBar';
import { DashboardView } from './components/DashboardView';
import { ProductsView } from './components/ProductsView';
import { StockInView } from './components/StockInView';
import { CostingView } from './components/CostingView';
import { SalesView } from './components/SalesView';
import { InventoryView } from './components/InventoryView';
import { HelpView } from './components/HelpView';
import { AuthView } from './components/AuthView';
import { InteractiveTour } from './components/InteractiveTour';
import { ExportReportModal } from './components/ExportReportModal';
import { UserSettingsModal } from './components/UserSettingsModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { ManageChannelsModal } from './components/ManageChannelsModal';
import { Modals } from './components/Modals';
import {
  UserProfile,
  getActiveSession,
  setActiveSession,
  getStoredUsers,
  logoutUser,
  deleteUserAccount
} from './lib/auth';
import { AccentPresetId, getSavedThemePreset, getSavedDarkMode, applyTheme } from './lib/theme';

interface AppProps {
  data?: any[];
  updateItem?: (index: number, row: any[]) => void;
  deleteItem?: (index: number) => void;
  insertItem?: (index: number, row: any[]) => void;
  moveItem?: (from: number, to: number) => void;
  followLink?: (url: string) => void;
}

// Scoped user persistence helper
const loadUserData = (userId?: string) => {
  const key = userId ? `glow_care_data_${userId}` : 'glow_care_data_guest';
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        products: Array.isArray(parsed.products) ? parsed.products : INITIAL_PRODUCTS,
        combos: Array.isArray(parsed.combos) ? parsed.combos : INITIAL_COMBOS,
        batches: Array.isArray(parsed.batches) ? parsed.batches : INITIAL_BATCHES,
        sales: Array.isArray(parsed.sales) ? parsed.sales : INITIAL_SALES,
        salesChannels: Array.isArray(parsed.salesChannels) && parsed.salesChannels.length > 0
          ? parsed.salesChannels
          : DEFAULT_SALES_CHANNELS
      };
    }
  } catch (e) {
    console.error('Error reading scoped user data', e);
  }
  return {
    products: INITIAL_PRODUCTS,
    combos: INITIAL_COMBOS,
    batches: INITIAL_BATCHES,
    sales: INITIAL_SALES,
    salesChannels: DEFAULT_SALES_CHANNELS
  };
};

export default function App({ data, updateItem }: AppProps = {}) {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<ActiveTabType>('dashboard');

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    return getActiveSession();
  });
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showTour, setShowTour] = useState(false);

  // Spreadsheet date synchronization if available
  const sheetDateRow = useMemo(() => {
    if (!data || !Array.isArray(data)) return null;
    return data.find(d => d.row && (d.row[1] === 'Start Date' || d.row[2] === 'Start Date' || (typeof d.row[2] === 'string' && d.row[2].startsWith('20'))));
  }, [data]);

  const now = new Date();
  const curYear = now.getFullYear();
  const initialStartDate = (sheetDateRow && sheetDateRow.row[2]) || '2024-01-01';
  const initialEndDate = (sheetDateRow && sheetDateRow.row[4]) || `${curYear + 1}-12-31`;

  // Global Filter State
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [selectedTimePreset, setSelectedTimePreset] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProductFilter, setSelectedProductFilter] = useState('all');
  const [selectedChannelFilter, setSelectedChannelFilter] = useState('all');

  // Core application state initialized from scoped user storage
  const initialData = useMemo(() => loadUserData(currentUser?.id), [currentUser?.id]);
  const [products, setProducts] = useState<ProductItem[]>(initialData.products);
  const [combos, setCombos] = useState<ComboItem[]>(initialData.combos);
  const [batches, setBatches] = useState<BatchOrder[]>(initialData.batches);
  const [sales, setSales] = useState<SaleRecord[]>(initialData.sales);
  const [salesChannels, setSalesChannels] = useState<string[]>(initialData.salesChannels || DEFAULT_SALES_CHANNELS);

  // Keep local user-scoped storage in sync
  useEffect(() => {
    if (!currentUser?.id) return;
    const key = `glow_care_data_${currentUser.id}`;
    try {
      localStorage.setItem(key, JSON.stringify({ products, combos, batches, sales, salesChannels }));
    } catch (e) {
      console.error('Error saving user data', e);
    }
  }, [products, combos, batches, sales, salesChannels, currentUser?.id]);

  // Handle User Login/Signup
  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setActiveSession(user);
    setShowAuthModal(false);
    setAuthNotice(null);
    const loaded = loadUserData(user.id);
    setProducts(loaded.products);
    setCombos(loaded.combos);
    setBatches(loaded.batches);
    setSales(loaded.sales);
    setSalesChannels(loaded.salesChannels || DEFAULT_SALES_CHANNELS);
  };

  // Handle Logout
  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setShowSettingsModal(false);
    setShowExportModal(false);
    setShowAddSaleModal(false);
    setShowAddBatchModal(false);
    setShowAddProductModal(false);
    setEditingProductId(null);
    setShowAddComboModal(false);
    setAuthNotice('You have logged out. Please sign in or create an account to access the beauty suite.');
  };

  // Handle Guest Preview Mode
  const handleContinueAsGuest = () => {
    const guestUser: UserProfile = {
      id: 'USR-001',
      email: 'sumyabint@gmail.com',
      name: 'Sumya Bint',
      brandName: 'Glow & Care Cosmetics',
      createdAt: '2024-01-01T00:00:00.000Z',
      role: 'owner',
      avatarColor: 'bg-indigo-600'
    };
    handleAuthSuccess(guestUser);
  };

  // Handle Delete Account Confirmation
  const handleDeleteAccountConfirm = () => {
    if (!currentUser) return;
    const deletedEmail = currentUser.email;
    const deletedName = currentUser.name;
    deleteUserAccount(currentUser.id);
    setShowDeleteAccountModal(false);
    setShowSettingsModal(false);
    setCurrentUser(null);
    setAuthNotice(`Account "${deletedName}" (${deletedEmail}) has been deleted successfully.`);
  };

  // Sync date changes back to the sheet row if available
  const handleDateRangeChange = (newStart: string, newEnd: string) => {
    setStartDate(newStart);
    setEndDate(newEnd);
    if (sheetDateRow && typeof updateItem === 'function') {
      try {
        updateItem(sheetDateRow.index_, [undefined, 'Start Date', newStart, 'End Date', newEnd]);
      } catch (e) {
        console.error('Error syncing dates back to sheet', e);
      }
    }
  };

  // Quick preset helper
  const handlePresetSelect = (preset: string) => {
    setSelectedTimePreset(preset);
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = String(now.getMonth() + 1).padStart(2, '0');
    const curDay = String(now.getDate()).padStart(2, '0');
    const todayStr = `${curYear}-${curMonth}-${curDay}`;

    if (preset === 'today') {
      handleDateRangeChange(todayStr, todayStr);
    } else if (preset === 'week') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      const weekAgoStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      handleDateRangeChange(weekAgoStr, todayStr);
    } else if (preset === 'month') {
      const monthStart = `${curYear}-${curMonth}-01`;
      handleDateRangeChange(monthStart, todayStr);
    } else if (preset === 'year') {
      const yearStart = `${curYear}-01-01`;
      handleDateRangeChange(yearStart, `${curYear}-12-31`);
    } else if (preset === 'all') {
      handleDateRangeChange('2024-01-01', `${curYear + 1}-12-31`);
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedProductFilter('all');
    setSelectedChannelFilter('all');
    setSelectedTimePreset('all');
    const curYearNow = new Date().getFullYear();
    handleDateRangeChange('2024-01-01', `${curYearNow + 1}-12-31`);
  };

  // Costing calculations helpers
  const getProductCostBreakdown = (product: ProductItem) => {
    const unitLanded = Number(product.unitLandedCost) || 0;
    const packaging = Number(product.packagingCost) || 0;
    const gift = Number(product.giftCost) || 0;
    const misc = Number(product.miscCost) || 0;
    const totalCost = unitLanded + packaging + gift + misc;
    const selling = Number(product.sellingPrice) || 0;
    const grossProfit = selling - unitLanded;
    const netProfit = selling - totalCost;
    const marginPercent = selling > 0 ? (netProfit / selling) * 100 : 0;
    return {
      unitLanded,
      packaging,
      gift,
      misc,
      totalCost,
      sellingPrice: selling,
      grossProfit,
      netProfit,
      marginPercent
    };
  };

  const getComboCostBreakdown = (combo: ComboItem) => {
    let itemsTotalCost = 0;
    let itemsTotalSelling = 0;
    const itemDetails = (combo.items || []).map(ci => {
      const prod = products.find(p => p.id === ci.productId);
      if (!prod) return { product: undefined, name: 'Unknown', qty: ci.qty, cost: 0, price: 0 };
      const cost = (prod.unitLandedCost || 0) * ci.qty;
      const price = (prod.sellingPrice || 0) * ci.qty;
      itemsTotalCost += cost;
      itemsTotalSelling += price;
      return {
        product: prod,
        name: prod.name,
        qty: ci.qty,
        cost,
        price
      };
    });

    const comboPkg = Number(combo.comboPackagingCost) || 0;
    const gift = Number(combo.giftCost) || 0;
    const totalCost = itemsTotalCost + comboPkg + gift;

    const calculatedFinalPrice = combo.discountType === 'percentage'
      ? itemsTotalSelling - (itemsTotalSelling * (Number(combo.discountValue) || 0)) / 100
      : itemsTotalSelling - (Number(combo.discountValue) || 0);

    const finalSellingPrice = combo.customSellingPrice !== undefined && combo.customSellingPrice !== null && combo.customSellingPrice > 0
      ? Number(combo.customSellingPrice)
      : calculatedFinalPrice;

    const netProfit = finalSellingPrice - totalCost;
    const marginPercent = finalSellingPrice > 0 ? (netProfit / finalSellingPrice) * 100 : 0;

    return {
      itemsTotalCost,
      itemsTotalSelling,
      comboPackagingCost: comboPkg,
      giftCost: gift,
      totalCost,
      discountedComputedPrice: calculatedFinalPrice,
      finalSellingPrice,
      netProfit,
      marginPercent,
      itemDetails
    };
  };

  // Real-time Inventory Calculation
  const inventoryStock = useMemo(() => {
    const stockMap: Record<string, InventoryStockItem> = {};

    products.forEach(p => {
      stockMap[p.id] = {
        product: p,
        totalStockedIn: 0,
        totalSold: 0,
        currentStock: 0,
        lowStockThreshold: 10,
        totalStockCostValue: 0
      };
    });

    batches.forEach(b => {
      (b.items || []).forEach(bi => {
        if (stockMap[bi.productId]) {
          stockMap[bi.productId].totalStockedIn += (Number(bi.qty) || 0);
        }
      });
    });

    sales.forEach(s => {
      if (s.items && s.items.length > 0) {
        s.items.forEach(it => {
          if (stockMap[it.productId]) {
            stockMap[it.productId].totalSold += (Number(it.qty) || 0);
          }
        });
      } else if (s.type === 'single') {
        const saleQty = Number(s.qty) || 0;
        if (stockMap[s.itemId]) {
          stockMap[s.itemId].totalSold += saleQty;
        }
      } else if (s.type === 'combo') {
        const saleQty = Number(s.qty) || 0;
        const cmb = combos.find(c => c.id === s.itemId);
        if (cmb && cmb.items) {
          cmb.items.forEach(ci => {
            if (stockMap[ci.productId]) {
              stockMap[ci.productId].totalSold += (ci.qty * saleQty);
            }
          });
        }
      }
    });

    Object.values(stockMap).forEach(st => {
      st.currentStock = st.totalStockedIn - st.totalSold;
      st.totalStockCostValue = st.currentStock * (st.product.unitLandedCost || 0);
    });

    return stockMap;
  }, [products, batches, sales, combos]);

  const inventoryList = useMemo(() => Object.values(inventoryStock), [inventoryStock]);

  // Filtered inventory based on Category and Product filter dropdowns
  const filteredInventoryList = useMemo(() => {
    return inventoryList.filter(item => {
      if (selectedCategory !== 'all' && item.product.category !== selectedCategory) {
        return false;
      }
      if (selectedProductFilter !== 'all' && item.product.id !== selectedProductFilter) {
        return false;
      }
      return true;
    });
  }, [inventoryList, selectedCategory, selectedProductFilter]);

  // Filtered products catalog based on Category and Product filter dropdowns
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }
      if (selectedProductFilter !== 'all' && p.id !== selectedProductFilter) {
        return false;
      }
      return true;
    });
  }, [products, selectedCategory, selectedProductFilter]);

  // Filtered combo bundles based on Category and Product filter dropdowns
  const filteredCombos = useMemo(() => {
    return combos.filter(cmb => {
      if (selectedProductFilter !== 'all') {
        const hasProd = cmb.items && cmb.items.some(ci => ci.productId === selectedProductFilter);
        if (!hasProd) return false;
      }
      if (selectedCategory !== 'all') {
        const matches = cmb.items && cmb.items.some(ci => {
          const p = products.find(prod => prod.id === ci.productId);
          return p && p.category === selectedCategory;
        });
        if (!matches) return false;
      }
      return true;
    });
  }, [combos, selectedCategory, selectedProductFilter, products]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => set.add(p.category));
    return Array.from(set);
  }, [products]);

  // Filtered Sales according to global date and dropdown filters
  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      if (startDate && s.date < startDate) return false;
      if (endDate && s.date > endDate) return false;

      if (selectedChannelFilter !== 'all' && (s.channel || 'Direct') !== selectedChannelFilter) {
        return false;
      }

      if (selectedProductFilter !== 'all') {
        if (s.items && s.items.length > 0) {
          const hasProd = s.items.some(it => it.productId === selectedProductFilter);
          if (!hasProd) return false;
        } else if (s.type === 'single' && s.itemId !== selectedProductFilter) {
          return false;
        } else if (s.type === 'combo') {
          const cmb = combos.find(c => c.id === s.itemId);
          const hasProd = cmb && cmb.items.some(ci => ci.productId === selectedProductFilter);
          if (!hasProd) return false;
        }
      }

      if (selectedCategory !== 'all') {
        if (s.items && s.items.length > 0) {
          const matches = s.items.some(it => {
            const prod = products.find(p => p.id === it.productId);
            return prod && prod.category === selectedCategory;
          });
          if (!matches) return false;
        } else if (s.type === 'single') {
          const prod = products.find(p => p.id === s.itemId);
          if (!prod || prod.category !== selectedCategory) return false;
        } else if (s.type === 'combo') {
          const cmb = combos.find(c => c.id === s.itemId);
          const matches = cmb && cmb.items.some(ci => {
            const p = products.find(prod => prod.id === ci.productId);
            return p && p.category === selectedCategory;
          });
          if (!matches) return false;
        }
      }

      return true;
    });
  }, [sales, startDate, endDate, selectedCategory, selectedProductFilter, selectedChannelFilter, products, combos]);

  // Compute 360 Dashboard KPI Metrics
  const dashboardMetrics = useMemo(() => {
    let totalRevenue = 0;
    let totalCost = 0;
    let totalItemsSold = 0;
    const productSoldBreakdown: Record<string, number> = {};

    filteredSales.forEach(s => {
      const rev = getSaleTotalRevenue(s);
      const cost = getSaleCost(s, products, combos);
      const units = getSaleTotalQty(s);

      totalRevenue += rev;
      totalCost += cost;
      totalItemsSold += units;

      if (s.items && s.items.length > 0) {
        s.items.forEach(it => {
          const itQty = Number(it.qty) || 0;
          const prod = products.find(p => p.id === it.productId);
          if (prod) {
            productSoldBreakdown[prod.name] = (productSoldBreakdown[prod.name] || 0) + itQty;
          }
        });
      } else if (s.type === 'single') {
        const prod = products.find(p => p.id === s.itemId);
        if (prod) {
          productSoldBreakdown[prod.name] = (productSoldBreakdown[prod.name] || 0) + units;
        }
      } else if (s.type === 'combo') {
        const cmb = combos.find(c => c.id === s.itemId);
        if (cmb) {
          productSoldBreakdown[cmb.name] = (productSoldBreakdown[cmb.name] || 0) + units;
        }
      }
    });

    const totalNetProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (totalNetProfit / totalRevenue) * 100 : 0;
    const totalOrders = filteredSales.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    let totalInventoryValue = 0;
    let lowStockCount = 0;
    inventoryList.forEach(st => {
      totalInventoryValue += (st.currentStock > 0 ? st.totalStockCostValue : 0);
      if (st.currentStock <= st.lowStockThreshold) {
        lowStockCount++;
      }
    });

    const topProductsList = Object.entries(productSoldBreakdown)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalRevenue,
      totalNetProfit,
      profitMargin,
      totalItemsSold,
      totalOrders,
      averageOrderValue,
      totalInventoryValue,
      lowStockCount,
      topProductsList
    };
  }, [filteredSales, products, combos, inventoryList]);

  // Timeline Trend Data for Chart
  const salesTimelineData = useMemo(() => {
    const dailyMap: Record<string, { date: string; revenue: number; profit: number; count: number }> = {};
    filteredSales.forEach(s => {
      if (!dailyMap[s.date]) {
        dailyMap[s.date] = { date: s.date, revenue: 0, profit: 0, count: 0 };
      }
      const rev = getSaleTotalRevenue(s);
      const cost = getSaleCost(s, products, combos);
      const qty = getSaleTotalQty(s);

      dailyMap[s.date].revenue += rev;
      dailyMap[s.date].profit += (rev - cost);
      dailyMap[s.date].count += qty;
    });

    return Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredSales, products, combos]);

  // Modals & New Entry States
  const [showAddSaleModal, setShowAddSaleModal] = useState(false);
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [showAddComboModal, setShowAddComboModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showManageChannelsModal, setShowManageChannelsModal] = useState(false);

  // Girly Accent Color Preset & Dark Mode Theme State
  const [currentPreset, setCurrentPreset] = useState<AccentPresetId>(getSavedThemePreset());
  const [isDarkMode, setIsDarkMode] = useState<boolean>(getSavedDarkMode());

  // Apply theme dynamically to CSS variables
  useEffect(() => {
    applyTheme(currentPreset, isDarkMode);
  }, [currentPreset, isDarkMode]);

  const handleSelectPreset = (presetId: AccentPresetId) => {
    setCurrentPreset(presetId);
    applyTheme(presetId, isDarkMode);
  };

  const handleToggleDarkMode = (dark: boolean) => {
    setIsDarkMode(dark);
    applyTheme(currentPreset, dark);
  };

  // Form States
  const [newProd, setNewProd] = useState({
    name: '',
    code: '',
    category: 'Lip Gloss',
    unitLandedCost: 1000,
    packagingCost: 200,
    giftCost: 50,
    miscCost: 30,
    sellingPrice: 3000
  });

  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setNewProd({
      name: '',
      code: '',
      category: 'Lip Gloss',
      unitLandedCost: 1000,
      packagingCost: 200,
      giftCost: 50,
      miscCost: 30,
      sellingPrice: 3000
    });
    setShowAddProductModal(true);
  };

  const handleOpenEditProduct = (prod: ProductItem) => {
    setEditingProductId(prod.id);
    setNewProd({
      name: prod.name,
      code: prod.code,
      category: prod.category || 'Lip Gloss',
      unitLandedCost: Number(prod.unitLandedCost) || 0,
      packagingCost: Number(prod.packagingCost) || 0,
      giftCost: Number(prod.giftCost) || 0,
      miscCost: Number(prod.miscCost) || 0,
      sellingPrice: Number(prod.sellingPrice) || 0
    });
    setShowAddProductModal(true);
  };

  const handleCloseProductModal = () => {
    setShowAddProductModal(false);
    setEditingProductId(null);
    setNewProd({
      name: '',
      code: '',
      category: 'Lip Gloss',
      unitLandedCost: 1000,
      packagingCost: 200,
      giftCost: 50,
      miscCost: 30,
      sellingPrice: 3000
    });
  };

  const [newBatch, setNewBatch] = useState({
    date: new Date().toISOString().slice(0, 10),
    supplier: '',
    totalDeliveryFee: 5000,
    items: [{ productId: products[0]?.id || '', qty: 24, batchPurchasePrice: 24000 }],
    notes: ''
  });

  const handleOpenAddBatch = () => {
    setEditingBatchId(null);
    setNewBatch({
      date: new Date().toISOString().slice(0, 10),
      supplier: '',
      totalDeliveryFee: 5000,
      items: [{ productId: products[0]?.id || '', qty: 24, batchPurchasePrice: 24000 }],
      notes: ''
    });
    setShowAddBatchModal(true);
  };

  const handleOpenEditBatch = (batch: BatchOrder) => {
    setEditingBatchId(batch.id);
    setNewBatch({
      date: batch.date || new Date().toISOString().slice(0, 10),
      supplier: batch.supplier || '',
      totalDeliveryFee: Number(batch.totalDeliveryFee) || 0,
      items: (batch.items && batch.items.length > 0)
        ? batch.items.map(it => ({
            productId: it.productId,
            qty: Number(it.qty) || 1,
            batchPurchasePrice: Number(it.batchPurchasePrice) || 0
          }))
        : [{ productId: products[0]?.id || '', qty: 12, batchPurchasePrice: 12000 }],
      notes: batch.notes || ''
    });
    setShowAddBatchModal(true);
  };

  const handleCloseBatchModal = () => {
    setShowAddBatchModal(false);
    setEditingBatchId(null);
    setNewBatch({
      date: new Date().toISOString().slice(0, 10),
      supplier: '',
      totalDeliveryFee: 5000,
      items: [{ productId: products[0]?.id || '', qty: 24, batchPurchasePrice: 24000 }],
      notes: ''
    });
  };

  const [newSale, setNewSale] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: 'single' as 'single' | 'combo',
    itemId: products[0]?.id || '',
    qty: 1,
    sellingPrice: products[0]?.sellingPrice || 3500,
    customer: '',
    channel: 'Instagram DM',
    items: [
      {
        productId: products[0]?.id || '',
        qty: 1,
        unitPrice: products[0]?.sellingPrice || 3500
      }
    ],
    packagingCost: products[0]?.packagingCost !== undefined ? Number(products[0].packagingCost) : 200,
    comboId: combos[0]?.id || '',
    comboQty: 1,
    comboSellingPrice: combos[0] ? 5400 : 5400
  });

  const handleOpenRecordSale = () => {
    setEditingSaleId(null);
    const firstProd = products[0];
    const defaultPkg = firstProd?.packagingCost !== undefined ? Number(firstProd.packagingCost) : 200;
    setNewSale({
      date: new Date().toISOString().slice(0, 10),
      type: 'single',
      itemId: firstProd?.id || '',
      qty: 1,
      sellingPrice: firstProd?.sellingPrice || 3500,
      customer: '',
      channel: 'Instagram DM',
      items: [
        {
          productId: firstProd?.id || '',
          qty: 1,
          unitPrice: firstProd?.sellingPrice || 3500
        }
      ],
      packagingCost: defaultPkg,
      comboId: combos[0]?.id || '',
      comboQty: 1,
      comboSellingPrice: combos[0] ? getComboCostBreakdown(combos[0]).finalSellingPrice : 5400
    });
    setShowAddSaleModal(true);
  };

  const handleOpenEditSale = (sale: SaleRecord) => {
    setEditingSaleId(sale.id);
    if (sale.type === 'combo') {
      const cmb = combos.find(c => c.id === sale.itemId);
      const price = Number(sale.sellingPrice) >= 0 ? Number(sale.sellingPrice) : (cmb ? getComboCostBreakdown(cmb).finalSellingPrice : 5400);
      setNewSale({
        date: sale.date || new Date().toISOString().slice(0, 10),
        type: 'combo',
        itemId: sale.itemId,
        qty: Number(sale.qty) || 1,
        sellingPrice: price,
        customer: sale.customer || '',
        channel: sale.channel || 'Instagram DM',
        items: [
          {
            productId: products[0]?.id || '',
            qty: 1,
            unitPrice: products[0]?.sellingPrice || 3500
          }
        ],
        packagingCost: 0,
        comboId: sale.itemId,
        comboQty: Number(sale.qty) || 1,
        comboSellingPrice: price
      });
    } else {
      let itemsList: SaleItemEntry[] = [];
      let pkg = 0;
      if (sale.items && sale.items.length > 0) {
        itemsList = sale.items.map(it => ({
          productId: it.productId,
          qty: Number(it.qty) || 1,
          unitPrice: Number(it.unitPrice) >= 0 ? Number(it.unitPrice) : 0
        }));
        pkg = sale.packagingCost !== undefined ? Number(sale.packagingCost) : 0;
      } else {
        const p = products.find(prod => prod.id === sale.itemId);
        itemsList = [
          {
            productId: sale.itemId || products[0]?.id || '',
            qty: Number(sale.qty) || 1,
            unitPrice: Number(sale.sellingPrice) >= 0 ? Number(sale.sellingPrice) : (p?.sellingPrice || 3500)
          }
        ];
        pkg = sale.packagingCost !== undefined ? Number(sale.packagingCost) : (p?.packagingCost || 200);
      }

      setNewSale({
        date: sale.date || new Date().toISOString().slice(0, 10),
        type: 'single',
        itemId: itemsList[0]?.productId || products[0]?.id || '',
        qty: itemsList.reduce((acc, it) => acc + (Number(it.qty) || 0), 0),
        sellingPrice: itemsList[0]?.unitPrice || 0,
        customer: sale.customer || '',
        channel: sale.channel || 'Instagram DM',
        items: itemsList,
        packagingCost: pkg,
        comboId: combos[0]?.id || '',
        comboQty: 1,
        comboSellingPrice: combos[0] ? getComboCostBreakdown(combos[0]).finalSellingPrice : 5400
      });
    }
    setShowAddSaleModal(true);
  };

  const handleRepeatLastSale = () => {
    if (sales.length === 0) return;
    const sorted = [...sales].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
    const lastSale = sorted[0];
    setEditingSaleId(null);
    if (lastSale.type === 'combo') {
      const cmb = combos.find(c => c.id === lastSale.itemId);
      const price = Number(lastSale.sellingPrice) >= 0 ? Number(lastSale.sellingPrice) : (cmb ? getComboCostBreakdown(cmb).finalSellingPrice : 5400);
      setNewSale({
        date: new Date().toISOString().slice(0, 10),
        type: 'combo',
        itemId: lastSale.itemId,
        qty: Number(lastSale.qty) || 1,
        sellingPrice: price,
        customer: lastSale.customer || '',
        channel: lastSale.channel || 'Instagram DM',
        items: [
          {
            productId: products[0]?.id || '',
            qty: 1,
            unitPrice: products[0]?.sellingPrice || 3500
          }
        ],
        packagingCost: 0,
        comboId: lastSale.itemId,
        comboQty: Number(lastSale.qty) || 1,
        comboSellingPrice: price
      });
    } else {
      let itemsList: SaleItemEntry[] = [];
      let pkg = 0;
      if (lastSale.items && lastSale.items.length > 0) {
        itemsList = lastSale.items.map(it => ({
          productId: it.productId,
          qty: Number(it.qty) || 1,
          unitPrice: Number(it.unitPrice) >= 0 ? Number(it.unitPrice) : 0
        }));
        pkg = lastSale.packagingCost !== undefined ? Number(lastSale.packagingCost) : 0;
      } else {
        const p = products.find(prod => prod.id === lastSale.itemId);
        itemsList = [
          {
            productId: lastSale.itemId || products[0]?.id || '',
            qty: Number(lastSale.qty) || 1,
            unitPrice: Number(lastSale.sellingPrice) >= 0 ? Number(lastSale.sellingPrice) : (p?.sellingPrice || 3500)
          }
        ];
        pkg = lastSale.packagingCost !== undefined ? Number(lastSale.packagingCost) : (p?.packagingCost || 200);
      }

      setNewSale({
        date: new Date().toISOString().slice(0, 10),
        type: 'single',
        itemId: itemsList[0]?.productId || products[0]?.id || '',
        qty: itemsList.reduce((acc, it) => acc + (Number(it.qty) || 0), 0),
        sellingPrice: itemsList[0]?.unitPrice || 0,
        customer: lastSale.customer || '',
        channel: lastSale.channel || 'Instagram DM',
        items: itemsList,
        packagingCost: pkg,
        comboId: combos[0]?.id || '',
        comboQty: 1,
        comboSellingPrice: combos[0] ? getComboCostBreakdown(combos[0]).finalSellingPrice : 5400
      });
    }
    setShowAddSaleModal(true);
  };

  const handleCloseSaleModal = () => {
    setShowAddSaleModal(false);
    setEditingSaleId(null);
    const firstProd = products[0];
    const defaultPkg = firstProd?.packagingCost !== undefined ? Number(firstProd.packagingCost) : 200;
    setNewSale({
      date: new Date().toISOString().slice(0, 10),
      type: 'single',
      itemId: firstProd?.id || '',
      qty: 1,
      sellingPrice: firstProd?.sellingPrice || 3500,
      customer: '',
      channel: 'Instagram DM',
      items: [
        {
          productId: firstProd?.id || '',
          qty: 1,
          unitPrice: firstProd?.sellingPrice || 3500
        }
      ],
      packagingCost: defaultPkg,
      comboId: combos[0]?.id || '',
      comboQty: 1,
      comboSellingPrice: combos[0] ? getComboCostBreakdown(combos[0]).finalSellingPrice : 5400
    });
  };

  const [newCombo, setNewCombo] = useState({
    name: '',
    code: '',
    items: [{ productId: products[0]?.id || '', qty: 1 }],
    comboPackagingCost: 300,
    giftCost: 100,
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 10,
    customSellingPrice: 0
  });

  // Sales Channels Management Handlers
  const handleAddSalesChannel = (channelName: string): boolean => {
    const trimmed = channelName.trim();
    if (!trimmed) return false;
    if (salesChannels.some(c => c.toLowerCase() === trimmed.toLowerCase())) return false;
    setSalesChannels(prev => [...prev, trimmed]);
    return true;
  };

  const handleUpdateSalesChannel = (oldName: string, newName: string): boolean => {
    const trimmed = newName.trim();
    if (!trimmed) return false;
    if (salesChannels.some(c => c.toLowerCase() === trimmed.toLowerCase() && c !== oldName)) return false;
    setSalesChannels(prev => prev.map(c => c === oldName ? trimmed : c));
    if (newSale.channel === oldName) {
      setNewSale(prev => ({ ...prev, channel: trimmed }));
    }
    setSales(prev => prev.map(s => s.channel === oldName ? { ...s, channel: trimmed } : s));
    return true;
  };

  const handleDeleteSalesChannel = (channelName: string) => {
    if (salesChannels.length <= 1) return;
    const remaining = salesChannels.filter(c => c !== channelName);
    setSalesChannels(remaining);
    if (newSale.channel === channelName) {
      setNewSale(prev => ({ ...prev, channel: remaining[0] || 'Direct' }));
    }
  };

  const handleResetSalesChannels = () => {
    setSalesChannels(DEFAULT_SALES_CHANNELS);
    if (!DEFAULT_SALES_CHANNELS.includes(newSale.channel)) {
      setNewSale(prev => ({ ...prev, channel: DEFAULT_SALES_CHANNELS[0] }));
    }
  };

  // Handlers
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.name.trim()) return;

    if (editingProductId) {
      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.id === editingProductId
            ? {
                ...p,
                name: newProd.name.trim(),
                code: newProd.code.trim() ? newProd.code.trim().toUpperCase() : p.code,
                category: newProd.category,
                unitLandedCost: Math.max(0, Number(newProd.unitLandedCost) || 0),
                packagingCost: Math.max(0, Number(newProd.packagingCost) || 0),
                giftCost: Math.max(0, Number(newProd.giftCost) || 0),
                miscCost: Math.max(0, Number(newProd.miscCost) || 0),
                sellingPrice: Math.max(0, Number(newProd.sellingPrice) || 0)
              }
            : p
        )
      );
    } else {
      const created: ProductItem = {
        id: `PRD-${String(products.length + 1).padStart(3, '0')}`,
        name: newProd.name.trim(),
        code: newProd.code.trim() ? newProd.code.trim().toUpperCase() : `PRD-${String(products.length + 1).padStart(3, '0')}`,
        category: newProd.category,
        unitLandedCost: Math.max(0, Number(newProd.unitLandedCost) || 0),
        packagingCost: Math.max(0, Number(newProd.packagingCost) || 0),
        giftCost: Math.max(0, Number(newProd.giftCost) || 0),
        miscCost: Math.max(0, Number(newProd.miscCost) || 0),
        sellingPrice: Math.max(0, Number(newProd.sellingPrice) || 0)
      };
      setProducts(prev => [...prev, created]);
    }

    handleCloseProductModal();
  };

  const handleSaveBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const batchItems = newBatch.items.map(it => ({
      productId: it.productId || products[0]?.id || '',
      qty: Math.max(1, Number(it.qty) || 1),
      batchPurchasePrice: Math.max(0, Number(it.batchPurchasePrice) || 0)
    }));

    const totalBatchUnits = batchItems.reduce((acc, i) => acc + i.qty, 0);
    const deliveryFee = Math.max(0, Number(newBatch.totalDeliveryFee) || 0);
    const allocatedPerUnit = totalBatchUnits > 0 ? deliveryFee / totalBatchUnits : 0;

    if (editingBatchId) {
      const updatedBatch: BatchOrder = {
        id: editingBatchId,
        date: newBatch.date || new Date().toISOString().slice(0, 10),
        supplier: newBatch.supplier.trim() || 'Direct Supplier',
        totalDeliveryFee: deliveryFee,
        items: batchItems,
        notes: newBatch.notes
      };

      setBatches(prev => prev.map(b => b.id === editingBatchId ? updatedBatch : b));

      setProducts(prevProducts => prevProducts.map(p => {
        const matchInBatch = batchItems.find(bi => bi.productId === p.id);
        if (matchInBatch && matchInBatch.qty > 0) {
          const batchUnitPurchase = matchInBatch.batchPurchasePrice / matchInBatch.qty;
          const newLandedUnit = batchUnitPurchase + allocatedPerUnit;
          return { ...p, unitLandedCost: Math.round(newLandedUnit) };
        }
        return p;
      }));
    } else {
      const maxNum = batches.reduce((max, b) => {
        const parts = b.id.split('-');
        const num = parseInt(parts[parts.length - 1], 10);
        return !isNaN(num) && num > max ? num : max;
      }, 0);
      const newId = `BAT-${new Date().getFullYear()}-${String(maxNum + 1).padStart(3, '0')}`;

      const created: BatchOrder = {
        id: newId,
        date: newBatch.date || new Date().toISOString().slice(0, 10),
        supplier: newBatch.supplier.trim() || 'Direct Supplier',
        totalDeliveryFee: deliveryFee,
        items: batchItems,
        notes: newBatch.notes
      };

      setBatches(prev => [created, ...prev]);

      setProducts(prevProducts => prevProducts.map(p => {
        const matchInBatch = batchItems.find(bi => bi.productId === p.id);
        if (matchInBatch && matchInBatch.qty > 0) {
          const batchUnitPurchase = matchInBatch.batchPurchasePrice / matchInBatch.qty;
          const newLandedUnit = batchUnitPurchase + allocatedPerUnit;
          return { ...p, unitLandedCost: Math.round(newLandedUnit) };
        }
        return p;
      }));
    }

    handleCloseBatchModal();
  };

  const handleSaveSale = (e: React.FormEvent) => {
    e.preventDefault();
    let savedSale: SaleRecord;

    const getNextSaleNumber = () => {
      return sales.reduce((max, s) => {
        const num = parseInt(s.id.replace(/\D/g, ''), 10);
        return !isNaN(num) && num > max ? num : max;
      }, 0) + 1;
    };

    if (newSale.type === 'combo') {
      const comboId = newSale.comboId || newSale.itemId || combos[0]?.id || '';
      if (!comboId) return;
      const qty = Math.max(1, Number(newSale.comboQty || newSale.qty) || 1);
      const price = Number(newSale.comboSellingPrice !== undefined ? newSale.comboSellingPrice : newSale.sellingPrice) >= 0
        ? Number(newSale.comboSellingPrice !== undefined ? newSale.comboSellingPrice : newSale.sellingPrice)
        : 0;

      if (editingSaleId) {
        savedSale = {
          id: editingSaleId,
          date: newSale.date || new Date().toISOString().slice(0, 10),
          type: 'combo',
          itemId: comboId,
          qty: qty,
          sellingPrice: price,
          customer: newSale.customer.trim() || 'Direct Customer',
          channel: newSale.channel || 'Instagram DM'
        };
        setSales(prev => prev.map(s => s.id === editingSaleId ? savedSale : s));
      } else {
        const newId = `SAL-${String(getNextSaleNumber()).padStart(3, '0')}`;
        savedSale = {
          id: newId,
          date: newSale.date || new Date().toISOString().slice(0, 10),
          type: 'combo',
          itemId: comboId,
          qty: qty,
          sellingPrice: price,
          customer: newSale.customer.trim() || 'Direct Customer',
          channel: newSale.channel || 'Instagram DM'
        };
        setSales(prev => [savedSale, ...prev]);
      }
    } else {
      const validItems = (newSale.items || []).filter((it: any) => it.productId && Number(it.qty) > 0);
      if (validItems.length === 0) {
        const fallbackId = newSale.itemId || products[0]?.id || '';
        if (!fallbackId) return;
        validItems.push({
          productId: fallbackId,
          qty: Math.max(1, Number(newSale.qty) || 1),
          unitPrice: Number(newSale.sellingPrice) >= 0 ? Number(newSale.sellingPrice) : 3500
        });
      }

      const totalQty = validItems.reduce((acc: number, it: any) => acc + (Number(it.qty) || 0), 0);
      const totalRev = validItems.reduce((acc: number, it: any) => acc + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0), 0);
      const avgPrice = totalQty > 0 ? totalRev / totalQty : 0;
      const pkgCost = Math.max(0, Number(newSale.packagingCost) || 0);

      const itemsPayload: SaleItemEntry[] = validItems.map((it: any) => ({
        productId: it.productId,
        qty: Number(it.qty) || 1,
        unitPrice: Number(it.unitPrice) >= 0 ? Number(it.unitPrice) : 0
      }));

      if (editingSaleId) {
        savedSale = {
          id: editingSaleId,
          date: newSale.date || new Date().toISOString().slice(0, 10),
          type: 'single',
          itemId: validItems[0].productId,
          qty: totalQty,
          sellingPrice: avgPrice,
          items: itemsPayload,
          packagingCost: pkgCost,
          customer: newSale.customer.trim() || 'Direct Customer',
          channel: newSale.channel || 'Instagram DM'
        };
        setSales(prev => prev.map(s => s.id === editingSaleId ? savedSale : s));
      } else {
        const newId = `SAL-${String(getNextSaleNumber()).padStart(3, '0')}`;
        savedSale = {
          id: newId,
          date: newSale.date || new Date().toISOString().slice(0, 10),
          type: 'single',
          itemId: validItems[0].productId,
          qty: totalQty,
          sellingPrice: avgPrice,
          items: itemsPayload,
          packagingCost: pkgCost,
          customer: newSale.customer.trim() || 'Direct Customer',
          channel: newSale.channel || 'Instagram DM'
        };
        setSales(prev => [savedSale, ...prev]);
      }
    }

    // Ensure the sale date is visible even if the active date filter was narrower
    if (selectedTimePreset !== 'all' && newSale.date) {
      if (newSale.date < startDate) {
        setStartDate(newSale.date);
      }
      if (newSale.date > endDate) {
        setEndDate(newSale.date);
      }
    }

    handleCloseSaleModal();
  };

  const handleSaveCombo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCombo.name.trim()) return;
    const created: ComboItem = {
      id: `CMB-${String(combos.length + 1).padStart(3, '0')}`,
      name: newCombo.name,
      code: newCombo.code || `CMB-${combos.length + 1}`,
      items: newCombo.items.map(it => ({ productId: it.productId, qty: Number(it.qty) || 1 })),
      comboPackagingCost: Number(newCombo.comboPackagingCost) || 0,
      giftCost: Number(newCombo.giftCost) || 0,
      discountType: newCombo.discountType,
      discountValue: Number(newCombo.discountValue) || 0,
      customSellingPrice: Number(newCombo.customSellingPrice) || 0
    };
    setCombos([...combos, created]);
    setShowAddComboModal(false);
  };

  // Unauthenticated Screen: When logged out or no active session, show the login/sign-in page
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col justify-between selection:bg-pink-100 selection:text-pink-800">
        {/* Top Minimal Brand Bar */}
        <header className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-6 shadow-2xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-tr from-pink-500 via-pink-600 to-fuchsia-500 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-xs shadow-pink-300">
                G
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold tracking-tight text-slate-800">
                    GLOW & CARE
                  </span>
                  <span className="text-[10px] lowercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200">
                    the beauty suite
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Operations, Batch Costing & Inventory Tracker
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                Sign In Required
              </span>
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            </div>
          </div>
        </header>

        {/* Full Auth View Area */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <AuthView
            onAuthSuccess={handleAuthSuccess}
            onContinueAsGuest={handleContinueAsGuest}
            noticeMessage={authNotice}
          />
        </main>

        {/* Clean Minimal Footer */}
        <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/60 bg-white">
          <span>GLOW & CARE the beauty suite • Secure Account Access</span>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col selection:bg-indigo-100 selection:text-indigo-800">
      {/* Sleek Top Header & Navigation Bar */}
      <HeaderNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenRecordSale={handleOpenRecordSale}
        onOpenStockIn={handleOpenAddBatch}
        onOpenExportReport={() => setShowExportModal(true)}
        salesCount={filteredSales.length}
        hasLowStockAlert={dashboardMetrics.lowStockCount > 0}
        currentUser={currentUser}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        onStartTour={() => setShowTour(true)}
        currentPreset={currentPreset}
        onSelectPreset={handleSelectPreset}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenDeleteAccount={() => setShowDeleteAccountModal(true)}
        salesChannelsCount={salesChannels.length}
        onOpenManageChannels={() => setShowManageChannelsModal(true)}
      />

      {/* Global Filter Bar - only display on operational tabs */}
      {activeTab !== 'help' && (
        <FilterBar
          startDate={startDate}
          endDate={endDate}
          selectedTimePreset={selectedTimePreset}
          selectedCategory={selectedCategory}
          selectedProductFilter={selectedProductFilter}
          selectedChannelFilter={selectedChannelFilter}
          categories={categories}
          products={products}
          salesChannels={salesChannels}
          onPresetSelect={handlePresetSelect}
          onDateRangeChange={handleDateRangeChange}
          setSelectedCategory={setSelectedCategory}
          setSelectedProductFilter={setSelectedProductFilter}
          setSelectedChannelFilter={setSelectedChannelFilter}
          setSelectedTimePreset={setSelectedTimePreset}
          onOpenManageChannels={() => setShowManageChannelsModal(true)}
        />
      )}

      {/* Main App Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 pb-24 md:pb-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            metrics={dashboardMetrics}
            timelineData={salesTimelineData}
            inventoryList={inventoryList}
            products={products}
            combos={combos}
            sales={sales}
            onOpenRecordSale={handleOpenRecordSale}
            onOpenStockIn={handleOpenAddBatch}
            onOpenExportReport={() => setShowExportModal(true)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            getProductCostBreakdown={getProductCostBreakdown}
            getComboCostBreakdown={getComboCostBreakdown}
          />
        )}

        {activeTab === 'products' && (
          <ProductsView
            products={filteredProducts}
            totalCount={products.length}
            selectedCategory={selectedCategory}
            selectedProductFilter={selectedProductFilter}
            onResetFilters={handleResetFilters}
            onDeleteProduct={(id) => {
              setProducts(prev => prev.filter(p => p.id !== id));
            }}
            onOpenAddProduct={handleOpenAddProduct}
            onEditProduct={handleOpenEditProduct}
            getProductCostBreakdown={getProductCostBreakdown}
          />
        )}

        {activeTab === 'stockin' && (
          <StockInView
            batches={batches}
            products={products}
            sales={sales}
            combos={combos}
            onOpenAddBatch={handleOpenAddBatch}
            onEditBatch={handleOpenEditBatch}
            onDeleteBatch={(id) => {
              setBatches(prev => prev.filter(b => b.id !== id));
            }}
          />
        )}

        {activeTab === 'costing' && (
          <CostingView
            products={filteredProducts}
            combos={filteredCombos}
            totalProductsCount={products.length}
            totalCombosCount={combos.length}
            selectedCategory={selectedCategory}
            selectedProductFilter={selectedProductFilter}
            onResetFilters={handleResetFilters}
            onOpenAddCombo={() => setShowAddComboModal(true)}
            onDeleteCombo={(id) => {
              setCombos(prev => prev.filter(c => c.id !== id));
            }}
            getProductCostBreakdown={getProductCostBreakdown}
            getComboCostBreakdown={getComboCostBreakdown}
          />
        )}

        {activeTab === 'sales' && (
          <SalesView
            sales={sales}
            filteredSales={filteredSales}
            products={products}
            combos={combos}
            onOpenRecordSale={handleOpenRecordSale}
            onRepeatLastSale={handleRepeatLastSale}
            onEditSale={handleOpenEditSale}
            onOpenExportReport={() => setShowExportModal(true)}
            onDeleteSale={(id) => {
              setSales(prev => prev.filter(s => s.id !== id));
            }}
            onResetFilters={handleResetFilters}
            getProductCostBreakdown={getProductCostBreakdown}
            getComboCostBreakdown={getComboCostBreakdown}
            salesChannels={salesChannels}
            channelFilter={selectedChannelFilter}
            onChannelFilterChange={setSelectedChannelFilter}
            onOpenManageChannels={() => setShowManageChannelsModal(true)}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            inventoryList={filteredInventoryList}
            totalCount={inventoryList.length}
            selectedCategory={selectedCategory}
            selectedProductFilter={selectedProductFilter}
            onResetFilters={handleResetFilters}
            onOpenStockIn={handleOpenAddBatch}
          />
        )}

        {activeTab === 'help' && (
          <HelpView
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenRecordSale={handleOpenRecordSale}
            onOpenStockIn={handleOpenAddBatch}
            onOpenAddProduct={handleOpenAddProduct}
            onOpenAddCombo={() => setShowAddComboModal(true)}
            productsCount={products.length}
            batchesCount={batches.length}
            combosCount={combos.length}
            salesCount={sales.length}
          />
        )}
      </main>

      {/* Export Report PDF Modal */}
      <ExportReportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        metrics={dashboardMetrics}
        filteredSales={filteredSales}
        allSales={sales}
        products={products}
        combos={combos}
        batches={batches}
        inventoryList={inventoryList}
        currentUser={currentUser}
        currentPreset={currentPreset}
        onSelectPreset={handleSelectPreset}
        startDate={startDate}
        endDate={endDate}
        selectedCategory={selectedCategory}
        selectedProductFilter={selectedProductFilter}
        getProductCostBreakdown={getProductCostBreakdown}
        getComboCostBreakdown={getComboCostBreakdown}
      />

      {/* Interactive Guided Tour */}
      <InteractiveTour
        isOpen={showTour}
        onClose={() => setShowTour(false)}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* User Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <AuthView
              isModal
              onCloseModal={() => setShowAuthModal(false)}
              onAuthSuccess={handleAuthSuccess}
            />
          </div>
        </div>
      )}

      {/* User Settings & Girly Theme Presets Modal */}
      <UserSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        currentPreset={currentPreset}
        onSelectPreset={handleSelectPreset}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        currentUser={currentUser}
        onOpenDeleteAccount={() => setShowDeleteAccountModal(true)}
        onLogout={handleLogout}
        salesChannels={salesChannels}
        onOpenManageChannels={() => setShowManageChannelsModal(true)}
      />

      {/* Manage Sales Channels Modal */}
      <ManageChannelsModal
        isOpen={showManageChannelsModal}
        onClose={() => setShowManageChannelsModal(false)}
        channels={salesChannels}
        onAddChannel={handleAddSalesChannel}
        onUpdateChannel={handleUpdateSalesChannel}
        onDeleteChannel={handleDeleteSalesChannel}
        onResetDefaults={handleResetSalesChannels}
        sales={sales}
      />

      {/* Confirm Delete Account Modal */}
      {currentUser && (
        <ConfirmDeleteModal
          isOpen={showDeleteAccountModal}
          title="Delete Account Permanently"
          description="Are you sure you want to delete your account? All your brand credentials, saved formulas, batches, and sales history will be permanently deleted."
          details={[
            { label: 'User Name', value: currentUser.name },
            { label: 'Brand Name', value: currentUser.brandName },
            { label: 'Email Address', value: currentUser.email, highlight: true },
            { label: 'Assigned Role', value: currentUser.role }
          ]}
          confirmText="Yes, Delete My Account"
          cancelText="Keep Account"
          onConfirm={handleDeleteAccountConfirm}
          onCancel={() => setShowDeleteAccountModal(false)}
        />
      )}

      {/* Sleek Modals */}
      <Modals
        showAddSaleModal={showAddSaleModal}
        setShowAddSaleModal={setShowAddSaleModal}
        newSale={newSale}
        setNewSale={setNewSale}
        editingSaleId={editingSaleId}
        onCloseSaleModal={handleCloseSaleModal}
        handleSaveSale={handleSaveSale}

        showAddBatchModal={showAddBatchModal}
        setShowAddBatchModal={setShowAddBatchModal}
        newBatch={newBatch}
        setNewBatch={setNewBatch}
        editingBatchId={editingBatchId}
        onCloseBatchModal={handleCloseBatchModal}
        handleSaveBatch={handleSaveBatch}

        showAddProductModal={showAddProductModal}
        setShowAddProductModal={setShowAddProductModal}
        newProd={newProd}
        setNewProd={setNewProd}
        editingProductId={editingProductId}
        onCloseProductModal={handleCloseProductModal}
        handleSaveProduct={handleSaveProduct}

        showAddComboModal={showAddComboModal}
        setShowAddComboModal={setShowAddComboModal}
        newCombo={newCombo}
        setNewCombo={setNewCombo}
        handleSaveCombo={handleSaveCombo}

        products={products}
        combos={combos}
        getComboCostBreakdown={getComboCostBreakdown}
        getProductCostBreakdown={getProductCostBreakdown}

        salesChannels={salesChannels}
        onAddSalesChannel={handleAddSalesChannel}
        onUpdateSalesChannel={handleUpdateSalesChannel}
        onDeleteSalesChannel={handleDeleteSalesChannel}
        onResetSalesChannels={handleResetSalesChannels}
        sales={sales}
      />
    </div>
  );
}
