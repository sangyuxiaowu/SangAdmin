import React from 'react';
import { ArrowRight } from 'lucide-react';

export interface StepBasicInfoData {
  title: string;
  category: string;
  priority: string;
  department: string;
  description: string;
}

interface StepBasicInfoFormProps {
  formData: StepBasicInfoData;
  onChange: (data: Partial<StepBasicInfoData>) => void;
  onNext: () => void;
}

export const StepBasicInfoForm: React.FC<StepBasicInfoFormProps> = ({
  formData,
  onChange,
  onNext,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">1. 基础工单信息</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">请准确填写工单主题、业务分类及所属部门。</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            工单主题名称 <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => onChange({ title: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="如：生产环境 Redis 集群规格扩容"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              业务类别
            </label>
            <select
              value={formData.category}
              onChange={(e) => onChange({ category: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="基础架构与云资源">基础架构与云资源</option>
              <option value="RBAC 权限提权变更">RBAC 权限提权变更</option>
              <option value="数据分析与报表导出">数据分析与报表导出</option>
              <option value="网络与防火墙开通">网络与防火墙开通</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              紧急程度 (Priority)
            </label>
            <select
              value={formData.priority}
              onChange={(e) => onChange({ priority: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="P0">P0 - 紧急 (需要立即处理)</option>
              <option value="P1">P1 - 高 (24小时内处理)</option>
              <option value="P2">P2 - 中 (常规处理)</option>
              <option value="P3">P3 - 低 (建议性变更)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            归属部门 / 团队
          </label>
          <input
            type="text"
            value={formData.department}
            onChange={(e) => onChange({ department: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            申请原因与变更说明
          </label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) => onChange({ description: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="说明变更背景、影响范围以及实施计划..."
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="submit"
          className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all"
        >
          <span>下一步：高级配置</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};
