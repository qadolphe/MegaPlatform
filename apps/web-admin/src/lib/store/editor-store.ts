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
