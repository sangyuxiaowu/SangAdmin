import React from 'react';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import type { StepBasicInfoData } from './StepBasicInfoForm';
import type { StepConfigData } from './StepConfigDetailsForm';

interface StepConfirmSummaryProps {
  basicInfo: StepBasicInfoData;
  configData: StepConfigData;
  onPrev: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const StepConfirmSummary: React.FC<StepConfirmSummaryProps> = ({
  basicInfo,
  configData,
  onPrev,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">3. 确认工单信息汇总</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">请核对提交的所有配置参数，确认无误后点击“提交并生成工单”。</p>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-slate-50/80 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">基础信息概要</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div>
              <span className="text-slate-500 dark:text-slate-400">工单主题：</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{basicInfo.title}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">业务类别：</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{basicInfo.category}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">优先级：</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">{basicInfo.priority}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">归属部门：</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{basicInfo.department}</span>
            </div>
          </div>
          <div className="text-xs pt-2 border-t border-slate-200/40 dark:border-slate-700/50 text-slate-600 dark:text-slate-300">
            <span className="text-slate-500 dark:text-slate-400">变更说明：</span>
            {basicInfo.description}
          </div>
        </div>

        <div className="p-4 bg-slate-50/80 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">高级策略配置</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div>
              <span className="text-slate-500 dark:text-slate-400">指定审批人：</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{configData.approver}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">数据密级：</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{configData.securityLevel}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">自动触发部署：</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{configData.autoExecute ? '是' : '否'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onPrev}
          className="flex items-center space-x-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>上一步修改</span>
        </button>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onSubmit}
          className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>提交审核中...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>确认无误，提交工单</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
