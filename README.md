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
├── api/          # Axios instance & HTTP endpoints (auth, permissions, users, roles, vpn)
├── components/   # Shared UI components (sidebar, can, theme-toggle)
│   └── ui/       # Shadcn UI primitives (button, card, input, label, badge, table, dialog)
├── hooks/        # Custom React hooks (usePermission)
├── lib/          # Utilities (cn helper) & route guards (protectedRouteGuard, permissionRouteGuard)
├── pages/        # Halaman (login, dashboard, users, roles, profile, vpn-servers, vpn-clients, 404)
├── routes/       # Konfigurasi router & AppShell
├── stores/       # Zustand persistent auth store
├── styles/       # globals.css dengan tema Light & Dark
└── types/        # TypeScript DTO dan models (auth, vpn-server, vpn-client)
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

Aplikasi dapat diakses di `http://localhost:5173`. Request `/api/*` secara otomatis di-proxy ke backend sesuai konfigurasi `.env`.

### 3. Konfigurasi Environment (`.env`)

Salin file `.env.example` ke `.env` dan sesuaikan nilainya:

```bash
cp .env.example .env
```

| Variabel | Default | Deskripsi |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080/api` | Base URL API backend devops-service (bisa URL absolut atau `/api`) |
| `VITE_API_TARGET` | `http://localhost:8080` | Host backend target untuk internal proxy Vite development |
| `VITE_API_TIMEOUT` | `30000` | Timeout request HTTP dalam milidetik (30 detik) |
| `VITE_APP_TITLE` | `DevOps Panel - OpenVPN Management` | Judul aplikasi pada browser tab (`index.html`) |
| `VITE_PORT` | `5173` | Port dev server Vite |
| `VITE_DEFAULT_THEME` | `dark` | Tema awal sebelum user melakukan toggle (`dark` / `light`) |

### 4. Build Produksi

```bash
# Build lokal via Vite
npm run build
```

### 5. Menjalankan Menggunakan Docker

```bash
# Build docker image (bisa custom VITE_API_URL via --build-arg)
docker build -t devops-panel .

# Atau build dengan mengarahkan API URL tertentu:
docker build --build-arg VITE_API_URL=https://devops-service.assist.id/api -t devops-panel .

# Jalankan container (port 80 di host diarahkan ke port 80 container)
docker run -d -p 80:80 --name devops-panel devops-panel
```

---

## Fitur Utama

- 🌓 **Dukungan Tema Penuh**: Switcher Light dan Dark mode instan yang didukung oleh token warna Shadcn UI.
- 🔐 **Autentikasi & Guard**: Sesi terproteksi dengan TanStack Router guards (`protectedRouteGuard`, `permissionRouteGuard`) dan silent token refresh pada error 401.
- 🛡️ **Role-Based Access Control (RBAC)**:
  - **Custom Role & Permission Matrix**: Form pembuatan/edit role interaktif dengan checklist hak akses per modul (VPN Servers, VPN Clients, Users, Roles).
  - **Dynamic Navigation**: Menu sidebar secara otomatis menyembunyikan tautan yang permission bacanya tidak dimiliki pengguna.
  - **Declarative Action Boundaries**: Komponen `<Can do="...">` dan hook `usePermission()` untuk memproteksi tombol aksi (Create, Edit, Delete, Revoke, Download Config, Send Email).
  - **Superadmin Bypass**: Perlindungan khusus untuk role Superadmin (melewati seluruh pengecekan izin dan dilindungi dari penghapusan).
- 👥 **Manajemen User & Role**: CRUD pengguna dan role lengkap dengan paginasi, pencarian, dan integrasi penugasan role.
- 🔑 **Manajemen OpenVPN**: CRUD server & client VPN, penerbitan sertifikat, unduh `.ovpn`, pengiriman email profil, serta statistik bandwidth.
- 🎨 **Tampilan Modern**: Halaman login dan dashboard yang terstruktur, rapi, dan responsif.

---

## API Integration

Frontend berkomunikasi dengan REST API `devops-service` melalui modul pada `src/api/`:

| Modul API | File | Endpoint Utama | Deskripsi |
|---|---|---|---|
| Auth | `api/auth.ts` | `/api/auth/login`, `/api/auth/refresh/:id`, `/api/auth/logout/:id` | Autentikasi JWT |
| Permissions | `api/permissions.ts` | `/api/web/permission/list` | Katalog modul & permissions |
| Roles | `api/roles.ts` | `/api/web/role/*` | CRUD Role & relasi permissions |
| Users | `api/users.ts` | `/api/web/user/*` | CRUD Pengguna & penugasan role |
| VPN Servers | `api/vpn-servers.ts` | `/api/web/vpn-server/*` | CRUD Server OpenVPN |
| VPN Clients | `api/vpn-clients.ts` | `/api/web/vpn-client/*` | CRUD Client, download config, send email |

---

## Changelog & Catatan Pembaruan

### 2026-10-28 — Implementasi Penuh RBAC (Frontend & Backend)
- **Database & Backend**: Menambahkan tabel `permissions`, `role_permissions`, seeder 19 default permissions, dan Gin `RBACMiddleware` dengan cache Redis.
- **Frontend Architecture**:
  - Menambahkan hook `usePermission` dan komponen deklaratif `<Can>`.
  - Mengimplementasikan `permissionRouteGuard` pada route TanStack Router.
  - Sidebar dinamis menyaring menu sesuai izin user yang login.
  - Proteksi tombol aksi di seluruh halaman (`vpn-servers`, `vpn-clients`, `users`).
  - Halaman `/roles` dilengkapi form matriks checklist izin modular per kategori.

---

## Dokumentasi Konteks & Aturan AI

- Untuk aturan pengembangan AI agent: [.agents/AGENTS.md](.agents/AGENTS.md)
- Untuk konteks mendalam arsitektur frontend: [CONTEXT.md](CONTEXT.md)
- Untuk arsitektur monorepo keseluruhan: [../CONTEXT.md](../CONTEXT.md)
