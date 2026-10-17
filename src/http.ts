// Copyright (c) 2026 Carlos Felipe. MIT. Loopback preview transport; no private state.
import { createServer, type Server } from 'node:http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createCreatorServer } from './server.js';

const MAX_BYTES = 16 * 1024;
export async function startPreviewHttp(port = 0): Promise<Server> {
  const server = createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const host = req.headers.host;
    const address = server.address();
    const expectedHost = address && typeof address !== 'string' ? `127.0.0.1:${address.port}` : '';
    if (host !== expectedHost || (req.headers.origin && req.headers.origin !== `http://${expectedHost}`)) {
      res.writeHead(403); res.end(); return;
    }
    if (req.url === '/healthz' && req.method === 'GET') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ok: true, mode: 'preview-only', chatgptConnected: false })); return;
    }
    if (req.url !== '/mcp') { res.writeHead(404); res.end(); return; }
    if (req.method !== 'POST') { res.writeHead(405, { Allow: 'POST' }); res.end(); return; }
    if (!req.headers['content-type']?.startsWith('application/json')) { res.writeHead(415); res.end(); return; }
    let bytes = 0;
    const chunks: Buffer[] = [];
    let body: unknown;
    try {
      for await (const chunk of req) {
        const data = Buffer.from(chunk); bytes += data.byteLength;
        if (bytes > MAX_BYTES) { res.writeHead(413); res.end(); return; }
        chunks.push(data);
      }
      body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch { res.writeHead(400); res.end(); return; }
    const mcp = createCreatorServer();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    let closing: Promise<unknown> | undefined;
    const close = () => closing ??= Promise.allSettled([transport.close(), mcp.close()]);
    res.once('close', () => { void close(); });
    try {
      await mcp.connect(transport);
      await transport.handleRequest(req, res, body);
    } catch {
      if (!res.headersSent) res.writeHead(500);
      if (!res.writableEnded) res.end();
      await close();
    }
  });
  server.requestTimeout = 10_000; server.headersTimeout = 5_000;
  server.maxHeadersCount = 30; server.maxRequestsPerSocket = 100;
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject); server.listen(port, '127.0.0.1', () => { server.off('error', reject); resolve(); });
  });
  return server;
}
