import DashboardLayout from '@/components/dashboard-layout';
import PageHeader from '@/components/page-header';
import { getSKUs, getBatches } from '@/lib/data';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Package, PlusCircle } from 'lucide-react';
import AddBatchForm from './add-batch-form';
import { addBatch } from './actions';

async function BatchDetails({ skuId }: { skuId: string }) {
  const batches = await getBatches(skuId);

  if (!batches.length) {
    return <p className="text-sm text-muted-foreground">No batch information available for this SKU.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Batch #</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Expiry</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {batches.map((batch) => (
          <TableRow key={batch.id}>
            <TableCell>{batch.batchNumber}</TableCell>
            <TableCell>{batch.quantity}</TableCell>
            <TableCell>${batch.price.toFixed(2)}</TableCell>
            <TableCell>{new Date(batch.expiryDate).toLocaleDateString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default async function InventoryPage() {
  const skus = await getSKUs();

  return (
    <DashboardLayout>
      <PageHeader
        title="Inventory Management"
        description="Monitor stock levels and manage batch-wise inventory."
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2" />
                Add Batch
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Batch</DialogTitle>
                <DialogDescription>Enter the details for the new batch of inventory.</DialogDescription>
              </DialogHeader>
              <AddBatchForm skus={skus} onAddBatch={addBatch} />
            </DialogContent>
          </Dialog>
        }
      />
      <div className="p-4 lg:p-6">
        <div className="rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Total Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {skus.map((sku) => (
                <TableRow key={sku.id}>
                  <TableCell>
                    <div className="font-medium">{sku.name}</div>
                    <div className="text-sm text-muted-foreground">{sku.description}</div>
                  </TableCell>
                  <TableCell>{sku.category}</TableCell>
                  <TableCell>{sku.stock}</TableCell>
                  <TableCell>
                    <Badge
                      variant={sku.stock > 50 ? 'secondary' : sku.stock > 20 ? 'default' : 'destructive'}
                      className={sku.stock > 20 && sku.stock <= 50 ? 'bg-accent text-accent-foreground' : ''}
                    >
                      {sku.stock > 50 ? 'In Stock' : sku.stock > 20 ? 'Low Stock' : 'Critical'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          View Batches
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Package /> Batch Details for {sku.name}
                          </DialogTitle>
                          <DialogDescription>
                            View and manage individual batches for this product.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                           <BatchDetails skuId={sku.id} />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
