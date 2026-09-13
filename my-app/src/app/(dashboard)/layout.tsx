'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  Trophy,
  Shield,
  Award,
  Users,
  Timer,
  FileCheck,
  Building2,
  LogOut,
  Loader2,
  ChevronRight,
  User,
  Home
} from 'lucide-react';

// Định nghĩa menu điều hướng tương ứng với 6 vai trò trong AppRoles
const NAVIGATION_ITEMS = [
  {
    name: 'Quản Trị Hệ Thống',
    href: '/admin',
    icon: Shield,
    role: 'Admin',
    permission: 'Permissions.System.ConfigSettings',
    description: 'Cấu hình tham số, cấp tài khoản & sao lưu',
  },
  {
    name: 'Quản Lý Giải Đấu',
    href: '/tournaments',
    icon: Trophy,
    role: 'Manager',
    permission: 'Permissions.Tournaments.View',
    description: 'Điều hành giải & chỉ định người quản lý',
  },
  {
    name: 'Trưởng Ban Trọng Tài',
    href: '/referees',
    icon: Users,
    role: 'HeadReferee',
    permission: 'Permissions.Referees.Assign',
    description: 'Phân công trọng tài & giám sát',
  },
  {
    name: 'Trọng Tài Trực Tiếp',
    href: '/live-match',
    icon: Timer,
    role: 'Referee',
    permission: 'Permissions.Matches.UpdateScore',
    description: 'Nhật ký trận đấu, tỷ số realtime',
  },
  {
    name: 'Thư Ký Giải',
    href: '/secretary',
    icon: FileCheck,
    role: 'Secretary',
    permission: 'Permissions.Results.ExportReport',
    description: 'Biên bản & xuất kết quả PDF/Excel',
  },
  {
    name: 'Đơn Vị Trực Thuộc',
    href: '/delegation',
    icon: Building2,
    role: 'Delegation',
    permission: 'Permissions.Delegations.ManageAthletes',
    description: 'Sở/Xã đăng ký danh sách VĐV & đội',
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading, logout, hasPermission, hasRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Kiểm tra quyền hạn của trang hiện tại (Auth Guard tự động theo route)
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Nếu là Admin thì có quyền vào mọi trang
      if (user.roles.includes('Admin')) return;

      const currentItem = NAVIGATION_ITEMS.find((item) => pathname.startsWith(item.href));
      if (currentItem) {
        const allowed = hasRole(currentItem.role) || hasPermission(currentItem.permission);
        if (!allowed) {
          router.push('/unauthorized');
        }
      }
    }
  }, [isLoading, isAuthenticated, user, pathname, router, hasRole, hasPermission]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-300 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
        <p className="text-sm">Đang xác thực phiên làm việc...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        {/* Logo */}
        <div className="h-16 px-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-sm">Sport DMS Portal</span>
            <span className="text-[10px] text-slate-400 block -mt-0.5">Hệ Thống Quản Lý Thể Thao</span>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 mx-4 my-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
            {user?.username?.substring(0, 2).toUpperCase()}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-semibold text-white truncate">{user?.fullName || user?.username}</p>
            <span className="inline-block px-2 py-0.5 mt-0.5 rounded text-[10px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {user?.roles.join(', ') || 'User'}
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Phân Hệ Nghiệp Vụ
          </div>

          {NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            // Kiểm tra xem người dùng có quyền xem mục này không
            const isAccessible =
              user?.roles.includes('Admin') ||
              hasRole(item.role) ||
              hasPermission(item.permission);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-semibold'
                    : isAccessible
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                    : 'text-slate-600 hover:text-slate-400 hover:bg-slate-900/40 opacity-70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                {!isAccessible && (
                  <span className="text-[10px] text-slate-500">Khóa</span>
                )}
              </Link>
            );
          })}

          <div className="pt-4 px-3 pb-1 border-t border-slate-800/80">
            <Link
              href="/"
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition"
            >
              <Home className="w-4 h-4 text-slate-400" />
              <span>Về Trang Chủ</span>
            </Link>
          </div>
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => logout()}
            className="w-full py-2.5 px-3 rounded-xl bg-red-950/30 hover:bg-red-950/60 border border-red-900/40 text-red-300 text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng Xuất</span>
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
