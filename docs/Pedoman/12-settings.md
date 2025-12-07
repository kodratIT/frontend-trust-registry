# 12. Settings

## Deskripsi
Halaman Settings menyediakan konfigurasi untuk akun pengguna dan preferensi aplikasi. Terdiri dari tiga tab: Account, Preferences, dan Notifications.

## Lokasi File
- **Frontend**: `frontend/src/routes/settings/+page.svelte`
- **Store**: `frontend/src/lib/stores/auth.ts`

## Fitur Utama

### 1. Account Tab
Informasi akun pengguna:
- Profile card dengan avatar
- Role badge
- System info (version, protocol, API status)
- Current API key display (masked)
- Copy API key button

### 2. Preferences Tab
Pengaturan aplikasi:
- Auto Refresh Data toggle
- Refresh Interval selector (15s, 30s, 1m, 5m)
- Compact Mode toggle
- Save Changes button

### 3. Notifications Tab
Pengaturan notifikasi:
- Enable Notifications toggle
- New Issuer Registrations toggle
- Status Changes toggle
- Schema Updates toggle
- Save Changes button


## UI Components

### Settings Page
```
┌─────────────────────────────────────────────────────────┐
│  Settings                                               │
│  Manage your account and application preferences        │
├─────────────────────────────────────────────────────────┤
│  [👤 Account] [⚙️ Preferences] [🔔 Notifications]       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────┐ ┌─────────────────────┐   │
│  │ Profile                 │ │ System              │   │
│  │ ─────────────────────── │ │ ─────────────────── │   │
│  │ [AD] Administrator      │ │ Version: 2.0.0     │   │
│  │      Admin Account      │ │ Protocol: ToIP v2  │   │
│  │      [Active]           │ │ API: Connected 🟢  │   │
│  └─────────────────────────┘ └─────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🔑 API Key                                       │   │
│  │ ─────────────────────────────────────────────── │   │
│  │ [••••••••••••••••••••••••••••] [👁️] [Copy]      │   │
│  │ Your API key is used to authenticate requests   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Preferences Tab
```
┌─────────────────────────────────────────────────────────┐
│  Application Preferences                                │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Auto Refresh Data                              [====]  │
│  Automatically refresh dashboard data                   │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Refresh Interval                                       │
│  [30 seconds ▼]                                        │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Compact Mode                                   [    ]  │
│  Use a more compact layout                             │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  [💾 Save Changes]                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Notifications Tab
```
┌─────────────────────────────────────────────────────────┐
│  Notification Settings                                  │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Enable Notifications                           [====]  │
│  Receive alerts for important events                   │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  New Issuer Registrations                       [====]  │
│  Get notified when new issuers register                │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Status Changes                                 [====]  │
│  Get notified when entity status changes               │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Schema Updates                                 [    ]  │
│  Get notified when schemas are updated                 │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  [💾 Save Changes]                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Data Storage

### Local Storage
Preferences disimpan di browser local storage:
```typescript
interface UserPreferences {
  autoRefresh: boolean;
  refreshInterval: number;  // seconds
  compactMode: boolean;
  notifications: {
    enabled: boolean;
    newIssuers: boolean;
    statusChanges: boolean;
    schemaUpdates: boolean;
  };
}

// Save
localStorage.setItem('preferences', JSON.stringify(preferences));

// Load
const preferences = JSON.parse(localStorage.getItem('preferences') || '{}');
```

## Cara Kerja

### Save Preferences Flow
```
1. User ubah setting
2. Klik "Save Changes"
3. Validasi settings
4. Simpan ke localStorage
5. Apply settings ke aplikasi
6. Toast success notification
```

### API Key Display
```
1. Load API key dari auth store
2. Mask key (show first 4 and last 4 chars)
3. Toggle visibility dengan eye icon
4. Copy full key ke clipboard
```

## Permissions

| Feature | Admin | Operator | Viewer |
|---------|-------|----------|--------|
| View Settings | ✅ | ✅ | ✅ |
| Change Preferences | ✅ | ✅ | ✅ |
| View API Key | ✅ | ✅ | ✅ |

## Catatan Pengembangan
- Settings disimpan client-side (localStorage)
- Pertimbangkan sync ke server untuk multi-device
- API key harus di-mask untuk keamanan
- Preferences harus persist across sessions
