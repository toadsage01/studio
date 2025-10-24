import type { User, SKU, Batch, Outlet, RoutePlan, RouteAssignment, Order, LoadSheet } from './types';
import { users, skus, batches, outlets, routePlans, routeAssignments, orders, loadSheets } from './data-in-mem';

let firestoreReady: boolean | null = null;
async function isFirestoreReady(): Promise<boolean> {
  if (firestoreReady !== null) return firestoreReady;
  try {
    const { getDb } = await import('./firebase-admin');
    const db = getDb();
    if (!db) {
      firestoreReady = false;
      return false;
    }
    // Actively probe connectivity once; if it fails, fallback to in-memory for the session
    try {
      // Perform a real, harmless read to trigger auth/crypto; if this fails we fallback
      await db.collection('users').limit(1).get();
      firestoreReady = true;
      return true;
    } catch (e) {
      console.error('Firestore connectivity failed; using in-memory data. Reason:', (e as Error).message);
      firestoreReady = false;
      return false;
    }
  } catch {
    firestoreReady = false;
    return false;
  }
}

// Expose a helper for server components to detect which data source is active
export async function getDataSource(): Promise<'firestore' | 'memory'> {
  const ready = await isFirestoreReady();
  return ready ? 'firestore' : 'memory';
}

// Simulate API calls
export const getUsers = async (): Promise<User[]> => {
  if (await isFirestoreReady()) {
    try {
      const { dbGetUsers } = await import('./db');
      return await dbGetUsers();
    } catch (e) {
      console.error('DB error (users), falling back to in-memory:', (e as Error).message);
    }
  }
  return users;
};

export const getSKUs = async (): Promise<SKU[]> => {
  if (await isFirestoreReady()) {
    try {
      const { dbGetSKUs } = await import('./db');
      return await dbGetSKUs();
    } catch (e) {
      console.error('DB error (skus), falling back to in-memory:', (e as Error).message);
    }
  }
  return skus;
};

export const getBatches = async (skuId?: string): Promise<Batch[]> => {
  if (await isFirestoreReady()) {
    try {
      const { dbGetBatches } = await import('./db');
      return await dbGetBatches(skuId);
    } catch (e) {
      console.error('DB error (batches), falling back to in-memory:', (e as Error).message);
    }
  }
  if (skuId) {
    return batches.filter(b => b.skuId === skuId);
  }
  return batches;
};

export const getOutlets = async (): Promise<Outlet[]> => {
  if (await isFirestoreReady()) {
    try {
      const { dbGetOutlets } = await import('./db');
      return await dbGetOutlets();
    } catch (e) {
      console.error('DB error (outlets), falling back to in-memory:', (e as Error).message);
    }
  }
  return outlets;
};

export const getRoutePlans = async (): Promise<RoutePlan[]> => {
  if (await isFirestoreReady()) {
    try {
      const { dbGetRoutePlans } = await import('./db');
      return await dbGetRoutePlans();
    } catch (e) {
      console.error('DB error (route plans), falling back to in-memory:', (e as Error).message);
    }
  }
  return routePlans;
};

export const getRouteAssignments = async (): Promise<RouteAssignment[]> => {
  if (await isFirestoreReady()) {
    try {
      const { dbGetRouteAssignments } = await import('./db');
      return await dbGetRouteAssignments();
    } catch (e) {
      console.error('DB error (route assignments), falling back to in-memory:', (e as Error).message);
    }
  }
  return routeAssignments;
};

export const getOrders = async (): Promise<Order[]> => {
  if (await isFirestoreReady()) {
    try {
      const { dbGetOrders } = await import('./db');
      return await dbGetOrders();
    } catch (e) {
      console.error('DB error (orders), falling back to in-memory:', (e as Error).message);
    }
  }
  return orders;
};

export const getLoadSheets = async (): Promise<LoadSheet[]> => {
  if (await isFirestoreReady()) {
    try {
      const { dbGetLoadSheets } = await import('./db');
      return await dbGetLoadSheets();
    } catch (e) {
      console.error('DB error (load sheets), falling back to in-memory:', (e as Error).message);
    }
  }
  return loadSheets;
};
