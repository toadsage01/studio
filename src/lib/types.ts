
export type User = {
  id: string;
  name: string;
  role: 'Admin' | 'Manager' | 'Sales Rep';
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

export type FulfilledItem = {
  skuId: string;
  quantity: number;
  batchId: string;
  price: number;
}

export type Order = {
  id: string;
  outletId: string;
  userId: string;
  orderDate: string;
  items: OrderItem[];
  status: 'Pending' | 'Invoiced' | 'Fulfilled' | 'Partially Fulfilled' | 'Cancelled' | 'Partially Returned' | 'Returned';
  invoiceId?: string;
  fulfilledItems?: FulfilledItem[];
};

export type LoadSheetItem = {
  orderId: string;
  skuId: string;
  requestedQuantity: number;
  fulfilledQuantity: number;
  batchId?: string; // Assigned during fulfillment
  deliveryStatus: 'Pending' | 'Delivered' | 'Returned' | 'Partially Returned';
  returnedQuantity: number;
}

export type LoadSheet = {
  id: string;
  creationDate: string;
  assignedTo: string; // userName
  status: 'Loaded' | 'Out for Delivery' | 'Completed' | 'Cancelled';
  items: LoadSheetItem[];
  relatedOrders: string[]; // orderIds
}
