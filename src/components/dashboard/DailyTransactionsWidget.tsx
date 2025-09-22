import { useQuery } from "@tanstack/react-query";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TransactionLineChart from "@/components/dashboard/TransactionLineCard";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";
import SelectDateState from "./SelectDateState";

import { cn } from "@/lib/utils";
import { apiClient } from "@/api";
import { formattedValue } from "@/utils/formatted-value";

import type {
  DailyTransactionsResponse,
  SalesResponse,
} from "@/types/api/response";
import type { TransactionsWidgetProps } from "@/types/components";

export function DailyTransactionsWidget({
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

  const formatDateForAPI = (date: Date) => {
    return format(date, "yyyy-MM-dd");
  };

  const { data: salesData } = useQuery({
    queryKey: ["sales"],
    queryFn: () => apiClient.getSales(),
    retry: false,
  });

  const {
    data: dailyTransactions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["daily-transactions", dateRange, selectedSales],
    queryFn: () =>
      apiClient.getDailyTransactions(
        formatDateForAPI(dateRange.from!),
        formatDateForAPI(dateRange.to!),
        selectedSales === "all" ? undefined : selectedSales
      ),
    retry: false,
    enabled: !!(dateRange.from && dateRange.to),
  });

  const getChartData = () => {
    const response = dailyTransactions as DailyTransactionsResponse;
    return (
      response?.items?.map((item) => ({
        name: item.date,
        value: parseFloat(item.amount),
      })) || []
    );
  };

  const calculateTotal = () => {
    const response = dailyTransactions as DailyTransactionsResponse;
    const total =
      response?.items?.reduce((sum, item) => {
        return sum + parseFloat(item.amount);
      }, 0) || 0;
    return formattedValue(total);
  };

  const renderContent = () => {
    if (!dateRange.from || !dateRange.to) {
      return (
        <SelectDateState text="Please select a date range to view transactions" />
      );
    }

    if (isLoading) {
      return <LoadingState />;
    }

    if (error) {
      return <ErrorState />;
    }

    return <TransactionLineChart data={getChartData()} />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <div className="flex-1">
            <CardTitle>Daily Transactions</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Total: {dateRange.from && dateRange.to ? calculateTotal() : "-"}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
                    <CalendarIcon className="mr-2 size-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "MMM dd")} -{" "}
                          {format(dateRange.to, "MMM dd, y")}
                        </>
                      ) : (
                        <>
                          {format(dateRange.from, "MMM dd, y")} -{" "}
                          <span className="text-muted-foreground text-sm">
                            End date
                          </span>
                        </>
                      )
                    ) : (
                      <span>Pick start date</span>
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
                  <SelectTrigger className="w-full sm:w-[180px]">
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
