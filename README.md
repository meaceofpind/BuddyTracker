# BuddyTracker

A pet treatment and health tracker built with Next.js, Prisma, and shadcn/ui.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript 5.9
- **Database:** SQLite (dev) via Prisma 7 + better-sqlite3
- **UI:** Tailwind CSS 4 + shadcn/ui
- **Forms:** React Hook Form + Zod
- **Data Fetching:** TanStack Query v5

## Getting Started

### Prerequisites

- Node.js 22+ (LTS recommended)
- npm 10+

### Installation

```bash
git clone https://github.com/<your-username>/buddytracker.git
cd buddytracker/buddyTracker
npm install
```

### Environment Setup

Copy the example env file and adjust as needed:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `file:./dev.db` | SQLite database path |
| `MAX_UPLOAD_SIZE` | `5242880` | Max upload size in bytes (default 5MB) |

### Database Setup

```bash
npx prisma db push
npx prisma generate
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Run API Tests

With the dev server running:

```bash
npm run test:api
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:generate` | Generate Prisma Client |
| `npm run test:api` | Run API integration tests |

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes (pets, trackers, entries, upload)
│   ├── pets/[petId]/     # Pet tracker pages
│   ├── trackers/[id]/    # Tracker entries pages
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home (pet list)
│   ├── error.tsx         # Error boundary
│   └── not-found.tsx     # 404 page
├── components/
│   ├── ui/               # shadcn/ui primitives
│   ├── pet-card.tsx
│   ├── pet-form-modal.tsx
│   ├── tracker-form.tsx
│   ├── entry-form.tsx
│   ├── dynamic-field.tsx
│   └── image-preview-modal.tsx
├── generated/prisma/     # Auto-generated Prisma client
├── lib/
│   ├── prisma.ts         # Database client singleton
│   ├── validations.ts    # Zod schemas
│   └── utils.ts          # Utility functions
└── types/
    └── index.ts          # Shared TypeScript types
```

## Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables for Production

Set the following in your hosting platform:

- `DATABASE_URL` — connection string for your database
- `MAX_UPLOAD_SIZE` — max upload size in bytes
- `NODE_ENV` — set to `production`

### Notes

- Uploaded images are stored in `public/uploads/`. For production, consider using cloud storage (S3, Cloudinary).
- SQLite is suitable for single-server deployments. For multi-instance deployments, switch to PostgreSQL by updating the Prisma schema and adapter.

## License

MIT
