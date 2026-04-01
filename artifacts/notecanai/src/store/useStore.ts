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

export type AppMode = 'select' | 'draw' | 'erase-area' | 'erase-line';

interface AppState {
  blocks: Block[];
  selectedBlockIds: string[];
  drawings: DrawingPath[];
  mode: AppMode;
  strokeColor: string;
  strokeWidth: number;
  eraseRadius: number;

  addBlock: (block: Omit<Block, 'id'>) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  removeBlock: (id: string) => void;
  setBlocks: (blocks: Block[]) => void;
  selectBlock: (id: string | null) => void;

  addDrawing: (drawing: DrawingPath) => void;
  removeDrawing: (id: string) => void;
  updateDrawings: (drawings: DrawingPath[]) => void;
  clearDrawings: () => void;

  setMode: (mode: AppMode) => void;
  setStrokeColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setEraseRadius: (radius: number) => void;
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
      eraseRadius: 20,

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
      removeDrawing: (id) => set((state) => ({
        drawings: state.drawings.filter(d => d.id !== id)
      })),
      updateDrawings: (drawings) => set({ drawings }),
      clearDrawings: () => set({ drawings: [] }),

      setMode: (mode) => set({ mode, selectedBlockIds: [] }),
      setStrokeColor: (color) => set({ strokeColor: color }),
      setStrokeWidth: (width) => set({ strokeWidth: width }),
      setEraseRadius: (radius) => set({ eraseRadius: radius }),
    }),
    {
      name: 'notecanai-blocks',
    }
  )
);
