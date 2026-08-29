import type { Role, User, PermissionNode, ActivityLog, SystemNotification, OrgNode } from '../types';

export const ALL_PERMISSIONS: PermissionNode[] = [
  {
    code: 'dashboard:view',
    name: '查看仪表盘',
    description: '允许访问首页概览面板',
    category: '仪表盘'
  },
  {
    code: 'dashboard:export',
    name: '导出仪表盘数据',
    description: '允许下载首页关键数据报表',
    category: '仪表盘'
  },
  {
    code: 'analytics:view',
    name: '查看数据分析',
    description: '允许查看多维度流量及营收分析图表',
    category: '数据分析'
  },
  {
    code: 'analytics:export',
    name: '导出分析报表',
    description: '允许导出图表原始CSV/Excel文件',
    category: '数据分析'
  },
  {
    code: 'users.read',
    name: '查看用户列表',
    description: '允许浏览系统用户基本信息',
    category: '用户管理'
  },
  {
    code: 'users.create',
    name: '新建用户',
    description: '允许添加新后台账号',
    category: '用户管理'
  },
  {
    code: 'users.update',
    name: '编辑用户',
    description: '允许修改用户信息及分配角色',
    category: '用户管理'
  },
  {
    code: 'users.delete',
    name: '删除/冻结用户',
    description: '允许移除或封禁违规账号',
    category: '用户管理'
  },
  {
    code: 'org:view',
    name: '查看机构树',
    description: '允许查看组织架构及部门人员分布',
    category: '机构管理'
  },
  {
    code: 'org:manage',
    name: '管理机构架构',
    description: '允许新增、编辑、删除部门及变更部门负责人',
    category: '机构管理'
  },
  {
    code: 'roles.read',
    name: '查看角色列表',
    description: '允许浏览系统角色定义',
    category: '角色权限'
  },
  {
    code: 'roles.create',
    name: '创建自定义角色',
    description: '允许新建角色模板',
    category: '角色权限'
  },
  {
    code: 'roles.update',
    name: '编辑角色',
    description: '允许修改角色基本信息',
    category: '角色权限'
  },
  {
    code: 'roles.delete',
    name: '删除角色',
    description: '允许删除非系统内置角色',
    category: '角色权限'
  },
  {
    code: 'permissions.read',
    name: '分配权限矩阵',
    description: '允许配置角色与权限映射节点',
    category: '角色权限'
  },
  {
    code: 'system:view',
    name: '查看系统配置',
    description: '允许查看全局运行参数',
    category: '系统配置'
  },
  {
    code: 'system:config',
    name: '修改系统参数',
    description: '允许变更安全策略及维护模式',
    category: '系统配置'
  },
  {
    code: 'audit:view',
    name: '查看审计日志',
    description: '允许检索全站操作痕迹',
    category: '审计日志'
  }
];

export const DEFAULT_ROLES: Role[] = [
  {
    id: 'role-superadmin',
    code: 'super_admin',
    name: '超级管理员',
    description: '拥有系统最高控制权限，可管理所有模块与节点',
    isAdministrator: true,
    userCount: 2,
    createdAt: '2025-01-01',
    updatedAt: '2026-07-01',
    permissions: ALL_PERMISSIONS.map(p => p.code)
  },
  {
    id: 'role-sysadmin',
    code: 'sys_admin',
    name: '系统运维官',
    description: '负责用户管理、日志监控与基础运维服务',
    isAdministrator: true,
    userCount: 4,
    createdAt: '2025-01-10',
    updatedAt: '2026-06-15',
    permissions: [
      'dashboard:view', 'dashboard:export',
      'users.read', 'users.create', 'users.update', 'users.delete',
      'org:view', 'org:manage',
      'roles.read',
      'system:view', 'system:config', 'audit:view'
    ]
  },
  {
    id: 'role-analyst',
    code: 'data_analyst',
    name: '高级数据分析师',
    description: '专注于商业智能、报表深度研判与运营分析',
    isAdministrator: false,
    userCount: 6,
    createdAt: '2025-03-12',
    updatedAt: '2026-05-20',
    permissions: [
      'dashboard:view', 'dashboard:export',
      'analytics:view', 'analytics:export',
      'audit:view'
    ]
  },
  {
    id: 'role-editor',
    code: 'content_editor',
    name: '运营编辑官',
    description: '具备日常业务数据查看与用户基本管理能力',
    isAdministrator: false,
    userCount: 12,
    createdAt: '2025-04-01',
    updatedAt: '2026-04-10',
    permissions: [
      'dashboard:view',
      'analytics:view',
      'users.read'
    ]
  },
  {
    id: 'role-guest',
    code: 'guest_viewer',
    name: '访客体验员',
    description: '仅具备只读仪表盘查看权限',
    isAdministrator: false,
    userCount: 3,
    createdAt: '2025-05-01',
    updatedAt: '2026-02-01',
    permissions: [
      'dashboard:view'
    ]
  }
];

export const DEFAULT_USERS: User[] = [
  {
    id: 'usr-1',
    username: 'admin',
    name: '陆天行',
    email: 'admin@sang.cool',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    phone: '13800138000',
    department: '总经办',
    position: '首席架构师 / 站长',
    roleId: 'role-superadmin',
    roleName: '超级管理员',
    status: 'active',
    lastLogin: '2026-07-31 19:15',
    createdAt: '2025-01-01',
    bio: '专注云原生架构与企业级权限控制设计，拥有10年分布式系统开发经验。'
  },
  {
    id: 'usr-2',
    username: 'lin.yu',
    name: '林雨晴',
    email: 'lin.yu@sang.cool',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    phone: '13912345678',
    department: '技术运维部',
    position: '资深运维专家',
    roleId: 'role-sysadmin',
    roleName: '系统运维官',
    status: 'active',
    lastLogin: '2026-07-31 18:42',
    createdAt: '2025-02-15',
    bio: '保障服务99.99%高可用，擅长容器编排与DevOps链路优化。'
  },
  {
    id: 'usr-3',
    username: 'chen.ming',
    name: '陈明哲',
    email: 'chen.ming@sang.cool',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    phone: '13788889999',
    department: '商业智能部',
    position: '数据分析总监',
    roleId: 'role-analyst',
    roleName: '高级数据分析师',
    status: 'active',
    lastLogin: '2026-07-30 16:20',
    createdAt: '2025-03-20',
    bio: '挖掘数据潜能，驱动业务精准增长。'
  },
  {
    id: 'usr-4',
    username: 'zhang.wei',
    name: '张薇薇',
    email: 'zhang.wei@sang.cool',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    phone: '13566667777',
    department: '产品增长部',
    position: '内容运营经理',
    roleId: 'role-editor',
    roleName: '运营编辑官',
    status: 'active',
    lastLogin: '2026-07-31 14:10',
    createdAt: '2025-04-12',
    bio: '全平台内容矩阵运营，提升用户留存与活跃。'
  },
  {
    id: 'usr-5',
    username: 'guest',
    name: '体验账号',
    email: 'guest@sang.cool',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    phone: '13000000000',
    department: '外部协作',
    position: '访客体验官',
    roleId: 'role-guest',
    roleName: '访客体验员',
    status: 'active',
    lastLogin: '2026-07-29 10:00',
    createdAt: '2025-05-01',
    bio: '用于限制权限演示体验。'
  },
  {
    id: 'usr-6',
    username: 'wang.lei',
    name: '王磊',
    email: 'wang.lei@sang.cool',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
    phone: '13122223333',
    department: '风险控制部',
    position: '合规风控官',
    roleId: 'role-sysadmin',
    roleName: '系统运维官',
    status: 'suspended',
    lastLogin: '2026-07-15 09:30',
    createdAt: '2025-06-10',
    bio: '该账号处于风险监管状态。'
  }
];

export const MOCK_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'ntf-1',
    title: '安全策略审计提醒',
    message: '系统检测到包含二次验证在内的3项高安全级别节点更改。',
    timestamp: '10分钟前',
    read: false,
    type: 'security'
  },
  {
    id: 'ntf-2',
    title: '月度运营报表生成完毕',
    message: '2026年7月商业智能多维度增长分析表已推送至数据大屏。',
    timestamp: '1小时前',
    read: false,
    type: 'system'
  },
  {
    id: 'ntf-3',
    title: '新用户角色分配申领',
    message: '用户【陈明哲】申请开通导出高阶权限，等待审批。',
    timestamp: '3小时前',
    read: true,
    type: 'task'
  }
];

export const MOCK_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    userId: 'usr-1',
    userName: '陆天行',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    action: '分配权限节点',
    target: '角色【高级数据分析师】新增了 analytics:export 权限',
    timestamp: '2026-07-31 19:10',
    type: 'success',
    ip: '192.168.1.102'
  },
  {
    id: 'log-2',
    userId: 'usr-2',
    userName: '林雨晴',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    action: '更新系统策略',
    target: '开启会话30分钟无操作自动锁定',
    timestamp: '2026-07-31 18:45',
    type: 'info',
    ip: '114.242.22.18'
  },
  {
    id: 'log-3',
    userId: 'usr-3',
    userName: '陈明哲',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    action: '导出数据图表',
    target: '批量导出【Q3转化率趋势矩阵.xlsx】',
    timestamp: '2026-07-31 16:30',
    type: 'info',
    ip: '180.168.90.12'
  },
  {
    id: 'log-4',
    userId: 'usr-1',
    userName: '陆天行',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    action: '账号状态冻结',
    target: '暂停违规测试账号【王磊】登录权限',
    timestamp: '2026-07-31 15:00',
    type: 'warning',
    ip: '192.168.1.102'
  }
];

export const CHART_DATA_TREND = [
  { time: '07-01', pv: 12400, uv: 8200, revenue: 48200, conversion: 3.2 },
  { time: '07-05', pv: 15800, uv: 9600, revenue: 59100, conversion: 3.5 },
  { time: '07-10', pv: 14200, uv: 8900, revenue: 52400, conversion: 3.4 },
  { time: '07-15', pv: 21000, uv: 13500, revenue: 78900, conversion: 4.1 },
  { time: '07-20', pv: 18900, uv: 11800, revenue: 69400, conversion: 3.8 },
  { time: '07-25', pv: 24500, uv: 16200, revenue: 92800, conversion: 4.6 },
  { time: '07-30', pv: 28900, uv: 18400, revenue: 108500, conversion: 5.0 }
];

export const CHART_DATA_REGIONS = [
  { name: '华东大区', users: 4250, orderRate: 88, revenue: 320000 },
  { name: '华南大区', users: 3120, orderRate: 76, revenue: 245000 },
  { name: '华北大区', users: 2890, orderRate: 82, revenue: 218000 },
  { name: '西南大区', users: 1950, orderRate: 64, revenue: 142000 },
  { name: '华中大区', users: 1680, orderRate: 70, revenue: 128000 }
];

export const CHART_DATA_DEVICES = [
  { name: '桌面 Chrome', value: 58, color: '#6366f1' },
  { name: '移动 Safari', value: 24, color: '#06b6d4' },
  { name: '桌面 Edge', value: 10, color: '#3b82f6' },
  { name: '微信内置', value: 8, color: '#10b981' }
];

export const CHART_DATA_RADAR = [
  { category: '可用性', current: 98, benchmark: 90 },
  { category: '响应时延', current: 92, benchmark: 85 },
  { category: '并发吞吐', current: 88, benchmark: 80 },
  { category: '安全合规', current: 99, benchmark: 95 },
  { category: '弹性扩展', current: 94, benchmark: 88 },
  { category: '故障恢复', current: 90, benchmark: 85 }
];

export const DEFAULT_ORG_TREE: OrgNode[] = [
  {
    id: 'org-headquarter',
    code: 'SANG-GROUP',
    name: 'Sang 科技集团总部',
    type: 'group',
    parentId: null,
    leaderName: '陆天行',
    leaderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    leaderTitle: '集团 CEO / 首席架构师',
    phone: '021-88889999',
    email: 'headquarter@sang.cool',
    status: 'active',
    orderNum: 1,
    memberCount: 118,
    createdAt: '2025-01-01',
    description: 'Sang 科技集团最高决策指挥中心，统一统筹管理各事业部与分公司研发及运营。',
    children: [
      {
        id: 'org-exec',
        code: 'ORG-EXEC',
        name: '总裁办 / 总经办',
        type: 'department',
        parentId: 'org-headquarter',
        leaderName: '陆天行',
        leaderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        leaderTitle: '集团 CEO',
        phone: '021-88889901',
        email: 'exec@sang.cool',
        status: 'active',
        orderNum: 1,
        memberCount: 8,
        createdAt: '2025-01-01',
        description: '负责集团战略路线制定、核心资本运作及高级高管日常协调决策。'
      },
      {
        id: 'org-rd-center',
        code: 'ORG-RD-EC',
        name: '华东研发中心',
        type: 'company',
        parentId: 'org-headquarter',
        leaderName: '林雨晴',
        leaderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        leaderTitle: '华东研发中心总经理',
        phone: '021-66668888',
        email: 'rd-east@sang.cool',
        status: 'active',
        orderNum: 2,
        memberCount: 54,
        createdAt: '2025-02-10',
        description: '聚焦云原生架构、微服务中台以及前端可视化大屏的核心产品研发。',
        children: [
          {
            id: 'org-fe-dept',
            code: 'ORG-FE-01',
            name: '前端架构与体验部',
            type: 'department',
            parentId: 'org-rd-center',
            leaderName: '张维',
            leaderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
            leaderTitle: '前端技术总监',
            phone: '021-66668811',
            email: 'fe-team@sang.cool',
            status: 'active',
            orderNum: 1,
            memberCount: 22,
            createdAt: '2025-02-15',
            description: '负责 Web/App 前端架构设计、设计系统（Design System）维护及中台 UI 组件库打造。',
            children: [
              {
                id: 'org-fe-ui',
                code: 'TEAM-FE-UI',
                name: 'UI 组件基础设施组',
                type: 'team',
                parentId: 'org-fe-dept',
                leaderName: '陈思涵',
                leaderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
                leaderTitle: '高级 UI 开发者',
                phone: '021-66668812',
                email: 'ui-team@sang.cool',
                status: 'active',
                orderNum: 1,
                memberCount: 10,
                createdAt: '2025-03-01',
                description: '研发并维护企业级 Design System，提供统一无障碍通用组件库。'
              },
              {
                id: 'org-fe-3d',
                code: 'TEAM-FE-3D',
                name: 'Web3D 与数字孪生组',
                type: 'team',
                parentId: 'org-fe-dept',
                leaderName: '王磊',
                leaderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
                leaderTitle: '图形学资深专家',
                phone: '021-66668813',
                email: 'graphics3d@sang.cool',
                status: 'active',
                orderNum: 2,
                memberCount: 12,
                createdAt: '2025-03-15',
                description: '负责可视化引擎、Web3D 数据渲染与物联网设备数字孪生建模。'
              }
            ]
          },
          {
            id: 'org-be-dept',
            code: 'ORG-BE-01',
            name: '云原生与后端中台部',
            type: 'department',
            parentId: 'org-rd-center',
            leaderName: '陈明哲',
            leaderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
            leaderTitle: '首席后端架构师',
            phone: '021-66668822',
            email: 'be-team@sang.cool',
            status: 'active',
            orderNum: 2,
            memberCount: 20,
            createdAt: '2025-02-15',
            description: '主导分布式微服务架构、Kubernetes 容器云平台及高并发安全鉴权体系。'
          },
          {
            id: 'org-qa-dept',
            code: 'ORG-QA-01',
            name: '质量保障与测试部',
            type: 'department',
            parentId: 'org-rd-center',
            leaderName: '赵雅雯',
            leaderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
            leaderTitle: 'QA 负责人',
            phone: '021-66668833',
            email: 'qa@sang.cool',
            status: 'active',
            orderNum: 3,
            memberCount: 12,
            createdAt: '2025-03-01',
            description: '负责自动化测试流水线、CI/CD 质量关卡及全链路压力测试。'
          }
        ]
      },
      {
        id: 'org-ops-center',
        code: 'ORG-OPS-DIG',
        name: '数字商业与运营中心',
        type: 'company',
        parentId: 'org-headquarter',
        leaderName: '姜敏',
        leaderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
        leaderTitle: '运营副总裁',
        phone: '021-77771111',
        email: 'growth@sang.cool',
        status: 'active',
        orderNum: 3,
        memberCount: 36,
        createdAt: '2025-03-01',
        description: '驱动数字营销、用户全生命周期运营与大数据商业智能研判。',
        children: [
          {
            id: 'org-bi-dept',
            code: 'ORG-BI-01',
            name: '商业智能与大数据部',
            type: 'department',
            parentId: 'org-ops-center',
            leaderName: '姜敏',
            leaderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
            leaderTitle: '资深 BI 专家',
            phone: '021-77771122',
            email: 'bi@sang.cool',
            status: 'active',
            orderNum: 1,
            memberCount: 18,
            createdAt: '2025-03-10',
            description: '搭建多维数据仓库，生成实时漏斗分析与全站归因建模。'
          },
          {
            id: 'org-mkt-dept',
            code: 'ORG-MKT-01',
            name: '品牌增长与推广部',
            type: 'department',
            parentId: 'org-ops-center',
            leaderName: '孙一鸣',
            leaderAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
            leaderTitle: '市场总监',
            phone: '021-77771133',
            email: 'marketing@sang.cool',
            status: 'active',
            orderNum: 2,
            memberCount: 18,
            createdAt: '2025-03-12',
            description: '负责线上渠道投放、行业峰会组织及品牌声誉全网公关。'
          }
        ]
      },
      {
        id: 'org-admin-center',
        code: 'ORG-ADMIN-CORP',
        name: '综合支撑与职能中心',
        type: 'company',
        parentId: 'org-headquarter',
        leaderName: '李娜',
        leaderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        leaderTitle: '行政与 HRVP',
        phone: '021-55550000',
        email: 'hr-admin@sang.cool',
        status: 'active',
        orderNum: 4,
        memberCount: 20,
        createdAt: '2025-01-10',
        description: '提供人力资源规划、财务审计、法规合规与办公场地基础设施保障。',
        children: [
          {
            id: 'org-hr-dept',
            code: 'ORG-HR-01',
            name: '人力资源与组织发展部',
            type: 'department',
            parentId: 'org-admin-center',
            leaderName: '李娜',
            leaderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            leaderTitle: 'HRD',
            phone: '021-55550011',
            email: 'hr@sang.cool',
            status: 'active',
            orderNum: 1,
            memberCount: 11,
            createdAt: '2025-01-10',
            description: '负责人才招募、组织绩效考核、员工培训发展与薪酬福利体系。'
          },
          {
            id: 'org-fin-dept',
            code: 'ORG-FIN-01',
            name: '财务与风控审计部',
            type: 'department',
            parentId: 'org-admin-center',
            leaderName: '周伟',
            leaderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
            leaderTitle: '财务总监',
            phone: '021-55550022',
            email: 'finance@sang.cool',
            status: 'active',
            orderNum: 2,
            memberCount: 9,
            createdAt: '2025-01-10',
            description: '负责预算管理、资金统筹、税务合规及内部风险审计控管。'
          }
        ]
      }
    ]
  }
];
