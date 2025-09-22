import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CalendarIcon, Users } from "lucide-react";
import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import TopCustomerWidgetStats from "./TopCustomerWidgetStats";
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

import { cn } from "@/lib/utils";
import { apiClient } from "@/api";
import { formattedValue } from "@/utils/formatted-value";

import type { TopCustomersResponse } from "@/types/api/response";
import type { TopCustomersWidgetProps } from "@/types/components";

export function TopCustomersWidget({ limit = 5 }: TopCustomersWidgetProps) {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>(() => {
    return { from: undefined, to: undefined };
  });

  const [tempDate, setTempDate] = useState<Date | undefined>();
  const [selectedLimit, setSelectedLimit] = useState<string>(limit.toString());

  const formatDateForAPI = (date: Date) => {
    return format(date, "yyyy-MM-dd");
  };

  const {
    data: topCustomers,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["top-customers", dateRange, selectedLimit],
    queryFn: () =>
      apiClient.getTopCustomers(
        formatDateForAPI(dateRange.from!),
        formatDateForAPI(dateRange.to!),
        parseInt(selectedLimit)
      ),
    retry: false,
    enabled: !!(dateRange.from && dateRange.to),
  });

  const calculateTotalRevenue = () => {
    const response = topCustomers as TopCustomersResponse;
    const total =
      response?.items?.reduce((sum, item) => {
        return sum + parseFloat(item.amount);
      }, 0) || 0;
    return formattedValue(total);
  };

  const response = topCustomers as TopCustomersResponse;

  const renderContent = () => {
    if (!dateRange.from || !dateRange.to) {
      return (
        <SelectDateState text="Please select a date range to view top customers" />
      );
    }

    if (isLoading) {
      return <LoadingState />;
    }

    if (error) {
      return <ErrorState />;
    }

    return (
      <div className="space-y-3">
        {response?.items?.length > 0 ? (
          response.items.map((item, index) => (
            <TopCustomerWidgetStats
              item={item}
              index={index}
              key={item.customer.code || index}
            />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No customer data available for the selected period
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Customers
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Total Revenue: {calculateTotalRevenue()}
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
                <Select value={selectedLimit} onValueChange={setSelectedLimit}>
                  <SelectTrigger className="w-full sm:w-[120px]">
                    <SelectValue placeholder="Select limit" />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 20, 50].map((limit) => (
                      <SelectItem key={limit} value={limit.toString()}>
                        {limit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {renderContent()}
        {response?.items?.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Showing top {response.items.length} customers
              </span>
              <span className="font-medium">
                Total: {calculateTotalRevenue()}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
