
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ExhibitionMap from '@/components/ExhibitionMap';
import { formatDateTime } from '@/utils/api';
import { VisitorData, AreaSettings } from '@/types';
import { getLatestTimestamp } from '@/utils/api';

const Index = () => {
  const [latestTimestamp, setLatestTimestamp] = useState<string>('');
  
  const handleDataUpdate = (visitorData: VisitorData[], settings: AreaSettings[]) => {
    const timestamp = getLatestTimestamp(visitorData);
    setLatestTimestamp(formatDateTime(timestamp));
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header 
        title="Besucherfüllstand" 
        timestamp={latestTimestamp} 
      />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <ExhibitionMap 
          autoRefresh={true}
          refreshInterval={60000} // 60 seconds
          onDataUpdate={handleDataUpdate}
        />
      </main>
      
      <footer className="bg-white border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} MMG-Messegelände München Riem</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
