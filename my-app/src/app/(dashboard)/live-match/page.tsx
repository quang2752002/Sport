'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Timer, AlertTriangle, Check, Plus, Minus, Bell } from 'lucide-react';

export default function LiveMatchPage() {
  const { hasPermission } = useAuth();
  const [scoreTeamA, setScoreTeamA] = useState(2);
  const [scoreTeamB, setScoreTeamB] = useState(1);
  const [events, setEvents] = useState([
    { minute: "12'", text: "Vào! Nguyễn Văn Toàn (Đội A) ghi bàn mở tỷ số.", type: 'goal' },
    { minute: "34'", text: "Thẻ vàng cho Trần Văn C (Đội B) do phạm lỗi kéo người.", type: 'card' },
    { minute: "68'", text: "Vào! Lê Hoàng D (Đội B) đánh đầu gỡ hòa 1-1.", type: 'goal' },
    { minute: "75'", text: "Vào! Đội A nâng tỷ số lên 2-1 từ chấm phạt đền 11m.", type: 'goal' },
  ]);
  const [newEventText, setNewEventText] = useState('');
  const [eventMinute, setEventMinute] = useState('82');

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventText.trim()) return;
    setEvents([{ minute: `${eventMinute}'`, text: newEventText, type: 'live' }, ...events]);
    setNewEventText('');
  };

  return (
    <div className="p-6 md:p-10 space-y-6 max-w-6xl">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
          <Timer className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">Trọng Tài Cập Nhật Trực Tiếp (Realtime)</h1>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
              LIVE 82'
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Cập nhật nhật ký trận đấu (tỷ số, thẻ phạt, diễn biến) trực tiếp theo thời gian thực.
          </p>
        </div>
      </div>

      {/* Bảng tỷ số trực tiếp */}
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col items-center shadow-xl">
        <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-4">
          Trận Bán Kết 1 - Sân Vận Động Trung Tâm
        </span>

        <div className="grid grid-cols-3 w-full max-w-2xl items-center text-center">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-white">Sở GD-ĐT (Đội A)</h2>
            <span className="text-xs text-slate-400">Trang phục: Đỏ</span>
          </div>

          <div className="flex items-center justify-center gap-4">
            <div className="flex flex-col items-center">
              <span className="text-5xl md:text-6xl font-extrabold text-amber-400 font-mono">
                {scoreTeamA}
              </span>
              {hasPermission('Permissions.Matches.UpdateScore') && (
                <div className="flex gap-1 mt-2">
                  <button
                    onClick={() => setScoreTeamA(Math.max(0, scoreTeamA - 1))}
                    className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setScoreTeamA(scoreTeamA + 1)}
                    className="w-6 h-6 rounded bg-amber-600 hover:bg-amber-500 text-white flex items-center justify-center text-xs font-bold"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <span className="text-3xl text-slate-600 font-bold">:</span>

            <div className="flex flex-col items-center">
              <span className="text-5xl md:text-6xl font-extrabold text-white font-mono">
                {scoreTeamB}
              </span>
              {hasPermission('Permissions.Matches.UpdateScore') && (
                <div className="flex gap-1 mt-2">
                  <button
                    onClick={() => setScoreTeamB(Math.max(0, scoreTeamB - 1))}
                    className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setScoreTeamB(scoreTeamB + 1)}
                    className="w-6 h-6 rounded bg-amber-600 hover:bg-amber-500 text-white flex items-center justify-center text-xs font-bold"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg md:text-xl font-bold text-white">Sở VH-TT (Đội B)</h2>
            <span className="text-xs text-slate-400">Trang phục: Xanh</span>
          </div>
        </div>
      </div>

      {/* Nhật ký diễn biến realtime */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {hasPermission('Permissions.Matches.UpdateScore') && (
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <span>Thêm Nhật Ký Trận Đấu</span>
            </h3>

            <form onSubmit={handleAddEvent} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Phút thứ:</label>
                <input
                  type="text"
                  value={eventMinute}
                  onChange={(e) => setEventMinute(e.target.value)}
                  className="w-24 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Diễn biến / Thẻ phạt / Bàn thắng:</label>
                <textarea
                  rows={3}
                  value={newEventText}
                  onChange={(e) => setNewEventText(e.target.value)}
                  placeholder="Ví dụ: Thẻ vàng cho cầu thủ số 8; Bàn thắng mở tỷ số..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder:text-slate-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition cursor-pointer"
              >
                Gửi Diễn Biến Realtime
              </button>
            </form>
          </div>
        )}

        <div className={`p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 ${!hasPermission('Permissions.Matches.UpdateScore') ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
          <h3 className="text-sm font-bold text-white">Dòng Thời Gian Nhật Ký Trận Đấu</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {events.map((ev, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <span className="font-bold text-amber-400 font-mono shrink-0 px-2 py-0.5 rounded bg-amber-500/10">
                  {ev.minute}
                </span>
                <p className="text-slate-200 leading-relaxed">{ev.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
