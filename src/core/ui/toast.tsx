"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type ToastKind = "success" | "error";

type Toast = {
  id: number;
  kind: ToastKind;
  message: string;
};

type ToastContextValue = {
  success: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (kind: ToastKind, message: string) => {
      const id = ++counter.current;
      setToasts((prev) => [...prev, { id, kind, message }]);
      setTimeout(() => dismiss(id), 4500);
    },
    [dismiss],
  );

  const success = useCallback((message: string) => push("success", message), [push]);
  const error = useCallback((message: string) => push("error", message), [push]);

  return (
    <ToastContext.Provider value={{ success, error }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        style={{
          position: "fixed",
          top: 24,
          right: 24,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          maxWidth: 380,
          width: "calc(100vw - 48px)",
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
              padding: "14px 16px",
              borderRadius: 20,
              border: `1px solid ${toast.kind === "success" ? "rgba(47,125,50,0.25)" : "rgba(201,71,54,0.25)"}`,
              background: toast.kind === "success" ? "rgba(237,247,237,0.97)" : "rgba(253,237,236,0.97)",
              boxShadow: "0 4px 24px rgba(21,17,13,0.12)",
              backdropFilter: "blur(12px)",
              pointerEvents: "auto",
              animation: "toast-in 200ms ease",
            }}
          >
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span
                style={{
                  fontSize: 16,
                  lineHeight: 1,
                  marginTop: 1,
                  color: toast.kind === "success" ? "#2f7d32" : "#c94736",
                }}
              >
                {toast.kind === "success" ? "✓" : "✕"}
              </span>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: toast.kind === "success" ? "#1b4f1c" : "#7a1c13",
                  fontWeight: 500,
                }}
              >
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss"
              style={{
                flexShrink: 0,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                color: toast.kind === "success" ? "#2f7d32" : "#c94736",
                fontSize: 16,
                lineHeight: 1,
                opacity: 0.6,
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
