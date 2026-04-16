import { ForgotPasswordPageShell } from "@/src/features/auth/presentation/components/forgot-password-page-shell";
import { AuthRouteGate } from "@/src/features/auth/presentation/components/auth-route-gate";

export default function ForgotPasswordPage() {
  return (
    <AuthRouteGate>
      <ForgotPasswordPageShell />
    </AuthRouteGate>
  );
}
