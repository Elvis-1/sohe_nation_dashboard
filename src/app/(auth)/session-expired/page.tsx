import { SessionExpiredPageShell } from "@/src/features/auth/presentation/components/session-expired-page-shell";
import { AuthRouteGate } from "@/src/features/auth/presentation/components/auth-route-gate";

export default function SessionExpiredPage() {
  return (
    <AuthRouteGate>
      <SessionExpiredPageShell />
    </AuthRouteGate>
  );
}
