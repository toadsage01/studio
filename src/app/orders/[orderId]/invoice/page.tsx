import { getOrders, getOutlets, getUsers, getSKUs, getBatches } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type InvoicePageProps = {
  params: {
    orderId: string;
  };
};

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { orderId } = params;
  const orders = await getOrders();
  const order = orders.find((o) => o.id === orderId);

  if (!order || !order.invoiceId) {
    notFound();
  }

  const outlets = await getOutlets();
  const users = await getUsers();
  const skus = await getSKUs();
  const batches = await getBatches();

  const outlet = outlets.find((o) => o.id === order.outletId);
  const user = users.find((u) => u.id === order.userId);
  const totalAmount = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-primary">{order.invoiceId}</h1>
              <p className="text-muted-foreground">Order ID: #{order.id.split('-')[1].toUpperCase()}</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold">FieldFlow Inc.</h2>
              <p className="text-sm text-muted-foreground">123 AI Lane, Tech City</p>
            </div>
          </div>
          <div className="mt-6 flex justify-between">
            <div>
              <p className="font-semibold">Billed To:</p>
              <p>{outlet?.name}</p>
              <p className="text-sm text-muted-foreground">{outlet?.address}</p>
            </div>
            <div className="text-right">
              <p><span className="font-semibold">Invoice Date:</span> {new Date(order.orderDate).toLocaleDateString()}</p>
              <p><span className="font-semibold">Sales Rep:</span> {user?.name}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.fulfilledItems?.map((item, index) => {
                const sku = skus.find((s) => s.id === item.skuId);
                const batch = batches.find((b) => b.id === item.batchId);
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{sku?.name}</TableCell>
                    <TableCell>{batch?.batchNumber}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${(item.quantity * item.price).toFixed(2)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <Separator className="my-6" />
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes (0%)</span>
                <span>$0.00</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-6 flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Thank you for your business!</p>
          </div>
           <Badge variant={order.status === 'Fulfilled' ? 'secondary' : 'default'} className={order.status === 'Invoiced' ? 'bg-primary/20 text-primary-foreground' : ''}>
              {order.status}
            </Badge>
        </CardFooter>
      </Card>
    </div>
  );
}
