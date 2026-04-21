import Link from "next/link";
import { DASHBOARD_DEMO_CREDENTIALS } from "@/src/features/auth/data/mock-staff-auth-repository";
import { AuthPageFrame } from "@/src/features/auth/presentation/components/auth-page-frame";

export function ForgotPasswordPageShell() {
  return (
    <AuthPageFrame
      eyebrow="Staff recovery"
      title="Reset flow placeholder for dashboard access."
      description="This placeholder marks the location for future password recovery once live staff authentication is wired."
    >
      <div style={{ display: "grid", gap: 16 }}>
        <p style={{ color: "var(--color-text-muted)", lineHeight: 1.7 }}>
          Staff invite acceptance now happens through the secure email link sent from the team desk.
          A full self-service forgot-password reset flow is still pending, so existing staff should
          contact the owner if they can no longer access the dashboard.
        </p>
        <div
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: 18,
            padding: "16px 18px",
            background: "rgba(234, 215, 177, 0.24)",
            lineHeight: 1.7,
          }}
        >
          Demo access:
          <br />
          <strong>{DASHBOARD_DEMO_CREDENTIALS.email}</strong>
          <br />
          <strong>{DASHBOARD_DEMO_CREDENTIALS.password}</strong>
        </div>
        <Link
          href="/signin"
          style={{
            display: "inline-flex",
            justifyContent: "center",
            borderRadius: "var(--radius-pill)",
            padding: "16px 18px",
            background: "var(--color-surface-inverse)",
            color: "var(--color-text-inverse)",
            fontWeight: 600,
          }}
        >
          Return to sign in
        </Link>
      </div>
    </AuthPageFrame>
  );
}
