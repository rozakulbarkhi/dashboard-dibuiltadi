import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TransactionBarChart from "./TransactionBarChart";
import { generateYearOptions } from "@/utils/generate-year";
import LoadingState from "./LoadingState";
import YearlyTransactionWidgetStats from "./YearlyTransactionWidgetStats";
import ErrorState from "./ErrorState";
import SelectDateState from "./SelectDateState";

import { formattedValue } from "@/utils/formatted-value";
import { apiClient } from "@/api";

import type { TransactionsWidgetProps } from "@/types/components";
import type {
  SalesResponse,
  YearlyTransactionsResponse,
} from "@/types/api/response";

export function YearlyTransactionsWidget({
  salesCode,
}: TransactionsWidgetProps) {
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedSales, setSelectedSales] = useState<string | undefined>(
    salesCode
  );

  const { data: salesData } = useQuery({
    queryKey: ["sales"],
    queryFn: () => apiClient.getSales(),
    retry: false,
  });

  const {
    data: yearlyTransactions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["yearly-transactions", selectedYear, selectedSales],
    queryFn: () =>
      apiClient.getYearlyTransactions(
        selectedYear!,
        selectedSales === "all" ? undefined : selectedSales
      ),
    retry: false,
    enabled: !!selectedYear,
  });

  const getChartData = () => {
    const response = yearlyTransactions as YearlyTransactionsResponse;
    return response
      ? [
          {
            name: response.previous.year.toString(),
            value: parseFloat(response.previous.amount),
          },
          {
            name: response.current.year.toString(),
            value: parseFloat(response.current.amount),
          },
        ]
      : [];
  };

  const response = yearlyTransactions as YearlyTransactionsResponse;
  const growthPercentage = parseFloat(response?.percentage || "0");

  const renderContent = () => {
    if (!selectedYear) {
      return (
        <SelectDateState text="Please select a year to view transactions" />
      );
    }

    if (isLoading) {
      return <LoadingState />;
    }

    if (error) {
      return <ErrorState />;
    }

    return (
      <>
        <TransactionBarChart data={getChartData()} />
        {response && <YearlyTransactionWidgetStats response={response} />}
      </>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-start">
          <div className="flex-1">
            <CardTitle>Yearly Transactions</CardTitle>
            {selectedYear && (
              <div className="flex flex-col gap-2 mt-1 sm:flex-row sm:items-center sm:gap-4">
                <p className="text-sm text-muted-foreground">
                  {response?.current.year}:{" "}
                  {formattedValue(parseFloat(response?.current.amount || "0"))}
                </p>
                <div className="flex items-center gap-1">
                  {growthPercentage >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      growthPercentage >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {response?.percentage}% vs previous year
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:flex-col xl:flex-row">
            <div className="w-full sm:w-auto">
              <Select
                value={selectedYear || ""}
                onValueChange={(year) => setSelectedYear(year)}
              >
                <SelectTrigger className="w-full sm:w-[140px] cursor-pointer">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {generateYearOptions().map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedYear && (
              <div className="w-full sm:w-auto">
                <Select
                  value={selectedSales || ""}
                  onValueChange={setSelectedSales}
                >
                  <SelectTrigger className="w-full sm:w-[180px] cursor-pointer">
                    <SelectValue placeholder="Select sales person" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sales</SelectItem>
                    {(salesData as SalesResponse)?.items?.map((sales) => (
                      <SelectItem key={sales.code} value={sales.code}>
                        {sales.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}
