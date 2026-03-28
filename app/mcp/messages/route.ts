import { NextRequest, NextResponse } from 'next/server';
import { MCP_SERVER_INFO, MCP_TOOLS, MCP_RESOURCES, executeTool, readResource } from '@/lib/mcp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, method, params } = body;

    let result: any;

    switch (method) {
      case 'initialize':
        result = {
          protocolVersion: '2024-11-05',
          serverInfo: MCP_SERVER_INFO,
          capabilities: {
            tools: { listChanged: false },
            resources: { listChanged: false },
          },
        };
        break;

      case 'tools/list':
        result = { tools: MCP_TOOLS };
        break;

      case 'tools/call': {
        const { name, arguments: args } = params;
        try {
          const toolResult = await executeTool(name, args || {});
          result = {
            content: [
              { type: 'text', text: JSON.stringify(toolResult, null, 2) },
            ],
          };
        } catch (err) {
          result = {
            content: [
              { type: 'text', text: `Error: ${err instanceof Error ? err.message : 'Unknown error'}` },
            ],
            isError: true,
          };
        }
        break;
      }

      case 'resources/list':
        result = { resources: MCP_RESOURCES };
        break;

      case 'resources/read': {
        const { uri } = params;
        try {
          const resource = await readResource(uri);
          result = {
            contents: [
              { uri, mimeType: 'application/json', text: JSON.stringify(resource, null, 2) },
            ],
          };
        } catch (err) {
          return NextResponse.json(
            { jsonrpc: '2.0', id, error: { code: -32602, message: err instanceof Error ? err.message : 'Unknown error' } },
            { headers: CORS_HEADERS }
          );
        }
        break;
      }

      case 'ping':
        result = {};
        break;

      default:
        return NextResponse.json(
          { jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${method}` } },
          { headers: CORS_HEADERS }
        );
    }

    return NextResponse.json(
      { jsonrpc: '2.0', id, result },
      { headers: CORS_HEADERS }
    );
  } catch {
    return NextResponse.json(
      { jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } },
      { status: 400, headers: CORS_HEADERS }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
