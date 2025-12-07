# 01. Dashboard

## Deskripsi
Dashboard adalah halaman utama yang menampilkan ringkasan statistik dan overview dari seluruh Trust Registry. Halaman ini memberikan gambaran cepat tentang status sistem.

## Lokasi File
- **Frontend**: `frontend/src/routes/+page.svelte`
- **API**: Multiple endpoints untuk statistik

## Fitur Utama

### 1. Statistik Cards
Menampilkan 6 kartu statistik utama:

| Statistik | Deskripsi | Endpoint |
|-----------|-----------|----------|
| Trust Frameworks | Jumlah total framework | `GET /api/trust-frameworks` |
| Registries | Jumlah total registry | `GET /api/registries` |
| Issuers | Jumlah total issuer | `GET /api/issuers` |
| Verifiers | Jumlah total verifier | `GET /api/verifiers` |
| Schemas | Jumlah total schema | `GET /api/schemas` |
| Active Entities | Entitas dengan status active | Computed dari data |

### 2. Recent Activity
Menampilkan aktivitas terbaru dari audit logs:
- **Endpoint**: `GET /api/audit?limit=5`
- Menampilkan: timestamp, actor, action, resource type

### 3. Quick Actions
Tombol shortcut untuk aksi umum:
- Create Trust Framework
- Add Registry
- Register Issuer
- Add Schema

## Cara Kerja

### Flow Data
```
1. User membuka halaman Dashboard (/)
2. onMount() dipanggil
3. Fetch paralel ke semua endpoint statistik
4. Data ditampilkan di cards
5. Auto-refresh setiap 30 detik (opsional)
```

### Kode Penting
```typescript
// Fetch statistik
async function loadStats() {
  const [frameworks, registries, issuers, verifiers, schemas] = await Promise.all([
    trustFrameworkApi.list({ limit: 1 }),
    registryApi.list({ limit: 1 }),
    issuerApi.list({ limit: 1 }),
    verifierApi.list({ limit: 1 }),
    schemaApi.list({ limit: 1 }),
  ]);
  
  stats = {
    frameworks: frameworks.meta.total,
    registries: registries.meta.total,
    issuers: issuers.meta.total,
    verifiers: verifiers.meta.total,
    schemas: schemas.meta.total,
  };
}
```

## UI Components

### Layout
```
┌─────────────────────────────────────────────────────────┐
│  Dashboard                                    [Refresh] │
├─────────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │Framework│ │Registry │ │ Issuer  │ │Verifier │       │
│  │   12    │ │    8    │ │   45    │ │   23    │       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
│  ┌─────────┐ ┌─────────┐                               │
│  │ Schema  │ │ Active  │                               │
│  │   34    │ │   89    │                               │
│  └─────────┘ └─────────┘                               │
├─────────────────────────────────────────────────────────┤
│  Recent Activity                                        │
│  ─────────────────────────────────────────────────────  │
│  • 10:30 - admin created issuer did:web:example.com    │
│  • 10:25 - admin updated registry Main Registry        │
│  • 10:20 - system verified schema UniversityDegree     │
└─────────────────────────────────────────────────────────┘
```

## Error Handling
- Jika API gagal, tampilkan nilai 0 dengan indikator error
- Toast notification untuk error
- Retry button tersedia

## Permissions
- **Read**: Semua role (admin, operator, viewer)
- Tidak ada aksi write di dashboard

## Testing
```bash
# Test endpoint statistik
curl -X GET http://localhost:3000/api/trust-frameworks?limit=1 \
  -H "X-API-Key: your-api-key"
```

## Catatan Pengembangan
- Dashboard harus load cepat (<2 detik)
- Gunakan caching untuk data yang jarang berubah
- Pertimbangkan WebSocket untuk real-time updates
