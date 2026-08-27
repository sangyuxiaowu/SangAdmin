import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Filter,
  Layers,
  Zap,
  Globe,
  Award,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { CHART_DATA_RADAR, CHART_DATA_REGIONS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { AccessDeniedView } from './AccessDeniedView';

interface AnalyticsViewProps {
  onNavigate: (path: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onNavigate }) => {
  const { hasPermission, addActivityLog } = useAuth();

  if (!hasPermission('analytics:view')) {
    return <AccessDeniedView requiredPermission="analytics:view" onNavigate={onNavigate} />;
  }

  const handleExport = () => {
    if (!hasPermission('analytics:export')) {
      alert('权限拒绝：您的账号无 analytics:export 数据导出权限！');
      return;
    }
    addActivityLog('导出分析', '成功导出全量商业智能分析月度Excel', 'success');
    alert('商业智能多维分析报表已准备就绪，系统正在为您发起下载...');
  };

  const FUNNEL_STAGES = [
    { stage: '1. 客户端访问 PV', count: '100,000', rate: '100%', color: 'bg-indigo-600' },
    { stage: '2. 账户登录/注册', count: '48,000', rate: '48.0%', color: 'bg-violet-600' },
    { stage: '3. 核心功能交互', count: '24,500', rate: '24.5%', color: 'bg-cyan-600' },
    { stage: '4. 触发商业转换/付费', count: '5,000', rate: '5.0%', color: 'bg-emerald-600' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              商业智能 & 多维数据分析
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            监控系统 SLA 性能指标、用户行为漏斗与地区商业产出成效
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExport}
            className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-xs shadow-md transition-all ${
              hasPermission('analytics:export')
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>导出高阶分析表</span>
          </button>
        </div>
      </div>

      {/* SLA Radar Chart & Funnel Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              系统 SLA 服务质量六维雷达
            </h3>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full">
              综合评分: 95.2分
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            蓝色为当前实时监控评分，灰色为行业 SLA 基准标杆线
          </p>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={CHART_DATA_RADAR}>
                <PolarGrid stroke="#334155" opacity={0.2} />
                <PolarAngleAxis dataKey="category" stroke="#94a3b8" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" fontSize={10} />
                <Radar
                  name="当前监控指标"
                  dataKey="current"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.5}
                />
                <Radar
                  name="行业标杆线"
                  dataKey="benchmark"
                  stroke="#94a3b8"
                  fill="#94a3b8"
                  fillOpacity={0.2}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funnel Stage */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
              <Filter className="w-4 h-4 text-cyan-500" />
              用户全链路转化漏斗
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              从首次访问到最终完成付费或留存的层级流失
            </p>

            <div className="space-y-3">
              {FUNNEL_STAGES.map((item, idx) => (
                <div key={item.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {item.stage}
                    </span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {item.count} ({item.rate})
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} transition-all duration-500 rounded-full`}
                      style={{ width: item.rate }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 mt-6 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 flex items-center space-x-3 text-xs text-indigo-900 dark:text-indigo-200">
            <CheckCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>
              转化率为 5.0%，较行业标准高出 1.2 个百分点，核心支付流失率保持极低水平。
            </span>
          </div>
        </div>
      </div>

      {/* Regional Performance Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              各大区运营绩效明细矩阵
            </h3>
            <p className="text-xs text-slate-400">
              包含访问量、订单完成率及预估流水贡献
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">大区名称</th>
                <th className="py-3 px-4">活跃用户规模</th>
                <th className="py-3 px-4">订单完成率</th>
                <th className="py-3 px-4">区域流水贡献</th>
                <th className="py-3 px-4">健康状态评级</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {CHART_DATA_REGIONS.map(region => (
                <tr
                  key={region.name}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-500" />
                    {region.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                    {region.users.toLocaleString()} 人
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      {region.orderRate}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                    ￥{region.revenue.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <Award className="w-3.5 h-3.5" /> 优秀级别
                    </span>
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
