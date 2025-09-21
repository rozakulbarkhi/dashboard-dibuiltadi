import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Eye, EyeClosed } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { ApiError } from "@/types/api";
import type { LoginResponse } from "@/types/api/response";

import { apiClient } from "@/api";
import { useAuthStore } from "@/stores/auth-store";
import { loginSchema, type LoginFormData } from "@/schemas/auth";
import AuthLayout from "@/layouts/AuthLayout";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation<LoginResponse, ApiError, LoginFormData>({
    mutationFn: (data: LoginFormData) => apiClient.login(data),
    onSuccess: (response: LoginResponse) => {
      login(response);
      toast.success("Login successful!");
      navigate("/dashboard");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Login failed. Please try again.");
    },
    onSettled: () => {
      reset();
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account to continue"
      footerText={`${new Date().getFullYear()} © Rozakul Barkhi's Assignment. All rights reserved.`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label
            htmlFor="phone"
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Phone Number
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="Enter your phone number"
            className="h-11 border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
            {...register("phone")}
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="h-11 pr-10 border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              {...register("password")}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <Eye size={20} /> : <EyeClosed size={20} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
          disabled={isSubmitting || loginMutation.isPending}
        >
          {isSubmitting || loginMutation.isPending
            ? "Signing in..."
            : "Sign In"}
        </Button>
      </form>

      <div className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
        Don't have an account?{" "}
        <Link
          to="/auth/register"
          className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          Create one here
        </Link>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
