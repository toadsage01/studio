import DashboardLayout from '@/components/dashboard-layout';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';

export default function LoadSheetsPage() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Load Sheets"
        description="Generate and manage load sheets for order fulfillment."
        actions={<Button>Create Load Sheet</Button>}
      />
      <div className="p-4 lg:p-6">
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-[60vh]">
          <div className="flex flex-col items-center gap-1 text-center">
            <h3 className="text-2xl font-bold tracking-tight">
              No load sheets generated
            </h3>
            <p className="text-sm text-muted-foreground">
              You can start fulfilling orders by creating a new load sheet.
            </p>
            <Button className="mt-4">Create Load Sheet</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
