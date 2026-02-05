import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'sku_list.json');
    const raw = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(raw);

    // The JSON structure contains an object with `data` array
    const items = Array.isArray(parsed.data) ? parsed.data : [];
    const brands = Array.from(new Set(items.map((i: any) => (i.brand || '').toString().trim()).filter(Boolean))) as string[];

    // Sort alphabetically
    brands.sort((a: string, b: string) => a.localeCompare(b));

    return NextResponse.json({ success: true, data: brands });
  } catch (error: any) {
    console.error('Failed to read sku_list.json for brands', error);
    return NextResponse.json({ success: false, message: 'Unable to load brands' }, { status: 500 });
  }
}