# 02. Trust Frameworks

## Deskripsi
Trust Framework adalah kerangka kepercayaan tingkat tertinggi yang mendefinisikan aturan, kebijakan, dan standar untuk ekosistem digital identity. Setiap Trust Framework dapat memiliki banyak Registry di bawahnya.

## Lokasi File
- **Frontend List**: `frontend/src/routes/trust-frameworks/+page.svelte`
- **Frontend Detail**: `frontend/src/routes/trust-frameworks/[id]/+page.svelte`
- **Frontend Create**: `frontend/src/routes/trust-frameworks/new/+page.svelte`
- **Backend Controller**: `backend/src/controllers/trustFrameworkController.ts`
- **Backend Service**: `backend/src/services/trustFrameworkService.ts`
- **Backend Routes**: `backend/src/routes/trustFrameworkRoutes.ts`

## API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/trust-frameworks` | List semua frameworks |
| GET | `/api/trust-frameworks/:id` | Detail framework |
| POST | `/api/trust-frameworks` | Create framework baru |
| PUT | `/api/trust-frameworks/:id` | Update framework |
| DELETE | `/api/trust-frameworks/:id` | Delete framework |

## Data Model

```typescript
interface TrustFramework {
  id: string;                    // UUID
  name: string;                  // Nama framework
  description?: string;          // Deskripsi
  governanceUrl?: string;        // URL dokumen governance
  version: string;               // Versi (e.g., "1.0.0")
  status: 'draft' | 'active' | 'deprecated';
  createdAt: Date;
  updatedAt: Date;
  registries?: Registry[];       // Relasi ke registries
}
```

## Fitur Utama

### 1. List Trust Frameworks
- Tabel dengan pagination
- Filter by status
- Search by name
- Sort by name/date

### 2. Create Trust Framework
Form fields:
- **Name** (required): Nama framework
- **Description**: Deskripsi lengkap
- **Governance URL**: Link ke dokumen governance
- **Version**: Versi framework
- **Status**: draft/active/deprecated

### 3. Detail View
- Informasi lengkap framework
- List registries yang terkait
- Tombol edit dan delete
- Metadata (created/updated)

### 4. Edit Trust Framework
- Update semua field
- Validasi version format
- Konfirmasi perubahan status

### 5. Delete Trust Framework
- Konfirmasi dialog
- Cek apakah ada registry terkait
- Soft delete atau hard delete

## Cara Kerja

### Create Flow
```
1. User klik "Create Trust Framework"
2. Isi form dengan data
3. Validasi client-side
4. POST ke /api/trust-frameworks
5. Backend validasi & simpan ke DB
6. Redirect ke detail page
7. Toast success notification
```

### Update Flow
```
1. User buka detail page
2. Klik tombol "Edit"
3. Form terisi dengan data existing
4. User ubah data
5. PUT ke /api/trust-frameworks/:id
6. Refresh data
7. Toast success notification
```

## UI Components

### List Page
```
┌─────────────────────────────────────────────────────────┐
│  Trust Frameworks                    [+ Create New]     │
├─────────────────────────────────────────────────────────┤
│  [Search...] [Status: All ▼] [Sort: Name ▼]            │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🛡️ National ID Framework           [Active]     │   │
│  │    Government identity framework                 │   │
│  │    v2.0.0 • 3 registries • Updated 2 days ago   │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🛡️ Education Credentials            [Active]     │   │
│  │    Academic credential framework                 │   │
│  │    v1.5.0 • 5 registries • Updated 1 week ago   │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  [< Prev]  Page 1 of 3  [Next >]                       │
└─────────────────────────────────────────────────────────┘
```

### Create/Edit Form
```
┌─────────────────────────────────────────────────────────┐
│  ← Create Trust Framework                               │
├─────────────────────────────────────────────────────────┤
│  Name *                                                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │ National Identity Framework                      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Description                                            │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Framework for national digital identity...       │   │
│  │                                                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Governance URL                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ https://gov.example.com/framework               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Version *              Status                          │
│  ┌──────────────┐      ┌──────────────┐                │
│  │ 1.0.0        │      │ Draft    ▼   │                │
│  └──────────────┘      └──────────────┘                │
│                                                         │
│                          [Cancel] [💾 Save]             │
└─────────────────────────────────────────────────────────┘
```

## Validasi

### Client-side
```typescript
const rules = {
  name: { required: true, minLength: 3, maxLength: 100 },
  version: { required: true, pattern: /^\d+\.\d+\.\d+$/ },
  governanceUrl: { pattern: /^https?:\/\/.+/ },
};
```

### Server-side
- Name unique check
- Version format validation
- URL format validation
- Status transition rules

## Error Handling

| Error | Handling |
|-------|----------|
| 400 Bad Request | Tampilkan validation errors |
| 404 Not Found | Redirect ke list dengan error toast |
| 409 Conflict | Tampilkan "Name already exists" |
| 500 Server Error | Generic error message |

## Permissions

| Action | Admin | Operator | Viewer |
|--------|-------|----------|--------|
| List | ✅ | ✅ | ✅ |
| View | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ❌ |
| Update | ✅ | ✅ | ❌ |
| Delete | ✅ | ❌ | ❌ |

## Testing

```bash
# Create
curl -X POST http://localhost:3000/api/trust-frameworks \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "name": "Test Framework",
    "version": "1.0.0",
    "status": "draft"
  }'

# List
curl -X GET "http://localhost:3000/api/trust-frameworks?page=1&limit=10" \
  -H "X-API-Key: your-api-key"

# Update
curl -X PUT http://localhost:3000/api/trust-frameworks/{id} \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"status": "active"}'

# Delete
curl -X DELETE http://localhost:3000/api/trust-frameworks/{id} \
  -H "X-API-Key: your-api-key"
```

## Catatan Pengembangan
- Trust Framework adalah parent dari Registry
- Perubahan status mempengaruhi semua child entities
- Pertimbangkan versioning untuk audit trail
- Governance URL harus accessible untuk validasi
