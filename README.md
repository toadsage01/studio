# Studio App

## Prereqs

- Node.js 18.x or 20.x (LTS). Node 21+ is not supported due to transitive deps used by firebase-admin/tsx.
- PNPM/NPM/Yarn (examples below use NPM)

## Quick start

1) From the project folder:

```bash
cd /c/Users/91620/Desktop/CODE/Projects/studio
```

2) Create `.env.local` with Firebase Admin and NextAuth values:

```
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

NEXTAUTH_SECRET=replace-with-random-32-bytes
DEMO_PASSWORD=demo
```

3) Install dependencies:

```bash
npm install
```

4) Seed Firestore (optional; requires .env.local):

```bash
npm run seed
```

5) Run the dev server:

```bash
npm run dev
```

Open http://localhost:9002

## Roles

- Admin: Full access, including /admin/* and /users
- Manager: Can generate invoices and create load sheets
- Sales Rep: Can update delivery/returns on load sheets

Login via /auth/signin using any seeded or in-memory username; password is DEMO_PASSWORD.

# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Database integration (Firestore)

This project now supports Firestore as a backend data source, with a seamless fallback to in-memory data when Firestore credentials are not configured.

- When environment variables for Firebase Admin are present, pages and APIs read from Firestore.
- When not present, the app uses the existing in-memory fixtures in `src/lib/data-in-mem.ts`.

### Configure Firebase Admin

1) Copy `.env.local.example` to `.env.local` and fill in your Firebase Admin credentials:

	- FIREBASE_PROJECT_ID
	- FIREBASE_CLIENT_EMAIL
	- FIREBASE_PRIVATE_KEY (keep as a single line with `\n` escapes; code normalizes it)

2) Install dependencies and run the app:

	- npm install
	- npm run dev

### Seed Firestore with sample data

You can seed Firestore from the in-memory data to get started quickly:

1) Ensure `.env.local` has valid Firebase Admin credentials
2) Run the seed script:

	- npm run seed

This will populate the following collections: `users`, `skus`, `batches`, `outlets`, `routePlans`, `routeAssignments`, `orders`, and `loadSheets`.

## Authentication and RBAC

This project uses NextAuth (credentials provider) with JWT sessions. By default, it accepts any user from your dataset and a shared password.

1) Configure environment variables in `.env.local`:

	- NEXTAUTH_SECRET: a strong random string
	- DEMO_PASSWORD: default is `demo` if omitted

2) Sign in at `/auth/signin`

	- Username can be a user id (e.g., `user-1`) or name (e.g., `Admin User`)
	- Password is `DEMO_PASSWORD`

3) Session and roles

	- User role is included in the JWT and session
	- Middleware enforces authentication on all routes except `/auth/signin` and Next internals

4) Where to customize

	- Auth config: `src/lib/auth-config.ts`
	- Middleware guard: `middleware.ts`
	- Session helper: `src/lib/auth.ts`

### How it works

The module `src/lib/data.ts` conditionally calls Firestore-backed functions from `src/lib/db.ts` if Firebase Admin credentials are set; otherwise it returns the static in-memory arrays. The Firestore client is initialized in `src/lib/firebase-admin.ts`.

