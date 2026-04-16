import { SignInPageShell } from "@/src/features/auth/presentation/components/sign-in-page-shell";
import { AuthRouteGate } from "@/src/features/auth/presentation/components/auth-route-gate";

export default function SignInPage() {
  return (
    <AuthRouteGate>
      <SignInPageShell />
    </AuthRouteGate>
  );
}
