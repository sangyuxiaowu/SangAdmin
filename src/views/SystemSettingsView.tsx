import React, { useState } from 'react';
import {
  Sliders,
  ShieldAlert,
  Clock,
  Key,
  Save,
  Lock,
  Server,
  Database,
  RefreshCw,
  Cpu,
  Layers,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { CustomSelect } from '../components/common/CustomSelect';
import { AccessDeniedView } from './AccessDeniedView';

interface SystemSettingsViewProps {
  onNavigate: (path: string) => void;
}

export const SystemSettingsView: React.FC<SystemSettingsViewProps> = ({ onNavigate }) => {
  const { hasPermission, addActivityLog } = useAuth();
  const { showAlert } = useModal();

  const [maintenance, setMaintenance] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [passwordMinLength, setPasswordMinLength] = useState('8');
  const [require2FA, setRequire2FA] = useState(true);
  const [apiRateLimit, setApiRateLimit] = useState('1000');
  const [logRetentionDays, setLogRetentionDays] = useState('90');

  if (!hasPermission('system:view')) {
    return <AccessDeniedView requiredPermission="system:view" onNavigate={onNavigate} />;
  }

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission('system:config')) {
      showAlert({
        title: '权限拦截',
        message: '权限不足：无法变更系统参数配置',
        type: 'danger'
      });
      return;
    }
    addActivityLog('更新核心策略', '成功保存了会话超时、密码强度及全局维护状态策略', 'success');
    showAlert({
      title: '策略更新成功',
      message: '核心系统策略参数已成功保存并立即生效。',
      type: 'success'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              核心系统策略
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            管理全站无操作超时锁定、密码复杂度、维护模式以及分布式容器节点健康状态
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveConfig} className="space-y-6 text-xs sm:text-sm">
        {/* Security & Access Policies */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-indigo-500" />
            <span>基础安全合规策略</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                无操作自动锁定会话时长 (分钟)
              </label>
              <CustomSelect
                value={sessionTimeout}
                onChange={val => setSessionTimeout(val)}
                modalTitle="选择会话锁定超时"
                options={[
                  { value: '15', label: '15 分钟', description: '适合极高安全级别要求' },
                  { value: '30', label: '30 分钟 (推荐)', description: '兼顾安全性与使用便利' },
                  { value: '60', label: '60 分钟', description: '长任务处理模式' },
                  { value: '120', label: '2 小时', description: '宽松会话模式' }
                ]}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                强制强密码最小字符长度
              </label>
              <input
                type="number"
                min="6"
                max="32"
                value={passwordMinLength}
                onChange={e => setPasswordMinLength(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 font-semibold focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                单 IP 每分钟 API 限流阈值 (QPM)
              </label>
              <input
                type="number"
                min="100"
                max="10000"
                value={apiRateLimit}
                onChange={e => setApiRateLimit(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 font-semibold focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                审计操作日志保留周期 (天)
              </label>
              <input
                type="number"
                min="30"
                max="365"
                value={logRetentionDays}
                onChange={e => setLogRetentionDays(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 font-semibold focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={require2FA}
                onChange={e => setRequire2FA(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  强制全员开启 2FA 双因子安全身份验证
                </span>
                <p className="text-[11px] text-slate-400">
                  开启后，未配置 Passkey 或 TOTP 的用户登录时将被强制引导至安全绑定页。
                </p>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={maintenance}
                onChange={e => setMaintenance(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  开启系统维护模式
                </span>
                <p className="text-[11px] text-slate-400">
                  非管理员角色登录时将提示 503 维护卡片并暂时阻断写入请求。
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Database & Cluster Runtime Status */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-500" />
            <span>分布式容器节点与集群状态</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                <span>组件内存占用</span>
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                128 MB / 512 MB
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                <Database className="w-3.5 h-3.5 text-emerald-500" />
                <span>连接池状态</span>
              </div>
              <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                12/20 健康活跃
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                <Activity className="w-3.5 h-3.5 text-blue-500" />
                <span>集群健康评分</span>
              </div>
              <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1">
                99.98% SLA
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                <Layers className="w-3.5 h-3.5 text-purple-500" />
                <span>日志落盘加密</span>
              </div>
              <div className="text-sm font-bold text-purple-600 dark:text-purple-400 mt-1">
                AES-256-GCM
              </div>
            </div>
          </div>
        </div>

        {hasPermission('system:config') && (
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>保存更新策略</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
