import Link from "next/link";

type EmptyStatePanelProps = {
  eyebrow: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

export function EmptyStatePanel({
  eyebrow,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStatePanelProps) {
  return (
    <section
      style={{
        border: "1px dashed var(--color-border-strong)",
        borderRadius: 28,
        padding: "28px",
        background:
          "linear-gradient(180deg, rgba(255, 253, 248, 0.92), rgba(234, 215, 177, 0.22))",
      }}
    >
      <p
        style={{
          marginBottom: 10,
          color: "var(--color-accent)",
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          fontSize: 12,
          fontFamily: "var(--font-mono)",
        }}
      >
        {eyebrow}
      </p>
      <h2
        style={{
          marginBottom: 10,
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(2rem, 4vw, 3rem)",
          lineHeight: 0.94,
        }}
      >
        {title}
      </h2>
      <p style={{ maxWidth: 560, color: "var(--color-text-muted)", lineHeight: 1.7 }}>
        {description}
      </p>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          style={{
            marginTop: 18,
            display: "inline-flex",
            alignItems: "center",
            borderRadius: "var(--radius-pill)",
            padding: "12px 16px",
            background: "var(--color-surface-inverse)",
            color: "var(--color-text-inverse)",
            fontWeight: 600,
          }}
        >
          {actionLabel}
        </Link>
      ) : null}
    </section>
  );
}
