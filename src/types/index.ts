
export interface VisitorData {
  id: number;
  timestamp: string;
  area_number: number;
  amount_visitors: number;
}

export interface AreaSettings {
  id: number;
  last_updated: string;
  area_name: string;
  highlight: string;
  capacity_usage: number;
  x: number;
  y: number;
  width: number;
  height: number;
  thresholds?: {
    low: number;
    medium: number;
  };
}

export type OccupancyLevel = 'low' | 'medium' | 'high';
