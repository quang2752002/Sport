export interface Group {
  id: number;
  name: string;
  description?: string;
  tournamentSportId: number;
  sportName?: string;
  tournamentName?: string;
  created?: string;
}

export interface CreateUpdateGroup {
  name: string;
  description?: string;
  tournamentSportId: number;
}
