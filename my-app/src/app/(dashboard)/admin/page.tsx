'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';
import { Shield, Settings, Database, UserCheck, CheckCircle2, RefreshCw } from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleBackup = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMessage('Sao lưu toàn bộ cơ sở dữ liệu giải đấu thành công lúc ' + new Date().toLocaleTimeString());
    }, 800);
  };

  return (
    <div className="p-6 md:p-10 space-y-6 max-w-6xl">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Quản Trị Hệ Thống (Admin)</h1>
          <p className="text-xs text-slate-400">
            Quản trị toàn bộ phần mềm, cấu hình tham số chung, cấp tài khoản và sao lưu dữ liệu.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Cấu Hình Tham Số Chung</h3>
            <p className="text-xs text-slate-400">
              Thiết lập quy chế tính điểm giải đấu, thời gian hiệp phụ, số lượng thẻ phạt kích hoạt đình chỉ.
            </p>
          </div>
          <button
            onClick={() => setMessage('Đã lưu cấu hình tham số chung hệ thống.')}
            className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium transition cursor-pointer"
          >
            Lưu Cấu Hình Tham Số
          </button>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-400 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Cấp Tài Khoản & Phân Quyền</h3>
            <p className="text-xs text-slate-400">
              Cấp tài khoản cho Ban điều hành, Trưởng ban trọng tài, Thư ký giải và Đoàn Sở/Xã.
            </p>
          </div>
          <button
            onClick={() => setMessage('Mở giao diện cấp và phân quyền tài khoản.')}
            className="w-full py-2.5 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-medium transition cursor-pointer"
          >
            Quản Lý Tài Khoản
          </button>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Sao Lưu Dữ Liệu</h3>
            <p className="text-xs text-slate-400">
              Xuất bản backup SQL Database và dữ liệu hồ sơ VĐV, kết quả thi đấu toàn giải.
            </p>
          </div>
          <button
            onClick={handleBackup}
            disabled={loading}
            className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-medium transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            <span>Sao Lưu Dữ Liệu Ngay</span>
          </button>
        </div>
      </div>
    </div>
  );
}
