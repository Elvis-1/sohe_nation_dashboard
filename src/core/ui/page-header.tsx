type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 24,
        alignItems: "end",
        marginBottom: 28,
        flexWrap: "wrap",
      }}
    >
      <div>
        <p
          style={{
            marginBottom: 10,
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
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(2.6rem, 5vw, 4.75rem)",
            lineHeight: 0.92,
            letterSpacing: "0.03em",
          }}
        >
          {title}
        </h1>
        <p
          style={{
            marginTop: 12,
            maxWidth: 760,
            color: "var(--color-text-muted)",
            lineHeight: 1.6,
          }}
        >
          {description}
        </p>
      </div>
      {actions ? <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>{actions}</div> : null}
    </header>
  );
}
