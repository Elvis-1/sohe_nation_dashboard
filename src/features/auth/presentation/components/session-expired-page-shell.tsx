import Link from "next/link";
import { AuthPageFrame } from "@/src/features/auth/presentation/components/auth-page-frame";

export function SessionExpiredPageShell() {
  return (
    <AuthPageFrame
      eyebrow="Session expired"
      title="The control desk timed out."
      description="The dashboard session has expired, so the workspace is paused until staff sign in again."
    >
      <div style={{ display: "grid", gap: 16 }}>
        <p style={{ color: "var(--color-text-muted)", lineHeight: 1.7 }}>
          Protected dashboard routes failed safely and routed you back through the secure sign-in flow.
        </p>
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
          Sign in again
        </Link>
      </div>
    </AuthPageFrame>
  );
}
