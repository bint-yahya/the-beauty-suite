import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  Sparkles,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Package,
  Truck,
  DollarSign,
  ShoppingBag,
  BarChart3,
  Tag,
  Search,
  ChevronDown,
  ChevronUp,
  Calculator,
  ShieldCheck,
  Zap,
  Info,
  Layers,
  FileText,
  RefreshCw,
  Sliders,
  Check,
  TrendingUp,
  Gift,
  CreditCard,
  Hash,
  AlertCircle
} from 'lucide-react';
import { formatNaira, InventoryStockItem } from '../types';

export interface HelpViewProps {
  onNavigateTab: (tab: any) => void;
  onOpenRecordSale: () => void;
  onOpenStockIn: () => void;
  onOpenAddProduct: () => void;
  onOpenAddCombo: () => void;
  productsCount: number;
  batchesCount: number;
  combosCount: number;
  salesCount: number;
  inventoryList?: InventoryStockItem[];
}

type HelpActiveTab = 'tutorials' | 'glossary' | 'tally' | 'simulator' | 'faq';

export const HelpView: React.FC<HelpViewProps> = ({
  onNavigateTab,
  onOpenRecordSale,
  onOpenStockIn,
  onOpenAddProduct,
  onOpenAddCombo,
  productsCount,
  batchesCount,
  combosCount,
  salesCount,
  inventoryList = []
}) => {
  const [activeHelpTab, setActiveHelpTab] = useState<HelpActiveTab>('tutorials');
  const [activeTutorialStep, setActiveTutorialStep] = useState(0);
  const [globalSearch, setGlobalSearch] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [selectedGlossaryCategory, setSelectedGlossaryCategory] = useState<string>('all');

  // Real-time live tally computations from passed inventoryList
  const liveTallyStats = useMemo(() => {
    const totalStocked = inventoryList.reduce((acc, it) => acc + (it.totalStockedIn || 0), 0);
    const totalSold = inventoryList.reduce((acc, it) => acc + (it.totalSold || 0), 0);
    const totalGifted = inventoryList.reduce((acc, it) => acc + (it.totalGifted || 0), 0);
    const totalOnHand = inventoryList.reduce((acc, it) => acc + (it.currentStock || 0), 0);
    const totalValuation = inventoryList.reduce((acc, it) => acc + (it.totalStockCostValue || 0), 0);
    const isPerfectMatch = totalStocked - (totalSold + totalGifted) === totalOnHand;

    return {
      totalStocked,
      totalSold,
      totalGifted,
      totalOnHand,
      totalValuation,
      isPerfectMatch
    };
  }, [inventoryList]);

  // Interactive Landed Cost & Profit Sandbox State
  const [simBatchDelivery, setSimBatchDelivery] = useState(15000);
  const [simQty, setSimQty] = useState(50);
  const [simBaseCost, setSimBaseCost] = useState(1200);
  const [simPackaging, setSimPackaging] = useState(250);
  const [simGiftCost, setSimGiftCost] = useState(150);
  const [simSelling, setSimSelling] = useState(3500);

  const simDeliveryPerUnit = simQty > 0 ? simBatchDelivery / simQty : 0;
  const simTotalLanded = simBaseCost + simDeliveryPerUnit;
  const simGrossProfit = simSelling - simTotalLanded;
  const simGrossMargin = simSelling > 0 ? (simGrossProfit / simSelling) * 100 : 0;
  const simTotalUnitCost = simTotalLanded + simPackaging + simGiftCost;
  const simNetProfit = simSelling - simTotalUnitCost;
  const simNetMargin = simSelling > 0 ? (simNetProfit / simSelling) * 100 : 0;

  // Step by Step Comprehensive Tutorial Roadmap
  const tutorialSteps = [
    {
      step: 1,
      title: 'Product Master & Intelligent Auto-SKU Generator',
      tag: 'Product Master',
      icon: Tag,
      color: 'pink',
      description:
        'Every lip care formula (gloss, matte liner, lip butter, lip scrub, plumper) has a distinct identity. When creating or editing products, our smart Auto-SKU engine analyzes the category and product title to generate standardized, collision-free codes (e.g. "LG-VB-01" for Velvet Berry Lip Gloss).',
      actionText: 'Open Product Master',
      onAction: () => onNavigateTab('products'),
      keyTakeaways: [
        'Automatic SKU Prefix: Uses category identifiers like LG (Lip Gloss), LL (Lip Liner), LB (Lip Balm/Butter), LC (Lip Care/Scrub), LO (Lip Oil), LT (Lip Tint).',
        'Smart initials extraction filters out repetitive category keywords for clean, memorable product codes.',
        'Set Unit Landed Cost baseline and standard Selling Price to preview instant gross margin percentages.',
        'Products can be tagged by category for streamlined inventory filtering.'
      ]
    },
    {
      step: 2,
      title: 'Inbound Batches & Landed Cost Freight Splitting',
      tag: 'Stock In Batches',
      icon: Truck,
      color: 'blue',
      description:
        'When you receive restocks from your lab or cosmetic manufacturer, supplier delivery and interstate courier fees must be factored into product costs. The system splits the total batch delivery fee evenly across all units received in the shipment and automatically updates the product unit landed cost.',
      actionText: 'Log Inbound Batch',
      onAction: onOpenStockIn,
      keyTakeaways: [
        'Formula: Unit Landed Cost = Base Purchase Price + (Total Batch Delivery Fee ÷ Total Units across all items).',
        'Eliminates hidden courier freight losses that quietly eat away at beauty brand profit margins.',
        'Maintains a permanent audit log of supplier restock dates, invoice notes, and initial batch quantities.',
        'Tracks remaining units per batch chronologically in FIFO order.'
      ]
    },
    {
      step: 3,
      title: 'Discount Bundles & Combo Studio',
      tag: 'Costing & Combos',
      icon: DollarSign,
      color: 'emerald',
      description:
        'Boost your Average Order Value (AOV) by offering curated lip routines (e.g. Gloss & Liner Duo, Hydration Routine Trio). Bundles automatically aggregate component landed costs, add combo-specific packaging (like magnetic gift boxes), and calculate real margins with percentage or fixed naira discounts.',
      actionText: 'Create Combo Bundle',
      onAction: onOpenAddCombo,
      keyTakeaways: [
        'Combine 2 or more products into high-demand packages with custom selling prices.',
        'Choose Percentage Discount (e.g. 10% off) or Fixed Naira Discount (e.g. ₦1,000 off) against component sums.',
        'Dedicated Combo Packaging Cost: Accounts for custom gift boxes, velvet pouches, or organza bags.',
        'Live Inventory Burn: When a combo is sold, each component product stock burns down automatically.'
      ]
    },
    {
      step: 4,
      title: 'Multi-Item Sales Recording & Order Packaging',
      tag: 'Sales Log',
      icon: ShoppingBag,
      color: 'purple',
      description:
        'Customers rarely buy just one product. When recording sales, you can add multiple distinct items into a single cart-style order. You can also specify an Order Packaging Cost (mailer box, shredded paper, bubble mailer) once for the whole parcel rather than inflating per-item costs.',
      actionText: 'Record a Sale',
      onAction: onOpenRecordSale,
      keyTakeaways: [
        'Cart-Style Multi-Product Entry: Add glosses, liners, and balms with individual quantities and retail prices.',
        'Order-Level Packaging: Enter a single packaging cost for the entire package (e.g. ₦350 mailer box).',
        'Sales Channel Attribution: Tag sales from Instagram DM, WhatsApp chats, Shopify/Website, or Pop-Up markets.',
        'Repeat Last Sale Shortcut: Instantly replicate previous sales with one click for high-volume dispatch sessions.'
      ]
    },
    {
      step: 5,
      title: 'Payment & Delivery Status Management',
      tag: 'Order Tracking',
      icon: CreditCard,
      color: 'amber',
      description:
        'Track orders seamlessly from customer DM to doorstep delivery. Log payment status (Paid, Pending, Partially Paid) and delivery logistics (Delivered, Shipped, Processing, Pending, Cancelled). Update statuses directly with one click from the sales table or mobile cards.',
      actionText: 'Manage Sales Status',
      onAction: () => onNavigateTab('sales'),
      keyTakeaways: [
        'Payment Statuses: Paid (full settlement), Pending (awaiting bank transfer), Partially Paid (deposit/installment).',
        'Delivery Statuses: Delivered (completed), Shipped (in transit with courier), Processing (packing), Pending (awaiting dispatch), Cancelled (aborted).',
        'Inventory Safety for Cancelled Orders: Orders marked as Cancelled are automatically excluded from consuming stock, keeping inventory completely accurate.',
        'Quick Filters: Filter sales instantly by Payment or Delivery status to see pending dispatches or unpaid orders.'
      ]
    },
    {
      step: 6,
      title: 'Promotional Free Gifts: Catalog Stock vs Custom Swag',
      tag: 'Gifts & Freebies',
      icon: Gift,
      color: 'rose',
      description:
        'Delight beauty customers with free gifts while accurately accounting for expenses. The app distinguishes between gifting real products from your catalog versus non-inventory swag like scrunchies, branded stickers, or thank-you sweets.',
      actionText: 'Record Gift Sale',
      onAction: onOpenRecordSale,
      keyTakeaways: [
        'Catalog Product Gift: Select an existing catalog item (e.g. Vanilla Honey Balm). The app uses its unit landed cost for net profit deduction AND subtracts 1 unit from warehouse inventory.',
        'Custom Swag / Non-Inventory Freebie: Enter a custom description (e.g. "Satin Hair Scrunchie") and naira cost (e.g. ₦200). Deducts from net profit without altering product stock.',
        'Zero Blind Spots: Never wonder where promo units went or why marketing gifts eroded monthly profits.'
      ]
    },
    {
      step: 7,
      title: 'Live Inventory & FIFO Stock In Reconciliation',
      tag: 'Reconciliation',
      icon: Package,
      color: 'teal',
      description:
        'Understand exactly why and how your Stock In batches match your Live Inventory. The system operates on strict FIFO (First-In, First-Out) accounting: units are deducted from the earliest inbound delivery batches first, ensuring remaining batch units always equal live shelf stock.',
      actionText: 'Check Inventory Tally',
      onAction: () => onNavigateTab('inventory'),
      keyTakeaways: [
        'Universal Tally Equation: Live On Hand = Total Stocked In - Total Units Sold (Active Orders) - Catalog Gifts.',
        'Reconciliation Banner: Displayed in both Stock In and Live Inventory with real-time green verification badges.',
        'FIFO Batch Depletion: Earlier supplier batches are marked "Depleted" once fully consumed.',
        'Low-Stock Warning: Automatic alert triggers when stock dips below 10 units to prompt timely supplier reorders.'
      ]
    },
    {
      step: 8,
      title: '360° Financial Dashboard & PDF/CSV Export',
      tag: '360° Analytics',
      icon: BarChart3,
      color: 'indigo',
      description:
        'Get a bird’s-eye view of your brand’s health: Total Revenue, Landed COGS, Packaging & Gift Expenses, Net Profit, Blended Margins, Average Order Value (AOV), and Tied-Up Capital. Generate print-ready PDF audit reports or export CSV data for spreadsheet analysis.',
      actionText: 'Open 360° Dashboard',
      onAction: () => onNavigateTab('dashboard'),
      keyTakeaways: [
        'Time Range Presets: Analyze performance Today, Past 7 Days, This Month, Past 30 Days, or All Time.',
        'Channel Breakdown: Identify which sales channel (Instagram, WhatsApp, Website, Pop-Up) delivers the highest margins.',
        'Tied-up Capital Valuation: Monitor exact cash value locked in warehouse inventory.',
        'Export Reports: Generate comprehensive multi-page PDF executive summaries or clean CSV spreadsheets anytime.'
      ]
    }
  ];

  // Comprehensive Glossary of Terms (All Necessary Business, Financial, & Inventory Terms)
  const glossaryTerms = [
    // Financial & Costing
    {
      term: 'Unit Landed Cost (ULC)',
      abbr: 'ULC',
      category: 'Financial & Costing',
      definition:
        'The total direct cost incurred to get a single finished product onto your shelf ready for sale. It equals the supplier purchase price plus an allocated share of the shipment delivery or freight courier fee.',
      formula: 'Unit Landed Cost = Base Supplier Cost + (Total Batch Delivery Fee ÷ Total Units in Batch)',
      example: 'If 50 lip glosses cost ₦1,000 each to manufacture and courier freight is ₦15,000 (₦300/unit), the Unit Landed Cost is ₦1,300.'
    },
    {
      term: 'Selling Price (Retail Price)',
      abbr: 'RRP',
      category: 'Financial & Costing',
      definition:
        'The amount charged to the end customer per product or combo bundle before any discounts or delivery charges.',
      formula: 'Revenue = Selling Price × Quantity Sold',
      example: 'Velvet Berry Lip Gloss sells at ₦3,500 retail.'
    },
    {
      term: 'Cost of Goods Sold (COGS)',
      abbr: 'COGS',
      category: 'Financial & Costing',
      definition:
        'The accumulated landed cost of all inventory units sold during a given time period or in a specific sales order.',
      formula: 'COGS = Sum of (Quantity Sold × Unit Landed Cost)',
      example: 'Selling 10 units with a ₦1,250 landed cost results in ₦12,500 COGS.'
    },
    {
      term: 'Gross Profit',
      abbr: 'GP',
      category: 'Financial & Costing',
      definition:
        'The profit generated purely from product sales markup before deducting order packaging, promotional gifts, or operational overheads.',
      formula: 'Gross Profit = Total Revenue - COGS',
      example: '₦35,000 Revenue minus ₦12,500 COGS = ₦22,500 Gross Profit.'
    },
    {
      term: 'Gross Profit Margin (%)',
      abbr: 'GPM',
      category: 'Financial & Costing',
      definition:
        'The percentage of sales revenue remaining after paying for the landed cost of goods sold. Demonstrates basic product markup power.',
      formula: 'Gross Margin % = (Gross Profit ÷ Total Revenue) × 100',
      example: '(₦22,500 ÷ ₦35,000) × 100 = 64.3% Gross Margin.'
    },
    {
      term: 'Order Packaging Cost',
      abbr: 'PKG',
      category: 'Financial & Costing',
      definition:
        'The direct cost of materials used to package a customer order for delivery, including custom mailer boxes, bubble wrap, shredded filler, thank-you cards, and thermal shipping labels.',
      formula: 'Deducted directly from Gross Profit to determine Net Profit.',
      example: '₦350 per customer parcel regardless of whether they ordered 1 or 3 lip glosses.'
    },
    {
      term: 'Gift Cost (Promotional Freebie)',
      abbr: 'GIFT',
      category: 'Financial & Costing',
      definition:
        'The expense absorbed by the business when providing a complimentary item to delight the customer. Can be a catalog product landed cost or custom swag purchase cost.',
      formula: 'Catalog Gift Cost = Landed Cost × Qty | Swag Cost = Custom Swag Cost',
      example: 'Adding a free lip scrub sample (₦950 landed cost) or a branded scrunchie (₦200).'
    },
    {
      term: 'Net Profit',
      abbr: 'NP',
      category: 'Financial & Costing',
      definition:
        'Your actual bottom-line business take-home profit from an order or period after accounting for product landed costs, order packaging, and promotional gift expenses.',
      formula: 'Net Profit = Revenue - COGS - Order Packaging Cost - Gift Cost',
      example: '₦3,500 Revenue - ₦1,250 Landed Cost - ₦250 Packaging - ₦100 Gift = ₦1,900 Net Profit.'
    },
    {
      term: 'Net Profit Margin (%)',
      abbr: 'NPM',
      category: 'Financial & Costing',
      definition:
        'The percentage of every naira earned that turns into true net profit. The ultimate indicator of your cosmetic business commercial health.',
      formula: 'Net Margin % = (Net Profit ÷ Total Revenue) × 100',
      example: '(₦1,900 ÷ ₦3,500) × 100 = 54.3% Net Margin.'
    },
    {
      term: 'Average Order Value (AOV)',
      abbr: 'AOV',
      category: 'Financial & Costing',
      definition:
        'The average monetary amount spent by a customer every time they place an order with your brand. Increasing AOV directly drives higher net profit without needing extra ad spend.',
      formula: 'AOV = Total Sales Revenue ÷ Total Number of Completed Orders',
      example: '₦350,000 total revenue across 70 orders gives an AOV of ₦5,000.'
    },
    {
      term: 'Inventory Valuation (Tied-up Capital)',
      abbr: 'CAP',
      category: 'Financial & Costing',
      definition:
        'The total monetary investment currently locked up in physical inventory sitting in your warehouse or beauty studio.',
      formula: 'Inventory Valuation = Sum of (Current On-Hand Stock × Unit Landed Cost)',
      example: '450 units on shelf at an average ₦1,100 landed cost = ₦495,000 tied-up capital.'
    },

    // Inventory & Batch Operations
    {
      term: 'Stock In / Inbound Restock Batch',
      abbr: 'BATCH',
      category: 'Inventory & Operations',
      definition:
        'A documented delivery received from a beauty manufacturer, supplier, or formulating laboratory containing restock quantities and an invoice delivery freight fee.',
      formula: 'Recorded with Supplier Name, Date, Items Qty, Purchase Price, and Courier Fee.',
      example: 'Batch BAT-2024-001: 50 units Velvet Berry + 40 units Hydra Glow with ₦15,000 freight.'
    },
    {
      term: 'FIFO (First-In, First-Out)',
      abbr: 'FIFO',
      category: 'Inventory & Operations',
      definition:
        'An inventory management and cost accounting principle where the oldest stock units received into the warehouse are treated as being sold first.',
      formula: 'Sales deplete Batch 1 until remaining = 0, then automatically burn Batch 2.',
      example: 'Ensures that earlier batches with older delivery costs are audited and depleted first.'
    },
    {
      term: 'Live Inventory (On Hand Stock)',
      abbr: 'ON-HAND',
      category: 'Inventory & Operations',
      definition:
        'The actual physical quantity of units sitting on warehouse shelves right now ready to be packed and dispatched to paying customers.',
      formula: 'Live On Hand = Inbound Stocked In - Total Sold (Active) - Total Catalog Gifts',
      example: '100 units stocked in - 35 units sold - 2 units gifted = 63 units live on hand.'
    },
    {
      term: 'Inventory Tally & Reconciliation',
      abbr: 'TALLY',
      category: 'Inventory & Operations',
      definition:
        'The mathematical verification that total historical inbound units received minus active sales and promo gifts exactly equals current warehouse stock without discrepancy.',
      formula: 'Stocked In - Sold - Gifted = Live On Hand (Discrepancy = 0)',
      example: 'The green "In Tally" verification badge in Stock In and Live Inventory confirms 100% balance.'
    },
    {
      term: 'Low Stock Threshold',
      abbr: 'ALERT',
      category: 'Inventory & Operations',
      definition:
        'A safety buffer limit (default 10 units) that triggers an amber alert badge when available units dip low, warning you to reorder before stockouts occur.',
      formula: 'Triggered when Current Stock <= 10 units',
      example: 'A product with 8 units displays an amber "Low Stock" warning.'
    },
    {
      term: 'Depleted Batch',
      abbr: 'DEPLETED',
      category: 'Inventory & Operations',
      definition:
        'An inbound batch where all received units have been completely exhausted through customer sales and promotional gifts.',
      formula: 'Batch Remaining Units = 0',
      example: 'Batch status changes to "Depleted" with a gray badge for clear audit segregation.'
    },
    {
      term: 'Catalog Product Gift',
      abbr: 'CAT-GIFT',
      category: 'Inventory & Operations',
      definition:
        'A complimentary product gift selected directly from your registered product catalog. It deducts 1 unit from Live Inventory and burns from batch FIFO stock.',
      formula: 'Reduces warehouse inventory AND charges unit landed cost to sale net profit.',
      example: 'Gifting a full-size Vanilla Honey Lip Balm to a VIP customer.'
    },
    {
      term: 'Custom Swag / Non-Inventory Freebie',
      abbr: 'SWAG',
      category: 'Inventory & Operations',
      definition:
        'A non-inventory complimentary promo item (satin scrunchie, thank-you candy, custom cosmetic bag) that does not exist in your product catalog.',
      formula: 'Reduces sale net profit by custom cost, but does NOT reduce product inventory.',
      example: 'Gifting a ₦200 satin scrunchie with every Valentine bundle.'
    },

    // Sales & Order Logistics
    {
      term: 'Payment Status',
      abbr: 'PAY',
      category: 'Sales & Logistics',
      definition:
        'The financial collection status of a sales transaction: Paid (full funds received), Pending (awaiting bank transfer), or Partially Paid (deposit received).',
      formula: 'Tracks revenue collection and highlights unpaid or overdue customer orders.',
      example: 'Orders made via Instagram DM with bank transfer pending verification.'
    },
    {
      term: 'Delivery Status',
      abbr: 'DELIVERY',
      category: 'Sales & Logistics',
      definition:
        'The operational fulfillment progress of a customer parcel: Delivered, Shipped, Processing, Pending, or Cancelled.',
      formula: 'Delivered = Completed | Shipped = In Transit | Cancelled = Restores Stock',
      example: 'Allows dispatch teams to quickly filter pending orders for courier pickup.'
    },
    {
      term: 'Cancelled Sale Inventory Protection',
      abbr: 'CANCEL-SAFE',
      category: 'Sales & Logistics',
      definition:
        'An automated inventory safeguard ensuring that sales marked as "Cancelled" do not consume inventory units from Live Stock or FIFO Batches.',
      formula: 'If Delivery Status === "Cancelled", Qty Sold is excluded from stock burn.',
      example: 'If a customer aborts an order, setting status to Cancelled immediately restores available stock.'
    },
    {
      term: 'Multi-Item Sale (Cart Order)',
      abbr: 'CART',
      category: 'Sales & Logistics',
      definition:
        'A single transaction containing multiple distinct products with varying quantities and prices, consolidated into one order with a single packaging fee.',
      formula: 'Total Revenue = Sum of (Item Qty × Item Unit Price)',
      example: 'Customer orders 2 lip glosses + 1 lip liner + 1 lip butter in one WhatsApp DM.'
    },
    {
      term: 'Combo Bundle',
      abbr: 'COMBO',
      category: 'Sales & Logistics',
      definition:
        'A curated package of two or more complementary beauty formulas sold together at an attractive promotional price with dedicated bundle packaging.',
      formula: 'Component stock burns automatically across all items when the combo is logged.',
      example: 'Gloss & Liner Duo (Berry Edition) containing 1 Berry Gloss + 1 Ruby Wine Liner.'
    },
    {
      term: 'Auto-SKU (Stock Keeping Unit)',
      abbr: 'SKU',
      category: 'Sales & Logistics',
      definition:
        'A standardized alphanumeric code uniquely identifying each product variant in your beauty line, generated automatically based on category and title.',
      formula: '[Category Prefix]-[Name Initials]-[Sequence Number] (e.g. LG-VB-01)',
      example: 'LG-VB-01 = Lip Gloss, Velvet Berry, Variant 01.'
    },
    {
      term: 'Sales Channel',
      abbr: 'CHANNEL',
      category: 'Sales & Logistics',
      definition:
        'The marketing, social media, or commerce touchpoint where a beauty sale originated. You can customize, add, edit, or delete any sales channels (Instagram DM, WhatsApp, Website, TikTok Shop, Pop-Up Fairs, Snapchat, Retail Walk-In) to match your exact business model.',
      formula: 'Used on the Dashboard to calculate channel-by-channel sales volume and profit.',
      example: 'Adding a "TikTok Live" or "Lekki Pop-Up" sales channel allows you to track exactly which marketing avenue delivers the most orders and profits.'
    }
  ];

  // FAQs
  const faqs = [
    {
      q: 'How do I add, edit, or delete a sales channel?',
      a: 'You can manage sales channels anytime in three quick places:\n1) Sales Tab Toolbar: Click the "Sales Channels" button at the top of the Sales Log.\n2) Record a Sale Modal: Click "Manage" next to the Sales Channel label, or select "+ Add / Manage Sales Channels..." at the bottom of the dropdown.\n3) User Settings & Theme: Open User Settings from the header profile pill and click "Manage Sales Channels".\n\nInside the channel manager, you can add new channels with custom badge colors and notes, edit existing channel names (with an option to automatically cascade and update historical sales), and safely delete unused channels. If a channel has existing sales, the system prompts you to reassign them to another channel or "Direct / Walk-In".'
    },
    {
      q: 'Why does "Stock In" not tally with "Live Inventory" on initial glance?',
      a: 'This is the most common inventory question! "Stock In" displays your cumulative inbound shipments (all units ever received from suppliers). "Live Inventory" displays units currently physically on your shelves. The exact mathematical relationship is:\n\nLive On Hand = Total Stocked In - Total Sold (in Active orders) - Total Catalog Gifts.\n\nBoth the Stock In view and Live Inventory view now feature an automated "Inventory Tally & Reconciliation" banner that confirms your historical receipts minus sales and gifts match your live stock with zero discrepancy.'
    },
    {
      q: 'What happens to inventory when an order is marked as "Cancelled"?',
      a: 'The system features automatic Cancelled Sale Inventory Protection. As soon as you set an order\'s Delivery Status to "Cancelled", its quantities are immediately excluded from all inventory deductions. The units remain in or return to your Live Stock and FIFO Batches without needing manual adjustments.'
    },
    {
      q: 'How does the system allocate batch delivery fees to calculate Unit Landed Cost?',
      a: 'When you log a supplier restock batch with a courier freight fee (e.g. ₦15,000) and multiple products (e.g. 50 glosses + 25 liners = 75 total units), the system divides the total delivery fee by the total unit count (₦15,000 ÷ 75 = ₦200/unit). This ₦200 is added to each item\'s base purchase price to establish its true Unit Landed Cost, protecting you against hidden shipping losses.'
    },
    {
      q: 'What is the difference between a "Catalog Product Gift" and a "Custom Swag" gift?',
      a: 'A Catalog Product Gift uses an actual SKU from your inventory (e.g. Vanilla Honey Lip Balm). It uses the product\'s unit landed cost to accurately deduct from the sale\'s net profit AND it subtracts 1 unit from your Live Inventory and batch FIFO stock. A Custom Swag gift is for non-inventory promotional items (e.g. satin scrunchie, thank-you sweets, stickers). You specify the cost in naira, which deducts from the sale\'s net profit, but it does NOT subtract from your product inventory.'
    },
    {
      q: 'How does Order Packaging Cost work for multi-item orders?',
      a: 'In modern cosmetic retail, packaging (mailer boxes, crinkle paper, bubble mailers, logo stickers) is spent once per package sent, not per tube. In the Record Sale modal, you specify one overall "Order Packaging Cost" (e.g. ₦350). This packaging expense is deducted from the order\'s total revenue alongside landed costs to provide your true net take-home profit.'
    },
    {
      q: 'How does the Auto-SKU generator construct product codes?',
      a: 'When you type a product name and select a category, the system builds a standardized SKU using: 1) Category Prefix: LG (Lip Gloss), LL (Lip Liner), LB (Lip Balm/Butter), LC (Lip Care/Scrub), LO (Lip Oil), LT (Lip Tint); 2) Name Initials: Extracts distinctive capitalized letters while filtering redundant words like "lip" or "gloss"; 3) Sequential Counter: Appends a 2-digit zero-padded number (e.g. -01, -02). You can also manually customize or edit the SKU anytime.'
    },
    {
      q: 'How does FIFO (First-In, First-Out) work across multiple restock batches?',
      a: 'When sales or catalog gifts occur, the system automatically checks your earliest inbound batches first. Units are deducted from Batch #1 until its remaining count reaches 0 (marking it as "Depleted"), and then excess units spill over into Batch #2. This ensures your oldest inventory investment is accounted for before newer shipments.'
    },
    {
      q: 'What happens to inventory when I sell a Combo Bundle?',
      a: 'When a Combo Bundle is recorded in the Sales Log, the system automatically burns down stock for each individual product inside the combo according to their defined recipe quantities. For example, selling 2 units of a Duo bundle with 1 gloss and 1 liner automatically deducts 2 glosses and 2 liners from your Live Inventory.'
    },
    {
      q: 'How are Gross Profit and Net Profit differentiated in the app?',
      a: 'Gross Profit is Revenue minus Landed Cost of Goods Sold (COGS). Net Profit goes much deeper: it subtracts Landed COGS, Order Packaging Costs, and Free Gift Costs. Net Profit is your real bottom-line take-home cash after all direct customer fulfillment costs are paid.'
    },
    {
      q: 'Can I export audit-ready reports for my accountant or business partners?',
      a: 'Yes! Click "Export Report" in the top navigation or in the Sales view. You can generate a multi-page, publication-grade PDF report complete with executive financial summaries, payment & delivery status logs, inventory valuations, and supplier batch histories. You can also export instant CSV spreadsheets for Excel or Google Sheets.'
    },
    {
      q: 'Can I edit or update payment and delivery statuses after recording a sale?',
      a: 'Yes! In the Sales Log, desktop users can simply click the Payment Status or Delivery Status dropdown right inside the table row to toggle between Paid/Pending/Partial or Delivered/Shipped/Processing/Cancelled. On mobile devices, status badges feature an interactive selector. You can also click the Edit (pencil) button to modify quantities, items, or customer details.'
    },
    {
      q: 'How does multi-user security and data isolation work?',
      a: 'Each brand manager account is authenticated with client-side Web Crypto SHA-256 password hashing. All products, batches, combos, and sales records are isolated to that user’s unique session. You can also customize your workspace theme with 6 curated beauty accent palettes (Berry Pink, Rose Gold, Velvet Plum, Sunset Coral, Emerald Glow) and Dark Mode.'
    }
  ];

  // Filtering for glossary and FAQ
  const filteredGlossary = glossaryTerms.filter(item => {
    const matchesCategory =
      selectedGlossaryCategory === 'all' || item.category === selectedGlossaryCategory;
    const matchesSearch =
      !globalSearch ||
      item.term.toLowerCase().includes(globalSearch.toLowerCase()) ||
      item.abbr.toLowerCase().includes(globalSearch.toLowerCase()) ||
      item.definition.toLowerCase().includes(globalSearch.toLowerCase()) ||
      item.example.toLowerCase().includes(globalSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredFaqs = faqs.filter(
    f =>
      !globalSearch ||
      f.q.toLowerCase().includes(globalSearch.toLowerCase()) ||
      f.a.toLowerCase().includes(globalSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-pink-900 via-pink-800 to-fuchsia-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-400/30 text-pink-200 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>the beauty suite • Comprehensive Operations Manual & Terminology Guide</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Master Your Beauty & Lip Care Business Economics
          </h1>
          <p className="text-sm text-pink-100/90 leading-relaxed">
            Welcome to the updated operations center. Master every term and formula: from intelligent Auto-SKUs and automated freight splitting to FIFO batch reconciliation, multi-item order packaging, and real-time payment & delivery status tracking.
          </p>

          {/* Quick System Readiness Badges */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 text-xs">
            <span className="bg-white/10 backdrop-blur-xs border border-white/15 px-3 py-1 rounded-full text-pink-100 font-medium">
              🏷️ {productsCount} Products Cataloged
            </span>
            <span className="bg-white/10 backdrop-blur-xs border border-white/15 px-3 py-1 rounded-full text-pink-100 font-medium">
              🚚 {batchesCount} Inbound Batches
            </span>
            <span className="bg-white/10 backdrop-blur-xs border border-white/15 px-3 py-1 rounded-full text-pink-100 font-medium">
              ✨ {combosCount} Curated Combos
            </span>
            <span className="bg-white/10 backdrop-blur-xs border border-white/15 px-3 py-1 rounded-full text-pink-100 font-medium">
              🛍️ {salesCount} Sales Logged
            </span>
            {inventoryList.length > 0 && (
              <span className="bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full text-emerald-200 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                Live Tally: {liveTallyStats.totalOnHand} Units on Shelf
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Global Help Search & Section Switcher Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Main Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setActiveHelpTab('tutorials')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeHelpTab === 'tutorials'
                  ? 'bg-pink-500 text-white shadow-xs shadow-pink-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step-by-Step Guides (8)</span>
            </button>

            <button
              onClick={() => setActiveHelpTab('glossary')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeHelpTab === 'glossary'
                  ? 'bg-pink-500 text-white shadow-xs shadow-pink-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Business Terms Glossary ({glossaryTerms.length})</span>
            </button>

            <button
              onClick={() => setActiveHelpTab('tally')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeHelpTab === 'tally'
                  ? 'bg-pink-500 text-white shadow-xs shadow-pink-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Stock In vs Live Tally</span>
            </button>

            <button
              onClick={() => setActiveHelpTab('simulator')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeHelpTab === 'simulator'
                  ? 'bg-pink-500 text-white shadow-xs shadow-pink-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Cost & Profit Sandbox</span>
            </button>

            <button
              onClick={() => setActiveHelpTab('faq')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeHelpTab === 'faq'
                  ? 'bg-pink-500 text-white shadow-xs shadow-pink-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>FAQs & Solutions ({faqs.length})</span>
            </button>
          </div>

          {/* Quick Search across all topics */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search terms, formulas, features..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-pink-500 transition-colors"
            />
            {globalSearch && (
              <button
                onClick={() => setGlobalSearch('')}
                className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: GUIDED WALKTHROUGHS & TUTORIAL ROADMAP                         */}
      {/* ========================================================================= */}
      {activeHelpTab === 'tutorials' && (
        <div className="space-y-6">
          {/* Quick Launch Action Cards */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-pink-600" />
                  Fast-Track Operations Action Center
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct shortcuts to perform essential operations across your beauty workspace.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-pink-50 border border-pink-100 px-3 py-1.5 rounded-xl text-xs font-semibold text-pink-700">
                <span>Active Status:</span>
                <span className="font-bold text-pink-900">
                  {productsCount} SKUs • {batchesCount} Batches • {salesCount} Orders
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-700">1. Product Master</span>
                    <span className="text-[11px] font-semibold text-pink-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {productsCount} Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Register formulas, auto-generate standard SKUs, and set retail prices.
                  </p>
                </div>
                <button
                  onClick={onOpenAddProduct}
                  className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Tag className="w-3.5 h-3.5 text-pink-600" />
                  <span>+ Add New Product</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-700">2. Inbound Batches</span>
                    <span className="text-[11px] font-semibold text-blue-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {batchesCount} Batches
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Log supplier restocks to split freight fees evenly across units.
                  </p>
                </div>
                <button
                  onClick={onOpenStockIn}
                  className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Log Stock Delivery</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-700">3. Discount Bundles</span>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {combosCount} Combos
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Build duos & trios with custom packaging and percentage discounts.
                  </p>
                </div>
                <button
                  onClick={onOpenAddCombo}
                  className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Create Combo Bundle</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-pink-50/60 border border-pink-200 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-pink-950">4. Record Sale</span>
                    <span className="text-[11px] font-semibold text-pink-700 bg-white px-2 py-0.5 rounded-md border border-pink-200">
                      {salesCount} Orders
                    </span>
                  </div>
                  <p className="text-xs text-pink-800/80 leading-relaxed">
                    Multi-item cart, order packaging, gift selection, and payment status.
                  </p>
                </div>
                <button
                  onClick={onOpenRecordSale}
                  className="w-full py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs shadow-pink-300 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Record Sale Now</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Step Carousel */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-pink-600" />
                  Interactive Operational Walkthrough Modules
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Explore how every core module in Glow & Care functions under the hood.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-medium bg-slate-100 px-3 py-1 rounded-full">
                Module {activeTutorialStep + 1} of {tutorialSteps.length}
              </span>
            </div>

            {/* Step Navigation Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {tutorialSteps.map((s, idx) => {
                const Icon = s.icon;
                const isSelected = activeTutorialStep === idx;
                return (
                  <button
                    key={s.step}
                    onClick={() => setActiveTutorialStep(idx)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-pink-500 bg-pink-50/80 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-pink-500 text-white' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        Step {s.step}
                      </span>
                      <Icon
                        className={`w-3.5 h-3.5 ${isSelected ? 'text-pink-600' : 'text-slate-400'}`}
                      />
                    </div>
                    <span
                      className={`text-[11px] font-semibold line-clamp-1 ${
                        isSelected ? 'text-pink-950' : 'text-slate-700'
                      }`}
                    >
                      {s.tag}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Step Showcase Card */}
            {(() => {
              const cur = tutorialSteps[activeTutorialStep];
              const CurIcon = cur.icon;
              return (
                <div className="bg-slate-50/90 rounded-2xl border border-slate-200 p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="p-3 bg-pink-500 text-white rounded-xl shadow-xs shrink-0">
                        <CurIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-pink-600">
                          Module {cur.step} • {cur.tag}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 mt-0.5">{cur.title}</h3>
                      </div>
                    </div>

                    <button
                      onClick={cur.onAction}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold rounded-xl shadow-xs shadow-pink-300 transition-all cursor-pointer self-start sm:self-auto"
                    >
                      <span>{cur.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {cur.description}
                  </p>

                  {/* Key Takeaways Card */}
                  <div className="bg-white rounded-xl p-4 border border-slate-200/80 space-y-2.5 shadow-2xs">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-pink-600" />
                      Operational Takeaways & Rules
                    </h4>
                    <ul className="space-y-2">
                      {cur.keyTakeaways.map((point, pidx) => (
                        <li key={pidx} className="text-xs text-slate-600 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-1.5 shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Navigation controls */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <button
                      disabled={activeTutorialStep === 0}
                      onClick={() => setActiveTutorialStep(prev => Math.max(0, prev - 1))}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-white disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                    >
                      ← Previous Module
                    </button>

                    <div className="flex gap-1.5">
                      {tutorialSteps.map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 rounded-full transition-all ${
                            activeTutorialStep === i ? 'w-6 bg-pink-500' : 'w-2 bg-slate-300'
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      disabled={activeTutorialStep === tutorialSteps.length - 1}
                      onClick={() =>
                        setActiveTutorialStep(prev => Math.min(tutorialSteps.length - 1, prev + 1))
                      }
                      className="px-3.5 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold shadow-2xs disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                    >
                      Next Module →
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: BUSINESS & INVENTORY TERMS GLOSSARY                            */}
      {/* ========================================================================= */}
      {activeHelpTab === 'glossary' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-pink-600" />
                Comprehensive Business & Inventory Glossary
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Clear explanations, exact mathematical formulas, and beauty-industry examples for all essential terms.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'All Terms' },
                { id: 'Financial & Costing', label: 'Financial & Costing' },
                { id: 'Inventory & Operations', label: 'Inventory & FIFO' },
                { id: 'Sales & Logistics', label: 'Sales & Logistics' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedGlossaryCategory(cat.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    selectedGlossaryCategory === cat.id
                      ? 'bg-pink-500 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Glossary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGlossary.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-pink-300 hover:shadow-xs transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{item.term}</h3>
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-pink-100 text-pink-700 shrink-0">
                      {item.abbr}
                    </span>
                  </div>

                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    {item.category}
                  </span>

                  <p className="text-xs text-slate-600 leading-relaxed">{item.definition}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200/70">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] font-mono text-slate-700">
                    <span className="font-bold text-pink-600 block text-[10px] uppercase font-sans mb-0.5">
                      Formula / Logic
                    </span>
                    {item.formula}
                  </div>

                  <div className="text-[11px] text-slate-500 italic bg-pink-50/50 p-2 rounded-lg border border-pink-100">
                    <span className="font-bold text-pink-800 not-italic block text-[10px] uppercase mb-0.5">
                      Real Example:
                    </span>
                    {item.example}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredGlossary.length === 0 && (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-600">No glossary terms match your search.</p>
              <p className="text-xs text-slate-400">Try clearing the search or switching category filter.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: STOCK IN VS LIVE INVENTORY TALLY EXPLAINER                     */}
      {/* ========================================================================= */}
      {activeHelpTab === 'tally' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-pink-600" />
              Stock In vs Live Inventory Tally Explainer
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Demystifying the relationship between supplier restock batches and available shelf stock.
            </p>
          </div>

          {/* The Universal Equation Card */}
          <div className="bg-gradient-to-br from-slate-900 via-pink-950 to-slate-950 text-white rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-bold tracking-wide">The Universal Inventory Tally Formula</span>
              </div>
              <span className="text-xs bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-3 py-1 rounded-full font-semibold">
                Guaranteed FIFO Zero-Discrepancy Rule
              </span>
            </div>

            <div className="py-4 text-center sm:text-left overflow-x-auto">
              <div className="inline-flex items-center gap-3 sm:gap-4 font-mono text-sm sm:text-lg font-bold">
                <div className="bg-white/10 border border-white/20 px-3.5 py-2 rounded-xl text-pink-200">
                  <span className="block text-[10px] text-pink-300 font-sans uppercase">Total Received</span>
                  Stocked In Units
                </div>
                <span className="text-pink-400 text-xl font-bold">−</span>
                <div className="bg-white/10 border border-white/20 px-3.5 py-2 rounded-xl text-amber-200">
                  <span className="block text-[10px] text-amber-300 font-sans uppercase">Active Sales</span>
                  Units Sold
                </div>
                <span className="text-pink-400 text-xl font-bold">−</span>
                <div className="bg-white/10 border border-white/20 px-3.5 py-2 rounded-xl text-rose-200">
                  <span className="block text-[10px] text-rose-300 font-sans uppercase">Promotions</span>
                  Catalog Gifts
                </div>
                <span className="text-emerald-400 text-xl font-bold">=</span>
                <div className="bg-emerald-500/20 border border-emerald-400/50 px-3.5 py-2 rounded-xl text-emerald-200">
                  <span className="block text-[10px] text-emerald-300 font-sans uppercase">Available Now</span>
                  Live On Hand Stock
                </div>
              </div>
            </div>

            {/* Real-time system check using actual user database */}
            {inventoryList.length > 0 && (
              <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-300">Your Current System Status:</span>
                  <span className="font-bold text-white">
                    {liveTallyStats.totalStocked} Stocked − {liveTallyStats.totalSold} Sold − {liveTallyStats.totalGifted} Gifted ={' '}
                    <span className="text-emerald-400">{liveTallyStats.totalOnHand} Units on Hand</span>
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/30 text-emerald-200 font-bold">
                  <Check className="w-3.5 h-3.5" />
                  <span>100% In Tally (Discrepancy: 0)</span>
                </div>
              </div>
            )}
          </div>

          {/* Deep Dive Cards: The 4 Reasons Discrepancies Historically Happened */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-pink-100 text-pink-700 font-bold text-xs flex items-center justify-center">
                  1
                </div>
                <h3 className="text-xs font-bold text-slate-800">Cumulative Receipts vs Current Shelf Stock</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                "Stock In" records the historical total of everything your laboratory or supplier has shipped over time. "Live Inventory" records only what is physically sitting in your beauty room right now. As orders are fulfilled, Live Inventory burns down while Stock In preserves your historical receiving audit.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                  2
                </div>
                <h3 className="text-xs font-bold text-slate-800">First-In, First-Out (FIFO) Batch Depletion</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                When a sale occurs, the system burns units from your earliest inbound batches first. If you received 50 units in January and 50 units in February, selling 60 units marks January as 0 (Depleted) and leaves February with 40 units remaining. The sum of all batch remaining units always matches Live Inventory.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                  3
                </div>
                <h3 className="text-xs font-bold text-slate-800">Cancelled Sales Protection</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                When a customer order is marked as "Cancelled", the system immediately ignores it from all stock depletion formulas. In older manual spreadsheets, cancelled orders often left phantom deductions. Here, cancelling an order automatically returns units to stock instantly.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                  4
                </div>
                <h3 className="text-xs font-bold text-slate-800">Catalog Product Freebies Accounting</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Giving away free products to influencers or VIP shoppers physically takes items off your shelves. By selecting a "Catalog Product Gift", the system deducts 1 unit from both Live Inventory and FIFO batches, ensuring promotional giveaways never cause missing inventory discrepancies.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: INTERACTIVE COST & PROFIT MARGIN SANDBOX                       */}
      {/* ========================================================================= */}
      {activeHelpTab === 'simulator' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-pink-600" />
              Interactive Landed Cost & Profit Margin Sandbox
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Experiment with delivery fee splitting, order packaging, and promotional gift expenses to understand bottom-line profitability.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Controls */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  1. Inbound Batch Freight Splitting
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Total Supplier Delivery Fee (₦)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={simBatchDelivery}
                      onChange={(e) => setSimBatchDelivery(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-pink-700 outline-none focus:border-pink-500"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Courier or freight fee for restock</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Total Units in Restock Batch
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={simQty}
                      onChange={(e) => setSimQty(Math.max(1, Number(e.target.value) || 1))}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-pink-500"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Allocates {formatNaira(simDeliveryPerUnit)} per unit
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  2. Unit Production, Fulfillment & Selling Price
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Base Supplier Item Cost (₦)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={simBaseCost}
                      onChange={(e) => setSimBaseCost(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-medium outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Order Packaging Material (₦)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={simPackaging}
                      onChange={(e) => setSimPackaging(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-medium outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Free Gift / Promo Swag Cost (₦)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={simGiftCost}
                      onChange={(e) => setSimGiftCost(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-medium outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Customer Selling Price (₦)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={simSelling}
                      onChange={(e) => setSimSelling(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold text-pink-700 outline-none focus:border-pink-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Output Analytics Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-pink-950 to-fuchsia-950 text-white rounded-2xl p-5 flex flex-col justify-between shadow-md space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-pink-300 block mb-3">
                  Simulated Unit Economics Breakdown
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-slate-300">Base Unit Purchase:</span>
                    <span className="font-semibold text-white">{formatNaira(simBaseCost)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-slate-300">+ Allocated Delivery / Freight:</span>
                    <span className="font-semibold text-pink-300">+{formatNaira(simDeliveryPerUnit)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-white font-bold">= True Unit Landed Cost (ULC):</span>
                    <span className="font-bold text-white">{formatNaira(simTotalLanded)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-slate-300">Gross Profit (Selling − Landed):</span>
                    <span className="font-semibold text-emerald-300">
                      {formatNaira(simGrossProfit)} ({simGrossMargin.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-slate-300">− Order Packaging & Gift:</span>
                    <span className="font-semibold text-rose-300">−{formatNaira(simPackaging + simGiftCost)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block uppercase font-bold">Net Profit per Order</span>
                  <span className="text-xl font-black text-emerald-400">{formatNaira(simNetProfit)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block uppercase font-bold">Net Margin %</span>
                  <span
                    className={`text-xl font-black ${
                      simNetMargin >= 50
                        ? 'text-emerald-400'
                        : simNetMargin >= 30
                        ? 'text-amber-400'
                        : 'text-pink-400'
                    }`}
                  >
                    {simNetMargin.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: FREQUENTLY ASKED QUESTIONS & TROUBLESHOOTING                   */}
      {/* ========================================================================= */}
      {activeHelpTab === 'faq' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-pink-600" />
              Frequently Asked Questions & Operational Troubleshooting
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant answers covering inventory reconciliation, payment statuses, packaging costs, and audit exports.
            </p>
          </div>

          <div className="space-y-3">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-xl overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 bg-slate-50/60 hover:bg-slate-50 cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                        Q
                      </span>
                      {faq.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-pink-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100 whitespace-pre-line space-y-2">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredFaqs.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400 space-y-1">
                <AlertCircle className="w-6 h-6 text-slate-300 mx-auto" />
                <p>No matching questions found for "{globalSearch}".</p>
                <p>Try searching for "tally", "landed cost", "packaging", or "status".</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
