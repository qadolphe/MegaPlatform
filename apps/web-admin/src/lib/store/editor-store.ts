import { create } from 'zustand';

export type Block = {
  id: string;
  type: string; // e.g., "Hero", "ProductGrid"
  props: Record<string, any>;
};

interface EditorState {
  blocks: Block[];
  selectedBlockId: string | null;
  
  // Actions
  addBlock: (type: string, defaultProps?: any) => void;
  insertBlock: (index: number, type: string, defaultProps?: any) => void;
  moveBlock: (id: string, direction: 'up' | 'down') => void;
  updateBlockProps: (id: string, newProps: any) => void;
  selectBlock: (id: string) => void;
  setBlocks: (blocks: Block[]) => void;
  removeBlock: (id: string) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  blocks: [],
  selectedBlockId: null,

  addBlock: (type, defaultProps = {}) => 
    set((state) => ({
      blocks: [...state.blocks, { 
        id: crypto.randomUUID(), 
        type, 
        props: defaultProps 
      }]
    })),

  insertBlock: (index, type, defaultProps = {}) =>
    set((state) => {
      const newBlocks = [...state.blocks];
      newBlocks.splice(index, 0, {
        id: crypto.randomUUID(),
        type,
        props: defaultProps
      });
      return { blocks: newBlocks };
    }),

  moveBlock: (id, direction) =>
    set((state) => {
      const index = state.blocks.findIndex((b) => b.id === id);
      if (index === -1) return {};
      
      const newBlocks = [...state.blocks];
      if (direction === 'up' && index > 0) {
        [newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]];
      } else if (direction === 'down' && index < newBlocks.length - 1) {
        [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
      }
      return { blocks: newBlocks };
    }),

  selectBlock: (id) => set({ selectedBlockId: id }),

  updateBlockProps: (id, newProps) =>
    set((state) => ({
      blocks: state.blocks.map((b) => 
        b.id === id ? { ...b, props: { ...b.props, ...newProps } } : b
      ),
    })),

  removeBlock: (id) =>
    set((state) => ({
      blocks: state.blocks.filter((b) => b.id !== id),
      selectedBlockId: null
    })),

  setBlocks: (blocks) => set({ blocks }),
}));
