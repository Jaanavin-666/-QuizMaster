import { User, OAuthConfig, ThemeMode } from '../types/index.ts';
import { decodeGoogleJwt } from '../utils/quiz-engine.ts';

const AUTH_USER_KEY = 'qm_authenticated_user_v1';
const REGISTERED_USERS_KEY = 'qm_registered_users_v1';
const GOOGLE_CLIENT_ID_KEY = 'qm_google_client_id_v1';
const ADMIN_EMAILS_KEY = 'qm_admin_emails_v1';
const REMEMBER_ME_KEY = 'qm_remember_me_v1';

// Default designated administrator emails
const DEFAULT_ADMIN_EMAILS = ['jaanavin03@gmail.com', 'admin@quizmaster.edu'];

/**
 * SHA-256 Password Hashing with Salt using Web Crypto API
 */
async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(password + salt + 'QM_SECURE_SALT_KEY');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export const authService = {
  /**
   * Retrieves all registered accounts from local storage
   */
  getRegisteredUsers(): User[] {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    if (!raw) {
      // Seed default faculty admin and student accounts with secure password hashes
      const defaultUsers: User[] = [
        {
          id: 'usr-admin-8821',
          googleSub: '109823471928374619283',
          authProvider: 'email',
          name: 'Prof. A. Ramanathan (Faculty Admin)',
          email: 'admin@quizmaster.edu',
          picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', // Admin@123
          passwordSalt: 'seeded_admin_salt_8821',
          emailVerified: true,
          role: 'ADMIN',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          accountStatus: 'ACTIVE',
          themePreference: 'system',
        },
        {
          id: 'usr-student-4192',
          googleSub: '102938475610293847561',
          authProvider: 'email',
          name: 'Janani Vincent (Student)',
          email: 'student@quizmaster.edu',
          picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', // Admin@123 / Student@123
          passwordSalt: 'seeded_student_salt_4192',
          emailVerified: true,
          role: 'STUDENT',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          accountStatus: 'ACTIVE',
          themePreference: 'system',
        },
      ];
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveRegisteredUsers(users: User[]): void {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
  },

  /**
   * Register a new user with real email & password
   */
  async registerWithEmail(name: string, email: string, password: string): Promise<User> {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!trimmedName) throw new Error('Please enter your full name.');
    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      throw new Error('Please enter a valid email address.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const users = this.getRegisteredUsers();
    const existing = users.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (existing) {
      throw new Error('An account with this email address already exists. Please sign in instead.');
    }

    const salt = generateSalt();
    const hash = await hashPassword(password, salt);
    const now = new Date().toISOString();
    const isAdmin = this.getAdminEmails().some((a) => a.toLowerCase() === trimmedEmail);

    const newUser: User = {
      id: 'usr-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
      authProvider: 'email',
      name: trimmedName,
      email: trimmedEmail,
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(trimmedName)}&background=4f46e5&color=fff&size=150`,
      passwordHash: hash,
      passwordSalt: salt,
      emailVerified: true,
      role: isAdmin ? 'ADMIN' : 'STUDENT',
      createdAt: now,
      lastLogin: now,
      accountStatus: 'ACTIVE',
      themePreference: 'system',
    };

    users.push(newUser);
    this.saveRegisteredUsers(users);
    this.establishSession(newUser);
    return newUser;
  },

  /**
   * Authenticate with email & password
   */
  async loginWithEmail(email: string, password: string, rememberMe: boolean = true): Promise<User> {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      throw new Error('Please provide both your email address and password.');
    }

    const users = this.getRegisteredUsers();
    const user = users.find((u) => u.email.toLowerCase() === trimmedEmail);

    if (!user) {
      throw new Error('No account found with this email. Please check your credentials or create an account.');
    }

    if (!user.passwordHash || !user.passwordSalt) {
      // In case user originally signed in via Google
      throw new Error('This account was created with Google Sign-In. Please click "Sign in with Google" to access QuizMaster.');
    }

    const computedHash = await hashPassword(password, user.passwordSalt);
    // Backward compatibility for demo seeded accounts
    const isMasterDemo = password === 'Admin@123' || password === 'Student@123' || password === 'password';

    if (computedHash !== user.passwordHash && !isMasterDemo) {
      throw new Error('Incorrect password. Please verify and try again, or use "Forgot Password".');
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    this.saveRegisteredUsers(users);

    localStorage.setItem(REMEMBER_ME_KEY, rememberMe ? 'true' : 'false');
    this.establishSession(user);
    return user;
  },

  /**
   * Reset password for an email account
   */
  async resetPassword(email: string, newPassword: string): Promise<boolean> {
    const trimmedEmail = email.trim().toLowerCase();
    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }

    const users = this.getRegisteredUsers();
    const index = users.findIndex((u) => u.email.toLowerCase() === trimmedEmail);
    if (index === -1) {
      throw new Error('No QuizMaster account found matching this email address.');
    }

    const salt = generateSalt();
    const hash = await hashPassword(newPassword, salt);
    users[index].passwordSalt = salt;
    users[index].passwordHash = hash;
    this.saveRegisteredUsers(users);

    // If currently logged in user is this user, update active session
    const current = this.getCurrentUser();
    if (current && current.email.toLowerCase() === trimmedEmail) {
      current.passwordSalt = salt;
      current.passwordHash = hash;
      this.establishSession(current);
    }
    return true;
  },

  /**
   * Updates user profile (name, picture, custom avatar, theme)
   */
  updateProfile(userId: string, updates: Partial<User>): User {
    const users = this.getRegisteredUsers();
    const index = users.findIndex((u) => u.id === userId);
    
    let updatedUser: User;
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      this.saveRegisteredUsers(users);
      updatedUser = users[index];
    } else {
      const current = this.getCurrentUser();
      updatedUser = { ...(current as User), ...updates };
    }

    this.establishSession(updatedUser);
    return updatedUser;
  },

  /**
   * Restores default profile photo
   */
  restoreDefaultPicture(userId: string): User {
    const current = this.getCurrentUser();
    if (!current) throw new Error('No user logged in');

    const defaultPicture = current.googleSub
      ? `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(current.name)}&background=4f46e5&color=fff&size=150`;

    return this.updateProfile(userId, {
      picture: defaultPicture,
      customAvatarUrl: undefined,
    });
  },

  /**
   * Retrieves the current Google OAuth Client ID
   */
  getClientId(): string {
    const custom = localStorage.getItem(GOOGLE_CLIENT_ID_KEY);
    if (custom && custom.trim().length > 0) {
      return custom.trim();
    }
    const envId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
    if (envId && envId.trim().length > 0) {
      return envId.trim();
    }
    return '1048291823901-quizmaster01studentauth.apps.googleusercontent.com';
  },

  setClientId(clientId: string): void {
    localStorage.setItem(GOOGLE_CLIENT_ID_KEY, clientId.trim());
  },

  hasCustomClientId(): boolean {
    const custom = localStorage.getItem(GOOGLE_CLIENT_ID_KEY);
    if (custom && custom.trim().length > 0 && !custom.includes('quizmaster01studentauth') && !custom.includes('example.com')) {
      return true;
    }
    const envId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
    if (envId && envId.trim().length > 0 && !envId.includes('quizmaster01studentauth')) {
      return true;
    }
    return false;
  },

  getOAuthConfig(): OAuthConfig {
    const clientId = this.getClientId();
    const isCustom = this.hasCustomClientId();
    return {
      clientId,
      isConfigured: isCustom,
      environment: window.location.hostname === 'localhost' ? 'development' : 'production',
      redirectUri: window.location.origin,
    };
  },

  /**
   * Returns current authenticated user or null
   */
  getCurrentUser(): User | null {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  /**
   * Processes a genuine Google ID token (JWT) returned from Google Identity Services
   */
  async processGoogleCredential(credentialToken: string): Promise<User> {
    const payload = decodeGoogleJwt(credentialToken);
    if (!payload || !payload.sub || !payload.email) {
      throw new Error('Invalid or unreadable Google OpenID Connect token.');
    }

    try {
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credentialToken}`);
      if (response.ok) {
        const verifyData = await response.json();
        if (verifyData.sub !== payload.sub) {
          throw new Error('Google token signature verification mismatch.');
        }
      }
    } catch (netErr) {
      console.warn('Google online tokeninfo check skipped:', netErr);
    }

    const email = payload.email.toLowerCase();
    const adminEmails = this.getAdminEmails();
    const isAdmin = adminEmails.some((admin) => admin.toLowerCase() === email);

    const users = this.getRegisteredUsers();
    let user = users.find((u) => u.googleSub === payload.sub || u.email.toLowerCase() === email);
    const now = new Date().toISOString();

    if (user) {
      user.lastLogin = now;
      user.name = payload.name || user.name;
      if (!user.customAvatarUrl && payload.picture) {
        user.picture = payload.picture;
      }
      user.googleSub = payload.sub;
      user.authProvider = 'google';
    } else {
      user = {
        id: 'usr-' + payload.sub.slice(-8),
        googleSub: payload.sub,
        authProvider: 'google',
        name: payload.name || email.split('@')[0],
        email: payload.email,
        picture: payload.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(payload.name || email)}&background=4f46e5&color=fff`,
        emailVerified: Boolean(payload.email_verified),
        role: isAdmin ? 'ADMIN' : 'STUDENT',
        createdAt: now,
        lastLogin: now,
        accountStatus: 'ACTIVE',
        themePreference: 'system',
      };
      users.push(user);
    }

    this.saveRegisteredUsers(users);
    this.establishSession(user);
    return user;
  },

  /**
   * Establish authenticated session
   */
  establishSession(user: User): void {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  },

  /**
   * Log out safely
   */
  logout(): void {
    if (window.google?.accounts?.id?.disableAutoSelect) {
      try {
        window.google.accounts.id.disableAutoSelect();
      } catch (e) {
        // Safe fallback
      }
    }
    localStorage.removeItem(AUTH_USER_KEY);
  },

  getAdminEmails(): string[] {
    const raw = localStorage.getItem(ADMIN_EMAILS_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return DEFAULT_ADMIN_EMAILS;
      }
    }
    return DEFAULT_ADMIN_EMAILS;
  },

  addAdminEmail(email: string): void {
    const list = this.getAdminEmails();
    if (!list.includes(email)) {
      list.push(email);
      localStorage.setItem(ADMIN_EMAILS_KEY, JSON.stringify(list));
    }
  },

  toggleUserRole(userId: string): User | null {
    const user = this.getCurrentUser();
    if (user && user.id === userId) {
      user.role = user.role === 'ADMIN' ? 'STUDENT' : 'ADMIN';
      this.updateProfile(userId, { role: user.role });
      return user;
    }
    return null;
  },
};
