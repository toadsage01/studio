
'use server';

import { revalidatePath } from 'next/cache';
import { orders, skus } from '@/lib/data-in-mem';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { OrderItem } from '@/lib/types';


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

const orderItemSchema = z.object({
  skuId: z.string().min(1, "SKU is required."),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1."),
});

const createOrderSchema = z.object({
  outletId: z.string().min(1, "Please select an outlet."),
  items: z.array(orderItemSchema).min(1, "Please add at least one item to the order."),
});


export async function createOrder(data: z.infer<typeof createOrderSchema>) {
    try {
        const validation = createOrderSchema.safeParse(data);
        if (!validation.success) {
            return { success: false, message: "Invalid data provided.", errors: validation.error.flatten().fieldErrors };
        }

        const { outletId, items } = validation.data;

        const orderItems: OrderItem[] = items.map(item => {
            const sku = skus.find(s => s.id === item.skuId);
            // In a real app, you'd fetch the price from the SKU master or a price list
            // For now, we'll use a placeholder or assume a price. Let's use 0 for now.
            // A better approach would be to look it up from the sku.
             const price = skus.find(s => s.id === item.skuId)?.stock ?? 0; // DEMO: using stock as price
            return {
                skuId: item.skuId,
                quantity: item.quantity,
                price: price,
            }
        });

        const newOrder = {
            id: `order-${Date.now()}`,
            outletId,
            userId: 'user-2', // Hardcoding for now, in a real app this would be the logged in user
            orderDate: new Date().toISOString(),
            items: orderItems,
            status: 'Pending' as const,
        };

        orders.unshift(newOrder); // Add to the beginning of the list

        revalidatePath('/orders');

    } catch (error) {
        return { success: false, message: "An unexpected error occurred while creating the order." };
    }

    redirect('/orders');
}
