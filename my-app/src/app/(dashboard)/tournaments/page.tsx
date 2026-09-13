'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Trophy, Plus, UserPlus, CheckCircle, Calendar, MapPin } from 'lucide-react';

export default function TournamentsPage() {
  const { hasPermission } = useAuth();
  const [assignedManager, setAssignedManager] = useState('Nguyễn Văn Quản Lý');
  const [selectedUser, setSelectedUser] = useState('Lê Điều Hành Giải 1');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleAssign = () => {
    setAssignedManager(selectedUser);
    setSuccessNotice(`Đã chỉ định thành viên [${selectedUser}] làm Người điều hành Giải Bóng Đá Đại Hội TDTT 2026!`);
  };

  return (
    <div className="p-6 md:p-10 space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Quản Lý Giải Đấu</h1>
            <p className="text-xs text-slate-400">
              Quản lý danh sách giải đấu & chỉ định thành viên điều hành từng giải cụ thể.
            </p>
          </div>
        </div>

        {hasPermission('Permissions.Tournaments.Create') && (
          <button
            onClick={() => alert('Mở form tạo giải đấu mới')}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-500/20 transition cursor-pointer self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Giải Đấu Mới</span>
          </button>
        )}
      </div>

      {successNotice && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Thông tin giải đấu và phân công người điều hành giải */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Đang Diễn Ra
              </span>
              <h2 className="text-lg font-bold text-white mt-2">
                Đại Hội Thể Thao Tỉnh Lần Thứ IX - Môn Bóng Đá & Điền Kinh
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs text-slate-300 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Thời gian: 15/10/2026 - 25/10/2026</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>Địa điểm: Sân vận động Trung tâm Tỉnh</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[11px]">Người điều hành giải đấu này:</span>
              <span className="text-white font-bold text-sm">{assignedManager}</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px]">
              Đang Điều Hành
            </span>
          </div>
        </div>

        {/* Cụm chọn thành viên điều hành giải đấu */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-white font-semibold text-sm mb-1">
              <UserPlus className="w-4 h-4 text-purple-400" />
              <span>Chỉ Định Người Điều Hành Giải</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Chọn 1 thành viên chịu trách nhiệm trực tiếp điều hành giải đấu cụ thể này.
            </p>

            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Chọn thành viên ban tổ chức:
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              <option value="Lê Điều Hành Giải 1">Lê Điều Hành Giải 1 (Phòng Quản lý TDTT)</option>
              <option value="Phạm Văn Trưởng Ban">Phạm Văn Trưởng Ban (Trung tâm Huấn luyện)</option>
              <option value="Hoàng Điều Hành 2">Hoàng Điều Hành 2 (Sở Văn hóa Thể thao)</option>
            </select>
          </div>

          {hasPermission('Permissions.Tournaments.AssignManager') ? (
            <button
              onClick={handleAssign}
              className="w-full py-2.5 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Lưu Chỉ Định Điều Hành
            </button>
          ) : (
            <div className="p-2 text-center text-xs text-slate-500 bg-slate-950 rounded-lg">
              Bạn không có quyền chỉ định người điều hành
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
