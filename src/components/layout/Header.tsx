import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  Laptop,
  Check,
  User,
  Shield,
  LogOut,
  ChevronRight,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import type { ThemeMode } from '../../types';
import { MOCK_NOTIFICATIONS } from '$mock';
import { DEFAULT_AVATAR } from '../../utils';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  onOpenCommandPalette: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  onOpenCommandPalette,
  currentPath,
  onNavigate
}) => {
  const { mode, setMode, effectiveTheme } = useTheme();
  const { currentUser, logout, switchDemoUser, hasPermission } = useAuth();
  const { showConfirm, showAlert } = useModal();

  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const themeRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Breadcrumbs title helper
  const getBreadcrumbs = () => {
    const maps: Record<string, { group: string; page: string }> = {
      '/dashboard': { group: '主控面板', page: '工作台概览' },
      '/analytics': { group: '数据分析', page: '商业智能看板' },
      '/users': { group: '用户与权限控制', page: '用户账号管理' },
      '/org': { group: '用户与权限控制', page: '组织机构树管理' },
      '/roles': { group: '用户与权限控制', page: '角色模型配置' },
      '/permissions': { group: '用户与权限控制', page: '权限树分配矩阵' },
      '/profile': { group: '系统账号', page: '个人信息维护' },
      '/settings': { group: '系统运维与日志', page: '核心系统策略' },
      '/audit': { group: '系统运维与日志', page: '全站审计日志' }
    };
    return maps[currentPath] || { group: '管理后台', page: '页面视图' };
  };

  const breadcrumb = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 lg:px-6 flex items-center justify-between transition-colors">
      {/* Left side: Mobile menu toggle + Breadcrumb */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb Navigator */}
        <div className="hidden sm:flex items-center text-xs space-x-1.5 font-medium text-slate-500 dark:text-slate-400">
          <span className="hover:text-slate-800 dark:hover:text-slate-200 cursor-default">
            {breadcrumb.group}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 dark:text-slate-100 font-semibold">
            {breadcrumb.page}
          </span>
        </div>
      </div>

      {/* Right side: Search, Theme, Notifications, User Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 text-slate-500 dark:text-slate-400 text-xs transition-all border border-slate-200/50 dark:border-slate-700/50"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="hidden md:inline">搜索功能 / Ctrl+K</span>
          <kbd className="hidden md:inline px-1.5 py-0.5 text-[10px] bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 font-mono text-slate-500">
            ⌘K
          </kbd>
        </button>

        {/* Theme Mode Selector Dropdown */}
        <div className="relative" ref={themeRef}>
          <button
            onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="主题切换"
          >
            {effectiveTheme === 'dark' ? (
              <Moon className="w-5 h-5 text-indigo-400" />
            ) : (
              <Sun className="w-5 h-5 text-amber-500" />
            )}
          </button>

          {themeDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                选择主题模式
              </div>
              {[
                { id: 'light', label: '浅色明亮', icon: Sun },
                { id: 'dark', label: '深色暗黑', icon: Moon },
                { id: 'system', label: '跟随系统', icon: Laptop }
              ].map(item => {
                const IconComponent = item.icon;
                const isSelected = mode === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setMode(item.id as ThemeMode);
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                      isSelected
                        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 font-semibold'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <IconComponent className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="通知中心"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    通知消息中心
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full">
                      {unreadCount} 未读
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                  >
                    全部标为已读
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {notifications.map(item => (
                  <div
                    key={item.id}
                    className={`p-3.5 transition-colors ${
                      !item.read
                        ? 'bg-indigo-50/30 dark:bg-indigo-950/20'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                        {item.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {item.message}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-2 border-t border-slate-100 dark:border-slate-800 text-center bg-slate-50/50 dark:bg-slate-800/30">
                <button
                  onClick={() => {
                    onNavigate('/audit');
                    setNotificationsOpen(false);
                  }}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium inline-flex items-center gap-1"
                >
                  查看全部系统操作日志 <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown Menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center space-x-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <img
              src={currentUser?.avatar || DEFAULT_AVATAR}
              alt={currentUser?.name || '用户头像'}
              className="w-8 h-8 rounded-xl object-cover ring-2 ring-indigo-500/20"
            />
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                {currentUser?.name}
              </span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                {currentUser?.roleName}
              </span>
            </div>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {currentUser?.name}
                </p>
                <p className="text-xs text-slate-400 truncate">{currentUser?.email}</p>
                <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  {currentUser?.roleName}
                </div>
              </div>

              <div className="p-1 space-y-0.5">
                <button
                  onClick={() => {
                    onNavigate('/profile');
                    setUserMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>个人信息与安全</span>
                </button>

                {hasPermission('permissions.read') && (
                  <button
                    onClick={() => {
                      onNavigate('/permissions');
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Shield className="w-4 h-4 text-slate-400" />
                    <span>权限树矩阵分配</span>
                  </button>
                )}
              </div>

              {/* Quick Role Toggle Bar in menu */}
              <div className="p-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="text-[10px] text-slate-400 mb-1 px-1">快速演示身份切换:</div>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  <button
                    onClick={() => {
                      switchDemoUser('usr-1');
                      setUserMenuOpen(false);
                    }}
                    className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-500 text-center truncate"
                  >
                    超级管理员
                  </button>
                  <button
                    onClick={() => {
                      switchDemoUser('usr-3');
                      setUserMenuOpen(false);
                    }}
                    className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-500 text-center truncate"
                  >
                    数据分析师
                  </button>
                  <button
                    onClick={() => {
                      switchDemoUser('usr-4');
                      setUserMenuOpen(false);
                    }}
                    className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-500 text-center truncate"
                  >
                    运营编辑
                  </button>
                  <button
                    onClick={() => {
                      switchDemoUser('usr-5');
                      setUserMenuOpen(false);
                    }}
                    className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-500 text-center truncate"
                  >
                    访客体验员
                  </button>
                </div>
              </div>

              <div className="p-1 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    showConfirm({
                      title: '安全退出系统',
                      message: '确定要安全注销当前账号并退出管理控制台吗？',
                      type: 'warning',
                      confirmText: '确认退出',
                      cancelText: '取消',
                      onConfirm: () => {
                        logout();
                      }
                    });
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>退出系统</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
