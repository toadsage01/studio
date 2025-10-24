import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getRequiredEnv(name: string): string | undefined {
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
}

let app: App | undefined;
let initAttempted = false;

export function getAdminApp(): App | undefined {
  if (app) return app;
  if (initAttempted) return undefined;
  initAttempted = true;

  // Try multiple credential sources in order
  const projectId = getRequiredEnv('FIREBASE_PROJECT_ID');
  const clientEmail = getRequiredEnv('FIREBASE_CLIENT_EMAIL');
  let privateKey = getRequiredEnv('FIREBASE_PRIVATE_KEY');
  const saJson = getRequiredEnv('FIREBASE_SERVICE_ACCOUNT');
  const saB64 = getRequiredEnv('FIREBASE_SERVICE_ACCOUNT_BASE64');

  try {
    let credentials: { projectId: string; clientEmail: string; privateKey: string } | undefined;
    if (saJson) {
      const parsed = JSON.parse(saJson);
      credentials = {
        projectId: parsed.project_id || projectId!,
        clientEmail: parsed.client_email || clientEmail!,
        privateKey: (parsed.private_key as string) || '',
      };
    } else if (saB64) {
      const decoded = Buffer.from(saB64, 'base64').toString('utf8');
      const parsed = JSON.parse(decoded);
      credentials = {
        projectId: parsed.project_id || projectId!,
        clientEmail: parsed.client_email || clientEmail!,
        privateKey: (parsed.private_key as string) || '',
      };
    } else if (projectId && clientEmail && privateKey) {
      credentials = { projectId, clientEmail, privateKey };
    }

    if (!credentials || !credentials.projectId || !credentials.clientEmail || !credentials.privateKey) {
      return undefined; // allow fallback
    }

    // Normalize escaped newlines and strip surrounding quotes if any
    let pk = credentials.privateKey.trim();
    if (pk.startsWith('"') && pk.endsWith('"')) {
      pk = pk.slice(1, -1);
    }
    pk = pk.replace(/\\n/g, '\n');

    const apps = getApps();
    if (!apps.length) {
      app = initializeApp({
        credential: cert({
          projectId: credentials.projectId,
          clientEmail: credentials.clientEmail,
          privateKey: pk,
        }),
        projectId: credentials.projectId,
      });
    } else {
      app = apps[0];
    }
    return app;
  } catch (e) {
    console.error('Firebase Admin initialization failed; falling back to in-memory data.', (e as Error).message);
    return undefined;
  }
}

export function getDb(): any {
  const a = getAdminApp();
  if (!a) return undefined;
  return getFirestore(a);
}
