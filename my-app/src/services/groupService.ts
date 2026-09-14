import { api } from '../lib/api';
import { PagedResult } from '../types/common';
import { Group, CreateUpdateGroup } from '../types/group';

export const groupService = {
  /** Lấy danh sách bảng đấu có phân trang */
  getPaged: async (params?: { pageIndex?: number; pageSize?: number; tournamentSportId?: number; keyword?: string }) => {
    const res = await api.get<PagedResult<Group>>('/api/groups/paged', { params });
    return res.data;
  },

  /** Lấy danh sách bảng đấu theo môn thuộc giải */
  getByTournamentSport: async (tournamentSportId: number) => {
    const res = await api.get<Group[]>(`/api/groups/by-tournament-sport/${tournamentSportId}`);
    return res.data;
  },

  /** Lấy chi tiết bảng đấu */
  getById: async (id: number) => {
    const res = await api.get<Group>(`/api/groups/${id}`);
    return res.data;
  },

  /** Tạo bảng đấu mới */
  create: async (data: CreateUpdateGroup) => {
    const res = await api.post<Group>('/api/groups', data);
    return res.data;
  },

  /** Cập nhật bảng đấu */
  update: async (id: number, data: CreateUpdateGroup) => {
    const res = await api.put<Group>(`/api/groups/${id}`, data);
    return res.data;
  },

  /** Xóa bảng đấu */
  delete: async (id: number) => {
    const res = await api.delete(`/api/groups/${id}`);
    return res.data;
  },
};
