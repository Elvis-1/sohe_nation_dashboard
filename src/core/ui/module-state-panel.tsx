import Link from "next/link";

type ModuleStatePanelProps = {
  eyebrow: string;
  title: string;
  description: string;
  nextLabel: string;
  nextHref: string;
};

export function ModuleStatePanel({
  eyebrow,
  title,
  description,
  nextLabel,
  nextHref,
}: ModuleStatePanelProps) {
  return (
    <section
      style={{
        border: "1px dashed var(--color-border-strong)",
        borderRadius: 24,
        padding: 22,
        background: "rgba(234, 215, 177, 0.18)",
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
      <h3 style={{ marginBottom: 10, fontSize: 22 }}>{title}</h3>
      <p style={{ marginBottom: 16, color: "var(--color-text-muted)", lineHeight: 1.6 }}>
        {description}
      </p>
      <Link
        href={nextHref}
        style={{
          display: "inline-flex",
          borderRadius: "var(--radius-pill)",
          padding: "12px 16px",
          background: "var(--color-surface-inverse)",
          color: "var(--color-text-inverse)",
          fontWeight: 600,
        }}
      >
        {nextLabel}
      </Link>
    </section>
  );
}
