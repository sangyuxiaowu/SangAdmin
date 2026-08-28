import type { NavItem } from '../types';

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    title: '工作台概览',
    icon: 'LayoutDashboard',
    path: '/dashboard',
    permission: 'dashboard:view'
  },
  {
    id: 'analytics',
    title: '数据分析',
    icon: 'BarChart3',
    path: '/analytics',
    permission: 'analytics:view'
  },
  {
    id: 'rbac-group',
    title: '用户与权限控制',
    icon: 'ShieldCheck',
    path: '/users-roles',
    children: [
      {
        id: 'users',
        title: '用户账号管理',
        icon: 'Users',
        path: '/users',
        permission: 'users.read'
      },
      {
        id: 'org',
        title: '组织机构树管理',
        icon: 'Building2',
        path: '/org',
        permission: 'org:view'
      },
      {
        id: 'roles',
        title: '角色模型配置',
        icon: 'UserCheck',
        path: '/roles',
        permission: 'roles.read'
      },
      {
        id: 'permissions',
        title: '权限树分配矩阵',
        icon: 'KeyRound',
        path: '/permissions',
        permission: 'permissions.read'
      }
    ]
  },
  {
    id: 'templates-group',
    title: '常用页面与模板',
    icon: 'Layers',
    path: '/templates',
    children: [
      {
        id: 'step-form',
        title: '分步向导表单',
        icon: 'ListOrdered',
        path: '/step-form'
      },
      {
        id: 'resource-list',
        title: '标准工单列表',
        icon: 'TableProperties',
        path: '/resource-list',
        badge: 'New'
      },
      {
        id: 'notifications',
        title: '消息通知中心',
        icon: 'BellRing',
        path: '/notifications',
        badge: '3'
      },
      {
        id: 'result-status',
        title: '结果与异常状态',
        icon: 'CheckCircle2',
        path: '/result-status'
      }
    ]
  },
  {
    id: 'profile',
    title: '个人信息维护',
    icon: 'UserCog',
    path: '/profile'
  },
  {
    id: 'system-group',
    title: '系统运维与日志',
    icon: 'Settings2',
    path: '/system',
    children: [
      {
        id: 'security-2fa',
        title: '2FA 与安全设置',
        icon: 'Fingerprint',
        path: '/security-2fa',
        permission: 'system:view'
      },
      {
        id: 'auth-security',
        title: '认证与 IP 封禁',
        icon: 'Ban',
        path: '/auth-security',
        permission: 'system:view'
      },
      {
        id: 'settings',
        title: '核心系统策略',
        icon: 'Sliders',
        path: '/settings',
        permission: 'system:view'
      },
      {
        id: 'audit',
        title: '全站审计日志',
        icon: 'FileText',
        path: '/audit',
        permission: 'audit:view'
      }
    ]
  }
];
