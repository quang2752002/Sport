import { api } from '../lib/api';
import { NoiDungThiDau } from '../types/noiDungThiDau';

export const noiDungThiDauService = {
  /** Lấy danh sách nội dung thi đấu, lọc theo giải đấu hoặc GiaiDauMonTheThaoId */
  getAll: async (params?: {
    giaiDauId?: number;
    giaiDauMonTheThaoId?: number;
  }) => {
    const res = await api.get<NoiDungThiDau[]>('/api/noidungthidau', { params });
    return res.data;
  },

  getById: async (id: number) => {
    const res = await api.get<NoiDungThiDau>(`/api/noidungthidau/${id}`);
    return res.data;
  },
};
