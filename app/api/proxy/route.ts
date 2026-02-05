import { NextRequest, NextResponse } from 'next/server';
import { forward as _forward } from './[...path]/route';

// Delegate to the catch-all handler with an empty path
export async function GET(req: NextRequest) {
  // @ts-ignore - simply reuse the helper with no segments
  return _forward(req, []);
}
export async function POST(req: NextRequest) {
  // @ts-ignore
  return _forward(req, []);
}
export async function PUT(req: NextRequest) {
  // @ts-ignore
  return _forward(req, []);
}
export async function PATCH(req: NextRequest) {
  // @ts-ignore
  return _forward(req, []);
}
export async function DELETE(req: NextRequest) {
  // @ts-ignore
  return _forward(req, []);
}
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' } });
}
