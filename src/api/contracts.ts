export interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}

export interface PagedResponse<T> {
  data: T[];
  count: number;
  page: number;
  size: number;
}

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiration: string;
}

export interface UserDto {
  id: number;
  uid: string;
  userName: string;
  nickname: string | null;
  email: string;
  emailConfirmed: boolean;
  phoneNumber: string | null;
  lastLoginAt: string | null;
  isEnabled: boolean;
  roles: string[];
  permissions: string[];
}

export interface RoleDto {
  id: number;
  name: string;
  displayName: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  userCount: number;
  isAdministrator: boolean;
  permissions: string[];
}

export interface PermissionDto {
  name: string;
  resourceKey: string;
  resourceName: string;
  actionKey: string;
  description: string;
}

export interface CreateUserRequest {
  userName: string;
  nickname: string;
  email: string;
  phoneNumber: string;
  password: string;
  isEnabled: boolean;
  roles: string[];
  permissions: string[];
}

export interface UpdateUserRequest {
  nickname: string;
  email: string;
  phoneNumber: string;
  isEnabled: boolean;
  roles: string[];
  permissions: string[];
}

export interface CreateRoleRequest {
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
}

export interface UpdateRoleRequest {
  displayName: string;
  description: string;
  permissions: string[];
}
