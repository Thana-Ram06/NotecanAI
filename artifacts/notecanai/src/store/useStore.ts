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

interface AppState {
  blocks: Block[];
  selectedBlockIds: string[];
  addBlock: (block: Omit<Block, 'id'>) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  removeBlock: (id: string) => void;
  setBlocks: (blocks: Block[]) => void;
  selectBlock: (id: string | null) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      blocks: [],
      selectedBlockIds: [],
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
    }),
    {
      name: 'notecanai-blocks',
    }
  )
);
