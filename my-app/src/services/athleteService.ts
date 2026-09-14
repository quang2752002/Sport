import { api } from '../lib/api';
import { PagedResult } from '../types/common';
import { Athlete, CreateUpdateAthlete } from '../types/athlete';

export const athleteService = {
  /** Lấy danh sách vận động viên có phân trang */
  getPaged: async (params?: {
    pageIndex?: number;
    pageSize?: number;
    tournamentSportId?: number;
    teamId?: number;
    keyword?: string;
  }) => {
    const res = await api.get<PagedResult<Athlete>>('/api/athletes/paged', { params });
    return res.data;
  },

  /** Lấy danh sách VĐV theo đội */
  getByTeam: async (teamId: number) => {
    const res = await api.get<Athlete[]>(`/api/athletes/by-team/${teamId}`);
    return res.data;
  },

  /** Lấy chi tiết vận động viên */
  getById: async (id: number) => {
    const res = await api.get<Athlete>(`/api/athletes/${id}`);
    return res.data;
  },

  /** Đăng ký vận động viên mới */
  create: async (data: CreateUpdateAthlete) => {
    const res = await api.post<Athlete>('/api/athletes', data);
    return res.data;
  },

  /** Cập nhật vận động viên */
  update: async (id: number, data: CreateUpdateAthlete) => {
    const res = await api.put<Athlete>(`/api/athletes/${id}`, data);
    return res.data;
  },

  /** Xóa vận động viên */
  delete: async (id: number) => {
    const res = await api.delete(`/api/athletes/${id}`);
    return res.data;
  },
};
