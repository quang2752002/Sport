'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Users, UserCheck, Shield, CheckCircle, Clock } from 'lucide-react';

export default function RefereesPage() {
  const { hasPermission } = useAuth();
  const [mainRef, setMainRef] = useState('Trần Trọng Tài FIFA 1');
  const [assistantRef, setAssistantRef] = useState('Nguyễn Trợ Lý 1');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(`Đã phân công [${mainRef}] (Chính) và [${assistantRef}] (Phụ) cho trận Bán Kết 1!`);
  };

  return (
    <div className="p-6 md:p-10 space-y-6 max-w-6xl">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Trưởng Ban Trọng Tài</h1>
          <p className="text-xs text-slate-400">
            Phân công trọng tài chính, trọng tài phụ cho từng môn và từng trận đấu cụ thể; giám sát tiến độ thi đấu.
          </p>
        </div>
      </div>

      {savedNotice && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form phân công */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white">Phân Công Trọng Tài Trận Đấu Cụ Thể</h2>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Trận Bán Kết 1 - 15:30 Hôm nay
            </span>
          </div>

          <form onSubmit={handleSaveAssignment} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-300 mb-1.5">Môn thi đấu & Trận:</label>
              <input
                type="text"
                disabled
                value="Bóng đá nam 11 người - Trận: Sở GD-ĐT vs Sở VH-TT (Sân số 1)"
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-300 mb-1.5">Trọng tài chính:</label>
                <select
                  value={mainRef}
                  onChange={(e) => setMainRef(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Trần Trọng Tài FIFA 1">Trần Trọng Tài FIFA 1 (Cấp Quốc Gia)</option>
                  <option value="Lê Văn Trọng Tài">Lê Văn Trọng Tài (Trọng tài cấp tỉnh)</option>
                  <option value="Phạm Quốc Anh">Phạm Quốc Anh (Trọng tài cấp tỉnh)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1.5">Trọng tài phụ (Trợ lý biên):</label>
                <select
                  value={assistantRef}
                  onChange={(e) => setAssistantRef(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Nguyễn Trợ Lý 1">Nguyễn Trợ Lý 1 (Trợ lý trọng tài)</option>
                  <option value="Hoàng Trợ Lý 2">Hoàng Trợ Lý 2 (Trợ lý trọng tài)</option>
                  <option value="Vũ Bàn Trọng Tài">Vũ Bàn Trọng Tài (Trọng tài thứ 4)</option>
                </select>
              </div>
            </div>

            {hasPermission('Permissions.Referees.Assign') ? (
              <button
                type="submit"
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition cursor-pointer flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Lưu Phân Công Trọng Tài</span>
              </button>
            ) : (
              <div className="p-3 bg-slate-950 rounded-xl text-slate-500">
                Chỉ Trưởng ban trọng tài mới có quyền phân công.
              </div>
            )}
          </form>
        </div>

        {/* Giám sát tiến độ */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Giám Sát Tiến Độ Thi Đấu</h3>
          <p className="text-xs text-slate-400">
            Theo dõi phân công và trạng thái các trận đấu trên các sân:
          </p>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="flex justify-between font-semibold text-white mb-1">
                <span>Cầu Lông Đơn Nam</span>
                <span className="text-emerald-400">Đã đủ trọng tài</span>
              </div>
              <p className="text-slate-400 text-[11px]">Sân thi đấu số 2 - TT: Lê Văn B</p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="flex justify-between font-semibold text-white mb-1">
                <span>Bóng Chuyền Nữ</span>
                <span className="text-amber-400">Cần phân công phụ</span>
              </div>
              <p className="text-slate-400 text-[11px]">Sân nhà thi đấu đa năng</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
