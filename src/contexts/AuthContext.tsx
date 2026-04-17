import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Role, User } from '../data/mockData';
import { userAccounts } from '../data/mockData';

const PROFILE_OVERRIDES_KEY = 'cis_profile_overrides';

type ProfileOverride = { name?: string; password?: string };
type ProfileOverrides = Record<number, ProfileOverride>;

function loadProfileOverrides(): ProfileOverrides {
  try {
    const raw = localStorage.getItem(PROFILE_OVERRIDES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ProfileOverrides;
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function saveProfileOverrides(overrides: ProfileOverrides) {
  localStorage.setItem(PROFILE_OVERRIDES_KEY, JSON.stringify(overrides));
}

function effectivePassword(accountId: number, basePassword: string): string {
  const o = loadProfileOverrides()[accountId];
  return o?.password ?? basePassword;
}

function effectiveName(account: { id: number; name: string }): string {
  const o = loadProfileOverrides()[account.id];
  return o?.name ?? account.name;
}

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string, role: Role) => boolean;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (roles: Role[]) => boolean;
  updateDisplayName: (name: string) => void;
  updatePassword: (currentPassword: string, newPassword: string) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

type AuthProviderProps = {
  children: ReactNode;
};

const rolePermissions: Record<Role, string[]> = {
  Directeur: ['view_dashboard', 'view_projects', 'view_tasks', 'view_messages', 'manage_projects', 'assign_tasks', 'manage_users', 'send_messages', 'update_tasks', 'manage_requests'],
  'Chef de projet': ['view_dashboard', 'view_projects', 'view_tasks', 'manage_projects', 'assign_tasks'],
  'Équipe technique': ['view_tasks', 'update_tasks'],
  Commercial: ['view_messages', 'send_messages', 'manage_requests'],
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const persistSessionUser = (next: User) => {
    setUser(next);
    localStorage.setItem('user', JSON.stringify(next));
  };

  const login = (email: string, password: string, role: Role): boolean => {
    const found = userAccounts.find(u => u.email === email && u.role === role);
    if (!found) return false;
    const pwd = effectivePassword(found.id, found.password);
    if (password !== pwd) return false;
    const sessionUser: User = {
      id: found.id,
      name: effectiveName(found),
      email: found.email,
      role: found.role,
      avatar: found.avatar,
    };
    persistSessionUser(sessionUser);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateDisplayName = (name: string) => {
    if (!user) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    const overrides = loadProfileOverrides();
    overrides[user.id] = { ...overrides[user.id], name: trimmed };
    saveProfileOverrides(overrides);
    persistSessionUser({ ...user, name: trimmed });
  };

  const updatePassword = (currentPassword: string, newPassword: string): boolean => {
    if (!user) return false;
    const found = userAccounts.find(u => u.id === user.id);
    if (!found) return false;
    const pwd = effectivePassword(found.id, found.password);
    if (currentPassword !== pwd) return false;
    const overrides = loadProfileOverrides();
    overrides[user.id] = { ...overrides[user.id], password: newPassword };
    saveProfileOverrides(overrides);
    return true;
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return rolePermissions[user.role]?.includes(permission) || false;
  };

  const hasRole = (roles: Role[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  React.useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser) as User;
        const account = userAccounts.find(u => u.id === parsed.id);
        if (account && account.email === parsed.email && account.role === parsed.role) {
          const merged: User = {
            ...parsed,
            name: effectiveName({ id: account.id, name: account.name }),
          };
          setUser(merged);
        }
      } catch {
        localStorage.removeItem('user');
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        hasPermission,
        hasRole,
        updateDisplayName,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
