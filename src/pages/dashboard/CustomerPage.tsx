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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Edit, Eye, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/api";
import { CustomerForm } from "@/components/dashboard/CustomerForm";
import type { AllCustomerRequest } from "@/types/api/request";
import type { AllCustomer, Province, City } from "@/types/api/response";

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<AllCustomer | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState<AllCustomer | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedProvince, setSelectedProvince] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
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
  const queryClient = useQueryClient();

  const {
    data: provincesData,
    isLoading: provincesLoading,
    error: provincesError,
  } = useQuery({
    queryKey: ["provinces"],
    queryFn: () => apiClient.getProvinces(),
    retry: 2,
  });

  const {
    data: citiesData,
    isLoading: citiesLoading,
    error: citiesError,
  } = useQuery({
    queryKey: ["cities"],
    queryFn: () => apiClient.getCities(),
    retry: 2,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedProvince, selectedCity, dateRange]);

  const formatDateForAPI = (date: Date) => {
    return format(date, "yyyy-MM-dd");
  };

  const customerParams: AllCustomerRequest = useMemo(
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
      ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
      ...(selectedProvince !== "all" && { provinceCode: selectedProvince }),
      ...(selectedCity !== "all" && { cityCode: selectedCity }),
    }),
    [
      currentPage,
      perPage,
      sortBy,
      sortDirection,
      debouncedSearchTerm,
      selectedProvince,
      selectedCity,
      dateRange,
    ]
  );

  const {
    data: customersResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["customers", customerParams],
    queryFn: () => apiClient.getAllCustomers(customerParams),
    retry: false,
  });

  const customers = customersResponse?.items || [];

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
          <p className="text-destructive mb-2">Failed to load customers</p>
          <Button
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: ["customers", customerParams],
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
          <h1 className="text-2xl sm:text-3xl font-bold">All Customers</h1>
          <p className="text-muted-foreground">Manage your customer database</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Add Customer</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <CustomerForm
              mode="create"
              onSuccess={() => {
                setIsAddDialogOpen(false);
                queryClient.invalidateQueries({
                  queryKey: ["customers", customerParams],
                });
                queryClient.refetchQueries({
                  queryKey: ["customers", customerParams],
                });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filter Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2 grid-cols-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={selectedProvince}
              onValueChange={setSelectedProvince}
              disabled={provincesLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    provincesLoading
                      ? "Loading provinces..."
                      : provincesError
                      ? "Error loading provinces"
                      : "Select Province"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Provinces</SelectItem>
                {provincesData?.items?.map((province: Province) => (
                  <SelectItem key={province.code} value={province.code}>
                    {province.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedCity}
              onValueChange={setSelectedCity}
              disabled={citiesLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    citiesLoading
                      ? "Loading cities..."
                      : citiesError
                      ? "Error loading cities"
                      : "Select City"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {citiesData?.items?.map((city: City) => (
                  <SelectItem key={city.code} value={city.code}>
                    {city.name}
                  </SelectItem>
                ))}
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
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="created_at">Created Date</SelectItem>
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
            <CardTitle>Customers ({customers.length})</CardTitle>
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
                disabled={customers.length < perPage}
              >
                Next
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customers.map((customer) => (
              <div
                key={customer.code}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg space-y-3 sm:space-y-0"
              >
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-primary-foreground">
                      {customer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium truncate">{customer.name}</p>
                      <Badge variant="secondary" className="text-xs">
                        {customer.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {customer.companyType}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {customer.address}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {customer.province}, {customer.city}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end space-x-2 w-full sm:w-auto">
                  <div className="text-left sm:text-right">
                    <p className="text-lg font-semibold">
                      {customer.achievement || "0"}
                    </p>
                    <p className="text-xs text-muted-foreground">Achievement</p>
                  </div>
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewingCustomer(customer)}
                          className="flex-1 sm:flex-none"
                        >
                          <Eye className="h-4 w-4 sm:mr-0" />
                          <span className="ml-2 sm:hidden">View</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
                        <DialogHeader>
                          <DialogTitle>Customer Details</DialogTitle>
                        </DialogHeader>
                        {viewingCustomer && (
                          <div className="space-y-6">
                            <div className="flex items-center space-x-4">
                              <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
                                <span className="text-xl font-medium text-primary-foreground">
                                  {viewingCustomer.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <h3 className="text-xl font-semibold">
                                  {viewingCustomer.name}
                                </h3>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge variant="secondary">
                                    {viewingCustomer.type}
                                  </Badge>
                                  <Badge variant="outline">
                                    {viewingCustomer.companyType}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <h4 className="font-medium text-sm text-muted-foreground">
                                  CUSTOMER CODE
                                </h4>
                                <p className="font-mono text-sm">
                                  {viewingCustomer.code}
                                </p>
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-medium text-sm text-muted-foreground">
                                  ACHIEVEMENT
                                </h4>
                                <p className="text-lg font-semibold">
                                  {viewingCustomer.achievement || "0"}%
                                </p>
                              </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <h4 className="font-medium text-sm text-muted-foreground">
                                  AREA
                                </h4>
                                <p>{viewingCustomer.area}</p>
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-medium text-sm text-muted-foreground">
                                  TARGET
                                </h4>
                                <p className="text-lg font-semibold">
                                  {viewingCustomer.target}
                                </p>
                              </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <h4 className="font-medium text-sm text-muted-foreground">
                                  PERCENTAGE
                                </h4>
                                <p className="font-semibold">
                                  {viewingCustomer.percentage}%
                                </p>
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-medium text-sm text-muted-foreground">
                                  STATUS
                                </h4>
                                <p>{viewingCustomer.status || "Not set"}</p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-medium text-sm text-muted-foreground">
                                ADDRESS
                              </h4>
                              <p>{viewingCustomer.address}</p>
                              <p className="text-sm text-muted-foreground">
                                {viewingCustomer.province},{" "}
                                {viewingCustomer.city}
                              </p>
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-medium text-sm text-muted-foreground">
                                CREATED DATE
                              </h4>
                              <p className="text-sm">
                                {viewingCustomer.createdAt
                                  ? new Date(
                                      viewingCustomer.createdAt
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "Not available"}
                              </p>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                              <Button
                                variant="outline"
                                onClick={() => setViewingCustomer(null)}
                              >
                                Close
                              </Button>
                              <Button
                                onClick={() => {
                                  if (viewingCustomer) {
                                    setEditingCustomer(viewingCustomer);
                                    setViewingCustomer(null);
                                    setIsEditDialogOpen(true);
                                  }
                                }}
                              >
                                Edit Customer
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Dialog
                      open={isEditDialogOpen}
                      onOpenChange={setIsEditDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingCustomer(customer);
                            setIsEditDialogOpen(true);
                          }}
                          className="flex-1 sm:flex-none"
                        >
                          <Edit className="h-4 w-4 sm:mr-0" />
                          <span className="ml-2 sm:hidden">Edit</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
                        <DialogHeader>
                          <DialogTitle>Edit Customer</DialogTitle>
                        </DialogHeader>
                        <CustomerForm
                          mode="update"
                          customer={editingCustomer || undefined}
                          onSuccess={() => {
                            setEditingCustomer(null);
                            setIsEditDialogOpen(false);
                            queryClient.invalidateQueries({
                              queryKey: ["customers", customerParams],
                            });
                            queryClient.refetchQueries({
                              queryKey: ["customers", customerParams],
                            });
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
