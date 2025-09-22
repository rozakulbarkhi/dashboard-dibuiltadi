"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Search, CalendarIcon, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/api";
import type { GetAllTransactions } from "@/types/api/request";
import type {
  Transaction,
  SalesResponse,
  ListCustomerResponse,
  ListCustomer,
} from "@/types/api/response";
import type { SalesItem } from "@/types/api";
import TransactionDetailModal from "@/components/dashboard/TransactionDetailModal";
import { formattedValue } from "@/utils/formatted-value";

export default function TransactionsPage() {
  const [referenceNo, setReferenceNo] = useState("");
  const [debouncedReferenceNo, setDebouncedReferenceNo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedCustomer, setSelectedCustomer] = useState<string>("all");
  const [selectedSales, setSelectedSales] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    return { from: thirtyDaysAgo, to: today };
  });
  const [tempDate, setTempDate] = useState<Date | undefined>();
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [selectedTransactionRef, setSelectedTransactionRef] = useState<
    string | null
  >(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: salesData,
    isLoading: salesLoading,
    error: salesError,
  } = useQuery({
    queryKey: ["sales"],
    queryFn: () => apiClient.getSales(),
    retry: 2,
  });

  const {
    data: customersData,
    isLoading: customersLoading,
    error: customersError,
  } = useQuery({
    queryKey: ["customers-list"],
    queryFn: () => apiClient.getListCustomer(),
    retry: 2,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedReferenceNo(referenceNo);
    }, 500);

    return () => clearTimeout(timer);
  }, [referenceNo]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedReferenceNo, selectedCustomer, selectedSales, dateRange]);

  const formatDateForAPI = (date: Date) => {
    return format(date, "yyyy-MM-dd");
  };

  const transactionParams: GetAllTransactions = useMemo(
    () => ({
      page: currentPage,
      perPage,
      sortBy,
      sortDirection,
      startDate: dateRange.from
        ? formatDateForAPI(dateRange.from)
        : "2020-01-01",
      endDate: dateRange.to
        ? formatDateForAPI(dateRange.to)
        : new Date().toISOString().split("T")[0],
      ...(debouncedReferenceNo && { search: debouncedReferenceNo }),
      ...(selectedCustomer !== "all" && { customerCode: selectedCustomer }),
      ...(selectedSales !== "all" && { salesCode: selectedSales }),
    }),
    [
      currentPage,
      perPage,
      sortBy,
      sortDirection,
      debouncedReferenceNo,
      selectedCustomer,
      selectedSales,
      dateRange,
    ]
  );

  const {
    data: transactionsResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["transactions", transactionParams],
    queryFn: () => apiClient.getTransactions(transactionParams),
    retry: false,
  });

  const transactions = transactionsResponse?.items || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load transactions</p>
          <Button
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: ["transactions", transactionParams],
              })
            }
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">All Transactions</h1>
          <p className="text-muted-foreground">
            Manage and view all your transactions
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filter Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2 grid-cols-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pencarian reference no..."
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={selectedCustomer}
              onValueChange={setSelectedCustomer}
              disabled={customersLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    customersLoading
                      ? "Loading customers..."
                      : customersError
                      ? "Error loading customers"
                      : "Select Customer"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                {(customersData as ListCustomerResponse)?.items?.map(
                  (customer: ListCustomer) => (
                    <SelectItem key={customer.code} value={customer.code}>
                      {customer.name}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            <Select
              value={selectedSales}
              onValueChange={setSelectedSales}
              disabled={salesLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    salesLoading
                      ? "Loading sales..."
                      : salesError
                      ? "Error loading sales"
                      : "Select Sales"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sales</SelectItem>
                {(salesData as SalesResponse)?.items?.map(
                  (sales: SalesItem) => (
                    <SelectItem key={sales.code} value={sales.code}>
                      {sales.name}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            <div>
              <Popover
                open={isDatePopoverOpen}
                onOpenChange={setIsDatePopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
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
                      <span>Pick date range</span>
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
                          setIsDatePopoverOpen(false);
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
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Created At</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortDirection} onValueChange={setSortDirection}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sort direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={perPage.toString()}
              onValueChange={(value) => setPerPage(Number(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="75">75 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Transactions ({transactions.length})</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={transactions.length < perPage}
              >
                Next
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction: Transaction) => (
              <div
                key={transaction.referenceNo}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg space-y-3 sm:space-y-0"
              >
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-primary-foreground">
                      {transaction.customer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium truncate">
                        {transaction.customer.name}
                      </p>
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        Active
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      Transaction for {transaction.customer.name}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>Ref: {transaction.referenceNo}</span>
                      <span>•</span>
                      <span>Sales: {transaction.sales}</span>
                      <span>•</span>
                      <span>
                        {format(
                          new Date(transaction.dateOrder),
                          "MMM dd, yyyy"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end space-x-4 w-full sm:w-auto">
                  <div className="text-left sm:text-right">
                    <p className="text-lg font-semibold">
                      {formattedValue(Number(transaction.amountTotal))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.customer.code}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-none"
                    onClick={() => {
                      setSelectedTransactionRef(transaction.referenceNo);
                      setIsDetailModalOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4 sm:mr-0" />
                    <span className="ml-2 sm:hidden">View</span>
                  </Button>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No transactions found for the selected criteria
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <TransactionDetailModal
        referenceNo={selectedTransactionRef}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTransactionRef(null);
        }}
      />
    </div>
  );
}
