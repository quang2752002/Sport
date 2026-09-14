export interface TournamentSport {
  id: number;
  tournamentId: number;
  tournamentName?: string;
  sportId: number;
  sportName?: string;
  created?: string;
}

export interface CreateTournamentSport {
  tournamentId: number;
  sportId: number;
}
