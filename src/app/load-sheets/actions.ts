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
        let requestedQtyForSku = itemsBySku[skuId].reduce((sum, item) => sum + item.quantity, 0);
        
        const availableBatches = batches
            .filter(b => b.skuId === skuId && b.quantity > 0)
            .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

        for (const batch of availableBatches) {
            if (requestedQtyForSku <= 0) break;

            const qtyFromThisBatch = Math.min(requestedQtyForSku, batch.quantity);

            // This logic needs to distribute the fulfilled quantity back to the original orders
            // For simplicity, we just create a load sheet item for the total fulfillment from this batch for the SKU
            // and then later we can enhance it to track fulfillment per order item if needed.
            
            // Distribute fulfilled quantity back to the original order items for this SKU
            for (const orderItem of itemsBySku[skuId]) {
                if (orderItem.quantity === 0) continue; // Skip already fulfilled items in this loop
                
                const fulfillAmount = Math.min(orderItem.quantity, qtyFromThisBatch);
                 if (fulfillAmount === 0) continue;

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

                // Add to load sheet items
                 const existingLoadSheetItem = loadSheetItems.find(lsi => lsi.orderId === orderItem.orderId && lsi.skuId === skuId);
                 if (existingLoadSheetItem) {
                    existingLoadSheetItem.fulfilledQuantity += fulfillAmount;
                    // If fulfillment is from multiple batches, we might need a more complex structure
                    existingLoadSheetItem.batchId = batch.id; // Overwriting for simplicity, might need array
                 } else {
                    loadSheetItems.push({
                        orderId: orderItem.orderId,
                        skuId: skuId,
                        requestedQuantity: orderItem.quantity,
                        fulfilledQuantity: fulfillAmount,
                        batchId: batch.id,
                        deliveryStatus: 'Pending',
                        returnedQuantity: 0,
                    });
                 }
                
                // Update master stock records
                const sku = skus.find(s => s.id === skuId);
                if (sku) {
                    sku.stock -= fulfillAmount;
                }
                batch.quantity -= fulfillAmount;
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
    
    // Update order statuses and fulfilledItems
    ordersToProcess.forEach(order => {
        const fulfilledItems = updatedFulfilledItemsByOrder[order.id] || [];
        const totalRequested = order.items.reduce((sum, i) => sum + i.quantity, 0);
        const totalFulfilled = fulfilledItems.reduce((sum, i) => sum + i.quantity, 0);

        order.status = totalFulfilled >= totalRequested ? 'Fulfilled' : 'Invoiced'; // Or a new "PartiallyFulfilled" status
        order.fulfilledItems = fulfilledItems;
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
                order.status = 'Partially Returned'; // Or more complex logic
            }
        } else {
             item.deliveryStatus = 'Delivered';
        }

        // Check if all items are handled to update the sheet status
        const allItemsDone = sheet.items.every(i => i.deliveryStatus === 'Delivered' || i.deliveryStatus === 'Returned');
        if (allItemsDone) {
            sheet.status = 'Completed';
        }

        revalidatePath(`/load-sheets/${loadSheetId}`);
        revalidatePath('/inventory');
        revalidatePath('/sku');
        revalidatePath('/orders');
        return { success: true, message: `Item status updated to ${newStatus}.` };

    } catch (error) {
        return { success: false, message: "An unexpected error occurred." };
    }
}
