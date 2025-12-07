# 07. TRQP Query

## Deskripsi
TRQP (Trust Registry Query Protocol) adalah protokol standar ToIP untuk melakukan query ke Trust Registry. Halaman ini menyediakan UI untuk testing endpoint Authorization dan Recognition.

## Lokasi File
- **Frontend**: `frontend/src/routes/trqp/+page.svelte`
- **Backend Controller**: `backend/src/controllers/trqpController.ts`
- **Backend Service**: `backend/src/services/trqpService.ts`
- **Backend Routes**: `backend/src/routes/trqpRoutes.ts`
- **API Client**: `frontend/src/lib/api/trqp.ts`
- **JSON Schemas**: `backend/src/schemas/trqp/*.json`

## API Endpoints (TRQP v2)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/v2/authorization` | Check entity authorization |
| POST | `/v2/recognition` | Check entity recognition |
| GET | `/v2/metadata` | Get registry metadata |

## Data Models

### Authorization Request
```typescript
interface AuthorizationRequest {
  entity_id: string;      // DID of issuer/verifier
  authority_id: string;   // DID of registry (ecosystem)
  action: string;         // "issue" or "verify"
  resource: string;       // Credential type
  context?: {
    time?: string;        // ISO timestamp for point-in-time query
    locator?: string;     // Optional locator
  };
}
```


### Authorization Response
```typescript
interface AuthorizationResponse {
  authorized: boolean;     // Result
  entity_id: string;
  authority_id: string;
  action: string;
  resource: string;
  time_evaluated: string;  // When query was evaluated
  message?: string;        // Optional explanation
}
```

### Recognition Request
```typescript
interface RecognitionRequest {
  entity_id: string;      // DID of authority being recognized
  authority_id: string;   // DID of recognizing authority
  action: string;         // "recognize" or "govern"
  resource: string;       // Scope of recognition
  context?: {
    time?: string;
    locator?: string;
  };
}
```

### Recognition Response
```typescript
interface RecognitionResponse {
  recognized: boolean;     // Result
  entity_id: string;
  authority_id: string;
  action: string;
  resource: string;
  time_evaluated: string;
  message?: string;
}
```

## Fitur Utama

### 1. Query Type Selector
Tab untuk memilih jenis query:
- **Authorization**: Cek apakah issuer/verifier berwenang
- **Recognition**: Cek apakah authority diakui

### 2. Query Builder Form
Fields:
- **Entity ID**: DID yang akan dicek
- **Authority ID**: DID registry/authority
- **Action**: Dropdown (issue/verify atau recognize/govern)
- **Resource**: Credential type atau scope
- **Query Time**: Optional timestamp untuk historical query

### 3. Quick Registry Selection
Tombol shortcut untuk memilih registry yang sudah terdaftar

### 4. Result Display
- Status badge (Authorized/Not Authorized atau Recognized/Not Recognized)
- Detail response fields
- Timestamp evaluasi
- Message jika ada

## Cara Kerja

### Authorization Query Flow
```
1. User pilih tab "Authorization"
2. Isi Entity ID (issuer/verifier DID)
3. Isi Authority ID (registry ecosystem DID)
4. Pilih Action (issue/verify)
5. Isi Resource (credential type)
6. Klik "Execute Query"
7. Frontend POST ke /v2/authorization
8. Backend:
   - Parse request
   - Find registry by authority_id
   - Find issuer/verifier by entity_id
   - Check status, validity period, schemas
   - Return authorization result
9. Display result
```

### Recognition Query Flow
```
1. User pilih tab "Recognition"
2. Isi Entity ID (authority DID yang dicek)
3. Isi Authority ID (authority yang mengakui)
4. Pilih Action (recognize/govern)
5. Isi Resource (scope)
6. Klik "Execute Query"
7. Frontend POST ke /v2/recognition
8. Backend:
   - Find recognition record
   - Check validity
   - Return recognition result
9. Display result
```

## UI Components

### Query Page
```
┌─────────────────────────────────────────────────────────┐
│  TRQP Query                                             │
│  Test Trust Registry Query Protocol endpoints           │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐ ┌─────────────────────┐       │
│  │                     │ │                     │       │
│  │   Query Builder     │ │   Query Result      │       │
│  │                     │ │                     │       │
│  │ [Authorization|Recognition]                  │       │
│  │                     │ │                     │       │
│  │ Entity ID *         │ │  ┌───────────────┐ │       │
│  │ [did:web:issuer...] │ │  │ ✓ AUTHORIZED  │ │       │
│  │                     │ │  └───────────────┘ │       │
│  │ Authority ID *      │ │                     │       │
│  │ [did:web:registry..]│ │  Entity: did:web:..│       │
│  │ [Reg1] [Reg2] [Reg3]│ │  Authority: did:.. │       │
│  │                     │ │  Action: issue     │       │
│  │ Action *  Resource *│ │  Resource: Degree  │       │
│  │ [issue▼] [Degree  ] │ │  Evaluated: 10:30  │       │
│  │                     │ │                     │       │
│  │ Query Time (opt)    │ │                     │       │
│  │ [2024-01-15 10:00 ] │ │                     │       │
│  │                     │ │                     │       │
│  │ [Execute Query][Clear]                      │       │
│  └─────────────────────┘ └─────────────────────┘       │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐ ┌─────────────────────┐       │
│  │ 🛡️ Authorization     │ │ 🔗 Recognition       │       │
│  │ Check if entity is  │ │ Check if authority  │       │
│  │ authorized to issue │ │ recognizes another  │       │
│  │ or verify           │ │ authority           │       │
│  │ POST /v2/authorization POST /v2/recognition │       │
│  └─────────────────────┘ └─────────────────────┘       │
└─────────────────────────────────────────────────────────┘
```

### Result States

#### Authorized
```
┌─────────────────────────────────────────┐
│  ✓ AUTHORIZED                           │
│  Entity is authorized for this action   │
│  ─────────────────────────────────────  │
│  Entity:    did:web:issuer.example.com  │
│  Authority: did:web:registry.example.com│
│  Action:    issue                       │
│  Resource:  UniversityDegree            │
│  Evaluated: Jan 15, 2024 10:30:00       │
└─────────────────────────────────────────┘
```

#### Not Authorized
```
┌─────────────────────────────────────────┐
│  ✗ NOT AUTHORIZED                       │
│  Entity is not authorized               │
│  ─────────────────────────────────────  │
│  Entity:    did:web:unknown.example.com │
│  Authority: did:web:registry.example.com│
│  Action:    issue                       │
│  Resource:  UniversityDegree            │
│  Evaluated: Jan 15, 2024 10:30:00       │
│                                         │
│  Message: Entity not found in registry  │
└─────────────────────────────────────────┘
```

## Authorization Logic

### Issuer Authorization Check
```typescript
function checkIssuerAuthorization(request): boolean {
  // 1. Find registry by authority_id (ecosystemDid)
  const registry = findRegistryByDid(request.authority_id);
  if (!registry || registry.status !== 'active') return false;
  
  // 2. Find issuer by entity_id
  const issuer = findIssuerByDid(request.entity_id);
  if (!issuer || issuer.registryId !== registry.id) return false;
  
  // 3. Check issuer status
  if (issuer.status !== 'active') return false;
  
  // 4. Check validity period
  const queryTime = request.context?.time || new Date();
  if (issuer.validFrom && queryTime < issuer.validFrom) return false;
  if (issuer.validUntil && queryTime > issuer.validUntil) return false;
  
  // 5. Check credential schema
  const hasSchema = issuer.credentialSchemas.some(
    s => s.type === request.resource && s.status === 'active'
  );
  if (!hasSchema) return false;
  
  return true;
}
```

### Verifier Authorization Check
```typescript
function checkVerifierAuthorization(request): boolean {
  // Similar to issuer but for action === 'verify'
  // ...
}
```

## Error Handling

| Error | Response |
|-------|----------|
| 400 Missing fields | `{ "detail": "entity_id is required" }` |
| 404 Authority not found | `{ "authorized": false, "message": "Authority not found" }` |
| 500 Server error | `{ "detail": "Internal server error" }` |

## Testing

```bash
# Authorization Query
curl -X POST http://localhost:3000/v2/authorization \
  -H "Content-Type: application/json" \
  -d '{
    "entity_id": "did:web:issuer.example.com",
    "authority_id": "did:web:registry.example.com",
    "action": "issue",
    "resource": "UniversityDegree"
  }'

# Recognition Query
curl -X POST http://localhost:3000/v2/recognition \
  -H "Content-Type: application/json" \
  -d '{
    "entity_id": "did:web:other-registry.example.com",
    "authority_id": "did:web:main-registry.example.com",
    "action": "recognize",
    "resource": "professional-licenses"
  }'

# Point-in-time Query
curl -X POST http://localhost:3000/v2/authorization \
  -H "Content-Type: application/json" \
  -d '{
    "entity_id": "did:web:issuer.example.com",
    "authority_id": "did:web:registry.example.com",
    "action": "issue",
    "resource": "UniversityDegree",
    "context": {
      "time": "2024-01-01T00:00:00Z"
    }
  }'
```

## TRQP Specification Compliance

Endpoint ini mengikuti ToIP Trust Registry Query Protocol v2:
- Request/Response format sesuai spec
- Support point-in-time queries via context.time
- Support context.locator untuk federation

## Catatan Pengembangan
- TRQP adalah public endpoint (no auth required)
- Pertimbangkan rate limiting
- Cache results untuk performance
- Log queries untuk audit
- Support delegation chain lookup
