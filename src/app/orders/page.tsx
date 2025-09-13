
import DashboardLayout from '@/components/dashboard-layout';
import PageHeader from '@/components/page-header';
import { getOrders, getOutlets, getUsers } from '@/lib/data';
import OrdersTable from './orders-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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


export default async function OrdersPage() {
  const orders = await getOrders();
  const outlets = await getOutlets();
  const users = await getUsers();

  const pendingOrders = orders.filter(o => o.status === 'Pending');
  const invoicedOrders = orders.filter(o => o.invoiceId);

  const pendingOrdersWithDetails = pendingOrders.map(order => {
    const outlet = outlets.find((o) => o.id === order.outletId);
    const user = users.find((u) => u.id === order.userId);
    return {
      ...order,
      outletName: outlet?.name ?? 'N/A',
      userName: user?.name ?? 'N/A',
    }
  });

  const invoicedOrdersWithDetails = invoicedOrders.map(order => {
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
        title="Orders & Invoices"
        description="Create invoices from pending orders and view generated invoices."
      />
      <div className="p-4 lg:p-6">
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Invoice Creation</TabsTrigger>
            <TabsTrigger value="invoiced">Generated Invoices</TabsTrigger>
          </TabsList>
          <TabsContent value="pending">
             <div className="rounded-lg border shadow-sm mt-4">
              <OrdersTable data={pendingOrdersWithDetails} />
            </div>
          </TabsContent>
          <TabsContent value="invoiced">
            <div className="rounded-lg border shadow-sm mt-4">
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
                  {invoicedOrdersWithDetails.map((order) => {
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
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
