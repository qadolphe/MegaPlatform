import { create } from 'zustand';

export type Block = {
  id: string;
  type: string; // e.g., "Hero", "ProductGrid"
  props: Record<string, any>;
};

export type StoreColors = {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
};

const DEFAULT_COLORS: StoreColors = {
    primary: "#000000",
    secondary: "#ffffff",
    accent: "#3b82f6",
    background: "#ffffff",
    text: "#000000"
};

interface EditorState {
  blocks: Block[];
  storeColors: StoreColors;
  selectedBlockId: string | null;
  
  // History
  history: { blocks: Block[], colors: StoreColors }[];
  historyIndex: number;

  // Actions
  addBlock: (type: string, defaultProps?: any) => void;
  insertBlock: (index: number, type: string, defaultProps?: any) => void;
  moveBlock: (id: string, direction: 'up' | 'down') => void;
  updateBlockProps: (id: string, newProps: any) => void;
  selectBlock: (id: string | null) => void;
  setBlocks: (blocks: Block[], addToHistory?: boolean) => void;
  setStoreColors: (colors: StoreColors, addToHistory?: boolean) => void;
  removeBlock: (id: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  blocks: [],
  storeColors: DEFAULT_COLORS,
  selectedBlockId: null,
  history: [],
  historyIndex: -1,

  addBlock: (type, defaultProps = {}) => 
    set((state) => {
      const newBlocks = [...state.blocks, { 
        id: crypto.randomUUID(), 
        type, 
        props: defaultProps 
      }];
      
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push({ blocks: newBlocks, colors: state.storeColors });
      
      return {
        blocks: newBlocks,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    }),

  insertBlock: (index, type, defaultProps = {}) =>
    set((state) => {
      const newBlocks = [...state.blocks];
      newBlocks.splice(index, 0, {
        id: crypto.randomUUID(),
        type,
        props: defaultProps
      });
      
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push({ blocks: newBlocks, colors: state.storeColors });

      return { 
          blocks: newBlocks,
          history: newHistory,
          historyIndex: newHistory.length - 1
      };
    }),

  moveBlock: (id, direction) =>
    set((state) => {
      const index = state.blocks.findIndex((b) => b.id === id);
      if (index === -1) return {};
      
      const newBlocks = [...state.blocks];
      const [movedBlock] = newBlocks.splice(index, 1);
      const newIndex = direction === 'up' ? Math.max(0, index - 1) : Math.min(newBlocks.length, index + 1);
      newBlocks.splice(newIndex, 0, movedBlock);
      
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push({ blocks: newBlocks, colors: state.storeColors });

      return { 
          blocks: newBlocks,
          history: newHistory,
          historyIndex: newHistory.length - 1
      };
    }),

  updateBlockProps: (id, newProps) =>
    set((state) => {
        const newBlocks = state.blocks.map((b) => 
            b.id === id ? { ...b, props: { ...b.props, ...newProps } } : b
        );
        
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push({ blocks: newBlocks, colors: state.storeColors });

        return {
            blocks: newBlocks,
            history: newHistory,
            historyIndex: newHistory.length - 1
        };
    }),

  selectBlock: (id) => set({ selectedBlockId: id }),

  setBlocks: (blocks, addToHistory = false) => set((state) => {
      if (addToHistory) {
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push({ blocks, colors: state.storeColors });
        return {
            blocks,
            history: newHistory,
            historyIndex: newHistory.length - 1
        };
      }
      // Reset history
      return { 
          blocks, 
          history: [{ blocks, colors: state.storeColors }], 
          historyIndex: 0 
      };
  }),

  setStoreColors: (colors, addToHistory = true) => set((state) => {
      if (addToHistory) {
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push({ blocks: state.blocks, colors });
        return {
            storeColors: colors,
            history: newHistory,
            historyIndex: newHistory.length - 1
        };
      }
      
      const newHistory = state.history.length === 0 ? [{ blocks: state.blocks, colors }] : state.history;
      const newIndex = state.history.length === 0 ? 0 : state.historyIndex;

      return { 
          storeColors: colors,
          history: newHistory,
          historyIndex: newIndex
      };
  }),

  removeBlock: (id) =>
    set((state) => {
        const newBlocks = state.blocks.filter((b) => b.id !== id);
        
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push({ blocks: newBlocks, colors: state.storeColors });

        return {
            blocks: newBlocks,
            history: newHistory,
            historyIndex: newHistory.length - 1,
            selectedBlockId: null
        };
    }),

  undo: () => set((state) => {
      if (state.historyIndex <= 0) return {};
      const newIndex = state.historyIndex - 1;
      const snapshot = state.history[newIndex];
      return {
          blocks: snapshot.blocks,
          storeColors: snapshot.colors,
          historyIndex: newIndex
      };
  }),

  redo: () => set((state) => {
      if (state.historyIndex >= state.history.length - 1) return {};
      const newIndex = state.historyIndex + 1;
      const snapshot = state.history[newIndex];
      return {
          blocks: snapshot.blocks,
          storeColors: snapshot.colors,
          historyIndex: newIndex
      };
  }),

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,
}));
