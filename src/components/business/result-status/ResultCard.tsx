import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, ShieldAlert, FileQuestion } from 'lucide-react';

export type ResultType = 'success' | 'error' | '404' | '403' | 'warning';

interface ResultCardProps {
  type: ResultType;
  title: string;
  subTitle: string;
  primaryActionText?: string;
  onPrimaryAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  children?: React.ReactNode;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  type,
  title,
  subTitle,
  primaryActionText,
  onPrimaryAction,
  secondaryActionText,
  onSecondaryAction,
  children,
}) => {
  const renderIcon = () => {
    switch (type) {
      case 'success':
        return (
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-10 h-10" />
          </div>
        );
      case 'error':
        return (
          <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
            <XCircle className="w-10 h-10" />
          </div>
        );
      case '404':
        return (
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
            <FileQuestion className="w-10 h-10" />
          </div>
        );
      case '403':
        return (
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/10">
            <ShieldAlert className="w-10 h-10" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
            <AlertTriangle className="w-10 h-10" />
          </div>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 sm:p-12 text-center shadow-sm space-y-6 max-w-2xl mx-auto">
      {renderIcon()}

      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">{title}</h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">{subTitle}</p>
      </div>

      {children && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-800 text-left text-xs text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
          {children}
        </div>
      )}

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        {primaryActionText && onPrimaryAction && (
          <button
            onClick={onPrimaryAction}
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all"
          >
            {primaryActionText}
          </button>
        )}
        {secondaryActionText && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-semibold transition-all"
          >
            {secondaryActionText}
          </button>
        )}
      </div>
    </div>
  );
};
