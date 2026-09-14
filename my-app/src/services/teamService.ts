import { api } from '../lib/api';
import { PagedResult } from '../types/common';
import { Team, CreateUpdateTeam } from '../types/team';

export const teamService = {
  /** Lấy danh sách đội thi đấu có phân trang */
  getPaged: async (params?: {
    pageIndex?: number;
    pageSize?: number;
    tournamentSportId?: number;
    groupId?: number;
    keyword?: string;
  }) => {
    const res = await api.get<PagedResult<Team>>('/api/teams/paged', { params });
    return res.data;
  },

  /** Lấy danh sách đội theo môn thuộc giải */
  getByTournamentSport: async (tournamentSportId: number) => {
    const res = await api.get<Team[]>(`/api/teams/by-tournament-sport/${tournamentSportId}`);
    return res.data;
  },

  /** Lấy chi tiết đội thi đấu */
  getById: async (id: number) => {
    const res = await api.get<Team>(`/api/teams/${id}`);
    return res.data;
  },

  /** Đăng ký đội mới */
  create: async (data: CreateUpdateTeam) => {
    const res = await api.post<Team>('/api/teams', data);
    return res.data;
  },

  /** Cập nhật đội thi đấu */
  update: async (id: number, data: CreateUpdateTeam) => {
    const res = await api.put<Team>(`/api/teams/${id}`, data);
    return res.data;
  },

  /** Xóa đội thi đấu */
  delete: async (id: number) => {
    const res = await api.delete(`/api/teams/${id}`);
    return res.data;
  },
};
