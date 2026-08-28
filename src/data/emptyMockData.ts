import type { ActivityLog, OrgNode, PermissionNode, Role, SystemNotification, User } from '../types';

export const ALL_PERMISSIONS: PermissionNode[] = [];
export const DEFAULT_ROLES: Role[] = [];
export const DEFAULT_USERS: User[] = [];
export const MOCK_NOTIFICATIONS: SystemNotification[] = [];
export const MOCK_ACTIVITY_LOGS: ActivityLog[] = [];
export const CHART_DATA_TREND: { time: string; pv: number; uv: number; revenue: number; conversion: number }[] = [];
export const CHART_DATA_REGIONS: { name: string; users: number; orderRate: number; revenue: number }[] = [];
export const CHART_DATA_DEVICES: { name: string; value: number; color: string }[] = [];
export const CHART_DATA_RADAR: { category: string; current: number; benchmark: number }[] = [];
export const DEFAULT_ORG_TREE: OrgNode[] = [];
