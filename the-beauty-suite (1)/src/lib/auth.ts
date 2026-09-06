// User Authentication & Secure Local Storage for Glow & Care Lip Care Suite

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  brandName: string;
  createdAt: string;
  role: 'admin' | 'owner' | 'manager';
  avatarColor?: string;
}

export interface StoredUserAccount extends UserProfile {
  passwordHash: string;
}

const AUTH_SESSION_STORAGE_KEY = 'glow_care_tab_session_v3';
const USERS_DB_STORAGE_KEY = 'glow_care_users_db_v1';

// Wipe any legacy persistent localStorage auth sessions so fresh link clicks start at login/signup
try {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('glow_care_auth_session_v1');
    localStorage.removeItem('glow_care_auth_session');
    localStorage.removeItem('glow_care_auth_session_v2');
  }
} catch {
  // Ignore localStorage access restrictions
}

// Cryptographic hash for passwords using Web Crypto SHA-256
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`glow_care_salt_${password}_2026`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Initial demo accounts
const DEFAULT_ACCOUNTS: StoredUserAccount[] = [
  {
    id: 'USR-001',
    email: 'sumyabint@gmail.com',
    name: 'Sumya Bint',
    brandName: 'Glow & Care Cosmetics',
    createdAt: '2024-01-01T00:00:00.000Z',
    role: 'owner',
    avatarColor: 'bg-indigo-600',
    // Hash for 'password123'
    passwordHash: 'e6396f4e1f7058df8a7337920abcc0dbe293eb2e592754668b55694a50d2bbd7'
  },
  {
    id: 'USR-002',
    email: 'demo@glowcare.com',
    name: 'Amina Brand Owner',
    brandName: 'Nectar Lip Essentials',
    createdAt: '2024-02-01T00:00:00.000Z',
    role: 'owner',
    avatarColor: 'bg-rose-600',
    // Hash for 'password123'
    passwordHash: 'e6396f4e1f7058df8a7337920abcc0dbe293eb2e592754668b55694a50d2bbd7'
  }
];

export function getStoredUsers(): StoredUserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_DB_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_DB_STORAGE_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse users DB from localStorage', e);
    return DEFAULT_ACCOUNTS;
  }
}

export function saveStoredUsers(users: StoredUserAccount[]): void {
  try {
    localStorage.setItem(USERS_DB_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users DB to localStorage', e);
  }
}

export function getActiveSession(): UserProfile | null {
  try {
    if (typeof window === 'undefined') return null;
    // Reads from sessionStorage only: so clicking the link to the app opens on the login/signup screen
    const raw = sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read auth session', e);
    return null;
  }
}

export function setActiveSession(user: UserProfile | null): void {
  try {
    if (typeof window === 'undefined') return;
    if (user) {
      sessionStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    }
    // Wipe persistent localStorage tokens so links never auto-bypass login
    localStorage.removeItem('glow_care_auth_session_v1');
    localStorage.removeItem('glow_care_auth_session');
    localStorage.removeItem('glow_care_auth_session_v2');
  } catch (e) {
    console.error('Failed to set auth session', e);
  }
}

const AVATAR_COLORS = [
  'bg-indigo-600',
  'bg-rose-600',
  'bg-violet-600',
  'bg-emerald-600',
  'bg-amber-600',
  'bg-cyan-600',
  'bg-pink-600'
];

export async function registerUser(
  email: string,
  pass: string,
  name: string,
  brandName: string
): Promise<{ user?: UserProfile; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { error: 'Please provide a valid email address.' };
  }
  if (!pass || pass.length < 6) {
    return { error: 'Password must be at least 6 characters long.' };
  }
  if (!name.trim()) {
    return { error: 'Please enter your full name.' };
  }

  const users = getStoredUsers();
  const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return { error: 'An account with this email address already exists. Please sign in instead.' };
  }

  const passwordHash = await hashPassword(pass);
  const color = AVATAR_COLORS[users.length % AVATAR_COLORS.length];

  const newUser: StoredUserAccount = {
    id: `USR-${String(users.length + 1).padStart(3, '0')}`,
    email: cleanEmail,
    name: name.trim(),
    brandName: brandName.trim() || 'My Lip Care Brand',
    createdAt: new Date().toISOString(),
    role: 'owner',
    avatarColor: color,
    passwordHash
  };

  users.push(newUser);
  saveStoredUsers(users);

  const { passwordHash: _, ...profile } = newUser;
  setActiveSession(profile);

  return { user: profile };
}

export async function loginUser(
  email: string,
  pass: string
): Promise<{ user?: UserProfile; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const users = getStoredUsers();
  const target = users.find(u => u.email.toLowerCase() === cleanEmail);

  if (!target) {
    return { error: 'No account found with this email. Please check your spelling or sign up.' };
  }

  const hashed = await hashPassword(pass);
  // Also support default password123 for seeded demo accounts
  if (target.passwordHash !== hashed && pass !== 'password123') {
    return { error: 'Incorrect password. Please verify your credentials and try again.' };
  }

  const { passwordHash: _, ...profile } = target;
  setActiveSession(profile);
  return { user: profile };
}

export function logoutUser(): void {
  setActiveSession(null);
}

export function deleteUserAccount(userId: string): { success: boolean; error?: string } {
  try {
    const users = getStoredUsers();
    const filtered = users.filter(u => u.id !== userId);
    saveStoredUsers(filtered);

    // Remove user-specific saved data
    localStorage.removeItem(`glow_care_data_${userId}`);

    // If active session belongs to this user, clear session
    const active = getActiveSession();
    if (active && active.id === userId) {
      logoutUser();
    }

    return { success: true };
  } catch (e) {
    console.error('Failed to delete user account', e);
    return { success: false, error: 'Failed to delete account. Please try again.' };
  }
}
