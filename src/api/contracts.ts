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
  roles: string[];
  permissions: string[];
}

export interface RoleDto {
  id: number;
  name: string;
  permissions: string[];
}

export interface PermissionDto {
  name: string;
}
