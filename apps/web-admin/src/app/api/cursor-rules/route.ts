import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { CURSOR_RULES_FALLBACK } from '@repo/config';

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
    return NextResponse.json({ content: CURSOR_RULES_FALLBACK });
  } catch (error) {
    console.error('Error reading cursor rules:', error);
    return NextResponse.json({ content: CURSOR_RULES_FALLBACK });
  }
}
