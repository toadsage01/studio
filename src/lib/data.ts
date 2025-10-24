import type { User, SKU, Batch, Outlet, RoutePlan, RouteAssignment, Order, LoadSheet } from './types';
import { users, skus, batches, outlets, routePlans, routeAssignments, orders, loadSheets } from './data-in-mem';

const hasFirestoreCreds = Boolean(
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY
);

// Simulate API calls
export const getUsers = async (): Promise<User[]> => {
  if (hasFirestoreCreds) {
    const { dbGetUsers } = await import('./db');
    return dbGetUsers();
  }
  return Promise.resolve(users);
};

export const getSKUs = async (): Promise<SKU[]> => {
  if (hasFirestoreCreds) {
    const { dbGetSKUs } = await import('./db');
    return dbGetSKUs();
  }
  return Promise.resolve(skus);
};

export const getBatches = async (skuId?: string): Promise<Batch[]> => {
  if (hasFirestoreCreds) {
    const { dbGetBatches } = await import('./db');
    return dbGetBatches(skuId);
  }
  if (skuId) {
    return Promise.resolve(batches.filter(b => b.skuId === skuId));
  }
  return Promise.resolve(batches);
};

export const getOutlets = async (): Promise<Outlet[]> => {
  if (hasFirestoreCreds) {
    const { dbGetOutlets } = await import('./db');
    return dbGetOutlets();
  }
  return Promise.resolve(outlets);
};

export const getRoutePlans = async (): Promise<RoutePlan[]> => {
  if (hasFirestoreCreds) {
    const { dbGetRoutePlans } = await import('./db');
    return dbGetRoutePlans();
  }
  return Promise.resolve(routePlans);
};

export const getRouteAssignments = async (): Promise<RouteAssignment[]> => {
  if (hasFirestoreCreds) {
    const { dbGetRouteAssignments } = await import('./db');
    return dbGetRouteAssignments();
  }
  return Promise.resolve(routeAssignments);
};

export const getOrders = async (): Promise<Order[]> => {
  if (hasFirestoreCreds) {
    const { dbGetOrders } = await import('./db');
    return dbGetOrders();
  }
  return Promise.resolve(orders);
};

export const getLoadSheets = async (): Promise<LoadSheet[]> => {
  if (hasFirestoreCreds) {
    const { dbGetLoadSheets } = await import('./db');
    return dbGetLoadSheets();
  }
  return Promise.resolve(loadSheets);
};
