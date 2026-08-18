import { AuthUser, AdminWhitelistEntry } from '../types';

const AUTH_USER_KEY = 'geartrade_auth_user';
const ADMIN_WHITELIST_KEY = 'geartrade_admin_whitelist';
const GOOGLE_CLIENT_ID_KEY = 'geartrade_google_client_id';

export function getGoogleClientId(): string {
  try {
    const saved = localStorage.getItem(GOOGLE_CLIENT_ID_KEY);
    if (
      saved &&
      typeof saved === 'string' &&
      saved.trim().length > 8 &&
      saved.trim() !== 'undefined' &&
      saved.trim() !== 'null' &&
      !saved.includes('MY_') &&
      !saved.includes('YOUR_')
    ) {
      return saved.trim();
    }
    const envId = (import.meta as any)?.env?.VITE_GOOGLE_CLIENT_ID;
    if (
      envId &&
      typeof envId === 'string' &&
      envId.trim().length > 8 &&
      envId.trim() !== 'undefined' &&
      envId.trim() !== 'null' &&
      !envId.includes('MY_') &&
      !envId.includes('YOUR_')
    ) {
      return envId.trim();
    }
    return '';
  } catch {
    return '';
  }
}

export function saveGoogleClientId(clientId: string): void {
  try {
    if (clientId.trim()) {
      localStorage.setItem(GOOGLE_CLIENT_ID_KEY, clientId.trim());
    } else {
      localStorage.removeItem(GOOGLE_CLIENT_ID_KEY);
    }
  } catch (e) {
    console.error('Failed to save Google Client ID', e);
  }
}

// Master admin pre-configured with user's email from environment context
export const DEFAULT_ADMIN_WHITELIST: AdminWhitelistEntry[] = [
  {
    email: '080bas004.abhishek@pcampus.edu.np',
    addedBy: 'System Root',
    addedAt: '2025-01-01',
    note: 'Master Store Administrator & Engineering Lead',
    isMaster: true,
  },
  {
    email: 'admin@geartrade.com.np',
    addedBy: 'System Root',
    addedAt: '2025-01-01',
    note: 'GEARTRADE Nepal Flagship Operations',
    isMaster: false,
  },
  {
    email: 'gearhead@geartrade.com.np',
    addedBy: 'System Root',
    addedAt: '2025-01-01',
    note: 'Merchandising & Logistics Coordinator',
    isMaster: false,
  },
];

export function getAdminWhitelist(): AdminWhitelistEntry[] {
  try {
    const raw = localStorage.getItem(ADMIN_WHITELIST_KEY);
    if (!raw) {
      localStorage.setItem(ADMIN_WHITELIST_KEY, JSON.stringify(DEFAULT_ADMIN_WHITELIST));
      return DEFAULT_ADMIN_WHITELIST;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure master admin is always present
      const hasMaster = parsed.some(
        (e: AdminWhitelistEntry) => e.email.toLowerCase() === '080bas004.abhishek@pcampus.edu.np'
      );
      if (!hasMaster) {
        const merged = [DEFAULT_ADMIN_WHITELIST[0], ...parsed];
        localStorage.setItem(ADMIN_WHITELIST_KEY, JSON.stringify(merged));
        return merged;
      }
      return parsed;
    }
    return DEFAULT_ADMIN_WHITELIST;
  } catch (e) {
    console.error('Failed to parse admin whitelist', e);
    return DEFAULT_ADMIN_WHITELIST;
  }
}

export function saveAdminWhitelist(entries: AdminWhitelistEntry[]): void {
  try {
    localStorage.setItem(ADMIN_WHITELIST_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error('Failed to save admin whitelist', e);
  }
}

export function isEmailAdmin(email?: string | null): boolean {
  if (!email) return false;
  const list = getAdminWhitelist();
  const normalized = email.trim().toLowerCase();
  return list.some((entry) => entry.email.trim().toLowerCase() === normalized);
}

export function addAdminEmail(
  email: string,
  addedBy: string = 'Admin',
  note: string = 'Authorized Store Admin'
): { success: boolean; message: string; list: AdminWhitelistEntry[] } {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !normalized.includes('@') || !normalized.includes('.')) {
    return { success: false, message: 'Please enter a valid email address.', list: getAdminWhitelist() };
  }

  const current = getAdminWhitelist();
  if (current.some((e) => e.email.toLowerCase() === normalized)) {
    return { success: false, message: 'This email is already on the authorized admin list.', list: current };
  }

  const newEntry: AdminWhitelistEntry = {
    email: normalized,
    addedBy,
    addedAt: new Date().toISOString().split('T')[0],
    note,
    isMaster: false,
  };

  const updated = [newEntry, ...current];
  saveAdminWhitelist(updated);
  return { success: true, message: `Successfully authorized ${normalized} as an Admin.`, list: updated };
}

export function removeAdminEmail(
  email: string
): { success: boolean; message: string; list: AdminWhitelistEntry[] } {
  const normalized = email.trim().toLowerCase();
  const current = getAdminWhitelist();

  const target = current.find((e) => e.email.toLowerCase() === normalized);
  if (!target) {
    return { success: false, message: 'Email not found in whitelist.', list: current };
  }

  if (target.isMaster || normalized === '080bas004.abhishek@pcampus.edu.np') {
    return { success: false, message: 'Master Administrator email cannot be removed.', list: current };
  }

  if (current.length <= 1) {
    return { success: false, message: 'Cannot remove the last remaining admin.', list: current };
  }

  const updated = current.filter((e) => e.email.toLowerCase() !== normalized);
  saveAdminWhitelist(updated);
  return { success: true, message: `Removed ${normalized} from admin permissions.`, list: updated };
}

export function getCurrentUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw) as AuthUser;
    // Re-verify admin privilege dynamically against latest whitelist
    const isAdmin = isEmailAdmin(user.email);
    return {
      ...user,
      isAdmin,
      role: isAdmin ? 'admin' : 'customer',
    };
  } catch (e) {
    console.error('Failed to parse current user', e);
    return null;
  }
}

export function saveCurrentUser(user: AuthUser | null): void {
  try {
    if (!user) {
      localStorage.removeItem(AUTH_USER_KEY);
    } else {
      const isAdmin = isEmailAdmin(user.email);
      const enrichedUser: AuthUser = {
        ...user,
        isAdmin,
        role: isAdmin ? 'admin' : 'customer',
      };
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(enrichedUser));
    }
  } catch (e) {
    console.error('Failed to save current user', e);
  }
}

export const saveUserSession = saveCurrentUser;

export function clearUserSession(): void {
  saveCurrentUser(null);
}

/**
 * Safely parse a Google ID Token (JWT) on client-side
 */
export function decodeGoogleJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode Google JWT token', error);
    return null;
  }
}

export function createGoogleUserFromPayload(payload: any): AuthUser {
  const email = (payload.email || '').toLowerCase();
  const isAdmin = isEmailAdmin(email);
  return {
    id: payload.sub || `google_${Date.now()}`,
    email,
    name: payload.name || payload.given_name || email.split('@')[0],
    givenName: payload.given_name || '',
    familyName: payload.family_name || '',
    picture: payload.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(payload.name || email)}`,
    isAdmin,
    role: isAdmin ? 'admin' : 'customer',
    loginProvider: 'google',
    lastLoginAt: new Date().toISOString(),
  };
}

export function createDemoUser(email: string, name: string, pictureUrl?: string): AuthUser {
  const normalizedEmail = email.trim().toLowerCase();
  const isAdmin = isEmailAdmin(normalizedEmail);
  return {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: normalizedEmail,
    name,
    picture:
      pictureUrl ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || normalizedEmail)}`,
    isAdmin,
    role: isAdmin ? 'admin' : 'customer',
    loginProvider: 'google',
    lastLoginAt: new Date().toISOString(),
  };
}
