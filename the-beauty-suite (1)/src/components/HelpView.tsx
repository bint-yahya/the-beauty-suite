import React, { useState } from 'react';
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
  Info
} from 'lucide-react';
import { formatNaira } from '../types';

interface HelpViewProps {
  onNavigateTab: (tab: any) => void;
  onOpenRecordSale: () => void;
  onOpenStockIn: () => void;
  onOpenAddProduct: () => void;
  onOpenAddCombo: () => void;
  productsCount: number;
  batchesCount: number;
  combosCount: number;
  salesCount: number;
}

export const HelpView: React.FC<HelpViewProps> = ({
  onNavigateTab,
  onOpenRecordSale,
  onOpenStockIn,
  onOpenAddProduct,
  onOpenAddCombo,
  productsCount,
  batchesCount,
  combosCount,
  salesCount
}) => {
  const [activeTutorialStep, setActiveTutorialStep] = useState(0);
  const [faqSearch, setFaqSearch] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Interactive Landed Cost Sandbox Simulator
  const [simBatchDelivery, setSimBatchDelivery] = useState(5000);
  const [simQty, setSimQty] = useState(25);
  const [simBaseCost, setSimBaseCost] = useState(1000);
  const [simPackaging, setSimPackaging] = useState(200);
  const [simSelling, setSimSelling] = useState(3500);

  const simDeliveryPerUnit = simQty > 0 ? simBatchDelivery / simQty : 0;
  const simTotalLanded = simBaseCost + simDeliveryPerUnit;
  const simTotalUnitCost = simTotalLanded + simPackaging;
  const simNetProfit = simSelling - simTotalUnitCost;
  const simMarginPct = simSelling > 0 ? (simNetProfit / simSelling) * 100 : 0;

  // Step by Step Tutorial Roadmap
  const tutorialSteps = [
    {
      step: 1,
      title: 'Cataloging Products & Base Costs',
      tag: 'Product Master',
      icon: Tag,
      color: 'indigo',
      description:
        'Every lip care formula (lip gloss, matte liner, lip butter, lip scrub) has individual cost components: unit landed cost, custom packaging tubes/boxes, free gift additions (scrunchies/candies), and retail price.',
      actionText: 'Open Product Master',
      onAction: () => onNavigateTab('products'),
      keyTakeaways: [
        'Set unit landed cost to represent baseline production or supplier pricing.',
        'Include packaging (boxes, shrink wrap, thank-you cards) and gift costs.',
        'Check real-time Gross and Net profit margin percentages before launching sales.'
      ]
    },
    {
      step: 2,
      title: 'Inbound Batch Deliveries & Landed Cost Math',
      tag: 'Stock In Batches',
      icon: Truck,
      color: 'blue',
      description:
        'When you receive restocks from your supplier or laboratory, delivery/freight fees must not be ignored. The system automatically splits the batch delivery fee evenly across every unit ordered and updates the product landed cost.',
      actionText: 'Log Inbound Batch',
      onAction: onOpenStockIn,
      keyTakeaways: [
        'Formula: Unit Landed Cost = (Supplier Item Cost ÷ Item Qty) + (Total Delivery Fee ÷ Total Batch Units).',
        'Eliminates manual spreadsheet formulas and hidden shipping losses.',
        'Maintains a permanent audit log of all supplier delivery dates and batch notes.'
      ]
    },
    {
      step: 3,
      title: 'Bundles & Discount Combo Studio',
      tag: 'Costing & Combos',
      icon: DollarSign,
      color: 'emerald',
      description:
        'Increase your Average Order Value (AOV) by offering curated lip bundles (e.g. Gloss & Liner Duo or Complete 4-Step Hydration Trio). Bundles automatically aggregate component costs and calculate exact bundle margins.',
      actionText: 'Create Combo Bundle',
      onAction: onOpenAddCombo,
      keyTakeaways: [
        'Combine 2 or more products into high-demand packages.',
        'Choose Percentage Discount (e.g. 10% off) or Fixed Naira Discount (e.g. ₦1,000 off).',
        'Add dedicated Combo Packaging costs (custom magnetic boxes or organza bags).'
      ]
    },
    {
      step: 4,
      title: 'Recording Multi-Channel Sales',
      tag: 'Sales Log',
      icon: ShoppingBag,
      color: 'purple',
      description:
        'Log orders swiftly from Instagram DM, WhatsApp chats, Shopify/Website, and Pop-up markets. Each sale captures the exact customer name, channel, quantity, and calculates net profit automatically.',
      actionText: 'Record a Sale',
      onAction: onOpenRecordSale,
      keyTakeaways: [
        'Supports both Single SKU sales and Multi-Item Combo Bundle sales.',
        'Records sales channel to analyze which platform yields highest revenue.',
        'Automatically deducts inventory units from the warehouse in real time.'
      ]
    },
    {
      step: 5,
      title: 'Live Inventory & Automated Burn-down',
      tag: 'Live Inventory',
      icon: Package,
      color: 'amber',
      description:
        'Your inventory automatically updates based on inbound batches minus sales. When a bundle combo is sold, individual stock for each component is proportionally subtracted.',
      actionText: 'Check Live Inventory',
      onAction: () => onNavigateTab('inventory'),
      keyTakeaways: [
        'Automated low-stock threshold warning (<10 units) prevents stockouts.',
        'View total tied-up capital in warehouse inventory.',
        'Filter inventory by category (Lip Gloss, Lip Liner, Lip Balm, Lip Care).'
      ]
    },
    {
      step: 6,
      title: '360° Operations Dashboard & Financial Insights',
      tag: '360° Dashboard',
      icon: BarChart3,
      color: 'slate',
      description:
        'Get a bird’s-eye view of your brand’s financial health: Total Revenue, Net Profit, Blended Margin %, Average Order Value (AOV), Sales Timeline Velocity, and Top-Selling SKUs.',
      actionText: 'View Dashboard',
      onAction: () => onNavigateTab('dashboard'),
      keyTakeaways: [
        'Adjust global time presets (Today, Past 7 Days, This Month, All Time) in the filter bar.',
        'Monitor profitability trends to discontinue low-margin products and push bestsellers.',
        'Review inventory valuation alongside net revenue.'
      ]
    }
  ];

  // Frequently Asked Questions
  const faqs = [
    {
      q: 'How does the app calculate the Landed Cost for batch orders with multiple products?',
      a: 'When you log a batch order with a total delivery fee (e.g. ₦15,000), the app calculates the sum of all product quantities in the batch. It divides the delivery fee by total units to get an allocated delivery fee per unit, which is added to the base unit purchase price. This immediately updates the landed cost in your Product Master.'
    },
    {
      q: 'What happens to product stock when I sell a Combo Bundle?',
      a: 'When a Combo Bundle is recorded in the Sales Log, the system automatically burns down stock for each individual product inside the combo according to their defined quantities. For example, selling 2 units of a Duo bundle with 1 gloss and 1 liner deducts 2 glosses and 2 liners from your Live Inventory.'
    },
    {
      q: 'What is the difference between Gross Profit and Net Profit in the app?',
      a: 'Gross Profit is calculated as Selling Price minus Unit Landed Cost. Net Profit takes a deeper look by subtracting Unit Landed Cost, Packaging costs, Free Gift costs, and Miscellaneous overheads, giving you your actual bottom-line take-home profit.'
    },
    {
      q: 'How does user authentication protect my brand data?',
      a: 'Each brand account is securely authenticated using client-side Web Crypto SHA-256 password hashing. Data for your products, batches, sales, and custom combos is isolated to your authenticated session so multiple brand managers can test or operate independently.'
    },
    {
      q: 'Can I export my sales or inventory data?',
      a: 'Yes, your data is synced in state and can be saved or deployed directly. If you connected a Google Spreadsheet or Cloud backend, date ranges and metrics sync directly with your connected data sources.'
    }
  ];

  const filteredFaqs = faqs.filter(
    f =>
      f.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-pink-900 via-pink-800 to-fuchsia-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-400/30 text-pink-200 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>the beauty suite • Operations Manual & Guided Tutorial</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Master Your Beauty & Lip Care Business Economics
          </h1>
          <p className="text-sm text-pink-100/90 leading-relaxed">
            Welcome to Glow & Care — the beauty suite. Learn how to accurately price beauty formulas and lip care bundles, log supplier restocks with automated freight splitting, and monitor real net profit margins across all sales channels.
          </p>
        </div>
      </div>

      {/* Quick Launch Checklist */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-pink-600" />
              Brand Onboarding & Readiness Checklist
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Follow these foundational steps to set up your beauty workspace.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-pink-50 border border-pink-100 px-3 py-1.5 rounded-xl text-xs font-semibold text-pink-700">
            <span>Current Status:</span>
            <span className="font-bold text-pink-900">
              {productsCount > 0 ? `${productsCount} SKUs` : 'No SKUs'} • {salesCount} Sales Logged
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-700">1. Product Catalog</span>
                <span className="text-[11px] font-semibold text-pink-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {productsCount} Active
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Register formulas, packaging tubes, and selling prices.
              </p>
            </div>
            <button
              onClick={onOpenAddProduct}
              className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Tag className="w-3.5 h-3.5 text-pink-600" />
              <span>+ Add New Product</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-700">2. Inbound Batches</span>
                <span className="text-[11px] font-semibold text-pink-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {batchesCount} Batches
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Log supplier shipments to split delivery fees across units.
              </p>
            </div>
            <button
              onClick={onOpenStockIn}
              className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5 text-pink-600" />
              <span>Log Stock Delivery</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-700">3. Record First Sale</span>
                <span className="text-[11px] font-semibold text-pink-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {salesCount} Orders
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Record single SKUs or bundle combo transactions.
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

      {/* Step-by-Step Interactive Tutorial Walkthrough */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-600" />
              Step-by-Step Feature Walkthrough
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              Step {activeTutorialStep + 1} of {tutorialSteps.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Click through each module below to understand the operational architecture.
          </p>
        </div>

        {/* Step Navigation Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {tutorialSteps.map((s, idx) => {
            const Icon = s.icon;
            const isSelected = activeTutorialStep === idx;
            return (
              <button
                key={s.step}
                onClick={() => setActiveTutorialStep(idx)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-pink-500 bg-pink-50/70 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-pink-500 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    Step {s.step}
                  </span>
                  <Icon
                    className={`w-4 h-4 ${isSelected ? 'text-pink-600' : 'text-slate-400'}`}
                  />
                </div>
                <span
                  className={`text-xs font-semibold line-clamp-1 ${
                    isSelected ? 'text-pink-950' : 'text-slate-700'
                  }`}
                >
                  {s.tag}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Step Detailed Showcase */}
        {(() => {
          const cur = tutorialSteps[activeTutorialStep];
          const CurIcon = cur.icon;
          return (
            <div className="bg-slate-50/80 rounded-2xl border border-slate-200/90 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-3 bg-pink-500 text-white rounded-xl shadow-xs shrink-0">
                    <CurIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-pink-600">
                      Module {cur.step} — {cur.tag}
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
              <div className="bg-white rounded-xl p-4 border border-slate-200/80 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-pink-600" />
                  Key Operational Guidelines
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

              {/* Step Navigation Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <button
                  disabled={activeTutorialStep === 0}
                  onClick={() => setActiveTutorialStep(prev => Math.max(0, prev - 1))}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-white disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  ← Previous Step
                </button>

                <div className="flex gap-1">
                  {tutorialSteps.map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-all ${
                        activeTutorialStep === i ? 'w-5 bg-pink-500' : 'bg-slate-300'
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
                  Next Step →
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Interactive Landed Cost Math Sandbox */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-pink-600" />
              Interactive Landed Cost & Profit Margin Sandbox
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Experiment with delivery fee splitting to understand how batch volume impacts unit profit margins.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total Delivery Fee (₦)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={simBatchDelivery}
                  onChange={(e) => setSimBatchDelivery(Number(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-pink-700 outline-none focus:bg-white focus:border-pink-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">e.g. Courier or freight to Lagos</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total Units in Batch
                </label>
                <input
                  type="number"
                  min="1"
                  value={simQty}
                  onChange={(e) => setSimQty(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-pink-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Higher units = lower freight per unit</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Base Supplier Cost (₦)
                </label>
                <input
                  type="number"
                  min="0"
                  value={simBaseCost}
                  onChange={(e) => setSimBaseCost(Number(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-medium outline-none focus:bg-white focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Packaging Cost (₦)
                </label>
                <input
                  type="number"
                  min="0"
                  value={simPackaging}
                  onChange={(e) => setSimPackaging(Number(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-medium outline-none focus:bg-white focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Selling Price (₦)
                </label>
                <input
                  type="number"
                  min="0"
                  value={simSelling}
                  onChange={(e) => setSimSelling(Number(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-pink-700 outline-none focus:bg-white focus:border-pink-500"
                />
              </div>
            </div>
          </div>

          {/* Real-time Math Output Card */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-pink-950 to-fuchsia-950 text-white rounded-2xl p-5 flex flex-col justify-between shadow-md">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-pink-300 block mb-2">
                Simulated Unit Breakdown
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-white/10">
                  <span className="text-slate-300">Allocated Delivery per Unit:</span>
                  <span className="font-semibold text-pink-200">
                    {formatNaira(simDeliveryPerUnit)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/10">
                  <span className="text-slate-300">True Landed Cost (Base + Freight):</span>
                  <span className="font-bold text-white">
                    {formatNaira(simTotalLanded)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/10">
                  <span className="text-slate-300">Total Unit Cost (w/ Packaging):</span>
                  <span className="font-bold text-white">
                    {formatNaira(simTotalUnitCost)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Net Profit per Unit</span>
                <span className="text-lg font-black text-emerald-400">
                  {formatNaira(simNetProfit)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Net Margin</span>
                <span
                  className={`text-lg font-black ${
                    simMarginPct >= 50
                      ? 'text-emerald-400'
                      : simMarginPct >= 30
                      ? 'text-amber-400'
                      : 'text-pink-400'
                  }`}
                >
                  {simMarginPct.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-pink-600" />
              Frequently Asked Questions (FAQ)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Quick answers about costing rules, bundle burns, and inventory metrics.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search help topics..."
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-pink-500"
            />
          </div>
        </div>

        <div className="space-y-2.5">
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
                  className="w-full p-3.5 text-left flex items-center justify-between gap-3 bg-slate-50/50 hover:bg-slate-50 cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-800">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-pink-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}

          {filteredFaqs.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-400">
              No matching questions found for "{faqSearch}". Try searching for "landed cost", "combos", or "inventory".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
