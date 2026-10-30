import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
const port = Number(process.env.PORT || 3000);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript' };
http.createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const file = { '/': 'index.html', '/style.css': 'style.css', '/app.js': 'app.js' }[pathname];
  if (!file) { res.writeHead(404); return res.end('Ikke fundet'); }
  try { res.setHeader('Content-Type', types[path.extname(file)]); res.end(await readFile(new URL(`./public/${file}`, import.meta.url))); }
  catch { res.writeHead(500); res.end('Kunne ikke hente siden'); }
}).listen(port, '127.0.0.1', () => console.log(`Local: http://localhost:${port}`));
