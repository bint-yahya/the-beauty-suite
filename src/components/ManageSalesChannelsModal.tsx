import React, { useState, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
  Share2,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  Info,
  DollarSign
} from 'lucide-react';
import {
  SalesChannel,
  SaleRecord,
  DEFAULT_SALES_CHANNELS,
  CHANNEL_COLOR_PRESETS,
  getChannelColorClasses,
  formatNaira,
  getSaleTotalRevenue
} from '../types';

interface ManageSalesChannelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  salesChannels: SalesChannel[];
  sales: SaleRecord[];
  onAddChannel: (channel: Omit<SalesChannel, 'id'>) => string; // returns created channel name
  onUpdateChannel: (id: string, updated: Partial<SalesChannel>, oldName: string, updateSalesCascade?: boolean) => void;
  onDeleteChannel: (id: string, channelName: string, reassignToName?: string) => void;
  onResetChannels?: () => void;
  onSelectChannelAfterAdd?: (channelName: string) => void;
}

export const ManageSalesChannelsModal: React.FC<ManageSalesChannelsModalProps> = ({
  isOpen,
  onClose,
  salesChannels,
  sales,
  onAddChannel,
  onUpdateChannel,
  onDeleteChannel,
  onResetChannels,
  onSelectChannelAfterAdd
}) => {
  // Adding form state
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('pink');
  const [newDesc, setNewDesc] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('pink');
  const [editDesc, setEditDesc] = useState('');
  const [cascadeSalesUpdate, setCascadeSalesUpdate] = useState(true);

  // Deletion modal state
  const [channelToDelete, setChannelToDelete] = useState<SalesChannel | null>(null);
  const [deleteMode, setDeleteMode] = useState<'keep' | 'reassign'>('keep');
  const [reassignTarget, setReassignTarget] = useState<string>('Direct / Walk-In');

  // Messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Calculate usage stats for each channel
  const channelStats = useMemo(() => {
    const stats: Record<string, { count: number; totalRevenue: number }> = {};
    salesChannels.forEach(ch => {
      stats[ch.name.toLowerCase()] = { count: 0, totalRevenue: 0 };
    });

    sales.forEach(sale => {
      const chName = (sale.channel || 'Direct / Walk-In').toLowerCase();
      if (!stats[chName]) {
        stats[chName] = { count: 0, totalRevenue: 0 };
      }
      stats[chName].count += 1;
      stats[chName].totalRevenue += getSaleTotalRevenue(sale);
    });

    return stats;
  }, [salesChannels, sales]);

  if (!isOpen) return null;

  const showFeedback = (success?: string, error?: string) => {
    if (success) {
      setSuccessMessage(success);
      setErrorMessage(null);
      setTimeout(() => setSuccessMessage(null), 3500);
    }
    if (error) {
      setErrorMessage(error);
      setSuccessMessage(null);
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const handleStartAdd = () => {
    setIsAddingMode(true);
    setNewName('');
    setNewColor('pink');
    setNewDesc('');
    setErrorMessage(null);
  };

  const handleSaveNewChannel = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) {
      showFeedback(undefined, 'Please provide a channel name (e.g., TikTok Shop, Store Walk-in).');
      return;
    }

    const alreadyExists = salesChannels.some(
      c => c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (alreadyExists) {
      showFeedback(undefined, `A channel named "${trimmed}" already exists.`);
      return;
    }

    const createdName = onAddChannel({
      name: trimmed,
      color: newColor,
      description: newDesc.trim() || undefined,
      isDefault: false
    });

    showFeedback(`Channel "${trimmed}" added successfully!`);
    setIsAddingMode(false);
    setNewName('');
    setNewDesc('');

    if (onSelectChannelAfterAdd) {
      onSelectChannelAfterAdd(createdName || trimmed);
    }
  };

  const handleStartEdit = (ch: SalesChannel) => {
    setEditingId(ch.id);
    setEditName(ch.name);
    setEditColor(ch.color || 'pink');
    setEditDesc(ch.description || '');
    setCascadeSalesUpdate(true);
    setErrorMessage(null);
  };

  const handleSaveEdit = (e: React.FormEvent, ch: SalesChannel) => {
    e.preventDefault();
    const trimmed = editName.trim();
    if (!trimmed) {
      showFeedback(undefined, 'Channel name cannot be empty.');
      return;
    }

    const nameConflict = salesChannels.some(
      c => c.id !== ch.id && c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (nameConflict) {
      showFeedback(undefined, `Another channel with the name "${trimmed}" already exists.`);
      return;
    }

    onUpdateChannel(
      ch.id,
      {
        name: trimmed,
        color: editColor,
        description: editDesc.trim() || undefined
      },
      ch.name,
      cascadeSalesUpdate
    );

    showFeedback(`Channel updated to "${trimmed}".`);
    setEditingId(null);
  };

  const handleInitiateDelete = (ch: SalesChannel) => {
    if (salesChannels.length <= 1) {
      showFeedback(undefined, 'You must keep at least one sales channel in the system.');
      return;
    }
    const usage = channelStats[ch.name.toLowerCase()] || { count: 0, totalRevenue: 0 };
    // Find alternative default target
    const fallbackTarget = salesChannels.find(c => c.id !== ch.id)?.name || 'Direct / Walk-In';
    setReassignTarget(fallbackTarget);
    setDeleteMode('keep');
    setChannelToDelete(ch);
  };

  const handleConfirmDelete = () => {
    if (!channelToDelete) return;
    const name = channelToDelete.name;
    const usage = channelStats[name.toLowerCase()] || { count: 0 };

    const target = usage.count > 0 && deleteMode === 'reassign' ? reassignTarget : undefined;
    onDeleteChannel(channelToDelete.id, name, target);

    showFeedback(
      deleteMode === 'keep' && usage.count > 0
        ? `Channel "${name}" deleted. Past sales records kept untouched as "${name}".`
        : `Channel "${name}" was deleted successfully.`
    );
    setChannelToDelete(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 relative overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Decorative Pink Accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-600 shadow-xs shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-800">
                  Sales Channels Management
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-100">
                  {salesChannels.length} Channels
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Add, customize, or remove sales channels. All options instantly sync to the Record Sale form.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Notifications */}
        {errorMessage && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in shrink-0">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto py-4 space-y-4 flex-1 pr-1">
          {/* Action Row: Add Channel or Cancel Add */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Configured Channels
            </span>
            {!isAddingMode ? (
              <button
                type="button"
                onClick={handleStartAdd}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-semibold shadow-xs shadow-pink-200 transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Sales Channel</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingMode(false)}
                className="text-xs text-slate-500 hover:text-slate-700 font-medium cursor-pointer"
              >
                Cancel Adding
              </button>
            )}
          </div>

          {/* Inline Add Channel Form */}
          {isAddingMode && (
            <form
              onSubmit={handleSaveNewChannel}
              className="bg-pink-50/60 border border-pink-200 rounded-2xl p-4 space-y-3 animate-in fade-in duration-150"
            >
              <div className="flex items-center gap-2 pb-1 border-b border-pink-200/60 text-pink-900 text-xs font-bold">
                <Sparkles className="w-4 h-4 text-pink-600" />
                <span>Create New Sales Channel</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Channel Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TikTok Shop, Boutique Walk-In"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-pink-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Badge Color Theme
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    {CHANNEL_COLOR_PRESETS.map((colorPreset) => (
                      <button
                        key={colorPreset.id}
                        type="button"
                        onClick={() => setNewColor(colorPreset.id)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform cursor-pointer ${
                          colorPreset.dot
                        } ${
                          newColor === colorPreset.id
                            ? 'ring-2 ring-pink-500 ring-offset-2 scale-110 shadow-xs'
                            : 'opacity-70 hover:opacity-100 hover:scale-105'
                        }`}
                        title={colorPreset.label}
                      >
                        {newColor === colorPreset.id && (
                          <Check className="w-3 h-3 text-white stroke-[3]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Description / Operational Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. WhatsApp Business catalog and direct orders"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingMode(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-semibold shadow-xs shadow-pink-200 transition-all cursor-pointer"
                >
                  Save & Add Channel
                </button>
              </div>
            </form>
          )}

          {/* List of Sales Channels */}
          <div className="space-y-2.5">
            {salesChannels.map((channel) => {
              const isEditingThis = editingId === channel.id;
              const colorConfig = getChannelColorClasses(channel.color);
              const stats = channelStats[channel.name.toLowerCase()] || { count: 0, totalRevenue: 0 };

              if (isEditingThis) {
                return (
                  <form
                    key={channel.id}
                    onSubmit={(e) => handleSaveEdit(e, channel)}
                    className="bg-slate-50 border-2 border-pink-400 rounded-2xl p-3.5 space-y-3 animate-in fade-in"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Editing: {channel.name}</span>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Channel Name
                        </label>
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-pink-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Badge Color
                        </label>
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          {CHANNEL_COLOR_PRESETS.map((colorPreset) => (
                            <button
                              key={colorPreset.id}
                              type="button"
                              onClick={() => setEditColor(colorPreset.id)}
                              className={`w-5 h-5 rounded-full flex items-center justify-center transition-transform cursor-pointer ${
                                colorPreset.dot
                              } ${
                                editColor === colorPreset.id
                                  ? 'ring-2 ring-pink-500 ring-offset-2 scale-110'
                                  : 'opacity-70 hover:opacity-100'
                              }`}
                              title={colorPreset.label}
                            >
                              {editColor === colorPreset.id && (
                                <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Description / Notes
                      </label>
                      <input
                        type="text"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="Description"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-pink-500"
                      />
                    </div>

                    {stats.count > 0 && editName.trim() !== channel.name && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-[11px] text-amber-900 flex items-start gap-2">
                        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <label className="font-semibold flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={cascadeSalesUpdate}
                              onChange={(e) => setCascadeSalesUpdate(e.target.checked)}
                              className="accent-pink-600 rounded"
                            />
                            <span>
                              Update all <strong>{stats.count} past sales</strong> currently tagged as &quot;{channel.name}&quot; to &quot;{editName.trim()}&quot;
                            </span>
                          </label>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-semibold shadow-xs shadow-pink-200 transition-all cursor-pointer"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                );
              }

              return (
                <div
                  key={channel.id}
                  className="bg-white border border-slate-200/80 hover:border-pink-300 rounded-2xl p-3 sm:px-4 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors shadow-2xs group"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${colorConfig.bg} ${colorConfig.text} ${colorConfig.border}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${colorConfig.dot}`} />
                      <span>{channel.name}</span>
                    </span>

                    {channel.description && (
                      <span className="text-xs text-slate-500 hidden sm:inline truncate max-w-xs">
                        {channel.description}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    {/* Performance mini-stat */}
                    <div className="text-right text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">
                        {stats.count} {stats.count === 1 ? 'sale' : 'sales'}
                      </span>
                      {stats.totalRevenue > 0 && (
                        <span className="text-pink-600 font-bold ml-1.5">
                          ({formatNaira(stats.totalRevenue)})
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(channel)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-pink-600 hover:bg-pink-50 transition-colors cursor-pointer"
                        title={`Edit "${channel.name}"`}
                        aria-label={`Edit channel ${channel.name}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleInitiateDelete(channel)}
                        disabled={salesChannels.length <= 1}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          salesChannels.length <= 1
                            ? 'text-slate-300 cursor-not-allowed opacity-50'
                            : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                        title={
                          salesChannels.length <= 1
                            ? 'Cannot delete the only remaining channel'
                            : `Delete "${channel.name}"`
                        }
                        aria-label={`Delete channel ${channel.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Explainer & Default Restore */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Sales recorded under these channels populate the Dashboard channel velocity & reports.
              </span>
            </div>
            {onResetChannels && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Restore standard cosmetic sales channels? (Instagram DM, WhatsApp, Website, Snapchat, Pop-Up Fair, Tiktok Shop)')) {
                    onResetChannels();
                    showFeedback('Standard sales channels restored!');
                  }
                }}
                className="text-[11px] font-semibold text-slate-500 hover:text-pink-600 flex items-center gap-1 transition-colors cursor-pointer shrink-0 self-end sm:self-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Defaults</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95"
          >
            Done
          </button>
        </div>
      </div>

      {/* Confirmation Sub-Modal for Deleting a Channel */}
      {channelToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-rose-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-base">
                  Delete Channel &quot;{channelToDelete.name}&quot;?
                </h4>
                <p className="text-xs text-slate-500">
                  This action removes the channel from your active list.
                </p>
              </div>
            </div>

            {(() => {
              const count = channelStats[channelToDelete.name.toLowerCase()]?.count || 0;
              const rev = channelStats[channelToDelete.name.toLowerCase()]?.totalRevenue || 0;
              if (count > 0) {
                return (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 space-y-3 text-xs text-amber-900">
                    <p className="font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        Notice: <strong>{count} recorded {count === 1 ? 'sale' : 'sales'}</strong> ({formatNaira(rev)}) are currently tagged as &quot;{channelToDelete.name}&quot;.
                      </span>
                    </p>

                    <div className="space-y-2 pt-0.5">
                      <label className="block text-[11px] font-bold text-amber-950">
                        Choose what to do with past sales records:
                      </label>

                      {/* Option A: Keep past records as-is */}
                      <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-amber-200 cursor-pointer hover:border-pink-300 transition-colors">
                        <input
                          type="radio"
                          name="channelDeleteAction"
                          checked={deleteMode === 'keep'}
                          onChange={() => setDeleteMode('keep')}
                          className="mt-0.5 accent-pink-600"
                        />
                        <div>
                          <span className="font-bold text-slate-800 block text-xs">
                            Keep past sales tagged as &quot;{channelToDelete.name}&quot; (Recommended)
                          </span>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            Preserves original sales history and reports intact without altering existing transactions. The channel will simply be removed from future sales dropdowns.
                          </span>
                        </div>
                      </label>

                      {/* Option B: Reassign to another channel */}
                      <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-amber-200 cursor-pointer hover:border-pink-300 transition-colors">
                        <input
                          type="radio"
                          name="channelDeleteAction"
                          checked={deleteMode === 'reassign'}
                          onChange={() => setDeleteMode('reassign')}
                          className="mt-0.5 accent-pink-600"
                        />
                        <div className="w-full">
                          <span className="font-bold text-slate-800 block text-xs">
                            Reassign past sales to another channel
                          </span>
                          <span className="text-[11px] text-slate-500 block mt-0.5 mb-1.5">
                            Bulk update all {count} past records to a different channel:
                          </span>
                          {deleteMode === 'reassign' && (
                            <select
                              value={reassignTarget}
                              onChange={(e) => setReassignTarget(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-pink-500 mt-1"
                            >
                              <option value="Direct / Walk-In">Direct / Walk-In</option>
                              {salesChannels
                                .filter((c) => c.id !== channelToDelete.id)
                                .map((c) => (
                                  <option key={c.id} value={c.name}>
                                    {c.name}
                                  </option>
                                ))}
                            </select>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>
                );
              }
              return (
                <p className="text-xs text-slate-600">
                  There are currently no sales recorded under this channel. It can be safely removed.
                </p>
              );
            })()}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setChannelToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-rose-200 transition-all cursor-pointer"
              >
                Yes, Delete Channel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
