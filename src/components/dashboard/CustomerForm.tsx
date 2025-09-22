"use client";

import { useForm, Controller } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Mail, Phone, MapPin, CreditCard, Building2 } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/api";
import type {
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from "@/types/api/request";
import type {
  AllCustomer,
  DetailCustomer,
  Province,
  City,
} from "@/types/api/response";

interface CustomerFormData {
  name: string;
  identityNo: string;
  npwp: string;
  email: string;
  phone: string;
  mobilePhone: string;
  provinceCode?: string;
  cityCode?: string;
  address?: string;
  companyType?: string;
}

interface CustomerFormProps {
  mode: "create" | "update";
  customer?: DetailCustomer | AllCustomer;
  onSuccess?: () => void;
}

export function CustomerForm({ mode, customer, onSuccess }: CustomerFormProps) {
  const isCreateMode = mode === "create";
  const isUpdateMode = mode === "update";

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CustomerFormData>({
    defaultValues:
      isUpdateMode && customer
        ? {
            name: customer.name,
            identityNo: (customer as DetailCustomer).identityNo || "",
            npwp: (customer as DetailCustomer).npwp || "",
            email: (customer as DetailCustomer).email || "",
            phone: (customer as DetailCustomer).phone || "",
            mobilePhone: (customer as DetailCustomer).mobilePhone || "",
            provinceCode: "",
            cityCode: "",
            address: "",
            companyType: "",
          }
        : {
            name: "",
            identityNo: "",
            npwp: "",
            email: "",
            phone: "",
            mobilePhone: "",
            provinceCode: "",
            cityCode: "",
            address: "",
            companyType: isCreateMode ? "company" : "",
          },
  });

  const {
    data: provincesData,
    isLoading: provincesLoading,
    error: provincesError,
  } = useQuery({
    queryKey: ["provinces"],
    queryFn: () => apiClient.getProvinces(),
    retry: 2,
    enabled: isCreateMode,
  });

  const {
    data: citiesData,
    isLoading: citiesLoading,
    error: citiesError,
  } = useQuery({
    queryKey: ["cities"],
    queryFn: () => apiClient.getCities(),
    retry: 2,
    enabled: isCreateMode,
  });

  const createCustomerMutation = useMutation({
    mutationFn: (data: CreateCustomerRequest) => apiClient.createCustomer(data),
    onSuccess: () => {
      toast.success("Customer created successfully");
      onSuccess?.();
    },
    onError: (error: unknown) => {
      const apiError = error as { responseMessage?: string };
      toast.error(apiError.responseMessage || "Failed to create customer");
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: (data: UpdateCustomerRequest) =>
      apiClient.updateCustomer(customer!.code, data),
    onSuccess: () => {
      toast.success("Customer updated successfully");
      onSuccess?.();
    },
    onError: (error: unknown) => {
      const apiError = error as { responseMessage?: string };
      toast.error(apiError.responseMessage || "Failed to update customer");
    },
  });

  const onSubmit = (data: CustomerFormData) => {
    if (mode === "update") {
      const updateData: UpdateCustomerRequest = {
        name: data.name,
        identityNo: data.identityNo,
        npwp: data.npwp,
        email: data.email,
        phone: data.phone,
        mobile_phone: data.mobilePhone,
      };
      updateCustomerMutation.mutate(updateData);
    } else {
      const createData: CreateCustomerRequest = {
        name: data.name.toUpperCase(),
        identityNo: data.identityNo,
        npwp: data.npwp,
        email: data.email,
        phone: data.phone,
        mobile_phone: data.mobilePhone,
        provinceCode: data.provinceCode!,
        cityCode: data.cityCode!,
        address: data.address!,
        companyType: data.companyType!,
      };
      createCustomerMutation.mutate(createData);
    }
  };

  const isLoading =
    createCustomerMutation.isPending || updateCustomerMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              placeholder="Enter customer name"
              className="pl-10"
              {...register("name", {
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              })}
            />
          </div>
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        {isCreateMode && (
          <div className="space-y-2">
            <Label htmlFor="companyType">Company Type *</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
              <Controller
                name="companyType"
                control={control}
                rules={{
                  required: isCreateMode ? "Company type is required" : false,
                }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="pl-10 w-full">
                      <SelectValue placeholder="Select company type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="person">Person</SelectItem>
                      <SelectItem value="company">Company</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            {errors.companyType && (
              <p className="text-sm text-destructive">
                {errors.companyType.message}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              className="pl-10"
              {...register("email", {
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              placeholder="Enter phone number"
              className="pl-10"
              {...register("phone")}
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mobilePhone">Mobile Phone</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="mobilePhone"
            placeholder="Enter mobile phone number"
            className="pl-10"
            {...register("mobilePhone")}
          />
        </div>
        {errors.mobilePhone && (
          <p className="text-sm text-destructive">
            {errors.mobilePhone.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="identityNo">Identity Number</Label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="identityNo"
              placeholder="Enter identity number"
              className="pl-10"
              {...register("identityNo")}
            />
          </div>
          {errors.identityNo && (
            <p className="text-sm text-destructive">
              {errors.identityNo.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="npwp">NPWP</Label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="npwp"
              placeholder="Enter NPWP number"
              className="pl-10"
              {...register("npwp")}
            />
          </div>
          {errors.npwp && (
            <p className="text-sm text-destructive">{errors.npwp.message}</p>
          )}
        </div>
      </div>

      {isCreateMode && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="provinceCode">Province *</Label>
            <Controller
              name="provinceCode"
              control={control}
              rules={{
                required: isCreateMode ? "Province is required" : false,
              }}
              render={({ field }) => (
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
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
                    {provincesData?.items?.map((province: Province) => (
                      <SelectItem key={province.code} value={province.code}>
                        {province.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.provinceCode && (
              <p className="text-sm text-destructive">
                {errors.provinceCode.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cityCode">City *</Label>
            <Controller
              name="cityCode"
              control={control}
              rules={{
                required: isCreateMode ? "City is required" : false,
              }}
              render={({ field }) => (
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
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
                    {citiesData?.items?.map((city: City) => (
                      <SelectItem key={city.code} value={city.code}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.cityCode && (
              <p className="text-sm text-destructive">
                {errors.cityCode.message}
              </p>
            )}
          </div>
        </div>
      )}

      {isCreateMode && (
        <div className="space-y-2">
          <Label htmlFor="address">Address *</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Textarea
              id="address"
              placeholder="Enter customer address"
              className="pl-10 min-h-[80px]"
              {...register("address", {
                required: isCreateMode ? "Address is required" : false,
                minLength: {
                  value: 4,
                  message: "Address must be at least 4 characters",
                },
              })}
            />
          </div>
          {errors.address && (
            <p className="text-sm text-destructive">{errors.address.message}</p>
          )}
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Saving..."
            : isUpdateMode
            ? "Update Customer"
            : "Create Customer"}
        </Button>
      </div>
    </form>
  );
}
