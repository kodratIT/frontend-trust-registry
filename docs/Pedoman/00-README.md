# Pedoman Trust Registry

Dokumentasi lengkap untuk setiap fitur Trust Registry Admin UI dan Backend API.

## Daftar Fitur

| No | Fitur | Deskripsi | File |
|----|-------|-----------|------|
| 01 | [Dashboard](./01-dashboard.md) | Halaman utama dengan statistik dan overview | `+page.svelte` |
| 02 | [Trust Frameworks](./02-trust-frameworks.md) | Manajemen kerangka kepercayaan | `/trust-frameworks` |
| 03 | [Registries](./03-registries.md) | Manajemen registry dalam ekosistem | `/registries` |
| 04 | [Issuers](./04-issuers.md) | Manajemen penerbit credential + delegations | `/issuers` |
| 05 | [Verifiers](./05-verifiers.md) | Manajemen verifikator credential | `/verifiers` |
| 06 | [Schemas](./06-schemas.md) | Manajemen schema credential | `/schemas` |
| 07 | [TRQP Query](./07-trqp-query.md) | Testing TRQP v2 endpoints | `/trqp` |
| 08 | [Recognitions](./08-recognitions.md) | Manajemen inter-registry trust | `/recognitions` |
| 09 | [Legacy Query](./09-legacy-query.md) | Query format lama (deprecated) | `/query` |
| 10 | [Audit Logs](./10-audit-logs.md) | Log semua operasi sistem | `/audit` |
| 11 | [API Keys](./11-api-keys.md) | Manajemen API keys | `/api-keys` |
| 12 | [Settings](./12-settings.md) | Pengaturan akun dan preferensi | `/settings` |
| 13 | [Login & Auth](./13-login-auth.md) | Sistem autentikasi | `/login` |

## Struktur Dokumentasi

Setiap file pedoman mengikuti struktur:

```
# Nama Fitur

## Deskripsi
Penjelasan singkat tentang fitur

## Lokasi File
Path ke file frontend dan backend

## API Endpoints
Tabel endpoint yang tersedia

## Data Model
TypeScript interface untuk data

## Fitur Utama
Daftar fitur dengan penjelasan

## Cara Kerja
Flow diagram dan penjelasan

## UI Components
ASCII mockup tampilan

## Validasi
Aturan validasi data

## Error Handling
Tabel error dan handling

## Permissions
Matrix permission per role

## Testing
Contoh curl commands

## Catatan Pengembangan
Tips dan pertimbangan
```

## Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (SvelteKit)                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ Routes  │ │Components│ │  Stores │ │API Client│           │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘           │
└───────┼──────────┼──────────┼──────────┼────────────────────┘
        │          │          │          │
        └──────────┴──────────┴──────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend (Express + Prisma)               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ Routes  │ │Controllers│ │Services │ │ Prisma  │           │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘           │
└───────┼──────────┼──────────┼──────────┼────────────────────┘
        │          │          │          │
        └──────────┴──────────┴──────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database (PostgreSQL)                   │
└─────────────────────────────────────────────────────────────┘
```

## Hierarki Data

```
Trust Framework
    │
    └── Registry (ecosystemDid)
            │
            ├── Issuer (did) ──── Credential Schemas
            │       │
            │       └── Delegations ──→ Other Issuers
            │
            ├── Verifier (did) ──── Credential Schemas
            │
            └── Credential Schema
                    │
                    └── Issuers (many-to-many)

Recognition (inter-registry trust)
    │
    ├── Authority Registry
    └── Entity (DID of recognized authority)
```

## TRQP Endpoints

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/v2/authorization` | POST | Check entity authorization |
| `/v2/recognition` | POST | Check entity recognition |
| `/v2/metadata` | GET | Get registry metadata |

## Role Permissions

| Permission | Admin | Operator | Viewer |
|------------|-------|----------|--------|
| Read | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ❌ |
| Update | ✅ | ✅ | ❌ |
| Delete | ✅ | ❌ | ❌ |
| Manage API Keys | ✅ | ❌ | ❌ |

## Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@localhost:5432/trust_registry
PORT=3000
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000
```

## Kontak

Untuk pertanyaan atau kontribusi, hubungi tim pengembang.
