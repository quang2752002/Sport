export interface Tournament {
  id: number;
  name: string;
  code?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  status?: string;
  isActive: boolean;
  created?: string;
}

export interface CreateUpdateTournament {
  name: string;
  code?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  status?: string;
  isActive: boolean;
}
