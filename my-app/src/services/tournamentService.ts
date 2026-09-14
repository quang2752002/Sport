import { api } from '../lib/api';
import { PagedResult } from '../types/common';
import { Tournament, CreateUpdateTournament } from '../types/tournament';

export const tournamentService = {
  /** Lấy danh sách giải đấu có phân trang, tìm kiếm và lọc trạng thái */
  getPaged: async (params?: { pageIndex?: number; pageSize?: number; keyword?: string; status?: string }) => {
    const res = await api.get<PagedResult<Tournament>>('/api/tournaments/paged', { params });
    return res.data;
  },

  /** Lấy tất cả giải đấu */
  getAll: async () => {
    const res = await api.get<Tournament[]>('/api/tournaments');
    return res.data;
  },

  /** Lấy chi tiết giải đấu theo ID */
  getById: async (id: number) => {
    const res = await api.get<Tournament>(`/api/tournaments/${id}`);
    return res.data;
  },

  /** Tạo giải đấu mới */
  create: async (data: CreateUpdateTournament) => {
    const res = await api.post<Tournament>('/api/tournaments', data);
    return res.data;
  },

  /** Cập nhật giải đấu */
  update: async (id: number, data: CreateUpdateTournament) => {
    const res = await api.put<Tournament>(`/api/tournaments/${id}`, data);
    return res.data;
  },

  /** Xóa giải đấu */
  delete: async (id: number) => {
    const res = await api.delete(`/api/tournaments/${id}`);
    return res.data;
  },
};
