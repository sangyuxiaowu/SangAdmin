import React from 'react';
import { CheckCircle2, Trash2, Download, X } from 'lucide-react';

interface ResourceBatchActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBatchApprove: () => void;
  onBatchDelete: () => void;
  onBatchExport: () => void;
}

export const ResourceBatchActionBar: React.FC<ResourceBatchActionBarProps> = ({
  selectedCount,
  onClearSelection,
  onBatchApprove,
  onBatchDelete,
  onBatchExport,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 dark:bg-slate-800/95 text-white backdrop-blur-md px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center space-x-4 animate-fade-in">
      <div className="flex items-center space-x-2 text-xs sm:text-sm font-semibold">
        <span className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs">
          {selectedCount}
        </span>
        <span>项已选择</span>
        <button
          onClick={onClearSelection}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="h-4 w-px bg-slate-700" />

      <div className="flex items-center space-x-2">
        <button
          onClick={onBatchApprove}
          className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-semibold transition-all"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>批量审核通过</span>
        </button>
        <button
          onClick={onBatchExport}
          className="flex items-center space-x-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-xs font-semibold transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>导出已选</span>
        </button>
        <button
          onClick={onBatchDelete}
          className="flex items-center space-x-1 px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 rounded-xl text-xs font-semibold transition-all text-rose-100"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>删除</span>
        </button>
      </div>
    </div>
  );
};
