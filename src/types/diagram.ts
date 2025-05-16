
import { ShapeConfig } from 'konva/lib/Shape';

export type Point = {
  x: number;
  y: number;
};

export type Size = {
  width: number;
  height: number;
};

export enum ShapeType {
  RECTANGLE = 'rectangle',
  CIRCLE = 'circle',
  TEXT = 'text',
  LINE = 'line',
  CONNECTOR = 'connector',
  GROUP = 'group',
}

export type BaseShape = {
  id: string;
  type: ShapeType;
  position: Point;
  rotation: number;
  selected: boolean;
  shapeProps: ShapeConfig;
};

export type RectangleShape = BaseShape & {
  type: ShapeType.RECTANGLE;
  size: Size;
};

export type CircleShape = BaseShape & {
  type: ShapeType.CIRCLE;
  radius: number;
};

export type TextShape = BaseShape & {
  type: ShapeType.TEXT;
  text: string;
  fontSize: number;
  fontFamily: string;
  size: Size;
  align: string;
};

export type LinePoint = {
  id: string;
  x: number;
  y: number;
};

export type ConnectorShape = BaseShape & {
  type: ShapeType.CONNECTOR;
  points: number[];
  fromId?: string;
  toId?: string;
  connectorType: 'straight' | 'bezier' | 'orthogonal';
};

export type GroupShape = BaseShape & {
  type: ShapeType.GROUP;
  childIds: string[];
  size: Size;
};

export type Shape = 
  | RectangleShape 
  | CircleShape 
  | TextShape 
  | ConnectorShape
  | GroupShape;

export enum ToolType {
  SELECT = 'select',
  RECTANGLE = 'rectangle',
  CIRCLE = 'circle',
  TEXT = 'text',
  CONNECTOR = 'connector',
  HAND = 'hand',
  ZOOM_IN = 'zoom-in',
  ZOOM_OUT = 'zoom-out',
}

export type DiagramState = {
  shapes: Record<string, Shape>;
  selectedIds: string[];
  tool: ToolType;
  zoom: number;
  offset: Point;
  history: {
    past: Array<{
      shapes: Record<string, Shape>;
      selectedIds: string[];
    }>;
    future: Array<{
      shapes: Record<string, Shape>;
      selectedIds: string[];
    }>;
  };
};

export type User = {
  id: string;
  name: string;
  color: string;
  cursor: Point;
  selectedIds: string[];
};
