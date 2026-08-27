import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Role, User, PermissionCode, PermissionNode } from '../types';
import { DEFAULT_ROLES, DEFAULT_USERS, ALL_PERMISSIONS } from '../data/mockData';

interface PermissionContextType {
  roles: Role[];
  users: User[];
  allPermissions: PermissionNode[];
  addRole: (role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRole: (id: string, updates: Partial<Role>) => void;
  deleteRole: (id: string) => boolean;
  updateRolePermissions: (roleId: string, permissions: PermissionCode[]) => void;
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'lastLogin'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  getRoleById: (id: string) => Role | undefined;
  getRolePermissions: (roleId: string) => PermissionCode[];
  resetToDefaults: () => void;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [roles, setRoles] = useState<Role[]>(() => {
    const saved = localStorage.getItem('sang_roles') || localStorage.getItem('nova_roles');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEFAULT_ROLES;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('sang_users') || localStorage.getItem('nova_users');
    if (saved) {
      try {
        const parsed: User[] = JSON.parse(saved);
        return parsed.map(u => ({
          ...u,
          email: u.email.replace(/@nova\.com$/i, '@sang.cool')
        }));
      } catch {
        // fallback
      }
    }
    return DEFAULT_USERS;
  });

  useEffect(() => {
    localStorage.setItem('sang_roles', JSON.stringify(roles));
  }, [roles]);

  useEffect(() => {
    localStorage.setItem('sang_users', JSON.stringify(users));
  }, [users]);

  // Sync role user counts
  useEffect(() => {
    setRoles(prevRoles =>
      prevRoles.map(role => {
        const count = users.filter(u => u.roleId === role.id).length;
        return { ...role, userCount: count };
      })
    );
  }, [users.length]);

  const addRole = (roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newRole: Role = {
      ...roleData,
      id: `role-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      userCount: 0
    };
    setRoles(prev => [...prev, newRole]);
  };

  const updateRole = (id: string, updates: Partial<Role>) => {
    const now = new Date().toISOString().split('T')[0];
    setRoles(prev =>
      prev.map(r => (r.id === id ? { ...r, ...updates, updatedAt: now } : r))
    );
  };

  const deleteRole = (id: string): boolean => {
    const roleToDelete = roles.find(r => r.id === id);
    if (roleToDelete?.isSystem) return false;
    const isUsed = users.some(u => u.roleId === id);
    if (isUsed) return false;

    setRoles(prev => prev.filter(r => r.id !== id));
    return true;
  };

  const updateRolePermissions = (roleId: string, permissions: PermissionCode[]) => {
    const now = new Date().toISOString().split('T')[0];
    setRoles(prev =>
      prev.map(r => (r.id === roleId ? { ...r, permissions, updatedAt: now } : r))
    );
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'>) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const role = roles.find(r => r.id === userData.roleId);
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      roleName: role ? role.name : '普通角色',
      createdAt: now.split(' ')[0],
      lastLogin: now
    };
    setUsers(prev => [newUser, ...prev]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === id) {
          let roleName = u.roleName;
          if (updates.roleId) {
            const r = roles.find(role => role.id === updates.roleId);
            if (r) roleName = r.name;
          }
          return { ...u, ...updates, roleName };
        }
        return u;
      })
    );
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const getRoleById = (id: string) => {
    return roles.find(r => r.id === id);
  };

  const getRolePermissions = (roleId: string): PermissionCode[] => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.permissions : [];
  };

  const resetToDefaults = () => {
    setRoles(DEFAULT_ROLES);
    setUsers(DEFAULT_USERS);
    localStorage.removeItem('nova_roles');
    localStorage.removeItem('nova_users');
  };

  return (
    <PermissionContext.Provider
      value={{
        roles,
        users,
        allPermissions: ALL_PERMISSIONS,
        addRole,
        updateRole,
        deleteRole,
        updateRolePermissions,
        addUser,
        updateUser,
        deleteUser,
        getRoleById,
        getRolePermissions,
        resetToDefaults
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};
