"use client";

import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Mail, Lock, Shield, Phone, IdCard } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useAuthStore } from "@/stores/auth-store";
import { apiClient } from "@/api";

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const { user } = useAuthStore();

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    watch,
    reset: resetPasswordForm,
  } = useForm<PasswordFormData>();

  const updatePasswordMutation = useMutation<
    { responseCode?: string; responseMessage?: string },
    { responseMessage?: string; message?: string },
    {
      currentPassword: string;
      newPassword: string;
      newPasswordConfirmation: string;
    }
  >({
    mutationFn: ({
      currentPassword,
      newPassword,
      newPasswordConfirmation,
    }: {
      currentPassword: string;
      newPassword: string;
      newPasswordConfirmation: string;
    }) =>
      apiClient.updatePassword(
        currentPassword,
        newPassword,
        newPasswordConfirmation
      ) as Promise<{ responseCode?: string; responseMessage?: string }>,
    onSuccess: () => {
      resetPasswordForm();
      toast.success("Your password has been updated");
    },
    onError: (error: { responseMessage?: string; message?: string }) => {
      console.log(error);
      toast.error(
        error.responseMessage || error.message || "Failed to update password"
      );
    },
  });

  const onPasswordSubmit = (data: PasswordFormData) => {
    updatePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      newPasswordConfirmation: data.confirmPassword,
    });
  };

  const newPassword = watch("newPassword");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Card className="py-6">
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="size-24 rounded-full overflow-hidden bg-primary flex items-center justify-center">
              {user?.profileImage ? (
                <img
                  src={user?.profileImage}
                  alt={`Profile image of ${user?.name}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl font-medium text-primary-foreground">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="space-y-2 flex flex-col">
              <h2 className="text-xl font-semibold">{user?.name}</h2>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-4" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="size-4" />
                <span>{user?.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <IdCard className="size-4" />
                <p className="text-sm text-muted-foreground">
                  {user?.roleName} ({user?.roleCode})
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handlePasswordSubmit(onPasswordSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Enter current password"
                    className="pl-10"
                    {...registerPassword("currentPassword", {
                      required: "Current password is required",
                    })}
                  />
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-sm text-destructive">
                    {passwordErrors.currentPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    className="pl-10"
                    {...registerPassword("newPassword", {
                      required: "New password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                  />
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-sm text-destructive">
                    {passwordErrors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    className="pl-10"
                    {...registerPassword("confirmPassword", {
                      required: "Please confirm your new password",
                      validate: (value) =>
                        value === newPassword || "Passwords do not match",
                    })}
                  />
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {passwordErrors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={updatePasswordMutation.isPending}
                >
                  <Shield className="mr-2 size-4" />
                  {updatePasswordMutation.isPending
                    ? "Updating..."
                    : "Update Password"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
