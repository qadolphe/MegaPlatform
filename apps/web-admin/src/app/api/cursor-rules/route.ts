import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Fallback rules in case file access fails (e.g. in production/serverless environment where monorepo structure is lost)
const FALLBACK_RULES = `# SwatBloc SDK - Cursor Rules

You are building an app that uses the SwatBloc SDK for headless commerce.

## Installation

\`\`\`bash
npm install @swatbloc/sdk
\`\`\`

## Initialization

\`\`\`typescript
import { SwatBloc } from '@swatbloc/sdk';

// Initialize with your public API key
const swat = new SwatBloc('pk_live_xxxxx');
\`\`\`

## Feature: Custom Databases (Virtual Tables)

Use \`swat.db\` to manage application-specific data.

\`\`\`typescript
// 1. Define Schema (Safe to run multiple times)
await swat.db.createModel('Logs', 'logs', {
  fields: [
    { key: 'level', type: 'text', required: true },
    { key: 'message', type: 'text' }
  ]
});

// 2. Insert Data
await swat.db.collection('logs').create({
  level: 'info',
  message: 'User logged in'
});

// 3. Query
const logs = await swat.db.collection('logs').list({
  filter: { level: 'info' }
});
\`\`\`

## Commerce Features

### Products
\`\`\`typescript
const products = await swat.products.list();
\`\`\`

### Cart & Checkout
\`\`\`typescript
const cart = await swat.cart.create([{ productId: 'p1', quantity: 1 }]);
const session = await swat.checkout.create(cart.id, {
  successUrl: 'https://site.com/success',
  cancelUrl: 'https://site.com/cancel'
});
\`\`\`
`;

export async function GET() {
  try {
    // Attempt to read the file from the monorepo structure
    // In dev: process.cwd() is apps/web-admin
    const filePath = path.join(process.cwd(), '../../packages/sdk/cursorrules.md');
    
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return NextResponse.json({ content });
    } else {
        // Try one level up just in case
        const filePathAlt = path.join(process.cwd(), '../packages/sdk/cursorrules.md');
        if (fs.existsSync(filePathAlt)) {
            const content = fs.readFileSync(filePathAlt, 'utf-8');
            return NextResponse.json({ content });
        }
    }

    console.warn('Could not find cursorrules.md at', filePath, '- using fallback');
    return NextResponse.json({ content: FALLBACK_RULES });
  } catch (error) {
    console.error('Error reading cursor rules:', error);
    return NextResponse.json({ content: FALLBACK_RULES });
  }
}
