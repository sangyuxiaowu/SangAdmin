import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { AuthIpBanSection } from '../components/business/security/AuthIpBanSection';
import { useAuth } from '../context/AuthContext';
import { AccessDeniedView } from './AccessDeniedView';

interface AuthSecurityViewProps {
  onNavigate?: (path: string) => void;
}

export const AuthSecurityView: React.FC<AuthSecurityViewProps> = ({ onNavigate }) => {
  const { hasPermission } = useAuth();

  if (!hasPermission('system:view')) {
    return <AccessDeniedView onBack={() => onNavigate?.('/dashboard')} />;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              认证设置与 IP 封禁管理
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            设置登录试错禁用阈值、最大尝试次数，并实时管控拦截处于封禁状态的 IP 地址
          </p>
        </div>
      </div>

      {/* Content */}
      <AuthIpBanSection />
    </div>
  );
};
