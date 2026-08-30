import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  ArrowUpRight,
  Shield,
  Download,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  Clock,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  CHART_DATA_TREND,
  CHART_DATA_REGIONS,
  CHART_DATA_DEVICES
} from '$mock';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionContext';
import { DEFAULT_AVATAR } from '../utils';

interface DashboardViewProps {
  onNavigate: (path: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { currentUser, activityLogs, hasPermission, addActivityLog } = useAuth();
  const { users, roles } = usePermissions();

  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleExportData = () => {
    addActivityLog('导出报表', '下载首页运营与流量概览CSV文件', 'success');
    alert('概览数据报表 (CSV) 导出成功！');
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const activeUserCount = users.filter(u => u.status === 'active').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner / Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl shadow-indigo-900/10">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-400 via-violet-400 to-transparent" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>SangAdmin v3.5 企业级管控大屏</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              欢迎回来，{currentUser?.name} 👋
            </h1>
            <p className="text-sm text-indigo-200/90 leading-relaxed">
              您当前以【{currentUser?.roleName}】身份运行中。全站核心服务状态指标正常，并发吞吐稳定在 99.98%。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRefresh}
              className={`p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/10 ${
                isRefreshing ? 'animate-spin' : ''
              }`}
              title="刷新数据指标"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {hasPermission('dashboard:export') && (
              <button
                onClick={handleExportData}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-medium text-xs shadow-lg shadow-indigo-500/30 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>导出数据报表</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('/analytics')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-semibold text-xs shadow-lg transition-all"
            >
              <span>查看深度分析</span>
              <ArrowUpRight className="w-4 h-4 text-indigo-600" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              月度总流水收入 (GMV)
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
              ￥1,284,500
            </div>
            <div className="flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              +18.4%
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">较上月同比增长 ￥201,300</p>
        </div>

        {/* Card 2 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              全站激活账号 / 角色
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {activeUserCount} 人
            </div>
            <div className="text-xs font-medium text-slate-500">
              {roles.length} 个角色类型
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            包含 {users.filter(u => u.status === 'suspended').length} 个待解封或受限账号
          </p>
        </div>

        {/* Card 3 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              日均访问量 (PageViews)
            </span>
            <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
              28,900
            </div>
            <div className="flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              +12.1%
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">独立访客 UV: 18,400人/日</p>
        </div>

        {/* Card 4 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              系统安全与合规指数
            </span>
            <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
              99.98%
            </div>
            <div className="flex items-center text-xs font-semibold text-cyan-600 dark:text-cyan-400">
              已开启 2FA
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">近30天无异常越权与安全拦截事件</p>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Traffic & Revenue Area Chart (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                流量与营收趋势双轴分析
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                实时聚合 PageViews 与各时间节点的商业转换率
              </p>
            </div>

            <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
              {(['7d', '30d', '90d'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    timeRange === range
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {range === '7d' ? '近7天' : range === '30d' ? '近30天' : '本季度'}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="pvGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="pv"
                  name="访问量 PV"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#pvGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="总转化额 ￥"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Sources Donut Chart (1 Col) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
              客户端设备与来源分布
            </h3>
            <p className="text-xs text-slate-400">设备类型及浏览器终端占比</p>

            <div className="h-56 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CHART_DATA_DEVICES}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {CHART_DATA_DEVICES.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            {CHART_DATA_DEVICES.map(dev => (
              <div key={dev.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dev.color }} />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{dev.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-100">{dev.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Regional Performance + Audit Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Bar Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                大区活跃用户与订单成效
              </h3>
              <p className="text-xs text-slate-400">主要地理大区营收与响应满意度</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CHART_DATA_REGIONS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="users" name="活跃用户量" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="orderRate" name="转换完成率 %" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Realtime Activity Audit Stream */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  全站实时操作痕迹与审计 Feed
                </h3>
              </div>
              {hasPermission('audit:view') && (
                <button
                  onClick={() => onNavigate('/audit')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  完整日志 <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="space-y-3">
              {activityLogs.slice(0, 4).map(log => (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 flex items-start space-x-3 text-xs"
                >
                  <img
                    src={log.userAvatar || DEFAULT_AVATAR}
                    alt={log.userName || '用户'}
                    className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {log.userName}
                      </span>
                      <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mt-0.5 truncate">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400 mr-1">
                        [{log.action}]
                      </span>
                      {log.target}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <span className="text-xs text-slate-400">
              已与云端审计中心日志同步，采用区块链散列不可篡改技术保护
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
