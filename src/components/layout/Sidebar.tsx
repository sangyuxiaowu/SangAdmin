import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  ShieldCheck,
  UserCheck,
  KeyRound,
  UserCog,
  Settings2,
  Sliders,
  FileText,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldAlert,
  LogOut,
  Layers,
  ListOrdered,
  TableProperties,
  BellRing,
  CheckCircle2,
  Building2,
  Fingerprint,
  Ban
} from 'lucide-react';
import { NAV_ITEMS } from '../../data/navigation';
import { useAuth } from '../../context/AuthContext';
import type { NavItem } from '../../types';
import { DEFAULT_AVATAR } from '../../utils';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  BarChart3,
  ShieldCheck,
  Users,
  UserCheck,
  KeyRound,
  UserCog,
  Settings2,
  Sliders,
  FileText,
  Layers,
  ListOrdered,
  TableProperties,
  BellRing,
  CheckCircle2,
  Building2,
  Fingerprint,
  Ban
};

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile
}) => {
  const { currentUser, hasPermission, logout, switchDemoUser } = useAuth();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'rbac-group': true,
    'system-group': false
  });

  // State for floating submenu popover when collapsed
  const [popoverGroup, setPopoverGroup] = useState<{
    item: NavItem;
    top: number;
    left: number;
  } | null>(null);

  // Clear popover when collapsed state or path changes
  useEffect(() => {
    setPopoverGroup(null);
  }, [collapsed, currentPath]);

  const toggleGroup = (id: string) => {
    setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isGroupActive = (item: NavItem) => {
    if (item.children) {
      return item.children.some(child => child.path === currentPath);
    }
    return item.path === currentPath;
  };

  const handleGroupClick = (item: NavItem, e: React.MouseEvent<HTMLButtonElement>) => {
    if (collapsed) {
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      const childCount = item.children?.length || 1;
      const popoverHeight = childCount * 42 + 56;
      const computedTop = Math.min(rect.top, window.innerHeight - popoverHeight - 16);

      if (popoverGroup?.item.id === item.id) {
        setPopoverGroup(null);
      } else {
        setPopoverGroup({
          item,
          top: Math.max(16, computedTop),
          left: rect.right + 10
        });
      }
    } else {
      toggleGroup(item.id);
    }
  };

  // Filter menu items by user permissions
  const renderNavItem = (item: NavItem) => {
    // If item requires permission and user does not have it, omit or disable
    if (item.permission && !hasPermission(item.permission)) {
      return null;
    }

    const IconComponent = ICON_MAP[item.icon] || LayoutDashboard;
    const active = isGroupActive(item);
    const isPopoverOpen = popoverGroup?.item.id === item.id;

    if (item.children) {
      // Filter children by permission
      const allowedChildren = item.children.filter(
        child => !child.permission || hasPermission(child.permission)
      );

      if (allowedChildren.length === 0) return null;

      const isExpanded = openGroups[item.id] || active;

      return (
        <div key={item.id} className="space-y-1 relative">
          <button
            onClick={e => handleGroupClick(item, e)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              active || (collapsed && isPopoverOpen)
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/60 ring-1 ring-indigo-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
            title={collapsed ? `${item.title} (点击展开菜单)` : undefined}
          >
            <div className="flex items-center space-x-3 min-w-0">
              <IconComponent className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.title}</span>}
            </div>
            {!collapsed && (
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 shrink-0 ${
                  isExpanded ? 'transform rotate-180' : ''
                }`}
              />
            )}
          </button>

          {(!collapsed && isExpanded) && (
            <div className="pl-9 pr-2 space-y-1 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-px before:bg-slate-200 dark:before:bg-slate-800">
              {allowedChildren.map(child => {
                const ChildIcon = ICON_MAP[child.icon] || LayoutDashboard;
                const isChildActive = currentPath === child.path;

                return (
                  <button
                    key={child.id}
                    onClick={() => {
                      onNavigate(child.path);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isChildActive
                        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 font-semibold'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <ChildIcon className="w-4 h-4 shrink-0" />
                    <span>{child.title}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={item.id}
        onClick={() => {
          onNavigate(item.path);
          onCloseMobile();
          setPopoverGroup(null);
        }}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          active
            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/25 dark:text-indigo-400 font-semibold'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
        }`}
        title={collapsed ? item.title : undefined}
      >
        <div className="flex items-center space-x-3">
          <IconComponent className={`w-5 h-5 shrink-0 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`} />
          {!collapsed && <span>{item.title}</span>}
        </div>
        {!collapsed && item.badge && (
          <span
            className={`px-2 py-0.5 text-xs rounded-full ${
              active
                ? 'bg-indigo-200/60 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 font-semibold'
                : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold'
            }`}
          >
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800/80">
          <div
            onClick={() => onNavigate('/dashboard')}
            className="flex items-center space-x-3 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            {!collapsed && (
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                SangAdmin
              </span>
            )}
          </div>

          {/* Collapse Toggle Button (Desktop) */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={collapsed ? '展开侧边栏' : '折叠侧边栏'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          {!collapsed && (
            <div className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              主控模块
            </div>
          )}
          {NAV_ITEMS.map(item => renderNavItem(item))}
        </div>

        {/* User Status / Quick Switch Section */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          {!collapsed ? (
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <img
                    src={currentUser?.avatar || DEFAULT_AVATAR}
                    alt={currentUser?.name || '用户头像'}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/30"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      {currentUser?.name}
                    </div>
                    <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium truncate flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 inline" />
                      {currentUser?.roleName}
                    </div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="退出登录"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Demo Role Switcher Dropdown inside sidebar */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/50">
                <div className="text-[10px] text-slate-400 mb-1">演示权限体验（一键切换身份）:</div>
                <select
                  value={currentUser?.id}
                  onChange={e => switchDemoUser(e.target.value)}
                  className="w-full text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="usr-1">陆天行 (超级管理员)</option>
                  <option value="usr-2">林雨晴 (系统运维官)</option>
                  <option value="usr-3">陈明哲 (数据分析师)</option>
                  <option value="usr-4">张薇薇 (运营编辑官)</option>
                  <option value="usr-5">体验账号 (访客体验员)</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <img
                src={currentUser?.avatar || DEFAULT_AVATAR}
                alt={currentUser?.name || '用户头像'}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/30"
                title={`${currentUser?.name || ''} (${currentUser?.roleName || ''})`}
              />
            </div>
          )}
        </div>
      </aside>

      {/* Collapsed Sidebar Floating Submenu Popover Portal */}
      {collapsed && popoverGroup && createPortal(
        <>
          {/* Backdrop overlay to dismiss popover when clicking outside */}
          <div
            className="fixed inset-0 z-50 bg-black/5 dark:bg-black/20"
            onClick={() => setPopoverGroup(null)}
          />

          {/* Floating Submenu Card */}
          <div
            className="fixed z-[51] w-56 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl p-2.5 animate-fade-in"
            style={{
              top: `${popoverGroup.top}px`,
              left: `${popoverGroup.left}px`
            }}
          >
            {/* Popover Header */}
            <div className="px-3 py-2 mb-1.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center space-x-2 min-w-0">
                {React.createElement(ICON_MAP[popoverGroup.item.icon] || LayoutDashboard, {
                  className: 'w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0'
                })}
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                  {popoverGroup.item.title}
                </span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
                {popoverGroup.item.children?.filter(c => !c.permission || hasPermission(c.permission)).length}
              </span>
            </div>

            {/* Submenu Items List */}
            <div className="space-y-1">
              {popoverGroup.item.children
                ?.filter(child => !child.permission || hasPermission(child.permission))
                .map(child => {
                  const ChildIcon = ICON_MAP[child.icon] || LayoutDashboard;
                  const isChildActive = currentPath === child.path;

                  return (
                    <button
                      key={child.id}
                      onClick={() => {
                        onNavigate(child.path);
                        onCloseMobile();
                        setPopoverGroup(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isChildActive
                          ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/60 font-semibold shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <ChildIcon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{child.title}</span>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
};
