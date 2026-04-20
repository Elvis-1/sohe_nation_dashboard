"use client";

import { DashboardAuthProvider } from "@/src/features/auth/presentation/state/dashboard-auth-provider";
import { ToastProvider } from "@/src/core/ui/toast";

export function DashboardProviders({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ToastProvider>
      <DashboardAuthProvider>{children}</DashboardAuthProvider>
    </ToastProvider>
  );
}
