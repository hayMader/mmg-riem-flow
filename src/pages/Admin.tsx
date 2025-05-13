
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ExhibitionMap from '@/components/ExhibitionMap';
import AreaSettingsForm from '@/components/AreaSettingsForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/use-toast';
import { getAreaSettings, getVisitorData } from '@/utils/api';
import { AreaSettings, VisitorData } from '@/types';

const Admin = () => {
  const [areas, setAreas] = useState<AreaSettings[]>([]);
  const [visitorData, setVisitorData] = useState<VisitorData[]>([]);
  const [selectedArea, setSelectedArea] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [areaData, visitors] = await Promise.all([
          getAreaSettings(),
          getVisitorData(),
        ]);
        
        setAreas(areaData);
        setVisitorData(visitors);
        if (areaData.length > 0) {
          setSelectedArea(areaData[0].id);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast({
          title: 'Fehler',
          description: 'Die Einstellungen konnten nicht geladen werden.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);

  const handleAreaUpdate = (updatedArea: AreaSettings) => {
    setAreas(areas.map(area => 
      area.id === updatedArea.id ? updatedArea : area
    ));
  };

  const handleDataUpdate = (newVisitorData: VisitorData[], newSettings: AreaSettings[]) => {
    setVisitorData(newVisitorData);
    setAreas(newSettings);
  };

  // Group areas by type (halls, parking, etc.)
  const halls = areas.filter(area => 
    area.area_name.startsWith('A') || 
    area.area_name.startsWith('B') || 
    area.area_name.startsWith('C')
  );
  
  const parking = areas.filter(area => 
    area.area_name.startsWith('P')
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header 
        title="Management Console" 
        isAdmin={true} 
      />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Tabs defaultValue="map" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto mb-4">
            <TabsTrigger value="map">Kartenübersicht</TabsTrigger>
            <TabsTrigger value="settings">Bereichseinstellungen</TabsTrigger>
          </TabsList>
          
          <TabsContent value="map">
            <ExhibitionMap 
              autoRefresh={true} 
              refreshInterval={60000}
              onDataUpdate={handleDataUpdate} 
            />
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-sm h-fit">
                <h3 className="font-medium text-lg mb-2">Bereiche</h3>
                <Separator className="mb-4" />
                
                <ScrollArea className="h-[500px] pr-3">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Hallen</h4>
                      <div className="flex flex-wrap gap-2">
                        {halls.map(area => (
                          <Button
                            key={area.id}
                            variant={selectedArea === area.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedArea(area.id)}
                          >
                            {area.area_name}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Parkplätze</h4>
                      <div className="flex flex-wrap gap-2">
                        {parking.map(area => (
                          <Button
                            key={area.id}
                            variant={selectedArea === area.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedArea(area.id)}
                          >
                            {area.area_name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>
              
              <div className="lg:col-span-2">
                {selectedArea !== null && (
                  <AreaSettingsForm
                    area={areas.find(a => a.id === selectedArea)!}
                    onUpdate={handleAreaUpdate}
                  />
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="bg-white border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} MMG-Messegelände München Riem - Management System</p>
        </div>
      </footer>
    </div>
  );
};

export default Admin;
