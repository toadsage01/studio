import { getDb } from './firebase-admin';
import type { User, SKU, Batch, Outlet, RoutePlan, RouteAssignment, Order, LoadSheet } from './types';

async function getAll<T>(collection: string): Promise<T[]> {
  const db = getDb();
  if (!db) throw new Error('Firestore not initialized');
  const snap = await db.collection(collection).get();
  return snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as T));
}

export async function dbGetUsers(): Promise<User[]> {
  return getAll<User>('users');
}

export async function dbGetSKUs(): Promise<SKU[]> {
  return getAll<SKU>('skus');
}

export async function dbGetBatches(skuId?: string): Promise<Batch[]> {
  const all = await getAll<Batch>('batches');
  if (skuId) return all.filter((b) => b.skuId === skuId);
  return all;
}

export async function dbGetOutlets(): Promise<Outlet[]> {
  return getAll<Outlet>('outlets');
}

export async function dbGetRoutePlans(): Promise<RoutePlan[]> {
  return getAll<RoutePlan>('routePlans');
}

export async function dbGetRouteAssignments(): Promise<RouteAssignment[]> {
  return getAll<RouteAssignment>('routeAssignments');
}

export async function dbGetOrders(): Promise<Order[]> {
  return getAll<Order>('orders');
}

export async function dbGetLoadSheets(): Promise<LoadSheet[]> {
  return getAll<LoadSheet>('loadSheets');
}

// Mutations
export async function dbUpsert(collection: string, id: string, data: any): Promise<void> {
  const db = getDb();
  if (!db) throw new Error('Firestore not initialized');
  await db.collection(collection).doc(id).set(data, { merge: true });
}

export async function dbSaveOrder(order: Order): Promise<void> {
  const db = getDb();
  if (!db) throw new Error('Firestore not initialized');
  const { id, ...rest } = order as any;
  await db.collection('orders').doc(id).set(rest, { merge: true });
}

export async function dbUpdateOrderStatus(orderId: string, patch: Partial<Order>): Promise<void> {
  const db = getDb();
  if (!db) throw new Error('Firestore not initialized');
  await db.collection('orders').doc(orderId).set(patch, { merge: true });
}

export async function dbSaveLoadSheet(loadSheet: LoadSheet): Promise<void> {
  const db = getDb();
  if (!db) throw new Error('Firestore not initialized');
  const { id, ...rest } = loadSheet as any;
  await db.collection('loadSheets').doc(id).set(rest, { merge: true });
}
