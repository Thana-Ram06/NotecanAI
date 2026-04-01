import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Block {
  id: string;
  type: "text" | "rectangle" | "circle";
  content?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color: string;
  font: string;
}

export interface DrawingPath {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

interface AppState {
  blocks: Block[];
  selectedBlockIds: string[];
  drawings: DrawingPath[];
  mode: 'select' | 'draw';
  strokeColor: string;
  strokeWidth: number;

  addBlock: (block: Omit<Block, 'id'>) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  removeBlock: (id: string) => void;
  setBlocks: (blocks: Block[]) => void;
  selectBlock: (id: string | null) => void;

  addDrawing: (drawing: DrawingPath) => void;
  clearDrawings: () => void;

  setMode: (mode: 'select' | 'draw') => void;
  setStrokeColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      blocks: [],
      selectedBlockIds: [],
      drawings: [],
      mode: 'select',
      strokeColor: '#1a1a1a',
      strokeWidth: 3,

      addBlock: (block) => set((state) => ({
        blocks: [...state.blocks, { ...block, id: crypto.randomUUID() }]
      })),
      updateBlock: (id, updates) => set((state) => ({
        blocks: state.blocks.map(b => b.id === id ? { ...b, ...updates } : b)
      })),
      removeBlock: (id) => set((state) => ({
        blocks: state.blocks.filter(b => b.id !== id),
        selectedBlockIds: state.selectedBlockIds.filter(selId => selId !== id)
      })),
      setBlocks: (blocks) => set({ blocks }),
      selectBlock: (id) => set({ selectedBlockIds: id ? [id] : [] }),

      addDrawing: (drawing) => set((state) => ({
        drawings: [...state.drawings, drawing]
      })),
      clearDrawings: () => set({ drawings: [] }),

      setMode: (mode) => set({ mode, selectedBlockIds: [] }),
      setStrokeColor: (color) => set({ strokeColor: color }),
      setStrokeWidth: (width) => set({ strokeWidth: width }),
    }),
    {
      name: 'notecanai-blocks',
    }
  )
);
