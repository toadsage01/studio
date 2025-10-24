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

### How it works

The module `src/lib/data.ts` conditionally calls Firestore-backed functions from `src/lib/db.ts` if Firebase Admin credentials are set; otherwise it returns the static in-memory arrays. The Firestore client is initialized in `src/lib/firebase-admin.ts`.

