import DashboardLayout from '@/components/dashboard-layout';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getOutlets } from '@/lib/data';
import { CreditCard, Home, MapPin, MoreVertical, Phone, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default async function OutletsPage() {
  const outlets = await getOutlets();

  return (
    <DashboardLayout>
      <PageHeader
        title="Outlets"
        description="Manage your customer and outlet information."
        actions={<Button>Add Outlet</Button>}
      />
      <div className="p-4 lg:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {outlets.map((outlet) => (
            <Card key={outlet.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{outlet.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 pt-1">
                      <MapPin className="h-3 w-3" />
                      {outlet.address}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>Edit Outlet</DropdownMenuItem>
                      <DropdownMenuItem>View Orders</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        Delete Outlet
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{outlet.contact}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span>Credit Limit: ${outlet.creditLimit.toLocaleString()}</span>
                </div>
                 <div className="flex items-start gap-3">
                  <span className="font-medium text-muted-foreground pt-1">Payment:</span>
                  <div className="flex flex-wrap gap-1">
                     {outlet.paymentModes.map(mode => <Badge key={mode} variant="secondary">{mode}</Badge>)}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Create Order
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
