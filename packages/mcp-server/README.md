# MegaPlatform MCP Server

This package provides a Model Context Protocol (MCP) server for the MegaPlatform monorepo.

## Features
- **Project Rules**: Provides project rules and guidelines to AI agents via the `project-rules` prompt.

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