'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';
import { api, tokenStorage } from '../lib/api';

import { Role, PermissionGroup } from '../types';
import { roleService } from '../services/roleService';

interface JwtPayload {
  sub?: string;
  nameid?: string;
  username?: string;
  fullName?: string;
  email?: string;
  role?: string | string[];
  permission?: string | string[];
  exp?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissionGroups: PermissionGroup[];
  login: (credentials: LoginRequest) => Promise<User | null>;
  register: (data: RegisterRequest) => Promise<User | null>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  can: (module: string, action: string) => boolean;
  loadPermissionTree: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hàm giải mã trực tiếp từ chuỗi Access Token JWT
function parseUserFromToken(token: string): User | null {
  try {
    const decoded = jwtDecode<JwtPayload>(token);

    // Chuẩn hóa roles từ jwt
    const roles: string[] = [];
    if (decoded.role) {
      if (Array.isArray(decoded.role)) roles.push(...decoded.role);
      else roles.push(decoded.role);
    }

    // Chuẩn hóa permissions từ jwt
    const permissions: string[] = [];
    if (decoded.permission) {
      if (Array.isArray(decoded.permission)) permissions.push(...decoded.permission);
      else permissions.push(decoded.permission);
    }

    const userId = Number(decoded.sub || decoded.nameid || 0);

    return {
      id: userId,
      username: decoded.username || '',
      fullName: decoded.fullName || '',
      email: decoded.email || '',
      roles,
      permissions,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const router = useRouter();

  // Tải danh mục phân nhóm quyền từ Backend API: /api/roles/permissions-tree
  const loadPermissionTree = useCallback(async () => {
    try {
      const data = await roleService.getPermissionsTree();
      setPermissionGroups(data || []);
    } catch {
      // Bỏ qua lỗi nếu chưa có quyền truy cập
    }
  }, []);

  // Khởi tạo kiểm tra token lưu trong storage khi mở app
  useEffect(() => {
    const token = tokenStorage.getAccessToken();
    if (token) {
      const parsedUser = parseUserFromToken(token);
      if (parsedUser) {
        setUser(parsedUser);
        loadPermissionTree();
      } else {
        tokenStorage.clearTokens();
        setUser(null);
      }
    }
    setIsLoading(false);

    const handleUnauthorized = () => {
      setUser(null);
      router.push('/login');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [router]);

  const login = async (credentials: LoginRequest): Promise<User | null> => {
    setIsLoading(true);
    try {
      const { data } = await api.post<AuthResponse>('/api/auth/login', credentials);
      tokenStorage.setTokens(data.accessToken, data.refreshToken);

      // Giải mã trực tiếp từ token vừa nhận
      const parsedUser = parseUserFromToken(data.accessToken);
      setUser(parsedUser);
      loadPermissionTree();
      return parsedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (dataPayload: RegisterRequest): Promise<User | null> => {
    setIsLoading(true);
    try {
      const { data } = await api.post<AuthResponse>('/api/auth/register', dataPayload);
      tokenStorage.setTokens(data.accessToken, data.refreshToken);

      const parsedUser = parseUserFromToken(data.accessToken);
      setUser(parsedUser);
      loadPermissionTree();
      return parsedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout').catch(() => {});
    } finally {
      tokenStorage.clearTokens();
      setUser(null);
      setPermissionGroups([]);
      router.push('/login');
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    // Role Admin luôn có toàn quyền
    if (user.roles.includes('Admin')) return true;
    return user.permissions.includes(permission);
  };

  const can = (module: string, action: string): boolean => {
    if (!user) return false;
    if (user.roles.includes('Admin')) return true;
    return user.permissions.includes(`Permissions.${module}.${action}`);
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.roles.some((r) => r.toLowerCase() === role.toLowerCase());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        permissionGroups,
        login,
        register,
        logout,
        hasPermission,
        hasRole,
        can,
        loadPermissionTree,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
