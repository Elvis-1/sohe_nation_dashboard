type AppStateMessageProps = {
  eyebrow: string;
  title: string;
  description: string;
  actionLabel?: string;
  action?: React.ReactNode;
  onAction?: () => void;
};

export function AppStateMessage({
  eyebrow,
  title,
  description,
  actionLabel,
  action,
  onAction,
}: AppStateMessageProps) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "32px",
      }}
    >
      <section
        style={{
          maxWidth: 560,
          width: "100%",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-card)",
          padding: "32px",
          background: "var(--color-surface)",
          boxShadow: "var(--shadow-soft)",
        }}
      >
        <p
          style={{
            marginBottom: 12,
            color: "var(--color-accent)",
            textTransform: "uppercase",
            letterSpacing: "0.22em",
            fontSize: 12,
            fontFamily: "var(--font-mono)",
          }}
        >
          {eyebrow}
        </p>
        <h1
          style={{
            marginBottom: 12,
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            lineHeight: 0.95,
            letterSpacing: "0.02em",
          }}
        >
          {title}
        </h1>
        <p
          style={{
            color: "var(--color-text-muted)",
            lineHeight: 1.6,
          }}
        >
          {description}
        </p>
        {action ? (
          <div
            style={{
              marginTop: 24,
              display: "inline-flex",
              borderRadius: "var(--radius-pill)",
              padding: "14px 18px",
              background: "var(--color-surface-inverse)",
              color: "var(--color-text-inverse)",
            }}
          >
            {action}
          </div>
        ) : null}
        {!action && actionLabel && onAction ? (
          <button
            onClick={onAction}
            style={{
              marginTop: 24,
              border: 0,
              borderRadius: "var(--radius-pill)",
              padding: "14px 18px",
              background: "var(--color-surface-inverse)",
              color: "var(--color-text-inverse)",
              cursor: "pointer",
            }}
            type="button"
          >
            {actionLabel}
          </button>
        ) : null}
      </section>
    </main>
  );
}
