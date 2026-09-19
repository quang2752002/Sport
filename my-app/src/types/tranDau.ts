export interface PhanCongTrongTaiItem {
  id: number;
  tranDauId: number;
  trongTaiId: number;
  tenTrongTai?: string;
  soDienThoai?: string;
  capBac?: string;
  vaiTro?: string; // 'TrongTaiChinh' | 'TrongTaiPhu' | 'TrongTaiBan' | 'GiamSat'
  ghiChu?: string;
}

export interface AssignTrongTai {
  trongTaiId: number;
  vaiTro?: string;
  ghiChu?: string;
}

export interface ThanhPhanTranDauItem {
  id: number;
  tranDauId: number;
  dangKyThiDauId: number;
  tenDangKy?: string;
  tenDoi?: string;
  tenDonVi?: string;
  soLane?: number;
  viTri?: number; // 1: Đội 1 (Nhà), 2: Đội 2 (Khách)
  trangThai: string;
  ghiChu?: string;
}

export interface TranDau {
  id: number;
  giaiDauMonTheThaoId?: number;
  noiDungThiDauId?: number;
  tenNoiDung?: string;
  giaiDauId?: number;
  tenGiaiDau?: string;
  monTheThaoId?: number;
  tenMonTheThao?: string;
  vongDauId: number;
  tenVongDau?: string;
  bangDauId?: number;
  tenBangDau?: string;
  sanDauId?: number;
  tenSanDau?: string;
  tenCumSan?: string;
  soTran: number;
  tenTran?: string;
  thoiGianDuKien?: string;
  thoiGianBatDau?: string;
  thoiGianKetThuc?: string;
  trangThai: string; // 'ChuaDau' | 'DangDienRa' | 'DaKetThuc' | 'Hoan' | 'Huy'
  ghiChu?: string;

  doi1DangKyId?: number;
  tenDoi1?: string;
  donViDoi1?: string;

  doi2DangKyId?: number;
  tenDoi2?: string;
  donViDoi2?: string;

  thanhPhanTranDaus?: ThanhPhanTranDauItem[];
  danhSachTrongTai?: PhanCongTrongTaiItem[];

  created?: string;
  lastModified?: string;
}

export interface CreateUpdateTranDau {
  giaiDauMonTheThaoId?: number;
  noiDungThiDauId?: number;
  vongDauId: number;
  bangDauId?: number | null;
  sanDauId?: number | null;
  soTran: number;
  tenTran?: string;
  thoiGianDuKien?: string;
  thoiGianBatDau?: string;
  thoiGianKetThuc?: string;
  trangThai?: string;
  ghiChu?: string;
  doi1DangKyId?: number;
  doi2DangKyId?: number;
  danhSachTrongTai?: AssignTrongTai[];
}

export interface AutoScheduleRequest {
  giaiDauMonTheThaoId?: number;
  noiDungThiDauId?: number;
  ngayBatDau: string;
  gioBatDauMoiNgay: string;
  gioKetThucMoiNgay: string;
  thoiLuongTranPhut: number;
  nghiGiuaTranPhut: number;
  sanDauIds: number[];
  trongTaiIds: number[];
  soTrongTaiMoiTran: number;
  taoBangDauNeuChuaCo: boolean;
  soDoiMoiBang: number;
  xoaLichCu: boolean;
  tranhTrungLichVdv?: boolean;
  soHiepDau?: number;
  thoiGianMoiHiepPhut?: number;
  thoiGianNghiToiThieuVdvPhut?: number;
  khoangCachGiuaCacVongGio?: number;
  canBangTaiTrongTai?: boolean;
  canBangTaiSanDau?: boolean;
  soDoiMoiBangVaoVongTrong?: number;
  soDoiThu3TotNhat?: number;
}

export interface AutoScheduleResult {
  success: boolean;
  totalMatchesCreated: number;
  message: string;
  matches: TranDau[];
  warnings?: string[];
  thongKeSanDau?: Record<string, number>;
  thongKeTrongTai?: Record<string, number>;
  soNgayThiDau?: number;
}

export interface ConflictCheckRequest {
  tranDauId?: number;
  sanDauId?: number;
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  trongTaiIds?: number[];
  dangKyThiDauIds?: number[];
}

export interface ConflictDetail {
  loaiXungDot: 'VanDongVien' | 'SanDau' | 'TrongTai' | 'Doi';
  thongBao: string;
  vanDongVienId?: number;
  tenVanDongVien?: string;
  maVanDongVien?: string;
  tenDoiHienTai?: string;
  tranDauBiTrungId?: number;
  tenTranBiTrung?: string;
  tenMonTheThao?: string;
  tenNoiDung?: string;
  tenSanDau?: string;
  thoiGianBatDau?: string;
  thoiGianKetThuc?: string;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflicts: string[];
  chiTietXungDot?: ConflictDetail[];
}

export interface TournamentConflictReport {
  hasConflict: boolean;
  giaiDauId: number;
  tenGiaiDau?: string;
  totalMatchesChecked: number;
  totalConflicts: number;
  conflicts: string[];
  chiTietXungDot?: ConflictDetail[];
}
