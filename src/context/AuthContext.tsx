import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, PermissionCode, ActivityLog } from '../types';
import { usePermissions } from './PermissionContext';
import { useModal } from './ModalContext';
import { MOCK_ACTIVITY_LOGS } from '$mock';
import { api, authSessionExpiredEvent, clearAccessToken, getAccessToken } from '../api/client';
import type { UserDto } from '../api/contracts';
import { DEFAULT_AVATAR } from '../utils';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => void;
  switchDemoUser: (userId: string) => void;
  hasPermission: (permissionCode: PermissionCode) => boolean;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  activityLogs: ActivityLog[];
  addActivityLog: (action: string, target: string, type?: ActivityLog['type']) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { users, getRolePermissions, updateUser, reload } = usePermissions();
  const { showAlert } = useModal();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPermissions, setCurrentPermissions] = useState<string[]>([]);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('sang_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return MOCK_ACTIVITY_LOGS;
  });

  useEffect(() => {
    const handleSessionExpired = () => {
      setCurrentUser(null);
      setCurrentPermissions([]);
      showAlert({
        title: '会话已失效',
        message: '登录会话已过期，请重新登录。',
        type: 'warning',
        confirmText: '重新登录',
      });
    };

    window.addEventListener(authSessionExpiredEvent, handleSessionExpired);
    return () => window.removeEventListener(authSessionExpiredEvent, handleSessionExpired);
  }, [showAlert]);

  const applyCurrentUser = (user: UserDto) => {
    let mappedUser: User;
    setCurrentUser(previousUser => {
      mappedUser = {
      id: String(user.id),
      username: user.userName,
      name: user.nickname || user.userName,
      email: user.email,
      emailConfirmed: user.emailConfirmed,
      avatar: previousUser?.avatar || DEFAULT_AVATAR,
      phone: user.phoneNumber ?? '',
      phoneNumberConfirmed: user.phoneNumberConfirmed,
      department: previousUser?.department || '',
      position: previousUser?.position || '',
      roleId: user.roles[0] ?? '',
      roleName: user.roles[0] ?? '',
      isAdministrator: user.isAdministrator,
      status: user.isEnabled ? 'active' : 'suspended',
      lastLogin: user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '-',
      createdAt: '',
      bio: user.bio ?? '',
      };
      return mappedUser;
    });
    setCurrentPermissions(user.permissions);
    updateUser(String(user.id), {
      name: user.nickname || user.userName,
      email: user.email,
      emailConfirmed: user.emailConfirmed,
      phone: user.phoneNumber ?? '',
      phoneNumberConfirmed: user.phoneNumberConfirmed,
      bio: user.bio ?? '',
    });
  };

  useEffect(() => {
    if (!getAccessToken()) return;
    void api.getProfile()
      .then(response => applyCurrentUser(response.data))
      .catch(() => clearAccessToken());
  }, []);

  useEffect(() => {
    localStorage.setItem('sang_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  const isAuthenticated = !!currentUser && currentUser.status === 'active';

  const login = async (accountInput: string, password: string): Promise<boolean> => {
    try {
      const result = await api.login({ userName: accountInput.trim(), password });
      await reload();
      applyCurrentUser(result.data.user);
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    if (currentUser) {
      addActivityLog('用户退出', `用户【${currentUser.name}】已安全退出系统`, 'info');
    }
    clearAccessToken();
    setCurrentUser(null);
    setCurrentPermissions([]);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!currentUser) throw new Error('当前用户不存在');
    await api.changeOwnPassword(newPassword, currentPassword);
    addActivityLog('修改密码', '完成了个人账户登录安全密钥更新', 'success');
    clearAccessToken();
    setCurrentUser(null);
    setCurrentPermissions([]);
    showAlert({
      title: '密码修改成功',
      message: '登录凭据已更新，请使用新密码重新登录。',
      type: 'success',
      confirmText: '重新登录',
    });
  };

  const switchDemoUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setCurrentPermissions(getRolePermissions(user.roleId));
      addActivityLog('切换视角', `已快速切换身份至【${user.name}】(${user.roleName})`, 'info');
    }
  };

  const hasPermission = (permissionCode: PermissionCode): boolean => {
    if (!currentUser || currentUser.status !== 'active') return false;

    return currentUser.isAdministrator
      || currentPermissions.includes('*')
      || currentPermissions.includes(permissionCode);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!currentUser) throw new Error('当前用户不存在');
    const response = await api.updateProfile({
      nickname: updates.name ?? currentUser.name,
      email: updates.email ?? currentUser.email,
      phoneNumber: (updates.phone ?? currentUser.phone).trim() || null,
      bio: updates.bio ?? currentUser.bio ?? null,
    });
    applyCurrentUser(response.data);
    addActivityLog('信息维护', `用户【${currentUser.name}】修改了个人资料`, 'info');
  };

  const addActivityLog = (action: string, target: string, type: ActivityLog['type'] = 'info') => {
    if (!currentUser) return;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      action,
      target,
      timestamp: now,
      type,
      ip: '127.0.0.1'
    };
    setActivityLogs(prev => [newLog, ...prev.slice(0, 49)]); // keep last 50
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        changePassword,
        logout,
        switchDemoUser,
        hasPermission,
        updateProfile,
        activityLogs,
        addActivityLog
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
