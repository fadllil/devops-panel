/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_API_BASE_URL?: string
  readonly VITE_API_TARGET?: string
  readonly VITE_API_TIMEOUT?: string
  readonly VITE_APP_TITLE?: string
  readonly VITE_PORT?: string
  readonly VITE_DEFAULT_THEME?: "light" | "dark"
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
