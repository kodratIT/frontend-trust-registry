# Tutorial: Mengelola API Keys

Panduan untuk membuat dan mengelola API Keys untuk akses ke Trust Registry.

## Apa itu API Key?

API Key adalah kredensial untuk mengakses Trust Registry API. Setiap key memiliki role yang menentukan permission:

| Role | Read | Create | Update | Delete | Manage Keys |
|------|------|--------|--------|--------|-------------|
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Operator | ✅ | ✅ | ✅ | ❌ | ❌ |
| Viewer | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## Langkah 1: Buka Menu API Keys

1. Klik menu **API Keys** di sidebar (di bawah System)

<!-- Screenshot: Menu API Keys -->
![Menu API Keys](./images/apikey-01-menu.png)

---

## Langkah 2: Lihat Existing Keys

Halaman menampilkan semua API Keys yang ada:
- **Name**: Nama deskriptif
- **Key**: Key yang di-mask (tr_****...)
- **Role**: Permission level
- **Last Used**: Terakhir digunakan

<!-- Screenshot: List API Keys -->
![List API Keys](./images/apikey-02-list.png)

---

## Langkah 3: Create New API Key

### 3.1 Klik Create API Key
1. Klik tombol **+ Create API Key**

<!-- Screenshot: Create Button -->
![Create Button](./images/apikey-03-create-btn.png)

### 3.2 Isi Form

| Field | Contoh | Keterangan |
|-------|--------|------------|
| Name | `Integration Service` | Nama untuk identifikasi |
| Role | `Operator` | Permission level |

<!-- Screenshot: Create Form -->
![Create Form](./images/apikey-04-form.png)

### 3.3 Klik Create
1. Klik tombol **Create API Key**

---

## Langkah 4: Simpan API Key

⚠️ **PENTING**: Key hanya ditampilkan SEKALI!

### 4.1 Copy Key
1. Modal akan muncul dengan key baru
2. Klik tombol **Copy** untuk copy ke clipboard

<!-- Screenshot: Key Created Modal -->
![Key Created](./images/apikey-05-created.png)

### 4.2 Simpan di Tempat Aman
1. Paste key ke password manager atau file aman
2. Jangan share key via email atau chat

### 4.3 Klik Done
1. Setelah copy, klik **Done**
2. Key tidak akan ditampilkan lagi

---

## Langkah 5: Gunakan API Key

### 5.1 Untuk Login UI
1. Buka halaman login
2. Paste API Key
3. Klik Sign In

### 5.2 Untuk API Request
Tambahkan header `X-API-Key`:

```bash
curl -X GET http://localhost:3000/api/issuers \
  -H "X-API-Key: tr_your-api-key-here"
```

### 5.3 Untuk Integration
```javascript
// JavaScript/Node.js
const response = await fetch('http://localhost:3000/api/issuers', {
  headers: {
    'X-API-Key': 'tr_your-api-key-here'
  }
});
```

```python
# Python
import requests

response = requests.get(
    'http://localhost:3000/api/issuers',
    headers={'X-API-Key': 'tr_your-api-key-here'}
)
```

---

## Langkah 6: Delete API Key

Jika key tidak diperlukan atau compromised:

### 6.1 Temukan Key
1. Buka halaman **API Keys**
2. Temukan key yang ingin dihapus

### 6.2 Klik Delete
1. Klik icon 🗑️ (trash) di baris key
2. Konfirmasi dengan klik **Yes, Delete**

<!-- Screenshot: Delete Confirmation -->
![Delete Confirmation](./images/apikey-06-delete.png)

### 6.3 Verifikasi
- Key langsung tidak bisa digunakan
- Request dengan key tersebut akan mendapat error 401

---

## Best Practices

### 1. Naming Convention
Gunakan nama yang jelas:
- ✅ `Production Backend Service`
- ✅ `CI/CD Pipeline`
- ✅ `Mobile App v2`
- ❌ `test`
- ❌ `key1`

### 2. Principle of Least Privilege
Berikan role minimum yang diperlukan:
- Read-only integration → `Viewer`
- CRUD operations → `Operator`
- Full admin access → `Admin`

### 3. Key Rotation
- Rotate keys secara berkala (misal: setiap 90 hari)
- Segera rotate jika ada suspicion of compromise

### 4. Separate Keys per Environment
```
Production API Key  → untuk production
Staging API Key     → untuk staging
Development API Key → untuk development
```

### 5. Separate Keys per Service
```
Backend Service Key → untuk backend
Mobile App Key      → untuk mobile
Partner API Key     → untuk partner integration
```

---

## Monitoring Key Usage

### Lihat Last Used
1. Buka halaman **API Keys**
2. Kolom **Last Used** menunjukkan kapan key terakhir digunakan

### Cek Audit Logs
1. Buka menu **Audit Logs**
2. Filter by actor (API key name)
3. Lihat semua aktivitas dari key tersebut

<!-- Screenshot: Audit Logs -->
![Audit Logs](./images/apikey-07-audit.png)

---

## Troubleshooting

### Error: "API key required"
- Pastikan header `X-API-Key` ada di request
- Pastikan tidak ada typo di header name

### Error: "Invalid API key"
- Pastikan key benar (copy ulang dari source)
- Pastikan key belum dihapus
- Pastikan tidak ada whitespace di key

### Error: "Insufficient permissions"
- Key tidak punya permission untuk action tersebut
- Gunakan key dengan role yang lebih tinggi
- Atau minta admin untuk upgrade role

### Key tidak muncul di list
- Key mungkin sudah dihapus
- Refresh halaman
- Cek dengan admin

---

## Security Checklist

- [ ] Jangan hardcode key di source code
- [ ] Gunakan environment variables
- [ ] Jangan commit key ke git
- [ ] Jangan share key via email/chat
- [ ] Rotate key jika compromised
- [ ] Delete key yang tidak digunakan
- [ ] Monitor usage via audit logs

---

## Selanjutnya

- 📖 [Tutorial: Audit dan Monitoring](./05-audit-monitoring.md)
- 📖 [Kembali ke Getting Started](./01-getting-started.md)
