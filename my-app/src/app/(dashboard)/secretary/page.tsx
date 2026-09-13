'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { FileCheck, FileText, Download, CheckCircle, Search, Filter } from 'lucide-react';

export default function SecretaryPage() {
  const { hasPermission } = useAuth();
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleExport = (type: 'PDF' | 'Excel') => {
    setExportNotice(`Đã xuất biên bản kết quả thi đấu định dạng ${type} thành công!`);
  };

  return (
    <div className="p-6 md:p-10 space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Thư Ký Giải Đấu</h1>
            <p className="text-xs text-slate-400">
              Theo dõi chi tiết nội dung từng môn, kiểm tra biên bản thi đấu và xuất biên bản kết quả (PDF/Excel).
            </p>
          </div>
        </div>

        {hasPermission('Permissions.Results.ExportReport') && (
          <div className="flex gap-2 self-start">
            <button
              onClick={() => handleExport('PDF')}
              className="px-3.5 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất PDF</span>
            </button>
            <button
              onClick={() => handleExport('Excel')}
              className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất Excel</span>
            </button>
          </div>
        )}
      </div>

      {exportNotice && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Bảng danh sách biên bản thi đấu */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Danh Sách Biên Bản Thi Đấu Cần Kiểm Tra</h2>
          <span className="text-xs text-slate-400">Tổng cộng: 3 biên bản</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Mã BB</th>
                <th className="pb-3 font-semibold">Môn Thi Đấu</th>
                <th className="pb-3 font-semibold">Cặp Đấu</th>
                <th className="pb-3 font-semibold">Tỷ Số</th>
                <th className="pb-3 font-semibold">Trạng Thái Biên Bản</th>
                <th className="pb-3 font-semibold text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              <tr>
                <td className="py-3.5 font-mono text-slate-400">#BB-091</td>
                <td className="py-3.5 font-medium">Bóng Đá Nam 11 Người</td>
                <td className="py-3.5">Sở GD-ĐT vs Sở VH-TT</td>
                <td className="py-3.5 font-mono font-bold text-amber-400">2 - 1</td>
                <td className="py-3.5">
                  <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    Chờ Thư ký duyệt
                  </span>
                </td>
                <td className="py-3.5 text-right">
                  <button
                    onClick={() => alert('Xem chi tiết biên bản trận đấu #BB-091')}
                    className="text-cyan-400 hover:underline"
                  >
                    Kiểm tra
                  </button>
                </td>
              </tr>
              <tr>
                <td className="py-3.5 font-mono text-slate-400">#BB-090</td>
                <td className="py-3.5 font-medium">Cầu Lông Đơn Nam</td>
                <td className="py-3.5">Nguyễn Văn A vs Trần Văn B</td>
                <td className="py-3.5 font-mono font-bold text-emerald-400">2 - 0</td>
                <td className="py-3.5">
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    Đã Ký Duyệt
                  </span>
                </td>
                <td className="py-3.5 text-right">
                  <button
                    onClick={() => handleExport('PDF')}
                    className="text-slate-400 hover:text-white"
                  >
                    In bản in
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
