import React from 'react';
import { Palette, Check, Sparkles, X, Sun, Moon, Eye, Trash2, LogOut, ShieldAlert, User, Tag } from 'lucide-react';
import { AccentPresetId, ACCENT_PRESETS } from '../lib/theme';
import { UserProfile } from '../lib/auth';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPreset: AccentPresetId;
  onSelectPreset: (presetId: AccentPresetId) => void;
  isDarkMode: boolean;
  onToggleDarkMode: (isDark: boolean) => void;
  currentUser: UserProfile | null;
  onOpenDeleteAccount?: () => void;
  onLogout?: () => void;
  salesChannels?: string[];
  onOpenManageChannels?: () => void;
}

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({
  isOpen,
  onClose,
  currentPreset,
  onSelectPreset,
  isDarkMode,
  onToggleDarkMode,
  currentUser,
  onOpenDeleteAccount,
  onLogout,
  salesChannels,
  onOpenManageChannels
}) => {
  if (!isOpen) return null;

  const presets = Object.values(ACCENT_PRESETS);
  const activePresetConfig = ACCENT_PRESETS[currentPreset] || ACCENT_PRESETS['soft-pink'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-7 shadow-2xl border border-slate-200 space-y-6 relative overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Top Decorative Glow */}
        <div
          className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none transition-all duration-300"
          style={{ backgroundColor: activePresetConfig.primaryColor }}
        />

        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md transition-colors"
              style={{ backgroundColor: activePresetConfig.primaryColor }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-800">User Settings & Theme</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Appearance
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentUser?.name
                  ? `Customized for ${currentUser.name} • ${currentUser.brandName}`
                  : 'Customize your workspace appearance and color palettes'}
              </p>
            </div>
          </div>
          <button
            id="btn-close-settings-x"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dark Mode Theme Toggle Section */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors shadow-2xs ${
              isDarkMode ? 'bg-slate-800 text-pink-400' : 'bg-amber-50 text-amber-600 border border-amber-200/60'
            }`}>
              {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">Dark Mode Palette</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                  isDarkMode ? 'bg-pink-50 text-pink-700 border border-pink-200' : 'bg-slate-200/70 text-slate-600'
                }`}>
                  {isDarkMode ? 'Dark Active' : 'Light Active'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Adjusts CSS variables to dark surfaces while maintaining girly accent highlights.
              </p>
            </div>
          </div>

          <button
            id="btn-toggle-dark-mode"
            type="button"
            role="switch"
            aria-checked={isDarkMode}
            onClick={() => onToggleDarkMode(!isDarkMode)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
              isDarkMode ? 'bg-pink-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                isDarkMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Accent Color Preset Selector Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              <span>Girly Accent Color Presets</span>
            </label>
            <span className="text-xs text-slate-400 font-medium">Dynamic CSS Variables</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {presets.map((preset) => {
              const isSelected = currentPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  id={`btn-preset-${preset.id}`}
                  onClick={() => onSelectPreset(preset.id)}
                  className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer group ${
                    isSelected
                      ? 'border-slate-800 bg-slate-50/80 shadow-md scale-[1.02]'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                  }`}
                >
                  {/* Selected checkmark indicator */}
                  {isSelected && (
                    <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}

                  <div>
                    {/* Swatch Pill */}
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <div
                        className="w-5 h-5 rounded-full shadow-xs border border-white/60"
                        style={{ backgroundColor: preset.swatchColors[0] }}
                        title="Background Tint"
                      />
                      <div
                        className="w-5 h-5 rounded-full shadow-xs border border-white/60"
                        style={{ backgroundColor: preset.swatchColors[1] }}
                        title="Primary Accent"
                      />
                      <div
                        className="w-5 h-5 rounded-full shadow-xs border border-white/60"
                        style={{ backgroundColor: preset.swatchColors[2] }}
                        title="Deep Text"
                      />
                    </div>

                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-slate-900">
                      {preset.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                      {preset.subtitle}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                      style={{
                        backgroundColor: isDarkMode ? '#2a1222' : preset.swatchColors[0],
                        color: isDarkMode ? preset.primaryColor : preset.swatchColors[2]
                      }}
                    >
                      {isSelected ? 'Active' : 'Select'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {preset.primaryColor}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Preview Box */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Real-time Preview: <strong className="text-pink-600 font-semibold">{activePresetConfig.name}</strong> ({isDarkMode ? 'Dark' : 'Light'})
              </span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">--color-pink-* variables</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="p-2.5 rounded-xl bg-pink-50 border border-pink-200 text-center">
              <span className="text-[10px] text-slate-400 block font-medium">Tint Container</span>
              <span className="text-xs font-bold text-pink-700">bg-pink-50</span>
            </div>
            <div className="p-2.5 rounded-xl bg-pink-500 text-white text-center shadow-xs">
              <span className="text-[10px] text-white/80 block font-medium">Action Button</span>
              <span className="text-xs font-bold">bg-pink-500</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 block font-medium">Text & Highlight</span>
              <span className="text-xs font-bold text-pink-600">text-pink-600</span>
            </div>
          </div>
        </div>

        {/* Sales Channels Configuration Shortcut */}
        {onOpenManageChannels && (
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-pink-500" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Sales Channels
                </span>
              </div>
              {salesChannels && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                  {salesChannels.length} Channels
                </span>
              )}
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3">
              <p className="text-xs text-slate-600 leading-snug">
                Configure your order channels (Instagram DM, WhatsApp, Website, TikTok, Pop-Up Fairs).
              </p>
              <button
                id="btn-settings-open-channels"
                type="button"
                onClick={() => {
                  onClose();
                  onOpenManageChannels();
                }}
                className="px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-semibold text-xs shrink-0 cursor-pointer shadow-xs shadow-pink-200 transition-colors"
              >
                Manage
              </button>
            </div>
          </div>
        )}

        {/* Account Management & Danger Zone */}
        {currentUser && (
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Account Management
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                {currentUser.role}
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl text-white font-bold text-sm flex items-center justify-center shrink-0 ${
                    currentUser.avatarColor || 'bg-pink-500'
                  }`}
                >
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{currentUser.name}</h4>
                  <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                  <p className="text-[10px] text-pink-600 font-semibold">{currentUser.brandName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {onLogout && (
                  <button
                    id="btn-settings-logout"
                    type="button"
                    onClick={() => {
                      onClose();
                      onLogout();
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-slate-500" />
                    <span>Log Out</span>
                  </button>
                )}

                {onOpenDeleteAccount && (
                  <button
                    id="btn-settings-delete-account"
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenDeleteAccount();
                    }}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100/80 text-rose-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Permanently delete your account"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Delete Account</span>
                  </button>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Deleting your account permanently removes your credentials, stored inventory batches, products, and sales logs from this browser.
            </p>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            id="btn-close-settings-modal"
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer active:scale-95 text-center"
          >
            Apply & Done
          </button>
        </div>
      </div>
    </div>
  );
};
