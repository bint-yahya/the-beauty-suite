import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface DetailItem {
  label: string;
  value: string | number;
  highlight?: boolean;
}

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  details?: DetailItem[];
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title,
  description,
  details = [],
  confirmText = 'Yes, Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">{title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{description}</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Details Card if provided */}
        {details.length > 0 && (
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 divide-y divide-slate-200/60 text-xs space-y-2">
            {details.map((item, idx) => (
              <div key={idx} className={`flex items-center justify-between ${idx > 0 ? 'pt-2' : ''}`}>
                <span className="text-slate-500 font-medium">{item.label}</span>
                <span className={`font-semibold ${item.highlight ? 'text-pink-600 font-bold' : 'text-slate-800'}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Notice */}
        <div className="flex items-center gap-2 text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200/70">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>This action cannot be undone. Inventory and dashboard metrics will update immediately.</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            id="btn-confirm-delete"
            type="button"
            onClick={onConfirm}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-200 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
