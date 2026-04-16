import Link from "next/link";
import { AuthPageFrame } from "@/src/features/auth/presentation/components/auth-page-frame";

export function SessionExpiredPageShell() {
  return (
    <AuthPageFrame
      eyebrow="Session expired"
      title="The control desk timed out."
      description="The mocked dashboard session has expired, so the workspace is paused until staff sign in again."
    >
      <div style={{ display: "grid", gap: 16 }}>
        <p style={{ color: "var(--color-text-muted)", lineHeight: 1.7 }}>
          This mirrors the handoff we will need once real staff auth is live: protected
          dashboard routes should fail safely and route back through a clear re-entry screen.
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
