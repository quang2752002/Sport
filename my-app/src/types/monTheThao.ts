export interface MonTheThao {
  id: number;
  danhMucId: number;
  tenDanhMuc?: string;
  ma: string;
  ten: string;
  moTa?: string;
  laMonDongDoi: boolean;
  trangThai: boolean;
  created?: string;
  lastModified?: string;
}

export interface CreateUpdateMonTheThao {
  danhMucId: number;
  ma: string;
  ten: string;
  moTa?: string;
  laMonDongDoi: boolean;
  trangThai: boolean;
}
