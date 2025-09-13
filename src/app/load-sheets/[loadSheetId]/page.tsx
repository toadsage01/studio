
import { getLoadSheets, getOrders, getOutlets, getSKUs } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/components/dashboard-layout';
import PageHeader from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Truck, Check, Undo2, Package } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { updateLoadSheetItemStatus } from '../actions';

type LoadSheetManagePageProps = {
  params: {
    loadSheetId: string;
  };
};

function UpdateStatusForm({ loadSheetId, orderId, skuId, quantity, currentStatus, fulfilledQuantity, returnedQuantity }: { loadSheetId: string; orderId: string; skuId: string, quantity: number, currentStatus: string, fulfilledQuantity: number, returnedQuantity: number }) {
  const updateStatus = updateLoadSheetItemStatus.bind(null, loadSheetId, orderId, skuId);
  const canDeliver = currentStatus !== 'Delivered';
  const canReturn = currentStatus === 'Delivered' || currentStatus === 'Partially Returned';
  const remainingToReturn = fulfilledQuantity - returnedQuantity;


  return (
    <form className="flex gap-2">
      {canDeliver && (
         <Button formAction={() => updateStatus('Delivered', quantity)} size="sm" variant="secondary" disabled={!canDeliver}>
            <Check className="mr-2 h-3 w-3" /> Deliver
        </Button>
      )}
      {canReturn && (
         <Button formAction={() => updateStatus('Returned', remainingToReturn)} size="sm" variant="outline" disabled={!canReturn || remainingToReturn === 0}>
            <Undo2 className="mr-2 h-3 w-3" /> Return
        </Button>
      )}
    </form>
  );
}

export default async function LoadSheetManagePage({ params }: LoadSheetManagePageProps) {
  const { loadSheetId } = params;
  const sheets = await getLoadSheets();
  const sheet = sheets.find((s) => s.id === loadSheetId);

  if (!sheet) {
    notFound();
  }

  const allOrders = await getOrders();
  const allOutlets = await getOutlets();
  const allSkus = await getSKUs();
  
  const ordersOnSheet = allOrders.filter(o => sheet.relatedOrders.includes(o.id));
  
  return (
    <DashboardLayout>
      <PageHeader
        title={`Manage Load Sheet: ${sheet.id}`}
        description={`Assigned to ${sheet.assignedTo} on ${format(new Date(sheet.creationDate), 'PPP')}`}
      />
      <div className="p-4 lg:p-6 space-y-6">
        <Card>
            <CardHeader className="flex flex-row justify-between items-start">
                <div>
                    <CardTitle>Overall Status</CardTitle>
                    <CardDescription>Update the status of the entire delivery route.</CardDescription>
                </div>
                 <Badge variant={sheet.status === 'Completed' ? 'secondary' : 'default'}
                    className={sheet.status === 'Loaded' ? 'bg-accent text-accent-foreground' : ''}
                >
                    {sheet.status}
                </Badge>
            </CardHeader>
            <CardFooter className="flex gap-2 border-t pt-6">
                <Button variant="outline" disabled={sheet.status !== 'Loaded'}>
                    <Truck className="mr-2"/> Mark as Out for Delivery
                </Button>
                 <Button disabled={sheet.status !== 'Out for Delivery'}>
                    <Check className="mr-2"/> Mark as Completed
                </Button>
            </CardFooter>
        </Card>

        {ordersOnSheet.map(order => {
            const outlet = allOutlets.find(o => o.id === order.outletId);
            const itemsForThisOrder = sheet.items.filter(i => i.orderId === order.id);

            return (
                <Card key={order.id}>
                    <CardHeader>
                        <CardTitle>Order #{order.id.split('-')[1]} for {outlet?.name}</CardTitle>
                        <CardDescription>Invoice ID: <span className="font-medium text-primary">{order.invoiceId}</span></CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Fulfilled</TableHead>
                                    <TableHead>Returned</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {itemsForThisOrder.map(item => {
                                    const sku = allSkus.find(s => s.id === item.skuId);
                                    return (
                                        <TableRow key={item.skuId}>
                                            <TableCell>
                                                <div className="font-medium">{sku?.name}</div>
                                                <div className="text-xs text-muted-foreground">Batch: {item.batchId}</div>
                                            </TableCell>
                                            <TableCell>{item.fulfilledQuantity}</TableCell>
                                            <TableCell>{item.returnedQuantity}</TableCell>
                                            <TableCell>
                                                <Badge variant={item.deliveryStatus === 'Delivered' ? 'secondary' : item.deliveryStatus === 'Returned' ? 'destructive' : 'outline'}>{item.deliveryStatus}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <UpdateStatusForm 
                                                    loadSheetId={sheet.id} 
                                                    orderId={order.id} 
                                                    skuId={item.skuId} 
                                                    quantity={item.fulfilledQuantity}
                                                    currentStatus={item.deliveryStatus}
                                                    fulfilledQuantity={item.fulfilledQuantity}
                                                    returnedQuantity={item.returnedQuantity}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )
        })}
      </div>
    </DashboardLayout>
  );
}
