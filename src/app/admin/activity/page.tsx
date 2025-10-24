import DashboardLayout from '@/components/dashboard-layout';
export const dynamic = 'force-dynamic';
import PageHeader from '@/components/page-header';
import { getActivityLogs } from '@/lib/activity';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default async function ActivityPage() {
  const logs = await getActivityLogs(100);
  return (
    <DashboardLayout>
      <PageHeader title="Activity" description="Recent system actions and data changes" />
      <div className="p-4 lg:p-6">
        <div className="rounded-lg border shadow-sm overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Entity ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((l, idx) => (
                <TableRow key={l.id ?? idx}>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{new Date(l.timestamp).toLocaleString()}</TableCell>
                  <TableCell className="font-medium">{l.event}</TableCell>
                  <TableCell>{l.entity}</TableCell>
                  <TableCell className="text-xs">{l.entityId}</TableCell>
                  <TableCell className="text-xs">{l.userId ?? '-'}</TableCell>
                  <TableCell>
                    <pre className="text-xs whitespace-pre-wrap max-w-[50ch] break-words">{l.details ? JSON.stringify(l.details, null, 0) : '-'}</pre>
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
