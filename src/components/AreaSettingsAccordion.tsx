import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { AreaStatus, Threshold } from '@/types';
import { updateAreaSettings, updateThreshold, getThresholds } from '@/utils/api';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  Settings, 
  SlidersHorizontal, 
  Move, 
  Save,
  Plus,
  Trash,
  Edit
} from 'lucide-react';

interface AreaSettingsAccordionProps {
  area: AreaStatus;
  onUpdate: (updatedArea: AreaStatus) => void;
}

const AreaSettingsAccordion: React.FC<AreaSettingsAccordionProps> = ({ area, onUpdate }) => {
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
  const [newThreshold, setNewThreshold] = useState({ upper_threshold: 0, color: '#cccccc' });

  useEffect(() => {
    const fetchThresholds = async () => {
      setIsLoading(true);
      const data = await getThresholds(area.area_number);
      setThresholds(data);
      setIsLoading(false);
    };

    fetchThresholds();
  }, [area.area_number]);

  // Reset form data when area changes
  useEffect(() => {
    setFormData({
      area_name: area.area_name,
      highlight: area.highlight || '',
      capacity_usage: area.capacity_usage,
      x: area.x,
      y: area.y,
      width: area.width,
      height: area.height,
      thresholds: area.thresholds || { low: 100, medium: 300 },
    });
  }, [area]);

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
      <div className="p-4 text-center">
        <p>Einstellungen werden geladen...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Accordion type="single" collapsible defaultValue="general" className="w-full">
        {/* General Settings */}
        <AccordionItem value="general">
          <AccordionTrigger className="py-4">
            <div className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              <span>Allgemeine Einstellungen</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="area-name">Bereichsname</Label>
                <Input
                  id="area-name"
                  value={formData.area_name}
                  onChange={(e) => handleChange(e, 'area_name')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Kapazität</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity_usage}
                  onChange={(e) => handleChange(e, 'capacity_usage')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="highlight">Hervorhebungsfarbe (optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="highlight"
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
          </AccordionContent>
        </AccordionItem>

        {/* Threshold Settings */}
        <AccordionItem value="thresholds">
          <AccordionTrigger className="py-4">
            <div className="flex items-center">
              <SlidersHorizontal className="mr-2 h-5 w-5" />
              <span>Grenzwerte Besucherzahl</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 py-2">
              {thresholds.length > 0 ? (
                <div className="space-y-2">
                  <Label>Aktuelle Grenzwerte</Label>
                  <div className="border rounded-md">
                    {thresholds
                      .sort((a, b) => a.upper_threshold - b.upper_threshold)
                      .map((threshold, index) => (
                        <div 
                          key={threshold.id}
                          className="flex items-center justify-between p-2 border-b last:border-0"
                        >
                          <div className="flex items-center">
                            <div 
                              className="w-4 h-4 rounded-full mr-3" 
                              style={{ backgroundColor: threshold.color }}
                            ></div>
                            <span className="font-medium">{threshold.upper_threshold}</span>
                          </div>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="text-destructive">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Keine Grenzwerte definiert.</p>
              )}

              <div className="pt-4 border-t">
                <Label className="mb-2 block">Neuer Grenzwert</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Schwellenwert"
                    className="flex-1"
                    value={newThreshold.upper_threshold || ''}
                    onChange={(e) => setNewThreshold({
                      ...newThreshold,
                      upper_threshold: parseInt(e.target.value) || 0
                    })}
                  />
                  <Input
                    type="color"
                    className="w-12 p-0"
                    value={newThreshold.color}
                    onChange={(e) => setNewThreshold({
                      ...newThreshold,
                      color: e.target.value
                    })}
                  />
                  <Button type="button" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Hinzufügen
                  </Button>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Area Position Settings */}
        <AccordionItem value="position">
          <AccordionTrigger className="py-4">
            <div className="flex items-center">
              <Move className="mr-2 h-5 w-5" />
              <span>Anpassung Areal</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="x-position">X-Position</Label>
                  <Input
                    id="x-position"
                    type="number"
                    value={formData.x}
                    onChange={(e) => handleChange(e, 'x')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="y-position">Y-Position</Label>
                  <Input
                    id="y-position"
                    type="number"
                    value={formData.y}
                    onChange={(e) => handleChange(e, 'y')}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="width">Breite</Label>
                  <Input
                    id="width"
                    type="number"
                    value={formData.width}
                    onChange={(e) => handleChange(e, 'width')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Höhe</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleChange(e, 'height')}
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="mt-6 flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Speichern...' : 'Speichern'}
        </Button>
      </div>
    </form>
  );
};

export default AreaSettingsAccordion;
