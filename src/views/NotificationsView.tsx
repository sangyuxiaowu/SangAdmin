import React, { useState, useMemo } from 'react';
import type { SystemNotification } from '../types';
import { NotificationCategoryTabs } from '../components/business/notifications/NotificationCategoryTabs';
import type { NotificationTypeFilter } from '../components/business/notifications/NotificationCategoryTabs';
import { NotificationListItem } from '../components/business/notifications/NotificationListItem';
import { NotificationDetailModal } from '../components/business/notifications/NotificationDetailModal';
import { useModal } from '../context/ModalContext';
import { MOCK_NOTIFICATIONS } from '$mock';

interface NotificationsViewProps {
  onNavigate?: (path: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ onNavigate }) => {
  const { alert } = useModal();
  const [notifications, setNotifications] = useState<SystemNotification[]>(MOCK_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<NotificationTypeFilter>('all');
  const [selectedNotif, setSelectedNotif] = useState<SystemNotification | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Category counts
  const counts = useMemo(() => {
    return {
      all: notifications.filter(n => !n.read).length,
      system: notifications.filter(n => n.type === 'system' && !n.read).length,
      security: notifications.filter(n => n.type === 'security' && !n.read).length,
      task: notifications.filter(n => n.type === 'task' && !n.read).length,
    };
  }, [notifications]);

  // Filtered list
  const filteredNotifications = useMemo(() => {
    if (activeTab === 'all') return notifications;
    return notifications.filter(n => n.type === activeTab);
  }, [notifications, activeTab]);

  const handleToggleRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    alert('全部标为已读', '当前所有通知提醒已设为已读状态。', 'success');
  };

  const handleOpenDetail = (notif: SystemNotification) => {
    setSelectedNotif(notif);
    setDetailModalOpen(true);
    // Auto mark as read
    if (!notif.read) {
      setNotifications(prev =>
        prev.map(n => (n.id === notif.id ? { ...n, read: true } : n))
      );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            消息通知与预警中心模板 (Notification Center)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            聚合分类系统通告、安全风险预警与待办审批提醒，支持一键已读与跳转响应。
          </p>
        </div>
      </div>

      {/* Tabs bar component */}
      <NotificationCategoryTabs
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        counts={counts}
        onMarkAllAsRead={handleMarkAllAsRead}
      />

      {/* List items */}
      <div className="space-y-3">
        {filteredNotifications.map(notif => (
          <NotificationListItem
            key={notif.id}
            notification={notif}
            onClick={handleOpenDetail}
            onToggleRead={handleToggleRead}
          />
        ))}

        {filteredNotifications.length === 0 && (
          <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
            暂无该分类下的消息通知
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <NotificationDetailModal
        notification={selectedNotif}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onNavigate={onNavigate}
      />
    </div>
  );
};
