import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Dev proxy target: the Vite dev server forwards /api and /hubs here so the
  // browser only ever talks to its own origin (same-origin → no CORS; the login
  // cookie flows with withCredentials). Override with VITE_API_PROXY_TARGET.
  const target =
    env.VITE_API_PROXY_TARGET || 'https://api.omnichannel.nguetioofa.dev'

  return {
    plugins: [react(), tailwindcss(), TanStackRouterVite()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        // REST API
        '/api': {
          target,
          changeOrigin: true,
          secure: false,
          // Strip the cookie Domain so the browser keeps it host-only on localhost.
          cookieDomainRewrite: '',
        },
        // SignalR hub (WebSockets)
        '/hubs': {
          target,
          changeOrigin: true,
          secure: false,
          ws: true,
          cookieDomainRewrite: '',
        },
      },
    },
  }
})
