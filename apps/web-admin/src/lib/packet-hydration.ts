import { supabase } from "@repo/database";

export type PacketType = "feature" | "testimonial" | "faq" | "text_block" | "media" | "stat";

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
        case "BenefitsGrid":
            return "features";
        case "InfoGrid":
        case "UniversalGrid":
            return "items";
        case "Testimonials":
            return "testimonials";
        case "FAQ":
            return "faqs";
        case "TextContent":
            return "content";
        case "StatsSection":
            return "stats";
        default:
            return "items";
    }
}

/**
 * Transform packet data to match component's expected format
 */
function transformPacketForBlock(packet: ContentPacket, blockType: string): any {
    const data = packet.data;

    if (blockType === "StatsSection" && packet.type === "stat") {
        return {
            value: data.value ?? "",
            label: data.label ?? "",
            prefix: data.prefix,
            suffix: data.suffix,
        };
    }

    // UniversalGrid expects GridItem objects with type, title, description, image, colSpan, etc.
    if (blockType === "UniversalGrid") {
        switch (packet.type) {
            case "feature":
                return {
                    type: "info",
                    title: data.title || "",
                    description: data.description || "",
                    icon: data.icon,
                    image: data.image || "",
                    colSpan: data.colSpan || 1,
                };
            case "testimonial":
                return {
                    type: "info",
                    title: data.author || "Customer",
                    description: data.quote || "",
                    image: data.image || data.avatar_url || "",
                    colSpan: data.colSpan || 1,
                };
            case "media":
                return {
                    type: "image",
                    title: data.alt || "",
                    description: data.caption || "",
                    image: data.url || "",
                    colSpan: data.colSpan || 1,
                };
            case "faq":
                return {
                    type: "info",
                    title: data.question || "",
                    description: data.answer || "",
                    image: data.image || "",
                    colSpan: data.colSpan || 1,
                };
            default:
                return { ...data, colSpan: data.colSpan || 1 };
        }
    }

    // For other blocks, return raw data with colSpan
    return { ...data, colSpan: data.colSpan || 1 };
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
        .map((packet) => transformPacketForBlock(packet!, block.type));

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
    stat: ["StatsSection"],
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

