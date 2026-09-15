'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Building2, UserPlus, Users, CheckCircle, ShieldCheck } from 'lucide-react';

export default function DelegationPage() {
  const { hasPermission } = useAuth();
  const [athletes, setAthletes] = useState([
    { id: 1, name: 'Nguyễn Văn Hoàng', sport: 'Bóng Đá Nam', dob: '1998', unit: 'Đoàn Sở VH-TT Tỉnh' },
    { id: 2, name: 'Trần Thị Thu Hà', sport: 'Cầu Lông Đơn Nữ', dob: '2001', unit: 'Đoàn Sở VH-TT Tỉnh' },
    { id: 3, name: 'Lê Minh Tuấn', sport: 'Điền Kinh 100m', dob: '2002', unit: 'Đoàn Sở VH-TT Tỉnh' },
  ]);
  const [name, setName] = useState('');
  const [sport, setSport] = useState('Bóng Đá Nam');
  const [dob, setDob] = useState('2000');
  const [notice, setNotice] = useState<string | null>(null);

  const handleAddAthlete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newA = {
      id: Date.now(),
      name,
      sport,
      dob,
      unit: 'Đoàn Sở VH-TT Tỉnh',
    };

    setAthletes([...athletes, newA]);
    setName('');
    setNotice(`Đã đăng ký VĐV [${name}] thành công vào danh sách thi đấu giải!`);
  };

  return (
    <div className="p-6 md:p-10 space-y-6 max-w-6xl">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center border border-pink-500/20">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Đơn Vị Trực Thuộc (Sở / Xã / Đơn Vị)</h1>
          <p className="text-xs text-slate-400">
            Quản lý và đăng ký danh sách vận động viên (VĐV), đội thi đấu của đơn vị mình.
          </p>
        </div>
      </div>

      {notice && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form đăng ký VĐV mới */}
        {hasPermission('Permissions.Delegations.ManageAthletes') && (
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-pink-400" />
              <span>Đăng Ký VĐV / Đội Mới</span>
            </h2>

            <form onSubmit={handleAddAthlete} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Họ và tên VĐV:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn C"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Môn đăng ký thi đấu:</label>
                <select
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white cursor-pointer"
                >
                  <option value="Bóng Đá Nam">Bóng Đá Nam (11 người)</option>
                  <option value="Bóng Chuyền Nữ">Bóng Chuyền Nữ</option>
                  <option value="Cầu Lông Đơn Nam">Cầu Lông Đơn Nam</option>
                  <option value="Cầu Lông Đơn Nữ">Cầu Lông Đơn Nữ</option>
                  <option value="Điền Kinh 100m">Điền Kinh 100m</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Năm sinh:</label>
                <input
                  type="number"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl transition cursor-pointer"
              >
                Gửi Hồ Sơ Đăng Ký
              </button>
            </form>
          </div>
        )}

        {/* Danh sách VĐV đã đăng ký */}
        <div className={`p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 ${!hasPermission('Permissions.Delegations.ManageAthletes') ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-pink-400" />
              <span>Danh Sách VĐV Của Đơn Vị Đã Đăng Ký</span>
            </h3>
            <span className="text-xs text-slate-400">{athletes.length} VĐV</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Họ Và Tên</th>
                  <th className="pb-3 font-semibold">Môn Thi Đấu</th>
                  <th className="pb-3 font-semibold">Năm Sinh</th>
                  <th className="pb-3 font-semibold">Trạng Thái Hồ Sơ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {athletes.map((a) => (
                  <tr key={a.id}>
                    <td className="py-3 font-medium text-white">{a.name}</td>
                    <td className="py-3 text-pink-300">{a.sport}</td>
                    <td className="py-3 font-mono text-slate-400">{a.dob}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                        Đủ điều kiện thi đấu
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
