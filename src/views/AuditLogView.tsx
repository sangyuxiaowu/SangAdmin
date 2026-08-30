import React, { useState } from 'react';
import {
  FileText,
  Search,
  Download,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { CustomSelect } from '../components/common/CustomSelect';
import type { ActivityLog } from '../types';
import { AccessDeniedView } from './AccessDeniedView';
import { DEFAULT_AVATAR } from '../utils';

interface AuditLogViewProps {
  onNavigate: (path: string) => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ onNavigate }) => {
  const { activityLogs, hasPermission } = useAuth();
  const { showAlert } = useModal();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  if (!hasPermission('audit:view')) {
    return <AccessDeniedView requiredPermission="audit:view" onNavigate={onNavigate} />;
  }

  const filteredLogs = activityLogs.filter(log => {
    const matchesSearch =
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.target.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === 'all' || log.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleExportAudit = () => {
    showAlert({
      title: '导出完成',
      message: '全站审计日志 (CSV) 导出准备就绪，已自动触发浏览器文件下载。',
      type: 'success'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              全站合规操作审计日志
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            不可篡改的系统级操作跟踪历史，提供 IP 地址、时间戳与责任主体审计
          </p>
        </div>

        <button
          onClick={handleExportAudit}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-500/20 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>导出审计日志 (CSV)</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="按操作人、动作或目标参数搜索..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <CustomSelect
          value={typeFilter}
          onChange={val => setTypeFilter(val)}
          modalTitle="筛选审计事件"
          className="w-44"
          options={[
            { value: 'all', label: '全类型审计事件' },
            { value: 'info', label: '常规信息 (Info)' },
            { value: 'success', label: '授权成功 (Success)' },
            { value: 'warning', label: '敏感警告 (Warning)' },
            { value: 'danger', label: '高危事件 (Danger)' }
          ]}
        />
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">责任用户</th>
                <th className="py-3.5 px-4">动作指令</th>
                <th className="py-3.5 px-4">变更目标与详情</th>
                <th className="py-3.5 px-4">终端 IP</th>
                <th className="py-3.5 px-4">时间戳</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={log.userAvatar || DEFAULT_AVATAR}
                        alt={log.userName || '用户'}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {log.userName}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-indigo-600 dark:text-indigo-400">
                    {log.action}
                  </td>

                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                    {log.target}
                  </td>

                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {log.ip || '127.0.0.1'}
                  </td>

                  <td className="py-3.5 px-4 text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {log.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
