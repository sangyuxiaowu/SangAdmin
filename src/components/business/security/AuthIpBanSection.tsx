import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Ban,
  ShieldAlert,
  Info,
  Plus,
  Trash2,
  Unlock,
  RefreshCw,
  Save,
  Search,
  X
} from 'lucide-react';
import { api } from '../../../api/client';
import type { AuthIpBanInfo } from '../../../api/contracts';
import { useAuth } from '../../../context/AuthContext';
import { useModal } from '../../../context/ModalContext';

export const AuthIpBanSection: React.FC = () => {
  const { hasPermission, addActivityLog } = useAuth();
  const { showAlert, showConfirm } = useModal();

  const [banThresholdMinutes, setBanThresholdMinutes] = useState('10');
  const [maxAttempts, setMaxAttempts] = useState('10');
  const [autoBanMinutes, setAutoBanMinutes] = useState('60');
  const [enableAccountLockout, setEnableAccountLockout] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [bannedIps, setBannedIps] = useState<AuthIpBanInfo[]>([]);
  const [ipSearch, setIpSearch] = useState('');
  const [isAddIpModalOpen, setIsAddIpModalOpen] = useState(false);
  const [manualIp, setManualIp] = useState('');
  const [manualDurationMinutes, setManualDurationMinutes] = useState('60');
  const [manualReason, setManualReason] = useState('异常高频密码爆破试错');

  useEffect(() => {
    const load = async () => {
      try {
        const [settingsResult, bansResult] = await Promise.all([
          api.getAuthSecuritySettings(),
          api.getAuthIpBans(),
        ]);
        setBanThresholdMinutes(String(settingsResult.data.failureWindowMinutes));
        setMaxAttempts(String(settingsResult.data.maxAttempts));
        setAutoBanMinutes(String(settingsResult.data.autoBanMinutes));
        setEnableAccountLockout(settingsResult.data.enableAccountLockout);
        setBannedIps(bansResult.data);
      } catch (error) {
        showAlert({
          title: '加载失败',
          message: error instanceof Error ? error.message : '无法加载认证安全设置',
          type: 'danger'
        });
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, [showAlert]);

  const handleSaveAuthSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const failureWindowMinutes = Number(banThresholdMinutes);
    const attempts = Number(maxAttempts);
    const banMinutes = Number(autoBanMinutes);
    if (![failureWindowMinutes, attempts, banMinutes].every(value => Number.isInteger(value) && value > 0)) {
      showAlert({ title: '策略无效', message: '所有策略值都必须是正整数。', type: 'warning' });
      return;
    }

    setIsSavingSettings(true);
    try {
      const result = await api.updateAuthSecuritySettings({
        failureWindowMinutes,
        maxAttempts: attempts,
        autoBanMinutes: banMinutes,
        enableAccountLockout,
      });
      setBanThresholdMinutes(String(result.data.failureWindowMinutes));
      setMaxAttempts(String(result.data.maxAttempts));
      setAutoBanMinutes(String(result.data.autoBanMinutes));
      setEnableAccountLockout(result.data.enableAccountLockout);
      addActivityLog(
        '更新认证防爆破策略',
        `将登录尝试阈值调整为 ${failureWindowMinutes} 分钟内最多允许 ${attempts} 次试错`,
        'info'
      );
      showAlert({
        title: '策略已更新',
        message: '认证安全阈值与防暴力破解策略已生效。',
        type: 'success'
      });
    } catch (error) {
      showAlert({ title: '保存失败', message: error instanceof Error ? error.message : '无法保存认证安全策略', type: 'danger' });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleAddManualIp = async () => {
    const trimmed = manualIp.trim();
    if (!trimmed) {
      showAlert({
        title: '请输入有效 IP',
        message: 'IP 地址不能为空，例如：192.168.1.100 或 203.0.113.45',
        type: 'warning'
      });
      return;
    }

    const duration = Number(manualDurationMinutes);
    if (!Number.isInteger(duration) || duration <= 0) {
      showAlert({ title: '封禁时长无效', message: '封禁时长必须是正整数。', type: 'warning' });
      return;
    }

    setIsMutating(true);
    try {
      const result = await api.banAuthIp({ ip: trimmed, durationMinutes: duration, reason: manualReason || null });
      setBannedIps(prev => [result.data, ...prev.filter(item => item.id !== result.data.id)]);
      setIsAddIpModalOpen(false);
      setManualIp('');
      addActivityLog('手动封禁 IP', `将恶意来源 IP「${result.data.ip}」加入登录黑名单`, 'warning');
      showAlert({ title: '封禁成功', message: `IP「${result.data.ip}」已被加入黑名单。`, type: 'success' });
    } catch (error) {
      showAlert({ title: '封禁失败', message: error instanceof Error ? error.message : '无法封禁 IP', type: 'danger' });
    } finally {
      setIsMutating(false);
    }
  };

  const handleUnbanIp = (item: AuthIpBanInfo) => {
    showConfirm({
      title: '解除 IP 封禁',
      message: `确定要立即为 IP 地址「${item.ip}」解除登录封禁限制吗？`,
      type: 'info',
      confirmText: '立即解封',
      onConfirm: async () => {
        setIsMutating(true);
        try {
          await api.unbanAuthIp(item.id);
          setBannedIps(prev => prev.filter(ban => ban.id !== item.id));
          addActivityLog('解除 IP 封禁', `解除了 IP「${item.ip}」的登录封禁限制`, 'info');
          showAlert({ title: '解封成功', message: `IP「${item.ip}」已恢复正常登录权限。`, type: 'success' });
        } catch (error) {
          showAlert({ title: '解封失败', message: error instanceof Error ? error.message : '无法解除 IP 封禁', type: 'danger' });
        } finally {
          setIsMutating(false);
        }
      }
    });
  };

  const handleClearAllBanned = () => {
    if (bannedIps.length === 0) return;
    showConfirm({
      title: '清空全部被封禁 IP',
      message: '确定要清空当前所有被禁止登录的 IP 黑名单记录吗？',
      type: 'danger',
      confirmText: '确认清空',
      onConfirm: async () => {
        setIsMutating(true);
        try {
          await api.clearAuthIpBans();
          setBannedIps([]);
          addActivityLog('清空 IP 黑名单', '清空了全部处于封禁状态的 IP 列表', 'warning');
          showAlert({ title: '已全部清空', message: '所有受限制的 IP 已全部解封。', type: 'info' });
        } catch (error) {
          showAlert({ title: '清空失败', message: error instanceof Error ? error.message : '无法清空 IP 封禁', type: 'danger' });
        } finally {
          setIsMutating(false);
        }
      }
    });
  };

  const filteredIps = bannedIps.filter(
    item =>
      item.ip.toLowerCase().includes(ipSearch.toLowerCase()) ||
      (item.reason && item.reason.toLowerCase().includes(ipSearch.toLowerCase()))
  );

  const formatDateTime = (value: string) => new Date(value).toLocaleString('zh-CN', { hour12: false });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ============================================================ */}
      {/* 1. 认证设置 (Authentication Policies) */}
      {/* ============================================================ */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              认证设置
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            配置登录网关暴力破解拦截阈值、试错容忍次数与自动封禁时长
          </p>
        </div>

        {/* 提示 Banner */}
        <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 flex items-start space-x-3 text-xs sm:text-sm text-amber-900 dark:text-amber-200">
          <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">
            提示：如果某个 IP 的登录失败次数达到禁用阈值分钟内的最大尝试次数，该 IP 将被禁止登录一段时间。
          </p>
        </div>

        <form onSubmit={handleSaveAuthSettings} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs sm:text-sm">
            {/* 禁止阈值 (分钟) */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-800 dark:text-slate-200">
                禁止阈值（分钟）
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={banThresholdMinutes}
                  onChange={e => setBanThresholdMinutes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 font-semibold focus:border-indigo-600 focus:outline-none transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                统计试错次数的滑动时间窗口（例如连续 10 分钟内）。
              </p>
            </div>

            {/* 最大尝试次数 */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-800 dark:text-slate-200">
                最大尝试次数
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={maxAttempts}
                  onChange={e => setMaxAttempts(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 font-semibold focus:border-indigo-600 focus:outline-none transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                时间窗口内允许的最大密码输错次数，超出后立即触发网关级 IP 封禁。
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-800 dark:text-slate-200">
                自动封禁时长（分钟）
              </label>
              <input
                type="number"
                min="1"
                max="43200"
                value={autoBanMinutes}
                onChange={e => setAutoBanMinutes(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 font-semibold focus:border-indigo-600 focus:outline-none transition-all"
              />
              <p className="text-[11px] text-slate-400">
                达到失败阈值后，来源 IP 的禁止登录时长。
              </p>
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4 cursor-pointer">
            <input
              type="checkbox"
              checked={enableAccountLockout}
              onChange={event => setEnableAccountLockout(event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-indigo-600"
            />
            <span>
              <span className="block font-bold text-slate-800 dark:text-slate-200">
                同时封禁登录账号
              </span>
              <span className="mt-1 block text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                默认关闭。开启后，同一用户名达到失败阈值也会被临时封禁；已知用户名可能被恶意尝试导致账号锁定。
              </span>
            </span>
          </label>

          <div className="flex items-center justify-end pt-2">
            {hasPermission('auth-security.update') && (
              <button
                type="submit"
                disabled={isSavingSettings}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
              >
                {isSavingSettings ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>正在保存...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>保存认证策略</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ============================================================ */}
      {/* 2. 禁止 IP 列表 (Banned IP List) */}
      {/* ============================================================ */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                <Ban className="w-5 h-5 text-rose-500" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                禁止 IP 列表
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              当前被平台认证网关阻止访问和登录的 IP 地址清单
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {hasPermission('auth-security.ban') && (
              <button
                onClick={() => setIsAddIpModalOpen(true)}
                disabled={isMutating || isLoading}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>手动封禁 IP</span>
              </button>
            )}
            {bannedIps.length > 0 && hasPermission('auth-security.clear') && (
              <button
                onClick={handleClearAllBanned}
                disabled={isMutating}
                className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-300 hover:text-rose-600 text-xs font-semibold transition-all disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>清空列表</span>
              </button>
            )}
          </div>
        </div>

        {/* Search bar when there are IPs */}
        {bannedIps.length > 0 && (
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索 IP 地址或封禁原因..."
              value={ipSearch}
              onChange={e => setIpSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
        )}

        {/* Table / List */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/90 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                <th className="py-3 px-4">IP</th>
                <th className="py-3 px-4">尝试次数</th>
                <th className="py-3 px-4">禁用至</th>
                <th className="py-3 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading || filteredIps.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 px-4 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-1">
                        <Ban className="w-6 h-6 stroke-1" />
                      </div>
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {isLoading ? '正在加载' : '暂无数据'}
                      </div>
                      <p className="text-xs text-slate-400 max-w-sm">
                        {isLoading
                          ? '正在读取服务器上的有效封禁记录。'
                          : ipSearch
                          ? '没有匹配搜索条件的封禁记录。'
                          : '当前没有任何 IP 处于禁止登录状态，全站登录网关运行健康。'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredIps.map(item => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                          {item.ip}
                        </span>
                        {item.reason && (
                          <span className="hidden md:inline px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 truncate max-w-xs">
                            {item.reason}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                        {item.attempts} 次试错
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                      {formatDateTime(item.bannedUntil)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {hasPermission('auth-security.unban') && (
                        <button
                          onClick={() => handleUnbanIp(item)}
                          disabled={isMutating}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 font-semibold text-xs transition-colors disabled:opacity-50"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          <span>解除封禁</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL: MANUAL BAN IP MODAL */}
      {/* ============================================================ */}
      {isAddIpModalOpen && hasPermission('auth-security.ban') &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsAddIpModalOpen(false)}
          >
            <div
              className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl p-6 space-y-5"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <Ban className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      手动封禁 IP 地址
                    </h3>
                    <p className="text-xs text-slate-400">
                      禁止指定 IP 访问登录接口
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddIpModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800 dark:text-slate-200">
                    目标 IP 地址 (IPv4 / IPv6)
                  </label>
                  <input
                    type="text"
                    placeholder="例如: 203.0.113.195"
                    value={manualIp}
                    onChange={e => setManualIp(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 font-mono font-semibold focus:border-rose-600 focus:outline-none transition-all"
                    autoFocus
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800 dark:text-slate-200">
                    封禁时长 (分钟)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={manualDurationMinutes}
                    onChange={e => setManualDurationMinutes(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 font-semibold focus:border-rose-600 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800 dark:text-slate-200">
                    封禁原因备注
                  </label>
                  <input
                    type="text"
                    value={manualReason}
                    onChange={e => setManualReason(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:border-rose-600 focus:outline-none transition-all"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsAddIpModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleAddManualIp}
                    disabled={isMutating}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-md shadow-rose-600/20 transition-all flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    <Ban className="w-4 h-4" />
                    <span>执行封禁</span>
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
