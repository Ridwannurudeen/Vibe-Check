import { NextResponse } from 'next/server';
import { MCP_SERVER_INFO, MCP_TOOLS } from '@/lib/mcp';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    server: MCP_SERVER_INFO,
    tools: MCP_TOOLS.map(t => t.name),
    timestamp: new Date().toISOString(),
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
}
