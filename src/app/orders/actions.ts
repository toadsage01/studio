'use server';

import { revalidatePath } from 'next/cache';
import { orders, batches, skus } from '@/lib/data-in-mem';
import type { OrderItem, Batch } from '@/lib/types';
import { redirect } from 'next/navigation';

export async function generateInvoice(orderId: string) {
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return { success: false, message: 'Order not found.' };
  }

  if (order.status !== 'Pending') {
    return { success: false, message: `Order is already ${order.status}.` };
  }

  const fulfilledItems: { skuId: string; quantity: number; batchId: string; price: number }[] = [];
  const tempBatchQuantities: { [key: string]: number } = {};
  
  // Create a temporary copy of batch quantities to handle potential rollbacks
  batches.forEach(b => {
    tempBatchQuantities[b.id] = b.quantity;
  });

  try {
    for (const item of order.items) {
      let remainingQuantity = item.quantity;

      const relevantBatches = batches
        .filter((b) => b.skuId === item.skuId && tempBatchQuantities[b.id] > 0)
        .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()); // FIFO

      if (relevantBatches.reduce((sum, b) => sum + tempBatchQuantities[b.id], 0) < remainingQuantity) {
        throw new Error(`Not enough stock for SKU ${item.skuId}.`);
      }

      for (const batch of relevantBatches) {
        if (remainingQuantity === 0) break;
        
        const quantityToTake = Math.min(remainingQuantity, tempBatchQuantities[batch.id]);
        
        if (quantityToTake > 0) {
          tempBatchQuantities[batch.id] -= quantityToTake;
          remainingQuantity -= quantityToTake;

          fulfilledItems.push({
            skuId: item.skuId,
            quantity: quantityToTake,
            batchId: batch.id,
            price: batch.price, // Use batch-wise pricing
          });
        }
      }
    }
    
    // If all items are processed successfully, commit changes
    Object.keys(tempBatchQuantities).forEach(batchId => {
        const batch = batches.find(b => b.id === batchId)!;
        const originalQuantity = batch.quantity;
        const newQuantity = tempBatchQuantities[batchId];
        const quantityChange = originalQuantity - newQuantity;

        batch.quantity = newQuantity;

        if (quantityChange > 0) {
            const sku = skus.find(s => s.id === batch.skuId)!;
            sku.stock -= quantityChange;
        }
    });

    const invoiceId = `INV-${order.id.split('-')[1].toUpperCase()}`;
    order.status = 'Invoiced';
    order.invoiceId = invoiceId;
    order.fulfilledItems = fulfilledItems;
    
    // Recalculate order total based on actual batch prices
    order.items = fulfilledItems.map(fi => ({
      skuId: fi.skuId,
      quantity: fi.quantity,
      price: fi.price,
    }));


    revalidatePath('/orders');
    revalidatePath('/inventory');
    revalidatePath('/sku');
    revalidatePath(`/orders/${orderId}/invoice`);

  } catch (error) {
    console.error('Invoice generation failed:', (error as Error).message);
    // Rollback is implicitly handled by not committing changes if an error is thrown
    return { success: false, message: (error as Error).message };
  }
  
  redirect(`/orders/${order.id}/invoice`);
  // return { success: true, message: 'Invoice generated successfully.' };
}
