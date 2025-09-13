'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck, User } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import type { Order, User as UserType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { createLoadSheet } from './actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


type OrderWithDetails = Order & {
  outletName: string;
  userName: string;
};

type LoadSheetCreatorProps = {
  data: OrderWithDetails[];
  users: UserType[];
};

export default function LoadSheetCreator({ data, users }: LoadSheetCreatorProps) {
  const [selectedRowIds, setSelectedRowIds] = React.useState<string[]>([]);
  const [assignedUserId, setAssignedUserId] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const invoicedOrderIds = data.map((row) => row.id);
      setSelectedRowIds(invoicedOrderIds);
    } else {
      setSelectedRowIds([]);
    }
  };

  const handleSelectRow = (rowId: string, checked: boolean) => {
    if (checked) {
      setSelectedRowIds((prev) => [...prev, rowId]);
    } else {
      setSelectedRowIds((prev) => prev.filter((id) => id !== rowId));
    }
  };

  const handleCreateLoadSheet = async () => {
    if (selectedRowIds.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Orders Selected',
        description: 'Please select at least one invoiced order to create a load sheet.',
      });
      return;
    }
    if (!assignedUserId) {
        toast({
            variant: 'destructive',
            title: 'No User Assigned',
            description: 'Please assign a sales rep to the load sheet.',
        });
        return;
    }

    setIsSubmitting(true);
    const result = await createLoadSheet(selectedRowIds, assignedUserId);
    setIsSubmitting(false);

    if (result?.success) {
      toast({
        title: 'Success',
        description: 'Load sheet created and orders fulfilled successfully.',
      });
      setSelectedRowIds([]);
      setAssignedUserId('');
    } else if (result?.message) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.message,
      });
    }
  };

  const numSelected = selectedRowIds.length;
  const numInvoiced = data.length;
  const salesReps = users.filter(u => u.role === 'Sales Rep');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Load Sheet</CardTitle>
        <CardDescription>Select invoiced orders to fulfill and assign them to a sales representative.</CardDescription>
      </CardHeader>
      <CardContent>
         {numInvoiced > 0 ? (
            <div className="rounded-lg border shadow-sm">
                <div className="p-4 bg-muted/50 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground">
                        {numSelected} of {numInvoiced} invoiced order(s) selected.
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                         <Select value={assignedUserId} onValueChange={setAssignedUserId}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <User className="mr-2" />
                                <SelectValue placeholder="Assign to..." />
                            </SelectTrigger>
                            <SelectContent>
                                {salesReps.map(user => (
                                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button size="sm" onClick={handleCreateLoadSheet} disabled={isSubmitting || numSelected === 0 || !assignedUserId} className="w-full sm:w-auto">
                            <Truck className="mr-2 h-4 w-4" />
                            {isSubmitting ? 'Creating...' : 'Create Load Sheet'}
                        </Button>
                    </div>
                </div>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead className="w-10">
                        <Checkbox
                            checked={numSelected > 0 && numSelected === numInvoiced}
                            onCheckedChange={(checked) => handleSelectAll(!!checked)}
                            aria-label="Select all invoiced orders"
                            disabled={numInvoiced === 0}
                        />
                        </TableHead>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Invoice ID</TableHead>
                        <TableHead>Outlet</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {data.map((order) => {
                        const amount = order.items.reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0
                        );
                        const isSelected = selectedRowIds.includes(order.id);

                        return (
                        <TableRow key={order.id} data-state={isSelected ? 'selected' : undefined}>
                            <TableCell>
                            <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => handleSelectRow(order.id, !!checked)}
                                aria-label={`Select order ${order.id}`}
                            />
                            </TableCell>
                            <TableCell className="font-medium">
                            #{order.id.split('-')[1].toUpperCase()}
                            </TableCell>
                             <TableCell className="font-medium text-primary">
                                {order.invoiceId}
                            </TableCell>
                            <TableCell>{order.outletName}</TableCell>
                            <TableCell>{format(new Date(order.orderDate), 'MM/dd/yyyy')}</TableCell>
                           <TableCell className="text-right">${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        </TableRow>
                        );
                    })}
                    </TableBody>
                </Table>
            </div>
         ) : (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-[30vh]">
                <div className="flex flex-col items-center gap-1 text-center">
                    <h3 className="text-2xl font-bold tracking-tight">
                    No Invoiced Orders
                    </h3>
                    <p className="text-sm text-muted-foreground">
                    There are no orders awaiting fulfillment.
                    </p>
                </div>
            </div>
         )}
      </CardContent>
    </Card>
  );
}
