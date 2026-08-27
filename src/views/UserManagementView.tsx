import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Users,
  Search,
  UserPlus,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  X,
  Key,
  AlertTriangle
} from 'lucide-react';
import { usePermissions } from '../context/PermissionContext';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { CustomSelect } from '../components/common/CustomSelect';
import type { User, UserStatus } from '../types';
import { AccessDeniedView } from './AccessDeniedView';

interface UserManagementViewProps {
  onNavigate: (path: string) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({ onNavigate }) => {
  const { users, roles, addUser, updateUser, deleteUser } = usePermissions();
  const { hasPermission, addActivityLog } = useAuth();
  const { showAlert, showConfirm } = useModal();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resetPassUser, setResetPassUser] = useState<User | null>(null);

  // Scroll lock when any modal is open
  useEffect(() => {
    if (isAddModalOpen || editingUser || resetPassUser) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isAddModalOpen, editingUser, resetPassUser]);

  // New user form state
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    phone: '',
    department: '研发中心',
    position: '高级工程师',
    roleId: roles[0]?.id || '',
    status: 'active' as UserStatus,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    bio: ''
  });

  if (!hasPermission('user:view')) {
    return <AccessDeniedView requiredPermission="user:view" onNavigate={onNavigate} />;
  }

  // Filtering users
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.department.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.roleId === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleSaveNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission('user:create')) {
      showAlert({
        title: '权限拦截',
        message: '权限不足：当前角色账号无法创建新用户',
        type: 'danger'
      });
      return;
    }

    addUser(formData);
    addActivityLog('创建用户', `成功添加后台新用户【${formData.name}】(${formData.username})`, 'success');
    setIsAddModalOpen(false);

    showAlert({
      title: '操作成功',
      message: `已成功创建新后台账号【${formData.name}】！`,
      type: 'success'
    });

    // Reset form
    setFormData({
      username: '',
      name: '',
      email: '',
      phone: '',
      department: '研发中心',
      position: '高级工程师',
      roleId: roles[0]?.id || '',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      bio: ''
    });
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !hasPermission('user:edit')) return;

    updateUser(editingUser.id, editingUser);
    addActivityLog('更新用户', `修改了用户【${editingUser.name}】的组织架构与角色`, 'info');
    setEditingUser(null);
    showAlert({
      title: '修改保存',
      message: `用户【${editingUser.name}】的信息已成功更新。`,
      type: 'success'
    });
  };

  const handleToggleStatus = (user: User) => {
    if (!hasPermission('user:edit')) {
      showAlert({
        title: '权限不足',
        message: '权限不足：无法修改用户状态',
        type: 'danger'
      });
      return;
    }
    const newStatus: UserStatus = user.status === 'active' ? 'suspended' : 'active';
    updateUser(user.id, { status: newStatus });
    addActivityLog(
      '状态变更',
      `将用户【${user.name}】状态设置为 ${newStatus === 'active' ? '正常激活' : '暂停封禁'}`,
      newStatus === 'active' ? 'success' : 'warning'
    );
  };

  const handleDelete = (user: User) => {
    if (!hasPermission('user:delete')) {
      showAlert({
        title: '权限不足',
        message: '权限不足：无法删除用户账号',
        type: 'danger'
      });
      return;
    }

    showConfirm({
      title: '确认彻底删除用户',
      message: `确定要彻底移除用户【${user.name}】的系统账号吗？此操作不可撤销且无法恢复。`,
      type: 'danger',
      confirmText: '确认删除',
      cancelText: '取消',
      onConfirm: () => {
        deleteUser(user.id);
        addActivityLog('删除用户', `移除账号【${user.name}】`, 'danger');
        showAlert({
          title: '已删除账号',
          message: `用户账号【${user.name}】已成功彻底清理。`,
          type: 'info'
        });
      }
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              系统用户账号管理
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            支持检索账号列表、分配角色模型、重置安全密钥与冻结异常账号
          </p>
        </div>

        {hasPermission('user:create') && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-500/20 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>新建后台账号</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="按姓名、用户名、邮箱或部门搜索..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <CustomSelect
            value={roleFilter}
            onChange={val => setRoleFilter(val)}
            modalTitle="筛选角色模型"
            className="w-36 sm:w-40"
            options={[
              { value: 'all', label: '全角色模型筛选' },
              ...roles.map(r => ({ value: r.id, label: r.name }))
            ]}
          />

          <CustomSelect
            value={statusFilter}
            onChange={val => setStatusFilter(val)}
            modalTitle="筛选账号状态"
            className="w-32 sm:w-36"
            options={[
              { value: 'all', label: '全账号状态' },
              { value: 'active', label: '正常激活' },
              { value: 'suspended', label: '冻结封禁' }
            ]}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">用户信息</th>
                <th className="py-3.5 px-4">部门 / 职位</th>
                <th className="py-3.5 px-4">绑定权限角色</th>
                <th className="py-3.5 px-4">状态</th>
                <th className="py-3.5 px-4">最近登录时间</th>
                <th className="py-3.5 px-4 text-right">操作行为</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredUsers.map(user => {
                const isActive = user.status === 'active';
                return (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/20 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            {user.name}
                            <span className="text-[10px] text-slate-400 font-mono">
                              (@{user.username})
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {user.department}
                      </div>
                      <div className="text-[10px] text-slate-400">{user.position}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        {user.roleName}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 激活正常
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-500 dark:text-rose-400 font-semibold">
                          <XCircle className="w-3.5 h-3.5" /> 状态冻结
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {user.lastLogin}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {hasPermission('user:edit') && (
                          <>
                            <button
                              onClick={() => setEditingUser({ ...user })}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 transition-colors"
                              title="编辑角色信息"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setResetPassUser(user)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-amber-600 transition-colors"
                              title="重置安全密码"
                            >
                              <Key className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleToggleStatus(user)}
                              className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                                isActive
                                  ? 'text-slate-500 hover:text-rose-600'
                                  : 'text-rose-500 hover:text-emerald-600'
                              }`}
                              title={isActive ? '冻结该账号' : '解封该账号'}
                            >
                              {isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            </button>
                          </>
                        )}

                        {hasPermission('user:delete') && (
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors"
                            title="彻底删除账号"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    未查找到符合过滤条件的用户账号
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl ring-1 ring-slate-900/10 dark:ring-slate-100/10 max-h-[85vh] flex flex-col overflow-hidden my-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4 shrink-0">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                新建系统后台账号
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewUser} className="space-y-4 overflow-y-auto pr-1 custom-scrollbar flex-1 min-h-0 text-xs flex flex-col justify-between">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    真实姓名 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="如: 李大为"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    登录用户名 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    placeholder="如: li.dawei"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    电子邮箱 *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="li.dawei@sang.cool"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    联系电话
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="13812345678"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    部门名称
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    分配角色模型 *
                  </label>
                  <CustomSelect
                    value={formData.roleId}
                    onChange={val => setFormData({ ...formData, roleId: val })}
                    modalTitle="选择角色模型"
                    options={roles.map(r => ({
                      value: r.id,
                      label: r.name,
                      description: r.description
                    }))}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-500/20"
                >
                  确认添加
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Edit User Modal */}
      {editingUser && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setEditingUser(null)}
        >
          <div
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl ring-1 ring-slate-900/10 dark:ring-slate-100/10 max-h-[85vh] flex flex-col overflow-hidden my-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4 shrink-0">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                编辑用户信息与归属角色
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-4 overflow-y-auto pr-1 custom-scrollbar flex-1 min-h-0 text-xs flex flex-col justify-between">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    姓名
                  </label>
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    分配角色
                  </label>
                  <CustomSelect
                    value={editingUser.roleId}
                    onChange={val => setEditingUser({ ...editingUser, roleId: val })}
                    modalTitle="调整账号角色"
                    options={roles.map(r => ({
                      value: r.id,
                      label: r.name,
                      description: r.description
                    }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    所属部门
                  </label>
                  <input
                    type="text"
                    value={editingUser.department}
                    onChange={e => setEditingUser({ ...editingUser, department: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    岗位职位
                  </label>
                  <input
                    type="text"
                    value={editingUser.position}
                    onChange={e => setEditingUser({ ...editingUser, position: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md"
                >
                  保存修改
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Reset Password Prompt */}
      {resetPassUser && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setResetPassUser(null)}
        >
          <div
            className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-center ring-1 ring-slate-900/10 dark:ring-slate-100/10 my-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
              <Key className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              重置用户密码凭证
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              已为用户【{resetPassUser.name}】自动生成一次性临时登录密钥:
            </p>

            <div className="my-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400 select-all border border-slate-200 dark:border-slate-700">
              NovaPwd_2026!#88
            </div>

            <button
              onClick={() => {
                addActivityLog('重置密码', `已重置用户【${resetPassUser.name}】的登录密钥`, 'warning');
                setResetPassUser(null);
              }}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-md"
            >
              已复制并完成重置
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
