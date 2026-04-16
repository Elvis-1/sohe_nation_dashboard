import { DashboardAccessGate } from "@/src/features/auth/presentation/components/dashboard-access-gate";
import { DashboardShell } from "@/src/core/ui/dashboard-shell";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DashboardAccessGate>
      <DashboardShell>{children}</DashboardShell>
    </DashboardAccessGate>
  );
}
