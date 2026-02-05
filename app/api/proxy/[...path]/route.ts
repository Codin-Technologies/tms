import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.API_BASE_URL || 'http://194.146.13.23';

export async function forward(req: NextRequest, pathSegments?: string[]) {
  const path = (pathSegments || []).join('/');
  const search = req.nextUrl.search ?? '';
  const url = `${BACKEND}/${path}${search}`;

  // Copy headers but avoid Host header
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'host') return;
    headers[key] = value;
  });

  // Build fetch init
  const method = req.method;
  const init: RequestInit = {
    method,
    headers,
    // Only attach body for non-GET/HEAD requests
    body: method === 'GET' || method === 'HEAD' ? undefined : await req.arrayBuffer(),
    redirect: 'manual',
  };

  const resp = await fetch(url, init);

  // Clone response body as ArrayBuffer (works for JSON and other content)
  const data = await resp.arrayBuffer();

  // Forward most headers back but strip hop-by-hop headers
  const responseHeaders: Record<string, string> = {};
  resp.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (k === 'transfer-encoding' || k === 'content-encoding') return;
    responseHeaders[key] = value;
  });

  return new NextResponse(data, { status: resp.status, headers: responseHeaders });
}

export async function GET(req: NextRequest, context: any) {
  const params = context?.params instanceof Promise ? await context.params : context?.params;
  return forward(req, params?.path);
}
export async function POST(req: NextRequest, context: any) {
  const params = context?.params instanceof Promise ? await context.params : context?.params;
  return forward(req, params?.path);
}
export async function PUT(req: NextRequest, context: any) {
  const params = context?.params instanceof Promise ? await context.params : context?.params;
  return forward(req, params?.path);
}
export async function PATCH(req: NextRequest, context: any) {
  const params = context?.params instanceof Promise ? await context.params : context?.params;
  return forward(req, params?.path);
}
export async function DELETE(req: NextRequest, context: any) {
  const params = context?.params instanceof Promise ? await context.params : context?.params;
  return forward(req, params?.path);
}
export async function OPTIONS() {
  // Basic preflight response
  return new NextResponse(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' } });
}
