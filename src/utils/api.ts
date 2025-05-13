
import { VisitorData, AreaSettings, OccupancyLevel } from "../types";

// Mock data for visitor data
const mockVisitorData: VisitorData[] = Array.from({ length: 27 }, (_, i) => ({
  id: i + 1,
  timestamp: new Date().toISOString(),
  area_number: i + 1,
  amount_visitors: Math.floor(Math.random() * 1000),
}));

// Mock data for area settings
const mockAreaSettings: AreaSettings[] = [
  // Hall A Series
  ...Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    last_updated: new Date().toISOString(),
    area_name: `A${i + 1}`,
    highlight: "",
    capacity_usage: Math.floor(Math.random() * 200) + 400,
    x: 100 + i * 120,
    y: 600,
    width: 100,
    height: 140,
    thresholds: {
      low: 100,
      medium: 300,
    },
  })),
  
  // Hall B Series
  ...Array.from({ length: 7 }, (_, i) => ({
    id: 7 + i,
    last_updated: new Date().toISOString(),
    area_name: i === 0 ? "B0" : `B${i}`,
    highlight: "",
    capacity_usage: Math.floor(Math.random() * 200) + 400,
    x: i === 0 ? 50 : 100 + (i - 1) * 120,
    y: i === 0 ? 480 : 450,
    width: i === 0 ? 80 : 100,
    height: i === 0 ? 80 : 120,
    thresholds: {
      low: 100,
      medium: 300,
    },
  })),

  // Hall C Series
  ...Array.from({ length: 6 }, (_, i) => ({
    id: 14 + i,
    last_updated: new Date().toISOString(),
    area_name: `C${i + 1}`,
    highlight: "",
    capacity_usage: Math.floor(Math.random() * 200) + 400,
    x: 100 + i * 120,
    y: 320,
    width: 100,
    height: 120,
    thresholds: {
      low: 100,
      medium: 300,
    },
  })),

  // Parking Areas
  ...Array.from({ length: 8 }, (_, i) => ({
    id: 20 + i,
    last_updated: new Date().toISOString(),
    area_name: `P${i + 1}`,
    highlight: "",
    capacity_usage: Math.floor(Math.random() * 200) + 100,
    x: i < 3 ? 200 + i * 180 : 680 + (i - 3) * 100,
    y: i < 3 ? 180 : 550,
    width: 80,
    height: 60,
    thresholds: {
      low: 50,
      medium: 150,
    },
  })),
];

// Function to get the latest visitor data
export const getVisitorData = async (): Promise<VisitorData[]> => {
  // In a real app, this would be a fetch to your API
  // return await fetch('/api/visitors').then(res => res.json());
  
  // For now, return mock data with a timestamp within the last hour
  const now = new Date();
  return mockVisitorData.map(data => ({
    ...data,
    // Random timestamp within the last hour
    timestamp: new Date(
      now.getTime() - Math.floor(Math.random() * 60) * 60000
    ).toISOString(),
    // Random visitor count between 0 and 1000
    amount_visitors: Math.floor(Math.random() * 1000),
  }));
};

// Function to get area settings
export const getAreaSettings = async (): Promise<AreaSettings[]> => {
  // In a real app, this would be a fetch to your API
  // return await fetch('/api/settings').then(res => res.json());
  
  // For now, return mock data
  return mockAreaSettings;
};

// Function to update area settings
export const updateAreaSettings = async (areaId: number, settings: Partial<AreaSettings>): Promise<AreaSettings> => {
  // In a real app, this would be a POST/PUT to your API
  // return await fetch(`/api/settings/${areaId}`, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(settings)
  // }).then(res => res.json());
  
  // For now, update the mock data and return it
  const areaIndex = mockAreaSettings.findIndex(area => area.id === areaId);
  if (areaIndex === -1) {
    throw new Error(`Area with id ${areaId} not found`);
  }
  
  mockAreaSettings[areaIndex] = {
    ...mockAreaSettings[areaIndex],
    ...settings,
    last_updated: new Date().toISOString(),
  };
  
  return mockAreaSettings[areaIndex];
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
