import type { User, SKU, Batch, Outlet, RoutePlan, RouteAssignment, Order, LoadSheet } from './types';
import { getDb } from './firebase-admin';

const COLLECTIONS = {
  users: 'users',
  skus: 'skus',
  batches: 'batches',
  outlets: 'outlets',
  routePlans: 'routePlans',
  routeAssignments: 'routeAssignments',
  orders: 'orders',
  loadSheets: 'loadSheets',
} as const;

async function getAll<T>(collection: string): Promise<T[]> {
  const db = getDb();
  if (!db) throw new Error('Firestore not initialized');
  const snap = await db.collection(collection).get();
  return snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as T));
}

export const dbGetUsers = async (): Promise<User[]> => getAll<User>(COLLECTIONS.users);
export const dbGetSKUs = async (): Promise<SKU[]> => getAll<SKU>(COLLECTIONS.skus);
export const dbGetBatches = async (skuId?: string): Promise<Batch[]> => {
  const db = getDb();
  if (!db) throw new Error('Firestore not initialized');
  let query = db.collection(COLLECTIONS.batches);
  if (skuId) query = query.where('skuId', '==', skuId);
  const snap = await query.get();
  return snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Batch));
};
export const dbGetOutlets = async (): Promise<Outlet[]> => getAll<Outlet>(COLLECTIONS.outlets);
export const dbGetRoutePlans = async (): Promise<RoutePlan[]> => getAll<RoutePlan>(COLLECTIONS.routePlans);
export const dbGetRouteAssignments = async (): Promise<RouteAssignment[]> => getAll<RouteAssignment>(COLLECTIONS.routeAssignments);
export const dbGetOrders = async (): Promise<Order[]> => getAll<Order>(COLLECTIONS.orders);
export const dbGetLoadSheets = async (): Promise<LoadSheet[]> => getAll<LoadSheet>(COLLECTIONS.loadSheets);
