# DAM — Digital Asset Management

A self-hosted, open-source Digital Asset Management system for organizing, storing, and serving images. Built with TanStack Start and SQLite — zero infrastructure required.

## Features

- **Authentication** — First visitor registers as admin; subsequent visits require login
- **Media upload** — Drag-and-drop interface; supports JPEG, PNG, WebP, GIF (up to 20 MB)
- **Auto thumbnails** — Generates 400 px WebP thumbnails on upload via Sharp
- **Category management** — Create, rename (cascades to all media), and delete categories
- **Gallery** — Filterable media gallery with category tabs and a detail modal
- **Media metadata** — Stores dimensions, file size, MIME type, and upload date
- **Admin panel** — Dashboard with stats, upload page, media manager, and category manager
- **Download API** — Serves files with proper UTF-8 filename encoding

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | TanStack Start (React 19, file-based routing) |
| Routing / Data | TanStack Router + TanStack Query |
| Auth | better-auth v1 (email & password) |
| Database | better-sqlite3 (local SQLite, zero config) |
| Styling | Tailwind CSS v4 |
| Image processing | Sharp |
| Build | Vite 7 + TypeScript |

## Prerequisites

- Node.js 20+
- npm

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/dam.git
cd dam

# 2. Install dependencies
npm install

# 3. Copy and fill in environment variables
cp .env.example .env

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

The SQLite database and upload directories are created automatically on first run.

## Environment Variables

Create a `.env` file in the project root:

```env
BETTER_AUTH_SECRET=your-random-secret-here
BETTER_AUTH_URL=http://localhost:3000
VITE_APP_URL=http://localhost:3000
```

| Variable | Description |
|---|---|
| `BETTER_AUTH_SECRET` | A long random string used to sign auth sessions |
| `BETTER_AUTH_URL` | Base URL of the app (used by better-auth on the server) |
| `VITE_APP_URL` | Same base URL, exposed to the client |

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server on port 3000 |
| `npm run build` | Build for production |
| `npm start` | Run the production build |
| `npm test` | Run the Vitest test suite |

## Project Structure

```
src/
├── routes/
│   ├── login.tsx             # Auth page (register / login)
│   ├── admin/                # Protected admin panel
│   │   ├── index.tsx         # Dashboard
│   │   ├── upload.tsx        # Media upload
│   │   ├── media.tsx         # Media management (edit / delete)
│   │   └── categories.tsx    # Category management
│   └── media/
│       └── index.tsx         # Public gallery
├── lib/
│   ├── db.ts                 # SQLite connection & schema bootstrap
│   ├── auth.ts               # better-auth config
│   └── auth-client.ts        # Client-side auth helpers
└── utils/
    ├── media.server.ts       # Upload, thumbnail, DB operations
    └── categories.server.ts  # Category CRUD operations
```

Uploaded files are stored in `./uploads/` and thumbnails in `./uploads/thumbs/`.

## License

MIT
