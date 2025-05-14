
import React, { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { AreaStatus } from '@/types';
import { getAreaSettings, getOccupancyLevel, getOccupancyColor } from '@/utils/api';
import { RefreshCw } from 'lucide-react';

interface ExhibitionMapProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
  onDataUpdate?: (areaStatus: AreaStatus[]) => void;
  onAreaSelect?: (areaNumber: number) => void;
  selectedArea?: number | null;
}

const ExhibitionMap: React.FC<ExhibitionMapProps> = ({ 
  autoRefresh = true, 
  refreshInterval = 60000, // 1 minute by default
  onDataUpdate,
  onAreaSelect,
  selectedArea = null
}) => {
  const [areaStatus, setAreaStatus] = useState<AreaStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Function to fetch the latest data
  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      const newAreaStatus = await getAreaSettings();
      
      setAreaStatus(newAreaStatus);
      setLastRefreshed(new Date());
      
      if (onDataUpdate) {
        onDataUpdate(newAreaStatus);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Fehler',
        description: 'Die Daten konnten nicht aktualisiert werden.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Set up auto refresh
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Manual refresh handler
  const handleRefresh = () => {
    fetchData();
  };
  
  // Handle area click
  const handleAreaClick = (areaNumber: number) => {
    if (onAreaSelect) {
      onAreaSelect(areaNumber);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <RefreshCw className="h-10 w-10 text-primary animate-spin" />
        <p className="mt-4 text-lg text-muted-foreground">Daten werden geladen...</p>
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-lg overflow-hidden">
      <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="bg-white p-2 rounded-full shadow hover:bg-gray-50 transition-colors"
          aria-label="Aktualisieren"
        >
          <RefreshCw 
            className={`h-5 w-5 text-primary ${isRefreshing ? 'animate-spin' : ''}`}
          />
        </button>
      </div>
      
      {/* Map container with the exhibition layout */}
      <div className="relative w-full h-[500px] overflow-auto bg-occupancy-bg p-4">
        <div className="relative w-full h-full">
          {/* Floor plan background image */}
          <div className="absolute inset-0 bg-gray-100">
            {/* Optional: Display a real floor plan image */}
            {/* <img src="/map-background.png" alt="MMG Messegelände" className="w-full h-full object-contain" /> */}
          </div>
          
          {/* Areas overlays */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 800">
            {/* Exhibition halls */}
            {areaStatus.map((area) => {
              const visitorCount = area.amount_visitors;
              const thresholds = area.thresholds;
              const occupancyLevel = getOccupancyLevel(visitorCount, thresholds);
              const fillColor = getOccupancyColor(occupancyLevel);
              const isSelected = selectedArea === area.area_number;
              
              return (
                <g key={area.area_number}>
                  <rect
                    x={area.x}
                    y={area.y}
                    width={area.width}
                    height={area.height}
                    fill={area.highlight || fillColor}
                    fillOpacity={0.7}
                    stroke={isSelected ? "#000" : "#667080"}
                    strokeWidth={isSelected ? 2 : 1}
                    className="exhibition-hall cursor-pointer"
                    onClick={() => handleAreaClick(area.area_number)}
                  />
                  <text
                    x={area.x + area.width / 2}
                    y={area.y + area.height / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#1e293b"
                    fontWeight="bold"
                    fontSize="14"
                  >
                    {area.area_name}
                  </text>
                  <text
                    x={area.x + area.width / 2}
                    y={area.y + area.height / 2 + 20}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#1e293b"
                    fontSize="12"
                  >
                    {visitorCount}
                  </text>
                </g>
              );
            })}
            
            {/* Add main labels and routes */}
            <text x="600" y="30" textAnchor="middle" fill="#0f172a" fontWeight="bold" fontSize="16">Paul Henri Spaak Straße</text>
            <text x="600" y="770" textAnchor="middle" fill="#0f172a" fontWeight="bold" fontSize="16">Willy-Brandt-Allee</text>
            <text x="120" y="400" textAnchor="middle" fill="#0f172a" fontWeight="bold" fontSize="16" transform="rotate(90,120,400)">Olof-Palme-Straße</text>
            <text x="1080" y="400" textAnchor="middle" fill="#0f172a" fontWeight="bold" fontSize="16" transform="rotate(270,1080,400)">Am Messesee</text>
          </svg>
        </div>
      </div>
      
      {/* Legend */}
      <div className="p-4 flex flex-wrap gap-4 justify-center border-t">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-occupancy-low"></div>
          <span className="text-sm">Niedriger Besucherandrang</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-occupancy-medium"></div>
          <span className="text-sm">Mittlerer Besucherandrang</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-occupancy-high"></div>
          <span className="text-sm">Hoher Besucherandrang</span>
        </div>
      </div>
    </div>
  );
};

export default ExhibitionMap;
