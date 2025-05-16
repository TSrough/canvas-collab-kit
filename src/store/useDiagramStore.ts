import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { DiagramState, Point, Shape, ShapeType, ToolType } from '@/types/diagram';

const MAX_HISTORY_LENGTH = 30;

export const useDiagramStore = create<{
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
  
  // Actions
  setTool: (tool: ToolType) => void;
  addShape: (shape: Omit<Shape, 'id'>) => string;
  updateShape: (id: string, updates: Partial<Shape>) => void;
  deleteShape: (id: string) => void;
  deleteSelectedShapes: () => void;
  selectShape: (id: string, addToSelection?: boolean) => void;
  deselectAllShapes: () => void;
  setZoom: (zoom: number) => void;
  setOffset: (offset: Point) => void;
  panCanvas: (deltaX: number, deltaY: number) => void;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
}>((set, get) => ({
  shapes: {},
  selectedIds: [],
  tool: ToolType.SELECT,
  zoom: 1,
  offset: { x: 0, y: 0 },
  history: { past: [], future: [] },

  setTool: (tool) => set({ tool }),

  addShape: (shapeData) => {
    const id = nanoid();
    set((state) => {
      // Create the appropriate shape based on the type with proper type assertion
      let shape: Shape;
      
      if (shapeData.type === ShapeType.CIRCLE) {
        shape = {
          ...shapeData,
          id,
          type: ShapeType.CIRCLE,
        } as Shape;
      } else if (shapeData.type === ShapeType.TEXT) {
        shape = {
          ...shapeData,
          id,
          type: ShapeType.TEXT,
        } as Shape;
      } else if (shapeData.type === ShapeType.CONNECTOR) {
        shape = {
          ...shapeData,
          id,
          type: ShapeType.CONNECTOR,
        } as Shape;
      } else if (shapeData.type === ShapeType.GROUP) {
        shape = {
          ...shapeData,
          id,
          type: ShapeType.GROUP,
        } as Shape;
      } else {
        // Default to rectangle
        shape = {
          ...shapeData,
          id,
          type: ShapeType.RECTANGLE,
        } as Shape;
      }

      return {
        shapes: {
          ...state.shapes,
          [id]: shape,
        }
      };
    });
    get().pushHistory();
    return id;
  },

  updateShape: (id, updates) => {
    set((state) => {
      const shape = state.shapes[id];
      if (!shape) return state;

      return {
        shapes: {
          ...state.shapes,
          [id]: { ...shape, ...updates },
        }
      };
    });
  },

  deleteShape: (id) => {
    set((state) => {
      const newShapes = { ...state.shapes };
      delete newShapes[id];
      
      return {
        shapes: newShapes,
        selectedIds: state.selectedIds.filter(selectedId => selectedId !== id)
      };
    });
    get().pushHistory();
  },

  deleteSelectedShapes: () => {
    set((state) => {
      const newShapes = { ...state.shapes };
      state.selectedIds.forEach(id => {
        delete newShapes[id];
      });
      
      return {
        shapes: newShapes,
        selectedIds: []
      };
    });
    get().pushHistory();
  },

  selectShape: (id, addToSelection = false) => {
    set((state) => {
      const shape = state.shapes[id];
      if (!shape) return state;

      let selectedIds = addToSelection 
        ? [...state.selectedIds, id]
        : [id];
        
      // Remove duplicates
      selectedIds = [...new Set(selectedIds)];

      return {
        selectedIds,
        shapes: {
          ...state.shapes,
          [id]: { ...shape, selected: true }
        }
      };
    });
  },

  deselectAllShapes: () => {
    set((state) => {
      const updatedShapes = { ...state.shapes };
      state.selectedIds.forEach(id => {
        if (updatedShapes[id]) {
          updatedShapes[id] = { ...updatedShapes[id], selected: false };
        }
      });

      return {
        selectedIds: [],
        shapes: updatedShapes
      };
    });
  },

  setZoom: (zoom) => {
    set({ zoom: Math.max(0.1, Math.min(zoom, 5)) }); // Clamp between 0.1 and 5
  },

  setOffset: (offset) => {
    set({ offset });
  },

  panCanvas: (deltaX, deltaY) => {
    set((state) => ({
      offset: {
        x: state.offset.x + deltaX,
        y: state.offset.y + deltaY
      }
    }));
  },

  pushHistory: () => {
    set((state) => {
      const newPast = [
        {
          shapes: { ...state.shapes },
          selectedIds: [...state.selectedIds]
        },
        ...state.history.past
      ].slice(0, MAX_HISTORY_LENGTH);

      return {
        history: {
          past: newPast,
          future: []
        }
      };
    });
  },

  undo: () => {
    set((state) => {
      if (state.history.past.length === 0) return state;

      const [lastState, ...newPast] = state.history.past;
      
      return {
        shapes: lastState.shapes,
        selectedIds: lastState.selectedIds,
        history: {
          past: newPast,
          future: [
            {
              shapes: { ...state.shapes },
              selectedIds: [...state.selectedIds]
            },
            ...state.history.future
          ]
        }
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.history.future.length === 0) return state;

      const [nextState, ...newFuture] = state.history.future;
      
      return {
        shapes: nextState.shapes,
        selectedIds: nextState.selectedIds,
        history: {
          past: [
            {
              shapes: { ...state.shapes },
              selectedIds: [...state.selectedIds]
            },
            ...state.history.past
          ],
          future: newFuture
        }
      };
    });
  }
}));
