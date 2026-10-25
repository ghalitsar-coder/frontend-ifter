/**
 * RBAC capability gate for the Attendly UI.
 *
 * Mirrors docs/API_ADDENDUM.md §1–§2 (6 roles: admin, staff_tu, teacher,
 * duty_teacher, principal, student; capability groups per RouteGroups).
 * Menu items and write surfaces check `can(roles, capability)` client-side;
 * the server always enforces the same groups independently, so this file is
 * presentation-only and deliberately permissive-neutral (hide, never fake).
 *
 * NOTE on role typing: the `UserRole` union in `@/lib/api/dto` predates the
 * 6-role re-cut (it lacks `staff_tu` and `student`) and dto.ts is a shared
 * file, so every check here compares plain strings. The authoritative role
 * list is the `roles` table — admins can read it dynamically via GET /roles
 * (`useRolesCatalog` below).
 */
import { queryOptions, useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api/client';
import type { DataList } from '@/lib/api/dto';

// ---------------------------------------------------------------------------
// Role codes (docs/API_ADDENDUM.md §1)
// ---------------------------------------------------------------------------
export const ROLE_ADMIN = 'admin';
export const ROLE_STAFF_TU = 'staff_tu';
export const ROLE_TEACHER = 'teacher';
export const ROLE_DUTY_TEACHER = 'duty_teacher';
export const ROLE_PRINCIPAL = 'principal';
export const ROLE_STUDENT = 'student';

/** Any role code the backend may return; kept as `string` on purpose (dto.ts is frozen). */
export type RoleCode = string;

// ---------------------------------------------------------------------------
// Capabilities (one per RouteGroups capability of the addendum, §2, plus the
// UI-only 'dashboard' entry which excludes staff_tu per the menu spec even
// though the backend ReportsRead group lets staff_tu call GET /dashboard).
// ---------------------------------------------------------------------------
export type Capability =
  /** Admin: user mgmt, settings/holiday writes, tatib + sanction-rule writes, audit. */
  | 'admin'
  /** Master data CRUD: students/teachers/classes/academic-years/terms/assignments. */
  | 'master_data'
  /** Attendance recording: roster/bulk/close/corrections, teacher presence, duty swaps, verify. */
  | 'attendance_ops'
  /** Attendance history/summary/settings read (principal included). */
  | 'attendance_read'
  /** Discipline record + follow-up writes. */
  | 'discipline_ops'
  /** Discipline categories/records read (principal included). */
  | 'discipline_read'
  /** Dashboard, reports and exports read. */
  | 'reports_read'
  /** Excel import jobs + master exports. */
  | 'imports'
  /** Dispensation list/detail read (all staff roles). */
  | 'dispensations_read'
  /** Student self-service `/my/*` portal. */
  | 'my'
  /** Any signed-in role. */
  | 'authenticated'
  /** UI menu: staff dashboard landing (admin + teacher + duty_teacher + principal). */
  | 'dashboard'
  /** UI menu: pengaturan page (admin in full; staff_tu only the master-data part). */
  | 'settings';

const CAPABILITY_ROLES: Record<Capability, readonly RoleCode[]> = {
  admin: [ROLE_ADMIN],
  master_data: [ROLE_ADMIN, ROLE_STAFF_TU],
  attendance_ops: [ROLE_ADMIN, ROLE_TEACHER, ROLE_DUTY_TEACHER],
  attendance_read: [ROLE_ADMIN, ROLE_TEACHER, ROLE_DUTY_TEACHER, ROLE_PRINCIPAL],
  discipline_ops: [ROLE_ADMIN, ROLE_TEACHER, ROLE_DUTY_TEACHER],
  discipline_read: [ROLE_ADMIN, ROLE_TEACHER, ROLE_DUTY_TEACHER, ROLE_PRINCIPAL],
  reports_read: [ROLE_ADMIN, ROLE_STAFF_TU, ROLE_TEACHER, ROLE_DUTY_TEACHER, ROLE_PRINCIPAL],
  imports: [ROLE_ADMIN, ROLE_STAFF_TU],
  dispensations_read: [ROLE_ADMIN, ROLE_STAFF_TU, ROLE_TEACHER, ROLE_DUTY_TEACHER, ROLE_PRINCIPAL],
  my: [ROLE_STUDENT],
  authenticated: [
    ROLE_ADMIN,
    ROLE_STAFF_TU,
    ROLE_TEACHER,
    ROLE_DUTY_TEACHER,
    ROLE_PRINCIPAL,
    ROLE_STUDENT,
  ],
  // Menu spec: staff_tu reaches GET /dashboard on the backend but the TU
  // sidebar shows only master data, imports, rekap and pengaturan.
  dashboard: [ROLE_ADMIN, ROLE_TEACHER, ROLE_DUTY_TEACHER, ROLE_PRINCIPAL],
  // staff_tu gets the menu entry for its master-data part only; the
  // attendance-settings reads/writes on that page stay 'admin'/'attendance_read'.
  settings: [ROLE_ADMIN, ROLE_STAFF_TU],
};

/**
 * Whether any of the given roles grants the capability.
 * @param roles - Role codes of the signed-in user (`useAuth().roles`).
 * @param capability - Capability to test.
 * @returns True when the UI surface may be shown.
 */
export const can = (roles: readonly RoleCode[], capability: Capability): boolean =>
  roles.some((role) => CAPABILITY_ROLES[capability].includes(role));

/**
 * True when the account only carries the `student` role — such users are
 * redirected to the `/dashboard/murid` portal and get no staff navigation.
 * @param roles - Role codes of the signed-in user.
 * @returns Whether the roles are exactly student-only (non-empty).
 */
export const isStudentOnly = (roles: readonly RoleCode[]): boolean =>
  roles.length > 0 && roles.every((role) => role === ROLE_STUDENT);

// ---------------------------------------------------------------------------
// Dynamic role catalog — GET /roles (Admin-only per router.go, so the query
// stays disabled for other roles; never assume new codes exist client-side).
// ---------------------------------------------------------------------------
/** One row of the `roles` table (GET /roles → `{ data: [...] }`). */
export type RoleCatalogEntry = {
  code: string;
  name: string;
  description?: string;
};

export const roleCatalogKeys = {
  all: ['roles'] as const,
};

export const roleCatalogOptions = (isAdmin: boolean) =>
  queryOptions({
    queryKey: roleCatalogKeys.all,
    queryFn: async () => {
      const result = await apiGet<DataList<RoleCatalogEntry>>('/roles');
      return result.data;
    },
    enabled: isAdmin,
  });

/**
 * GET /roles → full role catalog. Admin only (the endpoint answers 403 for
 * other roles), so pass the signed-in roles and the query self-disables.
 * @param roles - Role codes of the signed-in user (`useAuth().roles`).
 * @returns React Query result with `RoleCatalogEntry[]`.
 */
export const useRolesCatalog = (roles: readonly RoleCode[]) =>
  useQuery(roleCatalogOptions(roles.includes(ROLE_ADMIN)));
