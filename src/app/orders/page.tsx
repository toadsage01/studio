import DashboardLayout from '@/components/dashboard-layout';
import PageHeader from '@/components/page-header';
import { getOrders, getOutlets, getUsers } from '@/lib/data';
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
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { generateInvoice } from './actions';

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


export default async function OrdersPage() {
  const orders = await getOrders();
  const outlets = await getOutlets();
  const users = await getUsers();

  return (
    <DashboardLayout>
      <PageHeader
        title="Orders"
        description="View and manage all customer orders."
        actions={<Button>New Order</Button>}
      />
      <div className="p-4 lg:p-6">
        <div className="rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
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
              {orders.map((order) => {
                const outlet = outlets.find((o) => o.id === order.outletId);
                const user = users.find((u) => u.id === order.userId);
                const amount = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id.split('-')[1].toUpperCase()}</TableCell>
                    <TableCell>{outlet?.name}</TableCell>
                    <TableCell>{user?.name}</TableCell>
                    <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
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
        </div>
      </div>
    </DashboardLayout>
  );
}
