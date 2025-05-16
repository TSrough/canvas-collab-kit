import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Group } from 'react-konva';
import { useDiagramStore } from '@/store/useDiagramStore';
import { ShapeRenderer } from './ShapeRenderer';
import { ToolType, Point, Shape, ShapeType } from '@/types/diagram';
import { KonvaEventObject } from 'konva/lib/Node';

const GRID_SIZE = 20;

export const DiagramCanvas: React.FC = () => {
  const { 
    shapes, 
    zoom, 
    offset, 
    tool,
    selectedIds,
    setTool, 
    setZoom, 
    setOffset, 
    panCanvas, 
    addShape, 
    updateShape,
    selectShape,
    deselectAllShapes,
    deleteSelectedShapes
  } = useDiagramStore();

  const stageRef = useRef<any>(null);
  const [stageSize, setStageSize] = useState<{ width: number, height: number }>({ width: 0, height: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [dragStartPoint, setDragStartPoint] = useState<Point | null>(null);
  
  // Handle resize
  useEffect(() => {
    const updateSize = () => {
      if (stageRef.current) {
        const containerElement = stageRef.current.container();
        setStageSize({
          width: containerElement.offsetWidth,
          height: containerElement.offsetHeight
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelectedShapes();
      } else if (e.key === 'Escape') {
        deselectAllShapes();
        setTool(ToolType.SELECT);
      } else if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          useDiagramStore.getState().undo();
        } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
          e.preventDefault();
          useDiagramStore.getState().redo();
        } else if (e.key === '0') {
          e.preventDefault();
          setZoom(1);
        } else if (e.key === '+' || e.key === '=') {
          e.preventDefault();
          setZoom(zoom * 1.1);
        } else if (e.key === '-') {
          e.preventDefault();
          setZoom(zoom / 1.1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelectedShapes, deselectAllShapes, setTool, setZoom, zoom]);

  // Stage event handlers
  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    
    const pointerPos = stageRef.current?.getPointerPosition();
    const stagePos = stageRef.current?.position();
    
    const mousePointTo = {
      x: (pointerPos.x - stagePos.x) / zoom,
      y: (pointerPos.y - stagePos.y) / zoom,
    };
    
    const scaleBy = e.evt.ctrlKey ? 1.1 : 1.03;
    const newZoom = e.evt.deltaY < 0 ? zoom * scaleBy : zoom / scaleBy;
    
    setZoom(newZoom);
    
    const newPos = {
      x: pointerPos.x - mousePointTo.x * newZoom,
      y: pointerPos.y - mousePointTo.y * newZoom,
    };
    
    setOffset({
      x: newPos.x,
      y: newPos.y,
    });
  };

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    // If right click, always activate pan mode temporarily
    if (e.evt.button === 2) {
      e.evt.preventDefault();
      setTool(ToolType.HAND);
      setDragStartPoint({ x: e.evt.clientX, y: e.evt.clientY });
      return;
    }
    
    // Get stage pointer position, adjusted for zoom and offset
    const stage = stageRef.current;
    if (!stage) return;
    
    const pointerPos = stage.getRelativePointerPosition();
    setStartPoint(pointerPos);

    if (tool === ToolType.HAND) {
      setDragStartPoint({ x: e.evt.clientX, y: e.evt.clientY });
    } else if (tool === ToolType.SELECT) {
      // Check if clicked on empty area
      const clickedEmpty = e.target === stage;
      if (clickedEmpty) {
        deselectAllShapes();
      }
    } else {
      setIsDrawing(true);
    }
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (!startPoint) return;

    const stage = stageRef.current;
    if (!stage) return;
    
    // Handle panning
    if (tool === ToolType.HAND && dragStartPoint) {
      const dx = e.evt.clientX - dragStartPoint.x;
      const dy = e.evt.clientY - dragStartPoint.y;
      
      panCanvas(dx / zoom, dy / zoom);
      setDragStartPoint({ x: e.evt.clientX, y: e.evt.clientY });
      return;
    }
    
    // Handle drawing
    if (!isDrawing) return;
    
    const pointerPos = stage.getRelativePointerPosition();
    
    // Create temporary shape for preview
    const minX = Math.min(startPoint.x, pointerPos.x);
    const minY = Math.min(startPoint.y, pointerPos.y);
    const width = Math.abs(pointerPos.x - startPoint.x);
    const height = Math.abs(pointerPos.y - startPoint.y);
    
    // Show preview based on the tool
    if (tool === ToolType.RECTANGLE || tool === ToolType.CIRCLE || tool === ToolType.TEXT) {
      // Preview logic could be implemented here if needed
    }
  };

  const handleMouseUp = (e: KonvaEventObject<MouseEvent>) => {
    // If panning with right-click, restore the select tool
    if (e.evt.button === 2 && tool === ToolType.HAND) {
      setTool(ToolType.SELECT);
      setDragStartPoint(null);
      return;
    }

    if (startPoint && isDrawing) {
      const stage = stageRef.current;
      if (!stage) return;
      
      const pointerPos = stage.getRelativePointerPosition();
      
      // Calculate dimensions
      const minX = Math.min(startPoint.x, pointerPos.x);
      const minY = Math.min(startPoint.y, pointerPos.y);
      const width = Math.abs(pointerPos.x - startPoint.x);
      const height = Math.abs(pointerPos.y - startPoint.y);
      
      // Create shape based on the tool
      if (tool === ToolType.RECTANGLE && width > 5 && height > 5) {
        const newShape = {
          type: ShapeType.RECTANGLE,
          position: { x: minX, y: minY },
          size: { width, height },
          rotation: 0,
          selected: false,
          shapeProps: {
            fill: 'white',
            stroke: 'black',
            strokeWidth: 1
          }
        };
        addShape(newShape);
      }
      else if (tool === ToolType.CIRCLE && width > 5 && height > 5) {
        const radius = Math.max(width, height) / 2;
        const centerX = minX + width / 2;
        const centerY = minY + height / 2;
        
        const newShape = {
          type: ShapeType.CIRCLE,
          position: { x: centerX, y: centerY },
          radius,
          rotation: 0,
          selected: false,
          shapeProps: {
            fill: 'white',
            stroke: 'black',
            strokeWidth: 1
          }
        };
        addShape(newShape);
      }
      else if (tool === ToolType.TEXT && width > 5 && height > 5) {
        const newShape = {
          type: ShapeType.TEXT,
          position: { x: minX, y: minY },
          size: { width, height },
          text: 'Double click to edit',
          fontSize: 16,
          fontFamily: 'Arial',
          align: 'center',
          rotation: 0,
          selected: false,
          shapeProps: {
            fill: 'black'
          }
        };
        addShape(newShape);
      }
      
      // Reset to select tool after creating a shape
      setTool(ToolType.SELECT);
    }
    
    setIsDrawing(false);
    setStartPoint(null);
    setDragStartPoint(null);
  };
  
  // Fix the contextmenu event type
  const handleContextMenu = (e: KonvaEventObject<MouseEvent>) => {
    e.evt.preventDefault();
  };

  // Calculate grid
  const gridLines = [];
  if (stageSize.width > 0 && stageSize.height > 0) {
    // Adjust the grid position based on pan offset
    const offsetX = (offset.x % (GRID_SIZE * zoom)) / zoom;
    const offsetY = (offset.y % (GRID_SIZE * zoom)) / zoom;
    
    // Calculate visible grid area
    const startX = -Math.floor(stageSize.width / 2 / zoom);
    const endX = Math.ceil(stageSize.width / 2 / zoom);
    const startY = -Math.floor(stageSize.height / 2 / zoom);
    const endY = Math.ceil(stageSize.height / 2 / zoom);
    
    // Create vertical grid lines
    for (let x = startX; x <= endX; x += GRID_SIZE) {
      gridLines.push(
        <Rect
          key={`v-${x}`}
          x={x}
          y={startY}
          width={1 / zoom}
          height={endY - startY}
          fill="rgba(200, 200, 200, 0.5)"
        />
      );
    }
    
    // Create horizontal grid lines
    for (let y = startY; y <= endY; y += GRID_SIZE) {
      gridLines.push(
        <Rect
          key={`h-${y}`}
          x={startX}
          y={y}
          width={endX - startX}
          height={1 / zoom}
          fill="rgba(200, 200, 200, 0.5)"
        />
      );
    }
  }
  
  return (
    <div className="canvas-container w-full h-full overflow-hidden">
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        x={offset.x}
        y={offset.y}
        scaleX={zoom}
        scaleY={zoom}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
        draggable={tool === ToolType.HAND}
        className="bg-canvas"
      >
        <Layer>
          <Group>{gridLines}</Group>
        </Layer>
        <Layer>
          {Object.values(shapes).map((shape) => (
            <ShapeRenderer 
              key={shape.id} 
              shape={shape} 
              isSelected={selectedIds.includes(shape.id)}
              onChange={(newAttrs) => {
                updateShape(shape.id, newAttrs);
              }}
              onSelect={() => {
                selectShape(shape.id);
              }}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};
