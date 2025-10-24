import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { users, skus, batches, outlets, routePlans, routeAssignments, orders, loadSheets } from '../src/lib/data-in-mem';

// Load .env.local if present, else fallback to .env
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else {
  dotenv.config();
}

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function getAdmin() {
  if (!getApps().length) {
    const projectId = required('FIREBASE_PROJECT_ID');
    const clientEmail = required('FIREBASE_CLIENT_EMAIL');
    let privateKey = required('FIREBASE_PRIVATE_KEY');
    privateKey = privateKey.replace(/\\n/g, '\n');
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId });
  }
  return getFirestore();
}

async function upsertCollection(name: string, items: any[]) {
  const db = getAdmin();
  for (const item of items) {
    const { id, ...rest } = item;
    await db.collection(name).doc(id).set(rest, { merge: true });
  }
  console.log(`Seeded ${name}: ${items.length}`);
}

async function main() {
  await upsertCollection('users', users);
  await upsertCollection('skus', skus);
  await upsertCollection('batches', batches);
  await upsertCollection('outlets', outlets);
  await upsertCollection('routePlans', routePlans);
  await upsertCollection('routeAssignments', routeAssignments);
  await upsertCollection('orders', orders);
  await upsertCollection('loadSheets', loadSheets);
  console.log('Seeding complete.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
