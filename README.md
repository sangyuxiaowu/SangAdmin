# SangAdmin - 现代化企业级智能中后台管理系统

> 基于 **React 19 + TypeScript + Vite 6 + Tailwind CSS v4** 打造的高性能、企业级 RBAC 权限控制、2FA 双因子安全凭据与商业智能中后台前端系统。

---

## 🌟 核心特性概览

- **🛡️ 细粒度 RBAC 动态权限体系**：
  - 支持多角色分配与可视化权限矩阵勾选。
  - 视图级与按钮级权限守卫拦截（`useAuth` / `hasPermission` 动态钩子）。
- **🔑 2FA 双因子安全认证与凭据管理 (`/security-2fa`)**：
  - **Passkey 通行密钥**：基于 WebAuthn 标准支持 Touch ID、Face ID、物理安全密钥与设备 PIN 凭据绑定。
  - **TOTP 基于时间的一次性口令**：支持 Google Authenticator / 微软验证器等主流 App 扫码绑定，提供 Base32 密钥与 10 组应急备用恢复码。
- **🚫 认证安全策略与 IP 封禁防护 (`/auth-security`)**：
  - 防暴力破解自动化拦截（支持失败尝试次数阈值、时间窗口与封禁时长自定义）。
  - 实时被禁 IP 黑名单管理（支持手动添加封禁、一键解除封禁与批量清空）。
- **🏢 组织机构树多层级架构 (`/org`)**：
  - 支持集团总部、区域中心、事业部及研发小组多层级树状建模。
  - 支持部门负责人变更、状态启停、下属成员跨部门划拨与检索。
- **📊 商业智能 BI 与大屏看板 (`/analytics`)**：
  - 内置 Recharts 驱动的多维转化漏斗图、增长趋势折线图、全国业务分布及数据导出。
- **⚡ 智能导航与交互体验**：
  - 全局快捷命令面板（`Cmd + K` 或 `Ctrl + K`），支持快速页面直达与全局搜索。
  - 侧边栏折叠浮层精准交互、面包屑多级联动、全站通知消息中心与操作审计日志。
- **🧩 丰富开箱即用业务模板**：
  - **分步表单 (`/step-form`)**：带预检与表单校验的沉浸式 Step Form。
  - **高级资源列表 (`/resource-list`)**：分类 Tabs、卡片/表格双重视图切换、多条件组合筛选。
  - **结果状态页 (`/result-status`)**：成功、失败、处理中及 403 权限受限优雅回退页。
- **🎨 现代优雅视觉与主题**：
  - 极致深色模式（Dark Mode）与高对比度浅色模式无缝平滑切换。

---

## 👤 演示账号说明

系统内置了各部门角色的演示账户（演示邮箱均归属于 `@sang.cool`），登录时**仅需输入纯用户名**即可快速登录，或在登录页面点击快捷按钮一秒填入：

| 角色身份 | 用户名 | 演示邮箱 | 默认权限说明 |
| :--- | :--- | :--- | :--- |
| **超级管理员** | `admin` | `admin@sang.cool` | 拥有系统全量模块与最高管理权限 |
| **系统运维官** | `lin.yu` | `lin.yu@sang.cool` | 拥有系统运维、2FA安全、IP封禁与审计日志权限 |
| **数据分析师** | `chen.ming` | `chen.ming@sang.cool` | 拥有 BI 数据看板、资源分析与报表导出权限 |
| **运营编辑官** | `zhang.wei` | `zhang.wei@sang.cool` | 拥有用户查看、组织架构与内容资源编辑权限 |
| **访客体验账号** | `guest` | `guest@sang.cool` | 基础只读权限，演示 403 权限拦截与受限状态 |

---

## 📁 目录结构规范

```text
sang-admin/
├── public/                 # 静态资源文件
├── src/
│   ├── components/         # 业务与通用 UI 组件库
│   │   ├── business/       # 业务领域组件
│   │   │   ├── notifications/ # 消息通知中心组件
│   │   │   ├── resource-list/ # 资源列表组件
│   │   │   ├── result-status/ # 结果状态页组件
│   │   │   ├── security/      # 2FA 与 Passkey/TOTP 凭据管理组件
│   │   │   └── step-form/     # 分步表单业务组件
│   │   ├── common/         # 通用基础组件 (CommandPalette, CustomSelect 等)
│   │   ├── layout/         # 页面框架组件 (Header, Sidebar, MainLayout 等)
│   │   └── index.ts        # 组件统一导出入口
│   │
│   ├── context/            # 全局 React Context 状态管理
│   │   ├── AuthContext.tsx       # 当前用户登录、认证与会话状态
│   │   ├── PermissionContext.tsx # RBAC 角色与用户权限状态
│   │   ├── ThemeContext.tsx      # 浅色 / 深色主题状态
│   │   ├── ModalContext.tsx      # 全局弹窗与通知 Toast
│   │   └── index.ts              # 状态上下文统一导出
│   │
│   ├── data/               # 模拟 Mock 数据与导航路由配置
│   │   ├── mockData.ts     # Mock 初始角色、权限列表、用户及组织树
│   │   └── navigation.ts   # 侧边栏菜单分组、路由与权限映射配置
│   │
│   ├── types/              # TypeScript 类型定义
│   │   └── index.ts        # 全局 User, Role, OrgNode, Permission 等接口
│   │
│   ├── utils/              # 通用工具函数库
│   │   └── index.ts        # 树节点递归、日期格式化、导出工具
│   │
│   ├── views/              # 页面级视图组件 (Pages)
│   │   ├── AccessDeniedView.tsx   # 403 权限受限回退视图
│   │   ├── AnalyticsView.tsx      # BI 数据分析看板
│   │   ├── AuditLogView.tsx       # 操作审计日志
│   │   ├── AuthSecurityView.tsx   # 认证防护与 IP 封禁管理
│   │   ├── DashboardView.tsx      # 工作台概览
│   │   ├── LoginPage.tsx          # 登录页与演示账号快速通道
│   │   ├── NotificationsView.tsx  # 消息通知中心
│   │   ├── OrgManagementView.tsx  # 组织机构树多层级管理
│   │   ├── PermissionMatrixView.tsx # 权限分配矩阵
│   │   ├── ProfileView.tsx        # 个人中心
│   │   ├── ResourceListView.tsx   # 高级资源列表
│   │   ├── ResultStatusView.tsx   # 结果状态展示页
│   │   ├── RoleManagementView.tsx # 角色管理
│   │   ├── StepFormView.tsx       # 分步表单业务视图
│   │   ├── SystemSettingsView.tsx # 核心系统策略与集群监控
│   │   ├── TwoFactorAuthView.tsx  # 2FA 双因子安全与凭据设置
│   │   ├── UserManagementView.tsx # 用户管理
│   │   └── index.ts               # 视图统一导出入口
│   │
│   ├── App.tsx             # 根入口与登录拦截分发
│   ├── main.tsx            # Vite 挂载入口
│   └── index.css           # Tailwind CSS 与全局样式
│
├── .env.example            # 环境变量示例
├── metadata.json           # 应用元数据及权限声明
├── package.json            # 依赖包管理与构建脚本
├── tsconfig.json           # TypeScript 配置文件
└── vite.config.ts          # Vite 构建与服务配置
```

---

## 🛠️ 快速开始

### 1. 安装依赖

```bash
npm install
# 或使用 pnpm / bun
pnpm install
```

### 2. 启动本地开发服务

```bash
npm run dev
```

服务将启动并运行于 `http://localhost:3000`。

### 3. 构建生产包与类型检查

```bash
# 类型检查
npm run lint

# 构建生产产物
npm run build
```

打包产物将输出至 `dist/` 目录。

---

## 🔐 核心模块二次开发指南

### 1. 新增一个菜单页面

1. 在 `src/views/` 目录下新建视图文件，例如 `src/views/SupplierView.tsx`。
2. 在 `src/views/index.ts` 中导出新视图。
3. 在 `src/data/navigation.ts` 的 `NAV_ITEMS` 数组中添加对应的菜单项配置：

```typescript
{
  id: 'supplier',
  title: '供应商管理',
  icon: 'Truck', // 对应 Lucide 图标名称
  path: '/supplier',
  permission: 'supplier:view' // 绑定的 RBAC 权限标识
}
```

4. 在 `src/components/layout/MainLayout.tsx` 的 `renderActiveView` 逻辑中加入路径分支：

```tsx
case '/supplier':
  return <SupplierView onNavigate={handleNavigate} />;
```

### 2. RBAC 按钮级权限校验

在任意组件中导入 `useAuth` 钩子即可进行动态权限校验：

```tsx
import { useAuth } from '../context/AuthContext';

export const MyComponent = () => {
  const { hasPermission } = useAuth();

  return (
    <div>
      {hasPermission('user:create') && (
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl">
          新增用户
        </button>
      )}
    </div>
  );
};
```

---

## 🎨 编写与样式规范

1. **原子化 CSS**：遵循 Tailwind CSS 工具类规范，不额外引入外部 CSS 文件。
2. **暗色模式兼容**：所有 Background 与 Text 颜色均配置 `dark:` 响应前缀（例如：`bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100`）。
3. **图标统一**：全部使用 `lucide-react` 图标库，确保全站风格高度一致。