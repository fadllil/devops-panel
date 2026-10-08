# DevOps Panel — Frontend Context

> **Auto-updated**: Dokumen ini mendokumentasikan arsitektur, state, halaman, dan desain `devops-panel`.
> Terakhir diperbarui: **2026-10-09**

---

## Overview

**devops-panel** adalah antarmuka web (SPA) untuk platform manajemen DevOps OpenVPN. Dashboard ini berinteraksi langsung dengan backend API `devops-service` (port 8080) untuk mengelola pengguna, role, konfigurasi server OpenVPN, client VPN, dan pemantauan sistem.

---

## Tech Stack

| Kategori | Teknologi | Deskripsi |
|---|---|---|
| Framework & Runtime | React 19 + TypeScript | UI Library modern dengan full type safety |
| Build Tool | Vite 8 | Bundler cepat dengan plugin `@tailwindcss/vite` |
| Routing | `@tanstack/react-router` (v1) | Routing client-side dengan route guards |
| State Management | Zustand (v5) | Auth credentials store dengan persistensi `localStorage` |
| Server State | `@tanstack/react-query` (v5) | Data fetching, cache, dan revalidasi |
| HTTP Client | Axios (v1) | Interceptor auth token dan auto-refresh JWT |
| Styling | Tailwind CSS v4 + tw-animate-css | Utility-first CSS dengan engine `@theme inline` |
| UI Components | Shadcn UI (`base-nova`, Base UI) | Design system berbasis token warna OKLCH |
| Icons & Feedback | `lucide-react`, `sonner` | Koleksi ikon konsisten dan notifikasi toast |

---

## Directory Structure

```
devops-panel/
├── .agents/
│   └── AGENTS.md               # Aturan pengembangan dan konvensi AI agent
├── CONTEXT.md                  # Dokumen konteks frontend ini
├── README.md                   # Dokumentasi instalasi dan perintah dev
├── components.json             # Konfigurasi shadcn UI CLI
├── index.html                  # HTML entry point
├── package.json                # Dependencies dan script
├── tsconfig.app.json           # Konfigurasi TypeScript aplikasi
├── vite.config.ts              # Konfigurasi Vite & proxy API backend
└── src/
    ├── api/                    # Integrasi REST API (Axios)
    │   ├── client.ts           # Axios instance, Bearer token, auto 401 refresh
    │   ├── auth.ts             # Login, logout, refresh API
    │   ├── users.ts            # CRUD Users & status updates
    │   └── roles.ts            # CRUD Roles & listings
    ├── components/             # Reusable UI components
    │   ├── sidebar.tsx         # Sidebar navigasi panel utama
    │   ├── theme-toggle.tsx    # Tombol toggle Light / Dark mode
    │   ├── protected-page-loader.tsx # Loading skeleton untuk protected routes
    │   └── ui/                 # Shadcn UI primitives (Button, Card, Input, Label, Badge, Table)
    ├── lib/                    # Helper & utilities
    │   ├── utils.ts            # Helper cn() (clsx + tailwind-merge)
    │   └── route-guards.ts     # protectedRouteGuard & publicRouteGuard
    ├── pages/                  # Halaman aplikasi
    │   ├── login-page.tsx      # Login form (mendukung penuh Light/Dark mode)
    │   ├── dashboard-page.tsx  # Dashboard overview & selamat datang
    │   ├── users-page.tsx      # Manajemen pengguna internal
    │   ├── roles-page.tsx      # Manajemen role dan izin
    │   ├── profile-page.tsx    # Profil pengguna & ganti password
    │   └── not-found-page.tsx  # Halaman 404 Not Found
    ├── routes/                 # Konfigurasi TanStack Router
    │   └── router.tsx          # Definisi route tree, AppShell, Theme provider
    ├── stores/                 # Zustand store
    │   └── auth-store.ts       # Global auth credentials & session state
    ├── styles/                 # Global styles
    │   └── globals.css         # Tailwind v4, OKLCH color tokens, .dark class
    └── types/                  # TypeScript definitions
        └── auth.ts             # DTO response, UserProfile, Role, Pagination
```

---

## Pages & Routes Status

| Path | Halaman | Status | Guard | Deskripsi |
|---|---|---|---|---|
| `/login` | `LoginPage` | ✅ Selesai | `publicRouteGuard` | Login autentikasi, support Light & Dark theme shadcn UI, toggle show password |
| `/` | `DashboardPage` | ✅ Selesai | `protectedRouteGuard` | Kartu selamat datang, info akun, aksi logout |
| `/users` | `UsersPage` | ✅ Selesai | `protectedRouteGuard` | Tabel user dengan paginasi, pencarian, create, edit modal, toggle aktif |
| `/roles` | `RolesPage` | ✅ Selesai | `protectedRouteGuard` | Tabel role dengan paginasi, pencarian, create, edit modal |
| `/profile` | `ProfilePage` | ✅ Selesai | `protectedRouteGuard` | Detail profil pengguna yang sedang login & form ganti password |
| `*` | `NotFoundPage` | ✅ Selesai | — | Tampilan 404 dengan tombol navigasi kembali |
| `/vpn-servers` | Planned | ⏳ Rencana | `protectedRouteGuard` | Konfigurasi server OpenVPN & kredensial VPN Agent |
| `/vpn-clients` | Planned | ⏳ Rencana | `protectedRouteGuard` | Manajemen client VPN (generate `.ovpn`, revoke, change password) |
| `/logs` | Planned | ⏳ Rencana | `protectedRouteGuard` | Log histori koneksi VPN OpenVPN |

---

## Theme & Design System (Light & Dark Mode)

- **Manajemen Tema**: Dikelola secara reaktif di `src/routes/router.tsx` pada komponen `AppShell`.
- **Penyimpanan**: Disimpan di `window.localStorage` dengan key `devops-theme` (`"light"` atau `"dark"`).
- **Aplikasi Kelas**: Mengaktifkan kelas `dark` pada elemen `<html>` (`document.documentElement.classList.toggle("dark")`).
- **Token Desain**: Didefinisikan di `src/styles/globals.css` menggunakan format OKLCH:
  - `--background`: Putih bersih di Light mode (`oklch(1 0 0)`), hitam elegan di Dark mode (`oklch(0.145 0 0)`).
  - `--card` & `--card-foreground`: Menyesuaikan permukaan kartu secara otomatis.
  - `--border` & `--input`: Garis batas halus yang adaptif terhadap kontras tema.
- **Aturan Implementasi**: Seluruh halaman dan komponen baru **HARUS** menggunakan semantic color tokens (`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`) agar otomatis kompatibel dengan kedua tema.

---

## Authentication Flow & Axios Interceptor

1. **Login**: User memasukkan kredensial di `LoginPage`. Request dikirim ke `POST /api/auth/login`.
2. **Penyimpanan Token**:
   - `auth-store` (Zustand) menyimpan profil user dan JWT token ke `localStorage` (`devops-auth-store`).
   - Token juga disimpan di `devops-access-token` dan user ID di `devops-user-id`.
3. **Request Header**: Interceptor Axios di `src/api/client.ts` menyematkan `Authorization: Bearer <token>` pada setiap outgoing request.
4. **Auto-Refresh pada 401**:
   - Jika endpoint merespons HTTP 401, interceptor mencoba me-refresh token via `GET /api/auth/refresh/:id`.
   - Jika refresh berhasil, request yang sempat gagal diulang dengan token baru.
   - Jika refresh gagal (sesi habis), `auth-store` dibersihkan dan user diarahkan ke `/login`.

---

## Development

```bash
# Masuk ke direktori
cd devops-panel

# Install dependencies (jika baru)
npm install

# Jalankan dev server (Vite dengan proxy /api ke http://localhost:8080)
npm run dev

# Type-check dan build bundle
npm run build
```
