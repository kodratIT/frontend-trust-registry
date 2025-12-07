# Tutorial: Mengelola Recognitions

Panduan untuk membuat hubungan kepercayaan antar registry (inter-registry trust).

## Apa itu Recognition?

Recognition adalah mekanisme dimana satu registry (authority) mengakui registry lain untuk action dan resource tertentu. Ini penting untuk:
- Federasi antar ekosistem
- Cross-registry trust
- Governance hierarchy

---

## Skenario

Kita akan membuat skenario:
- **Main Registry** mengakui **Partner Registry** untuk credential type `ProfessionalLicense`

---

## Langkah 1: Pastikan Ada 2 Registry

Sebelum membuat recognition, pastikan sudah ada minimal 2 registry.

### Registry 1 (Authority)
| Field | Value |
|-------|-------|
| Name | `Main Registry` |
| Ecosystem DID | `did:web:main-registry.example.com` |

### Registry 2 (Entity yang diakui)
| Field | Value |
|-------|-------|
| Name | `Partner Registry` |
| Ecosystem DID | `did:web:partner-registry.example.com` |

<!-- Screenshot: List Registries -->
![List Registries](./images/recog-01-registries.png)

---

## Langkah 2: Buka Menu Recognitions

1. Klik menu **Recognitions** di sidebar (di bawah TRQP Protocol)

<!-- Screenshot: Menu Recognitions -->
![Menu Recognitions](./images/recog-02-menu.png)

---

## Langkah 3: Klik Create Recognition

1. Klik tombol **+ Create Recognition** di pojok kanan atas

<!-- Screenshot: Create Button -->
![Create Button](./images/recog-03-create-btn.png)

---

## Langkah 4: Isi Form Recognition

| Field | Value | Keterangan |
|-------|-------|------------|
| Authority Registry | `Main Registry` | Registry yang membuat pengakuan |
| Entity ID (DID) | `did:web:partner-registry.example.com` | DID registry yang diakui |
| Action | `recognize` | Jenis pengakuan |
| Resource | `professional-licenses` | Scope pengakuan |
| Valid From | `2024-01-01` | Mulai berlaku (opsional) |
| Valid Until | `2025-12-31` | Berakhir (opsional) |

<!-- Screenshot: Form Recognition -->
![Form Recognition](./images/recog-04-form.png)

### Penjelasan Action Types

| Action | Penggunaan |
|--------|------------|
| `recognize` | Pengakuan umum terhadap authority lain |
| `govern` | Mengakui sebagai governance authority |
| `delegate` | Mendelegasikan wewenang |

---

## Langkah 5: Simpan

1. Klik tombol **Create Recognition**
2. Anda akan diarahkan ke list recognitions

<!-- Screenshot: List dengan Recognition baru -->
![Recognition Created](./images/recog-05-created.png)

---

## Langkah 6: Verifikasi dengan TRQP Query

Test recognition yang baru dibuat.

### 6.1 Buka TRQP Query
1. Klik menu **TRQP Query**

### 6.2 Pilih Tab Recognition
1. Klik tab **Recognition**

### 6.3 Isi Form Query

| Field | Value |
|-------|-------|
| Entity ID | `did:web:partner-registry.example.com` |
| Authority ID | `did:web:main-registry.example.com` |
| Action | `recognize` |
| Resource | `professional-licenses` |

<!-- Screenshot: Recognition Query Form -->
![Recognition Query](./images/recog-06-query.png)

### 6.4 Execute Query
1. Klik **Execute Query**

### 6.5 Lihat Hasil

Jika berhasil:
```
✓ RECOGNIZED
Entity is recognized by authority
```

<!-- Screenshot: Recognition Result -->
![Recognition Result](./images/recog-07-result.png)

---

## Langkah 7: Revoke Recognition (Opsional)

Jika ingin mencabut recognition:

### 7.1 Buka List Recognitions
1. Klik menu **Recognitions**

### 7.2 Temukan Recognition
1. Cari recognition yang ingin di-revoke

### 7.3 Klik Delete
1. Klik icon 🗑️ (trash) di baris recognition
2. Konfirmasi dengan klik **Yes, Revoke**

<!-- Screenshot: Revoke Confirmation -->
![Revoke Confirmation](./images/recog-08-revoke.png)

### 7.4 Verifikasi
1. Recognition sekarang tidak aktif
2. TRQP Query akan mengembalikan `Not Recognized`

---

## Use Cases

### 1. Cross-Border Recognition
```
Indonesia Registry ──recognize──> Singapore Registry
                                  for: professional-licenses
```
Artinya: Indonesia mengakui lisensi profesional yang diterbitkan oleh Singapore.

### 2. Governance Hierarchy
```
National Registry ──govern──> Regional Registry
                              for: regional-credentials
```
Artinya: National Registry adalah governance authority untuk Regional Registry.

### 3. Sector-Specific Trust
```
Education Ministry ──recognize──> University Consortium
                                  for: academic-credentials
```
Artinya: Kementerian Pendidikan mengakui konsorsium universitas untuk credential akademik.

---

## Tips

1. **Gunakan Resource yang Spesifik**
   - ❌ `all` (terlalu luas)
   - ✅ `professional-licenses` (spesifik)

2. **Set Validity Period**
   - Selalu set tanggal expired untuk keamanan
   - Review dan perpanjang secara berkala

3. **Document Recognition**
   - Catat alasan recognition di sistem eksternal
   - Simpan bukti agreement antar pihak

---

## Troubleshooting

### Recognition Query mengembalikan "Not Recognized"
- Pastikan Entity ID dan Authority ID benar
- Pastikan Action dan Resource sama persis
- Cek validity period masih berlaku
- Pastikan recognition belum di-revoke

### Tidak bisa create Recognition
- Pastikan Authority Registry sudah ada dan active
- Pastikan Entity ID format DID valid

---

## Selanjutnya

- 📖 [Tutorial: Delegasi Issuer](./03-issuer-delegation.md)
- 📖 [Tutorial: Mengelola API Keys](./04-managing-api-keys.md)
