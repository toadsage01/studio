export type User = {
  id: string;
  name: string;
  role: 'Admin' | 'Sales Rep';
};

export type SKU = {
  id: string;
  name: string;
  description: string;
  category: string;
  stock: number;
};

export type Batch = {
  id: string;
  skuId: string;
  batchNumber: string;
  quantity: number;
  price: number;
  expiryDate: string;
};

export type Outlet = {
  id: string;
  name:string;
  address: string;
  contact: string;
  taxInfo: string;
  paymentModes: string[];
  creditLimit: number;
};

export type RoutePlan = {
  id: string;
  name: string;
  outletIds: string[];
};

export type RouteAssignment = {
  id: string;
  routePlanId: string;
  userId: string;
  dayOfWeek: number; // 0 for Sunday, 1 for Monday, etc.
};

export type OrderItem = {
  skuId: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: string;
  outletId: string;
  userId: string;
  orderDate: string;
  items: OrderItem[];
  status: 'Pending' | 'Invoiced' | 'Fulfilled' | 'Cancelled';
  invoiceId?: string;
  fulfilledItems?: {
    skuId: string;
    quantity: number;
    batchId: string;
    price: number;
  }[];
};
