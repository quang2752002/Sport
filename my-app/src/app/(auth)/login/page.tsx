'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { Shield, KeyRound, User, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await register({ username, password, email, fullName });
      } else {
        await login({ username, password });
      }
      router.push('/admin');
    } catch (err: any) {
      setError(err?.message || (Array.isArray(err) ? err.join(', ') : 'Đã có lỗi xảy ra khi xác thực.'));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setIsRegister(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-4 font-sans text-slate-100">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {isRegister ? 'Tạo Tài Khoản Mới' : 'Đăng Nhập Hệ Thống'}
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            {isRegister
              ? 'Đăng ký tài khoản người dùng giải đấu'
              : 'Xác thực JWT Token & Phân quyền RBAC'}
          </p>
        </div>

        {/* Quick Test Accounts */}
        {!isRegister && (
          <div className="mb-6 p-3 bg-white/5 border border-white/10 rounded-2xl text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-blue-300 font-semibold">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Đăng nhập thử theo 6 vai trò:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'Admin@123')}
                className="p-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-left transition flex flex-col cursor-pointer"
              >
                <span className="font-bold text-white flex items-center gap-1">
                  Admin <CheckCircle2 className="w-3 h-3 text-blue-400" />
                </span>
                <span className="text-[10px] text-blue-200">Quản trị toàn hệ thống</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('manager', 'Manager@123')}
                className="p-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-left transition flex flex-col cursor-pointer"
              >
                <span className="font-bold text-white">Quản Lý Giải</span>
                <span className="text-[10px] text-purple-200">Điều hành giải đấu</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('head_referee', 'HeadReferee@123')}
                className="p-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-left transition flex flex-col cursor-pointer"
              >
                <span className="font-bold text-white">Trưởng Ban TT</span>
                <span className="text-[10px] text-emerald-200">Phân công trọng tài</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('referee', 'Referee@123')}
                className="p-2 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-left transition flex flex-col cursor-pointer"
              >
                <span className="font-bold text-white">Trọng Tài</span>
                <span className="text-[10px] text-amber-200">Cập nhật tỷ số live</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('secretary', 'Secretary@123')}
                className="p-2 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 text-left transition flex flex-col cursor-pointer"
              >
                <span className="font-bold text-white">Thư Ký Giải</span>
                <span className="text-[10px] text-cyan-200">Biên bản & xuất PDF</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('delegation', 'Delegation@123')}
                className="p-2 rounded-xl bg-pink-600/30 hover:bg-pink-600/50 border border-pink-500/40 text-left transition flex flex-col cursor-pointer"
              >
                <span className="font-bold text-white">Đơn Vị/Sở/Xã</span>
                <span className="text-[10px] text-pink-200">Đăng ký VĐV & đội</span>
              </button>
            </div>
          </div>
        )}

        {/* Alert Error */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-500/20 border border-red-500/50 rounded-xl flex items-start gap-2 text-xs text-red-200 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Tên đăng nhập
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập"
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/15 rounded-xl text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Họ và tên
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/15 rounded-xl text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/15 rounded-xl text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/15 rounded-xl text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 transition duration-200 flex items-center justify-center gap-2 group cursor-pointer"
          >
            {loading ? (
              <span>Đang xác thực...</span>
            ) : (
              <>
                <span>{isRegister ? 'Đăng Ký Tài Khoản' : 'Đăng Nhập'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Toggle mode */}
        <div className="mt-6 pt-6 border-t border-white/10 text-center text-xs text-slate-300">
          {isRegister ? (
            <p>
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="font-semibold text-blue-400 hover:underline ml-1 cursor-pointer"
              >
                Đăng nhập ngay
              </button>
            </p>
          ) : (
            <p>
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="font-semibold text-blue-400 hover:underline ml-1 cursor-pointer"
              >
                Đăng ký tài khoản
              </button>
            </p>
          )}
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-xs text-slate-400 hover:text-white transition">
            ← Quay lại Trang Chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
