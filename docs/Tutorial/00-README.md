# Tutorial Trust Registry

Panduan step-by-step untuk menggunakan Trust Registry Admin UI.

## Daftar Tutorial

| No | Tutorial | Deskripsi |
|----|----------|-----------|
| 01 | [Getting Started](./01-getting-started.md) | Memulai dari nol: login, buat framework, registry, schema, issuer, verifier |
| 02 | [Managing Recognitions](./02-managing-recognitions.md) | Membuat hubungan kepercayaan antar registry |
| 03 | [Issuer Delegation](./03-issuer-delegation.md) | Mendelegasikan wewenang penerbitan credential |
| 04 | [Managing API Keys](./04-managing-api-keys.md) | Membuat dan mengelola API keys |
| 05 | [Audit & Monitoring](./05-audit-monitoring.md) | Memantau aktivitas dan audit logs |

## Cara Menggunakan Tutorial

1. **Mulai dari Getting Started** jika Anda baru pertama kali
2. **Ikuti langkah demi langkah** sesuai urutan
3. **Tambahkan screenshot** Anda sendiri di tempat yang ditandai

## Menambahkan Screenshot

Setiap tutorial memiliki placeholder untuk screenshot:

```markdown
<!-- Screenshot: Nama Screenshot -->
![Alt Text](./images/nama-file.png)
```

### Langkah menambahkan screenshot:

1. Ambil screenshot dari aplikasi
2. Simpan di folder `backend/docs/Tutorial/images/`
3. Gunakan nama file sesuai yang ada di tutorial
4. Screenshot akan otomatis muncul di dokumentasi

### Naming Convention untuk Screenshot

```
[tutorial-number]-[step-number]-[description].png

Contoh:
01-login.png
02-dashboard.png
03-menu-tf.png
recog-01-registries.png
deleg-05-form.png
apikey-03-create-btn.png
```

## Folder Structure

```
backend/docs/Tutorial/
├── 00-README.md           # File ini
├── 01-getting-started.md  # Tutorial memulai
├── 02-managing-recognitions.md
├── 03-issuer-delegation.md
├── 04-managing-api-keys.md
├── 05-audit-monitoring.md
└── images/                # Folder untuk screenshot
    ├── 01-login.png
    ├── 02-dashboard.png
    └── ...
```

## Tips Membuat Screenshot

1. **Konsisten**: Gunakan ukuran browser yang sama
2. **Highlight**: Gunakan kotak merah untuk highlight area penting
3. **Crop**: Crop hanya bagian yang relevan
4. **Annotate**: Tambahkan nomor atau panah jika perlu
5. **Format**: Gunakan PNG untuk kualitas terbaik

## Tools untuk Screenshot

- **macOS**: Cmd + Shift + 4 (area) atau Cmd + Shift + 5 (options)
- **Windows**: Win + Shift + S (Snipping Tool)
- **Chrome Extension**: Awesome Screenshot, Lightshot
- **Annotation**: Skitch, Snagit, atau Preview (macOS)

## Kontribusi

Jika ingin menambah tutorial baru:

1. Buat file dengan format `XX-nama-tutorial.md`
2. Ikuti struktur yang sama dengan tutorial lain
3. Tambahkan ke daftar di README ini
4. Buat placeholder untuk screenshot

## Referensi

- [Pedoman Lengkap](../Pedoman/00-README.md) - Dokumentasi teknis per fitur
- [API Guide](../API-GUIDE.md) - Panduan penggunaan API
- [Endpoints](../ENDPOINTS.md) - Daftar semua API endpoints
