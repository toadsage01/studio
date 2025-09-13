'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { SKU } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { DialogClose } from '@/components/ui/dialog';
import { useRef } from 'react';

const formSchema = z.object({
  skuId: z.string().min(1, 'Please select a SKU.'),
  batchNumber: z.string().min(1, 'Batch number is required.'),
  quantity: z.coerce.number().int().positive('Quantity must be a positive number.'),
  price: z.coerce.number().positive('Price must be a positive number.'),
  expiryDate: z.date({
    required_error: 'An expiry date is required.',
  }),
});

type AddBatchFormValues = z.infer<typeof formSchema>;

type AddBatchFormProps = {
  skus: SKU[];
  onAddBatch: (data: AddBatchFormValues) => Promise<{ success: boolean; message: string }>;
};

export default function AddBatchForm({ skus, onAddBatch }: AddBatchFormProps) {
  const { toast } = useToast();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const form = useForm<AddBatchFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skuId: '',
      batchNumber: '',
      quantity: 0,
      price: 0,
    },
  });

  async function onSubmit(values: AddBatchFormValues) {
    const result = await onAddBatch(values);
    if (result.success) {
      toast({
        title: 'Success',
        description: result.message,
      });
      form.reset();
      closeButtonRef.current?.click();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.message,
      });
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="skuId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a SKU" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {skus.map((sku) => (
                      <SelectItem key={sku.id} value={sku.id}>
                        {sku.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="batchNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Batch Number</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., B017-XYZ" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price per unit</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="expiryDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Expiry Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date() || date < new Date('1900-01-01')
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Adding Batch...' : 'Add Batch'}
          </Button>
        </form>
      </Form>
      <DialogClose ref={closeButtonRef} className="hidden" />
    </>
  );
}
