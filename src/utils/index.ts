import type { OrgNode, PermissionNode, PermissionCode } from '../types';

/**
 * 通用树结构节点查找
 */
export function findTreeNode<T extends { id: string; children?: T[] }>(
  nodes: T[],
  id: string
): T | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findTreeNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * 展平树状结构为一维数组
 */
export function flattenTree<T extends { children?: T[] }>(nodes: T[]): T[] {
  let result: T[] = [];
  for (const node of nodes) {
    result.push(node);
    if (node.children && node.children.length > 0) {
      result = result.concat(flattenTree(node.children));
    }
  }
  return result;
}

/**
 * 格式化相对时间或日期字符串
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins} 分钟前`;
  if (diffHours < 24) return `${diffHours} 小时前`;
  if (diffDays < 7) return `${diffDays} 天前`;

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * 检查用户是否拥有任意指定权限
 */
export function hasAnyPermission(
  userPermissions: PermissionCode[],
  required: PermissionCode[]
): boolean {
  if (userPermissions.includes('system:config') || userPermissions.includes('permissions.read')) {
    return true;
  }
  return required.some(code => userPermissions.includes(code));
}

/**
 * 导出数据为 CSV 文件并触发下载
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: { key: keyof T; label: string }[]
) {
  if (!data || data.length === 0) return;

  const cols = headers || Object.keys(data[0]).map(k => ({ key: k as keyof T, label: String(k) }));
  const headerLine = cols.map(c => `"${c.label}"`).join(',');

  const rows = data.map(item =>
    cols
      .map(c => {
        const val = item[c.key];
        const str = val === null || val === undefined ? '' : String(val).replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(',')
  );

  const csvContent = '\uFEFF' + [headerLine, ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
