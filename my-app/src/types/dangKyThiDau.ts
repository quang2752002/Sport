export interface DangKyThiDau {
  id: number;
  noiDungThiDauId: number;
  tenNoiDung?: string;
  giaiDauId?: number;
  tenGiaiDau?: string;
  monTheThaoId?: number;
  tenMonTheThao?: string;
  doiId?: number;
  tenDoi?: string;
  donViId?: number;
  tenDonVi?: string;
  soDangKy: string;
  tenDangKy?: string;
  trangThai: string;
  ngayDangKy: string;
  ghiChu?: string;
  soVdv: number;
  vanDongVienIds?: number[];
  vanDongVienNames?: string[];
  created?: string;
  lastModified?: string;
}

export interface CreateUpdateDangKyThiDau {
  noiDungThiDauId: number;
  doiId?: number;
  soDangKy?: string;
  tenDangKy?: string;
  trangThai?: string;
  ngayDangKy?: string;
  ghiChu?: string;
  vanDongVienIds?: number[];
}
