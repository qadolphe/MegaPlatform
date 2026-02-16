import { McpTool } from "../common/types.js";
import { legacyTools } from "./legacy-tools.js";
import { sdkTools } from "./sdk-tools.js";

export const tools: McpTool[] = [...legacyTools, ...sdkTools];
