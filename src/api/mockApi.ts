import type {
  ApiResponse,
  AuthIpBanInfo,
  AuthSecuritySettings,
  BanIpRequest,
  LoginRequest,
  LoginResponse,
  PagedResponse,
  ResourceDto,
  RoleDto,
  UpdateProfileRequest,
  UserDto,
} from './contracts';
import { ALL_PERMISSIONS, DEFAULT_ROLES, DEFAULT_USERS } from '$mock';

const success = <T>(data: T): ApiResponse<T> => ({
  code: 0,
  msg: 'success',
  data,
});

const failure = <T>(msg: string): ApiResponse<T> => ({
  code: 1,
  msg,
  data: undefined as T,
});

const toUserDto = (user: (typeof DEFAULT_USERS)[number]): UserDto => ({
  id: Number(user.id.replace('usr-', '')),
  uid: user.id,
  userName: user.username,
  nickname: user.name,
  email: user.email,
  emailConfirmed: true,
  phoneNumber: user.phone,
  phoneNumberConfirmed: true,
  bio: user.bio ?? null,
  lastLoginAt: user.lastLogin,
  isEnabled: user.status === 'active',
  isAdministrator: Boolean(DEFAULT_ROLES.find(role => role.id === user.roleId)?.isAdministrator),
  roles: user.roleName ? [user.roleName] : [],
  permissions: DEFAULT_ROLES.find(role => role.id === user.roleId)?.permissions ?? [],
});

const users = DEFAULT_USERS.map(toUserDto);
let currentUser: UserDto | null = null;
const roles: RoleDto[] = DEFAULT_ROLES.map(role => ({
  id: Number(role.id.replace('role-', '').replace('superadmin', '1').replace('sysadmin', '2').replace('analyst', '3').replace('editor', '4').replace('guest', '5')),
  name: role.name,
  displayName: role.name,
  description: role.description,
  createdAt: role.createdAt,
  updatedAt: role.updatedAt,
  userCount: DEFAULT_USERS.filter(user => user.roleId === role.id).length,
  isAdministrator: Boolean(role.isAdministrator),
  permissions: role.permissions,
}));
const resources = Object.values(ALL_PERMISSIONS.reduce<Record<string, ResourceDto>>((result, permission) => {
  const [resourceKey, actionKey] = permission.code.split(/[.:]/);
  const resource = result[resourceKey] ??= {
    resourceKey,
    resourceName: permission.category,
    actions: [],
  };
  resource.actions.push({
    actionKey,
    actionName: permission.name,
    description: permission.description,
    permission: permission.code,
  });
  return result;
}, {}));
let authSecuritySettings: AuthSecuritySettings = {
  failureWindowMinutes: 10,
  maxAttempts: 10,
  autoBanMinutes: 60,
};
let authIpBans: AuthIpBanInfo[] = [];

export const mockApi = {
  login(request: LoginRequest): ApiResponse<LoginResponse> {
    const user = users.find(item => item.userName === request.userName);
    if (!user || !request.password) {
      return failure('用户名或密码错误');
    }

    currentUser = user;

    return success({
      token: `mock-token-${user.id}`,
      expiration: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      user,
    });
  },

  getProfile(): ApiResponse<UserDto> {
    if (!currentUser) {
      const userId = localStorage.getItem('sang_access_token')?.replace('mock-token-', '');
      currentUser = users.find(user => String(user.id) === userId) ?? null;
    }
    return currentUser ? success(currentUser) : failure('登录状态已失效');
  },

  updateProfile(request: UpdateProfileRequest): ApiResponse<UserDto> {
    if (!currentUser) return failure('登录状态已失效');

    const emailChanged = currentUser.email.toLowerCase() !== request.email.toLowerCase();
    const phoneChanged = currentUser.phoneNumber !== request.phoneNumber;
    currentUser = {
      ...currentUser,
      nickname: request.nickname,
      email: request.email,
      emailConfirmed: emailChanged ? false : currentUser.emailConfirmed,
      phoneNumber: request.phoneNumber,
      phoneNumberConfirmed: phoneChanged ? false : currentUser.phoneNumberConfirmed,
      bio: request.bio,
    };
    return success(currentUser);
  },

  queryUsers(pageIndex = 1, pageSize = 10): ApiResponse<PagedResponse<UserDto>> {
    return success({
      data: users.slice((pageIndex - 1) * pageSize, pageIndex * pageSize),
      count: users.length,
      page: pageIndex,
      size: pageSize,
    });
  },

  queryRoles(pageIndex = 1, pageSize = 10): ApiResponse<PagedResponse<RoleDto>> {
    return success({
      data: roles.slice((pageIndex - 1) * pageSize, pageIndex * pageSize),
      count: roles.length,
      page: pageIndex,
      size: pageSize,
    });
  },

  getResources(): ApiResponse<ResourceDto[]> {
    return success(resources);
  },

  getAuthSecuritySettings(): ApiResponse<AuthSecuritySettings> {
    return success(authSecuritySettings);
  },

  updateAuthSecuritySettings(settings: AuthSecuritySettings): ApiResponse<AuthSecuritySettings> {
    authSecuritySettings = settings;
    return success(authSecuritySettings);
  },

  getAuthIpBans(): ApiResponse<AuthIpBanInfo[]> {
    return success(authIpBans);
  },

  banAuthIp(request: BanIpRequest): ApiResponse<AuthIpBanInfo> {
    const item: AuthIpBanInfo = {
      id: Date.now(),
      ip: request.ip,
      attempts: 0,
      bannedUntil: new Date(Date.now() + request.durationMinutes * 60_000).toISOString(),
      reason: request.reason,
      isManual: true,
    };
    authIpBans = [item, ...authIpBans];
    return success(item);
  },

  unbanAuthIp(id: number): ApiResponse<object> {
    authIpBans = authIpBans.filter(item => item.id !== id);
    return success({});
  },

  clearAuthIpBans(): ApiResponse<number> {
    const count = authIpBans.length;
    authIpBans = [];
    return success(count);
  },
};
