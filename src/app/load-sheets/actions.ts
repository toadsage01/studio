
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
import { logActivity } from '@/lib/activity';
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
        order.items.map(item => ({ ...item, orderId: order.id, originalRequested: item.quantity }))
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
        let requestedQtyForSku = itemsBySku[skuId].reduce((sum, item) => sum + item.quantity, 0);
        
        const availableBatches = batches
            .filter(b => b.skuId === skuId && b.quantity > 0)
            .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

        for (const batch of availableBatches) {
            if (requestedQtyForSku <= 0) break;

            let qtyFromThisBatch = Math.min(requestedQtyForSku, batch.quantity);

            // Distribute fulfilled quantity back to the original order items for this SKU
            for (const orderItem of itemsBySku[skuId]) {
                if (orderItem.quantity <= 0) continue; // Skip already fulfilled items in this loop
                
                const fulfillAmount = Math.min(orderItem.quantity, qtyFromThisBatch);
                 if (fulfillAmount <= 0) continue;

                if (!updatedFulfilledItemsByOrder[orderItem.orderId]) {
                    updatedFulfilledItemsByOrder[orderItem.orderId] = [];
                }
                
                // Add to fulfilled items for the order
                const existingFulfilled = updatedFulfilledItemsByOrder[orderItem.orderId].find(fi => fi.skuId === skuId && fi.batchId === batch.id);
                if (existingFulfilled) {
                    existingFulfilled.quantity += fulfillAmount;
                } else {
                    updatedFulfilledItemsByOrder[orderItem.orderId].push({
                        skuId: skuId,
                        quantity: fulfillAmount,
                        batchId: batch.id,
                        price: batch.price, // Use batch price for fulfillment
                    });
                }

                // Find or create load sheet item
                 let loadSheetItem = loadSheetItems.find(lsi => lsi.orderId === orderItem.orderId && lsi.skuId === skuId);
                 if (loadSheetItem) {
                    loadSheetItem.fulfilledQuantity += fulfillAmount;
                    // For simplicity, we just take the last batchId. A real app might need an array of batches.
                    loadSheetItem.batchId = batch.id;
                 } else {
                    loadSheetItem = {
                        orderId: orderItem.orderId,
                        skuId: skuId,
                        requestedQuantity: orderItem.originalRequested,
                        fulfilledQuantity: fulfillAmount,
                        batchId: batch.id,
                        deliveryStatus: 'Pending',
                        returnedQuantity: 0,
                    };
                    loadSheetItems.push(loadSheetItem);
                 }
                
                // Update master stock records
                const sku = skus.find(s => s.id === skuId);
                if (sku) {
                    sku.stock -= fulfillAmount;
                }
                batch.quantity -= fulfillAmount;
                qtyFromThisBatch -= fulfillAmount;
                requestedQtyForSku -= fulfillAmount;

                // Mark this part of the order item as processed
                orderItem.quantity -= fulfillAmount;
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
    await logActivity({ event: 'loadSheet.created', entity: 'loadSheet', entityId: newLoadSheet.id, details: { orders: orderIds, assignedTo: user.name } });
    
    // Update order statuses and fulfilledItems
    ordersToProcess.forEach(order => {
        const fulfilledItemsForOrder = updatedFulfilledItemsByOrder[order.id] || [];
        const totalRequested = order.items.reduce((sum, i) => sum + i.quantity, 0);
        const totalFulfilled = fulfilledItemsForOrder.reduce((sum, i) => sum + i.quantity, 0);

        order.status = totalFulfilled >= totalRequested ? 'Fulfilled' : 'Partially Fulfilled';
        order.fulfilledItems = fulfilledItemsForOrder;
    });

    revalidatePath('/load-sheets');
    revalidatePath('/orders');
    revalidatePath('/inventory');
    revalidatePath('/sku');

  } catch (error) {
    console.error(error);
    return { success: false, message: 'An error occurred during load sheet creation.' };
  }
  
  redirect('/load-sheets');
}

export async function updateLoadSheetItemStatus(loadSheetId: string, orderId: string, skuId: string, newStatus: 'Delivered' | 'Returned', quantity: number) {
    try {
        const sheet = loadSheets.find(ls => ls.id === loadSheetId);
        if (!sheet) return { success: false, message: "Load sheet not found." };

        const item = sheet.items.find(i => i.orderId === orderId && i.skuId === skuId);
        if (!item) return { success: false, message: "Item not found on load sheet." };

        const order = orders.find(o => o.id === orderId);
        if (!order) return { success: false, message: "Order not found." };
        
        if (newStatus === 'Returned') {
            if (!item.batchId) return { success: false, message: "Cannot return item without batch information." };
            
            const batch = batches.find(b => b.id === item.batchId);
            const sku = skus.find(s => s.id === item.skuId);

            if (batch && sku) {
                const returnQty = Math.min(quantity, item.fulfilledQuantity - item.returnedQuantity);
                
                batch.quantity += returnQty;
                sku.stock += returnQty;
                item.returnedQuantity += returnQty;

                if (item.returnedQuantity > 0) {
                    item.deliveryStatus = item.returnedQuantity === item.fulfilledQuantity ? 'Returned' : 'Partially Returned';
                }
                
                // Update master order status
                const totalReturnedForOrder = sheet.items
                    .filter(i => i.orderId === orderId && i.deliveryStatus.includes('Return'))
                    .reduce((sum, i) => sum + i.returnedQuantity, 0);
                
                if (totalReturnedForOrder > 0) {
                   order.status = 'Partially Returned';
                }
            }
        } else {
             item.deliveryStatus = 'Delivered';
        }

        // Check if all items are handled to update the sheet status
        const allItemsDone = sheet.items.every(i => i.deliveryStatus === 'Delivered' || i.deliveryStatus === 'Returned' || i.deliveryStatus === 'Partially Returned');
        if (allItemsDone) {
            sheet.status = 'Completed';
            
            // Final check on order status
            sheet.relatedOrders.forEach(relOrderId => {
                const relatedOrder = orders.find(o => o.id === relOrderId);
                if (!relatedOrder) return;

                const allItemsForOrderOnSheet = sheet.items.filter(i => i.orderId === relOrderId);
                const isFullyReturned = allItemsForOrderOnSheet.every(i => i.deliveryStatus === 'Returned');
                
                if (isFullyReturned) {
                    relatedOrder.status = 'Returned';
                }
            });
        }

    revalidatePath(`/load-sheets/${loadSheetId}`);
        revalidatePath('/inventory');
        revalidatePath('/sku');
        revalidatePath('/orders');
    await logActivity({ event: 'loadSheet.itemStatusUpdated', entity: 'loadSheetItem', entityId: `${orderId}:${skuId}`, details: { loadSheetId, newStatus, quantity } });
        return { success: true, message: `Item status updated to ${newStatus}.` };

    } catch (error) {
        return { success: false, message: "An unexpected error occurred." };
    }
}
