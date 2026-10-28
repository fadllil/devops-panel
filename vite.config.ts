import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import viteCompression from "vite-plugin-compression"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")

  // Tentukan target backend untuk proxy:
  // 1. VITE_API_TARGET jika didefinisikan secara eksplisit
  // 2. Ekstrak origin dari VITE_API_URL jika merupakan absolute URL (http/https)
  // 3. Fallback default: http://localhost:8080
  let apiTarget = env.VITE_API_TARGET
  if (!apiTarget && env.VITE_API_URL && env.VITE_API_URL.startsWith("http")) {
    try {
      const parsed = new URL(env.VITE_API_URL)
      apiTarget = parsed.origin
    } catch {
      apiTarget = env.VITE_API_URL.replace(/\/api\/?$/, "")
    }
  }
  if (!apiTarget) {
    apiTarget = "http://localhost:8080"
  }

  const port = Number(env.VITE_PORT) || 5173

  return {
    plugins: [
      react(),
      tailwindcss(),
      // @ts-expect-error - vite-plugin-compression uses CJS export interop with NodeNext module resolution
      viteCompression({
        algorithm: "gzip",
        ext: ".gz",
        threshold: 10240, // Hanya kompres file > 10KB
        deleteOriginFile: false,
      }),
    ],
    server: {
      port,
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
