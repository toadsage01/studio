import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getRequiredEnv(name: string): string | undefined {
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
}

let app: App | undefined;

export function getAdminApp(): App | undefined {
  if (app) return app;

  const projectId = getRequiredEnv('FIREBASE_PROJECT_ID');
  const clientEmail = getRequiredEnv('FIREBASE_CLIENT_EMAIL');
  let privateKey = getRequiredEnv('FIREBASE_PRIVATE_KEY');

  if (!projectId || !clientEmail || !privateKey) {
    // Missing admin creds; skip initializing to allow in-memory fallback.
    return undefined;
  }

  // Normalize escaped newlines if provided via .env
  privateKey = privateKey.replace(/\\n/g, '\n');

  const apps = getApps();
  if (!apps.length) {
    app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      projectId,
    });
  } else {
    app = apps[0];
  }
  return app;
}

export function getDb(): any {
  const a = getAdminApp();
  if (!a) return undefined;
  return getFirestore(a);
}
