# DevOps Panel — Agent Rules

## Mandatory Context Reading

Sebelum melakukan perubahan apapun, **WAJIB** membaca file berikut:
- `../CONTEXT.md` — Project context dan architecture overview monorepo
- `CONTEXT.md` — DevOps Panel frontend context, state, dan design system overview
- `../devops-service/README.md` — API endpoints, model data, dan response contract dari backend

---

## Architecture Pattern & Project Structure

Project ini adalah Single Page Application (SPA) berbasis **React 19 + TypeScript + Vite 8** yang terhubung ke backend `devops-service`.

Struktur direktori:

```
src/
├── api/          → Axios client & API endpoints per resource
│   ├── client.ts → Base Axios instance, Bearer token interceptor, auto-refresh 401
│   ├── auth.ts   → Login, logout, refresh API
│   ├── users.ts  → User CRUD & status toggles
│   └── roles.ts  → Role CRUD & list
├── components/   → Shared application components
│   ├── sidebar.tsx               → Navigasi utama panel
│   ├── theme-toggle.tsx          → Switcher tema Light / Dark
│   ├── protected-page-loader.tsx → Suspense / pending router fallback
│   └── ui/                       → Shadcn UI primitives (Button, Card, Input, Label, Badge, Table, dll)
├── lib/          → Utilities & routing guards
│   ├── utils.ts        → `cn()` helper (clsx + tailwind-merge)
│   └── route-guards.ts → `protectedRouteGuard` & `publicRouteGuard`
├── pages/        → Page-level components
│   ├── login-page.tsx      → Halaman login (Light & Dark theme aware)
│   ├── dashboard-page.tsx  → Overview & summary panel
│   ├── users-page.tsx      → Manajemen pengguna & modal CRUD
│   ├── roles-page.tsx      → Manajemen role & modal CRUD
│   ├── profile-page.tsx    → Profil admin & update password
│   └── not-found-page.tsx  → 404 fallback page
├── routes/       → TanStack Router configuration
│   └── router.tsx → Route tree, AppShell, Theme state provider, Sonner Toaster
├── stores/       → Zustand global state
│   └── auth-store.ts → Persistent auth credentials & session state
├── styles/       → Design system & styling
│   └── globals.css → Tailwind CSS v4, OKLCH theme variables, dark mode layer
└── types/        → TypeScript interfaces (DTO, models, responses)
    └── auth.ts   → ApiResponse, User, Role, Pagination types
```

---

## Coding Conventions

### 1. Theme & Styling (Shadcn UI + Tailwind CSS v4)
- **WAJIB** mendukung tema **Light** dan **Dark**.
- **GUNAKAN SEMANTIC CSS TOKENS** shadcn UI:
  - Background & teks: `bg-background`, `text-foreground`
  - Kontainer kartu: `bg-card`, `text-card-foreground`
  - Elemen muted/border: `bg-muted`, `text-muted-foreground`, `border-border`
  - Primary & Secondary: `bg-primary`, `text-primary-foreground`, `bg-secondary`
  - Form inputs: `border-input`, `bg-background`, `focus-visible:ring-ring`
- **JANGAN** hardcode warna latar belakang atau teks statis (seperti `bg-slate-950`, `bg-slate-900`, `text-white`) pada kontainer utama atau kartu karena akan merusak tampilan saat user memilih Light Mode.
- Selalu gabungkan class dinamis menggunakan helper `cn()` dari `#lib/utils`.

### 2. UI Components & Design System
- Gunakan komponen dari `#components/ui/*` (Shadcn UI) daripada elemen HTML mentah tanpa style.
- Jika membutuhkan komponen shadcn baru (misal: `Dialog`, `DropdownMenu`, `Tabs`, `Select`), letakkan di `src/components/ui/<component>.tsx` menggunakan CVA atau `@base-ui/react`.

### 3. Path Aliases
Gunakan path aliases yang telah terkonfigurasi di `package.json` dan `components.json`:
- `#components/*` → `./src/components/*.tsx`
- `#lib/*` → `./src/lib/*.ts`
- `#hooks/*` → `./src/hooks/*.ts`

### 4. State Management & Data Fetching
- **Zustand** (`src/stores/auth-store.ts`) digunakan untuk auth state global (`user`, `token`, `isAuthenticated`) yang disimpan di `localStorage` (`devops-auth-store`).
- **TanStack Query** (`@tanstack/react-query`) dapat digunakan untuk caching, polling, dan fetching data server.
- **Local React State** (`useState`, `useReducer`) untuk UI state lokal seperti modal visibility, tab aktif, dan input form sementara.

### 5. Routing & Guards (TanStack Router)
- Route publik (seperti `/login`) **HARUS** memiliki `beforeLoad: publicRouteGuard` agar user yang sudah login otomatis dialihkan ke dashboard (`/`).
- Route terproteksi **HARUS** memiliki `beforeLoad: protectedRouteGuard` dan `pendingComponent: ProtectedPageLoader`.
- Route baru harus didaftarkan di `routeTree` pada `src/routes/router.tsx`.

### 6. API Integration & Error Handling
- Semua pemanggilan HTTP ke backend `devops-service` **HARUS** melalui instance `api` dari `src/api/client.ts`.
- Client Axios secara otomatis menyematkan header `Authorization: Bearer <token>` dari `localStorage`.
- Respons error HTTP 401 secara otomatis mengaktifkan interceptor untuk refresh token ke `/api/auth/refresh/:id`. Jika refresh gagal, sesi dibersihkan dan dialihkan ke `/login`.
- Tampilkan notifikasi interaktif ke user menggunakan `toast` dari `sonner` (`toast.success()`, `toast.error()`).

### 7. Environment Variables (`.env`)
- Semua variabel frontend **HARUS** diawali prefix `VITE_` (misal: `VITE_API_URL`, `VITE_API_TARGET`, `VITE_APP_TITLE`).
- Daftarkan deklarasi tipe variabel baru di `src/vite-env.d.ts` agar memiliki type safety & autocomplete.
- Jangan hardcode URL API backend, port, atau timeout pada komponen atau service; gunakan `import.meta.env` dengan nilai fallback yang aman.
- Setiap menambah variabel environment baru, **WAJIB** cantumkan contoh dan dokumentasinya di `.env.example`.

---

## Alur Menambah Fitur / Halaman Baru (Step-by-Step)

Saat membuat modul baru (misal: manajemen VPN Server atau VPN Client):

1. **Definisikan Types**: Tambahkan interface request, response, dan payload di `src/types/<feature>.ts`.
2. **Buat API Service**: Buat file fungsi API di `src/api/<feature>.ts` menggunakan instance `api`.
3. **Siapkan UI Primitive**: Tambahkan komponen UI pendukung di `src/components/ui/` jika belum tersedia (misal: modal, dialog, dropdown).
4. **Buat Page Component**: Buat halaman di `src/pages/<feature>-page.tsx`. Gunakan layout konsisten (`Sidebar`, `Card`, `Table`, `Badge`, `Button`).
5. **Daftarkan Route**: Tambahkan route di `src/routes/router.tsx` dengan `protectedRouteGuard`.
6. **Tambahkan Navigasi**: Daftarkan menu link dan icon Lucide di `src/components/sidebar.tsx`.

---

## Context Auto-Update Rule

**WAJIB**: Setiap kali melakukan perubahan signifikan pada frontend `devops-panel`, **HARUS** memperbarui dokumentasi:

1. **`CONTEXT.md` (devops-panel)**:
   - Update daftar halaman / routes
   - Update daftar API integration yang dikonsumsi
   - Update status fitur yang sudah selesai atau sedang direncanakan
2. **`../CONTEXT.md` (root monorepo)**:
   - Update status dan rute `devops-panel`
   - Update tanggal "Terakhir diperbarui"
3. **`README.md` (devops-panel)**:
   - Update deskripsi fitur, dependencies, dan panduan instalasi jika ada perubahan
