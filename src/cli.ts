// Copyright (c) 2026 Carlos Felipe. MIT.
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createCreatorServer } from './server.js';
import { startPreviewHttp } from './http.js';

const args = process.argv.slice(2);
if (args.length === 0 || (args.length === 1 && args[0] === '--stdio')) {
  await createCreatorServer().connect(new StdioServerTransport());
} else if (args.length === 1 && args[0] === '--http-preview') {
  const server = await startPreviewHttp(8787);
  console.error('Radar Creator: prévia local em http://127.0.0.1:8787/mcp');
  const stop = () => { server.close(); server.closeAllConnections(); };
  process.once('SIGINT', stop); process.once('SIGTERM', stop);
} else {
  console.error('Uso: npm start -- [--stdio | --http-preview]'); process.exitCode = 2;
}
