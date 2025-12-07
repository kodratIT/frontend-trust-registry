# 03. Registries

## Deskripsi
Registry adalah entitas yang mengelola daftar Issuer dan Verifier dalam suatu ekosistem. Setiap Registry memiliki Ecosystem DID yang unik dan terhubung ke Trust Framework.

## Lokasi File
- **Frontend List**: `frontend/src/routes/registries/+page.svelte`
- **Frontend Detail**: `frontend/src/routes/registries/[id]/+page.svelte`
- **Frontend Create**: `frontend/src/routes/registries/new/+page.svelte`
- **Backend Controller**: `backend/src/controllers/registryController.ts`
- **Backend Service**: `backend/src/services/registryService.ts`
- **Backend Routes**: `backend/src/routes/registryRoutes.ts`

## API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/registries` | List semua registries |
| GET | `/api/registries/:id` | Detail registry |
| POST | `/api/registries` | Create registry baru |
| PUT | `/api/registries/:id` | Update registry |
| DELETE | `/api/registries/:id` | Delete registry |

## Data Model

```typescript
interface TrustRegistry {
  id: string;                      // UUID
  name: string;                    // Nama registry
  description?: string;            // Deskripsi
  ecosystemDid: string;            // DID unik (did:web:...)
  endpoint?: string;               // API endpoint URL
  trustFrameworkId: string;        // FK ke Trust Framework
  status: 'pending' | 'active' | 'suspended' | 'revoked';
  createdAt: Date;
  updatedAt: Date;
  trustFramework?: TrustFramework; // Relasi
  issuers?: Issuer[];              // Relasi
  verifiers?: Verifier[];          // Relasi
}
```

## Fitur Utama

### 1. List Registries
- Grid/Table view dengan cards
- Filter by Trust Framework
- Filter by status
- Search by name atau DID
- Pagination

### 2. Create Registry
Form fields:
- **Name** (required): Nama registry
- **Ecosystem DID** (required): DID unik format `did:web:domain`
- **Description**: Deskripsi registry
- **Endpoint**: URL API registry
- **Trust Framework** (required): Pilih parent framework
- **Status**: pending/active/suspended/revoked

### 3. Detail View
- Informasi lengkap registry
- Statistik: jumlah issuers, verifiers
- List issuers terkait
- List verifiers terkait
- Actions: Edit, Delete, Change Status

### 4. Change Status
Modal untuk mengubah status dengan:
- Dropdown status baru
- Reason field (opsional)
- Audit log otomatis

## Cara Kerja

### Create Flow
```
1. User klik "Create Registry"
2. Load list Trust Frameworks untuk dropdown
3. User isi form
4. Validasi DID format (did:web:...)
5. POST ke /api/registries
6. Backend cek DID uniqueness
7. Simpan ke database
8. Redirect ke detail page
```

### TRQP Integration
Registry adalah authority dalam TRQP queries:
```
POST /v2/authorization
{
  "authority_id": "did:web:registry.example.com",  // ecosystemDid
  "entity_id": "did:web:issuer.example.com",
  "action": "issue",
  "resource": "UniversityDegree"
}
```

## UI Components

### List Page
```
┌─────────────────────────────────────────────────────────┐
│  Registries                          [+ Create New]     │
├─────────────────────────────────────────────────────────┤
│  [Search...] [Framework: All ▼] [Status: All ▼]        │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐  ┌──────────────────────┐    │
│  │ 🗄️ Main Registry      │  │ 🗄️ Education Registry │    │
│  │ [Active]             │  │ [Active]              │    │
│  │                      │  │                       │    │
│  │ did:web:main.reg.com │  │ did:web:edu.reg.com   │    │
│  │ 12 Issuers           │  │ 8 Issuers             │    │
│  │ 5 Verifiers          │  │ 3 Verifiers           │    │
│  │                      │  │                       │    │
│  │ Framework: National  │  │ Framework: Education  │    │
│  └──────────────────────┘  └──────────────────────┘    │
├─────────────────────────────────────────────────────────┤
│  Showing 1-10 of 25                    [1] [2] [3] [>] │
└─────────────────────────────────────────────────────────┘
```

### Detail Page
```
┌─────────────────────────────────────────────────────────┐
│  ← Main Registry                [Active] [Edit] [🗑️]   │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │ Registry Information                             │   │
│  │ ─────────────────────────────────────────────── │   │
│  │ DID:        did:web:main.registry.example.com   │   │
│  │ Endpoint:   https://api.registry.example.com    │   │
│  │ Framework:  National Identity Framework         │   │
│  │ Created:    Jan 15, 2024                        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │  Issuers    │ │  Verifiers  │ │  Schemas    │       │
│  │     12      │ │      5      │ │      8      │       │
│  └─────────────┘ └─────────────┘ └─────────────┘       │
│                                                         │
│  Issuers in this Registry                [View All →]  │
│  ─────────────────────────────────────────────────────  │
│  • University of Example (active)                      │
│  • Government Agency (active)                          │
│  • Healthcare Provider (pending)                       │
└─────────────────────────────────────────────────────────┘
```

## Validasi

### DID Format
```typescript
// Valid DID formats
const didPattern = /^did:web:[a-zA-Z0-9.-]+(:[a-zA-Z0-9._-]+)*$/;

// Examples:
// ✅ did:web:example.com
// ✅ did:web:registry.example.com
// ✅ did:web:example.com:path:to:resource
// ❌ did:web:
// ❌ did:example.com
```

### Business Rules
- Ecosystem DID harus unique
- Trust Framework harus exist dan active
- Tidak bisa delete jika ada issuers/verifiers

## Error Handling

| Error | Handling |
|-------|----------|
| 400 Invalid DID | "DID format tidak valid" |
| 404 Framework not found | "Trust Framework tidak ditemukan" |
| 409 DID exists | "Ecosystem DID sudah digunakan" |
| 422 Has children | "Tidak bisa hapus, masih ada issuers/verifiers" |

## Permissions

| Action | Admin | Operator | Viewer |
|--------|-------|----------|--------|
| List | ✅ | ✅ | ✅ |
| View | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ❌ |
| Update | ✅ | ✅ | ❌ |
| Delete | ✅ | ❌ | ❌ |
| Change Status | ✅ | ✅ | ❌ |

## Testing

```bash
# Create Registry
curl -X POST http://localhost:3000/api/registries \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "name": "Test Registry",
    "ecosystemDid": "did:web:test.registry.com",
    "trustFrameworkId": "uuid-of-framework",
    "status": "active"
  }'

# Get with relations
curl -X GET "http://localhost:3000/api/registries/{id}?include=issuers,verifiers" \
  -H "X-API-Key: your-api-key"
```

## Relasi dengan Fitur Lain

```
Trust Framework
      │
      ├── Registry ──┬── Issuers
      │              ├── Verifiers
      │              └── Schemas
      │
      └── Registry ──┬── Issuers
                     └── Verifiers
```

## Catatan Pengembangan
- Registry adalah core entity untuk TRQP
- Ecosystem DID digunakan sebagai authority_id
- Pertimbangkan caching untuk query yang sering
- Status change harus cascade ke children (opsional)
