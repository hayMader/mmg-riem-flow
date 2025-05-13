
import React, { useState } from 'react';
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
import { AreaSettings } from '@/types';
import { updateAreaSettings } from '@/utils/api';

interface AreaSettingsFormProps {
  area: AreaSettings;
  onUpdate: (updatedArea: AreaSettings) => void;
}

const AreaSettingsForm: React.FC<AreaSettingsFormProps> = ({ area, onUpdate }) => {
  const [formData, setFormData] = useState<Partial<AreaSettings>>({
    area_name: area.area_name,
    highlight: area.highlight || '',
    capacity_usage: area.capacity_usage,
    x: area.x,
    y: area.y,
    width: area.width,
    height: area.height,
    thresholds: area.thresholds || { low: 100, medium: 300 },
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof AreaSettings | 'thresholdLow' | 'thresholdMedium'
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
      const updatedArea = await updateAreaSettings(area.id, formData);
      onUpdate(updatedArea);
      
      toast({
        title: 'Einstellungen aktualisiert',
        description: `Die Einstellungen für ${area.area_name} wurden erfolgreich aktualisiert.`,
      });
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{area.area_name} Einstellungen</CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`area-name-${area.id}`}>Bereichsname</Label>
              <Input
                id={`area-name-${area.id}`}
                value={formData.area_name}
                onChange={(e) => handleChange(e, 'area_name')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`highlight-${area.id}`}>Highlight-Farbe (optional)</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id={`highlight-${area.id}`}
                  type="text"
                  value={formData.highlight}
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
              <Label htmlFor={`threshold-low-${area.id}`}>Schwellwert Niedrig</Label>
              <Input
                id={`threshold-low-${area.id}`}
                type="number"
                value={formData.thresholds?.low}
                onChange={(e) => handleChange(e, 'thresholdLow')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`threshold-medium-${area.id}`}>Schwellwert Mittel</Label>
              <Input
                id={`threshold-medium-${area.id}`}
                type="number"
                value={formData.thresholds?.medium}
                onChange={(e) => handleChange(e, 'thresholdMedium')}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`x-${area.id}`}>X-Position</Label>
              <Input
                id={`x-${area.id}`}
                type="number"
                value={formData.x}
                onChange={(e) => handleChange(e, 'x')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`y-${area.id}`}>Y-Position</Label>
              <Input
                id={`y-${area.id}`}
                type="number"
                value={formData.y}
                onChange={(e) => handleChange(e, 'y')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`width-${area.id}`}>Breite</Label>
              <Input
                id={`width-${area.id}`}
                type="number"
                value={formData.width}
                onChange={(e) => handleChange(e, 'width')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`height-${area.id}`}>Höhe</Label>
              <Input
                id={`height-${area.id}`}
                type="number"
                value={formData.height}
                onChange={(e) => handleChange(e, 'height')}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`capacity-${area.id}`}>Kapazität</Label>
            <Input
              id={`capacity-${area.id}`}
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
