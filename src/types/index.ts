export type ThemeMode = 'light' | 'dark' | 'system';

export type UserStatus = 'active' | 'suspended' | 'pending';

export type PermissionCode = 
  | 'dashboard:view'
  | 'dashboard:export'
  | 'analytics:view'
  | 'analytics:export'
  | 'users.read'
  | 'users.create'
  | 'users.update'
  | 'users.delete'
  | 'org:view'
  | 'org:manage'
  | 'roles.read'
  | 'roles.create'
  | 'roles.update'
  | 'roles.delete'
  | 'permissions.read'
  | 'system:view'
  | 'system:config'
  | 'audit:view';

export interface PermissionNode {
  code: PermissionCode;
  name: string;
  description: string;
  category: '仪表盘' | '数据分析' | '用户管理' | '机构管理' | '角色权限' | '系统配置' | '审计日志';
  children?: PermissionNode[];
}

export type OrgType = 'group' | 'company' | 'department' | 'team';

export interface OrgNode {
  id: string;
  code: string;
  name: string;
  type: OrgType;
  parentId: string | null;
  leaderName?: string;
  leaderAvatar?: string;
  leaderTitle?: string;
  phone?: string;
  email?: string;
  status: 'active' | 'disabled';
  orderNum: number;
  memberCount: number;
  description?: string;
  createdAt: string;
  children?: OrgNode[];
}

export interface Role {
  id: string;
  code: string;
  name: string;
  description: string;
  permissions: PermissionCode[];
  isAdministrator?: boolean;
  userCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  emailConfirmed?: boolean;
  avatar: string;
  phone: string;
  phoneNumberConfirmed?: boolean;
  department: string;
  position: string;
  roleId: string;
  roleName?: string;
  status: UserStatus;
  lastLogin: string;
  createdAt: string;
  bio?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  ip?: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'system' | 'security' | 'task';
  link?: string;
}

export interface NavItem {
  id: string;
  title: string;
  icon: string;
  path: string;
  permission?: PermissionCode;
  badge?: string | number;
  children?: NavItem[];
}
