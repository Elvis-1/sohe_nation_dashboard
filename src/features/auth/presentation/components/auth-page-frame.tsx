export function AuthPageFrame({
  eyebrow,
  title,
  description,
  children,
}: Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}>) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
      }}
    >
      <section
        style={{
          width: "min(1080px, 100%)",
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          border: "1px solid var(--color-border)",
          borderRadius: "32px",
          overflow: "hidden",
          background: "var(--color-surface)",
          boxShadow: "var(--shadow-soft)",
        }}
      >
        <div
          style={{
            padding: "40px",
            background:
              "linear-gradient(160deg, rgba(179, 123, 31, 0.15), rgba(21, 17, 13, 0.96))",
            color: "var(--color-text-inverse)",
          }}
        >
          <p
            style={{
              color: "#f4d077",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </p>
          <h1
            style={{
              marginTop: 12,
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(3rem, 7vw, 5.75rem)",
              lineHeight: 0.9,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              marginTop: 18,
              maxWidth: 480,
              color: "rgba(247, 240, 225, 0.8)",
              lineHeight: 1.7,
            }}
          >
            {description}
          </p>
        </div>
        <div style={{ padding: "40px" }}>{children}</div>
      </section>
    </main>
  );
}
