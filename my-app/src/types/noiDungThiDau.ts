export interface NoiDungThiDau {
  id: number;
  giaiDauMonTheThaoId: number;
  tenMonTheThao?: string;
  tenGiaiDau?: string;
  ma: string;
  ten: string;
  gioiTinh: string;        // 'Nam' | 'Nu' | 'HonHop'
  loaiThiDau: string;      // 'CaNhan' | 'DongDoi'
  soLuongToiThieu?: number;
  soLuongToiDa?: number;
  moTa?: string;
  trangThai: boolean;
  soDangKy?: number;
}
