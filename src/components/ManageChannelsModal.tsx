import React from 'react';
import { Tag, X } from 'lucide-react';
import { SalesChannelManager, SalesChannelManagerProps } from './SalesChannelManager';

export interface ManageChannelsModalProps extends Omit<SalesChannelManagerProps, 'isInline'> {
  isOpen: boolean;
  onClose: () => void;
}

export const ManageChannelsModal: React.FC<ManageChannelsModalProps> = ({
  isOpen,
  onClose,
  ...managerProps
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-md">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                <span>Manage Sales Channels</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure all avenues through which you sell. Changes immediately update your order entry dropdowns.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Manager Component */}
        <SalesChannelManager
          {...managerProps}
          isInline={false}
          onClose={onClose}
        />
      </div>
    </div>
  );
};
