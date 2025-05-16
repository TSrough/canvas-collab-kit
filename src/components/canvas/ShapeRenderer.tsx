
import React, { useRef, useState } from 'react';
import { Rect, Circle, Text, Group, Transformer } from 'react-konva';
import { Shape, ShapeType, CircleShape, RectangleShape, TextShape } from '@/types/diagram';
import Konva from 'konva';

interface ShapeRendererProps {
  shape: Shape;
  isSelected: boolean;
  onChange: (newAttrs: Partial<Shape>) => void;
  onSelect: () => void;
}

export const ShapeRenderer: React.FC<ShapeRendererProps> = ({
  shape,
  isSelected,
  onChange,
  onSelect,
}) => {
  const shapeRef = useRef<Konva.Shape | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState((shape as TextShape).text || '');

  // Apply transformer when selected
  React.useEffect(() => {
    if (isSelected && transformerRef.current && shapeRef.current) {
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onChange({
      position: {
        x: e.target.x(),
        y: e.target.y(),
      },
    });
  };

  const handleTransformEnd = () => {
    if (!shapeRef.current) return;

    // Transformer works with scale, but we need to reset it and update width and height
    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale after transform
    node.scaleX(1);
    node.scaleY(1);

    // Update shape data
    switch (shape.type) {
      case ShapeType.RECTANGLE:
        onChange({
          position: {
            x: node.x(),
            y: node.y()
          },
          size: {
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY)
          },
          rotation: node.rotation()
        });
        break;
      case ShapeType.CIRCLE:
        onChange({
          position: {
            x: node.x(),
            y: node.y()
          },
          radius: Math.max(5, (shape as CircleShape).radius * scaleX),
          rotation: node.rotation()
        });
        break;
      case ShapeType.TEXT:
        onChange({
          position: {
            x: node.x(),
            y: node.y()
          },
          size: {
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY)
          },
          rotation: node.rotation()
        });
        break;
    }
  };
  
  const handleDoubleClick = () => {
    // Enable editing for text shapes
    if (shape.type === ShapeType.TEXT) {
      setIsEditing(true);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleTextBlur = () => {
    setIsEditing(false);
    if (shape.type === ShapeType.TEXT) {
      onChange({ text });
    }
  };

  // Render shape based on its type
  const renderShape = () => {
    switch (shape.type) {
      case ShapeType.RECTANGLE:
        const rect = shape as RectangleShape;
        return (
          <Rect
            ref={shapeRef as React.RefObject<Konva.Rect>}
            x={rect.position.x}
            y={rect.position.y}
            width={rect.size.width}
            height={rect.size.height}
            fill={rect.shapeProps.fill as string}
            stroke={rect.shapeProps.stroke as string}
            strokeWidth={rect.shapeProps.strokeWidth as number}
            rotation={rect.rotation}
            draggable
            onDragEnd={handleDragEnd}
            onTransformEnd={handleTransformEnd}
            onClick={onSelect}
            onDblClick={handleDoubleClick}
          />
        );
      case ShapeType.CIRCLE:
        const circle = shape as CircleShape;
        return (
          <Circle
            ref={shapeRef as React.RefObject<Konva.Circle>}
            x={circle.position.x}
            y={circle.position.y}
            radius={circle.radius}
            fill={circle.shapeProps.fill as string}
            stroke={circle.shapeProps.stroke as string}
            strokeWidth={circle.shapeProps.strokeWidth as number}
            rotation={circle.rotation}
            draggable
            onDragEnd={handleDragEnd}
            onTransformEnd={handleTransformEnd}
            onClick={onSelect}
            onDblClick={handleDoubleClick}
          />
        );
      case ShapeType.TEXT:
        const textShape = shape as TextShape;
        return (
          <Text
            ref={shapeRef as React.RefObject<Konva.Text>}
            x={textShape.position.x}
            y={textShape.position.y}
            width={textShape.size.width}
            height={textShape.size.height}
            text={textShape.text}
            fontSize={textShape.fontSize}
            fontFamily={textShape.fontFamily}
            fill={textShape.shapeProps.fill as string}
            align={textShape.align as Konva.TextConfig['align']}
            rotation={textShape.rotation}
            draggable
            onDragEnd={handleDragEnd}
            onTransformEnd={handleTransformEnd}
            onClick={onSelect}
            onDblClick={handleDoubleClick}
          />
        );
      default:
        return null;
    }
  };

  // Render inline text editor if editing a text shape
  if (isEditing && shape.type === ShapeType.TEXT) {
    const textShape = shape as TextShape;
    const textPosition = shapeRef.current?.getAbsolutePosition() || { x: 0, y: 0 };
    const stageScale = shapeRef.current?.getStage()?.scaleX() || 1;
    
    // Create styles for the textarea to match the text position and size
    const areaStyle: React.CSSProperties = {
      position: 'absolute',
      top: textPosition.y + 'px',
      left: textPosition.x + 'px',
      width: textShape.size.width * stageScale + 'px',
      height: textShape.size.height * stageScale + 'px',
      fontSize: textShape.fontSize * stageScale + 'px',
      fontFamily: textShape.fontFamily,
      lineHeight: '1',
      border: 'none',
      padding: '0',
      margin: '0',
      background: 'none',
      resize: 'none',
      overflow: 'hidden',
      color: textShape.shapeProps.fill as string,
      textAlign: textShape.align as React.CSSProperties['textAlign'],
      transform: `rotate(${textShape.rotation}deg)`,
      transformOrigin: 'left top',
      outline: 'none',
      zIndex: 1000,
    };
    
    const stopPropagation = (e: React.MouseEvent) => {
      e.stopPropagation();
    };

    // Use portal to render the textarea above the canvas
    return (
      <>
        {renderShape()}
        <textarea
          value={text}
          onChange={handleTextChange}
          onBlur={handleTextBlur}
          onMouseDown={stopPropagation}
          onMouseUp={stopPropagation}
          onMouseMove={stopPropagation}
          style={areaStyle}
          autoFocus
        />
      </>
    );
  }

  return (
    <Group>
      {renderShape()}
      {isSelected && (
        <Transformer
          ref={transformerRef as React.RefObject<Konva.Transformer>}
          rotateEnabled
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit minimum size
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </Group>
  );
};
