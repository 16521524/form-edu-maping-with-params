import type { IUserProfile } from '../models/user-profile.model';
import type { ScopeType } from '../api/admin/admin-rbac.api';

const ASSIGNABLE_ROLE_LEVEL_BY_ROLE_KEY: Record<string, number> = {
  ROOT: Number.POSITIVE_INFINITY,
  UNIVERSITY_ADMIN: 80,
  DEAN: 60,
  DEPARTMENT_HEAD: 50,
  ROLE_MANAGER: 50,
};

/** user_type: 2 = ADMIN, 1 = USER */
export const USER_TYPE = {
  ADMIN: 2,
  USER: 1,
} as const;

export function isAdmin(profile: IUserProfile | null): boolean {
  return profile?.user_type === USER_TYPE.ADMIN;
}

export function isUser(profile: IUserProfile | null): boolean {
  return profile?.user_type === USER_TYPE.USER;
}

export function hasPermission(profile: IUserProfile | null, permission: string): boolean {
  return isAdmin(profile) || (profile?.permission_codes ?? []).includes(permission);
}

export function hasAnyPermission(profile: IUserProfile | null, permissions: string[]): boolean {
  return permissions.some((permission) => hasPermission(profile, permission));
}

export function hasAllPermissions(profile: IUserProfile | null, permissions: string[]): boolean {
  return permissions.every((permission) => hasPermission(profile, permission));
}

export function isRootProfile(profile: IUserProfile | null): boolean {
  return Boolean(profile?.scope_assignments?.some((assignment) => assignment.role.role_key === 'ROOT'));
}

export function isCurrentProfileUser(
  profile: IUserProfile | null,
  target?: {
    id?: string | null;
    username?: string | null;
    email?: string | null;
  } | null,
): boolean {
  if (!profile || !target) {
    return false;
  }

  return profile.id === target.id || profile.username === target.username || profile.email === target.email;
}

export function getMaxAssignableRoleLevel(profile: IUserProfile | null): number | null {
  if (isAdmin(profile) || isRootProfile(profile)) {
    return Number.POSITIVE_INFINITY;
  }

  const levels =
    profile?.scope_assignments
      ?.filter((assignment) => (assignment.permission_codes ?? []).includes('user.assign_role'))
      .map((assignment) =>
        resolveAssignableRoleLevel(assignment.role.role_key, assignment.conditions_json?.canAssignRolesBelowLevel),
      )
      .filter((level) => Number.isFinite(level)) ?? [];

  return levels.length ? Math.max(...levels) : null;
}

export function canGrantScopeTypeFromBaseScope(baseScopeType: ScopeType, requestedScopeType: ScopeType): boolean {
  switch (baseScopeType) {
    case 'GLOBAL':
      return true;
    case 'TENANT':
      return requestedScopeType !== 'GLOBAL';
    case 'ORG_UNIT_TREE':
      return ['ORG_UNIT_TREE', 'ORG_UNIT', 'ASSIGNED', 'OWN', 'PUBLIC'].includes(requestedScopeType);
    case 'ORG_UNIT':
      return ['ORG_UNIT', 'ASSIGNED', 'OWN', 'PUBLIC'].includes(requestedScopeType);
    case 'ASSIGNED':
      return ['ASSIGNED', 'OWN', 'PUBLIC'].includes(requestedScopeType);
    case 'OWN':
      return requestedScopeType === 'OWN';
    case 'PUBLIC':
      return requestedScopeType === 'PUBLIC';
    default:
      return false;
  }
}

export function canAssignScopeType(profile: IUserProfile | null, requestedScopeType: ScopeType): boolean {
  if (isAdmin(profile) || isRootProfile(profile)) {
    return true;
  }

  return Boolean(
    profile?.scope_assignments?.some(
      (assignment) =>
        (assignment.permission_codes ?? []).includes('user.assign_role') &&
        canGrantScopeTypeFromBaseScope(assignment.scope_type, requestedScopeType),
    ),
  );
}

/**
 * Check if user can create/edit templates and approve documents.
 * Only ADMIN role has this permission.
 */
export function canManageTemplates(profile: IUserProfile | null): boolean {
  return hasPermission(profile, 'template.update');
}

/**
 * Check if user can approve/reject submitted documents.
 */
export function canApproveDocuments(profile: IUserProfile | null): boolean {
  return hasPermission(profile, 'document.approve');
}

/**
 * Check if user can assign other users or manage accounts.
 */
export function canManageUsers(profile: IUserProfile | null): boolean {
  return hasAnyPermission(profile, [
    'user.view',
    'user.create',
    'user.update',
    'user.delete',
    'user.disable',
    'user.assign_role',
    'user.revoke_role',
  ]);
}

function resolveAssignableRoleLevel(roleKey?: string | null, configuredLevel?: unknown): number {
  const explicitLevel = Number(configuredLevel);
  if (Number.isFinite(explicitLevel)) {
    return explicitLevel;
  }

  if (!roleKey) {
    return Number.NEGATIVE_INFINITY;
  }

  return ASSIGNABLE_ROLE_LEVEL_BY_ROLE_KEY[roleKey.toUpperCase()] ?? Number.NEGATIVE_INFINITY;
}
