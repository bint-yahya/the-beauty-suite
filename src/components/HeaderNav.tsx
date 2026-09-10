import React, { useState, useRef, useEffect } from 'react';
import {
  BarChart3,
  ShoppingBag,
  Package,
  DollarSign,
  Truck,
  Tag,
  Plus,
  HelpCircle,
  User,
  LogOut,
  Trash2,
  Sparkles,
  ChevronDown,
  ShieldCheck,
  Compass,
  FileText,
  Download,
  Palette,
  Check,
  Menu,
  X
} from 'lucide-react';
import { UserProfile } from '../lib/auth';
import { AccentPresetId, ACCENT_PRESETS } from '../lib/theme';

export type ActiveTabType =
  | 'dashboard'
  | 'sales'
  | 'inventory'
  | 'costing'
  | 'stockin'
  | 'products'
  | 'help';

interface HeaderNavProps {
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  onOpenRecordSale: () => void;
  onOpenStockIn: () => void;
  onOpenExportReport: () => void;
  salesCount: number;
  hasLowStockAlert: boolean;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onStartTour: () => void;
  currentPreset?: AccentPresetId;
  onSelectPreset?: (presetId: AccentPresetId) => void;
  onOpenSettings?: () => void;
  onOpenDeleteAccount?: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenRecordSale,
  onOpenStockIn,
  onOpenExportReport,
  salesCount,
  hasLowStockAlert,
  currentUser,
  onOpenAuth,
  onLogout,
  onStartTour,
  currentPreset = 'soft-pink',
  onSelectPreset,
  onOpenSettings,
  onOpenDeleteAccount
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const activePresetConfig = ACCENT_PRESETS[currentPreset] || ACCENT_PRESETS['soft-pink'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowUserMenu(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const navItems = [
    { id: 'dashboard' as const, label: '360° Dashboard', icon: BarChart3 },
    { id: 'sales' as const, label: 'Sales Log', icon: ShoppingBag, count: salesCount },
    { id: 'inventory' as const, label: 'Live Inventory', icon: Package, alert: hasLowStockAlert },
    { id: 'costing' as const, label: 'Costing & Combos', icon: DollarSign },
    { id: 'stockin' as const, label: 'Stock In Batches', icon: Truck },
    { id: 'products' as const, label: 'Product Master', icon: Tag },
    { id: 'help' as const, label: 'Help & Tutorial', icon: HelpCircle, isNew: true }
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 bg-gradient-to-tr from-pink-500 via-pink-600 to-fuchsia-500 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-xs shadow-pink-300 shrink-0">
              G
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-sm sm:text-lg font-bold tracking-tight text-slate-800 truncate">
                  GLOW & CARE
                </span>
                <span className="text-[9px] sm:text-[10px] lowercase font-bold tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200 shrink-0">
                  the beauty suite
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block truncate">
                {currentUser?.brandName
                  ? `${currentUser.brandName} • Operations & Costing`
                  : 'the beauty suite • 360° Operations, Batch Costing & Inventory Tracker'}
              </p>
            </div>
          </div>

          {/* Quick Action & User Auth Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Guided Tour - Desktop only */}
            <button
              id="btn-take-tour-top"
              onClick={onStartTour}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-200/90 rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <Compass className="w-3.5 h-3.5 text-pink-600" />
              <span>Guided Tour</span>
            </button>

            {/* PDF Export Trigger - Tablet / Desktop */}
            <button
              id="btn-export-pdf-top"
              onClick={onOpenExportReport}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-pink-50/70 border border-slate-200 hover:border-pink-300 rounded-xl shadow-2xs transition-all cursor-pointer"
              title="Export Formatted PDF Report for Record Keeping"
            >
              <FileText className="w-4 h-4 text-pink-600" />
              <span>Export PDF</span>
            </button>

            {/* Record Sale Primary CTA */}
            <button
              id="btn-record-sale-top"
              onClick={onOpenRecordSale}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-pink-500 hover:bg-pink-600 rounded-xl shadow-xs shadow-pink-300 transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Record Sale</span>
              <span className="sm:hidden">Sale</span>
            </button>

            {/* Stock In Button - Tablet / Desktop */}
            <button
              id="btn-stock-in-batch-top"
              onClick={onOpenStockIn}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white hover:bg-pink-50/50 border border-slate-200 hover:border-pink-200 rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              <Truck className="w-4 h-4 text-pink-500" />
              <span>Stock In</span>
            </button>

            {/* User Account Button & Dropdown */}
            {currentUser ? (
              <div className="relative" ref={menuRef}>
                <button
                  id="btn-user-profile-menu"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 hover:border-pink-300 hover:bg-pink-50/40 transition-all cursor-pointer"
                  title="User Profile and Menu"
                >
                  <div
                    className={`w-7 h-7 rounded-lg text-white font-bold text-xs flex items-center justify-center ${
                      currentUser.avatarColor || 'bg-pink-500'
                    }`}
                  >
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden lg:block text-left text-xs">
                    <span className="font-bold text-slate-800 block leading-tight">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block leading-tight">
                      {currentUser.brandName}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-3 border-b border-slate-100 bg-pink-50/60 rounded-xl mb-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-xs text-slate-800">{currentUser.name}</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-pink-100 text-pink-700">
                          {currentUser.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      <p className="text-[10px] text-pink-600 font-medium mt-1">
                        {currentUser.brandName}
                      </p>
                    </div>

                    <div className="space-y-0.5 text-xs font-medium text-slate-700">
                      {/* Theme Presets & User Settings Option */}
                      <button
                        id="btn-user-settings-menu"
                        onClick={() => {
                          setShowUserMenu(false);
                          if (onOpenSettings) onOpenSettings();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-pink-50 hover:text-pink-700 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Palette className="w-4 h-4 text-pink-500" />
                          <span>Theme & Accent Presets</span>
                        </div>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-pink-200 bg-pink-50 text-pink-700 flex items-center gap-1"
                        >
                          <span
                            className="w-2 h-2 rounded-full inline-block"
                            style={{ backgroundColor: activePresetConfig.primaryColor }}
                          />
                          {activePresetConfig.name}
                        </span>
                      </button>

                      {/* Quick Accent Switcher Row */}
                      <div className="px-3 py-2 bg-slate-50/80 rounded-xl my-1 border border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Girly Accent Presets
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {activePresetConfig.name}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(['soft-pink', 'lavender', 'peach'] as AccentPresetId[]).map((presetKey) => {
                            const p = ACCENT_PRESETS[presetKey];
                            const isSelected = currentPreset === presetKey;
                            return (
                              <button
                                key={presetKey}
                                id={`btn-quick-theme-${presetKey}`}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onSelectPreset) onSelectPreset(presetKey);
                                }}
                                className={`flex items-center justify-center gap-1 px-1.5 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-white border-slate-800 text-slate-900 shadow-2xs font-bold'
                                    : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300'
                                }`}
                                title={`Switch to ${p.name}`}
                              >
                                <span
                                  className="w-2.5 h-2.5 rounded-full shadow-2xs inline-block"
                                  style={{ backgroundColor: p.primaryColor }}
                                />
                                <span className="truncate">{p.name.split(' ')[0]}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setActiveTab('help');
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-pink-50 hover:text-pink-700 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <HelpCircle className="w-4 h-4 text-pink-500" />
                        <span>Tutorials & Help Center</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenExportReport();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-pink-50 hover:text-pink-700 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <FileText className="w-4 h-4 text-pink-500" />
                        <span>Export Business PDF Report</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onStartTour();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-pink-50 hover:text-pink-700 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Sparkles className="w-4 h-4 text-pink-500" />
                        <span>Restart Guided Tour</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenAuth();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        <span>Switch User Account</span>
                      </button>

                      <div className="border-t border-slate-100 my-1" />

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 flex items-center gap-2 cursor-pointer transition-colors font-semibold"
                      >
                        <LogOut className="w-4 h-4 text-slate-500" />
                        <span>Log Out</span>
                      </button>

                      {onOpenDeleteAccount && (
                        <button
                          id="btn-header-delete-account"
                          onClick={() => {
                            setShowUserMenu(false);
                            onOpenDeleteAccount();
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer transition-colors font-medium"
                        >
                          <Trash2 className="w-4 h-4 text-rose-500" />
                          <span>Delete Account</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  id="btn-theme-settings-guest"
                  onClick={onOpenSettings}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-pink-50/70 border border-slate-200 hover:border-pink-300 rounded-xl shadow-2xs transition-all cursor-pointer"
                  title="Theme & Accent Color Presets"
                >
                  <Palette className="w-3.5 h-3.5 text-pink-500" />
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: activePresetConfig.primaryColor }}
                  />
                  <span className="hidden sm:inline">{activePresetConfig.name}</span>
                </button>
                <button
                  id="btn-sign-in-top"
                  onClick={onOpenAuth}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-200/80 rounded-xl transition-all cursor-pointer shadow-2xs shrink-0"
                >
                  <User className="w-4 h-4 text-pink-500" />
                  <span className="hidden sm:inline">Sign In / Sign Up</span>
                  <span className="sm:hidden">Sign In</span>
                </button>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              id="btn-mobile-menu-toggle"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="md:hidden flex items-center justify-center p-2 rounded-xl border border-slate-200 text-slate-700 hover:text-pink-600 hover:bg-pink-50/70 hover:border-pink-300 transition-all cursor-pointer shrink-0"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-pink-600" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Primary Navigation Tabs (Desktop: visible; Mobile: collapsed into hamburger menu) */}
        <div className="hidden md:flex gap-1 border-t border-slate-100 py-1.5 overflow-x-auto no-scrollbar scroll-smooth touch-pan-x">
          {navItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 sm:px-3.5 text-xs sm:text-sm font-medium rounded-xl whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-pink-50 text-pink-700 font-semibold border border-pink-200'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-pink-50/30'
                }`}
              >
                <div
                  className={`w-1.5 h-3.5 rounded-full transition-colors ${
                    isActive ? 'bg-pink-500' : 'bg-transparent'
                  }`}
                />
                <Icon className={`w-4 h-4 ${isActive ? 'text-pink-500' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.alert && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
                {tab.count !== undefined && !isActive && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-semibold">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Collapsed Mobile Hamburger Menu Drawer */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            className="md:hidden fixed inset-0 top-16 bg-slate-900/40 backdrop-blur-xs z-40 animate-in fade-in duration-150"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Dropdown Content */}
          <div
            id="mobile-navigation-drawer"
            className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-slate-200 shadow-2xl z-50 max-h-[calc(100vh-4.5rem)] overflow-y-auto animate-in slide-in-from-top-2 duration-200"
          >
            <div className="p-3.5 space-y-3.5">
              {/* Collapsed Navigation Tabs */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
                  Menu & Modules
                </div>
                <div className="space-y-1">
                  {navItems.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        id={`mobile-nav-item-${tab.id}`}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                          isActive
                            ? 'bg-pink-50 text-pink-700 font-bold border border-pink-200 shadow-2xs'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                              isActive
                                ? 'bg-pink-500 text-white shadow-xs shadow-pink-300'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="font-semibold">{tab.label}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {tab.alert && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              Low Stock
                            </span>
                          )}
                          {tab.count !== undefined && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                isActive
                                  ? 'bg-pink-200 text-pink-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {tab.count}
                            </span>
                          )}
                          {tab.isNew && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-pink-100 text-pink-700">
                              Guide
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions Shortcuts */}
              <div className="border-t border-slate-100 pt-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                  Quick Actions
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="btn-mobile-quick-record-sale"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenRecordSale();
                    }}
                    className="col-span-2 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-semibold text-xs shadow-xs shadow-pink-300 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Record New Sale</span>
                  </button>

                  <button
                    id="btn-mobile-quick-stock-in"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenStockIn();
                    }}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-pink-50 text-slate-700 hover:text-pink-700 border border-slate-200 font-semibold text-xs transition-all cursor-pointer"
                  >
                    <Truck className="w-4 h-4 text-pink-500" />
                    <span>Stock In</span>
                  </button>

                  <button
                    id="btn-mobile-quick-export-pdf"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenExportReport();
                    }}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-pink-50 text-slate-700 hover:text-pink-700 border border-slate-200 font-semibold text-xs transition-all cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-pink-600" />
                    <span>Export PDF</span>
                  </button>

                  <button
                    id="btn-mobile-quick-guided-tour"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onStartTour();
                    }}
                    className="col-span-2 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-pink-50/70 hover:bg-pink-100 text-pink-700 border border-pink-200/90 font-semibold text-xs transition-all cursor-pointer"
                  >
                    <Compass className="w-4 h-4 text-pink-600" />
                    <span>Start Guided Interactive Tour</span>
                  </button>
                </div>
              </div>

              {/* Theme & Accent Switcher inside mobile drawer */}
              <div className="border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Theme Accent Preset
                  </span>
                  <span className="text-[10px] text-pink-600 font-bold">
                    {activePresetConfig.name}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['soft-pink', 'lavender', 'peach'] as AccentPresetId[]).map((presetKey) => {
                    const p = ACCENT_PRESETS[presetKey];
                    const isSelected = currentPreset === presetKey;
                    return (
                      <button
                        key={presetKey}
                        type="button"
                        onClick={() => {
                          if (onSelectPreset) onSelectPreset(presetKey);
                        }}
                        className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white border-slate-900 text-slate-900 shadow-2xs font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                          style={{ backgroundColor: p.primaryColor }}
                        />
                        <span className="truncate">{p.name.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* User Account / Profile inside mobile drawer */}
              <div className="border-t border-slate-100 pt-3 pb-1">
                {currentUser ? (
                  <div className="bg-pink-50/60 border border-pink-100 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg text-white font-bold text-xs flex items-center justify-center shrink-0 ${
                            currentUser.avatarColor || 'bg-pink-500'
                          }`}
                        >
                          {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-xs text-slate-800 block truncate">
                            {currentUser.name}
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate">
                            {currentUser.brandName || currentUser.email}
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-pink-100 text-pink-700 shrink-0">
                        {currentUser.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-pink-100/80">
                      {onOpenSettings && (
                        <button
                          onClick={() => {
                            setMobileMenuOpen(false);
                            onOpenSettings();
                          }}
                          className="flex-1 text-center py-1.5 px-2 rounded-lg bg-white border border-pink-200 text-xs font-semibold text-slate-700 hover:bg-pink-50 cursor-pointer"
                        >
                          Settings
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onLogout();
                        }}
                        className="flex-1 text-center py-1.5 px-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        Log Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-pink-600" />
                    <span>Sign In / Create Account</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Mobile Sticky Bottom Navigation Bar (Phone optimized) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1 px-1 flex items-center justify-around shadow-lg safe-area-inset-bottom"
      >
        {[
          { id: 'dashboard' as const, label: 'Dashboard', icon: BarChart3 },
          { id: 'sales' as const, label: 'Sales', icon: ShoppingBag, count: salesCount },
          { id: 'inventory' as const, label: 'Inventory', icon: Package, alert: hasLowStockAlert },
          { id: 'costing' as const, label: 'Costing', icon: DollarSign },
          { id: 'stockin' as const, label: 'Stock In', icon: Truck },
          { id: 'products' as const, label: 'Catalog', icon: Tag },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all relative cursor-pointer min-w-[52px] ${
                isActive
                  ? 'text-pink-600 font-bold'
                  : 'text-slate-400 hover:text-slate-700 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {item.alert && (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white animate-pulse" />
                )}
                {item.count !== undefined && item.count > 0 && !isActive && (
                  <span className="absolute -top-1 -right-2 text-[9px] px-1 rounded-full bg-pink-100 text-pink-700 font-bold">
                    {item.count > 99 ? '99+' : item.count}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 leading-none tracking-tight">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-pink-500 mt-0.5" />
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
