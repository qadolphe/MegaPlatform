#!/usr/bin/env node
import { McpServer } from "./server.js";

const server = new McpServer();

server.run().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
