type SectionCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function SectionCard({
  title,
  description,
  children,
}: SectionCardProps) {
  return (
    <section
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: "24px",
        padding: "22px",
        background: "var(--color-surface)",
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <h2
          style={{
            marginBottom: description ? 8 : 0,
            fontSize: 20,
          }}
        >
          {title}
        </h2>
        {description ? (
          <p style={{ color: "var(--color-text-muted)", lineHeight: 1.5 }}>{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
