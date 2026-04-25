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
    <header className="page-header">
      <div className="page-header__copy">
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
      {actions ? <div className="page-header__actions">{actions}</div> : null}
      <style jsx>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          gap: 24px;
          align-items: end;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }

        .page-header__copy {
          min-width: 0;
          flex: 1 1 440px;
        }

        .page-header__actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
          justify-content: flex-start;
          flex: 0 1 auto;
        }

        @media (max-width: 720px) {
          .page-header {
            gap: 18px;
            margin-bottom: 22px;
          }

          .page-header__copy,
          .page-header__actions {
            flex-basis: 100%;
          }

          .page-header__actions {
            display: grid;
          }
        }
      `}</style>
    </header>
  );
}
