import DashboardLayout from '@/components/dashboard-layout';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getRouteAssignments, getRoutePlans, getUsers } from '@/lib/data';
import { Map, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default async function SchedulePage() {
  const assignments = await getRouteAssignments();
  const plans = await getRoutePlans();
  const users = await getUsers();

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <DashboardLayout>
      <PageHeader
        title="Weekly Schedule"
        description="Assign and view day-wise routes for your sales team."
        actions={<Button>Edit Schedule</Button>}
      />
      <div className="p-4 lg:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
          {daysOfWeek.map((day, index) => {
            const dayAssignments = assignments.filter((a) => a.dayOfWeek === index);
            return (
              <Card key={day} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{day}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  {dayAssignments.length > 0 ? (
                    dayAssignments.map((assignment) => {
                      const plan = plans.find((p) => p.id === assignment.routePlanId);
                      const user = users.find((u) => u.id === assignment.userId);
                      if (!plan || !user) return null;

                      return (
                        <div key={assignment.id} className="space-y-2 rounded-md border bg-card p-3 shadow-sm">
                          <div className="flex items-center gap-2">
                            <Map className="h-4 w-4 text-primary" />
                            <p className="text-sm font-medium">{plan.name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <Badge variant="secondary" className="text-xs">{user.name}</Badge>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-sm text-muted-foreground">No routes assigned</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
