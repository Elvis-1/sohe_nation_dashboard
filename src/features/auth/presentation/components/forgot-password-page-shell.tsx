"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { AuthPageFrame } from "@/src/features/auth/presentation/components/auth-page-frame";

export function ForgotPasswordPageShell() {
  const [identifier, setIdentifier] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedbackMessage(null);
    setErrorMessage(null);

    startTransition(async () => {
      const response = await fetch("/api/backend/auth/staff/password-reset/request/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { message?: string; error?: { message?: string } }
        | null;

      if (!response.ok) {
        setErrorMessage(
          payload?.error?.message ?? "Unable to request a reset link right now.",
        );
        return;
      }

      setFeedbackMessage(
        payload?.message ??
          "If a staff account exists for this identifier, a secure reset link has been sent.",
      );
      setIdentifier("");
    });
  }

  return (
    <AuthPageFrame
      eyebrow="Staff recovery"
      title="Request a secure dashboard reset link."
      description="Enter your staff email or username. If an account exists, we'll email a one-time reset link."
    >
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
        <label style={{ display: "grid", gap: 8 }}>
          <span>Email or username</span>
          <input
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            required
            style={{
              border: "1px solid var(--color-border)",
              borderRadius: 16,
              padding: "14px 16px",
              background: "var(--color-surface)",
            }}
          />
        </label>
        {feedbackMessage ? (
          <p style={{ color: "var(--color-text-muted)", lineHeight: 1.6 }}>{feedbackMessage}</p>
        ) : null}
        {errorMessage ? (
          <p style={{ color: "var(--color-danger)", lineHeight: 1.6 }}>{errorMessage}</p>
        ) : null}
        <button
          type="submit"
          disabled={isPending}
          style={{
            display: "inline-flex",
            justifyContent: "center",
            border: 0,
            borderRadius: "var(--radius-pill)",
            padding: "16px 18px",
            background: "var(--color-surface-inverse)",
            color: "var(--color-text-inverse)",
            fontWeight: 600,
            cursor: isPending ? "wait" : "pointer",
            opacity: isPending ? 0.75 : 1,
          }}
        >
          {isPending ? "Sending reset link" : "Send reset link"}
        </button>
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
      </form>
    </AuthPageFrame>
  );
}
