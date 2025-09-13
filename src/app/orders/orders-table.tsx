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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, FileText, PackageCheck } from 'lucide-react';
import Link from 'next/link';
import { generateInvoice, generateInvoices } from './actions';
import { Checkbox } from '@/components/ui/checkbox';
import type { Order } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

type OrderWithDetails = Order & {
  outletName: string;
  userName: string;
};

function GenerateInvoiceButton({ orderId, status }: { orderId: string, status: string }) {
  const generateInvoiceWithId = generateInvoice.bind(null, orderId);

  return (
    <form action={generateInvoiceWithId}>
      <button
        type="submit"
        disabled={status !== 'Pending'}
        className="w-full text-left relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
      >
        Generate Invoice
      </button>
    </form>
  );
}

type OrdersTableProps = {
  data: OrderWithDetails[];
};

export default function OrdersTable({ data }: OrdersTableProps) {
  const [selectedRowIds, setSelectedRowIds] = React.useState<string[]>([]);
  const { toast } = useToast();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRowIds(data.map(row => row.id));
    } else {
      setSelectedRowIds([]);
    }
  };

  const handleSelectRow = (rowId: string, checked: boolean) => {
    if (checked) {
      setSelectedRowIds(prev => [...prev, rowId]);
    } else {
      setSelectedRowIds(prev => prev.filter(id => id !== rowId));
    }
  };
  
  const handleBulkInvoice = async () => {
    const pendingOrders = selectedRowIds.filter(id => {
      const order = data.find(o => o.id === id);
      return order?.status === 'Pending';
    });

    if (pendingOrders.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No pending orders selected',
        description: 'Please select at least one "Pending" order to generate invoices.',
      });
      return;
    }
    
    if (pendingOrders.length !== selectedRowIds.length) {
       toast({
        title: 'Some orders skipped',
        description: 'Only "Pending" orders can be invoiced. Other selections were ignored.',
      });
    }

    const result = await generateInvoices(pendingOrders);
    
    if (result.success) {
      toast({
        title: 'Success',
        description: `${pendingOrders.length} invoices generated successfully.`,
      });
      setSelectedRowIds([]);
    } else {
       toast({
        variant: 'destructive',
        title: 'Error',
        description: result.message,
      });
    }

  };

  return (
    <>
      {selectedRowIds.length > 0 && (
        <div className="p-2 border-b bg-muted/50 flex items-center gap-2">
            <p className="text-sm text-muted-foreground px-2">{selectedRowIds.length} order(s) selected.</p>
            <Button size="sm" onClick={handleBulkInvoice}><FileText className="mr-2" /> Generate Invoices</Button>
            <Button size="sm" variant="outline"><PackageCheck className="mr-2" /> Create Load Sheet</Button>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={selectedRowIds.length === data.length && data.length > 0}
                onCheckedChange={handleSelectAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>Order ID</TableHead>
            <TableHead>Outlet</TableHead>
            <TableHead>Sales Rep</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((order) => {
            const amount = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
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
                <TableCell className="font-medium">#{order.id.split('-')[1].toUpperCase()}</TableCell>
                <TableCell>{order.outletName}</TableCell>
                <TableCell>{order.userName}</TableCell>
                <TableCell>{format(new Date(order.orderDate), 'MM/dd/yyyy')}</TableCell>
                <TableCell>
                  <Badge
                    variant={order.status === 'Fulfilled' ? 'secondary' : order.status === 'Cancelled' ? 'destructive' : 'outline'}
                    className={
                      order.status === 'Pending' ? 'bg-accent text-accent-foreground hover:bg-accent/80'
                      : order.status === 'Invoiced' ? 'bg-primary/20 text-primary-foreground'
                      : ''
                    }
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                <TableCell className="text-right">
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      {order.status === 'Invoiced' || order.status === 'Fulfilled' ? (
                         <DropdownMenuItem asChild>
                            <Link href={`/orders/${order.id}/invoice`}>View Invoice</Link>
                          </DropdownMenuItem>
                      ) : (
                         <DropdownMenuItem>View Order Details</DropdownMenuItem>
                      )}
                      {order.status === 'Pending' && (
                        <GenerateInvoiceButton orderId={order.id} status={order.status} />
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        Cancel Order
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
}
