import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Command, ArrowRight, Shield, User, BarChart, Settings, X, Moon, Sun, Sparkles, Building2 as Building, Fingerprint, Ban, Sliders } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const { toggleTheme, mode } = useTheme();
  const { hasPermission } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent or state
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const actions = [
    {
      id: 'nav-dashboard',
      title: '工作台概览仪表盘',
      category: '页面导航',
      path: '/dashboard',
      icon: Command,
      permission: 'dashboard:view'
    },
    {
      id: 'nav-analytics',
      title: '商业智能与多维数据分析',
      category: '页面导航',
      path: '/analytics',
      icon: BarChart,
      permission: 'analytics:view'
    },
    {
      id: 'nav-users',
      title: '系统用户列表管理',
      category: '页面导航',
      path: '/users',
      icon: User,
      permission: 'users.read'
    },
    {
      id: 'nav-org',
      title: '组织机构树架构管理',
      category: '页面导航',
      path: '/org',
      icon: Building,
      permission: 'org:view'
    },
    {
      id: 'nav-roles',
      title: 'RBAC 角色架构配置',
      category: '页面导航',
      path: '/roles',
      icon: Shield,
      permission: 'roles.read'
    },
    {
      id: 'nav-permissions',
      title: '角色与权限分配矩阵',
      category: '页面导航',
      path: '/permissions',
      icon: Shield,
      permission: 'permissions.read'
    },
    {
      id: 'nav-profile',
      title: '个人中心与基本信息',
      category: '页面导航',
      path: '/profile',
      icon: User
    },
    {
      id: 'nav-2fa',
      title: '2FA 与安全凭据设置 (Passkey / TOTP 动态码)',
      category: '页面导航',
      path: '/security-2fa',
      icon: Fingerprint,
      permission: 'system:view'
    },
    {
      id: 'nav-auth-security',
      title: '认证设置与 IP 封禁管理 (防暴力破解 / IP 黑名单)',
      category: '页面导航',
      path: '/auth-security',
      icon: Ban,
      permission: 'auth-security.read'
    },
    {
      id: 'nav-settings',
      title: '核心系统策略 (会话超时 / 密码复杂度 / 集群状态)',
      category: '页面导航',
      path: '/settings',
      icon: Sliders,
      permission: 'system:view'
    },
    {
      id: 'nav-step-form',
      title: '分步向导表单模板',
      category: '页面与组件模板',
      path: '/step-form',
      icon: Command
    },
    {
      id: 'nav-resource-list',
      title: '标准工单列表与抽屉模板',
      category: '页面与组件模板',
      path: '/resource-list',
      icon: Command
    },
    {
      id: 'nav-notifications',
      title: '消息通知与预警中心模板',
      category: '页面与组件模板',
      path: '/notifications',
      icon: Command
    },
    {
      id: 'nav-result-status',
      title: '结果与异常状态展示模板',
      category: '页面与组件模板',
      path: '/result-status',
      icon: Command
    }
  ];

  const filteredActions = actions.filter(
    item =>
      (!item.permission || hasPermission(item.permission as any)) &&
      (item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase()))
  );

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden transform transition-all ring-1 ring-slate-900/10 dark:ring-slate-100/10"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="搜索功能模块、导航路径或系统操作... (Esc 取消)"
            className="w-full bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none text-sm"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {/* Quick theme action */}
          <button
            onClick={() => {
              toggleTheme();
              onClose();
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-indigo-50 dark:hover:bg-slate-800/80 group transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                {mode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  切换外观主题模式
                </div>
                <div className="text-xs text-slate-400">
                  当前模式: {mode === 'system' ? '跟随系统' : mode === 'dark' ? '深色夜间' : '浅色明亮'}
                </div>
              </div>
            </div>
            <Sparkles className="w-4 h-4 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          {filteredActions.map(action => {
            const IconComponent = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => {
                  onNavigate(action.path);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800/80 group transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {action.title}
                    </div>
                    <div className="text-xs text-slate-400">{action.category}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transform group-hover:translate-x-1 transition-all" />
              </button>
            );
          })}

          {filteredActions.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-400">
              未搜索到匹配的功能或导航项
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 flex justify-between items-center">
          <span>NovaAdmin Command Palette</span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              Ctrl K
            </kbd>{' '}
            开启快速导航
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
};
