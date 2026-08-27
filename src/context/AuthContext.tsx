import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, PermissionCode, ActivityLog } from '../types';
import { usePermissions } from './PermissionContext';
import { MOCK_ACTIVITY_LOGS } from '../data/mockData';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  switchDemoUser: (userId: string) => void;
  hasPermission: (permissionCode: PermissionCode) => boolean;
  updateProfile: (updates: Partial<User>) => void;
  activityLogs: ActivityLog[];
  addActivityLog: (action: string, target: string, type?: ActivityLog['type']) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { users, roles, getRolePermissions } = usePermissions();

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    return localStorage.getItem('sang_active_user_id') || localStorage.getItem('nova_active_user_id') || 'usr-1';
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('sang_logs') || localStorage.getItem('nova_logs');
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
    if (currentUserId) {
      localStorage.setItem('sang_active_user_id', currentUserId);
    } else {
      localStorage.removeItem('sang_active_user_id');
    }
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem('sang_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  const currentUser = users.find(u => u.id === currentUserId) || null;
  const isAuthenticated = !!currentUser && currentUser.status === 'active';

  const login = (accountInput: string): boolean => {
    const trimmed = accountInput.trim().toLowerCase();
    const user = users.find(
      u =>
        u.username.toLowerCase() === trimmed ||
        u.email.toLowerCase() === trimmed ||
        (trimmed.includes('@sang.cool') && u.username.toLowerCase() === trimmed.replace('@sang.cool', '')) ||
        (trimmed.includes('@') && u.email.toLowerCase() === trimmed)
    );
    if (user && user.status === 'active') {
      setCurrentUserId(user.id);
      addActivityLog('用户登录', `用户【${user.name}】(${user.email}) 成功登录系统`, 'success');
      return true;
    }
    return false;
  };

  const logout = () => {
    if (currentUser) {
      addActivityLog('用户退出', `用户【${currentUser.name}】已安全退出系统`, 'info');
    }
    setCurrentUserId(null);
  };

  const switchDemoUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUserId(user.id);
      addActivityLog('切换视角', `已快速切换身份至【${user.name}】(${user.roleName})`, 'info');
    }
  };

  const hasPermission = (permissionCode: PermissionCode): boolean => {
    if (!currentUser || currentUser.status !== 'active') return false;
    
    // Get role permissions
    const permissions = getRolePermissions(currentUser.roleId);
    
    // Super admin overrides everything if code exists
    const userRole = roles.find(r => r.id === currentUser.roleId);
    if (userRole?.code === 'super_admin') return true;

    return permissions.includes(permissionCode);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    const { updateUser } = usePermissions();
    updateUser(currentUser.id, updates);
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
