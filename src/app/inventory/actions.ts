
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { batches, skus } from '@/lib/data-in-mem';

const formSchema = z.object({
  skuId: z.string().min(1, 'Please select a SKU.'),
  batchNumber: z.string().min(1, 'Batch number is required.'),
  quantity: z.coerce.number().int().positive('Quantity must be a positive number.'),
  price: z.coerce.number().positive('Price must be a positive number.'),
  expiryDate: z.date({
    required_error: 'An expiry date is required.',
  }),
});

export async function addBatch(data: z.infer<typeof formSchema>) {
  try {
    const validation = formSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, message: 'Invalid data.' };
    }

    const { skuId, batchNumber, quantity, price, expiryDate } = validation.data;
    
    // Check if SKU exists
    const sku = skus.find(s => s.id === skuId);
    if (!sku) {
        return { success: false, message: 'SKU not found.' };
    }

    // Check for duplicate batch number for the same SKU
    const existingBatch = batches.find(b => b.skuId === skuId && b.batchNumber === batchNumber);
    if(existingBatch) {
        return { success: false, message: `Batch number ${batchNumber} already exists for this SKU.` };
    }

    const newBatch = {
      id: `batch-${Date.now()}`,
      skuId,
      batchNumber,
      quantity,
      price,
      expiryDate: expiryDate.toISOString(),
    };

    batches.push(newBatch);

    // Update SKU stock
    sku.stock += quantity;

    revalidatePath('/inventory');
    revalidatePath('/sku');

    return { success: true, message: 'Batch added successfully!' };
  } catch (error) {
    return { success: false, message: 'An unexpected error occurred.' };
  }
}
