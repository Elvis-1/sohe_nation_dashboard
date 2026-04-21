"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { AuthPageFrame } from "@/src/features/auth/presentation/components/auth-page-frame";
import { useDashboardAuth } from "@/src/features/auth/presentation/state/dashboard-auth-provider";

type InviteDetails = {
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  invited_by_email: string;
  expires_at: string;
};

const inputStyle = {
  border: "1px solid var(--color-border)",
  borderRadius: 16,
  padding: "14px 16px",
  background: "var(--color-surface)",
} as const;

export function AcceptInvitePageShell() {
  const router = useRouter();
  const params = useSearchParams();
  const { acceptInvite } = useDashboardAuth();
  const [isPending, startTransition] = useTransition();
  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const token = params.get("token") ?? "";

  useEffect(() => {
    let active = true;

    async function loadInvite() {
      if (!token) {
        if (active) {
          setErrorMessage("Invite token missing. Open the full link from your email.");
          setLoading(false);
        }
        return;
      }

      try {
        const response = await fetch(`/api/backend/auth/staff/invite/?token=${encodeURIComponent(token)}`);
        const payload = (await response.json().catch(() => null)) as
          | InviteDetails
          | { error?: { message?: string } }
          | null;

        if (!response.ok || !payload || "error" in payload) {
          if (active) {
            setInvite(null);
            setErrorMessage(
              payload && "error" in payload
                ? payload.error?.message ?? "This invite link is no longer valid."
                : "This invite link is no longer valid.",
            );
            setLoading(false);
          }
          return;
        }

        if (active) {
          setInvite(payload as InviteDetails);
          setErrorMessage(null);
          setLoading(false);
        }
      } catch {
        if (active) {
          setInvite(null);
          setErrorMessage("Unable to load this invite right now.");
          setLoading(false);
        }
      }
    }

    void loadInvite();

    return () => {
      active = false;
    };
  }, [token]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (!token) {
      setErrorMessage("Invite token missing. Open the full link from your email.");
      return;
    }
    if (password.length < 8) {
      setErrorMessage("Choose a password with at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      const result = await acceptInvite(token, password);
      if (!result.ok) {
        setErrorMessage(result.error ?? "Unable to accept this invite right now.");
        return;
      }
      router.replace("/");
    });
  }

  return (
    <AuthPageFrame
      eyebrow="Staff invite"
      title="Set your password and enter the desk."
      description="Use your invite link once, choose a secure password, and step straight into the protected operations desk."
    >
      {loading ? (
        <p style={{ color: "var(--color-text-muted)", lineHeight: 1.7 }}>Loading your invite…</p>
      ) : invite ? (
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <div
            style={{
              border: "1px solid var(--color-border)",
              borderRadius: 18,
              padding: "16px 18px",
              background: "rgba(234, 215, 177, 0.18)",
              lineHeight: 1.7,
            }}
          >
            <strong style={{ display: "block", marginBottom: 8 }}>
              {invite.first_name || invite.email}
            </strong>
            <div>{invite.email}</div>
            <div>Role: {invite.role}</div>
            {invite.invited_by_email ? <div>Invited by: {invite.invited_by_email}</div> : null}
          </div>
          <label style={{ display: "grid", gap: 8 }}>
            <span>Create password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              style={inputStyle}
            />
          </label>
          <label style={{ display: "grid", gap: 8 }}>
            <span>Confirm password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              style={inputStyle}
            />
          </label>
          {errorMessage ? (
            <p style={{ color: "var(--color-danger)", lineHeight: 1.5 }}>{errorMessage}</p>
          ) : null}
          <button
            type="submit"
            disabled={isPending}
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
              cursor: isPending ? "wait" : "pointer",
              opacity: isPending ? 0.75 : 1,
            }}
          >
            {isPending ? "Opening dashboard" : "Create password and continue"}
          </button>
        </form>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          <p style={{ color: "var(--color-text-muted)", lineHeight: 1.7 }}>
            {errorMessage ?? "This invite link is no longer valid."}
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
            Return to sign in
          </Link>
        </div>
      )}
    </AuthPageFrame>
  );
}
