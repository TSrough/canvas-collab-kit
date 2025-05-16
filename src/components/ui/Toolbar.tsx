
import React from 'react';
import { useDiagramStore } from '@/store/useDiagramStore';
import { ToolType } from '@/types/diagram';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Square, 
  Circle as CircleIcon, 
  Text as TextIcon, 
  ArrowRight, 
  Hand, 
  Pointer, 
  ZoomIn, 
  ZoomOut,
  Undo,
  Redo,
  Trash
} from 'lucide-react';

interface ToolbarProps {
  className?: string;
}

export const Toolbar: React.FC<ToolbarProps> = ({ className }) => {
  const { tool, setTool, undo, redo, deleteSelectedShapes, zoom, setZoom } = useDiagramStore();
  
  const handleToolClick = (selectedTool: ToolType) => {
    setTool(selectedTool);
  };
  
  const toolButtons = [
    { tool: ToolType.SELECT, icon: Pointer, tooltip: 'Select (V)' },
    { tool: ToolType.RECTANGLE, icon: Square, tooltip: 'Rectangle (R)' },
    { tool: ToolType.CIRCLE, icon: CircleIcon, tooltip: 'Circle (C)' },
    { tool: ToolType.TEXT, icon: TextIcon, tooltip: 'Text (T)' },
    { tool: ToolType.CONNECTOR, icon: ArrowRight, tooltip: 'Connector (L)' },
    { tool: ToolType.HAND, icon: Hand, tooltip: 'Pan (H)' }
  ];

  return (
    <div className={cn('flex items-center gap-1 p-1 bg-background border rounded-md shadow-sm', className)}>
      {toolButtons.map((item) => (
        <Button
          key={item.tool}
          variant={tool === item.tool ? 'default' : 'ghost'}
          size="icon"
          onClick={() => handleToolClick(item.tool)}
          title={item.tooltip}
          className="h-8 w-8"
        >
          <item.icon className="h-4 w-4" />
        </Button>
      ))}
      
      <div className="mx-2 h-6 w-px bg-border" />
      
      <Button
        variant="ghost"
        size="icon"
        onClick={undo}
        title="Undo (Ctrl+Z)"
        className="h-8 w-8"
      >
        <Undo className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={redo}
        title="Redo (Ctrl+Y)"
        className="h-8 w-8"
      >
        <Redo className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={deleteSelectedShapes}
        title="Delete Selected (Delete)"
        className="h-8 w-8"
      >
        <Trash className="h-4 w-4" />
      </Button>
      
      <div className="mx-2 h-6 w-px bg-border" />
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setZoom(zoom * 1.1)}
        title="Zoom In (Ctrl++)"
        className="h-8 w-8"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center px-2">
        <span className="text-xs">{Math.round(zoom * 100)}%</span>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setZoom(zoom / 1.1)}
        title="Zoom Out (Ctrl+-)"
        className="h-8 w-8"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setZoom(1)}
        className="text-xs px-2"
      >
        Reset
      </Button>
    </div>
  );
};
