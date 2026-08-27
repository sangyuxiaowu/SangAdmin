import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Building2,
  Building,
  Layers,
  Users,
  Plus,
  Search,
  Edit3,
  Trash2,
  ChevronRight,
  ChevronDown,
  UserCheck,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  FolderTree,
  UserPlus,
  Shield,
  ArrowUpDown,
  FileSpreadsheet,
  Info,
  UserMinus,
  Sparkles,
  Briefcase,
  Hash,
  AlertTriangle,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AccessDeniedView } from './AccessDeniedView';
import { CustomSelect } from '../components/common/CustomSelect';
import type { SelectOption } from '../components/common/CustomSelect';
import { DEFAULT_ORG_TREE, DEFAULT_USERS } from '../data/mockData';
import type { OrgNode, OrgType, User } from '../types';

// Helper icon & color for OrgType
const TYPE_CONFIG: Record<OrgType, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  group: {
    label: '集团总部',
    icon: Building2,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800'
  },
  company: {
    label: '分公司/中心',
    icon: Building,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
  },
  department: {
    label: '职能部门',
    icon: Layers,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
  },
  team: {
    label: '业务小组',
    icon: Users,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
  }
};

interface OrgManagementViewProps {
  onNavigate?: (path: string) => void;
}

export const OrgManagementView: React.FC<OrgManagementViewProps> = ({ onNavigate }) => {
  const { hasPermission } = useAuth();

  // State
  const [orgTree, setOrgTree] = useState<OrgNode[]>(DEFAULT_ORG_TREE);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('org-headquarter');
  const [expandedIds, setExpandedIds] = useState<string[]>([
    'org-headquarter',
    'org-rd-center',
    'org-fe-dept',
    'org-ops-center',
    'org-admin-center'
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'members' | 'children'>('info');

  // Users state
  const [usersList, setUsersList] = useState<User[]>(DEFAULT_USERS);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<OrgNode | null>(null);
  const [parentForNewSub, setParentForNewSub] = useState<OrgNode | null>(null);

  const [isLeaderModalOpen, setIsLeaderModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [deleteConfirmOrg, setDeleteConfirmOrg] = useState<OrgNode | null>(null);

  // Form State for Add / Edit Org
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formType, setFormType] = useState<OrgType>('department');
  const [formParentId, setFormParentId] = useState<string>('');
  const [formLeaderName, setFormLeaderName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formOrderNum, setFormOrderNum] = useState<number>(1);
  const [formStatus, setFormStatus] = useState<'active' | 'disabled'>('active');
  const [formDescription, setFormDescription] = useState('');

  // Transfer Member State
  const [selectedUserToTransfer, setSelectedUserToTransfer] = useState('');

  // Permission Guard
  if (!hasPermission('org:view')) {
    return <AccessDeniedView requiredPermission="org:view" onNavigate={onNavigate} />;
  }

  // --- Tree Helper Functions ---
  const findOrgNode = (nodes: OrgNode[], id: string): OrgNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findOrgNode(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const flattenOrgTree = (nodes: OrgNode[]): OrgNode[] => {
    let result: OrgNode[] = [];
    for (const node of nodes) {
      result.push(node);
      if (node.children) {
        result = result.concat(flattenOrgTree(node.children));
      }
    }
    return result;
  };

  const allFlatOrgs = useMemo(() => flattenOrgTree(orgTree), [orgTree]);
  const selectedOrg = useMemo(() => findOrgNode(orgTree, selectedOrgId) || orgTree[0], [orgTree, selectedOrgId]);

  // Expand / Collapse Toggles
  const toggleExpand = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const expandAll = () => {
    setExpandedIds(allFlatOrgs.map(o => o.id));
  };

  const collapseAll = () => {
    setExpandedIds([]);
  };

  // Find users belonging to selected department
  const selectedOrgMembers = useMemo(() => {
    if (!selectedOrg) return [];
    return usersList.filter(
      u => u.department === selectedOrg.name || u.department.includes(selectedOrg.name)
    );
  }, [usersList, selectedOrg]);

  // Global Org Metrics
  const totalOrgsCount = allFlatOrgs.length;
  const totalEmployeesCount = allFlatOrgs.reduce((acc, curr) => acc + (curr.memberCount || 0), 0);

  // --- Modal Handlers ---
  const handleOpenAddModal = (parent?: OrgNode) => {
    setEditingOrg(null);
    setParentForNewSub(parent || null);
    setFormName('');
    setFormCode(`ORG-${Math.floor(100 + Math.random() * 900)}`);
    setFormType(parent ? (parent.type === 'company' ? 'department' : 'team') : 'department');
    setFormParentId(parent ? parent.id : selectedOrg ? selectedOrg.id : 'org-headquarter');
    setFormLeaderName('');
    setFormPhone('');
    setFormEmail('');
    setFormOrderNum(1);
    setFormStatus('active');
    setFormDescription('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (org: OrgNode, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingOrg(org);
    setFormName(org.name);
    setFormCode(org.code);
    setFormType(org.type);
    setFormParentId(org.parentId || '');
    setFormLeaderName(org.leaderName || '');
    setFormPhone(org.phone || '');
    setFormEmail(org.email || '');
    setFormOrderNum(org.orderNum || 1);
    setFormStatus(org.status);
    setFormDescription(org.description || '');
    setIsAddModalOpen(true);
  };

  const handleSaveOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim()) return;

    if (editingOrg) {
      // Edit existing
      const updatedNode: OrgNode = {
        ...editingOrg,
        name: formName,
        code: formCode,
        type: formType,
        parentId: formParentId || null,
        leaderName: formLeaderName,
        phone: formPhone,
        email: formEmail,
        orderNum: formOrderNum,
        status: formStatus,
        description: formDescription
      };

      const recursiveUpdate = (nodes: OrgNode[]): OrgNode[] => {
        return nodes.map(n => {
          if (n.id === editingOrg.id) return { ...updatedNode, children: n.children };
          if (n.children) return { ...n, children: recursiveUpdate(n.children) };
          return n;
        });
      };

      setOrgTree(recursiveUpdate(orgTree));
    } else {
      // Add new node
      const newId = `org-custom-${Date.now()}`;
      const newNode: OrgNode = {
        id: newId,
        code: formCode,
        name: formName,
        type: formType,
        parentId: formParentId || null,
        leaderName: formLeaderName || '待定',
        leaderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        leaderTitle: `${formName} 负责人`,
        phone: formPhone || '021-88880000',
        email: formEmail || 'dept@nova.com',
        status: formStatus,
        orderNum: formOrderNum,
        memberCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        description: formDescription,
        children: []
      };

      const recursiveAdd = (nodes: OrgNode[]): OrgNode[] => {
        if (!formParentId) return [...nodes, newNode];
        return nodes.map(n => {
          if (n.id === formParentId) {
            return {
              ...n,
              children: [...(n.children || []), newNode]
            };
          }
          if (n.children) {
            return { ...n, children: recursiveAdd(n.children) };
          }
          return n;
        });
      };

      setOrgTree(recursiveAdd(orgTree));
      // Auto expand parent and select new
      if (formParentId && !expandedIds.includes(formParentId)) {
        setExpandedIds(prev => [...prev, formParentId]);
      }
      setSelectedOrgId(newId);
    }

    setIsAddModalOpen(false);
  };

  const handleDeleteOrg = (orgId: string) => {
    const recursiveDelete = (nodes: OrgNode[]): OrgNode[] => {
      return nodes
        .filter(n => n.id !== orgId)
        .map(n => ({
          ...n,
          children: n.children ? recursiveDelete(n.children) : []
        }));
    };

    setOrgTree(recursiveDelete(orgTree));
    setDeleteConfirmOrg(null);
    if (selectedOrgId === orgId) {
      setSelectedOrgId('org-headquarter');
    }
  };

  // Change Leader
  const handleChangeLeader = (userName: string) => {
    if (!selectedOrg) return;
    const targetUser = usersList.find(u => u.name === userName);
    if (!targetUser) return;

    const recursiveUpdateLeader = (nodes: OrgNode[]): OrgNode[] => {
      return nodes.map(n => {
        if (n.id === selectedOrg.id) {
          return {
            ...n,
            leaderName: targetUser.name,
            leaderAvatar: targetUser.avatar,
            leaderTitle: targetUser.position || `${n.name} 负责人`,
            email: targetUser.email,
            phone: targetUser.phone
          };
        }
        if (n.children) {
          return { ...n, children: recursiveUpdateLeader(n.children) };
        }
        return n;
      });
    };

    setOrgTree(recursiveUpdateLeader(orgTree));
    setIsLeaderModalOpen(false);
  };

  // Transfer Member to Selected Department
  const handleTransferUser = () => {
    if (!selectedUserToTransfer || !selectedOrg) return;
    setUsersList(prev =>
      prev.map(u => (u.id === selectedUserToTransfer ? { ...u, department: selectedOrg.name } : u))
    );

    // Increment member count in tree
    const recursiveIncCount = (nodes: OrgNode[]): OrgNode[] => {
      return nodes.map(n => {
        if (n.id === selectedOrg.id) {
          return { ...n, memberCount: n.memberCount + 1 };
        }
        if (n.children) {
          return { ...n, children: recursiveIncCount(n.children) };
        }
        return n;
      });
    };
    setOrgTree(recursiveIncCount(orgTree));
    setSelectedUserToTransfer('');
    setIsTransferModalOpen(false);
  };

  // Render Tree Recursive
  const renderTreeNode = (node: OrgNode, level: number = 0) => {
    const isExpanded = expandedIds.includes(node.id);
    const isSelected = selectedOrgId === node.id;
    const hasChildren = node.children && node.children.length > 0;

    const matchesSearch =
      searchQuery.trim() === '' ||
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.code.toLowerCase().includes(searchQuery.toLowerCase());

    const TypeIcon = TYPE_CONFIG[node.type]?.icon || Building2;
    const typeStyle = TYPE_CONFIG[node.type] || TYPE_CONFIG.department;

    return (
      <div key={node.id} className="select-none relative">
        <div
          onClick={() => setSelectedOrgId(node.id)}
          className={`group flex items-center justify-between px-2.5 py-2 my-0.5 rounded-xl cursor-pointer transition-all duration-150 text-xs sm:text-sm ${
            isSelected
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30 font-semibold'
              : matchesSearch
              ? 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200'
              : 'opacity-40 hover:opacity-80 text-slate-400'
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          <div className="flex items-center space-x-2 min-w-0 flex-1 pr-1">
            {/* Expand / Collapse Chevron */}
            {hasChildren ? (
              <button
                type="button"
                onClick={e => toggleExpand(node.id, e)}
                className={`p-1 rounded-md transition-transform shrink-0 ${
                  isSelected
                    ? 'hover:bg-indigo-500 text-indigo-100'
                    : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400'
                }`}
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            ) : (
              <span className="w-5 shrink-0" />
            )}

            {/* Type Badge Icon */}
            <div
              className={`p-1 rounded-lg shrink-0 ${
                isSelected
                  ? 'bg-indigo-500/40 text-white'
                  : `${typeStyle.bg} ${typeStyle.color}`
              }`}
            >
              <TypeIcon className="w-3.5 h-3.5" />
            </div>

            {/* Name */}
            <span className="font-medium truncate min-w-0" title={`${node.name} (${node.code})`}>
              {node.name}
            </span>
          </div>

          {/* Right Actions & Metrics */}
          <div className="flex items-center space-x-1 shrink-0 ml-1">
            {/* Member Count Pill */}
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                isSelected
                  ? 'bg-indigo-500/80 text-white'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400'
              }`}
            >
              {node.memberCount}人
            </span>

            {/* Quick Action Buttons on Hover */}
            <div
              className={`flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                isSelected ? 'text-indigo-100' : 'text-slate-400'
              }`}
            >
              <button
                title="添加下级机构"
                onClick={e => {
                  e.stopPropagation();
                  handleOpenAddModal(node);
                }}
                className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                title="编辑此机构"
                onClick={e => handleOpenEditModal(node, e)}
                className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Children Render */}
        {hasChildren && isExpanded && (
          <div className="relative">
            <div
              className="absolute top-0 bottom-2 w-px bg-slate-200/60 dark:bg-slate-800/60 pointer-events-none"
              style={{ left: `${level * 16 + 18}px` }}
            />
            {node.children!.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Parent Select Options for Add/Edit Modal
  const parentSelectOptions: SelectOption[] = useMemo(() => {
    return [
      { value: '', label: '无 (顶级集团/总部)' },
      ...allFlatOrgs
        .filter(o => editingOrg ? o.id !== editingOrg.id : true)
        .map(o => ({
          value: o.id,
          label: `${TYPE_CONFIG[o.type]?.label || '部门'} | ${o.name} (${o.code})`
        }))
    ];
  }, [allFlatOrgs, editingOrg]);

  const orgTypeOptions: SelectOption<OrgType>[] = [
    { value: 'group', label: '集团总部 (Group)' },
    { value: 'company', label: '分公司 / 事业中心 (Company)' },
    { value: 'department', label: '职能部门 (Department)' },
    { value: 'team', label: '业务小组 (Team)' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <FolderTree className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  组织机构树架构管理
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-medium border border-indigo-200/60 dark:border-indigo-800/60">
                    多层级树状建模
                  </span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  可视层级化组织架构树配置，支持部门新增/迁移、负责人变更与直属员工划拨。
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics & Global Actions */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-4 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">机构/部门总数</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{totalOrgsCount} 个</span>
              </div>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
              <div>
                <span className="text-slate-400 block text-[10px]">包含员工数</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{totalEmployeesCount} 人</span>
              </div>
            </div>

            <button
              onClick={() => handleOpenAddModal()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center space-x-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>新建根机构</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Tree Panel + Right Node Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Organization Tree (4 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col min-h-[620px]">
          {/* Panel Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">机构目录树</span>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={expandAll}
                className="px-2 py-1 text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="展开全部节点"
              >
                展开
              </button>
              <button
                onClick={collapseAll}
                className="px-2 py-1 text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="折叠全部节点"
              >
                折叠
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="搜索机构名称或编码..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Tree Scroll Container */}
          <div className="p-2 overflow-y-auto max-h-[520px] custom-scrollbar flex-1">
            {orgTree.map(rootNode => renderTreeNode(rootNode))}
          </div>
        </div>

        {/* Right Column: Organization Details & Management (8 cols) */}
        {selectedOrg ? (
          <div className="lg:col-span-7 xl:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col min-h-[620px]">
            {/* Top Detail Card Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div
                    className={`p-3 rounded-2xl border shadow-sm ${
                      TYPE_CONFIG[selectedOrg.type]?.bg || TYPE_CONFIG.department.bg
                    }`}
                  >
                    {React.createElement(
                      TYPE_CONFIG[selectedOrg.type]?.icon || Building2,
                      {
                        className: `w-6 h-6 ${
                          TYPE_CONFIG[selectedOrg.type]?.color || 'text-indigo-600'
                        }`
                      }
                    )}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {selectedOrg.name}
                      </h2>
                      <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {selectedOrg.code}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          selectedOrg.status === 'active'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                        }`}
                      >
                        {selectedOrg.status === 'active' ? '正常运行' : '已停用'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-3">
                      <span>类型: {TYPE_CONFIG[selectedOrg.type]?.label}</span>
                      <span>·</span>
                      <span>创建日期: {selectedOrg.createdAt}</span>
                    </p>
                  </div>
                </div>

                {/* Header Control Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenAddModal(selectedOrg)}
                    className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>新增下级</span>
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(selectedOrg)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>编辑</span>
                  </button>

                  <button
                    onClick={() => setDeleteConfirmOrg(selectedOrg)}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                    title="删除机构"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* View Tabs */}
              <div className="flex items-center space-x-2 mt-6 border-b border-slate-100 dark:border-slate-800 -mb-6">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`pb-3 text-xs font-bold transition-all relative ${
                    activeTab === 'info'
                      ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  机构概览与职责
                </button>
                <button
                  onClick={() => setActiveTab('members')}
                  className={`pb-3 text-xs font-bold transition-all relative flex items-center space-x-1.5 ${
                    activeTab === 'members'
                      ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <span>直属成员</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold">
                    {selectedOrgMembers.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('children')}
                  className={`pb-3 text-xs font-bold transition-all relative flex items-center space-x-1.5 ${
                    activeTab === 'children'
                      ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <span>下级分支机构</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 font-bold">
                    {selectedOrg.children ? selectedOrg.children.length : 0}
                  </span>
                </button>
              </div>
            </div>

            {/* Tab Body Content */}
            <div className="p-6 flex-1">
              {/* TAB 1: 机构概览 */}
              {activeTab === 'info' && (
                <div className="space-y-6">
                  {/* Leader Card */}
                  <div className="bg-gradient-to-r from-slate-50 to-indigo-50/30 dark:from-slate-800/60 dark:to-indigo-950/30 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3.5">
                      <img
                        src={
                          selectedOrg.leaderAvatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                        }
                        alt={selectedOrg.leaderName}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/30"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {selectedOrg.leaderName || '未设置负责人'}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-medium">
                            部门负责人
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {selectedOrg.leaderTitle || '负责该机构日常行政与人员协调'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-slate-600 dark:text-slate-300">
                      {selectedOrg.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{selectedOrg.phone}</span>
                        </div>
                      )}
                      {selectedOrg.email && (
                        <div className="flex items-center space-x-1">
                          <Mail className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{selectedOrg.email}</span>
                        </div>
                      )}
                      <button
                        onClick={() => setIsLeaderModalOpen(true)}
                        className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 transition-colors shadow-xs"
                      >
                        变更负责人
                      </button>
                    </div>
                  </div>

                  {/* Key Properties Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40">
                      <span className="text-xs text-slate-400 block mb-1">上级隶属机构</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {selectedOrg.parentId
                          ? findOrgNode(orgTree, selectedOrg.parentId)?.name || '未指定'
                          : '无 (顶级机构)'}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40">
                      <span className="text-xs text-slate-400 block mb-1">直属编制人数</span>
                      <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                        {selectedOrg.memberCount} 名正式员工
                      </span>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40">
                      <span className="text-xs text-slate-400 block mb-1">架构排序权重</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">
                        Sequence #{selectedOrg.orderNum}
                      </span>
                    </div>
                  </div>

                  {/* Description & Responsibilities */}
                  <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                      <span>机构职责与运营范围</span>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {selectedOrg.description || '暂无填写入职与部门职能描述信息。'}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: 直属成员列表 */}
              {activeTab === 'members' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      归属于【{selectedOrg.name}】的系统账号 ({selectedOrgMembers.length})
                    </h3>

                    <button
                      onClick={() => setIsTransferModalOpen(true)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors shadow-sm"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>划拨人员入本部门</span>
                    </button>
                  </div>

                  {selectedOrgMembers.length === 0 ? (
                    <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                      <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-xs text-slate-500">当前部门下暂无归属账号</p>
                      <button
                        onClick={() => setIsTransferModalOpen(true)}
                        className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                      >
                        从其他部门调入或新建人员
                      </button>
                    </div>
                  ) : (
                    <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200/60 dark:border-slate-800">
                          <tr>
                            <th className="py-2.5 px-3">姓名 / 账号</th>
                            <th className="py-2.5 px-3">职位头衔</th>
                            <th className="py-2.5 px-3">角色权限</th>
                            <th className="py-2.5 px-3">联系电话</th>
                            <th className="py-2.5 px-3 text-right">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                          {selectedOrgMembers.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="py-2.5 px-3">
                                <div className="flex items-center space-x-2.5">
                                  <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-7 h-7 rounded-full object-cover"
                                  />
                                  <div>
                                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                                      {user.name}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      @{user.username}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                                {user.position}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800">
                                  {user.roleName}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-500 font-mono">
                                {user.phone}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <button
                                  onClick={() => handleChangeLeader(user.name)}
                                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                                >
                                  设为负责人
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: 下级机构列表 */}
              {activeTab === 'children' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      直属下级架构 ({selectedOrg.children ? selectedOrg.children.length : 0})
                    </h3>

                    <button
                      onClick={() => handleOpenAddModal(selectedOrg)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>新增子部门</span>
                    </button>
                  </div>

                  {!selectedOrg.children || selectedOrg.children.length === 0 ? (
                    <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                      <Building className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-xs text-slate-500">当前机构下无直接下级分支</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedOrg.children.map(child => (
                        <div
                          key={child.id}
                          onClick={() => setSelectedOrgId(child.id)}
                          className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/60 dark:hover:border-indigo-500/60 bg-white dark:bg-slate-900 cursor-pointer transition-all hover:shadow-md group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                              <div
                                className={`p-2 rounded-xl ${
                                  TYPE_CONFIG[child.type]?.bg || TYPE_CONFIG.department.bg
                                }`}
                              >
                                {React.createElement(
                                  TYPE_CONFIG[child.type]?.icon || Building2,
                                  { className: 'w-4 h-4 text-indigo-600' }
                                )}
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">
                                  {child.name}
                                </h4>
                                <span className="text-[10px] font-mono text-slate-400">
                                  {child.code}
                                </span>
                              </div>
                            </div>

                            <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                              {child.memberCount}人
                            </span>
                          </div>

                          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
                            <span>负责人: {child.leaderName || '未定'}</span>
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* --- MODAL 1: Add/Edit Organization Modal --- */}
      {isAddModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsAddModalOpen(false)}
          >
            <div
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden my-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center space-x-2">
                  <FolderTree className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {editingOrg ? '编辑机构节点' : parentForNewSub ? `为【${parentForNewSub.name}】新增下级` : '新建根机构/部门'}
                  </h3>
                </div>

                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveOrg} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      机构/部门名称 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      placeholder="例如：华东研发中心 / 智能交互组"
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  {/* Code */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      机构唯一编码 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formCode}
                      onChange={e => setFormCode(e.target.value)}
                      placeholder="例如：ORG-RD-01"
                      className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      机构类型 <span className="text-rose-500">*</span>
                    </label>
                    <CustomSelect
                      options={orgTypeOptions}
                      value={formType}
                      onChange={val => setFormType(val as OrgType)}
                    />
                  </div>

                  {/* Parent Org */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      上级隶属节点
                    </label>
                    <CustomSelect
                      options={parentSelectOptions}
                      value={formParentId}
                      onChange={setFormParentId}
                    />
                  </div>

                  {/* Leader Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      负责人姓名
                    </label>
                    <input
                      type="text"
                      value={formLeaderName}
                      onChange={e => setFormLeaderName(e.target.value)}
                      placeholder="例如：张维"
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  {/* Order Num */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      排序序号
                    </label>
                    <input
                      type="number"
                      value={formOrderNum}
                      onChange={e => setFormOrderNum(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      联系电话
                    </label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={e => setFormPhone(e.target.value)}
                      placeholder="021-88880000"
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      部门邮箱
                    </label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={e => setFormEmail(e.target.value)}
                      placeholder="dept@nova.com"
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  {/* Status */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      节点状态
                    </label>
                    <div className="flex items-center space-x-4 pt-1">
                      <label className="flex items-center space-x-2 text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="active"
                          checked={formStatus === 'active'}
                          onChange={() => setFormStatus('active')}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>正常启用</span>
                      </label>
                      <label className="flex items-center space-x-2 text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="disabled"
                          checked={formStatus === 'disabled'}
                          onChange={() => setFormStatus('disabled')}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>已停用</span>
                      </label>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      机构职责描述
                    </label>
                    <textarea
                      rows={3}
                      value={formDescription}
                      onChange={e => setFormDescription(e.target.value)}
                      placeholder="介绍部门核心职责与业务范畴..."
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-500/20 transition-all"
                  >
                    保存提交
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* --- MODAL 2: Transfer User Modal --- */}
      {isTransferModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsTransferModalOpen(false)}
          >
            <div
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-6 space-y-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                  <UserPlus className="w-5 h-5 text-indigo-600" />
                  <span>调入人员到【{selectedOrg.name}】</span>
                </h3>
                <button onClick={() => setIsTransferModalOpen(false)}>
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <p className="text-xs text-slate-500">
                请选择从系统其他账号库调入该部门的人员：
              </p>

              <div>
                <CustomSelect
                  options={usersList.map(u => ({
                    value: u.id,
                    label: `${u.name} (@${u.username}) - 目前所在: ${u.department}`
                  }))}
                  value={selectedUserToTransfer}
                  onChange={setSelectedUserToTransfer}
                  placeholder="选择要调入的员工账号..."
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  取消
                </button>
                <button
                  onClick={handleTransferUser}
                  disabled={!selectedUserToTransfer}
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-md"
                >
                  确认调入
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* --- MODAL 3: Delete Confirm Modal --- */}
      {deleteConfirmOrg &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setDeleteConfirmOrg(null)}
          >
            <div
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-6 space-y-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start space-x-3 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    确认移除机构节点？
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    即将移除【{deleteConfirmOrg.name}】（编码：{deleteConfirmOrg.code}）。
                    {deleteConfirmOrg.children && deleteConfirmOrg.children.length > 0 && (
                      <span className="block mt-1 text-rose-500 font-semibold">
                        注意：此操作包含 {deleteConfirmOrg.children.length} 个直接下级子部门，移除后子节点将一并删除！
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmOrg(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  取消
                </button>
                <button
                  onClick={() => handleDeleteOrg(deleteConfirmOrg.id)}
                  className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md"
                >
                  确认彻底删除
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
