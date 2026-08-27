import React from 'react';
import { CheckCheck } from 'lucide-react';

export type NotificationTypeFilter = 'all' | 'system' | 'security' | 'task';

interface NotificationCategoryTabsProps {
  activeTab: NotificationTypeFilter;
  onChangeTab: (tab: NotificationTypeFilter) => void;
  counts: {
    all: number;
    system: number;
    security: number;
    task: number;
  };
  onMarkAllAsRead: () => void;
}

export const NotificationCategoryTabs: React.FC<NotificationCategoryTabsProps> = ({
  activeTab,
  onChangeTab,
  counts,
  onMarkAllAsRead,
}) => {
  const tabs: { id: NotificationTypeFilter; label: string; count: number }[] = [
    { id: 'all', label: '全部消息', count: counts.all },
    { id: 'system', label: '系统发布', count: counts.system },
    { id: 'security', label: '安全预警', count: counts.security },
    { id: 'task', label: '待办审批', count: counts.task },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-3">
      <div className="flex items-center space-x-2 overflow-x-auto custom-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={onMarkAllAsRead}
        className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 shrink-0 self-start sm:self-auto transition-colors"
      >
        <CheckCheck className="w-4 h-4" />
        <span>全部标为已读</span>
      </button>
    </div>
  );
};
