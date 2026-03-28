import { NextRequest } from 'next/server';
import { MCP_SERVER_INFO } from '@/lib/mcp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial server info as SSE event
      const serverInfo = {
        jsonrpc: '2.0',
        method: 'notifications/initialized',
        params: {
          serverInfo: MCP_SERVER_INFO,
          capabilities: {
            tools: { listChanged: false },
            resources: { listChanged: false },
          },
        },
      };

      controller.enqueue(encoder.encode(`data: ${JSON.stringify(serverInfo)}\n\n`));

      // Keep connection alive with heartbeat
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          clearInterval(heartbeat);
        }
      }, 30000);

      // Clean up on close
      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        try { controller.close(); } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
