import DashboardLayout from '@/components/dashboard-layout';
import PageHeader from '@/components/page-header';
import { getOrders, getOutlets, getUsers, getLoadSheets } from '@/lib/data';
import LoadSheetCreator from './load-sheet-creator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Truck, Package, Pencil } from 'lucide-react';
import Link from 'next/link';

export default async function LoadSheetsPage() {
  const orders = await getOrders();
  const outlets = await getOutlets();
  const users = await getUsers();
  const loadSheets = await getLoadSheets();

  const invoicedOrders = orders.filter((o) => o.status === 'Invoiced');

  const invoicedOrdersWithDetails = invoicedOrders.map((order) => {
    const outlet = outlets.find((o) => o.id === order.outletId);
    const user = users.find((u) => u.id === order.userId);
    return {
      ...order,
      outletName: outlet?.name ?? 'N/A',
      userName: user?.name ?? 'N/A',
    };
  });
  
  const allUsers = await getUsers();


  return (
    <DashboardLayout>
      <PageHeader
        title="Load Sheets"
        description="Generate load sheets to fulfill invoiced orders and manage deliveries."
      />
      <div className="p-4 lg:p-6 space-y-6">
        <LoadSheetCreator data={invoicedOrdersWithDetails} users={allUsers} />

        <div className="border rounded-lg shadow-sm">
           <div className="p-4 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2"><Truck /> Generated Load Sheets</h3>
              <p className="text-sm text-muted-foreground">Review previously generated load sheets and manage their fulfillment status.</p>
            </div>
          {loadSheets.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {loadSheets.map((sheet) => (
                <AccordionItem value={sheet.id} key={sheet.id}>
                  <AccordionTrigger className="px-4 hover:no-underline data-[state=open]:border-b">
                    <div className="flex justify-between items-center w-full pr-4">
                        <div className="flex flex-col text-left">
                            <span className="font-bold text-primary">{sheet.id}</span>
                            <span className="text-sm text-muted-foreground">{format(new Date(sheet.creationDate), 'PPP')}</span>
                        </div>
                         <div className="text-sm">Assigned to: <span className="font-medium">{sheet.assignedTo}</span></div>
                        <Badge variant={sheet.status === 'Completed' ? 'secondary' : 'default'}
                          className={sheet.status === 'Loaded' ? 'bg-accent text-accent-foreground' : ''}
                        >
                          {sheet.status}
                        </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="bg-muted/50 p-4">
                        <div className="flex justify-between items-center mb-2">
                           <h4 className="font-semibold flex items-center gap-2 text-sm"><Package/> Items on this Load Sheet</h4>
                           <Button asChild size="sm" variant="outline">
                             <Link href={`/load-sheets/${sheet.id}`}>
                                <Pencil className="mr-2 h-3 w-3"/>
                                Manage Sheet
                             </Link>
                           </Button>
                        </div>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Batch</TableHead>
                                    <TableHead className="text-right">Requested</TableHead>
                                    <TableHead className="text-right">Fulfilled</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sheet.items.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-mono text-xs">#{item.orderId.split('-')[1]}</TableCell>
                                        <TableCell>{item.skuId}</TableCell>
                                        <TableCell>{item.batchId}</TableCell>
                                        <TableCell className="text-right">{item.requestedQuantity}</TableCell>
                                        <TableCell className="text-right font-medium">{item.fulfilledQuantity}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                         </Table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              No load sheets have been generated yet.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
