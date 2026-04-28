import { CookieService } from '../cookie-storage';
import { CONFIGURATION } from '../constants';
import { LocalStorageService } from '../local-storage';
import { decodePayload } from './decode-jwt.util';

const ADMIN_ROLES = new Set(['ADMIN', 'admin', 'realm-admin']);
const ADMIN_ROLE_KEYS = new Set(['ROOT', 'ADMIN', 'SUPER_ADMIN']);

export function hasAdminRoleFromToken(): boolean {
  const token =
    CookieService.getItem(CONFIGURATION.ACCESS_TOKEN_LS_KEY) ||
    LocalStorageService.getItem(CONFIGURATION.ACCESS_TOKEN_LS_KEY);

  if (!token) return false;

  const payload = decodePayload(token);

  // local JWT: check user_type (2 = ADMIN) or role_key
  if (payload.user_type === 2) return true;
  if (payload.role_key && ADMIN_ROLE_KEYS.has(String(payload.role_key))) return true;
  if (payload.scope_type === 'GLOBAL') return true;

  // legacy Keycloak JWT
  const roles = new Set<string>();
  payload.realm_access?.roles?.forEach((role) => roles.add(role));
  Object.values(payload.resource_access ?? {}).forEach((entry) => {
    entry?.roles?.forEach((role) => roles.add(role));
  });

  return Array.from(roles).some((role) => ADMIN_ROLES.has(role));
}
