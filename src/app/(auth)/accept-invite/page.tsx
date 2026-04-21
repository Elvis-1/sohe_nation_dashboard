import { AcceptInvitePageShell } from "@/src/features/auth/presentation/components/accept-invite-page-shell";
import { AuthRouteGate } from "@/src/features/auth/presentation/components/auth-route-gate";

export default function AcceptInvitePage() {
  return (
    <AuthRouteGate>
      <AcceptInvitePageShell />
    </AuthRouteGate>
  );
}
