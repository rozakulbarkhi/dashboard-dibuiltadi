import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DailyTransactionsWidget } from "@/components/dashboard/DailyTransactionsWidget";
import { MonthlyTransactionsWidget } from "@/components/dashboard/MonthlyTransactionsWidget";
import { YearlyTransactionsWidget } from "@/components/dashboard/YearlyTransactionsWidget";
import { TopCustomersWidget } from "@/components/dashboard/TopCustomersWidget";

export default function SummaryPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Summary</h1>
          <p className="text-muted-foreground">
            Comprehensive overview of your business performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <DailyTransactionsWidget />
        <MonthlyTransactionsWidget />
        <YearlyTransactionsWidget />
        <TopCustomersWidget limit={5} />
      </div>
    </div>
  );
}
