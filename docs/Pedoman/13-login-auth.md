# 13. Login & Authentication

## Deskripsi
Sistem autentikasi untuk mengakses Trust Registry Admin UI. Menggunakan API Key based authentication.

## Lokasi File
- **Frontend Login**: `frontend/src/routes/login/+page.svelte`
- **Frontend Layout**: `frontend/src/routes/+layout.svelte`
- **Auth Store**: `frontend/src/lib/stores/auth.ts`
- **Backend Middleware**: `backend/src/middleware/auth.ts`

## Authentication Flow

### Login Flow
```
1. User buka aplikasi
2. Check auth store untuk existing session
3. Jika tidak ada session, redirect ke /login
4. User masukkan API key
5. Validasi key dengan GET /api/auth/validate
6. Jika valid:
   - Simpan key ke auth store
   - Simpan ke localStorage
   - Redirect ke dashboard
7. Jika invalid:
   - Tampilkan error message
```

### Session Check Flow
```
1. App load (+layout.svelte)
2. Check localStorage untuk saved key
3. Jika ada key:
   - Validate dengan backend
   - Jika valid, set auth store
   - Jika invalid, clear dan redirect ke login
4. Jika tidak ada key:
   - Redirect ke login (kecuali sudah di /login)
```

### Logout Flow
```
1. User klik logout
2. Clear auth store
3. Clear localStorage
4. Redirect ke /login
```


## UI Components

### Login Page
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    ✨ Trust Registry                    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                  │   │
│  │  Sign in to your account                        │   │
│  │  Enter your API key to access the dashboard     │   │
│  │                                                  │   │
│  │  API Key                                        │   │
│  │  ┌──────────────────────────────────────────┐  │   │
│  │  │ tr_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx      │  │   │
│  │  └──────────────────────────────────────────┘  │   │
│  │                                                  │   │
│  │  [        🔐 Sign In                        ]  │   │
│  │                                                  │   │
│  │  ─────────────────────────────────────────────  │   │
│  │  Don't have an API key?                        │   │
│  │  Contact your administrator                     │   │
│  │                                                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### User Menu (Sidebar Footer)
```
┌─────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────┐   │
│  │ [AD] Admin                              [⌃⌄]    │   │
│  │      Admin Role                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Dropdown:                                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ⚙️ Settings                                      │   │
│  │ ─────────────────────────────────────────────── │   │
│  │ 🚪 Log out                                       │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Auth Store

```typescript
// frontend/src/lib/stores/auth.ts
import { writable } from 'svelte/store';

interface AuthState {
  isAuthenticated: boolean;
  apiKey: string | null;
  role: 'admin' | 'operator' | 'viewer' | null;
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    isAuthenticated: false,
    apiKey: null,
    role: null,
  });

  return {
    subscribe,
    login: (apiKey: string, role: string) => {
      localStorage.setItem('apiKey', apiKey);
      localStorage.setItem('role', role);
      set({ isAuthenticated: true, apiKey, role });
    },
    logout: () => {
      localStorage.removeItem('apiKey');
      localStorage.removeItem('role');
      set({ isAuthenticated: false, apiKey: null, role: null });
    },
    init: () => {
      const apiKey = localStorage.getItem('apiKey');
      const role = localStorage.getItem('role');
      if (apiKey) {
        set({ isAuthenticated: true, apiKey, role });
      }
    },
  };
}

export const auth = createAuthStore();
```

## API Client Configuration

```typescript
// frontend/src/lib/api/client.ts
import axios from 'axios';
import { auth } from '$lib/stores';
import { get } from 'svelte/store';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

// Add API key to all requests
apiClient.interceptors.request.use((config) => {
  const { apiKey } = get(auth);
  if (apiKey) {
    config.headers['X-API-Key'] = apiKey;
  }
  return config;
});

// Handle 401 responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      auth.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { apiClient };
```

## Protected Routes

```svelte
<!-- frontend/src/routes/+layout.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores';
  import { onMount } from 'svelte';

  const publicRoutes = ['/login'];

  onMount(() => {
    auth.init();
  });

  $: {
    const isPublicRoute = publicRoutes.includes($page.url.pathname);
    if (!$auth.isAuthenticated && !isPublicRoute) {
      goto('/login');
    }
  }
</script>
```

## Backend Auth Middleware

```typescript
// backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { apiKeyService } from '../services/apiKeyService';

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  const keyData = await apiKeyService.validate(apiKey);
  
  if (!keyData) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  // Attach user info to request
  req.user = {
    apiKeyId: keyData.id,
    role: keyData.role,
  };

  // Update last used
  await apiKeyService.updateLastUsed(keyData.id);

  next();
}
```

## Error Handling

| Error | Handling |
|-------|----------|
| 401 Unauthorized | Redirect ke /login |
| Invalid API key | Tampilkan error message |
| Network error | Tampilkan connection error |

## Security Considerations

1. **API Key Storage**
   - Simpan di localStorage (client-side)
   - Pertimbangkan httpOnly cookie untuk production

2. **Key Transmission**
   - Selalu gunakan HTTPS
   - Key dikirim via header, bukan URL

3. **Session Management**
   - Tidak ada session timeout (key-based)
   - Logout manual required

4. **CORS**
   - Configure allowed origins di backend

## Testing

```bash
# Validate API Key
curl -X GET http://localhost:3000/api/auth/validate \
  -H "X-API-Key: tr_your-api-key"

# Response (valid)
{
  "valid": true,
  "role": "admin"
}

# Response (invalid)
{
  "valid": false,
  "error": "Invalid API key"
}
```

## Catatan Pengembangan
- Pertimbangkan OAuth/OIDC untuk enterprise
- Implement session timeout untuk security
- Add MFA support untuk admin accounts
- Log semua login attempts
