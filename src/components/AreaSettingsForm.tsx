
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { AreaStatus, Threshold } from '@/types';
import { updateAreaSettings, updateThreshold, getThresholds } from '@/utils/api';

interface AreaSettingsFormProps {
  area: AreaStatus;
  onUpdate: (updatedArea: AreaStatus) => void;
}

const AreaSettingsForm: React.FC<AreaSettingsFormProps> = ({ area, onUpdate }) => {
  const [formData, setFormData] = useState<Partial<AreaStatus>>({
    area_name: area.area_name,
    highlight: area.highlight || '',
    capacity_usage: area.capacity_usage,
    x: area.x,
    y: area.y,
    width: area.width,
    height: area.height,
    thresholds: area.thresholds || { low: 100, medium: 300 },
  });
  
  const [thresholds, setThresholds] = useState<Threshold[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchThresholds = async () => {
      setIsLoading(true);
      const data = await getThresholds(area.area_number);
      setThresholds(data);
      setIsLoading(false);
    };

    fetchThresholds();
  }, [area.area_number]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof AreaStatus | 'thresholdLow' | 'thresholdMedium'
  ) => {
    const value = e.target.value;
    
    if (field === 'thresholdLow' || field === 'thresholdMedium') {
      setFormData(prev => ({
        ...prev,
        thresholds: {
          ...prev.thresholds!,
          [field === 'thresholdLow' ? 'low' : 'medium']: parseInt(value) || 0,
        },
      }));
    } else if (
      field === 'x' || 
      field === 'y' || 
      field === 'width' || 
      field === 'height' ||
      field === 'capacity_usage'
    ) {
      setFormData(prev => ({
        ...prev,
        [field]: parseInt(value) || 0,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Update the area settings
      const areaData = {
        area_name: formData.area_name,
        highlight: formData.highlight || null,
        capacity_usage: formData.capacity_usage,
        x: formData.x,
        y: formData.y,
        width: formData.width,
        height: formData.height,
      };
      
      const updatedArea = await updateAreaSettings(area.area_number, areaData);
      
      // Update thresholds if they were changed
      if (thresholds.length >= 2) {
        // Assuming first threshold is 'low' and second is 'medium'
        if (formData.thresholds?.low !== area.thresholds.low) {
          await updateThreshold(thresholds[0].id, {
            upper_threshold: formData.thresholds?.low || 0
          });
        }
        
        if (formData.thresholds?.medium !== area.thresholds.medium) {
          await updateThreshold(thresholds[1].id, {
            upper_threshold: formData.thresholds?.medium || 0
          });
        }
      }
      
      if (updatedArea) {
        // Create an updated area status object that combines the updated area and existing thresholds
        const updatedAreaStatus: AreaStatus = {
          ...area,
          ...updatedArea,
          thresholds: formData.thresholds || area.thresholds
        };
        
        onUpdate(updatedAreaStatus);
        
        toast({
          title: 'Einstellungen aktualisiert',
          description: `Die Einstellungen für ${area.area_name} wurden erfolgreich aktualisiert.`,
        });
      }
    } catch (error) {
      console.error('Error updating area settings:', error);
      toast({
        title: 'Fehler',
        description: 'Die Einstellungen konnten nicht aktualisiert werden.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Einstellungen werden geladen...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{area.area_name} Einstellungen</CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`area-name-${area.area_number}`}>Bereichsname</Label>
              <Input
                id={`area-name-${area.area_number}`}
                value={formData.area_name}
                onChange={(e) => handleChange(e, 'area_name')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`highlight-${area.area_number}`}>Highlight-Farbe (optional)</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id={`highlight-${area.area_number}`}
                  type="text"
                  value={formData.highlight || ''}
                  onChange={(e) => handleChange(e, 'highlight')}
                  placeholder="#RRGGBB"
                />
                <Input
                  type="color"
                  value={formData.highlight || '#ffffff'}
                  onChange={(e) => handleChange(e, 'highlight')}
                  className="w-12 p-0 h-10"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`threshold-low-${area.area_number}`}>Schwellwert Niedrig</Label>
              <Input
                id={`threshold-low-${area.area_number}`}
                type="number"
                value={formData.thresholds?.low || 0}
                onChange={(e) => handleChange(e, 'thresholdLow')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`threshold-medium-${area.area_number}`}>Schwellwert Mittel</Label>
              <Input
                id={`threshold-medium-${area.area_number}`}
                type="number"
                value={formData.thresholds?.medium || 0}
                onChange={(e) => handleChange(e, 'thresholdMedium')}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`x-${area.area_number}`}>X-Position</Label>
              <Input
                id={`x-${area.area_number}`}
                type="number"
                value={formData.x}
                onChange={(e) => handleChange(e, 'x')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`y-${area.area_number}`}>Y-Position</Label>
              <Input
                id={`y-${area.area_number}`}
                type="number"
                value={formData.y}
                onChange={(e) => handleChange(e, 'y')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`width-${area.area_number}`}>Breite</Label>
              <Input
                id={`width-${area.area_number}`}
                type="number"
                value={formData.width}
                onChange={(e) => handleChange(e, 'width')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`height-${area.area_number}`}>Höhe</Label>
              <Input
                id={`height-${area.area_number}`}
                type="number"
                value={formData.height}
                onChange={(e) => handleChange(e, 'height')}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`capacity-${area.area_number}`}>Kapazität</Label>
            <Input
              id={`capacity-${area.area_number}`}
              type="number"
              value={formData.capacity_usage}
              onChange={(e) => handleChange(e, 'capacity_usage')}
            />
          </div>
          
          <CardFooter className="px-0 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Speichern...' : 'Einstellungen speichern'}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};

export default AreaSettingsForm;
