import { api } from '../lib/api';
import { PagedResult } from '../types/common';
import { Sport, CreateUpdateSport } from '../types/sport';

export const sportService = {
  /** Lấy danh sách môn thể thao có phân trang */
  getPaged: async (params?: { pageIndex?: number; pageSize?: number; keyword?: string; categoryId?: number }) => {
    const res = await api.get<PagedResult<Sport>>('/api/sports/paged', { params });
    return res.data;
  },

  /** Lấy tất cả môn thể thao */
  getAll: async () => {
    const res = await api.get<Sport[]>('/api/sports');
    return res.data;
  },

  /** Lấy chi tiết môn thể thao */
  getById: async (id: number) => {
    const res = await api.get<Sport>(`/api/sports/${id}`);
    return res.data;
  },

  /** Thêm mới môn thể thao */
  create: async (data: CreateUpdateSport) => {
    const res = await api.post<Sport>('/api/sports', data);
    return res.data;
  },

  /** Cập nhật môn thể thao */
  update: async (id: number, data: CreateUpdateSport) => {
    const res = await api.put<Sport>(`/api/sports/${id}`, data);
    return res.data;
  },

  /** Xóa môn thể thao */
  delete: async (id: number) => {
    const res = await api.delete(`/api/sports/${id}`);
    return res.data;
  },
};
