import { api } from '../lib/api';
import { PagedResult } from '../types/common';
import { Match, CreateUpdateMatch, MatchResult, CreateUpdateMatchResult } from '../types/match';

export const matchService = {
  /** Lấy danh sách trận đấu có phân trang */
  getPaged: async (params?: {
    pageIndex?: number;
    pageSize?: number;
    tournamentSportId?: number;
    groupId?: number;
    status?: string;
  }) => {
    const res = await api.get<PagedResult<Match>>('/api/matches/paged', { params });
    return res.data;
  },

  /** Lấy danh sách trận đấu theo môn thuộc giải */
  getByTournamentSport: async (tournamentSportId: number) => {
    const res = await api.get<Match[]>(`/api/matches/by-tournament-sport/${tournamentSportId}`);
    return res.data;
  },

  /** Lấy chi tiết trận đấu */
  getById: async (id: number) => {
    const res = await api.get<Match>(`/api/matches/${id}`);
    return res.data;
  },

  /** Tạo lịch trận đấu mới */
  create: async (data: CreateUpdateMatch) => {
    const res = await api.post<Match>('/api/matches', data);
    return res.data;
  },

  /** Cập nhật lịch trận đấu */
  update: async (id: number, data: CreateUpdateMatch) => {
    const res = await api.put<Match>(`/api/matches/${id}`, data);
    return res.data;
  },

  /** Xóa trận đấu */
  delete: async (id: number) => {
    const res = await api.delete(`/api/matches/${id}`);
    return res.data;
  },

  /** Lưu / Cập nhật kết quả tỉ số trận đấu */
  saveResult: async (data: CreateUpdateMatchResult) => {
    const res = await api.post<MatchResult>('/api/matches/result', data);
    return res.data;
  },
};
