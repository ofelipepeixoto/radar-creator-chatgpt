import test from 'node:test';
import assert from 'node:assert/strict';
import { request } from 'node:http';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { startPreviewHttp } from '../dist/http.js';

const fixture = { title: 'Convite da agência', brand: 'Agência Camaleão', kind: 'video',
  idea: 'Apresentar os serviços em português e convidar para conversar.',
  aspectRatio: '9:16', durationSeconds: 10, language: 'pt-BR' };

async function checkClient(client) {
  const { tools } = await client.listTools();
  assert.deepEqual(tools.map(t => t.name).sort(), ['creator_capabilities', 'creator_prepare_brief']);
  for (const tool of tools) {
    assert.equal(tool.annotations.readOnlyHint, true);
    assert.equal(tool.annotations.openWorldHint, false);
    assert.equal(tool.inputSchema.additionalProperties, false);
  }
  const catalog = await client.callTool({ name: 'creator_capabilities', arguments: {} });
  assert.equal(catalog.structuredContent.openCreatorConnected, false);
  const result = await client.callTool({ name: 'creator_prepare_brief', arguments: fixture });
  assert.equal(result.isError, undefined);
  assert.equal(result.structuredContent.studioRequest.duration_seconds, 10);
  assert.equal(result.structuredContent.submissionEnabled, false);
  const invalid = await client.callTool({ name: 'creator_prepare_brief', arguments: { ...fixture, durationSeconds: 0 } });
  assert.equal(invalid.isError, true);
  const authority = await client.callTool({ name: 'creator_prepare_brief', arguments: { ...fixture, approved: true } });
  assert.equal(authority.isError, true);
  const unknown = await client.callTool({ name: 'creator_apply_action', arguments: {} });
  assert.equal(unknown.isError, true);
}

test('official MCP client initializes, lists and calls tools over real stdio', async () => {
  const transport = new StdioClientTransport({ command: process.execPath, args: ['dist/cli.js', '--stdio'],
    cwd: process.cwd(), env: { PATH: process.env.PATH }, stderr: 'pipe' });
  const client = new Client({ name: 'radar-fixture', version: '1.0.0' });
  try { await client.connect(transport); await checkClient(client); }
  finally { await client.close(); }
});

test('official MCP client works over real local Streamable HTTP', async () => {
  const server = await startPreviewHttp();
  const client = new Client({ name: 'radar-fixture', version: '1.0.0' });
  const url = new URL(`http://127.0.0.1:${server.address().port}/mcp`);
  try {
    await client.connect(new StreamableHTTPClientTransport(url));
    await checkClient(client);
  } finally {
    await client.close(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
  }
});

test('HTTP boundary rejects other origins, hosts, paths, methods and excess bytes', async () => {
  const server = await startPreviewHttp();
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const [path, options, expected] of [
      ['/mcp', { method: 'POST', headers: { Origin: 'https://outside.invalid' } }, 403],
      ['/mcp', { method: 'GET' }, 405],
      ['/wrong', { method: 'POST' }, 404],
      ['/mcp', { method: 'POST' }, 415],
      ['/mcp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' }, 400],
      ['/mcp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: 'x'.repeat(17000) }, 413],
    ]) assert.equal((await fetch(base + path, options)).status, expected);
    const rejectedHost = await new Promise((resolve, reject) => {
      const req = request(base + '/mcp', { method: 'POST', headers: { Host: 'outside.invalid' } }, res => {
        res.resume(); resolve(res.statusCode);
      });
      req.on('error', reject); req.end();
    });
    assert.equal(rejectedHost, 403);
    const health = await fetch(base + '/healthz');
    assert.equal(health.headers.get('cache-control'), 'no-store');
    assert.equal((await health.json()).chatgptConnected, false);
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});
