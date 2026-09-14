export interface MatchResult {
  id: number;
  matchId: number;
  homeScore: number;
  awayScore: number;
  homePenaltyScore?: number;
  awayPenaltyScore?: number;
  winningTeamId?: number;
  winningTeamName?: string;
  isDraw: boolean;
  note?: string;
  detailJson?: string;
  created?: string;
}

export interface Match {
  id: number;
  matchCode?: string;
  round?: string;
  scheduledStartTime?: string;
  actualStartTime?: string;
  endTime?: string;
  location?: string;
  status: string;
  tournamentSportId: number;
  sportName?: string;
  tournamentName?: string;
  groupId?: number;
  groupName?: string;
  homeTeamId?: number;
  homeTeamName?: string;
  awayTeamId?: number;
  awayTeamName?: string;
  result?: MatchResult;
  created?: string;
}

export interface CreateUpdateMatch {
  matchCode?: string;
  round?: string;
  scheduledStartTime?: string;
  actualStartTime?: string;
  endTime?: string;
  location?: string;
  status?: string;
  tournamentSportId: number;
  groupId?: number;
  homeTeamId?: number;
  awayTeamId?: number;
}

export interface CreateUpdateMatchResult {
  matchId: number;
  homeScore: number;
  awayScore: number;
  homePenaltyScore?: number;
  awayPenaltyScore?: number;
  winningTeamId?: number;
  isDraw?: boolean;
  note?: string;
  detailJson?: string;
}
