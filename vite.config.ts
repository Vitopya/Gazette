import { defineConfig, type Plugin, type Connect } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import type { IncomingMessage, ServerResponse } from 'http'

type VercelHandler = (
  req: IncomingMessage & { query?: Record<string, string>; body?: unknown },
  res: ServerResponse,
) => void | Promise<void>

function vercelApiPlugin(): Plugin {
  return {
    name: 'vercel-api-emulation',
    configureServer(server) {
      const middleware: Connect.NextHandleFunction = async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next()
        const url = new URL(req.url, 'http://local')
        const route = url.pathname.replace(/^\/api\//, '').replace(/\.(ts|js)$/, '')
        try {
          const mod = await server.ssrLoadModule(
            path.resolve(process.cwd(), `api/${route}.ts`),
          )
          const handler = mod.default as VercelHandler
          if (typeof handler !== 'function') {
            res.statusCode = 500
            res.end(`No default export from api/${route}.ts`)
            return
          }
          const query: Record<string, string> = {}
          url.searchParams.forEach((value, key) => {
            query[key] = value
          })
          ;(req as unknown as { query: Record<string, string> }).query = query

          if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            await new Promise<void>((resolve, reject) => {
              const chunks: Buffer[] = []
              req.on('data', (chunk: Buffer) => chunks.push(chunk))
              req.on('end', () => {
                const raw = Buffer.concat(chunks).toString('utf8')
                if (raw) {
                  try {
                    ;(req as unknown as { body: unknown }).body = JSON.parse(raw)
                  } catch {
                    ;(req as unknown as { body: unknown }).body = raw
                  }
                }
                resolve()
              })
              req.on('error', reject)
            })
          }
          await handler(req as Parameters<VercelHandler>[0], res)
        } catch (error) {
          const code = (error as NodeJS.ErrnoException).code
          if (code === 'ERR_MODULE_NOT_FOUND' || code === 'ENOENT') return next()
          console.error('[api] handler error:', error)
          if (!res.headersSent) {
            res.statusCode = 500
            res.setHeader('content-type', 'application/json')
            res.end(JSON.stringify({ error: String((error as Error).message ?? error) }))
          }
        }
      }
      server.middlewares.use(middleware)
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), vercelApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
})
