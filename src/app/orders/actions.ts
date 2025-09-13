
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
        
        // This is a temporary measure to make invoices viewable.
        // In the final workflow, `fulfilledItems` will be populated
        // during load sheet generation. For now, we mirror `items`.
        order.fulfilledItems = order.items.map(item => {
          const relevantBatches = batches.filter(b => b.skuId === item.skuId);
          // This is a naive fulfillment for display only.
          const firstBatch = relevantBatches[0];
          return {
            skuId: item.skuId,
            quantity: item.quantity,
            // This batchId is not final and will be determined during fulfillment.
            batchId: firstBatch ? firstBatch.id : 'unknown-batch', 
            price: firstBatch ? firstBatch.price : item.price,
          }
        });
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

  try {
    // This logic is now simplified. We just update the status and create an invoice ID.
    // Stock is NOT deducted here.
    order.status = 'Invoiced';
    order.invoiceId = `INV-${order.id.split('-')[1].toUpperCase()}`;
    
    // This is a temporary measure to make invoices viewable.
    // In the final workflow, `fulfilledItems` will be populated
    // during load sheet generation. For now, we mirror `items`.
    order.fulfilledItems = order.items.map(item => {
      const relevantBatches = batches.filter(b => b.skuId === item.skuId);
      // This is a naive fulfillment for display only.
      const firstBatch = relevantBatches[0];
      return {
        skuId: item.skuId,
        quantity: item.quantity,
        // This batchId is not final and will be determined during fulfillment.
        batchId: firstBatch ? firstBatch.id : 'unknown-batch',
        price: firstBatch ? firstBatch.price : item.price,
      }
    });

    revalidatePath('/orders');
    revalidatePath(`/orders/${orderId}/invoice`);

  } catch (error) {
    console.error('Invoice generation failed:', (error as Error).message);
    return { success: false, message: (error as Error).message };
  }
  
  redirect(`/orders/${order.id}/invoice`);
}
