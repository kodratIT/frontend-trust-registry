# 11. API Keys

## Deskripsi
API Keys digunakan untuk autentikasi akses ke Trust Registry API. Setiap key memiliki role yang menentukan permission level.

## Lokasi File
- **Frontend**: `frontend/src/routes/api-keys/+page.svelte`
- **Backend Controller**: `backend/src/controllers/apiKeyController.ts`
- **Backend Service**: `backend/src/services/apiKeyService.ts`
- **Backend Routes**: `backend/src/routes/apiKeyRoutes.ts`
- **Backend Middleware**: `backend/src/middleware/auth.ts`
- **API Client**: `frontend/src/lib/api/apiKeys.ts`

## API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/api-keys` | List semua API keys |
| POST | `/api/api-keys` | Create API key baru |
| DELETE | `/api/api-keys/:id` | Delete/revoke API key |

## Data Model

```typescript
interface ApiKey {
  id: string;                    // UUID
  name: string;                  // Nama deskriptif
  key: string;                   // Key value (hashed in DB)
  role: 'admin' | 'operator' | 'viewer';
  lastUsedAt?: Date;             // Terakhir digunakan
  expiresAt?: Date;              // Tanggal expired
  createdAt: Date;
  createdBy?: string;            // User yang membuat
}
```


## Role Permissions

| Permission | Admin | Operator | Viewer |
|------------|-------|----------|--------|
| Read all resources | ✅ | ✅ | ✅ |
| Create resources | ✅ | ✅ | ❌ |
| Update resources | ✅ | ✅ | ❌ |
| Delete resources | ✅ | ❌ | ❌ |
| Manage API keys | ✅ | ❌ | ❌ |
| Change status | ✅ | ✅ | ❌ |

## Fitur Utama

### 1. List API Keys
- Tabel dengan semua keys
- Masked key display (tr_****...)
- Role badge
- Last used timestamp
- Delete button

### 2. Create API Key
Form fields:
- **Name** (required): Nama deskriptif untuk key
- **Role** (required): admin/operator/viewer

### 3. Key Display
- Key ditampilkan sekali saat create
- Copy to clipboard button
- Warning untuk menyimpan key

### 4. Delete API Key
- Konfirmasi dialog
- Immediate revocation

## Cara Kerja

### Create Flow
```
1. User klik "Create API Key"
2. Isi nama dan pilih role
3. POST ke /api/api-keys
4. Backend:
   - Generate random key (tr_xxxxxxxxxxxx)
   - Hash key untuk storage
   - Simpan ke database
   - Return plain key (sekali saja)
5. Display key dengan copy button
6. User copy dan simpan key
```

### Authentication Flow
```
1. Client kirim request dengan header X-API-Key
2. Auth middleware extract key
3. Lookup key di database (by hash)
4. Validate key exists dan tidak expired
5. Attach user info ke request
6. Update lastUsedAt
7. Continue ke handler
```

## UI Components

### API Keys Page
```
┌─────────────────────────────────────────────────────────┐
│  🔑 API Keys                         [+ Create API Key] │
│  Manage API keys for accessing the Trust Registry API   │
├─────────────────────────────────────────────────────────┤
│  Name           │ Key              │ Role    │ Last Used│
│  ───────────────┼──────────────────┼─────────┼──────────│
│  Production Key │ tr_7f8a****9b2c  │ [Admin] │ 2 hrs ago│
│  ───────────────┼──────────────────┼─────────┼──────────│
│  Read Only      │ tr_3d4e****1a2b  │ [Viewer]│ 1 day ago│
│  ───────────────┼──────────────────┼─────────┼──────────│
│  Integration    │ tr_9c8d****5e6f  │[Operator│ Never    │
└─────────────────────────────────────────────────────────┘
```

### Create Modal
```
┌─────────────────────────────────────────────────────────┐
│  Create API Key                                    [×]  │
├─────────────────────────────────────────────────────────┤
│  Name *                                                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Production API Key                              │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Role                                                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Admin                                       ▼   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│                              [Cancel] [Create API Key]  │
└─────────────────────────────────────────────────────────┘
```

### Key Created Modal
```
┌─────────────────────────────────────────────────────────┐
│  ✓ API Key Created                                 [×]  │
├─────────────────────────────────────────────────────────┤
│  ⚠️ Make sure to copy your API key now.                 │
│  You won't be able to see it again!                    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ tr_7f8a9b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│                                        [📋 Copy] [Done] │
└─────────────────────────────────────────────────────────┘
```

## Key Format
```
tr_[32 random alphanumeric characters]

Example: tr_7f8a9b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s
```

## Security Best Practices

### Key Generation
```typescript
import crypto from 'crypto';

function generateApiKey(): string {
  const prefix = 'tr_';
  const randomBytes = crypto.randomBytes(24);
  const key = randomBytes.toString('base64url');
  return prefix + key;
}
```

### Key Storage
```typescript
import bcrypt from 'bcrypt';

// Store hashed key
const hashedKey = await bcrypt.hash(plainKey, 10);

// Verify key
const isValid = await bcrypt.compare(providedKey, hashedKey);
```

## Error Handling

| Error | Response |
|-------|----------|
| 401 No key | `{ "error": "API key required" }` |
| 401 Invalid key | `{ "error": "Invalid API key" }` |
| 401 Expired key | `{ "error": "API key expired" }` |
| 403 Insufficient permission | `{ "error": "Insufficient permissions" }` |

## Testing

```bash
# Create API Key
curl -X POST http://localhost:3000/api/api-keys \
  -H "Content-Type: application/json" \
  -H "X-API-Key: admin-api-key" \
  -d '{
    "name": "Test Key",
    "role": "viewer"
  }'

# List API Keys
curl -X GET http://localhost:3000/api/api-keys \
  -H "X-API-Key: admin-api-key"

# Delete API Key
curl -X DELETE http://localhost:3000/api/api-keys/{id} \
  -H "X-API-Key: admin-api-key"

# Use API Key
curl -X GET http://localhost:3000/api/issuers \
  -H "X-API-Key: tr_your-api-key-here"
```

## Catatan Pengembangan
- Key hanya ditampilkan sekali saat create
- Simpan hash, bukan plain key
- Implement rate limiting per key
- Log semua penggunaan key
- Pertimbangkan key rotation policy
- Support key expiration
