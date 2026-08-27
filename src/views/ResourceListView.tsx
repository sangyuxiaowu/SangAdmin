import React, { useState, useMemo } from 'react';
import { ResourceFilterBar } from '../components/business/resource-list/ResourceFilterBar';
import type { ResourceFilterState } from '../components/business/resource-list/ResourceFilterBar';
import { ResourceTable } from '../components/business/resource-list/ResourceTable';
import type { WorkOrderItem } from '../components/business/resource-list/ResourceTable';
import { ResourceDetailDrawer } from '../components/business/resource-list/ResourceDetailDrawer';
import { ResourceBatchActionBar } from '../components/business/resource-list/ResourceBatchActionBar';
import { useModal } from '../context/ModalContext';

const INITIAL_WORK_ORDERS: WorkOrderItem[] = [
  {
    id: 'wo-1',
    code: 'WO-20268801',
    title: '生产环境 Redis 缓存集群规格扩容',
    applicant: '陆天行',
    applicantAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    department: '架构运维中心',
    category: '基础架构与云资源',
    priority: 'P1',
    status: 'pending',
    createdAt: '2026-07-31 10:30',
  },
  {
    id: 'wo-2',
    code: 'WO-20268802',
    title: 'MySQL 数据库只读库节点挂载与提权',
    applicant: '林雨晴',
    applicantAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
    department: '系统运维部',
    category: 'RBAC 权限提权变更',
    priority: 'P0',
    status: 'processing',
    createdAt: '2026-07-31 09:15',
  },
  {
    id: 'wo-3',
    code: 'WO-20268803',
    title: 'Q3 财报核心销售数据报表脱敏导出',
    applicant: '陈明哲',
    applicantAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    department: '商业智能与大数据中心',
    category: '数据分析与报表导出',
    priority: 'P2',
    status: 'completed',
    createdAt: '2026-07-30 16:45',
  },
  {
    id: 'wo-4',
    code: 'WO-20268804',
    title: '前端静态 CDN 边缘节点黑名单规则同步',
    applicant: '张薇薇',
    applicantAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
    department: '运营研发部',
    category: '基础架构与云资源',
    priority: 'P1',
    status: 'completed',
    createdAt: '2026-07-30 14:20',
  },
  {
    id: 'wo-5',
    code: 'WO-20268805',
    title: '测试环境 Kubernetes 命名空间权限释放',
    applicant: '李明',
    applicantAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    department: '质量保证部',
    category: 'RBAC 权限提权变更',
    priority: 'P2',
    status: 'rejected',
    createdAt: '2026-07-29 11:05',
  },
];

interface ResourceListViewProps {
  onNavigate?: (path: string) => void;
}

export const ResourceListView: React.FC<ResourceListViewProps> = ({ onNavigate }) => {
  const { alert, confirm } = useModal();
  const [items, setItems] = useState<WorkOrderItem[]>(INITIAL_WORK_ORDERS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeItem, setActiveItem] = useState<WorkOrderItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [filter, setFilter] = useState<ResourceFilterState>({
    searchQuery: '',
    status: 'all',
    category: 'all',
    priority: 'all',
  });

  const handleFilterChange = (patch: Partial<ResourceFilterState>) => {
    setFilter(prev => ({ ...prev, ...patch }));
  };

  const handleResetFilter = () => {
    setFilter({
      searchQuery: '',
      status: 'all',
      category: 'all',
      priority: 'all',
    });
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // status tab
      if (filter.status !== 'all' && item.status !== filter.status) {
        return false;
      }
      // category dropdown
      if (filter.category !== 'all' && item.category !== filter.category) {
        return false;
      }
      // priority dropdown
      if (filter.priority !== 'all' && item.priority !== filter.priority) {
        return false;
      }
      // search query
      if (filter.searchQuery.trim()) {
        const q = filter.searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchCode = item.code.toLowerCase().includes(q);
        const matchApplicant = item.applicant.toLowerCase().includes(q);
        return matchTitle || matchCode || matchApplicant;
      }
      return true;
    });
  }, [items, filter]);

  const handleSelectToggle = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllToggle = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map(i => i.id));
    }
  };

  const handleApprove = (id: string) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, status: 'completed' } : item))
    );
    if (activeItem?.id === id) {
      setActiveItem(prev => (prev ? { ...prev, status: 'completed' } : null));
    }
    alert('审批通过', '已将该工单状态更新为 [已提效完成]，并已自动通知申请人。', 'success');
  };

  const handleReject = (id: string) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, status: 'rejected' } : item))
    );
    if (activeItem?.id === id) {
      setActiveItem(prev => (prev ? { ...prev, status: 'rejected' } : null));
    }
    alert('已驳回工单', '已将该工单状态更新为 [已驳回]，并要求申请人补充材料。', 'warning');
  };

  const handleBatchApprove = () => {
    confirm('批量审核通过', `确认要将选中的 ${selectedIds.length} 项工单批量批准通过吗？`, () => {
      setItems(prev =>
        prev.map(item =>
          selectedIds.includes(item.id) ? { ...item, status: 'completed' } : item
        )
      );
      setSelectedIds([]);
      alert('批量处理成功', '已完成批量审批操作。', 'success');
    });
  };

  const handleBatchDelete = () => {
    confirm('批量删除警告', `确认要从列表中移除选中的 ${selectedIds.length} 项工单记录吗？此操作不可撤销。`, () => {
      setItems(prev => prev.filter(item => !selectedIds.includes(item.id)));
      setSelectedIds([]);
      alert('删除成功', '选中的记录已被物理删除。', 'success');
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            标准工单与资源列表模板 (Resource & Work-order Table Template)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            包含多条件组合筛选、多选批量操作、侧滑详情抽屉与可视化状态流转追踪。
          </p>
        </div>
      </div>

      {/* Filter Bar Component */}
      <ResourceFilterBar
        filter={filter}
        onChange={handleFilterChange}
        onReset={handleResetFilter}
        onCreateNew={() => onNavigate && onNavigate('/step-form')}
        onExport={() => alert('数据导出', '导出 Excel 操作成功，文件已开始下载！', 'info')}
        totalCount={filteredItems.length}
      />

      {/* Table Component */}
      <ResourceTable
        items={filteredItems}
        selectedIds={selectedIds}
        onSelectToggle={handleSelectToggle}
        onSelectAllToggle={handleSelectAllToggle}
        onViewDetail={item => {
          setActiveItem(item);
          setDrawerOpen(true);
        }}
        onApprove={item => handleApprove(item.id)}
        onReject={item => handleReject(item.id)}
      />

      {/* Slide Drawer for Item Details */}
      <ResourceDetailDrawer
        item={activeItem}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onApprove={id => handleApprove(id)}
        onReject={id => handleReject(id)}
      />

      {/* Floating Batch Action Bar */}
      <ResourceBatchActionBar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onBatchApprove={handleBatchApprove}
        onBatchDelete={handleBatchDelete}
        onBatchExport={() => alert('批量导出', `正在打包 ${selectedIds.length} 项工单数据...`, 'info')}
      />
    </div>
  );
};
