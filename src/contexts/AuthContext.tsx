import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Role, User } from '../data/mockData';
import { login as apiLogin, updateUser } from '../api';

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (roles: Role[]) => boolean;
  updateDisplayName: (name: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
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
  'Directeur général': [
    'view_dashboard', 'view_projects', 'view_tasks', 'view_messages',
    'manage_users',
  ],
  'Directeur général adjoint': [
    'view_dashboard', 'view_projects', 'view_tasks', 'view_messages',
    'manage_users',
  ],
  'Directeur technique': [
    'view_dashboard', 'view_projects', 'view_tasks',
    'validate_projects', 'manage_projects',
  ],
  'Coordinateur de projet': [
    'view_dashboard', 'view_projects', 'view_tasks',
    'manage_projects', 'assign_tasks', 'write', 'update_tasks',
  ],
  'Équipe technique': [
    'view_tasks', 'update_tasks',
  ],
  'Directeur commercial': [
    'view_dashboard', 'view_messages',
    'send_messages', 'manage_requests', 'create_projects', 'view_projects',
  ],
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const persistSessionUser = (next: User) => {
    setUser(next);
    localStorage.setItem('user', JSON.stringify(next));
  };

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await apiLogin(email, password);
      persistSessionUser(response.user);
      return response.user;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Échec de la connexion';
      throw new Error(message);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateDisplayName = async (name: string) => {
    if (!user) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    const updatedUser = await updateUser({ id: user.id, name: trimmed });
    persistSessionUser(updatedUser);
  };

  const updatePassword = async (newPassword: string) => {
    if (!user) return;
    const updatedUser = await updateUser({ id: user.id, password: newPassword });
    persistSessionUser(updatedUser);
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
    const token = localStorage.getItem('token');
    if (!token) return;
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return;
    try {
      setUser(JSON.parse(savedUser) as User);
    } catch {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission, hasRole, updateDisplayName, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
};