import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ProductItem, ComboItem, BatchOrder, SaleRecord, InventoryStockItem } from '../types';
import { UserProfile } from './auth';
import { AccentPresetId, getSavedThemePreset } from './theme';

export interface PDFExportOptions {
  reportType: 'full' | 'sales' | 'inventory' | 'executive' | 'financials';
  currentPreset?: AccentPresetId;
  includeMonthlyPerformance?: boolean;
  includeMarginBlueprint?: boolean;
  selectedMonth?: string;
  startDate?: string;
  endDate?: string;
  categoryFilter?: string;
  productFilter?: string;
  preparedBy?: string;
  notes?: string;
}

export interface PDFExportData {
  metrics: {
    totalRevenue: number;
    totalNetProfit: number;
    profitMargin: number;
    totalItemsSold: number;
    totalOrders: number;
    averageOrderValue: number;
    totalInventoryValue: number;
    lowStockCount: number;
    topProductsList: { name: string; count: number }[];
  };
  sales: SaleRecord[];
  allSales?: SaleRecord[];
  products: ProductItem[];
  combos: ComboItem[];
  batches: BatchOrder[];
  inventoryList: InventoryStockItem[];
  currentUser: UserProfile | null;
  getProductCostBreakdown: (p: ProductItem) => any;
  getComboCostBreakdown: (c: ComboItem) => any;
}

// PDF Theme Palette Map for Dynamic Accent Matching
export interface PDFColorPalette {
  name: string;
  primary: [number, number, number];    // Main brand accent
  dark: [number, number, number];       // Deep text / strong accents
  medium: [number, number, number];     // Table headers / active pills
  light: [number, number, number];      // Card backgrounds / subtle fills
  border: [number, number, number];     // Card borders / divider accents
  deepText: [number, number, number];   // High-contrast deep brand text
}

export const PDF_ACCENT_PALETTES: Record<AccentPresetId, PDFColorPalette> = {
  'soft-pink': {
    name: 'Soft Pink',
    primary: [236, 72, 153],    // #ec4899 (Pink 500)
    dark: [190, 24, 93],        // #be185d (Pink 700)
    medium: [219, 39, 119],     // #db2777 (Pink 600)
    light: [253, 242, 248],     // #fdf2f8 (Pink 50)
    border: [251, 207, 232],    // #fbcfe8 (Pink 200)
    deepText: [157, 23, 77]     // #9d174d (Pink 800)
  },
  'lavender': {
    name: 'Lavender',
    primary: [147, 51, 234],    // #9333ea (Purple 600)
    dark: [107, 33, 168],       // #6b21a8 (Purple 800)
    medium: [126, 34, 206],     // #7e22ce (Purple 700)
    light: [250, 245, 255],     // #faf5ff (Purple 50)
    border: [233, 213, 255],    // #e9d5ff (Purple 200)
    deepText: [88, 28, 135]      // #581c87 (Purple 900)
  },
  'peach': {
    name: 'Peach',
    primary: [234, 88, 12],     // #ea580c (Orange 600)
    dark: [154, 52, 18],        // #9a3412 (Orange 800)
    medium: [194, 65, 12],      // #c2410c (Orange 700)
    light: [255, 247, 237],     // #fff7ed (Orange 50)
    border: [254, 215, 170],    // #fed7aa (Orange 200)
    deepText: [124, 45, 18]      // #7c2d12 (Orange 900)
  }
};

// Universal currency formatter for PDF
export const formatPDFCurrency = (val: number | string | undefined | null) => {
  const num = Number(val) || 0;
  return 'NGN ' + num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Helper to format 'YYYY-MM' into friendly month string
const formatMonthName = (monthKey: string) => {
  if (!monthKey || !monthKey.includes('-')) return monthKey || 'Current Month';
  const [y, m] = monthKey.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
};

export const generateBusinessReportPDF = (
  data: PDFExportData,
  options: PDFExportOptions
) => {
  const {
    metrics,
    sales,
    products,
    combos,
    inventoryList,
    currentUser,
    getProductCostBreakdown,
    getComboCostBreakdown
  } = data;

  // Resolve active theme palette with multi-layer fallback
  const htmlThemeAttr = typeof document !== 'undefined'
    ? (document.documentElement.getAttribute('data-accent-theme') as AccentPresetId)
    : null;
  const presetId = options.currentPreset || htmlThemeAttr || getSavedThemePreset() || 'soft-pink';
  const palette = PDF_ACCENT_PALETTES[presetId] || PDF_ACCENT_PALETTES['soft-pink'];

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const brandName = currentUser?.brandName || 'the beauty suite';
  const ownerName = currentUser?.name || 'Store Manager';
  const generationDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  const generationTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  let currentY = 14;
  let sectionNumber = 1;

  // Helper to draw standardized section header with active theme accent pill
  const drawSectionHeader = (title: string) => {
    doc.setFillColor(palette.primary[0], palette.primary[1], palette.primary[2]);
    doc.roundedRect(14, currentY - 3.5, 3.2, 4.8, 0.8, 0.8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text(`${sectionNumber++}. ${title}`, 19, currentY);
    currentY += 4;
  };

  // Helper to ensure page bounds
  const checkNewPage = (neededSpace = 30) => {
    if (currentY + neededSpace > pageHeight - 16) {
      doc.addPage();
      currentY = 16;
      return true;
    }
    return false;
  };

  // =========================================================================
  // 1. TOP HEADER BANNER & BRANDING (Styled with Active Accent Color)
  // =========================================================================
  // Top Accent Bar
  doc.setFillColor(palette.primary[0], palette.primary[1], palette.primary[2]);
  doc.rect(0, 0, pageWidth, 5, 'F');

  // Brand Name & Main Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text('GLOW & CARE', 14, currentY + 6);

  // Sub-badge with theme accent
  doc.setFontSize(11);
  doc.setTextColor(palette.dark[0], palette.dark[1], palette.dark[2]);
  doc.text(brandName.toLowerCase(), 64, currentY + 6);

  // Theme Accent Tag on Top Right
  doc.setFillColor(palette.light[0], palette.light[1], palette.light[2]);
  doc.setDrawColor(palette.border[0], palette.border[1], palette.border[2]);
  doc.roundedRect(pageWidth - 62, currentY - 1, 48, 7.5, 1.5, 1.5, 'FD');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(palette.deepText[0], palette.deepText[1], palette.deepText[2]);
  doc.text(`THEME: ${palette.name.toUpperCase()}`, pageWidth - 38, currentY + 4, { align: 'center' });

  // Report Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  const reportTypeTitle =
    options.reportType === 'sales'
      ? 'Official Sales Ledger & Revenue Audit'
      : options.reportType === 'inventory'
      ? 'Inventory Valuation & Landed Costing Audit'
      : options.reportType === 'executive'
      ? 'Executive Performance & Profitability Summary'
      : options.reportType === 'financials'
      ? 'Executive Financial & Margin Blueprint Report'
      : '360° Operations, Financial & Sales Audit Report';

  doc.text(reportTypeTitle, 14, currentY + 14);

  // Metadata Right Aligned
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Generated: ${generationDate} at ${generationTime}`, pageWidth - 14, currentY + 8.5, { align: 'right' });
  doc.text(`Prepared For: ${ownerName} (${brandName})`, pageWidth - 14, currentY + 12.5, { align: 'right' });
  
  const dateRangeStr =
    options.startDate && options.endDate
      ? `${options.startDate} to ${options.endDate}`
      : 'All Logged History';
  doc.text(`Scope: ${dateRangeStr}`, pageWidth - 14, currentY + 16.5, { align: 'right' });

  // Divider Line
  currentY += 20;
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.line(14, currentY, pageWidth - 14, currentY);
  currentY += 6;

  // =========================================================================
  // 2. EXECUTIVE FINANCIAL SUMMARY SCORECARDS
  // =========================================================================
  if (options.reportType !== 'inventory') {
    drawSectionHeader(
      options.reportType === 'financials'
        ? 'EXECUTIVE FINANCIAL & PROFITABILITY SCORECARDS'
        : 'EXECUTIVE OPERATIONS & FINANCIAL SUMMARY'
    );

    const boxWidth = (pageWidth - 28 - 9) / 4;
    const boxHeight = 18;

    const cogs = Math.max(0, metrics.totalRevenue - metrics.totalNetProfit);
    const kpiBoxes = options.reportType === 'financials'
      ? [
          {
            title: 'TOTAL REVENUE',
            value: formatPDFCurrency(metrics.totalRevenue),
            sub: `${metrics.totalOrders} Orders Logged`,
            bgColor: palette.light,
            borderColor: palette.border,
            textColor: palette.dark
          },
          {
            title: 'NET PROFIT & MARGIN',
            value: formatPDFCurrency(metrics.totalNetProfit),
            sub: `${metrics.profitMargin.toFixed(1)}% Net Margin`,
            bgColor: [240, 253, 244] as [number, number, number], // emerald-50
            borderColor: [187, 247, 208] as [number, number, number], // emerald-200
            textColor: [21, 128, 61] as [number, number, number] // emerald-700
          },
          {
            title: 'COST OF GOODS (COGS)',
            value: formatPDFCurrency(cogs),
            sub: 'Landed + Overheads',
            bgColor: [254, 242, 242] as [number, number, number], // rose-50
            borderColor: [254, 202, 202] as [number, number, number], // rose-200
            textColor: [185, 28, 28] as [number, number, number] // rose-700
          },
          {
            title: 'INVENTORY ASSET VALUE',
            value: formatPDFCurrency(metrics.totalInventoryValue),
            sub: metrics.lowStockCount > 0 ? `${metrics.lowStockCount} Low Stock SKUs` : 'Optimal Stock Level',
            bgColor: palette.light,
            borderColor: palette.border,
            textColor: palette.deepText
          }
        ]
      : [
          {
            title: 'TOTAL REVENUE',
            value: formatPDFCurrency(metrics.totalRevenue),
            sub: `${metrics.totalOrders} Orders Logged`,
            bgColor: palette.light,
            borderColor: palette.border,
            textColor: palette.dark
          },
          {
            title: 'NET PROFIT',
            value: formatPDFCurrency(metrics.totalNetProfit),
            sub: `${metrics.profitMargin.toFixed(1)}% Net Margin`,
            bgColor: [240, 253, 244] as [number, number, number], // emerald-50
            borderColor: [187, 247, 208] as [number, number, number], // emerald-200
            textColor: [21, 128, 61] as [number, number, number] // emerald-700
          },
          {
            title: 'UNITS SOLD',
            value: `${metrics.totalItemsSold.toLocaleString()} pcs`,
            sub: `Avg AOV: ${formatPDFCurrency(metrics.averageOrderValue)}`,
            bgColor: [248, 250, 252] as [number, number, number], // slate-50
            borderColor: [226, 232, 240] as [number, number, number], // slate-200
            textColor: [30, 41, 59] as [number, number, number] // slate-800
          },
          {
            title: 'STOCK VALUATION',
            value: formatPDFCurrency(metrics.totalInventoryValue),
            sub: metrics.lowStockCount > 0 ? `${metrics.lowStockCount} Low Stock SKUs` : 'Optimal Inventory',
            bgColor: (metrics.lowStockCount > 0 ? [254, 243, 199] : [248, 250, 252]) as [number, number, number],
            borderColor: (metrics.lowStockCount > 0 ? [253, 230, 138] : [226, 232, 240]) as [number, number, number],
            textColor: (metrics.lowStockCount > 0 ? [180, 83, 9] : [30, 41, 59]) as [number, number, number]
          }
        ];

    kpiBoxes.forEach((box, i) => {
      const boxX = 14 + i * (boxWidth + 3);
      doc.setFillColor(box.bgColor[0], box.bgColor[1], box.bgColor[2]);
      doc.setDrawColor(box.borderColor[0], box.borderColor[1], box.borderColor[2]);
      doc.roundedRect(boxX, currentY, boxWidth, boxHeight, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text(box.title, boxX + 3, currentY + 4.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(box.textColor[0], box.textColor[1], box.textColor[2]);
      doc.text(box.value, boxX + 3, currentY + 10.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text(box.sub, boxX + 3, currentY + 15);
    });

    currentY += boxHeight + 6;
  }

  // =========================================================================
  // 3. MONTHLY PERFORMANCE SUMMARY (Month-over-Month MoM Analysis)
  // =========================================================================
  const shouldIncludeMonthly = options.includeMonthlyPerformance !== false &&
    (options.reportType === 'full' || options.reportType === 'executive' || options.reportType === 'financials');

  if (shouldIncludeMonthly) {
    checkNewPage(45);

    // Use full sales history if available to guarantee accurate MoM calculation
    const salesForMoM = (data.allSales && data.allSales.length > 0) ? data.allSales : sales;

    // Calculate Month-over-Month Comparison
    const monthsWithSales = salesForMoM
      .map(s => (s.date ? s.date.slice(0, 7) : ''))
      .filter(Boolean)
      .sort((a, b) => b.localeCompare(a));
    const latestMonth = options.selectedMonth || monthsWithSales[0] || new Date().toISOString().slice(0, 7);

    // Previous month key
    const [y, m] = latestMonth.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    const prevMonthKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

    const calcMonth = (monthKey: string) => {
      const list = salesForMoM.filter(s => s.date && s.date.startsWith(monthKey));
      let rev = 0;
      let cost = 0;
      let itemsCount = 0;
      const skuMap: Record<string, { name: string; count: number }> = {};

      list.forEach(s => {
        const qty = Number(s.qty) || 0;
        const r = qty * (Number(s.sellingPrice) || 0);
        rev += r;
        itemsCount += qty;

        let c = 0;
        let itemName = 'Unknown';
        if (s.type === 'single') {
          const p = products.find(prod => prod.id === s.itemId);
          if (p) {
            itemName = p.name;
            c = getProductCostBreakdown(p).totalCost * qty;
          }
        } else {
          const combo = combos.find(cmb => cmb.id === s.itemId);
          if (combo) {
            itemName = combo.name;
            c = getComboCostBreakdown(combo).totalCost * qty;
          }
        }
        cost += c;
        if (!skuMap[s.itemId]) skuMap[s.itemId] = { name: itemName, count: 0 };
        skuMap[s.itemId].count += qty;
      });

      const netProfit = rev - cost;
      const margin = rev > 0 ? (netProfit / rev) * 100 : 0;
      const orders = list.length;
      const aov = orders > 0 ? rev / orders : 0;
      const topSku = Object.values(skuMap).sort((a, b) => b.count - a.count)[0] || null;

      return { rev, netProfit, margin, itemsCount, orders, aov, topSku };
    };

    const curData = calcMonth(latestMonth);
    const prevData = calcMonth(prevMonthKey);

    const revGrowthPct = prevData.rev > 0
      ? ((curData.rev - prevData.rev) / prevData.rev) * 100
      : curData.rev > 0 ? 100 : 0;
    const profitGrowthPct = prevData.netProfit !== 0
      ? ((curData.netProfit - prevData.netProfit) / Math.abs(prevData.netProfit)) * 100
      : curData.netProfit > 0 ? 100 : 0;
    const marginDiff = curData.margin - prevData.margin;
    const itemsGrowthPct = prevData.itemsCount > 0
      ? ((curData.itemsCount - prevData.itemsCount) / prevData.itemsCount) * 100
      : curData.itemsCount > 0 ? 100 : 0;

    drawSectionHeader('MONTHLY PERFORMANCE SUMMARY & MoM GROWTH VELOCITY');

    const momRows = [
      [
        'Total Revenue',
        formatPDFCurrency(curData.rev),
        formatPDFCurrency(prevData.rev),
        `${revGrowthPct >= 0 ? '+' : ''}${revGrowthPct.toFixed(1)}%`,
        formatPDFCurrency(curData.rev - prevData.rev)
      ],
      [
        'Net Profit',
        formatPDFCurrency(curData.netProfit),
        formatPDFCurrency(prevData.netProfit),
        `${profitGrowthPct >= 0 ? '+' : ''}${profitGrowthPct.toFixed(1)}%`,
        formatPDFCurrency(curData.netProfit - prevData.netProfit)
      ],
      [
        'Profit Margin',
        `${curData.margin.toFixed(1)}%`,
        `${prevData.margin.toFixed(1)}%`,
        `${marginDiff >= 0 ? '+' : ''}${marginDiff.toFixed(1)}% pts`,
        marginDiff >= 0 ? 'Margin Expanded' : 'Margin Compressed'
      ],
      [
        'Volume (Units Sold)',
        `${curData.itemsCount} pcs`,
        `${prevData.itemsCount} pcs`,
        `${itemsGrowthPct >= 0 ? '+' : ''}${itemsGrowthPct.toFixed(1)}%`,
        `${curData.itemsCount - prevData.itemsCount} pcs`
      ],
      [
        'Average Order Value (AOV)',
        formatPDFCurrency(curData.aov),
        formatPDFCurrency(prevData.aov),
        `${curData.orders} orders logged`,
        `Top SKU: ${curData.topSku?.name || 'N/A'}`
      ]
    ];

    autoTable(doc, {
      startY: currentY,
      head: [[
        `Metric (${formatMonthName(latestMonth)})`,
        'Current Month',
        `Previous (${formatMonthName(prevMonthKey)})`,
        'MoM Growth %',
        'Net Difference'
      ]],
      body: momRows,
      theme: 'grid',
      headStyles: {
        fillColor: palette.primary,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
        halign: 'left'
      },
      styles: {
        fontSize: 7,
        cellPadding: 2,
        textColor: [51, 65, 85]
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 45 },
        1: { halign: 'right', fontStyle: 'bold' },
        2: { halign: 'right' },
        3: { halign: 'right', fontStyle: 'bold', textColor: palette.dark },
        4: { halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: 14, right: 14 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;
  }

  // =========================================================================
  // 4. MARGIN & PRICING BLUEPRINT (Single SKUs vs Bundle Combos)
  // =========================================================================
  const shouldIncludeBlueprint = options.includeMarginBlueprint !== false &&
    (options.reportType === 'full' || options.reportType === 'executive' || options.reportType === 'financials');

  if (shouldIncludeBlueprint) {
    checkNewPage(50);

    drawSectionHeader('MARGIN & PRICING BLUEPRINT (LANDED COSTS & BUNDLE ECONOMICS)');

    // Single Products Landed Costing Table
    const productPricingRows = products.map(p => {
      const b = getProductCostBreakdown(p);
      const unitLanded = Number(b.unitLanded ?? b.baseCost) || 0;
      const overhead = (Number(b.packaging) || 0) + (Number(b.gift) || 0) + (Number(b.misc) || 0);
      const totalCost = Number(b.totalCost) || (unitLanded + overhead);
      const sellingPrice = Number(b.sellingPrice ?? p.sellingPrice) || 0;
      const netProfit = Number(b.netProfit) || (sellingPrice - totalCost);
      const marginPercent = Number(b.marginPercent) || (sellingPrice > 0 ? (netProfit / sellingPrice) * 100 : 0);

      return [
        p.code || 'SKU',
        p.name,
        p.category,
        formatPDFCurrency(unitLanded),
        formatPDFCurrency(overhead),
        formatPDFCurrency(totalCost),
        formatPDFCurrency(sellingPrice),
        formatPDFCurrency(netProfit),
        `${marginPercent.toFixed(1)}%`
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [['SKU', 'Product Name', 'Category', 'Landed Cost', 'Overhead', 'Total Cost', 'Selling Price', 'Net Profit/Unit', 'Margin %']],
      body: productPricingRows,
      theme: 'grid',
      headStyles: {
        fillColor: palette.primary,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7,
        halign: 'left'
      },
      styles: {
        fontSize: 6.5,
        cellPadding: 1.8,
        textColor: [51, 65, 85]
      },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { fontStyle: 'bold' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right', fontStyle: 'bold' },
        6: { halign: 'right', fontStyle: 'bold' },
        7: { halign: 'right', fontStyle: 'bold', textColor: [21, 128, 61] },
        8: { halign: 'right', fontStyle: 'bold', textColor: palette.dark }
      },
      margin: { left: 14, right: 14 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;

    // Combo Bundles Table if any combos exist
    if (combos.length > 0) {
      checkNewPage(35);

      const comboRows = combos.map(c => {
        const b = getComboCostBreakdown(c);
        const grossProfit = b.netProfit;
        const itemsDescription = (b.itemDetails || [])
          .map((detail: any) => `${detail.qty}x ${detail.name}`)
          .join(', ');
        const customerSavings =
          b.itemsTotalSelling > b.finalSellingPrice
            ? b.itemsTotalSelling - b.finalSellingPrice
            : 0;

        return [
          c.name,
          `${c.items.length} items (${itemsDescription})`,
          formatPDFCurrency(b.totalCost),
          formatPDFCurrency(b.finalSellingPrice),
          formatPDFCurrency(grossProfit),
          `${b.marginPercent.toFixed(1)}%`,
          formatPDFCurrency(customerSavings)
        ];
      });

      autoTable(doc, {
        startY: currentY,
        head: [['Bundle Combo Name', 'Included Items', 'Total Cost', 'Bundle Price', 'Profit/Bundle', 'Margin %', 'Customer Savings']],
        body: comboRows,
        theme: 'grid',
        headStyles: {
          fillColor: palette.dark,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 7,
          halign: 'left'
        },
        styles: {
          fontSize: 6.5,
          cellPadding: 1.8,
          textColor: [51, 65, 85]
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { fontSize: 6 },
          2: { halign: 'right' },
          3: { halign: 'right', fontStyle: 'bold' },
          4: { halign: 'right', fontStyle: 'bold', textColor: [21, 128, 61] },
          5: { halign: 'right', fontStyle: 'bold', textColor: palette.medium },
          6: { halign: 'right' }
        },
        margin: { left: 14, right: 14 }
      });

      currentY = (doc as any).lastAutoTable.finalY + 6;
    }
  }

  // =========================================================================
  // 5. SALES CHANNEL BREAKDOWN & ATTRIBUTION
  // =========================================================================
  if (options.reportType === 'full' || options.reportType === 'executive' || options.reportType === 'financials') {
    checkNewPage(40);

    const channelStats: Record<string, { count: number; revenue: number; profit: number }> = {};
    sales.forEach(s => {
      const ch = s.channel || 'Direct / Walk-In';
      if (!channelStats[ch]) channelStats[ch] = { count: 0, revenue: 0, profit: 0 };
      const qty = Number(s.qty) || 0;
      const unitPrice = Number(s.sellingPrice) || 0;
      const rev = qty * unitPrice;
      let cost = 0;
      if (s.type === 'single') {
        const prod = products.find(p => p.id === s.itemId);
        if (prod) cost = getProductCostBreakdown(prod).totalCost * qty;
      } else {
        const cmb = combos.find(c => c.id === s.itemId);
        if (cmb) cost = getComboCostBreakdown(cmb).totalCost * qty;
      }
      channelStats[ch].count += qty;
      channelStats[ch].revenue += rev;
      channelStats[ch].profit += (rev - cost);
    });

    const channelRows = Object.entries(channelStats).map(([channel, stat]) => {
      const share = metrics.totalRevenue > 0 ? (stat.revenue / metrics.totalRevenue) * 100 : 0;
      const chMargin = stat.revenue > 0 ? (stat.profit / stat.revenue) * 100 : 0;
      return [
        channel,
        `${stat.count} units`,
        formatPDFCurrency(stat.revenue),
        `${share.toFixed(1)}%`,
        formatPDFCurrency(stat.profit),
        `${chMargin.toFixed(1)}%`
      ];
    });

    if (channelRows.length > 0) {
      drawSectionHeader('SALES CHANNEL BREAKDOWN & ATTRIBUTION');

      autoTable(doc, {
        startY: currentY,
        head: [['Sales Channel', 'Volume', 'Total Revenue', 'Rev Share', 'Net Profit', 'Margin %']],
        body: channelRows,
        theme: 'grid',
        headStyles: {
          fillColor: palette.primary,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 7.5,
          halign: 'left'
        },
        styles: {
          fontSize: 7,
          cellPadding: 2,
          textColor: [51, 65, 85]
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { halign: 'right' },
          2: { halign: 'right', fontStyle: 'bold' },
          3: { halign: 'right' },
          4: { halign: 'right', textColor: [21, 128, 61], fontStyle: 'bold' },
          5: { halign: 'right', textColor: palette.dark, fontStyle: 'bold' }
        },
        margin: { left: 14, right: 14 }
      });

      currentY = (doc as any).lastAutoTable.finalY + 6;
    }
  }

  // =========================================================================
  // 6. COMPREHENSIVE SALES TRANSACTIONS LEDGER
  // =========================================================================
  if (options.reportType === 'full' || options.reportType === 'sales') {
    checkNewPage(45);

    drawSectionHeader('COMPREHENSIVE SALES TRANSACTIONS LEDGER');

    const salesRows = sales.map(s => {
      let itemName = 'Unknown';
      let unitCost = 0;
      if (s.type === 'single') {
        const prod = products.find(p => p.id === s.itemId);
        if (prod) {
          itemName = prod.name;
          unitCost = getProductCostBreakdown(prod).totalCost;
        }
      } else {
        const cmb = combos.find(c => c.id === s.itemId);
        if (cmb) {
          itemName = cmb.name;
          unitCost = getComboCostBreakdown(cmb).totalCost;
        }
      }

      const qty = Number(s.qty) || 0;
      const unitPrice = Number(s.sellingPrice) || 0;
      const totalRev = qty * unitPrice;
      const netProfit = (unitPrice - unitCost) * qty;

      return [
        s.date,
        s.id,
        itemName,
        s.type === 'combo' ? 'Bundle' : 'Single',
        s.customer || 'Direct',
        s.channel || 'Direct',
        qty.toString(),
        formatPDFCurrency(unitPrice),
        formatPDFCurrency(totalRev),
        formatPDFCurrency(netProfit)
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [['Date', 'ID', 'Item Description', 'Type', 'Customer', 'Channel', 'Qty', 'Unit Price', 'Total Rev', 'Net Profit']],
      body: salesRows,
      theme: 'striped',
      headStyles: {
        fillColor: palette.dark,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7,
        halign: 'left'
      },
      styles: {
        fontSize: 6.5,
        cellPadding: 1.8,
        textColor: [51, 65, 85]
      },
      columnStyles: {
        0: { fontStyle: 'normal' },
        1: { fontStyle: 'bold' },
        2: { fontStyle: 'bold' },
        6: { halign: 'right' },
        7: { halign: 'right' },
        8: { halign: 'right', fontStyle: 'bold' },
        9: { halign: 'right', fontStyle: 'bold', textColor: [21, 128, 61] }
      },
      margin: { left: 14, right: 14 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;
  }

  // =========================================================================
  // 7. INVENTORY VALUATION & WORKING CAPITAL STATUS
  // =========================================================================
  if (options.reportType === 'full' || options.reportType === 'inventory' || options.reportType === 'financials') {
    checkNewPage(45);

    drawSectionHeader(
      options.reportType === 'inventory'
        ? 'PRODUCT CATALOG & INVENTORY AUDIT'
        : 'INVENTORY ASSET VALUATION & WORKING CAPITAL STATUS'
    );

    const inventoryRows = inventoryList.map(st => {
      const p = st.product;
      const breakdown = getProductCostBreakdown(p);
      let statusStr = 'Optimal';
      if (st.currentStock <= 0) statusStr = 'OUT OF STOCK';
      else if (st.currentStock <= st.lowStockThreshold) statusStr = 'LOW STOCK';

      return [
        p.code,
        p.name,
        p.category,
        `${st.totalStockedIn} pcs`,
        `${st.totalSold} pcs`,
        `${st.currentStock} pcs`,
        formatPDFCurrency(breakdown.totalCost),
        formatPDFCurrency(p.sellingPrice),
        `${breakdown.marginPercent.toFixed(1)}%`,
        formatPDFCurrency(st.totalStockCostValue),
        statusStr
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [['SKU', 'Product Name', 'Category', 'Stock In', 'Sold', 'On Hand', 'Unit Cost', 'Sell Price', 'Margin %', 'Asset Value', 'Status']],
      body: inventoryRows,
      theme: 'grid',
      headStyles: {
        fillColor: palette.primary,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7,
        halign: 'left'
      },
      styles: {
        fontSize: 6.5,
        cellPadding: 1.8,
        textColor: [51, 65, 85]
      },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { fontStyle: 'bold' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right', fontStyle: 'bold' },
        6: { halign: 'right' },
        7: { halign: 'right' },
        8: { halign: 'right' },
        9: { halign: 'right', fontStyle: 'bold', textColor: palette.dark },
        10: { halign: 'center', fontStyle: 'bold' }
      },
      margin: { left: 14, right: 14 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;
  }

  // =========================================================================
  // 8. OPTIONAL BUSINESS NOTES OR AUDIT DECLARATION
  // =========================================================================
  if (options.notes && options.notes.trim()) {
    checkNewPage(25);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text('EXECUTIVE & AUDIT NOTES:', 14, currentY);
    currentY += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const splitNotes = doc.splitTextToSize(options.notes, pageWidth - 28);
    doc.text(splitNotes, 14, currentY);
    currentY += splitNotes.length * 3.5 + 4;
  }

  // =========================================================================
  // 9. FOOTER ON EVERY PAGE (With active theme branding)
  // =========================================================================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(palette.border[0], palette.border[1], palette.border[2]);
    doc.setLineWidth(0.4);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      `${brandName} • Confidential Financial Record • GLOW & CARE (${palette.name} Edition)`,
      14,
      pageHeight - 7
    );
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - 14,
      pageHeight - 7,
      { align: 'right' }
    );
  }

  // Generate filename with sanitized prefix
  const sanitize = (str: string) => str.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  const dateStamp = new Date().toISOString().slice(0, 10);
  const fileName = `${sanitize(brandName)}_financial_report_${options.reportType}_${dateStamp}.pdf`;

  // Download PDF file
  doc.save(fileName);
  return fileName;
};
