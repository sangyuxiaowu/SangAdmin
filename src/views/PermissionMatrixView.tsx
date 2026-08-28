import React, { useState } from 'react';
import {
  KeyRound,
  ShieldCheck,
  Check,
  X,
  Save,
  RotateCcw,
  Sparkles,
  Info,
  CheckSquare,
  Square
} from 'lucide-react';
import { usePermissions } from '../context/PermissionContext';
import { useAuth } from '../context/AuthContext';
import { ALL_PERMISSIONS } from '$mock';
import type { PermissionCode } from '../types';
import { AccessDeniedView } from './AccessDeniedView';

interface PermissionMatrixViewProps {
  onNavigate: (path: string) => void;
}

export const PermissionMatrixView: React.FC<PermissionMatrixViewProps> = ({ onNavigate }) => {
  const { roles, updateRolePermissions, resetToDefaults } = usePermissions();
  const { hasPermission, addActivityLog } = useAuth();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!hasPermission('permission:manage')) {
    return <AccessDeniedView requiredPermission="permission:manage" onNavigate={onNavigate} />;
  }

  const categories = Array.from(new Set(ALL_PERMISSIONS.map(p => p.category)));

  const filteredPermissions = ALL_PERMISSIONS.filter(
    p => activeCategory === 'all' || p.category === activeCategory
  );

  const handleCellToggle = (roleId: string, permCode: PermissionCode) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;

    const exists = role.permissions.includes(permCode);
    const updated = exists
      ? role.permissions.filter(p => p !== permCode)
      : [...role.permissions, permCode];

    updateRolePermissions(roleId, updated);
  };

  const handleToggleCategoryForRole = (roleId: string, category: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;

    const categoryPermCodes = ALL_PERMISSIONS.filter(p => p.category === category).map(p => p.code);
    const allSelected = categoryPermCodes.every(code => role.permissions.includes(code));

    let updated: PermissionCode[];
    if (allSelected) {
      // Remove all category codes
      updated = role.permissions.filter(code => !categoryPermCodes.includes(code));
    } else {
      // Add all missing category codes
      const set = new Set([...role.permissions, ...categoryPermCodes]);
      updated = Array.from(set);
    }

    updateRolePermissions(roleId, updated);
  };

  const handleSaveAll = () => {
    addActivityLog('权限矩阵更新', '保存全站角色与权限关联矩阵配置', 'success');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <KeyRound className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              权限树矩阵分配与交叉映射
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            横轴为系统角色模型，纵轴为可执行授权节点，点击交叉单元格即刻授权/取消
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={resetToDefaults}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium text-xs transition-colors flex items-center gap-1.5"
            title="还原初始内置数据"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置为预设节点</span>
          </button>

          <button
            onClick={handleSaveAll}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{saveSuccess ? '矩阵更改已保存！' : '保存矩阵更改'}</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center space-x-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 w-fit text-xs font-medium overflow-x-auto max-w-full">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3.5 py-1.5 rounded-xl transition-all ${
            activeCategory === 'all'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          全模块节点 ({ALL_PERMISSIONS.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeCategory === cat
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Permission Grid Matrix */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold">
                <th className="py-4 px-4 min-w-[240px] sticky left-0 z-20 bg-slate-50 dark:bg-slate-800/90 border-r border-slate-200 dark:border-slate-800">
                  授权节点 / 模块功能
                </th>
                {roles.map(role => (
                  <th
                    key={role.id}
                    className="py-4 px-4 text-center min-w-[120px] border-r border-slate-100 dark:border-slate-800/60"
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-slate-900 dark:text-slate-100">{role.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono font-normal">
                        ({role.permissions.length} 节点)
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredPermissions.map(perm => (
                <tr
                  key={perm.code}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Row header */}
                  <td className="py-3 px-4 font-medium sticky left-0 z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        {perm.category}
                      </span>
                      <span>{perm.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{perm.code}</div>
                  </td>

                  {/* Role Checkboxes Matrix */}
                  {roles.map(role => {
                    const isGranted = role.permissions.includes(perm.code);
                    return (
                      <td
                        key={role.id}
                        onClick={() => handleCellToggle(role.id, perm.code)}
                        className="py-3 px-4 text-center cursor-pointer border-r border-slate-100 dark:border-slate-800/40 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 transition-colors"
                      >
                        <div className="inline-flex items-center justify-center">
                          {isGranted ? (
                            <span className="w-7 h-7 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                              <Check className="w-4 h-4 stroke-[3]" />
                            </span>
                          ) : (
                            <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center">
                              <X className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
