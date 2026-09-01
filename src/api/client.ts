import type { ApiResponse, CreateRoleRequest, CreateUserRequest, LoginRequest, LoginResponse, PagedResponse, ResourceDto, RoleDto, UpdateRoleRequest, UpdateUserRequest, UserDto } from './contracts';

const accessTokenKey = 'sang_access_token';
const isMockMode = import.meta.env.MODE === 'mock';

export const getAccessToken = () => localStorage.getItem(accessTokenKey);
export const clearAccessToken = () => localStorage.removeItem(accessTokenKey);

interface ValidationError {
  field?: string;
  err?: string[];
}

interface ErrorResponse {
  msg?: string;
  data?: ValidationError[];
}

const getErrorMessage = (response: ErrorResponse, status: number) => {
  const validationErrors = response.data
    ?.flatMap(item => item.err?.map(message => item.field ? `${item.field}: ${message}` : message) ?? []);

  return validationErrors?.length ? validationErrors.join('\n') : response.msg || `请求失败（${status}）`;
};

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
    const error = await response.json().catch(() => ({})) as ErrorResponse;
    throw new Error(getErrorMessage(error, response.status));
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

  async getResources(): Promise<ApiResponse<ResourceDto[]>> {
    return isMockMode
      ? (await import('./mockApi')).mockApi.getResources()
      : request<ResourceDto[]>('/api/permissions/resources');
  },

  createUser(requestBody: CreateUserRequest): Promise<ApiResponse<UserDto>> {
    return request<UserDto>('/api/users', { method: 'POST', body: JSON.stringify(requestBody) });
  },

  updateUser(id: string, requestBody: UpdateUserRequest): Promise<ApiResponse<UserDto>> {
    return request<UserDto>(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(requestBody) });
  },

  deleteUser(id: string): Promise<ApiResponse<object>> {
    return request<object>(`/api/users/${id}`, { method: 'DELETE' });
  },

  changePassword(id: string, newPassword: string, currentPassword?: string): Promise<ApiResponse<object>> {
    return request<object>(`/api/users/${id}/password`, {
      method: 'PUT',
      body: JSON.stringify({ newPassword, currentPassword }),
    });
  },

  createRole(requestBody: CreateRoleRequest): Promise<ApiResponse<RoleDto>> {
    return request<RoleDto>('/api/roles', { method: 'POST', body: JSON.stringify(requestBody) });
  },

  updateRole(id: string, requestBody: UpdateRoleRequest): Promise<ApiResponse<RoleDto>> {
    return request<RoleDto>(`/api/roles/${id}`, { method: 'PUT', body: JSON.stringify(requestBody) });
  },

  deleteRole(id: string): Promise<ApiResponse<object>> {
    return request<object>(`/api/roles/${id}`, { method: 'DELETE' });
  },
};
