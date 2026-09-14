export interface Sport {
  id: number;
  name: string;
  description?: string;
  slug?: string;
  isActive: boolean;
  matchDurationMinutes?: number;
  numberOfPeriods?: number;
  periodDurationMinutes?: number;
  breakDurationMinutes?: number;
  extraTimeDurationMinutes?: number;
  categoryId: number;
  categoryName?: string;
  created?: string;
}

export interface CreateUpdateSport {
  name: string;
  description?: string;
  slug?: string;
  isActive: boolean;
  matchDurationMinutes?: number;
  numberOfPeriods?: number;
  periodDurationMinutes?: number;
  breakDurationMinutes?: number;
  extraTimeDurationMinutes?: number;
  categoryId: number;
}
