'use server';

import { revalidatePath } from 'next/cache';
import {
  orders,
  batches,
  skus,
  loadSheets,
  users,
} from '@/lib/data-in-mem';
import type { FulfilledItem, LoadSheet, LoadSheetItem, Order } from '@/lib/types';
import { redirect } from 'next/navigation';

export async function createLoadSheet(orderIds: string[], userId: string) {
  if (!orderIds || orderIds.length === 0) {
    return { success: false, message: 'No invoiced orders selected.' };
  }
  
  const user = users.find(u => u.id === userId);
  if (!user) {
    return { success: false, message: 'Invalid user for assignment.' };
  }

  try {
    const ordersToProcess = orders.filter(
      (o) => orderIds.includes(o.id) && o.status === 'Invoiced'
    );

    if (ordersToProcess.length === 0) {
      return { success: false, message: 'No valid invoiced orders found.' };
    }
    
    const allItemsToFulfill = ordersToProcess.flatMap(order => 
        order.items.map(item => ({ ...item, orderId: order.id }))
    );

    const loadSheetItems: LoadSheetItem[] = [];
    const updatedFulfilledItemsByOrder: { [orderId: string]: FulfilledItem[] } = {};

    // Group items by SKU to process fulfillment efficiently
    const itemsBySku = allItemsToFulfill.reduce((acc, item) => {
        if (!acc[item.skuId]) {
            acc[item.skuId] = [];
        }
        acc[item.skuId].push(item);
        return acc;
    }, {} as Record<string, typeof allItemsToFulfill>);


    for (const skuId in itemsBySku) {
        let requestedQty = itemsBySku[skuId].reduce((sum, item) => sum + item.quantity, 0);
        
        // Get available batches for this SKU, sorted by expiry date (FIFO)
        const availableBatches = batches
            .filter(b => b.skuId === skuId && b.quantity > 0)
            .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

        // Fulfill from batches
        for (const batch of availableBatches) {
            if (requestedQty === 0) break;

            const qtyFromThisBatch = Math.min(requestedQty, batch.quantity);
            
            // Distribute the fulfilled quantity back to the original order items
            for (const orderItem of itemsBySku[skuId]) {
                 if (!updatedFulfilledItemsByOrder[orderItem.orderId]) {
                    updatedFulfilledItemsByOrder[orderItem.orderId] = [];
                }

                // This is a simplified distribution. A real-world scenario might be more complex.
                // For now, we associate the fulfilled amount with the first matching order item.
                // This part would need refinement for complex partial fulfillments across many orders.
                const existingFulfilled = updatedFulfilledItemsByOrder[orderItem.orderId].find(fi => fi.skuId === skuId && fi.batchId === batch.id);
                if (existingFulfilled) {
                    existingFulfilled.quantity += qtyFromThisBatch;
                } else {
                    updatedFulfilledItemsByOrder[orderItem.orderId].push({
                        skuId: skuId,
                        quantity: qtyFromThisBatch,
                        batchId: batch.id,
                        price: batch.price,
                    });
                }
                
                 loadSheetItems.push({
                    orderId: orderItem.orderId,
                    skuId: skuId,
                    requestedQuantity: orderItem.quantity,
                    fulfilledQuantity: qtyFromThisBatch, // Can be partial
                    batchId: batch.id,
                });

                // Update stock
                const sku = skus.find(s => s.id === skuId);
                if (sku) {
                    sku.stock -= qtyFromThisBatch;
                }
                batch.quantity -= qtyFromThisBatch;
                requestedQty -= qtyFromThisBatch;

                if (requestedQty <= 0) break; // Move to next SKU if this one is done
            }
        }
    }

    // Create the load sheet
    const newLoadSheet: LoadSheet = {
      id: `LS-${Date.now()}`,
      creationDate: new Date().toISOString(),
      assignedTo: user.name,
      status: 'Loaded',
      items: loadSheetItems,
      relatedOrders: orderIds,
    };
    loadSheets.push(newLoadSheet);
    
    // Update order statuses and fulfilledItems
    ordersToProcess.forEach(order => {
        order.status = 'Fulfilled';
        order.fulfilledItems = updatedFulfilledItemsByOrder[order.id] || [];
        // Here you could also handle fully unfulfilled orders by marking them as 'Rejected'
    });

    revalidatePath('/load-sheets');
    revalidatePath('/orders');
    revalidatePath('/inventory');
    revalidatePath('/sku');

  } catch (error) {
    return { success: false, message: 'An error occurred during load sheet creation.' };
  }
  
  redirect('/load-sheets');
}