import { ContentPacket } from "@/lib/packet-hydration";

export type SidebarTab = 'components' | 'media' | 'properties' | 'theme' | 'ai';

export interface EditorState {
    blocks: any[];
    selectedBlockId: string | null;
    pageSlug: string;
    storeId: string;
    storeTheme: string;
    storeColors: any;
    viewMode: 'desktop' | 'mobile';
    isSidebarOpen: boolean;
    activeSidebarTab: SidebarTab;
    editorMode: 'ai' | 'advanced';
}

export interface AiModel {
    id: string;
    name: string;
}

export interface AiModels {
    gemini: AiModel[];
    openai: AiModel[];
    anthropic: AiModel[];
}
