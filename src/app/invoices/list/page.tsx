
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
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function InvoicesListPage() {
  const orders = await getOrders();
  const outlets = await getOutlets();
  const users = await getUsers();

  const invoicedOrders = orders.filter(o => o.invoiceId);

  const ordersWithDetails = invoicedOrders.map(order => {
    const outlet = outlets.find((o) => o.id === order.outletId);
    const user = users.find((u) => u.id === order.userId);
    return {
      ...order,
      outletName: outlet?.name ?? 'N/A',
      userName: user?.name ?? 'N/A',
    }
  });

  return (
    <DashboardLayout>
      <PageHeader
        title="Generated Invoices"
        description="View all generated invoices."
      />
      <div className="p-4 lg:p-6">
        <div className="rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Outlet</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersWithDetails.map((order) => {
                 const amount = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
                 return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium text-primary">{order.invoiceId}</TableCell>
                    <TableCell>#{order.id.split('-')[1].toUpperCase()}</TableCell>
                    <TableCell>{order.outletName}</TableCell>
                    <TableCell>{format(new Date(order.orderDate), 'MM/dd/yyyy')}</TableCell>
                    <TableCell>
                       <Badge
                        variant={order.status === 'Fulfilled' ? 'secondary' : 'default'}
                        className={order.status === 'Invoiced' ? 'bg-primary/20 text-primary-foreground' : ''}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/orders/${order.id}/invoice`}>View Invoice</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                 )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
