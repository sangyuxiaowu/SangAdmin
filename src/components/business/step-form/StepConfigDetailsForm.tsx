import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export interface StepConfigData {
  approver: string;
  securityLevel: string;
  notifyWebhook: string;
  autoExecute: boolean;
  timeoutHours: number;
}

interface StepConfigDetailsFormProps {
  configData: StepConfigData;
  onChange: (data: Partial<StepConfigData>) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const StepConfigDetailsForm: React.FC<StepConfigDetailsFormProps> = ({
  configData,
  onChange,
  onPrev,
  onNext,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">2. 高级配置与审批策略</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">设置密级、指定合规审核人及自动化回调通知。</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              指定审批责任人
            </label>
            <select
              value={configData.approver}
              onChange={(e) => onChange({ approver: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="usr-1">陆天行 (架构运维负责人)</option>
              <option value="usr-2">林雨晴 (安全合规专家)</option>
              <option value="usr-3">陈明哲 (数据大体量主管)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              数据保密等级 (Security Level)
            </label>
            <select
              value={configData.securityLevel}
              onChange={(e) => onChange({ securityLevel: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="internal">内部级别 (Internal Only)</option>
              <option value="confidential">机密级别 (Confidential)</option>
              <option value="top-secret">绝密级别 (Top Secret)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            消息通知 Webhook URL
          </label>
          <input
            type="url"
            value={configData.notifyWebhook}
            onChange={(e) => onChange({ notifyWebhook: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="https://oapi.dingtalk.com/robot/send?access_token=..."
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-800">
          <div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">审批通过后自动触发流水线</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">无需人工二次点击确认，即刻调用基础设施 API 变更</div>
          </div>
          <input
            type="checkbox"
            checked={configData.autoExecute}
            onChange={(e) => onChange({ autoExecute: e.target.checked })}
            className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onPrev}
          className="flex items-center space-x-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>上一步</span>
        </button>
        <button
          type="submit"
          className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all"
        >
          <span>下一步：确认汇总</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};
