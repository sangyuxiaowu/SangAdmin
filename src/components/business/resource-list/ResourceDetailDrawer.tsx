import React from 'react';
import { createPortal } from 'react-dom';
import { X, Check, ShieldAlert, User, Calendar, Tag, AlertCircle } from 'lucide-react';
import type { WorkOrderItem } from './ResourceTable';

interface ResourceDetailDrawerProps {
  item: WorkOrderItem | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const ResourceDetailDrawer: React.FC<ResourceDetailDrawerProps> = ({
  item,
  isOpen,
  onClose,
  onApprove,
  onReject,
}) => {
  if (!isOpen || !item) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-hidden animate-fade-in flex">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity z-[100]"
      />

      {/* Slide Drawer Content */}
      <div className="relative z-[101] ml-auto w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{item.code}</div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">{item.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-3 text-xs sm:text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>申请人</span>
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{item.applicant} ({item.department})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center space-x-1">
                <Tag className="w-4 h-4" />
                <span>业务类别</span>
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{item.category}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center space-x-1">
                <ShieldAlert className="w-4 h-4" />
                <span>优先级</span>
              </span>
              <span className="font-bold text-rose-600 dark:text-rose-400">{item.priority}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>提交时间</span>
              </span>
              <span className="font-mono text-slate-600 dark:text-slate-400">{item.createdAt}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">审计追踪轨迹</h3>
            <div className="border-l-2 border-indigo-500/30 pl-4 space-y-4 text-xs">
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">提交工单申请</div>
                <div className="text-slate-400 mt-0.5">{item.createdAt} · {item.applicant}</div>
              </div>
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">系统自动规则与风险预检</div>
                <div className="text-emerald-600 dark:text-emerald-400 mt-0.5">通过 · 无高危合规违规项</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-end space-x-2">
          {item.status === 'pending' && (
            <>
              <button
                onClick={() => onReject(item.id)}
                className="flex items-center space-x-1 px-4 py-2 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 rounded-xl text-xs sm:text-sm font-semibold transition-all"
              >
                <AlertCircle className="w-4 h-4" />
                <span>驳回</span>
              </button>
              <button
                onClick={() => onApprove(item.id)}
                className="flex items-center space-x-1 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>批准通过</span>
              </button>
            </>
          )}
          {item.status !== 'pending' && (
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-semibold transition-all"
            >
              关闭
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
