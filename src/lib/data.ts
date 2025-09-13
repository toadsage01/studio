import type { User, SKU, Batch, Outlet, RoutePlan, RouteAssignment, Order } from './types';
import { users, skus, batches, outlets, routePlans, routeAssignments, orders } from './data-in-mem';

// Simulate API calls
export const getUsers = async (): Promise<User[]> => Promise.resolve(users);
export const getSKUs = async (): Promise<SKU[]> => Promise.resolve(skus);
export const getBatches = async (skuId?: string): Promise<Batch[]> => {
  if (skuId) {
    return Promise.resolve(batches.filter(b => b.skuId === skuId));
  }
  return Promise.resolve(batches);
};
export const getOutlets = async (): Promise<Outlet[]> => Promise.resolve(outlets);
export const getRoutePlans = async (): Promise<RoutePlan[]> => Promise.resolve(routePlans);
export const getRouteAssignments = async (): Promise<RouteAssignment[]> => Promise.resolve(routeAssignments);
export const getOrders = async (): Promise<Order[]> => Promise.resolve(orders);