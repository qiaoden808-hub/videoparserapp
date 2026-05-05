import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const filePath = path.join(process.cwd(), 'public', 'install.mobileconfig');
  const content = fs.readFileSync(filePath, 'utf-8');

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'application/x-apple-aspen-config',
      'Content-Disposition': 'attachment; filename="videoparser.mobileconfig"',
    },
  });
}
