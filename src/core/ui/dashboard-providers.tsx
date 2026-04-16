"use client";

import { DashboardAuthProvider } from "@/src/features/auth/presentation/state/dashboard-auth-provider";

export function DashboardProviders({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardAuthProvider>{children}</DashboardAuthProvider>;
}
