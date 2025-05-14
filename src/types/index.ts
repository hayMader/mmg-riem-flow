
export interface VisitorData {
  id: string;
  timestamp: string;
  area_id: number;
  amount_visitors: number;
}

export interface AreaSettings {
  id: number;
  area_name: string;
  last_updated: string;
  capacity_usage: number;
  x: number;
  y: number;
  width: number;
  height: number;
  highlight: string | null;
}

export interface Threshold {
  id: number;
  setting_id: number;
  upper_threshold: number;
  color: string;
}

export interface AreaStatus {
  area_number: number;
  area_name: string;
  capacity_usage: number;
  x: number;
  y: number;
  width: number;
  height: number;
  highlight: string | null;
  amount_visitors: number;
  thresholds: {
    low: number;
    medium: number;
  };
}

export type OccupancyLevel = 'low' | 'medium' | 'high';
