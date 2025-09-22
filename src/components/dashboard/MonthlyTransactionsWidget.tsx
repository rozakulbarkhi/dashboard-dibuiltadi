import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CalendarIcon, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import TransactionBarChart from "./TransactionBarChart";
import MonthlyTransactionStats from "./MonthlyTransactionWidgetStats";
import SelectDateState from "./SelectDateState";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { apiClient } from "@/api";
import { cn } from "@/lib/utils";
import { formattedValue } from "@/utils/formatted-value";

import type {
  MonthlyTransactionsResponse,
  SalesResponse,
} from "@/types/api/response";
import type { TransactionsWidgetProps } from "@/types/components";

export function MonthlyTransactionsWidget({
  salesCode,
}: TransactionsWidgetProps) {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>(() => {
    return { from: undefined, to: undefined };
  });

  const [tempDate, setTempDate] = useState<Date | undefined>();
  const [selectedSales, setSelectedSales] = useState<string | undefined>(
    salesCode
  );

  const { data: salesData } = useQuery({
    queryKey: ["sales"],
    queryFn: () => apiClient.getSales(),
    retry: false,
  });

  const formatMonthForAPI = (date: Date) => {
    return format(date, "yyyy-MM");
  };

  const {
    data: monthlyTransactions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["monthly-transactions", dateRange, selectedSales],
    queryFn: () =>
      apiClient.getMonthlyTransactions(
        formatMonthForAPI(dateRange.from!),
        formatMonthForAPI(dateRange.to!),
        selectedSales === "all" ? undefined : selectedSales
      ),
    retry: false,
    enabled: !!(dateRange.from && dateRange.to),
  });

  const getChartData = () => {
    const response = monthlyTransactions as MonthlyTransactionsResponse;
    return (
      response?.items?.map((item) => ({
        name: item.month,
        value: parseFloat(item.current),
      })) || []
    );
  };

  const calculateTotal = () => {
    const response = monthlyTransactions as MonthlyTransactionsResponse;
    const total =
      response?.items?.reduce((sum, item) => {
        return sum + parseFloat(item.current);
      }, 0) || 0;
    return formattedValue(total);
  };

  const calculateAverageGrowth = () => {
    const response = monthlyTransactions as MonthlyTransactionsResponse;
    if (!response?.items?.length) return "0";

    const totalGrowth = response.items.reduce((sum, item) => {
      return sum + parseFloat(item.growth);
    }, 0);

    return (totalGrowth / response.items.length).toFixed(2);
  };

  const renderContent = () => {
    if (!dateRange.from || !dateRange.to) {
      return (
        <SelectDateState text="Please select a month range to view transactions" />
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
        <div className="mt-4 space-y-2">
          {(monthlyTransactions as MonthlyTransactionsResponse)?.items
            ?.slice(0, 3)
            .map((item, index) => (
              <MonthlyTransactionStats key={index} item={item} />
            ))}
        </div>
      </>
    );
  };

  const averageGrowth = parseFloat(calculateAverageGrowth());

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-start">
          <div className="flex-1">
            <CardTitle>Monthly Transactions</CardTitle>
            <div className="flex flex-col gap-2 mt-1 sm:flex-row sm:items-center sm:gap-4">
              <p className="text-sm text-muted-foreground">
                Total: {dateRange.from && dateRange.to ? calculateTotal() : "-"}
              </p>
              <div className="flex items-center gap-1">
                {dateRange.from && dateRange.to && (
                  <>
                    {averageGrowth >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        averageGrowth >= 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {averageGrowth}% avg growth
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:flex-col xl:flex-row">
            <div className="w-full sm:w-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full sm:w-auto justify-start text-left font-normal cursor-pointer",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "MMM yyyy")} -{" "}
                          {format(dateRange.to, "MMM yyyy")}
                        </>
                      ) : (
                        <>
                          {format(dateRange.from, "MMM yyyy")} -{" "}
                          <span className="text-muted-foreground">
                            Select end month
                          </span>
                        </>
                      )
                    ) : (
                      <span>Pick start month</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    autoFocus
                    mode="single"
                    defaultMonth={tempDate || new Date()}
                    selected={tempDate}
                    onSelect={(date) => {
                      if (date) {
                        setTempDate(date);
                        if (!dateRange.from) {
                          setDateRange({ from: date, to: undefined });
                        } else if (!dateRange.to) {
                          if (date >= dateRange.from) {
                            setDateRange({ from: dateRange.from, to: date });
                          } else {
                            setDateRange({ from: date, to: dateRange.from });
                          }
                          setTempDate(undefined);
                        } else {
                          setDateRange({ from: date, to: undefined });
                        }
                      }
                    }}
                    numberOfMonths={window.innerWidth < 640 ? 1 : 2}
                  />
                </PopoverContent>
              </Popover>
            </div>
            {dateRange.from && dateRange.to && (
              <div className="w-full sm:w-auto">
                <Select value={selectedSales} onValueChange={setSelectedSales}>
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
