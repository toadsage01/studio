import DashboardLayout from '@/components/dashboard-layout';
import PageHeader from '@/components/page-header';
import { getOrders, getOutlets, getUsers } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { generateInvoices } from './actions';
import OrdersTable from './orders-table';


export default async function OrdersPage() {
  const orders = await getOrders();
  const outlets = await getOutlets();
  const users = await getUsers();

  const ordersWithDetails = orders.map(order => {
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
        title="Orders"
        description="View and manage all customer orders."
        actions={<Button>New Order</Button>}
      />
      <div className="p-4 lg:p-6">
        <div className="rounded-lg border shadow-sm">
          <OrdersTable data={ordersWithDetails} />
        </div>
      </div>
    </DashboardLayout>
  );
}
