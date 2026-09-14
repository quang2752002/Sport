export interface Athlete {
  id: number;
  fullName: string;
  athleteCode?: string;
  dateOfBirth?: string;
  gender?: string;
  avatar?: string;
  phoneNumber?: string;
  identityCardNumber?: string;
  jerseyNumber?: number;
  position?: string;
  tournamentSportId: number;
  sportName?: string;
  tournamentName?: string;
  teamId?: number;
  teamName?: string;
  created?: string;
}

export interface CreateUpdateAthlete {
  fullName: string;
  athleteCode?: string;
  dateOfBirth?: string;
  gender?: string;
  avatar?: string;
  phoneNumber?: string;
  identityCardNumber?: string;
  jerseyNumber?: number;
  position?: string;
  tournamentSportId: number;
  teamId?: number;
}
