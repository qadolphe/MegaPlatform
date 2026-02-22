# MegaPlatform MCP Server

This package provides a Model Context Protocol (MCP) server for the MegaPlatform monorepo.

## Features
- **Project Rules**: Provides project rules and guidelines to AI agents via the `project-rules` prompt.
- **SDK Tools**: Provides tools to interact with the SwatBloc SDK directly from the AI agent (e.g., `sdk_products`, `sdk_orders` with guest lookup, `sdk_content`, etc.).

## Usage
To use this with your AI assistant (e.g., Claude Desktop, Cursor, etc.), configure it as a local MCP server.

### Configuration
**Command:** `node`
**Args:** `[absolute-path-to-repo]/packages/mcp-server/dist/index.js`

### Development
- `npm install`: Install dependencies
- `npm run build`: Build the server
- `npm run dev`: Watch mode

:)