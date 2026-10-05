import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
const root = resolve("docs");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".json": "application/json" };
createServer(async (req, res) => {
  const path = resolve(root, "." + new URL(req.url, "http://localhost").pathname);
  if (path !== root && !path.startsWith(root + "/")) { res.writeHead(403); res.end(); return; }
  try { const file = path === root ? root + "/index.html" : path; res.setHeader("Content-Type", types[extname(file)] ?? "application/octet-stream"); res.end(await readFile(file)); }
  catch { res.writeHead(404); res.end("Not found"); }
}).listen(Number(process.env.PORT ?? 6713), "127.0.0.1", () => console.log("Jirai is ready on localhost:" + (process.env.PORT ?? 6713)));
