
import { VisitorData, AreaSettings, OccupancyLevel, AreaStatus, Threshold } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Function to get the latest visitor data
export const getVisitorData = async (): Promise<VisitorData[]> => {
  try {
    const { data, error } = await supabase
      .from('visitor_data')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching visitor data:', error);
    return [];
  }
};

// Function to get area settings
export const getAreaSettings = async (): Promise<AreaStatus[]> => {
  try {
    const { data, error } = await supabase
      .from('area_status')
      .select('*');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching area settings:', error);
    return [];
  }
};

// Function to get thresholds for a specific area
export const getThresholds = async (areaId: number): Promise<Threshold[]> => {
  try {
    const { data, error } = await supabase
      .from('thresholds')
      .select('*')
      .eq('setting_id', areaId)
      .order('upper_threshold', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching thresholds:', error);
    return [];
  }
};

// Function to update area settings
export const updateAreaSettings = async (areaId: number, settings: Partial<AreaSettings>): Promise<AreaSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('area_settings')
      .update(settings)
      .eq('id', areaId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating area settings:', error);
    return null;
  }
};

// Function to update threshold
export const updateThreshold = async (thresholdId: number, threshold: Partial<Threshold>): Promise<Threshold | null> => {
  try {
    const { data, error } = await supabase
      .from('thresholds')
      .update(threshold)
      .eq('id', thresholdId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating threshold:', error);
    return null;
  }
};

// Function to add visitor data
export const addVisitorData = async (visitorData: Omit<VisitorData, 'id' | 'timestamp'>): Promise<VisitorData | null> => {
  try {
    const { data, error } = await supabase
      .from('visitor_data')
      .insert(visitorData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding visitor data:', error);
    return null;
  }
};

// Function to determine occupancy level based on visitor count and thresholds
export const getOccupancyLevel = (
  visitorCount: number,
  thresholds: { low: number; medium: number }
): OccupancyLevel => {
  if (visitorCount <= thresholds.low) {
    return 'low';
  } else if (visitorCount <= thresholds.medium) {
    return 'medium';
  } else {
    return 'high';
  }
};

// Function to get color for occupancy level
export const getOccupancyColor = (level: OccupancyLevel): string => {
  switch (level) {
    case 'low':
      return '#4ade80'; // Green
    case 'medium':
      return '#facc15'; // Yellow
    case 'high':
      return '#ef4444'; // Red
    default:
      return '#e5e7eb'; // Gray (default)
  }
};

// Function to get the most recent timestamp from visitor data
export const getLatestTimestamp = (visitorData: VisitorData[]): string => {
  if (!visitorData.length) return new Date().toISOString();
  
  return visitorData.reduce((latest, current) => {
    return new Date(current.timestamp) > new Date(latest)
      ? current.timestamp
      : latest;
  }, visitorData[0].timestamp);
};

// Format date for display
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date);
};
