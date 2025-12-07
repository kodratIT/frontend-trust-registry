# 04. Issuers

## Deskripsi
Issuer adalah entitas yang berwenang menerbitkan Verifiable Credentials dalam ekosistem. Setiap Issuer terdaftar di Registry dan memiliki DID unik serta daftar credential types yang boleh diterbitkan.

## Lokasi File
- **Frontend List**: `frontend/src/routes/issuers/+page.svelte`
- **Frontend Detail**: `frontend/src/routes/issuers/[did]/+page.svelte`
- **Frontend Create**: `frontend/src/routes/issuers/new/+page.svelte`
- **Backend Controller**: `backend/src/controllers/issuerController.ts`
- **Backend Service**: `backend/src/services/issuerService.ts`
- **Backend Routes**: `backend/src/routes/issuerRoutes.ts`
- **API Client**: `frontend/src/lib/api/issuers.ts`

## API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/issuers` | List semua issuers |
| GET | `/api/issuers/:did` | Detail issuer by DID |
| POST | `/api/issuers` | Create issuer baru |
| PUT | `/api/issuers/:did` | Update issuer |
| DELETE | `/api/issuers/:did` | Delete issuer |
| PATCH | `/api/issuers/:did/status` | Update status |
| GET | `/api/issuers/:did/delegates` | List delegations |
| POST | `/api/issuers/:did/delegate` | Create delegation |
| DELETE | `/api/issuers/:did/delegates/:delegateDid` | Revoke delegation |
| GET | `/api/issuers/:did/delegation-chain` | Get delegation chain |

## Data Model

```typescript
interface Issuer {
  id: string;                      // UUID internal
  did: string;                     // DID unik (did:web:...)
  name?: string;                   // Nama issuer
  endpoint?: string;               // API endpoint
  registryId: string;              // FK ke Registry
  status: 'pending' | 'active' | 'suspended' | 'revoked';
  accreditationLevel?: 'basic' | 'standard' | 'advanced';
  validFrom?: Date;                // Mulai berlaku
  validUntil?: Date;               // Berakhir
  jurisdictions?: Jurisdiction[];  // Wilayah operasi
  credentialSchemas?: Schema[];    // Credential types
  createdAt: Date;
  updatedAt: Date;
  registry?: Registry;             // Relasi
}

interface Jurisdiction {
  code: string;    // ISO country code (ID, US, etc)
  name?: string;   // Nama lengkap
}

interface Delegation {
  id: string;
  rootIssuerDid: string;
  delegateIssuerDid: string;
  scope: {
    jurisdictions?: string[];
    credentialTypes?: string[];
    contexts?: string[];
  };
  delegationProof: Record<string, unknown>;
  delegatedAt: string;
  validUntil?: string;
  status: 'active' | 'revoked';
}
```

## Fitur Utama

### 1. List Issuers
- Grid cards atau table view
- Filter by Registry
- Filter by Status
- Filter by Accreditation Level
- Search by name atau DID
- Pagination

### 2. Create Issuer
Form fields:
- **DID** (required): Format `did:web:domain`
- **Name**: Nama issuer
- **Registry** (required): Pilih parent registry
- **Endpoint**: URL API issuer
- **Accreditation Level**: basic/standard/advanced
- **Valid From/Until**: Periode validitas
- **Jurisdictions**: Multi-select wilayah
- **Credential Schemas**: Multi-select schemas

### 3. Detail View
- Informasi lengkap issuer
- Status badge dengan warna
- List credential schemas
- List jurisdictions
- Delegations section
- Actions: Edit, Delete, Change Status

### 4. Delegations Management
Di halaman detail issuer:
- List delegates (issuers yang didelegasikan)
- Create new delegation
- Revoke delegation
- View delegation chain

### 5. Change Status
Modal untuk mengubah status:
- pending → active (approval)
- active → suspended (temporary)
- suspended → active (reinstate)
- any → revoked (permanent)

## Cara Kerja

### Create Flow
```
1. User klik "Register Issuer"
2. Load registries untuk dropdown
3. Load schemas untuk multi-select
4. User isi form
5. Validasi DID format
6. POST ke /api/issuers
7. Backend:
   - Cek DID uniqueness
   - Validasi registry exists
   - Validasi schemas exist
   - Simpan ke database
8. Redirect ke detail page
```

### Delegation Flow
```
1. User buka detail issuer
2. Klik "Add Delegate"
3. Masukkan delegate DID
4. Set validity period (opsional)
5. POST ke /api/issuers/:did/delegate
6. Backend:
   - Validasi delegate DID exists
   - Create delegation record
   - Generate delegation proof
7. Refresh delegations list
```

### TRQP Authorization Check
```
POST /v2/authorization
{
  "entity_id": "did:web:issuer.example.com",    // Issuer DID
  "authority_id": "did:web:registry.example.com",
  "action": "issue",
  "resource": "UniversityDegree"
}

Response:
{
  "authorized": true,
  "entity_id": "did:web:issuer.example.com",
  "authority_id": "did:web:registry.example.com",
  "action": "issue",
  "resource": "UniversityDegree",
  "time_evaluated": "2024-01-15T10:30:00Z"
}
```

## UI Components

### List Page
```
┌─────────────────────────────────────────────────────────┐
│  Issuers                              [+ Register New]  │
├─────────────────────────────────────────────────────────┤
│  [Search...] [Registry: All ▼] [Status: All ▼]         │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐  ┌──────────────────────┐    │
│  │ ✓ University ABC      │  │ ✓ Government Agency   │    │
│  │ [Active] [Advanced]  │  │ [Active] [Standard]  │    │
│  │                      │  │                       │    │
│  │ did:web:uni-abc.edu  │  │ did:web:gov.agency.id │    │
│  │ 🌍 ID, SG            │  │ 🌍 ID                  │    │
│  │ 📜 3 credential types │  │ 📜 5 credential types  │    │
│  │                      │  │                       │    │
│  │ Registry: Education  │  │ Registry: National    │    │
│  └──────────────────────┘  └──────────────────────┘    │
├─────────────────────────────────────────────────────────┤
│  Showing 1-10 of 45                    [1] [2] [3] [>] │
└─────────────────────────────────────────────────────────┘
```

### Detail Page
```
┌─────────────────────────────────────────────────────────┐
│  ← University ABC                                       │
│  did:web:university-abc.edu                             │
│  [Active] [Advanced]              [Change Status] [🗑️] │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │ Issuer Information                               │   │
│  │ ─────────────────────────────────────────────── │   │
│  │ DID:          did:web:university-abc.edu        │   │
│  │ Accreditation: Advanced                         │   │
│  │ Registry:     Education Registry                │   │
│  │ Endpoint:     https://api.university-abc.edu    │   │
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
│  │ Credential Types                    3 schemas    │   │
│  │ ─────────────────────────────────────────────── │   │
│  │ • UniversityDegree v1.0 (exclusive)             │   │
│  │ • AcademicTranscript v1.0 (shared)              │   │
│  │ • StudentID v2.0 (shared)                       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Delegations                      [+ Add Delegate]│   │
│  │ ─────────────────────────────────────────────── │   │
│  │ • did:web:branch-campus.edu [Active] [Revoke]   │   │
│  │ • did:web:partner-uni.edu [Active] [Revoke]     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Jurisdictions                                    │   │
│  │ ─────────────────────────────────────────────── │   │
│  │ [🇮🇩 ID - Indonesia] [🇸🇬 SG - Singapore]        │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Delegation Modal
```
┌─────────────────────────────────────────────────────────┐
│  Create Delegation                              [×]     │
├─────────────────────────────────────────────────────────┤
│  Delegate DID *                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ did:web:delegate.example.com                    │   │
│  └─────────────────────────────────────────────────┘   │
│  The DID of the issuer to delegate to                  │
│                                                         │
│  Valid Until (optional)                                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 2025-12-31T23:59                                │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│                          [Cancel] [Create Delegation]   │
└─────────────────────────────────────────────────────────┘
```

## Validasi

### DID Format
```typescript
const didPattern = /^did:web:[a-zA-Z0-9.-]+(:[a-zA-Z0-9._-]+)*$/;

// Valid:
// did:web:example.com
// did:web:issuer.example.com
// did:web:example.com:issuers:123

// Invalid:
// did:example.com
// did:web:
// example.com
```

### Business Rules
- DID harus unique di seluruh sistem
- Registry harus exist dan active
- Schemas harus exist
- validFrom < validUntil
- Tidak bisa delete jika ada active delegations

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
| 404 Issuer not found | "Issuer tidak ditemukan" |
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
| Manage Delegations | ✅ | ✅ | ❌ |

## Testing

```bash
# Create Issuer
curl -X POST http://localhost:3000/api/issuers \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "did": "did:web:test-issuer.example.com",
    "name": "Test Issuer",
    "registryId": "uuid-of-registry",
    "status": "pending",
    "accreditationLevel": "standard"
  }'

# Get Issuer with relations
curl -X GET "http://localhost:3000/api/issuers/did:web:test-issuer.example.com" \
  -H "X-API-Key: your-api-key"

# Update Status
curl -X PATCH "http://localhost:3000/api/issuers/did:web:test-issuer.example.com/status" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"status": "active", "reason": "Approved after review"}'

# Create Delegation
curl -X POST "http://localhost:3000/api/issuers/did:web:test-issuer.example.com/delegate" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "delegateDid": "did:web:delegate.example.com",
    "scope": {},
    "delegationProof": {"type": "placeholder"}
  }'

# Revoke Delegation
curl -X DELETE "http://localhost:3000/api/issuers/did:web:test-issuer.example.com/delegates/did:web:delegate.example.com" \
  -H "X-API-Key: your-api-key"
```

## Relasi dengan Fitur Lain

```
Registry
    │
    ├── Issuer ──┬── Credential Schemas
    │            ├── Jurisdictions
    │            └── Delegations ──→ Other Issuers
    │
    └── Verifier
```

## Catatan Pengembangan
- DID adalah primary identifier untuk TRQP
- Delegation chain penting untuk hierarchical trust
- Pertimbangkan caching untuk frequent authorization checks
- Status change harus di-audit
- Credential schemas menentukan apa yang boleh di-issue
