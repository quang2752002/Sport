'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import {
  Trophy,
  Shield,
  Users,
  Timer,
  FileCheck,
  Building2,
  ArrowRight,
  LogOut,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

const ROLE_SECTIONS = [
  {
    role: 'Admin',
    name: 'Admin Hệ Thống',
    href: '/admin',
    icon: Shield,
    color: 'from-blue-600/20 to-indigo-600/20 text-blue-400 border-blue-500/30',
    description: 'Quản trị toàn bộ phần mềm, cấu hình tham số chung, cấp tài khoản và sao lưu dữ liệu.',
  },
  {
    role: 'Manager',
    name: 'Quản Lý Giải Đấu',
    href: '/tournaments',
    icon: Trophy,
    color: 'from-purple-600/20 to-pink-600/20 text-purple-400 border-purple-500/30',
    description: 'Quản lý chung và quản lý 1 giải đấu (chỉ định thành viên điều hành 1 giải cụ thể).',
  },
  {
    role: 'HeadReferee',
    name: 'Trưởng Ban Trọng Tài',
    href: '/referees',
    icon: Users,
    color: 'from-emerald-600/20 to-teal-600/20 text-emerald-400 border-emerald-500/30',
    description: 'Phân công trọng tài chính, phụ cho từng môn & từng trận đấu cụ thể; giám sát tiến độ.',
  },
  {
    role: 'Referee',
    name: 'Trọng Tài Trực Tiếp',
    href: '/live-match',
    icon: Timer,
    color: 'from-amber-600/20 to-orange-600/20 text-amber-400 border-amber-500/30',
    description: 'Cập nhật nhật ký trận đấu (tỷ số, thẻ phạt, diễn biến) trực tiếp theo thời gian thực.',
  },
  {
    role: 'Secretary',
    name: 'Thư Ký Giải',
    href: '/secretary',
    icon: FileCheck,
    color: 'from-cyan-600/20 to-blue-600/20 text-cyan-400 border-cyan-500/30',
    description: 'Theo dõi chi tiết nội dung từng môn, kiểm tra biên bản thi đấu và xuất kết quả (PDF/Excel).',
  },
  {
    role: 'Delegation',
    name: 'Đơn Vị Trực Thuộc',
    href: '/delegation',
    icon: Building2,
    color: 'from-rose-600/20 to-red-600/20 text-rose-400 border-rose-500/30',
    description: 'Sở/Xã/Đơn vị quản lý và đăng ký danh sách vận động viên (VĐV), đội thi đấu của đơn vị mình.',
  },
];

export default function Home() {
  const { user, isAuthenticated, logout, hasRole } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white">
                Cổng Quản Lý Thể Thao & Đại Hội TDTT
              </span>
              <span className="text-[10px] text-slate-400 block -mt-0.5">Sport DMS Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 text-xs bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="text-white font-medium">{user?.fullName || user?.username}</span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold text-[10px]">
                    {user?.roles.join(', ')}
                  </span>
                </div>
                <Link
                  href="/admin"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 transition"
                >
                  Vào Bảng Điều Khiển
                </Link>
                <button
                  onClick={() => logout()}
                  className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-white transition cursor-pointer"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2 text-xs font-semibold bg-white text-slate-950 hover:bg-slate-200 rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                <span>Đăng Nhập</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Hệ Thống Phân Quyền Theo 6 Vai Trò AppRoles</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-3xl leading-tight">
          Quản Lý Giải Đấu & Điều Hành <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
            Trọng Tài - Kết Quả - VĐV Trực Tuyến
          </span>
        </h1>

        <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
          Nền tảng quản lý thể thao tích hợp xác thực JWT Token, phân quyền chặt chẽ theo từng nhóm vai trò trong Ban tổ chức, Trọng tài và Đoàn VĐV các đơn vị.
        </p>

        {/* 6 Vai trò theo AppRoles */}
        <div className="mt-14 w-full text-left">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Các Phân Hệ Chức Năng Chính (AppRoles)</h2>
              <p className="text-xs text-slate-400">Nhấp vào từng phân hệ để truy cập theo quyền hạn của tài khoản</p>
            </div>
            {!isAuthenticated && (
              <Link href="/login" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                <span>Đăng nhập để trải nghiệm</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ROLE_SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const hasAccess = user?.roles.includes('Admin') || hasRole(sec.role);

              return (
                <Link
                  key={sec.role}
                  href={sec.href}
                  className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/80 transition flex flex-col justify-between group space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${sec.color} border flex items-center justify-center`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {isAuthenticated && (
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                          hasAccess ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {hasAccess ? 'Được phép' : 'Cần cấp quyền'}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition flex items-center gap-1.5">
                        <span>{sec.name}</span>
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{sec.description}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Role: {sec.role}</span>
                    <span className="text-blue-400 font-sans font-medium group-hover:underline">Truy cập →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}


