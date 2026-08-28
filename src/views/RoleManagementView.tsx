import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  UserCheck,
  Plus,
  Shield,
  Edit2,
  Trash2,
  Copy,
  Users,
  Check,
  X,
  Lock,
  Sparkles,
  Info
} from 'lucide-react';
import { usePermissions } from '../context/PermissionContext';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import type { Role, PermissionCode } from '../types';
import { ALL_PERMISSIONS } from '$mock';
import { AccessDeniedView } from './AccessDeniedView';

interface RoleManagementViewProps {
  onNavigate: (path: string) => void;
}

export const RoleManagementView: React.FC<RoleManagementViewProps> = ({ onNavigate }) => {
  const { roles, addRole, updateRole, deleteRole, updateRolePermissions } = usePermissions();
  const { hasPermission, addActivityLog } = useAuth();
  const { showAlert, showConfirm } = useModal();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // New role form
  const [newRole, setNewRole] = useState({
    code: '',
    name: '',
    description: '',
    permissions: ['dashboard:view'] as PermissionCode[]
  });

  if (!hasPermission('roles.read')) {
    return <AccessDeniedView requiredPermission="roles.read" onNavigate={onNavigate} />;
  }

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission('roles.create')) {
      showAlert({
        title: '权限拦截',
        message: '权限不足：无法创建新角色',
        type: 'danger'
      });
      return;
    }

    addRole(newRole);
    addActivityLog('创建角色', `新建了角色模型【${newRole.name}】(${newRole.code})`, 'success');
    setIsAddModalOpen(false);
    showAlert({
      title: '创建成功',
      message: `角色模型【${newRole.name}】已创建！`,
      type: 'success'
    });
    setNewRole({
      code: '',
      name: '',
      description: '',
      permissions: ['dashboard:view']
    });
  };

  const handleTogglePermission = (roleId: string, permCode: PermissionCode) => {
    if (!hasPermission('roles.update')) {
      showAlert({
        title: '权限拦截',
        message: '权限不足：无法编辑角色权限',
        type: 'danger'
      });
      return;
    }
    if (!editingRole) return;

    const currentPerms = editingRole.permissions;
    const exists = currentPerms.includes(permCode);
    const updated = exists
      ? currentPerms.filter(p => p !== permCode)
      : [...currentPerms, permCode];

    setEditingRole({ ...editingRole, permissions: updated });
  };

  const handleSaveRolePermissions = () => {
    if (!editingRole) return;
    updateRolePermissions(editingRole.id, editingRole.permissions);
    updateRole(editingRole.id, {
      name: editingRole.name,
      description: editingRole.description
    });
    addActivityLog('编辑角色', `更新了角色【${editingRole.name}】的权限节点矩阵`, 'info');
    setEditingRole(null);
    showAlert({
      title: '保存角色配置',
      message: `角色【${editingRole.name}】的权限集已成功生效。`,
      type: 'success'
    });
  };

  const handleCloneRole = (role: Role) => {
    if (!hasPermission('roles.create')) return;
    addRole({
      code: `${role.code}_copy`,
      name: `${role.name} (副本)`,
      description: `复制自 ${role.name}: ${role.description}`,
      permissions: [...role.permissions]
    });
    addActivityLog('克隆角色', `快捷副本创建【${role.name} (副本)】`, 'info');
    showAlert({
      title: '已克隆副本',
      message: `已自动创建角色【${role.name} (副本)】`,
      type: 'info'
    });
  };

  const handleDeleteRole = (role: Role) => {
    if (!hasPermission('roles.delete')) {
      showAlert({
        title: '权限拦截',
        message: '权限不足：无法删除角色',
        type: 'danger'
      });
      return;
    }
    if (role.isSystem) {
      showAlert({
        title: '系统防护策略',
        message: '防护限制：系统内置基础角色为保护业务核心，不允许删除！',
        type: 'warning'
      });
      return;
    }
    if (role.userCount && role.userCount > 0) {
      showAlert({
        title: '依赖拦截',
        message: `删除拦截：仍有 ${role.userCount} 名账号关联此角色，请先解绑账号后再试！`,
        type: 'warning'
      });
      return;
    }

    showConfirm({
      title: '确认删除角色',
      message: `确认要移除角色【${role.name}】吗？删除后该角色配置将无法挽回。`,
      type: 'danger',
      confirmText: '确认删除',
      cancelText: '取消',
      onConfirm: () => {
        const ok = deleteRole(role.id);
        if (ok) {
          addActivityLog('删除角色', `成功移除角色【${role.name}】`, 'danger');
          showAlert({
            title: '删除完毕',
            message: `角色【${role.name}】已被清理。`,
            type: 'info'
          });
        }
      }
    });
  };

  // Group permissions by category
  const categories = Array.from(new Set(ALL_PERMISSIONS.map(p => p.category)));

  // Body scroll lock effect
  useEffect(() => {
    if (editingRole || isAddModalOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [editingRole, isAddModalOpen]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <UserCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              RBAC 角色模型配置
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            定义岗位角色模型、查看关联用户规模并解耦细粒度权限节点
          </p>
        </div>

        {hasPermission('roles.create') && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>创建自定义角色</span>
          </button>
        )}
      </div>

      {/* Roles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map(role => (
          <div
            key={role.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    {role.name}
                    {role.isSystem && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400">
                        系统内置
                      </span>
                    )}
                  </h3>
                  <code className="text-[11px] text-slate-400 font-mono">{role.code}</code>
                </div>

                <div className="flex items-center space-x-1 text-slate-400">
                  <span className="text-xs font-semibold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                    {role.userCount || 0} 人
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed min-h-[36px] line-clamp-2">
                {role.description}
              </p>

              {/* Permission summary pills */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[11px] text-slate-400 mb-2 font-medium">
                  包含节点 ({role.permissions.length} 个):
                </div>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                  {role.permissions.map(pCode => {
                    const node = ALL_PERMISSIONS.find(ap => ap.code === pCode);
                    return (
                      <span
                        key={pCode}
                        className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono"
                      >
                        {node ? node.name : pCode}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[10px] text-slate-400">更新于 {role.updatedAt}</span>

              <div className="flex items-center space-x-1">
                {hasPermission('roles.create') && (
                  <button
                    onClick={() => handleCloneRole(role)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 transition-colors"
                    title="克隆此角色"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                )}

                {hasPermission('roles.update') && (
                  <button
                    onClick={() => setEditingRole({ ...role })}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 transition-colors"
                    title="修改权限节点"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}

                {hasPermission('roles.delete') && !role.isSystem && (
                  <button
                    onClick={() => handleDeleteRole(role)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors"
                    title="删除角色"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Role Permissions Modal */}
      {editingRole && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setEditingRole(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-h-[85vh] flex flex-col ring-1 ring-slate-900/10 dark:ring-slate-100/10 overflow-hidden my-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4 shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  配置角色权限 - 【{editingRole.name}】
                </h3>
                <p className="text-xs text-slate-400">勾选授权节点，实时绑定模块可执行权限</p>
              </div>
              <button
                onClick={() => setEditingRole(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 min-h-0 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    角色显示名称
                  </label>
                  <input
                    type="text"
                    value={editingRole.name}
                    onChange={e => setEditingRole({ ...editingRole, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    角色描述
                  </label>
                  <input
                    type="text"
                    value={editingRole.description}
                    onChange={e => setEditingRole({ ...editingRole, description: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Permission Tree Category Groups */}
              <div className="space-y-4 pt-2">
                <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                  <span>授权节点分类:</span>
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                    已勾选 {editingRole.permissions.length} / {ALL_PERMISSIONS.length} 项
                  </span>
                </div>

                {categories.map(cat => {
                  const catNodes = ALL_PERMISSIONS.filter(p => p.category === cat);
                  return (
                    <div
                      key={cat}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50"
                    >
                      <div className="font-bold text-slate-800 dark:text-slate-200 mb-2">
                        {cat} 模块
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {catNodes.map(node => {
                          const isChecked = editingRole.permissions.includes(node.code);
                          return (
                            <label
                              key={node.code}
                              onClick={() => handleTogglePermission(editingRole.id, node.code)}
                              className={`p-2.5 rounded-xl border flex items-start space-x-2.5 cursor-pointer transition-all ${
                                isChecked
                                  ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                                  isChecked
                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                    : 'border-slate-300 dark:border-slate-600'
                                }`}
                              >
                                {isChecked && <Check className="w-3 h-3" />}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold leading-tight">{node.name}</div>
                                <div className="text-[10px] opacity-75 mt-0.5 line-clamp-1">
                                  {node.description}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 shrink-0">
              <button
                type="button"
                onClick={() => setEditingRole(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveRolePermissions}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md"
              >
                保存授权配置
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Create Role Modal */}
      {isAddModalOpen && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl ring-1 ring-slate-900/10 dark:ring-slate-100/10 max-h-[85vh] flex flex-col overflow-hidden my-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4 shrink-0">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                新建自定义角色模型
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4 overflow-y-auto pr-1 custom-scrollbar flex-1 min-h-0 text-xs flex flex-col justify-between">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  角色编码 (标识符) *
                </label>
                <input
                  type="text"
                  required
                  value={newRole.code}
                  onChange={e => setNewRole({ ...newRole, code: e.target.value })}
                  placeholder="例如: financial_manager"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  角色显示名称 *
                </label>
                <input
                  type="text"
                  required
                  value={newRole.name}
                  onChange={e => setNewRole({ ...newRole, name: e.target.value })}
                  placeholder="例如: 财务风控主管"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  职责描述
                </label>
                <textarea
                  rows={3}
                  value={newRole.description}
                  onChange={e => setNewRole({ ...newRole, description: e.target.value })}
                  placeholder="简述该角色的功能职责范围..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
                />
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
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md"
                >
                  确认创建
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
