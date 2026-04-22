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
    <main className="auth-frame">
      <section className="auth-shell">
        <div className="auth-hero">
          <p className="auth-eyebrow">{eyebrow}</p>
          <h1 className="auth-title">{title}</h1>
          <p className="auth-description">{description}</p>
        </div>
        <div className="auth-content">{children}</div>
      </section>
    </main>
  );
}
