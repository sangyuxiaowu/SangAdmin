import type { ApiResponse, LoginRequest, LoginResponse, PagedResponse, PermissionDto, RoleDto, UserDto } from './contracts';

const accessTokenKey = 'sang_access_token';
const isMockMode = import.meta.env.MODE === 'mock';

export const getAccessToken = () => localStorage.getItem(accessTokenKey);
export const clearAccessToken = () => localStorage.removeItem(accessTokenKey);

const request = async <T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> => {
  const token = getAccessToken();
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`请求失败（${response.status}）`);
  }

  const result = await response.json() as ApiResponse<T>;
  if (result.code !== 0) {
    throw new Error(result.msg || '请求失败');
  }

  return result;
};

export const api = {
  async login(requestBody: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const result = isMockMode
      ? (await import('./mockApi')).mockApi.login(requestBody)
      : await request<LoginResponse>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify(requestBody),
        });

    if (result.code === 0) {
      localStorage.setItem(accessTokenKey, result.data.token);
    }
    return result;
  },

  async queryUsers(): Promise<ApiResponse<PagedResponse<UserDto>>> {
    return isMockMode
      ? (await import('./mockApi')).mockApi.queryUsers()
      : request<PagedResponse<UserDto>>('/api/users?pageIndex=1&pageSize=100');
  },

  async queryRoles(): Promise<ApiResponse<PagedResponse<RoleDto>>> {
    return isMockMode
      ? (await import('./mockApi')).mockApi.queryRoles()
      : request<PagedResponse<RoleDto>>('/api/roles?pageIndex=1&pageSize=100');
  },

  async getResources(): Promise<ApiResponse<PermissionDto[]>> {
    return isMockMode
      ? (await import('./mockApi')).mockApi.getResources()
      : request<PermissionDto[]>('/api/permissions/resources');
  },
};
