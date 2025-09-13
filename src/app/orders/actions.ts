
'use server';

import { revalidatePath } from 'next/cache';
import { orders } from '@/lib/data-in-mem';
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

  try {
    order.status = 'Invoiced';
    order.invoiceId = `INV-${order.id.split('-')[1].toUpperCase()}`;
    
    revalidatePath('/orders');
    revalidatePath(`/orders/${orderId}/invoice`);

  } catch (error) {
    console.error('Invoice generation failed:', (error as Error).message);
    return { success: false, message: (error as Error).message };
  }
  
  redirect(`/orders/${order.id}/invoice`);
}
