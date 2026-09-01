import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  PagedResponse,
  ResourceDto,
  RoleDto,
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
  lastLoginAt: user.lastLogin,
  isEnabled: user.status === 'active',
  roles: user.roleName ? [user.roleName] : [],
  permissions: DEFAULT_ROLES.find(role => role.id === user.roleId)?.permissions ?? [],
});

const users = DEFAULT_USERS.map(toUserDto);
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

export const mockApi = {
  login(request: LoginRequest): ApiResponse<LoginResponse> {
    const user = users.find(item => item.userName === request.userName);
    if (!user || !request.password) {
      return failure('用户名或密码错误');
    }

    return success({
      token: `mock-token-${user.id}`,
      expiration: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    });
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
};
