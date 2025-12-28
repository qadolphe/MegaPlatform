import { supabase } from "@repo/database";

export type PacketType = "feature" | "testimonial" | "faq" | "text_block" | "media";

export interface ContentPacket {
    id: string;
    type: PacketType;
    name: string;
    data: Record<string, any>;
}

/**
 * Extract all packet IDs from a layout configuration
 */
export function extractPacketIds(layout: any[]): string[] {
    const ids: string[] = [];

    for (const block of layout) {
        if (block.props?.packetIds && Array.isArray(block.props.packetIds)) {
            ids.push(...block.props.packetIds);
        }
        // Also check for nested items that might reference packets
        if (block.props?.items && Array.isArray(block.props.items)) {
            for (const item of block.props.items) {
                if (item.packetId) {
                    ids.push(item.packetId);
                }
            }
        }
    }

    return [...new Set(ids)]; // Remove duplicates
}

/**
 * Fetch packets from database by IDs
 */
export async function fetchPackets(packetIds: string[]): Promise<Map<string, ContentPacket>> {
    if (packetIds.length === 0) return new Map();

    const { data, error } = await supabase
        .from("content_packets")
        .select("id, type, name, data")
        .in("id", packetIds);

    if (error || !data) return new Map();

    const packetsMap = new Map<string, ContentPacket>();
    for (const packet of data) {
        packetsMap.set(packet.id, packet as ContentPacket);
    }

    return packetsMap;
}

/**
 * Get the prop name used for items in a given block type
 */
function getItemsPropForBlockType(blockType: string): string {
    switch (blockType) {
        case "Features":
        case "InfoGrid":
        case "BenefitsGrid":
            return "features";
        case "Testimonials":
            return "testimonials";
        case "FAQ":
            return "faqs";
        case "TextContent":
            return "content";
        case "UniversalGrid":
            return "items";
        default:
            return "items";
    }
}

/**
 * Hydrate block props with packet data
 * Converts packetIds to actual content items
 */
export function hydrateBlockWithPackets(
    block: any,
    packetsMap: Map<string, ContentPacket>
): any {
    if (!block.props?.packetIds || block.props.packetIds.length === 0) {
        return block;
    }

    const packetIds: string[] = block.props.packetIds;
    const items = packetIds
        .map((id) => packetsMap.get(id))
        .filter(Boolean)
        .map((packet) => packet!.data);

    if (items.length === 0) {
        return block;
    }

    const propName = getItemsPropForBlockType(block.type);

    // Return block with hydrated items
    return {
        ...block,
        props: {
            ...block.props,
            [propName]: items,
        },
    };
}

/**
 * Map packet types to compatible block types
 */
export const PACKET_BLOCK_MAP: Record<PacketType, string[]> = {
    feature: ["Features", "InfoGrid", "BenefitsGrid", "UniversalGrid"],
    testimonial: ["Testimonials", "UniversalGrid"],
    faq: ["FAQ", "UniversalGrid"],
    text_block: ["TextContent"],
    media: ["ImageBox", "UniversalGrid"],
};

/**
 * Get the packet type for a given block type
 */
export function getPacketTypeForBlock(blockType: string): PacketType | null {
    for (const [packetType, blockTypes] of Object.entries(PACKET_BLOCK_MAP)) {
        if (blockTypes.includes(blockType)) {
            return packetType as PacketType;
        }
    }
    return null;
}

/**
 * Get all compatible packet types for a block
 */
export function getAllPacketTypesForBlock(blockType: string): PacketType[] {
    const types: PacketType[] = [];
    for (const [packetType, blockTypes] of Object.entries(PACKET_BLOCK_MAP)) {
        if (blockTypes.includes(blockType)) {
            types.push(packetType as PacketType);
        }
    }
    return types;
}

