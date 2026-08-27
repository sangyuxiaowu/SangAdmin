import React from 'react';
import { Fingerprint, ShieldCheck } from 'lucide-react';
import { TwoFactorAuthSection } from '../components/business/security/TwoFactorAuthSection';
import { useAuth } from '../context/AuthContext';
import { AccessDeniedView } from './AccessDeniedView';

interface TwoFactorAuthViewProps {
  onNavigate?: (path: string) => void;
}

export const TwoFactorAuthView: React.FC<TwoFactorAuthViewProps> = ({ onNavigate }) => {
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
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              2FA 与安全凭据设置
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            配置 Passkey 通行密钥（指纹/面容/FIDO2 硬件钥匙）与 TOTP 动态口令双因素身份验证
          </p>
        </div>
      </div>

      {/* Main 2FA Content */}
      <TwoFactorAuthSection />
    </div>
  );
};
