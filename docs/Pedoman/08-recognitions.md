# 08. Recognitions

## Deskripsi
Recognition adalah mekanisme untuk membuat hubungan kepercayaan antar registry (inter-registry trust). Satu authority dapat mengakui authority lain untuk action dan resource tertentu.

## Lokasi File
- **Frontend List**: `frontend/src/routes/recognitions/+page.svelte`
- **Frontend Detail**: `frontend/src/routes/recognitions/[id]/+page.svelte`
- **Frontend Create**: `frontend/src/routes/recognitions/new/+page.svelte`
- **Backend Controller**: `backend/src/controllers/recognitionController.ts`
- **Backend Service**: `backend/src/services/recognitionService.ts`
- **Backend Routes**: `backend/src/routes/recognitionRoutes.ts`
- **API Client**: `frontend/src/lib/api/recognitions.ts`

## API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/recognitions` | List semua recognitions |
| GET | `/api/recognitions/:id` | Detail recognition |
| POST | `/api/recognitions` | Create recognition baru |
| DELETE | `/api/recognitions/:id` | Revoke recognition |

## Data Model

```typescript
interface Recognition {
  id: string;                    // UUID
  authorityRegistryId: string;   // FK ke Registry (yang mengakui)
  entityId: string;              // DID entity yang diakui
  action: string;                // recognize, govern, delegate
  resource: string;              // Scope recognition
  recognized: boolean;           // Status aktif
  validFrom?: Date;              // Mulai berlaku
  validUntil?: Date;             // Berakhir
  createdAt: Date;
  updatedAt: Date;
  authority?: Registry;          // Relasi
}
```


## Action Types

| Action | Deskripsi |
|--------|-----------|
| `recognize` | Pengakuan umum terhadap authority lain |
| `govern` | Pengakuan sebagai governance authority |
| `delegate` | Delegasi wewenang ke authority lain |

## Fitur Utama

### 1. List Recognitions
- Tabel dengan semua recognitions
- Filter by Authority Registry
- Filter by Entity ID
- Status indicator (Active/Invalid)
- Validity period display
- Pagination

### 2. Create Recognition
Form fields:
- **Authority Registry** (required): Registry yang membuat recognition
- **Entity ID** (required): DID entity yang diakui
- **Action** (required): recognize/govern/delegate
- **Resource** (required): Scope recognition
- **Valid From**: Tanggal mulai berlaku
- **Valid Until**: Tanggal berakhir

### 3. Detail View
- Informasi lengkap recognition
- Status validity
- Actions: Revoke

### 4. Revoke Recognition
- Konfirmasi dialog
- Soft delete (set recognized = false)

## Cara Kerja

### Create Flow
```
1. User klik "Create Recognition"
2. Load registries untuk dropdown
3. User isi form
4. POST ke /api/recognitions
5. Backend:
   - Validasi authority registry exists
   - Validasi tidak ada duplicate
   - Simpan ke database
6. Redirect ke list page
```

### Recognition Query Flow
```
1. External system POST ke /v2/recognition
2. Backend:
   - Find recognition by authority_id + entity_id + action + resource
   - Check validity period
   - Return recognized: true/false
3. Response ke external system
```

## UI Components

### List Page
```
┌─────────────────────────────────────────────────────────┐
│  Recognitions                       [+ Create Recognition]│
├─────────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                   │
│  │ Total   │ │ Active  │ │ Invalid │                   │
│  │   15    │ │   12    │ │    3    │                   │
│  └─────────┘ └─────────┘ └─────────┘                   │
├─────────────────────────────────────────────────────────┤
│  [Authority: All ▼] [Entity ID: ________] [Apply][Clear]│
├─────────────────────────────────────────────────────────┤
│  Authority      │ Entity        │ Action │ Status │     │
│  ───────────────┼───────────────┼────────┼────────┼──── │
│  Main Registry  │ did:web:other │ govern │ Active │ 👁️🗑️│
│  did:web:main.. │               │        │ ∞ → ∞  │     │
│  ───────────────┼───────────────┼────────┼────────┼──── │
│  Edu Registry   │ did:web:part..│ recog..│ Active │ 👁️🗑️│
│  did:web:edu..  │               │        │ Jan-Dec│     │
└─────────────────────────────────────────────────────────┘
```

### Create Form
```
┌─────────────────────────────────────────────────────────┐
│  ← Create Recognition                                   │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │ Recognition Details                              │   │
│  │ ─────────────────────────────────────────────── │   │
│  │                                                  │   │
│  │ Authority Registry *                             │   │
│  │ [Select registry...                         ▼]  │   │
│  │ The registry making the recognition             │   │
│  │                                                  │   │
│  │ Entity ID (DID) *                               │   │
│  │ [did:web:other-registry.org                  ]  │   │
│  │ The DID of the entity being recognized          │   │
│  │                                                  │   │
│  │ Action *              Resource *                 │   │
│  │ [govern      ▼]      [professional-licenses  ]  │   │
│  │                                                  │   │
│  │ Valid From            Valid Until                │   │
│  │ [2024-01-01      ]   [2025-12-31          ]     │   │
│  │                                                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ About Recognition                                │   │
│  │ Recognition creates a trust relationship where  │   │
│  │ one authority formally recognizes another...    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│                    [Cancel] [💾 Create Recognition]     │
└─────────────────────────────────────────────────────────┘
```

## Validasi

### Business Rules
- Authority registry harus exist dan active
- Tidak boleh ada duplicate (same authority + entity + action + resource)
- validFrom < validUntil jika keduanya diisi

### Validity Check
```typescript
function isRecognitionValid(recognition: Recognition): boolean {
  const now = new Date();
  
  // Check recognized flag
  if (!recognition.recognized) return false;
  
  // Check validity period
  if (recognition.validFrom && new Date(recognition.validFrom) > now) {
    return false;
  }
  if (recognition.validUntil && new Date(recognition.validUntil) < now) {
    return false;
  }
  
  return true;
}
```

## Error Handling

| Error | Handling |
|-------|----------|
| 400 Missing fields | "Please fill all required fields" |
| 404 Registry not found | "Authority registry tidak ditemukan" |
| 409 Duplicate | "Recognition sudah ada" |

## Permissions

| Action | Admin | Operator | Viewer |
|--------|-------|----------|--------|
| List | ✅ | ✅ | ✅ |
| View | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ❌ |
| Revoke | ✅ | ✅ | ❌ |

## Testing

```bash
# Create Recognition
curl -X POST http://localhost:3000/api/recognitions \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "authorityRegistryId": "uuid-of-registry",
    "entityId": "did:web:other-registry.example.com",
    "action": "govern",
    "resource": "professional-licenses"
  }'

# List Recognitions
curl -X GET "http://localhost:3000/api/recognitions?authorityId=uuid" \
  -H "X-API-Key: your-api-key"

# Revoke Recognition
curl -X DELETE http://localhost:3000/api/recognitions/{id} \
  -H "X-API-Key: your-api-key"

# Test via TRQP
curl -X POST http://localhost:3000/v2/recognition \
  -H "Content-Type: application/json" \
  -d '{
    "entity_id": "did:web:other-registry.example.com",
    "authority_id": "did:web:main-registry.example.com",
    "action": "govern",
    "resource": "professional-licenses"
  }'
```

## Use Cases

### 1. Cross-Registry Trust
Registry A mengakui Registry B untuk credential types tertentu:
```
Registry A (National) ──recognize──> Registry B (Education)
                                     for: academic-credentials
```

### 2. Governance Hierarchy
Parent registry mengakui child registry sebagai governance authority:
```
Root Registry ──govern──> Regional Registry
                          for: regional-credentials
```

### 3. Delegation
Registry mendelegasikan wewenang ke registry lain:
```
Main Registry ──delegate──> Partner Registry
                            for: specific-credential-type
```

## Catatan Pengembangan
- Recognition adalah basis untuk inter-registry trust
- Digunakan oleh TRQP /v2/recognition endpoint
- Pertimbangkan expiry notifications
- Audit log untuk setiap perubahan
