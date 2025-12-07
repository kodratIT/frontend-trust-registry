# Tutorial: Audit dan Monitoring

Panduan untuk memantau aktivitas dan melihat audit logs di Trust Registry.

## Mengapa Audit Penting?

Audit logs membantu Anda:
- 🔍 Melacak siapa melakukan apa dan kapan
- 🛡️ Mendeteksi aktivitas mencurigakan
- 📋 Memenuhi compliance requirements
- 🐛 Debugging dan troubleshooting

---

## Langkah 1: Buka Audit Logs

1. Klik menu **Audit Logs** di sidebar (di bawah Tools)

<!-- Screenshot: Menu Audit -->
![Menu Audit](./images/audit-01-menu.png)

---

## Langkah 2: Lihat Log Entries

Halaman menampilkan semua aktivitas:

| Kolom | Deskripsi |
|-------|-----------|
| Timestamp | Waktu operasi |
| Actor | User/API key yang melakukan |
| Action | CREATE, READ, UPDATE, DELETE |
| Resource | Jenis resource (issuers, registries, dll) |
| Result | Success atau Failure |
| Details | Link untuk detail lebih lanjut |

<!-- Screenshot: Audit List -->
![Audit List](./images/audit-02-list.png)

---

## Langkah 3: Filter Logs

### 3.1 Filter by Action
1. Klik dropdown **All Actions**
2. Pilih action yang ingin dilihat:
   - `Create` - Pembuatan data baru
   - `Read` - Pembacaan data
   - `Update` - Perubahan data
   - `Delete` - Penghapusan data

<!-- Screenshot: Filter Action -->
![Filter Action](./images/audit-03-filter-action.png)

### 3.2 Filter by Resource Type
1. Klik dropdown **All Resources**
2. Pilih resource type:
   - Trust Frameworks
   - Registries
   - Issuers
   - Verifiers
   - Schemas
   - Recognitions
   - API Keys

<!-- Screenshot: Filter Resource -->
![Filter Resource](./images/audit-04-filter-resource.png)

### 3.3 Filter by Result
1. Klik dropdown **All Results**
2. Pilih:
   - `Success` - Operasi berhasil
   - `Failure` - Operasi gagal

<!-- Screenshot: Filter Result -->
![Filter Result](./images/audit-05-filter-result.png)

---

## Langkah 4: Analisis Log Entry

### 4.1 Baca Informasi Dasar
Setiap entry menampilkan:
```
Jan 15, 2024 10:30:45 | admin | CREATE | issuers | ✓ Success
                                        did:web:example.com
```

### 4.2 Lihat Details (jika ada)
1. Klik **View** di kolom Details
2. Modal akan muncul dengan informasi tambahan

<!-- Screenshot: Log Details -->
![Log Details](./images/audit-06-details.png)

---

## Langkah 5: Refresh Data

1. Klik tombol **Refresh** di pojok kanan atas
2. Data akan di-reload dari server

<!-- Screenshot: Refresh Button -->
![Refresh Button](./images/audit-07-refresh.png)

---

## Use Cases Monitoring

### 1. Investigasi Perubahan Data

**Skenario**: Issuer tiba-tiba tidak bisa issue credential

**Langkah**:
1. Filter by Resource: `Issuers`
2. Filter by Action: `Update`
3. Cari entry untuk issuer tersebut
4. Lihat siapa yang mengubah dan kapan

<!-- Screenshot: Investigation -->
![Investigation](./images/audit-08-investigate.png)

### 2. Audit API Key Usage

**Skenario**: Ingin tahu aktivitas dari API key tertentu

**Langkah**:
1. Lihat kolom Actor
2. Cari entries dengan actor = nama API key
3. Review semua aktivitas

### 3. Deteksi Failed Operations

**Skenario**: Ingin tahu operasi yang gagal

**Langkah**:
1. Filter by Result: `Failure`
2. Review semua failed operations
3. Investigasi penyebab

### 4. Compliance Reporting

**Skenario**: Perlu laporan aktivitas untuk audit

**Langkah**:
1. Set filter sesuai periode
2. Screenshot atau export data
3. Compile ke dalam report

---

## Dashboard Monitoring

### Statistik di Dashboard
Dashboard menampilkan:
- Total entities per kategori
- Recent activity (5 terbaru)

<!-- Screenshot: Dashboard Stats -->
![Dashboard Stats](./images/audit-09-dashboard.png)

### Quick View Recent Activity
1. Buka Dashboard
2. Lihat section **Recent Activity**
3. Klik entry untuk detail

---

## Best Practices

### 1. Regular Review
- Review audit logs minimal mingguan
- Perhatikan pattern yang tidak biasa

### 2. Alert on Failures
- Monitor failed operations
- Investigasi segera jika ada spike

### 3. Track Sensitive Operations
Perhatikan khusus untuk:
- Delete operations
- Status changes
- API key management

### 4. Retention Policy
- Tentukan berapa lama logs disimpan
- Archive logs lama jika diperlukan

---

## Troubleshooting

### Logs tidak muncul
- Refresh halaman
- Cek koneksi ke backend
- Pastikan ada aktivitas yang tercatat

### Filter tidak bekerja
- Clear semua filter
- Apply ulang satu per satu
- Refresh halaman

### Timestamp tidak sesuai
- Cek timezone setting
- Logs menggunakan server timezone

---

## Checklist Monitoring Rutin

### Harian
- [ ] Cek failed operations
- [ ] Review delete operations
- [ ] Monitor unusual activity

### Mingguan
- [ ] Review semua status changes
- [ ] Audit API key usage
- [ ] Check for inactive entities

### Bulanan
- [ ] Generate compliance report
- [ ] Review access patterns
- [ ] Clean up unused API keys

---

## Selanjutnya

- 📖 [Kembali ke Getting Started](./01-getting-started.md)
- 📖 [Pedoman Lengkap](../Pedoman/00-README.md)
