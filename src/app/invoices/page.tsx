
import DashboardLayout from '@/components/dashboard-layout';
import PageHeader from '@/components/page-header';
import { getOrders, getOutlets, getUsers } from '@/lib/data';
import OrdersTable from '@/app/orders/orders-table';


export default async function InvoiceCreationPage() {
  const orders = await getOrders();
  const outlets = await getOutlets();
  const users = await getUsers();

  const pendingOrders = orders.filter(o => o.status === 'Pending');

  const ordersWithDetails = pendingOrders.map(order => {
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
        title="Create Invoices"
        description="Select pending orders to generate invoices in bulk."
      />
      <div className="p-4 lg:p-6">
        <div className="rounded-lg border shadow-sm">
          <OrdersTable data={ordersWithDetails} />
        </div>
      </div>
    </DashboardLayout>
  );
}
