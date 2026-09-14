import { api } from '../lib/api';
import { TournamentSport, CreateTournamentSport } from '../types/tournamentSport';

export const tournamentSportService = {
  /** Lấy danh sách môn thi đấu thuộc giải đấu */
  getByTournamentId: async (tournamentId: number) => {
    const res = await api.get<TournamentSport[]>(`/api/tournamentsports/tournament/${tournamentId}`);
    return res.data;
  },

  /** Lấy chi tiết môn thi trong giải đấu */
  getById: async (id: number) => {
    const res = await api.get<TournamentSport>(`/api/tournamentsports/${id}`);
    return res.data;
  },

  /** Gán môn thể thao vào giải đấu */
  addSportToTournament: async (data: CreateTournamentSport) => {
    const res = await api.post<TournamentSport>('/api/tournamentsports', data);
    return res.data;
  },

  /** Xóa môn thể thao khỏi giải đấu */
  removeSportFromTournament: async (id: number) => {
    const res = await api.delete(`/api/tournamentsports/${id}`);
    return res.data;
  },
};
