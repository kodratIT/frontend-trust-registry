# 05. Verifiers

## Deskripsi
Verifier adalah entitas yang berwenang memverifikasi Verifiable Credentials dalam ekosistem. Setiap Verifier terdaftar di Registry dan memiliki DID unik serta daftar credential types yang boleh diverifikasi.

## Lokasi File
- **Frontend List**: `frontend/src/routes/verifiers/+page.svelte`
- **Frontend Detail**: `frontend/src/routes/verifiers/[did]/+page.svelte`
- **Frontend Create**: `frontend/src/routes/verifiers/new/+page.svelte`
- **Backend Controller**: `backend/src/controllers/verifierController.ts`
- **Backend Service**: `backend/src/services/verifierService.ts`
- **Backend Routes**: `backend/src/routes/verifierRoutes.ts`
- **API Client**: `frontend/src/lib/api/verifiers.ts`

## API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/verifiers` | List semua verifiers |
| GET | `/api/verifiers/:did` | Detail verifier by DID |
| POST | `/api/verifiers` | Create verifier baru |
| PUT | `/api/verifiers/:did` | Update verifier |
| DELETE | `/api/verifiers/:did` | Delete verifier |
| PATCH | `/api/verifiers/:did/status` | Update status |

## Data Model

```typescript
interface Verifier {
  id: string;                      // UUID internal
  did: string;                     // DID unik (did:web:...)
  name?: string;                   // Nama verifier
  endpoint?: string;               // API endpoint
  registryId: string;              // FK ke Registry
  status: 'pending' | 'active' | 'suspended' | 'revoked';
  validFrom?: Date;                // Mulai berlaku
  validUntil?: Date;               // Berakhir
  jurisdictions?: Jurisdiction[];  // Wilayah operasi
  credentialSchemas?: Schema[];    // Credential types yang bisa diverifikasi
  createdAt: Date;
  updatedAt: Date;
  registry?: Registry;             // Relasi
}

interface Jurisdiction {
  code: string;    // ISO country code
  name?: string;   // Nama lengkap
}
```

## Fitur Utama

### 1. List Verifiers
- Grid cards atau table view
- Filter by Registry
- Filter by Status
- Search by name atau DID
- Pagination

### 2. Create Verifier
Form fields:
- **DID** (required): Format `did:web:domain`
- **Name**: Nama verifier
- **Registry** (required): Pilih parent registry
- **Endpoint**: URL API verifier
- **Valid From/Until**: Periode validitas
- **Jurisdictions**: Multi-select wilayah
- **Credential Schemas**: Multi-select schemas yang bisa diverifikasi

### 3. Detail View
- Informasi lengkap verifier
- Status badge dengan warna
- List credential schemas
- List jurisdictions
- Actions: Edit, Delete, Change Status

### 4. Change Status
Modal untuk mengubah status:
- pending → active
- active → suspended
- suspended → active
- any → revoked

## Cara Kerja

### Create Flow
```
1. User klik "Register Verifier"
2. Load registries untuk dropdown
3. Load schemas untuk multi-select
4. User isi form
5. Validasi DID format
6. POST ke /api/verifiers
7. Backend:
   - Cek DID uniqueness
   - Validasi registry exists
   - Validasi schemas exist
   - Simpan ke database
8. Redirect ke detail page
```

### TRQP Authorization Check
```
POST /v2/authorization
{
  "entity_id": "did:web:verifier.example.com",    // Verifier DID
  "authority_id": "did:web:registry.example.com",
  "action": "verify",
  "resource": "UniversityDegree"
}

Response:
{
  "authorized": true,
  "entity_id": "did:web:verifier.example.com",
  "authority_id": "did:web:registry.example.com",
  "action": "verify",
  "resource": "UniversityDegree",
  "time_evaluated": "2024-01-15T10:30:00Z"
}
```

## UI Components

### List Page
```
┌─────────────────────────────────────────────────────────┐
│  Verifiers                            [+ Register New]  │
├─────────────────────────────────────────────────────────┤
│  [Search...] [Registry: All ▼] [Status: All ▼]         │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐  ┌──────────────────────┐    │
│  │ 👤 HR Platform        │  │ 👤 Background Check   │    │
│  │ [Active]             │  │ [Active]              │    │
│  │                      │  │                       │    │
│  │ did:web:hr.corp.com  │  │ did:web:bgcheck.com   │    │
│  │ 🌍 ID, MY            │  │ 🌍 ID, SG, MY          │    │
│  │ 📜 5 credential types │  │ 📜 3 credential types  │    │
│  │                      │  │                       │    │
│  │ Registry: Employment │  │ Registry: National    │    │
│  └──────────────────────┘  └──────────────────────┘    │
├─────────────────────────────────────────────────────────┤
│  Showing 1-10 of 23                    [1] [2] [3] [>] │
└─────────────────────────────────────────────────────────┘
```

### Detail Page
```
┌─────────────────────────────────────────────────────────┐
│  ← HR Platform                                          │
│  did:web:hr.corporate.com                               │
│  [Active]                         [Change Status] [🗑️] │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │ Verifier Information                             │   │
│  │ ─────────────────────────────────────────────── │   │
│  │ DID:          did:web:hr.corporate.com          │   │
│  │ Registry:     Employment Registry               │   │
│  │ Endpoint:     https://api.hr.corporate.com      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Validity Period                                  │   │
│  │ ─────────────────────────────────────────────── │   │
│  │ Valid From:   Jan 1, 2024                       │   │
│  │ Valid Until:  Dec 31, 2025                      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Verifiable Credential Types         5 schemas    │   │
│  │ ─────────────────────────────────────────────── │   │
│  │ • EmploymentCredential v1.0                     │   │
│  │ • UniversityDegree v1.0                         │   │
│  │ • ProfessionalCertificate v2.0                  │   │
│  │ • IdentityCredential v1.0                       │   │
│  │ • BackgroundCheck v1.0                          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Jurisdictions                                    │   │
│  │ ─────────────────────────────────────────────── │   │
│  │ [🇮🇩 ID - Indonesia] [🇲🇾 MY - Malaysia]         │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Validasi

### DID Format
```typescript
const didPattern = /^did:web:[a-zA-Z0-9.-]+(:[a-zA-Z0-9._-]+)*$/;
```

### Business Rules
- DID harus unique di seluruh sistem
- Registry harus exist dan active
- Schemas harus exist
- validFrom < validUntil

### Status Transitions
```
pending ──→ active ──→ suspended ──→ active
    │           │           │
    └───────────┴───────────┴──→ revoked (terminal)
```

## Error Handling

| Error | Handling |
|-------|----------|
| 400 Invalid DID | "Format DID tidak valid" |
| 404 Registry not found | "Registry tidak ditemukan" |
| 404 Verifier not found | "Verifier tidak ditemukan" |
| 409 DID exists | "DID sudah terdaftar" |
| 422 Invalid status transition | "Perubahan status tidak valid" |

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
# Create Verifier
curl -X POST http://localhost:3000/api/verifiers \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "did": "did:web:test-verifier.example.com",
    "name": "Test Verifier",
    "registryId": "uuid-of-registry",
    "status": "pending"
  }'

# Get Verifier
curl -X GET "http://localhost:3000/api/verifiers/did:web:test-verifier.example.com" \
  -H "X-API-Key: your-api-key"

# Update Status
curl -X PATCH "http://localhost:3000/api/verifiers/did:web:test-verifier.example.com/status" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"status": "active"}'
```

## Perbedaan dengan Issuer

| Aspek | Issuer | Verifier |
|-------|--------|----------|
| Fungsi | Menerbitkan credentials | Memverifikasi credentials |
| TRQP Action | `issue` | `verify` |
| Delegations | ✅ Bisa delegate | ❌ Tidak ada |
| Accreditation | ✅ Ada level | ❌ Tidak ada |

## Catatan Pengembangan
- Verifier lebih sederhana dari Issuer (tanpa delegations)
- Credential schemas menentukan apa yang boleh diverifikasi
- Status change harus di-audit
- Pertimbangkan rate limiting untuk verification requests
