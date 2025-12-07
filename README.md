# ToIP Trust Registry v2 - Admin Dashboard

A modern, cyberpunk-themed admin dashboard for managing ToIP Trust Registry v2 systems.

## Tech Stack

- **Framework**: SvelteKit 2 + Svelte 5
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3 + Custom Theme
- **Icons**: Lucide Svelte
- **HTTP Client**: Axios
- **Validation**: Zod

## Features

- 🎨 Distinctive cyberpunk UI with cyan/teal accent colors
- 🔐 API Key authentication
- 📊 Dashboard with real-time statistics
- 🏛️ Trust Framework management
- 📋 Registry management
- 👤 Issuer/Verifier registration and management
- 📄 Credential Schema definitions
- 🔍 Query testing interface
- 📝 Audit log viewer
- ⚙️ Settings and preferences

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Backend API running on `http://localhost:3000`

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### Build

```bash
npm run build
npm run preview
```

### Type Checking

```bash
npm run check
```

## Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:3000/v2
VITE_APP_NAME=ToIP Trust Registry
VITE_APP_VERSION=2.0.0
```

## Project Structure

```
src/
├── lib/
│   ├── api/           # API client and endpoints
│   ├── components/    # Reusable components
│   │   ├── common/    # Buttons, modals, tables, etc.
│   │   └── layout/    # App layout, sidebar, header
│   ├── stores/        # Svelte stores (auth, notifications)
│   └── types/         # TypeScript type definitions
├── routes/            # SvelteKit pages
│   ├── +layout.svelte
│   ├── +page.svelte   # Dashboard
│   ├── login/
│   ├── trust-frameworks/
│   ├── registries/
│   ├── issuers/
│   ├── verifiers/
│   ├── schemas/
│   ├── query/
│   ├── audit/
│   └── settings/
├── app.css            # Global styles & theme
└── app.html
```

## Design System

### Colors

- **Primary**: Cyan (#00d4aa)
- **Secondary**: Purple (#a855f7)
- **Background**: Dark slate gradient
- **Accents**: Emerald (success), Amber (warning), Red (error)

### Typography

- **Sans**: Outfit
- **Mono**: JetBrains Mono

### Components

- Cards with glow effects on hover
- Animated stat cards with trend indicators
- Status badges with semantic colors
- Data tables with pagination
- Toast notifications
- Modal dialogs

## API Integration

The frontend connects to the backend API at `/v2` endpoints:

- `/trust-frameworks` - Trust framework CRUD
- `/registries` - Registry management
- `/issuers` - Issuer registration
- `/verifiers` - Verifier registration
- `/schemas` - Credential schema definitions
- `/query` - Trust resolution queries
- `/audit-log` - Audit trail

Authentication is done via `X-API-Key` header.

## License

MIT
