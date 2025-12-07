# 06. Schemas

## Deskripsi
Schema mendefinisikan struktur dan format Verifiable Credentials yang dapat diterbitkan dalam ekosistem. Setiap schema memiliki tipe, versi, dan mode penerbitan.

## Lokasi File
- **Frontend List**: `frontend/src/routes/schemas/+page.svelte`
- **Frontend Detail**: `frontend/src/routes/schemas/[id]/+page.svelte`
- **Frontend Create**: `frontend/src/routes/schemas/new/+page.svelte`
- **Backend Controller**: `backend/src/controllers/schemaController.ts`
- **Backend Service**: `backend/src/services/schemaService.ts`
- **Backend Routes**: `backend/src/routes/schemaRoutes.ts`

## API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/schemas` | List semua schemas |
| GET | `/api/schemas/:id` | Detail schema |
| POST | `/api/schemas` | Create schema baru |
| PUT | `/api/schemas/:id` | Update schema |
| DELETE | `/api/schemas/:id` | Delete schema |

## Data Model

```typescript
interface CredentialSchema {
  id: string;                    // UUID
  name: string;                  // Nama schema
  type: string;                  // Credential type (UniversityDegree, etc)
  version: string;               // Versi (1.0.0)
  schemaUrl?: string;            // URL ke JSON Schema
  description?: string;          // Deskripsi
  registryId: string;            // FK ke Registry
  issuerMode: 'exclusive' | 'shared';  // Mode penerbitan
  status: 'draft' | 'active' | 'deprecated';
  createdAt: Date;
  updatedAt: Date;
  registry?: Registry;           // Relasi
  issuers?: Issuer[];            // Issuers yang bisa issue
}
```

## Issuer Mode

| Mode | Deskripsi |
|------|-----------|
| `exclusive` | Hanya satu issuer yang bisa menerbitkan credential ini |
| `shared` | Multiple issuers bisa menerbitkan credential ini |


## Fitur Utama

### 1. List Schemas
- Grid cards view
- Filter by Registry
- Filter by Status
- Filter by Issuer Mode
- Search by name atau type
- Pagination

### 2. Create Schema
Form fields:
- **Name** (required): Nama schema
- **Type** (required): Credential type identifier
- **Version** (required): Semantic version
- **Registry** (required): Parent registry
- **Schema URL**: Link ke JSON Schema definition
- **Description**: Deskripsi schema
- **Issuer Mode**: exclusive/shared
- **Status**: draft/active/deprecated

### 3. Detail View
- Informasi lengkap schema
- List issuers yang menggunakan schema
- JSON Schema preview (jika ada URL)
- Actions: Edit, Delete

## Cara Kerja

### Create Flow
```
1. User klik "Create Schema"
2. Load registries untuk dropdown
3. User isi form
4. Validasi version format (semver)
5. POST ke /api/schemas
6. Backend simpan ke database
7. Redirect ke detail page
```

### Schema Assignment ke Issuer
```
1. Buka halaman Issuer
2. Edit issuer
3. Pilih schemas dari multi-select
4. Save
5. Issuer sekarang bisa issue credential types tersebut
```

## UI Components

### List Page
```
┌─────────────────────────────────────────────────────────┐
│  Schemas                               [+ Create New]   │
├─────────────────────────────────────────────────────────┤
│  [Search...] [Registry: All ▼] [Mode: All ▼]           │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐  ┌──────────────────────┐    │
│  │ 📄 UniversityDegree   │  │ 📄 EmploymentCred     │    │
│  │ [Active] [Exclusive] │  │ [Active] [Shared]    │    │
│  │                      │  │                       │    │
│  │ v1.0.0               │  │ v2.1.0                │    │
│  │ 3 issuers            │  │ 8 issuers             │    │
│  │                      │  │                       │    │
│  │ Registry: Education  │  │ Registry: Employment  │    │
│  └──────────────────────┘  └──────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Create Form
```
┌─────────────────────────────────────────────────────────┐
│  ← Create Schema                                        │
├─────────────────────────────────────────────────────────┤
│  Name *                    Type *                       │
│  ┌──────────────────┐     ┌──────────────────┐         │
│  │ University Degree │     │ UniversityDegree │         │
│  └──────────────────┘     └──────────────────┘         │
│                                                         │
│  Version *                 Registry *                   │
│  ┌──────────────────┐     ┌──────────────────┐         │
│  │ 1.0.0            │     │ Education Reg ▼  │         │
│  └──────────────────┘     └──────────────────┘         │
│                                                         │
│  Schema URL                                             │
│  ┌─────────────────────────────────────────────────┐   │
│  │ https://schema.org/UniversityDegree             │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Issuer Mode               Status                       │
│  ┌──────────────────┐     ┌──────────────────┐         │
│  │ Shared       ▼   │     │ Draft        ▼   │         │
│  └──────────────────┘     └──────────────────┘         │
│                                                         │
│                          [Cancel] [💾 Create Schema]    │
└─────────────────────────────────────────────────────────┘
```

## Validasi

### Version Format
```typescript
const semverPattern = /^\d+\.\d+\.\d+$/;
// Valid: 1.0.0, 2.1.3, 10.20.30
// Invalid: 1.0, v1.0.0, 1.0.0-beta
```

### Business Rules
- Type + Version harus unique per registry
- Tidak bisa delete jika ada issuers yang menggunakan
- Status deprecated tidak bisa digunakan untuk issue baru

## Error Handling

| Error | Handling |
|-------|----------|
| 400 Invalid version | "Format versi tidak valid (gunakan x.y.z)" |
| 404 Registry not found | "Registry tidak ditemukan" |
| 409 Type+Version exists | "Schema dengan type dan versi ini sudah ada" |
| 422 Has issuers | "Tidak bisa hapus, masih digunakan oleh issuers" |

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
# Create Schema
curl -X POST http://localhost:3000/api/schemas \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "name": "University Degree",
    "type": "UniversityDegree",
    "version": "1.0.0",
    "registryId": "uuid-of-registry",
    "issuerMode": "shared",
    "status": "active"
  }'
```

## Catatan Pengembangan
- Schema adalah "resource" dalam TRQP authorization
- Pertimbangkan JSON Schema validation
- Version management penting untuk backward compatibility
