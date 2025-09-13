
import DashboardLayout from '@/components/dashboard-layout';
import PageHeader from '@/components/page-header';
import { getOutlets, getSKUs } from '@/lib/data';
import CreateOrderForm from './create-order-form';
import { createOrder } from '../actions';

export default async function CreateOrderPage() {
  const outlets = await getOutlets();
  const skus = await getSKUs();

  return (
    <DashboardLayout>
      <PageHeader
        title="Create New Order"
        description="Select an outlet and add products to create a new order."
      />
      <div className="p-4 lg:p-6">
        <div className="max-w-2xl mx-auto">
           <CreateOrderForm outlets={outlets} skus={skus} createOrderAction={createOrder} />
        </div>
      </div>
    </DashboardLayout>
  );
}
