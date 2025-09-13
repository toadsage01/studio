import {
  Activity,
  ClipboardList,
  DollarSign,
  Package,
  Route,
} from 'lucide-react';
import { format } from 'date-fns';

import DashboardLayout from '@/components/dashboard-layout';
import PageHeader from '@/components/page-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getOrders, getOutlets, getSKUs } from '@/lib/data';

export default async function Dashboard() {
  const outlets = await getOutlets();
  const orders = await getOrders();
  const skus = await getSKUs();
  
  const totalSales = orders.reduce((sum, order) => {
    if (order.status === 'Fulfilled') {
      return sum + order.items.reduce((orderSum, item) => orderSum + item.price * item.quantity, 0);
    }
    return sum;
  }, 0);

  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  
  const todaysRouteOutlets = outlets.slice(0, 3);

  const lowStockSkus = skus.filter(sku => sku.stock < 50);

  return (
    <DashboardLayout>
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's a snapshot of your sales activity."
      />
      <div className="p-4 lg:p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalSales.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{pendingOrders}</div>
              <p className="text-xs text-muted-foreground">2 new orders today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Route</CardTitle>
              <Route className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todaysRouteOutlets.length} Outlets</div>
              <p className="text-xs text-muted-foreground">Monday Route</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStockSkus.length} SKUs</div>
              <p className="text-xs text-muted-foreground">Check inventory levels</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Outlet</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.slice(0, 5).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="font-medium">{outlets.find(o => o.id === order.outletId)?.name}</div>
                        <div className="text-sm text-muted-foreground">{format(new Date(order.orderDate), 'MM/dd/yyyy')}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.status === 'Fulfilled' ? 'secondary' : order.status === 'Pending' ? 'default' : 'outline'}
                          className={order.status === 'Pending' ? 'bg-accent text-accent-foreground' : ''}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">${order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-start gap-4">
                <Activity className="h-5 w-5 text-muted-foreground mt-1"/>
                <div className="space-y-1">
                  <p className="text-sm">New order <span className="font-medium text-primary">#FF1005</span> created by Alex.</p>
                  <time className="text-xs text-muted-foreground">10 minutes ago</time>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Package className="h-5 w-5 text-muted-foreground mt-1"/>
                <div className="space-y-1">
                  <p className="text-sm">Batch <span className="font-medium text-primary">B012-WTR</span> stock updated for Water Bottle 1L.</p>
                  <time className="text-xs text-muted-foreground">30 minutes ago</time>
                </div>
              </div>
               <div className="flex items-start gap-4">
                <Route className="h-5 w-5 text-muted-foreground mt-1"/>
                <div className="space-y-1">
                  <p className="text-sm">Route <span className="font-medium text-primary">"Downtown Core"</span> was assigned to Sarah.</p>
                  <time className="text-xs text-muted-foreground">1 hour ago</time>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <DollarSign className="h-5 w-5 text-muted-foreground mt-1"/>
                <div className="space-y-1">
                  <p className="text-sm">Invoice <span className="font-medium text-primary">INV-0342</span> for $1,204.50 was fulfilled.</p>
                  <time className="text-xs text-muted-foreground">3 hours ago</time>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
