# 02. Trust Frameworks

## Deskripsi
Trust Framework adalah governance document yang mendefinisikan aturan dan kebijakan untuk ekosistem trust. Ini adalah fondasi dari seluruh sistem Trust Registry.

## Lokasi File
- **List:** `src/routes/trust-frameworks/+page.svelte`
- **Create:** `src/routes/trust-frameworks/new/+page.svelte`
- **Detail:** `src/routes/trust-frameworks/[id]/+page.svelte`

## Konsep

### Apa itu Trust Framework?
Trust Framework adalah dokumen governance yang berisi:
- Aturan siapa yang boleh menjadi issuer/verifier
- Jurisdiksi yang berlaku
- Legal agreements yang harus dipatuhi
- Credential types yang diizinkan

### Contoh Real-World
- "Indonesia Education Trust Framework" - Aturan untuk kredensial pendidikan
- "Professional License Framework" - Aturan untuk lisensi profesional

## Data Model
```typescript
interface TrustFramework {
  id: string;
  name: string;
  version: string;
  description?: string;
  governanceFrameworkUrl?: string;  // URL ke dokumen governance
  legalAgreements?: string[];       // Array URL legal docs
  jurisdictions?: string[];         // ["ID", "SG", "MY"]
  contexts?: string[];              // JSON-LD contexts
  status: 'active' | 'inactive' | 'deprecated';
  createdAt: string;
  updatedAt: string;
}
```

## Fitur

### 1. List Trust Frameworks (`/trust-frameworks`)
- Tabel dengan pagination
- Filter by status
- Search by name
- Statistik (total, active, inactive)

### 2. Create Trust Framework (`/trust-frameworks/new`)
Form fields:
- **Name** (required) - Nama framework
- **Version** (required) - Versi (e.g., "1.0.0")
- **Description** - Deskripsi lengkap
- **Governance URL** - Link ke dokumen governance
- **Legal Agreements** - Array URL (bisa tambah multiple)
- **Jurisdictions** - Pilih negara/region
- **Status** - active/inactive/deprecated

### 3. Detail & Edit (`/trust-frameworks/[id]`)
- View semua informasi
- Edit inline
- Lihat registries yang terhubung
- Delete framework

## API Endpoints
```typescript
// List
GET /v2/trust-frameworks?page=1&limit=10&status=active

// Create
POST /v2/trust-frameworks
{
  "name": "Education Framework",
  "version": "1.0.0",
  "description": "...",
  "jurisdictions": ["ID"],
  "status": "active"
}

// Get by ID
GET /v2/trust-frameworks/{id}

// Update
PUT /v2/trust-frameworks/{id}

// Delete
DELETE /v2/trust-frameworks/{id}
```

## Cara Kerja

### Create Flow
1. User klik "Create Framework"
2. Isi form dengan data
3. Klik "Save"
4. API POST dipanggil
5. Redirect ke list dengan success notification

### Edit Flow
1. User klik framework dari list
2. Halaman detail terbuka
3. Klik "Edit"
4. Ubah data
5. Klik "Save"
6. API PUT dipanggil

### Delete Flow
1. User klik "Delete"
2. Confirm dialog muncul
3. Jika confirm, API DELETE dipanggil
4. Redirect ke list

## Validasi
- Name: required, max 255 chars
- Version: required, format semver
- Status: must be valid enum

## Relasi
```
TrustFramework
    │
    ├── TrustRegistry (1:N)
    │       └── Issuers
    │       └── Verifiers
    │
    └── CredentialSchema (1:N)
```

## UI Flow
```
┌─────────────────────────────────────────────────────────┐
│  Trust Frameworks                        [+ Create]     │
├─────────────────────────────────────────────────────────┤
│  [All] [Active] [Inactive]              [Search...]     │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🛡️ Education Trust Framework          v1.0.0   │   │
│  │    Governance for education credentials         │   │
│  │    [Active] [ID, SG]                   [View]   │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🛡️ Professional License Framework     v2.1.0   │   │
│  │    Professional certification governance        │   │
│  │    [Active] [ID]                       [View]   │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  Page 1 of 3                        [<] [1] [2] [3] [>] │
└─────────────────────────────────────────────────────────┘
```
