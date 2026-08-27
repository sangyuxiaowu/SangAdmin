import React from 'react';
import { Bell, ShieldAlert, CheckSquare, ChevronRight, Mail, MailOpen } from 'lucide-react';
import type { SystemNotification } from '../../../types';

interface NotificationListItemProps {
  notification: SystemNotification;
  onClick: (notification: SystemNotification) => void;
  onToggleRead: (id: string, e: React.MouseEvent) => void;
}

export const NotificationListItem: React.FC<NotificationListItemProps> = ({
  notification,
  onClick,
  onToggleRead,
}) => {
  const renderIcon = () => {
    switch (notification.type) {
      case 'system':
        return (
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
        );
      case 'security':
        return (
          <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
        );
      case 'task':
        return (
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <CheckSquare className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div
      onClick={() => onClick(notification)}
      className={`group p-4 bg-white dark:bg-slate-900 border rounded-2xl shadow-sm cursor-pointer transition-all flex items-start justify-between gap-4 ${
        notification.read
          ? 'border-slate-200/60 dark:border-slate-800/80 opacity-75 hover:opacity-100'
          : 'border-indigo-200/80 dark:border-indigo-900/60 ring-1 ring-indigo-500/10 dark:bg-slate-900/90'
      }`}
    >
      <div className="flex items-start space-x-3.5 min-w-0">
        {renderIcon()}

        <div className="space-y-1 min-w-0">
          <div className="flex items-center space-x-2">
            {!notification.read && (
              <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" />
            )}
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
              {notification.title}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
            {notification.message}
          </p>
          <div className="text-[11px] text-slate-400 font-mono pt-1">
            {notification.timestamp}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-1 shrink-0 self-center">
        <button
          onClick={(e) => onToggleRead(notification.id, e)}
          title={notification.read ? '标为未读' : '标为已读'}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          {notification.read ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4 text-indigo-600" />}
        </button>
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  );
};
