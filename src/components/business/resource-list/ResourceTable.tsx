import React from 'react';
import { Eye, Check, X, ShieldAlert, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export interface WorkOrderItem {
  id: string;
  code: string;
  title: string;
  applicant: string;
  applicantAvatar?: string;
  department: string;
  category: string;
  priority: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  createdAt: string;
}

interface ResourceTableProps {
  items: WorkOrderItem[];
  selectedIds: string[];
  onSelectToggle: (id: string) => void;
  onSelectAllToggle: () => void;
  onViewDetail: (item: WorkOrderItem) => void;
  onApprove: (item: WorkOrderItem) => void;
  onReject: (item: WorkOrderItem) => void;
}

export const ResourceTable: React.FC<ResourceTableProps> = ({
  items,
  selectedIds,
  onSelectToggle,
  onSelectAllToggle,
  onViewDetail,
  onApprove,
  onReject,
}) => {
  const isAllSelected = items.length > 0 && selectedIds.length === items.length;

  const renderStatusBadge = (status: WorkOrderItem['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
            <Clock className="w-3 h-3" />
            <span>待审核</span>
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
            <Clock className="w-3 h-3 animate-spin" />
            <span>进行中</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
            <CheckCircle2 className="w-3 h-3" />
            <span>已通过</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60">
            <AlertCircle className="w-3 h-3" />
            <span>已驳回</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="py-3.5 px-4 w-10">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onSelectAllToggle}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </th>
              <th className="py-3.5 px-4">单号 / 工单名称</th>
              <th className="py-3.5 px-4">申请人</th>
              <th className="py-3.5 px-4">业务类型</th>
              <th className="py-3.5 px-4">优先级</th>
              <th className="py-3.5 px-4">状态</th>
              <th className="py-3.5 px-4">创建时间</th>
              <th className="py-3.5 px-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs sm:text-sm">
            {items.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                    isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onSelectToggle(item.id)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-mono text-[11px] font-semibold text-slate-400">{item.code}</div>
                    <div
                      onClick={() => onViewDetail(item)}
                      className="font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer truncate max-w-xs"
                    >
                      {item.title}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2">
                      {item.applicantAvatar ? (
                        <img
                          src={item.applicantAvatar}
                          alt={item.applicant}
                          className="w-6 h-6 rounded-full object-cover shrink-0"
                        />
                      ) : null}
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{item.applicant}</div>
                        <div className="text-[11px] text-slate-400">{item.department}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-300">{item.category}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        item.priority === 'P0'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                          : item.priority === 'P1'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">{renderStatusBadge(item.status)}</td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-xs font-mono">{item.createdAt}</td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => onViewDetail(item)}
                        title="查看详情"
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {item.status === 'pending' && (
                        <>
                          <button
                            onClick={() => onApprove(item)}
                            title="审核通过"
                            className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onReject(item)}
                            title="驳回"
                            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {items.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  未查找到符合条件的工单与资源记录
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
