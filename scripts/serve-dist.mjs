// Serves dist/ with the security headers from netlify.toml.
//
// `yarn dev` and `yarn preview` send no Content-Security-Policy, so a change
// that the production policy would block looks fine locally. This server is
// what the browser tests run against, and `yarn serve:dist` runs it by hand.
import http from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const root = path.join(projectRoot, 'dist')
const port = Number(process.env.PORT) || 4391

/** Read the `[headers.values]` tables from netlify.toml, keyed by their `for` pattern. */
async function loadHeaderRules() {
  const toml = await readFile(path.join(projectRoot, 'netlify.toml'), 'utf8')
  return toml.split('[[headers]]').slice(1).map((block) => {
    const pattern = /^\s*for = "(.*)"\s*$/m.exec(block)?.[1] ?? '/*'
    const values = {}
    const body = block.split('[headers.values]')[1] ?? ''
    for (const m of body.matchAll(/^\s*([A-Z-]+) = "(.*)"\s*$/gim)) values[m[1]] = m[2]
    return { prefix: pattern.replace(/\*$/, ''), values }
  })
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
  '.xsl': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
}

const rules = await loadHeaderRules()

http.createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
  const headers = {}
  for (const rule of rules) {
    if (pathname.startsWith(rule.prefix)) Object.assign(headers, rule.values)
  }

  let file = path.join(root, pathname)
  if (file !== root && !file.startsWith(root + path.sep)) {
    res.writeHead(403, headers)
    res.end('Forbidden')
    return
  }
  try {
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html')
  }
  catch {
    if (!path.extname(file)) file = path.join(file, 'index.html')
  }
  try {
    const body = await readFile(file)
    res.writeHead(200, { ...headers, 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream' })
    res.end(body)
  }
  catch {
    res.writeHead(404, { ...headers, 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Not found')
  }
}).listen(port, '127.0.0.1', () => {
  console.warn(`Serving dist/ with netlify.toml headers at http://127.0.0.1:${port}`)
})
