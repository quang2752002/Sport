export interface Category {
  id: number;
  name: string;
  description?: string;
  slug?: string;
  isActive: boolean;
  sportsCount?: number;
  created?: string;
}

export interface CreateUpdateCategory {
  name: string;
  description?: string;
  slug?: string;
  isActive?: boolean;
}
