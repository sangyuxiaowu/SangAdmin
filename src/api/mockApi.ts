import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  PagedResponse,
  PermissionDto,
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
  roles: user.roleName ? [user.roleName] : [],
  permissions: DEFAULT_ROLES.find(role => role.id === user.roleId)?.permissions ?? [],
});

const users = DEFAULT_USERS.map(toUserDto);
const roles: RoleDto[] = DEFAULT_ROLES.map(role => ({
  id: Number(role.id.replace('role-', '').replace('superadmin', '1').replace('sysadmin', '2').replace('analyst', '3').replace('editor', '4').replace('guest', '5')),
  name: role.name,
  permissions: role.permissions,
}));
const resources: PermissionDto[] = ALL_PERMISSIONS.map(permission => ({ name: permission.code }));

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
      items: users.slice((pageIndex - 1) * pageSize, pageIndex * pageSize),
      totalCount: users.length,
      pageIndex,
      pageSize,
    });
  },

  queryRoles(pageIndex = 1, pageSize = 10): ApiResponse<PagedResponse<RoleDto>> {
    return success({
      items: roles.slice((pageIndex - 1) * pageSize, pageIndex * pageSize),
      totalCount: roles.length,
      pageIndex,
      pageSize,
    });
  },

  getResources(): ApiResponse<PermissionDto[]> {
    return success(resources);
  },
};
