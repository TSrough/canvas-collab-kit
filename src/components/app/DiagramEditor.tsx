
import React, { useCallback } from 'react';
import { Header } from './Header';
import { DiagramCanvas } from '../canvas/DiagramCanvas';
import { useDiagramStore } from '@/store/useDiagramStore';
import { useToast } from '@/components/ui/use-toast';
import { Shape } from '@/types/diagram';

export const DiagramEditor: React.FC = () => {
  const { toast } = useToast();
  const { shapes, selectedIds } = useDiagramStore();
  
  // Export diagram as PNG
  const handleExport = useCallback(() => {
    const stage = document.querySelector('canvas');
    if (!stage) {
      toast({
        title: "Export failed",
        description: "Could not find the canvas element",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const dataURL = stage.toDataURL();
      const link = document.createElement('a');
      link.download = 'diagram.png';
      link.href = dataURL;
      link.click();
      
      toast({
        title: "Export successful",
        description: "Your diagram has been exported as PNG",
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting your diagram",
        variant: "destructive"
      });
    }
  }, [toast]);
  
  // Save diagram as JSON
  const handleSave = useCallback(() => {
    try {
      const data = JSON.stringify({
        shapes,
        selectedIds
      });
      
      const blob = new Blob([data], { type: 'application/json' });
      const link = document.createElement('a');
      link.download = 'diagram.json';
      link.href = URL.createObjectURL(blob);
      link.click();
      
      toast({
        title: "Save successful",
        description: "Your diagram has been saved as JSON",
      });
    } catch (error) {
      console.error("Save failed:", error);
      toast({
        title: "Save failed",
        description: "There was an error saving your diagram",
        variant: "destructive"
      });
    }
  }, [shapes, selectedIds, toast]);
  
  // Load diagram from JSON file
  const handleLoad = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          // Use type assertion to ensure parseResult is typed correctly
          const result = event.target?.result;
          if (typeof result !== 'string') return;
          
          const data = JSON.parse(result) as {
            shapes: Record<string, Shape>;
            selectedIds: string[];
          };
          
          // Reset store with loaded data
          const store = useDiagramStore.getState();
          store.deselectAllShapes();
          
          // First set shapes to empty to avoid issues with existing shapes
          for (const id of Object.keys(store.shapes)) {
            store.deleteShape(id);
          }
          
          // Then add loaded shapes
          for (const [id, shape] of Object.entries(data.shapes)) {
            // Make a copy of the shape with its id
            const newShape = {...shape};
            // Use the addShape method which generates a new ID, so we need to update later
            const newId = store.addShape(newShape);
            
            // Check if this shape was selected in the saved diagram
            if (data.selectedIds.includes(id)) {
              store.selectShape(newId);
            }
          }
          
          toast({
            title: "Load successful",
            description: "Your diagram has been loaded",
          });
        } catch (error) {
          console.error("Load failed:", error);
          toast({
            title: "Load failed",
            description: "There was an error loading your diagram",
            variant: "destructive"
          });
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  }, [toast]);
  
  return (
    <div className="diagram-app">
      <Header 
        onExport={handleExport}
        onSave={handleSave}
        onLoad={handleLoad}
      />
      <div className="flex-1 relative overflow-hidden">
        <DiagramCanvas />
      </div>
    </div>
  );
};
