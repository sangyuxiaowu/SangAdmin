import React from 'react';
import { Search, RotateCcw, Plus, Download, Filter } from 'lucide-react';

export interface ResourceFilterState {
  searchQuery: string;
  category: string;
  status: string;
  priority: string;
}

interface ResourceFilterBarProps {
  filter: ResourceFilterState;
  onChange: (filter: Partial<ResourceFilterState>) => void;
  onReset: () => void;
  onCreateNew: () => void;
  onExport: () => void;
  totalCount: number;
}

export const ResourceFilterBar: React.FC<ResourceFilterBarProps> = ({
  filter,
  onChange,
  onReset,
  onCreateNew,
  onExport,
  totalCount,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search & Category Inputs */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          <div className="relative col-span-1 sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filter.searchQuery}
              onChange={(e) => onChange({ searchQuery: e.target.value })}
              placeholder="搜索工单单号、主题或申请人..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={filter.category}
            onChange={(e) => onChange({ category: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">全部分类</option>
            <option value="基础架构与云资源">基础架构与云资源</option>
            <option value="RBAC 权限提权变更">RBAC 权限提权变更</option>
            <option value="数据分析与报表导出">数据分析与报表导出</option>
          </select>

          <select
            value={filter.status}
            onChange={(e) => onChange({ status: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">全部状态</option>
            <option value="pending">待审核</option>
            <option value="processing">进行中</option>
            <option value="completed">已通过</option>
            <option value="rejected">已驳回</option>
          </select>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={onReset}
            title="重置筛选"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onExport}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold transition-all"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">导出</span>
          </button>
          <button
            onClick={onCreateNew}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>新建工单</span>
          </button>
        </div>
      </div>

      <div className="text-[11px] text-slate-400 font-medium">
        符合条件的工单记录: <span className="font-bold text-slate-700 dark:text-slate-300">{totalCount}</span> 项
      </div>
    </div>
  );
};
