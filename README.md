# DevOps Panel (Frontend)

Antarmuka web manajemen DevOps berbasis React 19, TypeScript, Vite, dan Tailwind CSS v4 dengan komponen Shadcn UI. Dashboard ini terintegrasi dengan backend [devops-service](../devops-service) untuk mengelola pengguna, role, dan OpenVPN.

---

## Tech Stack

- **Framework**: React 19, TypeScript
- **Bundler**: Vite 8
- **Routing**: `@tanstack/react-router`
- **State Management**: Zustand
- **Server State**: `@tanstack/react-query`
- **Styling**: Tailwind CSS v4, `tw-animate-css`
- **Design System**: Shadcn UI (`base-nova` style, Base UI primitives, OKLCH color variables)
- **Icons & Notification**: `lucide-react`, `sonner`

---

## Struktur Direktori

```
src/
├── api/          # Axios instance & HTTP endpoints (auth, users, roles)
├── components/   # Shared UI components (sidebar, theme-toggle)
│   └── ui/       # Shadcn UI primitives (button, card, input, label, badge, table)
├── lib/          # Utilities (cn helper) & route guards
├── pages/        # Halaman (login, dashboard, users, roles, profile, 404)
├── routes/       # Konfigurasi router & AppShell
├── stores/       # Zustand persistent auth store
├── styles/       # globals.css dengan tema Light & Dark
└── types/        # TypeScript DTO dan models
```

---

## Memulai Pengembangan

### 1. Prasyarat
- Node.js v20+
- Backend `devops-service` berjalan di port `8080` (opsional untuk full flow)

### 2. Instalasi & Menjalankan

```bash
# Instal dependensi
npm install

# Jalankan server pengembangan (Hot Module Replacement)
npm run dev
```

Aplikasi dapat diakses di `http://localhost:5173`. Request `/api/*` secara otomatis di-proxy ke backend `http://localhost:8080`.

### 3. Build Produksi

```bash
npm run build
```

---

## Fitur Utama

- 🌓 **Dukungan Tema Penuh**: Switcher Light dan Dark mode instan yang didukung oleh token warna Shadcn UI.
- 🔐 **Autentikasi & Guard**: Sesi terproteksi dengan TanStack Router guards dan silent token refresh pada error 401.
- 👥 **Manajemen User & Role**: CRUD pengguna dan role lengkap dengan paginasi, pencarian, dan modal interaktif.
- 🎨 **Tampilan Modern**: Halaman login dan dashboard yang terstruktur, rapi, dan responsif.

---

## Dokumentasi Konteks & Aturan AI

- Untuk aturan pengembangan AI agent: [.agents/AGENTS.md](.agents/AGENTS.md)
- Untuk konteks mendalam arsitektur frontend: [CONTEXT.md](CONTEXT.md)
- Untuk arsitektur monorepo keseluruhan: [../CONTEXT.md](../CONTEXT.md)
