import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import type { ViteDevServer } from 'vite'
import type { IncomingMessage, ServerResponse } from 'http'
import tailwindcss from '@tailwindcss/vite'

// Plugin minimo para servir .pmtiles con soporte Range, requerido por pmtiles Protocol (FetchSource)
// Vite dev no envia 206 por defecto; sin esto el mapa queda en fondo negro y error en consola.
function pmtilesRangePlugin() {
    return {
        name: 'pmtiles-range',
        configureServer(server: ViteDevServer) {
            server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
                if (!req.url || !req.url.includes('.pmtiles')) return next();
                const filePath = path.join(process.cwd(), 'public', path.basename(req.url.split('?')[0]));
                if (!fs.existsSync(filePath)) return next();
                const stat = fs.statSync(filePath);
                const range = req.headers.range;
                // pmtiles siempre pide Range: bytes=start-end
                if (range) {
                    const match = /bytes=(\d+)-(\d*)/.exec(range);
                    if (match) {
                        const start = parseInt(match[1], 10);
                        const end = match[2] ? parseInt(match[2], 10) : stat.size - 1;
                        const chunkSize = end - start + 1;
                        res.writeHead(206, {
                            'Content-Range': `bytes ${start}-${end}/${stat.size}`,
                            'Accept-Ranges': 'bytes',
                            'Content-Length': chunkSize,
                            'Content-Type': 'application/octet-stream',
                            'Cache-Control': 'public, max-age=0',
                        });
                        fs.createReadStream(filePath, { start, end }).pipe(res);
                        return;
                    }
                }
                // sin Range: respuesta normal
                res.writeHead(200, {
                    'Content-Length': stat.size,
                    'Accept-Ranges': 'bytes',
                    'Content-Type': 'application/octet-stream',
                });
                fs.createReadStream(filePath).pipe(res);
            });
        },
    };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), pmtilesRangePlugin(), tailwindcss()],

  worker: {
    format: 'es',
  },
  optimizeDeps: {
    exclude: ['maplibre-gl'],
  },
  // @ts-expect-error vitest types no incluidos en vite UserConfig
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  } as unknown as Record<string, unknown>,
})
