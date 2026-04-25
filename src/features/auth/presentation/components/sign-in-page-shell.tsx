"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthPageFrame } from "@/src/features/auth/presentation/components/auth-page-frame";
import { useDashboardAuth } from "@/src/features/auth/presentation/state/dashboard-auth-provider";

export function SignInPageShell() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { isAuthenticated, isReady, signIn } = useDashboardAuth();
  const [hasMounted, setHasMounted] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setHasMounted(true);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (hasMounted && isAuthenticated) {
      router.replace("/");
    }
  }, [hasMounted, isAuthenticated, router]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const result = await signIn(email, password);

      if (!result.ok) {
        setErrorMessage(result.error ?? "Unable to enter the dashboard right now.");
        return;
      }

      router.replace("/");
    });
  }

  return (
    <AuthPageFrame
      eyebrow="Staff Access"
      title="Run the line from one desk."
      description="Products, orders, editorial drops, customer returns, and daily operating signals all move through the protected operations desk."
    >
      <div style={{ marginBottom: 24 }}>
        <p
          style={{
            color: "var(--color-accent)",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
          }}
        >
          Backend auth
        </p>
        <h2 style={{ marginTop: 8, fontSize: 28 }}>Enter the dashboard</h2>
        <p style={{ marginTop: 10, color: "var(--color-text-muted)", lineHeight: 1.6 }}>
          Sign in against the backend staff auth layer to open the protected operations desk.
        </p>
      </div>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
        <label style={{ display: "grid", gap: 8 }}>
          <span>Email or username</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            style={{
              border: "1px solid var(--color-border)",
              borderRadius: 16,
              padding: "14px 16px",
              background: "var(--color-surface)",
            }}
          />
        </label>
        <label style={{ display: "grid", gap: 8 }}>
          <span>Password</span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            style={{
              border: "1px solid var(--color-border)",
              borderRadius: 16,
              padding: "14px 16px",
              background: "var(--color-surface)",
            }}
          />
        </label>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            marginTop: 8,
            flexWrap: "wrap",
          }}
        >
          <span style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
            {hasMounted && isReady ? "Access gate ready" : "Restoring session"}
          </span>
        </div>
        {errorMessage ? (
          <p
            style={{
              color: "var(--color-danger)",
              lineHeight: 1.5,
            }}
          >
            {errorMessage}
          </p>
        ) : null}
        <button
          disabled={isPending || !hasMounted || !isReady}
          type="submit"
          style={{
            marginTop: 8,
            display: "inline-flex",
            justifyContent: "center",
            border: 0,
            borderRadius: "var(--radius-pill)",
            padding: "16px 18px",
            background: "var(--color-surface-inverse)",
            color: "var(--color-text-inverse)",
            fontWeight: 600,
            cursor: isPending || !hasMounted || !isReady ? "wait" : "pointer",
            opacity: isPending || !hasMounted || !isReady ? 0.75 : 1,
          }}
        >
          {isPending ? "Opening dashboard" : "Continue to dashboard"}
        </button>
        <Link
          href="/forgot-password"
          style={{
            color: "var(--color-text-muted)",
            fontSize: 14,
            textDecoration: "underline",
            textUnderlineOffset: 4,
          }}
        >
          Forgot password?
        </Link>
      </form>
    </AuthPageFrame>
  );
}
