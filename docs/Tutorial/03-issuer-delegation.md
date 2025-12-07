# Tutorial: Delegasi Issuer

Panduan untuk mendelegasikan wewenang penerbitan credential dari satu issuer ke issuer lain.

## Apa itu Delegation?

Delegation memungkinkan issuer (root) mendelegasikan wewenang ke issuer lain (delegate) untuk menerbitkan credential atas namanya. Contoh:
- Universitas pusat mendelegasikan ke kampus cabang
- Organisasi induk mendelegasikan ke anak perusahaan

---

## Skenario

Kita akan membuat skenario:
- **University ABC** (root issuer) mendelegasikan ke **Branch Campus** (delegate)

---

## Langkah 1: Pastikan Ada 2 Issuer

### Issuer 1 (Root/Delegator)
| Field | Value |
|-------|-------|
| DID | `did:web:university-abc.edu` |
| Name | `University ABC` |
| Status | `Active` |

### Issuer 2 (Delegate)
| Field | Value |
|-------|-------|
| DID | `did:web:branch-campus.edu` |
| Name | `Branch Campus` |
| Status | `Active` |

> ⚠️ **Penting**: Kedua issuer harus sudah terdaftar di sistem.

<!-- Screenshot: List Issuers -->
![List Issuers](./images/deleg-01-issuers.png)

---

## Langkah 2: Buka Detail Root Issuer

1. Klik menu **Issuers** di sidebar
2. Klik pada **University ABC** untuk buka detail

<!-- Screenshot: Detail Issuer -->
![Detail Issuer](./images/deleg-02-detail.png)

---

## Langkah 3: Temukan Section Delegations

1. Scroll ke bawah
2. Temukan section **Delegations**
3. Di sini akan terlihat list delegate yang sudah ada

<!-- Screenshot: Delegations Section -->
![Delegations Section](./images/deleg-03-section.png)

---

## Langkah 4: Klik Add Delegate

1. Klik tombol **+ Add Delegate**

<!-- Screenshot: Add Delegate Button -->
![Add Delegate Button](./images/deleg-04-add-btn.png)

---

## Langkah 5: Isi Form Delegation

| Field | Value | Keterangan |
|-------|-------|------------|
| Delegate DID | `did:web:branch-campus.edu` | DID issuer yang akan didelegasikan |
| Valid Until | `2025-12-31` | Tanggal expired (opsional) |

<!-- Screenshot: Delegation Form -->
![Delegation Form](./images/deleg-05-form.png)

---

## Langkah 6: Create Delegation

1. Klik tombol **Create Delegation**
2. Delegation berhasil dibuat

<!-- Screenshot: Delegation Created -->
![Delegation Created](./images/deleg-06-created.png)

---

## Langkah 7: Verifikasi

### 7.1 Lihat di Delegations Section
Delegation baru akan muncul di list:

```
┌─────────────────────────────────────────────────┐
│ Delegations                      [+ Add Delegate]│
│ ─────────────────────────────────────────────── │
│ 🔗 Branch Campus                                │
│    did:web:branch-campus.edu                    │
│    [Active]                          [Revoke]   │
└─────────────────────────────────────────────────┘
```

<!-- Screenshot: Delegation in List -->
![Delegation in List](./images/deleg-07-list.png)

### 7.2 Test dengan TRQP Query
1. Buka **TRQP Query**
2. Query authorization untuk delegate:

| Field | Value |
|-------|-------|
| Entity ID | `did:web:branch-campus.edu` |
| Authority ID | `did:web:edu-registry.example.com` |
| Action | `issue` |
| Resource | `UniversityDegree` |

3. Hasil harus **Authorized** (karena didelegasikan)

---

## Langkah 8: Revoke Delegation (Opsional)

Jika ingin mencabut delegation:

### 8.1 Buka Detail Root Issuer
1. Klik menu **Issuers**
2. Buka detail **University ABC**

### 8.2 Temukan Delegation
1. Scroll ke section **Delegations**
2. Temukan delegate yang ingin di-revoke

### 8.3 Klik Revoke
1. Hover pada delegation
2. Klik icon 🗑️ (trash)
3. Konfirmasi dengan klik **Yes**

<!-- Screenshot: Revoke Delegation -->
![Revoke Delegation](./images/deleg-08-revoke.png)

### 8.4 Verifikasi
- Delegation sekarang berstatus `Revoked`
- TRQP Query untuk delegate akan mengembalikan `Not Authorized`

---

## Delegation Chain

Delegation bisa bertingkat (chain):

```
Root Issuer (University ABC)
    │
    └── Delegate 1 (Branch Campus)
            │
            └── Delegate 2 (Partner Institution)
```

### Melihat Delegation Chain
1. Buka detail issuer
2. Lihat section **Delegation Chain** (jika ada)

---

## Use Cases

### 1. Branch Offices
```
Head Office ──delegate──> Branch Office A
                      ──> Branch Office B
                      ──> Branch Office C
```

### 2. Franchise Model
```
Franchisor ──delegate──> Franchisee 1
                     ──> Franchisee 2
```

### 3. Consortium
```
Consortium Lead ──delegate──> Member University 1
                          ──> Member University 2
                          ──> Member University 3
```

---

## Best Practices

1. **Limit Delegation Depth**
   - Jangan terlalu banyak level
   - Maksimal 2-3 level untuk clarity

2. **Set Expiry Date**
   - Selalu set `Valid Until`
   - Review dan perpanjang secara berkala

3. **Document Scope**
   - Catat credential types yang didelegasikan
   - Simpan agreement formal

4. **Monitor Delegates**
   - Review aktivitas delegate secara berkala
   - Revoke jika tidak aktif atau bermasalah

---

## Troubleshooting

### Delegate tidak bisa issue credential
- Pastikan delegation masih active
- Pastikan validity period belum expired
- Pastikan root issuer masih active
- Pastikan credential schema ada di root issuer

### Tidak bisa create delegation
- Pastikan delegate DID sudah terdaftar sebagai issuer
- Pastikan format DID valid
- Pastikan root issuer status active

### Delegation chain tidak terdeteksi
- Pastikan semua issuer dalam chain active
- Pastikan semua delegation active
- Cek validity period setiap level

---

## Selanjutnya

- 📖 [Tutorial: Mengelola API Keys](./04-managing-api-keys.md)
- 📖 [Tutorial: Audit dan Monitoring](./05-audit-monitoring.md)
