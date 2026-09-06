import React, { useState } from 'react';
import {
  Sparkles,
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Tag,
  Truck,
  DollarSign,
  ShoppingBag,
  Package,
  BarChart3
} from 'lucide-react';

interface InteractiveTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: any) => void;
}

export const InteractiveTour: React.FC<InteractiveTourProps> = ({
  isOpen,
  onClose,
  onNavigateTab
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const tourSteps = [
    {
      title: 'Welcome to the beauty suite',
      subtitle: 'The full-cycle operations hub for beauty & lip care cosmetics brands.',
      icon: Sparkles,
      tab: 'dashboard',
      content:
        'This suite gives you instant clarity on unit economics, supplier batch freight allocation, and real bottom-line net profit.',
      tip: 'Use the top navigation bar to seamlessly jump across views.'
    },
    {
      title: 'Product Master Catalog',
      subtitle: 'Define formulas, packaging, and gift costs.',
      icon: Tag,
      tab: 'products',
      content:
        'Every beauty SKU (gloss, liner, balm, scrub) stores base unit landed costs along with component packaging costs (boxes, shrink wrap) and free gift inserts (scrunchies, candy).',
      tip: 'The app calculates gross vs net profit margin percentages automatically.'
    },
    {
      title: 'Stock In Batches & Landed Costing',
      subtitle: 'Never lose money to hidden delivery and freight fees.',
      icon: Truck,
      tab: 'stockin',
      content:
        'When you receive restocks, enter the total delivery fee. The app distributes the freight cost across all received units and dynamically recalculates your landed cost.',
      tip: 'Your product master unit landed costs update in real time with each batch.'
    },
    {
      title: 'Combos & Discount Studio',
      subtitle: 'Curate high-AOV bundles and duo sets.',
      icon: DollarSign,
      tab: 'costing',
      content:
        'Create Lip Gloss + Liner Duos or 4-Step Care Trios. Specify custom bundle gift boxes and set percentage or fixed discounts while maintaining profitable margins.',
      tip: 'Selling a combo automatically decrements stock for each underlying item.'
    },
    {
      title: 'Multi-Channel Sales Log',
      subtitle: 'Track revenue from Snapchat, Instagram DMs, WhatsApp, Website, and Pop-ups.',
      icon: ShoppingBag,
      tab: 'sales',
      content:
        'Record orders in seconds. The app computes the exact revenue and net profit per transaction, while keeping track of customer names and order channels.',
      tip: 'Filter sales by date range, category, or specific SKU using the filter bar.'
    },
    {
      title: 'Live Inventory & Alerts',
      subtitle: 'Automated warehouse stock tracking and reorder warnings.',
      icon: Package,
      tab: 'inventory',
      content:
        'Watch your inventory burn down cleanly with each sale. Amber warning badges alert you whenever a product drops below the 10-unit threshold.',
      tip: 'View total capital value tied up in physical inventory at any moment.'
    },
    {
      title: '360° Operations Dashboard',
      subtitle: 'Real-time financial KPIs, velocity trends, and bestsellers.',
      icon: BarChart3,
      tab: 'dashboard',
      content:
        'Monitor total revenue, net profit margin %, average order value (AOV), sales timelines, and your top 5 bestselling products.',
      tip: 'Filter metrics by timeframe or category at the top of the dashboard.'
    },
    {
      title: 'Formatted Business PDF Exports',
      subtitle: 'Official record keeping, tax audits, and sales ledger documentation.',
      icon: Sparkles,
      tab: 'dashboard',
      content:
        'Generate structured, formatted PDF reports with one click from the top header or sales view. Includes executive financial scorecards, channel splits (Snapchat, IG, WhatsApp), itemized sales ledger, and inventory valuation.',
      tip: 'Click "Export PDF" in the top bar or dashboard to download your business records.'
    }
  ];

  const step = tourSteps[currentStep];
  const StepIcon = step.icon;

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      const nextIdx = currentStep + 1;
      setCurrentStep(nextIdx);
      onNavigateTab(tourSteps[nextIdx].tab);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevIdx = currentStep - 1;
      setCurrentStep(prevIdx);
      onNavigateTab(tourSteps[prevIdx].tab);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative overflow-hidden space-y-5">
        {/* Top Progress & Close Button */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-100">
              Interactive Guided Tour
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Step {currentStep + 1} of {tourSteps.length}
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Content */}
        <div className="space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-pink-500 text-white rounded-2xl shadow-xs shrink-0">
              <StepIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                {step.title}
              </h3>
              <p className="text-xs text-pink-600 font-medium mt-0.5">{step.subtitle}</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            {step.content}
          </p>

          <div className="flex items-start gap-2 bg-pink-50/70 text-pink-900 p-3 rounded-xl border border-pink-100/80 text-xs">
            <Sparkles className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
            <span>
              <strong>Pro-Tip:</strong> {step.tip}
            </span>
          </div>
        </div>

        {/* Step Dots & Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex gap-1.5">
            {tourSteps.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentStep(i);
                  onNavigateTab(tourSteps[i].tab);
                }}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentStep === i ? 'w-6 bg-pink-500' : 'w-1.5 bg-slate-200'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 rounded-xl shadow-xs shadow-pink-300 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>{currentStep === tourSteps.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
