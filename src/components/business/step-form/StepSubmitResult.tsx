import React from 'react';
import { CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';

interface StepSubmitResultProps {
  orderId: string;
  onViewDetail: () => void;
  onReset: () => void;
}

export const StepSubmitResult: React.FC<StepSubmitResultProps> = ({
  orderId,
  onViewDetail,
  onReset,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 sm:p-12 text-center shadow-sm space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">工单提交成功！</h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          流水单号为 <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{orderId}</span>。审批通告已同步至钉钉群组并转交责任人初审。
        </p>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onViewDetail}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all"
        >
          <span>查看工单列表</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={onReset}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>再申请一单</span>
        </button>
      </div>
    </div>
  );
};
