import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Role, User, PermissionCode, PermissionNode } from '../types';
import { DEFAULT_ROLES, DEFAULT_USERS, ALL_PERMISSIONS } from '$mock';
import { api, getAccessToken } from '../api/client';
import type { PermissionDto, RoleDto, UserDto } from '../api/contracts';
import { DEFAULT_AVATAR } from '../utils';

interface PermissionContextType {
  roles: Role[];
  users: User[];
  allPermissions: PermissionNode[];
  addRole: (role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRole: (id: string, updates: Partial<Role>) => void;
  deleteRole: (id: string) => boolean;
  updateRolePermissions: (roleId: string, permissions: PermissionCode[]) => void;
  saveRole: (role: Role) => Promise<void>;
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'lastLogin'>) => void;
  createUser: (user: Omit<User, 'id' | 'createdAt' | 'lastLogin'>, password: string) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => void;
  saveUser: (user: User) => Promise<void>;
  deleteUser: (id: string) => void;
  removeUser: (id: string) => Promise<void>;
  resetUserPassword: (id: string, password: string, currentPassword: string) => Promise<void>;
  getRoleById: (id: string) => Role | undefined;
  getRolePermissions: (roleId: string) => PermissionCode[];
  resetToDefaults: () => void;
  createRole: (name: string, permissions: PermissionCode[]) => Promise<void>;
  removeRole: (id: string) => Promise<void>;
  reload: () => Promise<User[]>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES);
  const [users, setUsers] = useState<User[]>(DEFAULT_USERS);
  const [allPermissions, setAllPermissions] = useState<PermissionNode[]>(ALL_PERMISSIONS);

  const toRole = (role: RoleDto): Role => ({
    id: String(role.id),
    code: role.name,
    name: role.displayName,
    description: role.description,
    permissions: role.permissions as PermissionCode[],
    isAdministrator: role.isAdministrator,
    userCount: role.userCount,
    createdAt: role.createdAt.startsWith('0001-') ? '' : role.createdAt,
    updatedAt: role.updatedAt.startsWith('0001-') ? '' : role.updatedAt,
  });

  const toUser = (user: UserDto, loadedRoles: Role[]): User => {
    const roleCode = user.roles[0];
    const role = loadedRoles.find(item => item.code === roleCode);

    return {
    id: String(user.id),
    username: user.userName,
    name: user.nickname || user.userName,
    email: user.email,
    avatar: DEFAULT_AVATAR,
    phone: user.phoneNumber ?? '',
    department: '',
    position: '',
    roleId: role?.id || '',
    roleName: role?.name ?? roleCode,
    status: user.isEnabled ? 'active' : 'suspended',
    lastLogin: user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '-',
    createdAt: '',
    };
  };

  const toPermission = (permission: PermissionDto): PermissionNode => ({
    code: permission.name as PermissionCode,
    name: permission.description || permission.name,
    description: permission.description,
    category: permission.resourceName as PermissionNode['category'],
  });

  const reload = async (): Promise<User[]> => {
    if (!getAccessToken()) return [];

    const [usersResponse, rolesResponse, permissionsResponse] = await Promise.all([
      api.queryUsers(),
      api.queryRoles(),
      api.getResources(),
    ]);
    const loadedRoles = rolesResponse.data.data.map(toRole);
    const loadedUsers = usersResponse.data.data.map(user => toUser(user, loadedRoles));
    setUsers(loadedUsers);
    setRoles(loadedRoles);
    setAllPermissions(permissionsResponse.data.map(toPermission));
    return loadedUsers;
  };

  useEffect(() => {
    void reload().catch(() => {
      setUsers([]);
      setRoles([]);
      setAllPermissions([]);
    });
  }, []);

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
    if (roleToDelete?.isAdministrator) return false;
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

  const saveRole = async (role: Role) => {
    await api.updateRole(role.id, {
      displayName: role.name,
      description: role.description,
      permissions: role.permissions,
    });
    await reload();
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

  const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'>, password: string) => {
    const role = roles.find(item => item.id === userData.roleId);
    await api.createUser({
      userName: userData.username,
      nickname: userData.name,
      email: userData.email,
      phoneNumber: userData.phone,
      password,
      isEnabled: userData.status === 'active',
      roles: role ? [role.code] : [],
      permissions: [],
    });
    await reload();
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

  const saveUser = async (user: User) => {
    const role = roles.find(item => item.id === user.roleId);
    await api.updateUser(user.id, {
      nickname: user.name,
      email: user.email,
      phoneNumber: user.phone,
      isEnabled: user.status === 'active',
      roles: role ? [role.code] : [],
      permissions: [],
    });
    await reload();
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const removeUser = async (id: string) => {
    await api.deleteUser(id);
    await reload();
  };

  const resetUserPassword = async (id: string, password: string, currentPassword: string) => {
    await api.changePassword(id, password, currentPassword);
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
    setAllPermissions(ALL_PERMISSIONS);
  };

  const createRole = async (name: string, permissions: PermissionCode[], displayName = name, description = '') => {
    await api.createRole({ name, displayName, description, permissions });
    await reload();
  };

  const removeRole = async (id: string) => {
    await api.deleteRole(id);
    await reload();
  };

  return (
    <PermissionContext.Provider
      value={{
        roles,
        users,
        allPermissions,
        addRole,
        updateRole,
        deleteRole,
        updateRolePermissions,
        saveRole,
        addUser,
        createUser,
        updateUser,
        saveUser,
        deleteUser,
        removeUser,
        resetUserPassword,
        getRoleById,
        getRolePermissions,
        resetToDefaults,
        createRole,
        removeRole,
        reload
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
