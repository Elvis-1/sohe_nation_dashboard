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
    <section className="section-card">
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
      <style jsx>{`
        .section-card {
          border: 1px solid var(--color-border);
          border-radius: 24px;
          padding: 22px;
          background: var(--color-surface);
          min-width: 0;
        }

        @media (max-width: 720px) {
          .section-card {
            border-radius: 20px;
            padding: 18px;
          }
        }

        @media (max-width: 520px) {
          .section-card {
            padding: 16px;
          }
        }
      `}</style>
    </section>
  );
}
