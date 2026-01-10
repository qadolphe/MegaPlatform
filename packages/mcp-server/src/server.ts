import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    ListPromptsRequestSchema,
    GetPromptRequestSchema,
    ListToolsRequestSchema,
    CallToolRequestSchema,
    ErrorCode,
    McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { prompts } from "./prompts/index.js";
import { tools } from "./tools/index.js";
import { zodToJsonSchema } from "zod-to-json-schema";

export class McpServer {
    private server: Server;

    constructor() {
        this.server = new Server(
            {
                name: "megaplatform-mcp",
                version: "0.1.0",
            },
            {
                capabilities: {
                    prompts: {},
                    tools: {},
                },
            }
        );

        this.setupHandlers();
    }

    private setupHandlers() {
        // Prompts
        this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
            return {
                prompts: prompts.map((p) => ({
                    name: p.name,
                    description: p.description,
                })),
            };
        });

        this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
            const prompt = prompts.find((p) => p.name === request.params.name);
            if (!prompt) {
                throw new McpError(ErrorCode.MethodNotFound, "Prompt not found");
            }

            const result = await prompt.execute(request.params.arguments || {});

            return {
                messages: [
                    {
                        role: "user",
                        content: {
                            type: "text",
                            text: "Generative request", // Placeholder, commonly ignored by prompt users who just want the context
                        },
                    },
                    {
                        role: "assistant",
                        content: {
                            type: "text",
                            text: result,
                        },
                    },
                ],
            };
        });

        // Tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: tools.map((t) => ({
                    name: t.name,
                    description: t.description,
                    inputSchema: zodToJsonSchema(t.schema.input as any) as any,
                })),
            };
        });

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const tool = tools.find((t) => t.name === request.params.name);
            if (!tool) {
                throw new McpError(ErrorCode.MethodNotFound, "Tool not found");
            }

            try {
                // Validate arguments
                const args = tool.schema.input.parse(request.params.arguments);
                const result = await tool.execute(args);

                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            } catch (error: any) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        });
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("MCP Server running on stdio");
    }
}
