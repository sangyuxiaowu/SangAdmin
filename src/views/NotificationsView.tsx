import React, { useState, useMemo } from 'react';
import type { SystemNotification } from '../types';
import { NotificationCategoryTabs } from '../components/business/notifications/NotificationCategoryTabs';
import type { NotificationTypeFilter } from '../components/business/notifications/NotificationCategoryTabs';
import { NotificationListItem } from '../components/business/notifications/NotificationListItem';
import { NotificationDetailModal } from '../components/business/notifications/NotificationDetailModal';
import { useModal } from '../context/ModalContext';

const MOCK_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-1',
    title: '系统级版本升版完成 (v3.5.0-Stable)',
    message: 'NovaAdmin 已成功完成灰度构建发布，引入了全量轻量级浅色/深色主题适配、组件细粒度拆分与性能提升。',
    timestamp: '10 分钟前',
    read: false,
    type: 'system',
    link: '/settings',
  },
  {
    id: 'notif-2',
    title: '高危异地登录风险预警',
    message: '检测到账号 @lin.yu 尝试从未知 IP (183.192.14.88) 尝试进行 SSH 密钥验证，已被 WAF 安全防护规则阻断。',
    timestamp: '1 小时前',
    read: false,
    type: 'security',
    link: '/audit',
  },
  {
    id: 'notif-3',
    title: '待办审批提醒：Redis 集群规格扩容申请',
    message: '陆天行 发起了生产环境 Redis 集群规格扩容申请 (#WO-20268801)，优先级为 P1，需要您在 24 小时内进行初审。',
    timestamp: '3 小时前',
    read: false,
    type: 'task',
    link: '/resource-list',
  },
  {
    id: 'notif-4',
    title: '定期数据库自动快照归档成功',
    message: 'PostgreSQL 生产库离线冷备文件 snapshot-20260731.sql.gz 已加密上传至多区域存储桶。',
    timestamp: '12 小时前',
    read: true,
    type: 'system',
    link: '/settings',
  },
  {
    id: 'notif-5',
    title: 'RBAC 角色权限节点变动通知',
    message: '角色 [系统运维官] 已新增 [system:config] 细粒度控制权限节点。',
    timestamp: '昨天 18:30',
    read: true,
    type: 'task',
    link: '/permissions',
  },
];

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
