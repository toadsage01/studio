
// This file contains in-memory data for the application.
// In a real application, this would be replaced with a database.

import type { User, SKU, Batch, Outlet, RoutePlan, RouteAssignment, Order, LoadSheet } from './types';

export const users: User[] = [
  { id: 'user-1', name: 'Admin User', role: 'Admin' },
  { id: 'user-2', name: 'Sarah Reed', role: 'Sales Rep' },
  { id: 'user-3', name: 'Alex Johnson', role: 'Sales Rep' },
  { id: 'user-4', name: 'Manager Mike', role: 'Manager' },
];

export const skus: SKU[] = [
  { id: 'sku-1', name: 'AquaFresh Water Bottle 1L', description: 'Pure mineral water', category: 'Beverages', stock: 120 },
  { id: 'sku-2', name: 'Crispy Potato Chips - Salted', description: 'Classic salted potato chips', category: 'Snacks', stock: 250 },
  { id: 'sku-3', name: 'Sparkling Orange Soda 330ml', description: 'Fizzy orange flavored drink', category: 'Beverages', stock: 80 },
  { id: 'sku-4', name: 'Whole Wheat Bread Loaf', description: 'Healthy whole wheat bread', category: 'Bakery', stock: 45 },
  { id: 'sku-5', name: 'Organic Green Tea Bags (25ct)', description: 'Antioxidant-rich green tea', category: 'Beverages', stock: 15 },
];

export const batches: Batch[] = [
  { id: 'batch-1', skuId: 'sku-1', batchNumber: 'B012-WTR', quantity: 120, price: 0.50, expiryDate: '2025-12-31' },
  { id: 'batch-2', skuId: 'sku-2', batchNumber: 'B013-CHP', quantity: 250, price: 1.20, expiryDate: '2024-11-30' },
  { id: 'batch-3', skuId: 'sku-3', batchNumber: 'B014-SDA', quantity: 80, price: 0.75, expiryDate: '2025-06-30' },
  { id: 'batch-4', skuId: 'sku-4', batchNumber: 'B015-BRD', quantity: 45, price: 2.50, expiryDate: '2024-09-15' },
  { id: 'batch-5', skuId: 'sku-5', batchNumber: 'B016-TEA', quantity: 15, price: 3.00, expiryDate: '2026-01-31' },
];

export const outlets: Outlet[] = [
  { id: 'outlet-1', name: 'Downtown Convenience', address: '123 Main St, Cityville', contact: 'John Doe', taxInfo: 'GST12345', paymentModes: ['Cash', 'Card'], creditLimit: 500 },
  { id: 'outlet-2', name: 'Uptown Grocers', address: '456 Oak Ave, Cityville', contact: 'Jane Smith', taxInfo: 'GST67890', paymentModes: ['Card', 'Online'], creditLimit: 1500 },
  { id: 'outlet-3', name: 'Suburb Supermart', address: '789 Pine Ln, Suburbia', contact: 'Emily White', taxInfo: 'GST13579', paymentModes: ['Cash', 'Card', 'Online'], creditLimit: 1000 },
  { id: 'outlet-4', name: 'Highway Gas & Go', address: '101 Highway Rd, Outskirts', contact: 'Mike Brown', taxInfo: 'GST24680', paymentModes: ['Cash', 'Card'], creditLimit: 200 },
  { id: 'outlet-5', name: 'Campus Corner Store', address: '202 University Ave, Cityville', contact: 'Chris Green', taxInfo: 'GST97531', paymentModes: ['Card'], creditLimit: 800 },
];

export const routePlans: RoutePlan[] = [
  { id: 'route-1', name: 'Monday Route - Downtown', outletIds: ['outlet-1', 'outlet-2'] },
  { id: 'route-2', name: 'Tuesday Route - Suburbs', outletIds: ['outlet-3'] },
  { id: 'route-3', name: 'Wednesday Route - Outskirts', outletIds: ['outlet-4', 'outlet-5'] },
];

export const routeAssignments: RouteAssignment[] = [
  { id: 'assign-1', routePlanId: 'route-1', userId: 'user-2', dayOfWeek: 1 }, // Monday
  { id: 'assign-2', routePlanId: 'route-2', userId: 'user-3', dayOfWeek: 2 }, // Tuesday
  { id: 'assign-3', routePlanId: 'route-3', userId: 'user-2', dayOfWeek: 3 }, // Wednesday
];

export const orders: Order[] = [
  { 
    id: 'order-1', 
    outletId: 'outlet-1', 
    userId: 'user-2', 
    orderDate: '2024-07-28T10:30:00Z', 
    items: [{ skuId: 'sku-1', quantity: 24, price: 0.50 }, { skuId: 'sku-2', quantity: 12, price: 1.20 }], 
    status: 'Fulfilled', 
    invoiceId: 'INV-1',
    fulfilledItems: [
        { skuId: 'sku-1', quantity: 24, price: 0.50, batchId: 'batch-1' },
        { skuId: 'sku-2', quantity: 12, price: 1.20, batchId: 'batch-2' }
    ]
  },
  { 
    id: 'order-2', 
    outletId: 'outlet-2', 
    userId: 'user-2', 
    orderDate: '2024-07-28T14:00:00Z', 
    items: [{ skuId: 'sku-3', quantity: 48, price: 0.75 }], 
    status: 'Fulfilled', 
    invoiceId: 'INV-2',
    fulfilledItems: [
      { skuId: 'sku-3', quantity: 48, price: 0.75, batchId: 'batch-3' }
    ]
  },
  { id: 'order-3', outletId: 'outlet-3', userId: 'user-3', orderDate: '2024-07-29T09:00:00Z', items: [{ skuId: 'sku-4', quantity: 10, price: 2.50 }, { skuId: 'sku-5', quantity: 5, price: 3.00 }], status: 'Pending' },
  { id: 'order-4', outletId: 'outlet-1', userId: 'user-2', orderDate: '2024-07-30T11:00:00Z', items: [{ skuId: 'sku-2', quantity: 24, price: 1.20 }], status: 'Pending' },
  { id: 'order-5', outletId: 'outlet-5', userId: 'user-2', orderDate: '2024-07-30T15:30:00Z', items: [{ skuId: 'sku-1', quantity: 12, price: 0.50 }], status: 'Invoiced', invoiceId: 'INV-5' },
];

export const loadSheets: LoadSheet[] = [
    {
        id: 'LS-1627502400000',
        creationDate: '2024-07-28T12:00:00Z',
        assignedTo: 'Sarah Reed',
        status: 'Completed',
        relatedOrders: ['order-1', 'order-2'],
        items: [
            { orderId: 'order-1', skuId: 'sku-1', requestedQuantity: 24, fulfilledQuantity: 24, batchId: 'batch-1', deliveryStatus: 'Delivered', returnedQuantity: 0 },
            { orderId: 'order-1', skuId: 'sku-2', requestedQuantity: 12, fulfilledQuantity: 12, batchId: 'batch-2', deliveryStatus: 'Delivered', returnedQuantity: 0 },
            { orderId: 'order-2', skuId: 'sku-3', requestedQuantity: 48, fulfilledQuantity: 48, batchId: 'batch-3', deliveryStatus: 'Delivered', returnedQuantity: 0 }
        ]
    }
];
