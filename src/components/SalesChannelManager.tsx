import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  RotateCcw,
  ShoppingBag,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { SaleRecord, DEFAULT_SALES_CHANNELS } from '../types';

export interface SalesChannelManagerProps {
  channels: string[];
  onAddChannel: (channelName: string) => boolean;
  onUpdateChannel: (oldName: string, newName: string) => boolean;
  onDeleteChannel: (channelName: string) => void;
  onResetDefaults?: () => void;
  selectedChannel?: string;
  onSelectChannel?: (channelName: string) => void;
  sales?: SaleRecord[];
  isInline?: boolean;
  onClose?: () => void;
}

export const SalesChannelManager: React.FC<SalesChannelManagerProps> = ({
  channels,
  onAddChannel,
  onUpdateChannel,
  onDeleteChannel,
  onResetDefaults,
  selectedChannel,
  onSelectChannel,
  sales = [],
  isInline = false,
  onClose
}) => {
  const [newChannelInput, setNewChannelInput] = useState('');
  const [editingChannel, setEditingChannel] = useState<string | null>(null);
  const [editingInput, setEditingInput] = useState('');
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showNotice = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => {
      setFeedback(prev => (prev?.text === text ? null : prev));
    }, 3500);
  };

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newChannelInput.trim();
    if (!trimmed) {
      showNotice('Please enter a sales channel name.', 'error');
      return;
    }

    const exists = channels.some(c => c.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      showNotice(`Sales channel "${trimmed}" already exists.`, 'error');
      return;
    }

    const ok = onAddChannel(trimmed);
    if (ok) {
      setNewChannelInput('');
      if (onSelectChannel) {
        onSelectChannel(trimmed);
        showNotice(`Channel "${trimmed}" added & selected for this sale!`, 'success');
      } else {
        showNotice(`Channel "${trimmed}" added successfully!`, 'success');
      }
    }
  };

  const handleStartEdit = (ch: string) => {
    setEditingChannel(ch);
    setEditingInput(ch);
  };

  const handleSaveEdit = (oldName: string) => {
    const trimmed = editingInput.trim();
    if (!trimmed) {
      showNotice('Channel name cannot be empty.', 'error');
      return;
    }

    if (trimmed.toLowerCase() === oldName.toLowerCase()) {
      setEditingChannel(null);
      return;
    }

    const exists = channels.some(c => c.toLowerCase() === trimmed.toLowerCase() && c !== oldName);
    if (exists) {
      showNotice(`Another channel named "${trimmed}" already exists.`, 'error');
      return;
    }

    const ok = onUpdateChannel(oldName, trimmed);
    if (ok) {
      setEditingChannel(null);
      showNotice(`Renamed to "${trimmed}" and updated in dropdown.`, 'success');
    }
  };

  const handleDelete = (ch: string) => {
    if (channels.length <= 1) {
      showNotice('You must keep at least one sales channel.', 'error');
      return;
    }

    onDeleteChannel(ch);
    showNotice(`Sales channel "${ch}" deleted.`, 'success');
  };

  // Count how many logged sales use each channel
  const getSaleCountForChannel = (ch: string) => {
    return sales.filter(s => (s.channel || '').toLowerCase() === ch.toLowerCase()).length;
  };

  return (
    <div
      className={`${
        isInline
          ? 'bg-pink-50/70 border border-pink-200/90 rounded-2xl p-3 sm:p-4 space-y-3 mt-2 animate-in fade-in zoom-in-95 duration-150 shadow-2xs'
          : 'space-y-4'
      }`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 border-b border-pink-200/70 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-pink-500 text-white flex items-center justify-center shadow-xs">
            <Tag className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <span>Manage Sales Channels</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-pink-100 text-pink-700">
                {channels.length}
              </span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Add, rename, or delete channels. All updates appear instantly in the sale dropdown.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-pink-100 transition-colors cursor-pointer"
            title="Done managing channels"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Feedback Alert Notice */}
      {feedback && (
        <div
          className={`flex items-center gap-2 text-xs p-2 rounded-xl border animate-in fade-in duration-150 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          )}
          <span className="font-medium">{feedback.text}</span>
        </div>
      )}

      {/* Add New Channel Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            id="input-new-sales-channel"
            type="text"
            placeholder="e.g. TikTok Live, Etsy, Telegram, In-Person Store..."
            value={newChannelInput}
            onChange={(e) => setNewChannelInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                handleAdd();
              }
            }}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none placeholder:text-slate-400 text-slate-800 shadow-2xs"
          />
        </div>
        <button
          id="btn-add-sales-channel"
          type="button"
          onClick={() => handleAdd()}
          disabled={!newChannelInput.trim()}
          className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
            newChannelInput.trim()
              ? 'bg-pink-500 hover:bg-pink-600 text-white shadow-xs shadow-pink-300 active:scale-95'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Channel</span>
        </button>
      </div>

      {/* Current Channels List */}
      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center justify-between">
          <span>Active Channels ({channels.length})</span>
          <span>Orders Logged</span>
        </div>

        {channels.map((ch) => {
          const isSelected = selectedChannel === ch;
          const isEditing = editingChannel === ch;
          const orderCount = getSaleCountForChannel(ch);

          return (
            <div
              key={ch}
              className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-white border-pink-300 shadow-2xs'
                  : 'bg-white/90 border-slate-200 hover:border-pink-200'
              }`}
            >
              {isEditing ? (
                <div className="flex items-center gap-2 w-full">
                  <input
                    type="text"
                    value={editingInput}
                    onChange={(e) => setEditingInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveEdit(ch);
                      } else if (e.key === 'Escape') {
                        setEditingChannel(null);
                      }
                    }}
                    autoFocus
                    className="flex-1 bg-white border border-pink-400 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-pink-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(ch)}
                    className="p-1.5 rounded-lg bg-pink-500 text-white hover:bg-pink-600 cursor-pointer transition-colors"
                    title="Save name"
                    aria-label={`Save rename for ${ch}`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingChannel(null)}
                    className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer transition-colors"
                    title="Cancel"
                    aria-label="Cancel editing"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectChannel) {
                          onSelectChannel(ch);
                          showNotice(`Selected "${ch}" for this sale.`, 'success');
                        }
                      }}
                      className="text-left font-semibold text-xs text-slate-800 hover:text-pink-600 truncate flex items-center gap-1.5 cursor-pointer"
                      title={onSelectChannel ? `Click to select "${ch}" for this sale` : ch}
                    >
                      <span className="truncate">{ch}</span>
                      {isSelected && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-pink-100 text-pink-700 shrink-0">
                          Selected
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {orderCount > 0 ? (
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold flex items-center gap-1"
                        title={`${orderCount} sales recorded via ${ch}`}
                      >
                        <ShoppingBag className="w-2.5 h-2.5 text-slate-400" />
                        {orderCount}
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded text-slate-400">
                        0 sales
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleStartEdit(ch)}
                      className="p-1 rounded-lg text-slate-400 hover:text-pink-600 hover:bg-pink-50 transition-colors cursor-pointer"
                      title={`Edit ${ch}`}
                      aria-label={`Edit channel ${ch}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(ch)}
                      disabled={channels.length <= 1}
                      className={`p-1 rounded-lg transition-colors cursor-pointer ${
                        channels.length <= 1
                          ? 'text-slate-300 cursor-not-allowed'
                          : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                      title={
                        channels.length <= 1
                          ? 'Cannot delete the only remaining channel'
                          : `Delete ${ch}`
                      }
                      aria-label={`Delete channel ${ch}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer controls: Reset to Defaults & Done */}
      <div className="flex items-center justify-between pt-2 border-t border-pink-200/70 text-xs">
        {onResetDefaults && (
          <button
            type="button"
            onClick={() => {
              onResetDefaults();
              showNotice('Restored default sales channels.', 'success');
            }}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-pink-700 font-semibold hover:underline cursor-pointer"
            title="Restore the 6 standard channels (Instagram DM, WhatsApp, Website, etc.)"
          >
            <RotateCcw className="w-3 h-3 text-pink-500" />
            <span>Reset Defaults</span>
          </button>
        )}

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="ml-auto px-3 py-1 bg-white hover:bg-pink-50 text-pink-700 border border-pink-200 font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
};
