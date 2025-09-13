'use server';

import { revalidatePath } from 'next/cache';
import { orders, batches, skus } from '@/lib/data-in-mem';
import type { OrderItem, Batch } from '@/lib/types';
import { redirect } from 'next/navigation';


export async function generateInvoices(orderIds: string[]) {
  if (!orderIds || orderIds.length === 0) {
    return { success: false, message: 'No orders selected.' };
  }

  try {
    orderIds.forEach(orderId => {
      const order = orders.find((o) => o.id === orderId);
      if (order && order.status === 'Pending') {
        order.status = 'Invoiced';
        order.invoiceId = `INV-${order.id.split('-')[1].toUpperCase()}`;
      }
    });

    revalidatePath('/orders');
    return { success: true, message: 'Invoices generated successfully.' };

  } catch (error) {
    return { success: false, message: 'An unexpected error occurred during bulk invoice generation.' };
  }
}


export async function generateInvoice(orderId: string) {
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return { success: false, message: 'Order not found.' };
  }

  if (order.status !== 'Pending') {
    return { success: false, message: `Order is already ${order.status}.` };
  }

  // NOTE: This fulfillment logic will be moved to a new "Load Sheet" generation step.
  // For now, we keep it to ensure invoices are viewable.
  const fulfilledItems: { skuId: string; quantity: number; batchId: string; price: number }[] = [];
  const tempBatchQuantities: { [key: string]: number } = {};
  
  batches.forEach(b => {
    tempBatchQuantities[b.id] = b.quantity;
  });

  try {
    for (const item of order.items) {
      let remainingQuantity = item.quantity;

      const relevantBatches = batches
        .filter((b) => b.skuId === item.skuId && tempBatchQuantities[b.id] > 0)
        .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

      if (relevantBatches.reduce((sum, b) => sum + tempBatchQuantities[b.id], 0) < remainingQuantity) {
        throw new Error(`Not enough stock for SKU ${item.skuId}. Skipping invoice generation for this order.`);
      }

      for (const batch of relevantBatches) {
        if (remainingQuantity === 0) break;
        
        const quantityToTake = Math.min(remainingQuantity, tempBatchQuantities[batch.id]);
        
        if (quantityToTake > 0) {
          // This is temporary, stock should not be deducted here in the final version
          // tempBatchQuantities[batch.id] -= quantityToTake; 
          remainingQuantity -= quantityToTake;

          fulfilledItems.push({
            skuId: item.skuId,
            quantity: quantityToTake,
            batchId: batch.id,
            price: batch.price,
          });
        }
      }
    }
    
    // This is also temporary. We will decouple this later.
    // Object.keys(tempBatchQuantities).forEach(batchId => {
    //     const batch = batches.find(b => b.id === batchId)!;
    //     const originalQuantity = batch.quantity;
    //     const newQuantity = tempBatchQuantities[batchId];
    //     const quantityChange = originalQuantity - newQuantity;

    //     batch.quantity = newQuantity;

    //     if (quantityChange > 0) {
    //         const sku = skus.find(s => s.id === batch.skuId)!;
    //         sku.stock -= quantityChange;
    //     }
    // });

    const invoiceId = `INV-${order.id.split('-')[1].toUpperCase()}`;
    order.status = 'Invoiced';
    order.invoiceId = invoiceId;
    
    // Temporarily assign fulfilledItems so the invoice page can render.
    // In the future, this will be populated during load sheet generation.
    order.fulfilledItems = fulfilledItems;
    
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
    return { success: false, message: (error as Error).message };
  }
  
  redirect(`/orders/${order.id}/invoice`);
}
