import DashboardLayout from '@/components/dashboard-layout';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getOutlets, getRoutePlans } from '@/lib/data';
import { Map, Store, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default async function RoutesPage() {
  const routePlans = await getRoutePlans();
  const outlets = await getOutlets();

  return (
    <DashboardLayout>
      <PageHeader
        title="Route Plans"
        description="Create and manage weekly route plans for your sales team."
        actions={<Button>New Route Plan</Button>}
      />
      <div className="p-4 lg:p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {routePlans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                 <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                     <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Map className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>{plan.outletIds.length} outlets on this route</CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>Edit Route</DropdownMenuItem>
                      <DropdownMenuItem>Assign Route</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        Delete Route
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                 </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Outlets</h4>
                  <ul className="space-y-2 rounded-md border p-2">
                    {plan.outletIds.map((outletId) => {
                      const outlet = outlets.find((o) => o.id === outletId);
                      if (!outlet) return null;
                      return (
                        <li key={outletId} className="flex items-center gap-3 text-sm">
                          <Store className="h-4 w-4 text-muted-foreground" />
                          <span>{outlet.name}</span>
                          <span className="ml-auto text-xs text-muted-foreground">
                            {outlet.address.split(',')[1]?.trim()}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
