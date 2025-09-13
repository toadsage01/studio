
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
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
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Trash2, Package } from 'lucide-react';
import type { Outlet, SKU } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

const orderItemSchema = z.object({
  skuId: z.string().min(1, "SKU is required."),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1."),
});

const formSchema = z.object({
  outletId: z.string().min(1, "Please select an outlet."),
  items: z.array(orderItemSchema).min(1, "Please add at least one item to the order."),
});

type CreateOrderFormValues = z.infer<typeof formSchema>;

type CreateOrderFormProps = {
  outlets: Outlet[];
  skus: SKU[];
  createOrderAction: (data: CreateOrderFormValues) => Promise<any>;
};

export default function CreateOrderForm({ outlets, skus, createOrderAction }: CreateOrderFormProps) {
  const { toast } = useToast();
  const form = useForm<CreateOrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      outletId: '',
      items: [{ skuId: '', quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  async function onSubmit(values: CreateOrderFormValues) {
    const result = await createOrderAction(values);
    if (result?.success === false) {
      toast({
        variant: 'destructive',
        title: 'Error creating order',
        description: result.message,
      });
    } else {
        toast({
            title: 'Order Created',
            description: 'The new order has been successfully created and is pending invoice generation.',
        });
        form.reset();
        // The server action handles redirection, so no need to do it here.
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
           <CardHeader>
                <CardTitle>Customer Information</CardTitle>
                <CardDescription>Select the outlet for this order.</CardDescription>
            </CardHeader>
            <CardContent>
                <FormField
                    control={form.control}
                    name="outletId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Outlet</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select an outlet" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {outlets.map((outlet) => (
                                <SelectItem key={outlet.id} value={outlet.id}>
                                {outlet.name}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Order Items</CardTitle>
                <CardDescription>Add products and quantities to the order.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-4 items-end p-4 border rounded-lg relative">
                        <FormField
                            control={form.control}
                            name={`items.${index}.skuId`}
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Product (SKU)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a product" />
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
                            name={`items.${index}.quantity`}
                            render={({ field }) => (
                                <FormItem className="w-24">
                                    <FormLabel>Quantity</FormLabel>
                                    <FormControl>
                                        <Input type="number" min="1" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4"/>
                        </Button>
                    </div>
                ))}
                 <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => append({ skuId: '', quantity: 1 })}
                >
                    <PlusCircle className="mr-2" />
                    Add Item
                </Button>
                 {form.formState.errors.items && (
                    <p className="text-sm font-medium text-destructive">{form.formState.errors.items.message}</p>
                 )}
            </CardContent>
        </Card>
        
        <div className="flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Creating Order...' : 'Create Order'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
