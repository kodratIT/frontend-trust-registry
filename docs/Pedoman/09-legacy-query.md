# 09. Legacy Query

## Deskripsi
Legacy Query adalah halaman untuk melakukan query ke Trust Registry menggunakan format lama (pre-TRQP). Fitur ini disediakan untuk backward compatibility dengan sistem yang belum mengadopsi TRQP v2.

## Lokasi File
- **Frontend**: `frontend/src/routes/query/+page.svelte`
- **Backend Controller**: `backend/src/controllers/queryController.ts`
- **Backend Routes**: `backend/src/routes/queryRoutes.ts`
- **API Client**: `frontend/src/lib/api/query.ts`

## API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/query/issuer/:did` | Check issuer status |
| GET | `/api/query/verifier/:did` | Check verifier status |
| GET | `/api/query/schema/:type` | Get schema info |

## Fitur Utama

### 1. Issuer Query
Cek status dan informasi issuer berdasarkan DID:
- Status (active/pending/suspended/revoked)
- Registry info
- Credential types
- Validity period

### 2. Verifier Query
Cek status dan informasi verifier berdasarkan DID:
- Status
- Registry info
- Credential types yang bisa diverifikasi
- Validity period

### 3. Schema Query
Cek informasi schema berdasarkan type:
- Schema details
- Issuers yang bisa menerbitkan
- Registry info


## Cara Kerja

### Query Flow
```
1. User pilih query type (Issuer/Verifier/Schema)
2. Masukkan identifier (DID atau schema type)
3. Klik "Search"
4. GET ke endpoint yang sesuai
5. Display hasil
```

## UI Components

### Query Page
```
┌─────────────────────────────────────────────────────────┐
│  Query Trust Registry                                   │
│  Search for issuers, verifiers, and schemas            │
├─────────────────────────────────────────────────────────┤
│  Query Type                                             │
│  [Issuer] [Verifier] [Schema]                          │
│                                                         │
│  DID / Schema Type                                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │ did:web:example.com                             │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [🔍 Search]                                            │
├─────────────────────────────────────────────────────────┤
│  Result                                                 │
│  ─────────────────────────────────────────────────────  │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ✓ University ABC                    [Active]    │   │
│  │ did:web:university-abc.edu                      │   │
│  │                                                  │   │
│  │ Registry: Education Registry                    │   │
│  │ Valid: Jan 1, 2024 - Dec 31, 2025              │   │
│  │                                                  │   │
│  │ Credential Types:                               │   │
│  │ • UniversityDegree v1.0                        │   │
│  │ • AcademicTranscript v1.0                      │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Response Format

### Issuer Query Response
```json
{
  "found": true,
  "issuer": {
    "did": "did:web:university-abc.edu",
    "name": "University ABC",
    "status": "active",
    "registry": {
      "name": "Education Registry",
      "ecosystemDid": "did:web:edu-registry.example.com"
    },
    "validFrom": "2024-01-01T00:00:00Z",
    "validUntil": "2025-12-31T23:59:59Z",
    "credentialSchemas": [
      { "type": "UniversityDegree", "version": "1.0.0" }
    ]
  }
}
```

### Not Found Response
```json
{
  "found": false,
  "message": "Issuer not found"
}
```

## Perbedaan dengan TRQP

| Aspek | Legacy Query | TRQP v2 |
|-------|--------------|---------|
| Method | GET | POST |
| Format | Custom | Standard ToIP |
| Auth Check | No | Yes |
| Point-in-time | No | Yes |
| Recognition | No | Yes |

## Testing

```bash
# Query Issuer
curl -X GET "http://localhost:3000/api/query/issuer/did:web:example.com" \
  -H "X-API-Key: your-api-key"

# Query Verifier
curl -X GET "http://localhost:3000/api/query/verifier/did:web:verifier.com" \
  -H "X-API-Key: your-api-key"

# Query Schema
curl -X GET "http://localhost:3000/api/query/schema/UniversityDegree" \
  -H "X-API-Key: your-api-key"
```

## Deprecation Notice
⚠️ Legacy Query akan di-deprecate di versi mendatang. Gunakan TRQP v2 endpoints untuk integrasi baru.

## Catatan Pengembangan
- Maintain untuk backward compatibility
- Redirect users ke TRQP untuk fitur baru
- Pertimbangkan sunset timeline
