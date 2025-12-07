# 10. Audit Logs

## Deskripsi
Audit Logs mencatat semua operasi yang dilakukan dalam Trust Registry untuk keperluan audit, compliance, dan troubleshooting. Setiap create, update, delete dicatat dengan detail.

## Lokasi File
- **Frontend**: `frontend/src/routes/audit/+page.svelte`
- **Backend Controller**: `backend/src/controllers/auditController.ts`
- **Backend Service**: `backend/src/services/auditService.ts`
- **Backend Routes**: `backend/src/routes/auditRoutes.ts`
- **API Client**: `frontend/src/lib/api/audit.ts`

## API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/audit` | List audit logs dengan filter |

## Data Model

```typescript
interface AuditLog {
  id: string;                    // UUID
  timestamp: Date;               // Waktu operasi
  actor: string;                 // User/API key yang melakukan
  action: 'create' | 'read' | 'update' | 'delete';
  resourceType: string;          // trust-frameworks, registries, etc
  resourceId?: string;           // ID resource yang dioperasikan
  result: 'success' | 'failure';
  details?: Record<string, any>; // Detail tambahan
  ipAddress?: string;            // IP address
  userAgent?: string;            // Browser/client info
}
```


## Fitur Utama

### 1. List Audit Logs
- Tabel dengan semua logs
- Filter by Action (create/read/update/delete)
- Filter by Resource Type
- Filter by Result (success/failure)
- Pagination
- Refresh button

### 2. Log Details
- Timestamp dengan format lengkap
- Actor identification
- Action badge dengan warna
- Resource type dan ID
- Result status
- View details button

## Cara Kerja

### Logging Flow
```
1. User melakukan operasi (create/update/delete)
2. Controller memanggil service
3. Service melakukan operasi
4. AuditService.log() dipanggil
5. Log disimpan ke database
6. Response dikembalikan ke user
```

### Audit Middleware
```typescript
// Contoh middleware untuk auto-logging
async function auditMiddleware(req, res, next) {
  const startTime = Date.now();
  
  res.on('finish', async () => {
    await auditService.log({
      actor: req.user?.id || req.apiKey || 'anonymous',
      action: mapMethodToAction(req.method),
      resourceType: extractResourceType(req.path),
      resourceId: req.params.id,
      result: res.statusCode < 400 ? 'success' : 'failure',
      details: {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: Date.now() - startTime
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
  });
  
  next();
}
```

## UI Components

### Audit Page
```
┌─────────────────────────────────────────────────────────┐
│  📋 Audit Logs                              [Refresh]   │
│  Track all operations performed in the trust registry   │
├─────────────────────────────────────────────────────────┤
│  [Action: All ▼] [Resource: All ▼] [Result: All ▼]     │
├─────────────────────────────────────────────────────────┤
│  Timestamp          │ Actor  │ Action │ Resource │Result│
│  ───────────────────┼────────┼────────┼──────────┼──────│
│  Jan 15, 10:30:45   │ admin  │ CREATE │ issuers  │  ✓   │
│                     │        │        │ did:web..│      │
│  ───────────────────┼────────┼────────┼──────────┼──────│
│  Jan 15, 10:25:12   │ admin  │ UPDATE │ registries│ ✓   │
│                     │        │        │ uuid-123 │      │
│  ───────────────────┼────────┼────────┼──────────┼──────│
│  Jan 15, 10:20:00   │ api-key│ DELETE │ schemas  │  ✗   │
│                     │        │        │ uuid-456 │ View │
└─────────────────────────────────────────────────────────┘
```

### Action Colors
```
CREATE  → 🟢 Green (bg-emerald-500/10 text-emerald-500)
READ    → ⚪ Gray (bg-muted text-muted-foreground)
UPDATE  → 🔵 Blue (bg-blue-500/10 text-blue-500)
DELETE  → 🔴 Red (bg-red-500/10 text-red-500)
```

### Result Colors
```
SUCCESS → 🟢 Green badge
FAILURE → 🔴 Red badge
```

## Query Parameters

| Parameter | Type | Deskripsi |
|-----------|------|-----------|
| page | number | Halaman (default: 1) |
| limit | number | Items per page (default: 20) |
| action | string | Filter by action |
| resourceType | string | Filter by resource type |
| result | string | Filter by result |
| startDate | string | Filter from date |
| endDate | string | Filter to date |

## Resource Types

| Type | Deskripsi |
|------|-----------|
| trust-frameworks | Trust Framework operations |
| registries | Registry operations |
| issuers | Issuer operations |
| verifiers | Verifier operations |
| schemas | Schema operations |
| recognitions | Recognition operations |
| api-keys | API Key operations |

## Permissions

| Action | Admin | Operator | Viewer |
|--------|-------|----------|--------|
| View Logs | ✅ | ✅ | ✅ |
| Export Logs | ✅ | ❌ | ❌ |

## Testing

```bash
# List Audit Logs
curl -X GET "http://localhost:3000/api/audit?page=1&limit=20" \
  -H "X-API-Key: your-api-key"

# Filter by Action
curl -X GET "http://localhost:3000/api/audit?action=create" \
  -H "X-API-Key: your-api-key"

# Filter by Resource Type
curl -X GET "http://localhost:3000/api/audit?resourceType=issuers" \
  -H "X-API-Key: your-api-key"

# Filter by Result
curl -X GET "http://localhost:3000/api/audit?result=failure" \
  -H "X-API-Key: your-api-key"
```

## Retention Policy
- Default: 90 hari
- Configurable via environment variable
- Automatic cleanup job

## Catatan Pengembangan
- Audit logs adalah read-only
- Tidak bisa dihapus oleh user
- Pertimbangkan export ke external system
- Sensitive data harus di-mask
- Pertimbangkan log rotation untuk performance
