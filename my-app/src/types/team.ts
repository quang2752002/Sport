export interface Team {
  id: number;
  name: string;
  shortName?: string;
  logo?: string;
  coachName?: string;
  contactPhone?: string;
  delegationName?: string;
  tournamentSportId: number;
  sportName?: string;
  tournamentName?: string;
  groupId?: number;
  groupName?: string;
  created?: string;
}

export interface CreateUpdateTeam {
  name: string;
  shortName?: string;
  logo?: string;
  coachName?: string;
  contactPhone?: string;
  delegationName?: string;
  tournamentSportId: number;
  groupId?: number;
}
