import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandPalette } from '../common/CommandPalette';
import { DashboardView } from '../../views/DashboardView';
import { AnalyticsView } from '../../views/AnalyticsView';
import { UserManagementView } from '../../views/UserManagementView';
import { OrgManagementView } from '../../views/OrgManagementView';
import { RoleManagementView } from '../../views/RoleManagementView';
import { PermissionMatrixView } from '../../views/PermissionMatrixView';
import { ProfileView } from '../../views/ProfileView';
import { TwoFactorAuthView } from '../../views/TwoFactorAuthView';
import { AuthSecurityView } from '../../views/AuthSecurityView';
import { SystemSettingsView } from '../../views/SystemSettingsView';
import { AuditLogView } from '../../views/AuditLogView';
import { StepFormView } from '../../views/StepFormView';
import { ResourceListView } from '../../views/ResourceListView';
import { NotificationsView } from '../../views/NotificationsView';
import { ResultStatusView } from '../../views/ResultStatusView';

const DEFAULT_PATH = '/dashboard';

const getHashPath = () => window.location.hash.slice(1) || DEFAULT_PATH;

export const MainLayout: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(getHashPath);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    if (!window.location.hash) {
      window.history.replaceState(null, '', `#${DEFAULT_PATH}`);
    }

    const handleHashChange = () => setCurrentPath(getHashPath());
    window.addEventListener('hashchange', handleHashChange);

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    window.location.hash = path;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderActiveView = () => {
    switch (currentPath) {
      case '/dashboard':
        return <DashboardView onNavigate={handleNavigate} />;
      case '/analytics':
        return <AnalyticsView onNavigate={handleNavigate} />;
      case '/users':
        return <UserManagementView onNavigate={handleNavigate} />;
      case '/org':
        return <OrgManagementView onNavigate={handleNavigate} />;
      case '/roles':
        return <RoleManagementView onNavigate={handleNavigate} />;
      case '/permissions':
        return <PermissionMatrixView onNavigate={handleNavigate} />;
      case '/profile':
        return <ProfileView />;
      case '/security-2fa':
        return <TwoFactorAuthView onNavigate={handleNavigate} />;
      case '/auth-security':
        return <AuthSecurityView onNavigate={handleNavigate} />;
      case '/settings':
        return <SystemSettingsView onNavigate={handleNavigate} />;
      case '/audit':
        return <AuditLogView onNavigate={handleNavigate} />;
      case '/step-form':
        return <StepFormView onNavigate={handleNavigate} />;
      case '/resource-list':
        return <ResourceListView onNavigate={handleNavigate} />;
      case '/notifications':
        return <NotificationsView onNavigate={handleNavigate} />;
      case '/result-status':
        return <ResultStatusView onNavigate={handleNavigate} />;
      default:
        return <DashboardView onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      {/* Sidebar navigation */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={handleNavigate}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          collapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Header bar */}
        <Header
          onToggleMobileMenu={() => setMobileOpen(!mobileOpen)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          currentPath={currentPath}
          onNavigate={handleNavigate}
        />

        {/* Dynamic View Route Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>
            © 2026 NovaAdmin Enterprise Platform. 保留所有权利。
          </div>
          <div className="flex items-center space-x-4">
            <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">
              系统隐私标准
            </span>
            <span>·</span>
            <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">
              RBAC 架构规范
            </span>
            <span>·</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
              v3.5.0 Stable
            </span>
          </div>
        </footer>
      </div>

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={handleNavigate}
      />
    </div>
  );
};
