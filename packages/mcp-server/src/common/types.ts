import { ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

export interface McpPrompt {
    name: string;
    description?: string;
    execute: (args: Record<string, string>) => Promise<string>; // Simple text return for now
}

export interface McpTool {
    name: string;
    description: string;
    schema: {
        input: z.ZodType<any>;
    };
    execute: (args: any) => Promise<any>;
}
