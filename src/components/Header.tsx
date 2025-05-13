
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface HeaderProps {
  title: string;
  timestamp?: string;
  isAdmin?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, timestamp, isAdmin = false }) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-primary">{title}</h1>
          {timestamp && (
            <div className="hidden sm:block text-muted-foreground">
              <span className="font-medium">Aktualisiert: </span>
              <span>{timestamp}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <Button asChild variant="outline" size="sm">
              <Link to="/">Besucheransicht</Link>
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link to="/admin">Management</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
