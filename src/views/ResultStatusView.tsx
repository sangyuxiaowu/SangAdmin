import React, { useState } from 'react';
import { ResultCard } from '../components/business/result-status/ResultCard';
import type { ResultType } from '../components/business/result-status/ResultCard';

interface ResultStatusViewProps {
  onNavigate?: (path: string) => void;
}

export const ResultStatusView: React.FC<ResultStatusViewProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<ResultType>('success');

  const tabs: { id: ResultType; label: string }[] = [
    { id: 'success', label: '操作成功 (Success)' },
    { id: 'error', label: '操作失败 (Error)' },
    { id: '404', label: '404 资源未找到' },
    { id: '403', label: '403 无权限访问' },
    { id: 'warning', label: '系统警告 (Warning)' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            结果与异常状态页模板 (Result & Exception Page Showcase)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            提供标准化的 404、403、成功提交与失败反馈界面模板，保持系统 UI 视觉一致性。
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center space-x-2 border-b border-slate-200/80 dark:border-slate-800 pb-3 overflow-x-auto custom-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dynamic Display of active ResultCard */}
      <div className="py-6">
        {activeTab === 'success' && (
          <ResultCard
            type="success"
            title="数据同步部署指令已发送"
            subTitle="系统已成功完成规则配置并分发至 12 个边缘计算节点。预计在 30 秒内全网同步生效。"
            primaryActionText="返回工作台主页"
            onPrimaryAction={() => onNavigate && onNavigate('/dashboard')}
            secondaryActionText="查看工单列表"
            onSecondaryAction={() => onNavigate && onNavigate('/resource-list')}
          >
            <div className="space-y-1">
              <div className="font-bold text-slate-800 dark:text-slate-200">操作详情节点摘要:</div>
              <p>· 部署变更号: #DEPLOY-2026073109</p>
              <p>· 目标节点集群: Asia-East (HongKong) & US-West</p>
              <p>· 耗时: 1.42s · 校验算法: SHA-256 Validated</p>
            </div>
          </ResultCard>
        )}

        {activeTab === 'error' && (
          <ResultCard
            type="error"
            title="提交失败，请求参数校验不通过"
            subTitle="检测到您填写的 Webhook 回调地址未能响应 HTTP 200 状态码，系统阻止了本次部署。"
            primaryActionText="修改并重新提交"
            onPrimaryAction={() => onNavigate && onNavigate('/step-form')}
            secondaryActionText="联系系统管理员"
            onSecondaryAction={() => onNavigate && onNavigate('/users')}
          >
            <div className="space-y-1 text-rose-600 dark:text-rose-400 font-mono text-[11px]">
              <p>[Error 502]: Connection timeout during handshake with endpoint.</p>
              <p>Host: oapi.dingtalk.com | Trace ID: #TR-99812401</p>
            </div>
          </ResultCard>
        )}

        {activeTab === '404' && (
          <ResultCard
            type="404"
            title="404 - 抱歉，您访问的页面不存在"
            subTitle="可能该页面已被移除、重命名或您输入了错误的 URL 路径地址。"
            primaryActionText="返回控制台首页"
            onPrimaryAction={() => onNavigate && onNavigate('/dashboard')}
            secondaryActionText="重新检索功能"
            onSecondaryAction={() => alert('提示: 您可使用 Ctrl+K 打开命令面板快速检索')}
          />
        )}

        {activeTab === '403' && (
          <ResultCard
            type="403"
            title="403 - 访问受限，权限不足"
            subTitle="当前登录账号缺少此页面所需的细粒度 RBAC 授权节点，请联系超级管理员或团队负责人授权。"
            primaryActionText="返回控制台首页"
            onPrimaryAction={() => onNavigate && onNavigate('/dashboard')}
            secondaryActionText="一键切换演示账号"
            onSecondaryAction={() => onNavigate && onNavigate('/permissions')}
          >
            <div className="space-y-1">
              <div className="font-bold text-slate-800 dark:text-slate-200">缺失的权限节点:</div>
              <p className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                permission:manage (权限树分配矩阵)
              </p>
            </div>
          </ResultCard>
        )}

        {activeTab === 'warning' && (
          <ResultCard
            type="warning"
            title="系统提示：磁盘空间告警 (88%)"
            subTitle="主节点逻辑卷 /var/log/ 剩余可用容量已低于 15%，请及时清理旧审计日志或扩容挂载卷。"
            primaryActionText="查看全站审计日志"
            onPrimaryAction={() => onNavigate && onNavigate('/audit')}
            secondaryActionText="去系统运维设置"
            onSecondaryAction={() => onNavigate && onNavigate('/settings')}
          />
        )}
      </div>
    </div>
  );
};
