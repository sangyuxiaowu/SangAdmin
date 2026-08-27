import React from 'react';
import { ShieldAlert, ArrowLeft, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AccessDeniedProps {
  requiredPermission?: string;
  onNavigate: (path: string) => void;
}

export const AccessDeniedView: React.FC<AccessDeniedProps> = ({
  requiredPermission,
  onNavigate
}) => {
  const { currentUser, switchDemoUser } = useAuth();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-3xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-6 shadow-xl shadow-rose-500/10">
        <ShieldAlert className="w-10 h-10" />
      </div>

      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
        403 - 访问受限 / 权限不足
      </h1>

      <p className="max-w-md text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
        您当前登录的账号角色为{' '}
        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
          【{currentUser?.roleName}】
        </span>
        ，未包含访问该模块所需的{' '}
        {requiredPermission && (
          <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-rose-500 font-mono text-xs">
            {requiredPermission}
          </code>
        )}{' '}
        权限节点。
      </p>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-sm max-w-sm w-full mb-8 text-left">
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-indigo-500" />
          快捷切换至高权限账号测试:
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => switchDemoUser('usr-1')}
            className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-left transition-colors font-medium"
          >
            切为: 超级管理员
          </button>
          <button
            onClick={() => switchDemoUser('usr-2')}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-left transition-colors font-medium"
          >
            切为: 系统运维官
          </button>
        </div>
      </div>

      <button
        onClick={() => onNavigate('/dashboard')}
        className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white font-medium text-sm shadow-md hover:bg-slate-800 dark:hover:bg-indigo-500 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>返回工作台首页</span>
      </button>
    </div>
  );
};
