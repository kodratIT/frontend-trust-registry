# 01. Dashboard

## Deskripsi
Dashboard adalah halaman utama yang menampilkan overview seluruh ekosistem Trust Registry. Halaman ini memberikan gambaran cepat tentang statistik, aktivitas terbaru, dan akses cepat ke fitur-fitur utama.

## Lokasi File
- **Route:** `/` 
- **File:** `src/routes/+page.svelte`

## Fitur

### 1. Statistics Cards
Menampilkan 5 kartu statistik:
- **Trust Frameworks** - Jumlah total dan yang aktif
- **Registries** - Jumlah total dan yang aktif
- **Issuers** - Jumlah total dan yang aktif
- **Verifiers** - Jumlah total dan yang aktif
- **Schemas** - Jumlah total credential types

### 2. Recent Registrations
Menampilkan 6 issuer/verifier terbaru yang terdaftar dengan informasi:
- Avatar (inisial dari nama/DID)
- Nama entity
- DID
- Status (active/pending/suspended/revoked)
- Tipe (Issuer/Verifier)

### 3. Activity Log
Menampilkan 10 audit log terbaru dengan informasi:
- Icon berdasarkan action (create/update/delete)
- Deskripsi action
- Timestamp relatif (e.g., "2m ago")
- Status (success/failure)

### 4. Quick Actions
4 tombol akses cepat ke:
- Create Framework → `/trust-frameworks/new`
- Create Registry → `/registries/new`
- Create Schema → `/schemas/new`
- Test Query → `/query`

## API yang Digunakan
```typescript
// Load semua data dashboard
const [
  frameworksRes,
  registriesRes,
  issuersRes,
  verifiersRes,
  schemasRes,
  recentIssuersRes,
  recentVerifiersRes,
  auditLogsRes
] = await Promise.all([
  trustFrameworkApi.list({ limit: 100 }),
  registryApi.list({ limit: 100 }),
  issuerApi.list({ limit: 100 }),
  verifierApi.list({ limit: 100 }),
  schemaApi.list({ limit: 100 }),
  issuerApi.list({ limit: 6 }),
  verifierApi.list({ limit: 6 }),
  auditApi.list({ limit: 10 }),
]);
```

## Cara Kerja

### Loading State
1. Saat halaman dimuat, `loading = true`
2. Semua API dipanggil secara parallel dengan `Promise.all`
3. Data diproses dan statistik dihitung
4. `loading = false`, UI menampilkan data

### Refresh Data
- Klik tombol "Refresh" untuk reload semua data
- Icon refresh akan berputar selama loading

### Error Handling
- Jika API gagal, tampilkan error message
- Tombol "Try again" untuk retry

## State Management
```typescript
let stats = $state({
  frameworks: { count: 0, active: 0, change: 0 },
  registries: { count: 0, active: 0, change: 0 },
  issuers: { count: 0, active: 0, change: 0 },
  verifiers: { count: 0, active: 0, change: 0 },
  schemas: { count: 0, change: 0 },
});

let recentIssuers = $state<Issuer[]>([]);
let recentVerifiers = $state<Verifier[]>([]);
let recentAuditLogs = $state<AuditLog[]>([]);
let loading = $state(true);
let error = $state<string | null>(null);
```

## UI Components
- `lucide-svelte` icons
- Custom card components
- Loading skeleton
- Error alert

## Screenshot Flow
```
┌─────────────────────────────────────────────────────────┐
│  Dashboard                              [Refresh] [+]   │
├─────────────────────────────────────────────────────────┤
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐              │
│  │  5  │ │  3  │ │ 12  │ │  8  │ │ 15  │              │
│  │Frame│ │Regis│ │Issue│ │Verif│ │Schem│              │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘              │
├─────────────────────────────────────────────────────────┤
│  Recent Registrations          │  Activity Log         │
│  ┌─────────────────────────┐   │  ┌─────────────────┐  │
│  │ UI  Universitas Indo... │   │  │ + Create issuer │  │
│  │ did:web:ui.ac.id        │   │  │   2 minutes ago │  │
│  └─────────────────────────┘   │  └─────────────────┘  │
├─────────────────────────────────────────────────────────┤
│  Quick Actions                                          │
│  [Create Framework] [Create Registry] [Create Schema]   │
└─────────────────────────────────────────────────────────┘
```
