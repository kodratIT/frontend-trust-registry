# 03. Trust Registries

## Deskripsi
Trust Registry adalah container yang menyimpan daftar issuers dan verifiers dalam satu ekosistem. Setiap registry memiliki ecosystem DID sebagai identifier unik.

## Lokasi File
- **List:** `src/routes/registries/+page.svelte`
- **Create:** `src/routes/registries/new/+page.svelte`
- **Detail:** `src/routes/registries/[id]/+page.svelte`

## Konsep

### Apa itu Trust Registry?
Trust Registry adalah:
- Database yang menyimpan daftar trusted entities
- Memiliki ecosystem DID (e.g., `did:web:education.go.id`)
- Terhubung ke Trust Framework untuk governance
- Menyimpan issuers, verifiers, dan credential schemas

### Ecosystem DID
DID (Decentralized Identifier) yang merepresentasikan registry:
- `did:web:example.com` - Web-based DID
- `did:key:z6Mk...` - Key-based DID
- Digunakan sebagai `authority_id` dalam TRQP queries

## Data Model
```typescript
interface TrustRegistry {
  id: string;
  name: string;
  description?: string;
  ecosystemDid: string;           // DID unik untuk registry
  trustFrameworkId?: string;      // Link ke Trust Framework
  governanceAuthority?: string;   // Nama/URL authority
  status: 'active' | 'inactive' | 'deprecated';
  createdAt: string;
  updatedAt: string;
  
  // Relations
  trustFramework?: TrustFramework;
  issuers?: Issuer[];
  verifiers?: Verifier[];
  credentialSchemas?: CredentialSchema[];
}
```

## Fitur

### 1. List Registries (`/registries`)
- Grid/Table view toggle
- Filter by status, trust framework
- Search by name atau DID
- Statistik per registry (jumlah issuers, verifiers)

### 2. Create Registry (`/registries/new`)
Form fields:
- **Name** (required) - Nama registry
- **Ecosystem DID** (required) - DID unik
- **Description** - Deskripsi
- **Trust Framework** - Pilih framework (optional)
- **Governance Authority** - Nama/URL authority
- **Status** - active/inactive/deprecated

### 3. Detail & Edit (`/registries/[id]`)
- Informasi lengkap registry
- Daftar issuers terdaftar
- Daftar verifiers terdaftar
- Daftar credential schemas
- Link/unlink trust framework
- Edit dan delete

### 4. Verify DID (`/registries/verify-did`)
- Input DID
- Resolve dan validasi
- Tampilkan DID Document jika valid

## API Endpoints
```typescript
// List
GET /v2/registries?page=1&limit=10&status=active

// Create
POST /v2/registries
{
  "name": "Indonesia Education Registry",
  "ecosystemDid": "did:web:education.go.id",
  "trustFrameworkId": "uuid",
  "status": "active"
}

// Get by ID
GET /v2/registries/{id}

// Update
PUT /v2/registries/{id}

// Verify DID
POST /v2/registries/verify-did
{ "did": "did:web:example.com" }

// Link Trust Framework
PATCH /v2/registries/{id}/trust-framework
{ "trustFrameworkId": "uuid" }

// Unlink Trust Framework
DELETE /v2/registries/{id}/trust-framework
```

## Cara Kerja

### Create Flow
1. User klik "Create Registry"
2. Isi form, pastikan ecosystem DID unik
3. Optional: pilih Trust Framework
4. Klik "Save"
5. Registry dibuat dengan status sesuai pilihan

### Link Trust Framework
1. Buka detail registry
2. Klik "Link Framework"
3. Pilih framework dari dropdown
4. Framework terhubung ke registry

### TRQP Integration
Registry's `ecosystemDid` digunakan sebagai `authority_id` dalam TRQP:
```json
{
  "entity_id": "did:web:university.edu",
  "authority_id": "did:web:education.go.id",  // ← ecosystemDid
  "action": "issue",
  "resource": "UniversityDegree"
}
```

## Validasi
- Name: required, max 255 chars
- Ecosystem DID: required, unique, valid DID format
- Trust Framework: must exist if provided

## Relasi
```
TrustFramework (optional)
    │
    └── TrustRegistry
            │
            ├── CredentialSchema (1:N)
            ├── Issuer (1:N)
            └── Verifier (1:N)
```

## UI Flow
```
┌─────────────────────────────────────────────────────────┐
│  Registries                              [+ Create]     │
├─────────────────────────────────────────────────────────┤
│  Stats: Total: 5 | Active: 4 | Inactive: 1             │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🗄️ Indonesia Education Registry                 │   │
│  │    did:web:education.go.id                      │   │
│  │    Framework: Education Trust Framework         │   │
│  │    [Active] Issuers: 12 | Verifiers: 8          │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Tips
- Gunakan `did:web` untuk production (resolvable)
- Gunakan `did:key` untuk testing
- Selalu link ke Trust Framework untuk governance yang jelas
