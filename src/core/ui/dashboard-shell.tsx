"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { navItems } from "@/src/features/navigation/data/nav-items";
import { useDashboardAuth } from "@/src/features/auth/presentation/state/dashboard-auth-provider";

export function DashboardShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, signOut } = useDashboardAuth();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const activeIndex = navItems.findIndex((item) => item.href === pathname);

  function handleSignOut() {
    signOut();
    router.replace("/signin");
  }

  const activeItem = navItems.find((item) => item.href === pathname);
  const activeSectionNumber = activeIndex >= 0 ? String(activeIndex + 1).padStart(2, "0") : "00";

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.body.style.overflow = isNavOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isNavOpen]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 921px)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) setIsNavOpen(false);
    };
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  return (
    <div className="dashboard-shell">
      <button
        aria-hidden={!isNavOpen}
        className="dashboard-backdrop"
        data-open={isNavOpen}
        onClick={() => setIsNavOpen(false)}
        tabIndex={isNavOpen ? 0 : -1}
        type="button"
      />
      <aside
        className="dashboard-sidebar"
        data-open={isNavOpen}
        id="dashboard-sidebar"
      >
        <div className="dashboard-brand-block">
          <div>
            <p className="dashboard-brand-eyebrow">Sohe&apos;s Nation</p>
            <h1 className="dashboard-brand-title">Control Desk</h1>
          </div>
          <p className="dashboard-brand-description">
            Staff workspace for products, orders, content, and post-purchase flow.
          </p>
        </div>
        <div className="dashboard-session-card">
          <div>
            <p className="dashboard-session-label">Live desk</p>
            <strong className="dashboard-session-name">
              {session?.name ?? "Staff Access"}
            </strong>
          </div>
          <span className="dashboard-session-meta">
            {session?.email ?? "ops@sohesnation.com"} · {session?.role ?? "Fixture mode"}
          </span>
        </div>
        <nav className="dashboard-nav">
          {navItems.map((item) => (
            <Link
              aria-current={pathname === item.href ? "page" : undefined}
              key={item.href}
              href={item.href}
              onClick={() => setIsNavOpen(false)}
              className="dashboard-nav-link"
              data-active={pathname === item.href}
            >
              <span className="dashboard-nav-index">
                {String(navItems.findIndex((navItem) => navItem.href === item.href) + 1).padStart(
                  2,
                  "0",
                )}
              </span>
              <span>
                <strong className="dashboard-nav-title">{item.label}</strong>
                <span className="dashboard-nav-description">{item.description}</span>
              </span>
            </Link>
          ))}
        </nav>
        <button
          className="dashboard-signout"
          onClick={handleSignOut}
          type="button"
        >
          <strong style={{ display: "block", marginBottom: 4 }}>Sign out</strong>
          <span className="dashboard-signout-copy">Exit the current dashboard session.</span>
        </button>
      </aside>
      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="dashboard-topbar-copy">
            <div className="dashboard-topbar-pills">
              <button
                aria-controls="dashboard-sidebar"
                aria-expanded={isNavOpen}
                className="dashboard-menu-button"
                onClick={() => setIsNavOpen((value) => !value)}
                type="button"
              >
                <span>Menu</span>
                <span className="dashboard-pill-copy">{activeItem?.label ?? "Control Desk"}</span>
              </button>
              <div className="dashboard-status-pill">
                <span className="dashboard-pill-copy">Session active</span>
                <strong>{session?.role ?? "Staff Access"}</strong>
              </div>
              <div className="dashboard-status-pill dashboard-status-pill--warm">
                <span className="dashboard-pill-copy">Section</span>
                <strong>{activeSectionNumber}</strong>
              </div>
            </div>
            <div className="dashboard-route-card">
              <strong className="dashboard-route-title">
                {activeItem?.label ?? "Control Desk"}
              </strong>
              <span className="dashboard-route-copy">
                {activeItem?.description ??
                  "Staff workspace for products, orders, content, returns, customers, and settings."}
              </span>
            </div>
          </div>
          <div className="dashboard-topbar-actions">
            <Link href="/" className="dashboard-primary-link" onClick={() => setIsNavOpen(false)}>
              Overview
            </Link>
            <Link
              href="/orders"
              className="dashboard-secondary-link"
              onClick={() => setIsNavOpen(false)}
            >
              Orders desk
            </Link>
            <div className="dashboard-ops-card">
              <span className="dashboard-pill-copy">Session window</span>
              <strong>45 min mock access</strong>
            </div>
          </div>
        </header>
        <div className="dashboard-content-frame">
          {children}
        </div>
      </main>
      <style jsx>{`
        .dashboard-shell {
          position: relative;
          display: grid;
          grid-template-columns: 320px minmax(0, 1fr);
          min-height: 100vh;
        }

        .dashboard-backdrop {
          display: none;
        }

        .dashboard-sidebar {
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          height: 100svh;
          overflow-y: auto;
          border-right: 1px solid var(--color-border);
          padding: 28px 20px;
          background:
            linear-gradient(180deg, rgba(255, 253, 248, 0.82), rgba(246, 238, 223, 0.94)),
            radial-gradient(circle at top, rgba(179, 123, 31, 0.1), transparent 44%);
          backdrop-filter: blur(18px);
        }

        .dashboard-brand-block {
          margin-bottom: 28px;
          display: grid;
          gap: 14px;
          flex-shrink: 0;
        }

        .dashboard-brand-eyebrow {
          color: var(--color-accent);
          font-family: var(--font-mono);
          font-size: 12px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }

        .dashboard-brand-title {
          margin-top: 8px;
          font-family: var(--font-heading);
          font-size: 44px;
          letter-spacing: 0.04em;
          line-height: 0.92;
        }

        .dashboard-brand-description {
          color: var(--color-text-muted);
          line-height: 1.6;
          font-size: 14px;
        }

        .dashboard-session-card {
          margin-bottom: 22px;
          border: 1px solid var(--color-border);
          border-radius: 24px;
          padding: 16px 18px;
          background: linear-gradient(180deg, rgba(234, 215, 177, 0.46), rgba(255, 253, 248, 0.72));
          display: grid;
          gap: 10px;
          flex-shrink: 0;
        }

        .dashboard-session-label {
          color: var(--color-text-muted);
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          font-family: var(--font-mono);
        }

        .dashboard-session-name {
          display: block;
          font-size: 20px;
        }

        .dashboard-session-meta {
          color: var(--color-text-muted);
          font-size: 14px;
          line-height: 1.5;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dashboard-nav {
          display: grid;
          gap: 10px;
          flex: 1;
        }

        .dashboard-nav-link {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 14px;
          align-items: start;
          border: 1px solid var(--color-border);
          border-radius: 20px;
          padding: 14px 16px;
          background: var(--color-surface);
          color: var(--color-text);
          transition:
            transform 160ms ease,
            background 160ms ease,
            color 160ms ease,
            border-color 160ms ease;
        }

        .dashboard-nav-link:hover {
          transform: translateX(3px);
          border-color: var(--color-border-strong);
        }

        .dashboard-nav-link[data-active="true"] {
          background: var(--color-surface-inverse);
          color: var(--color-text-inverse);
          border-color: rgba(244, 208, 119, 0.28);
          transform: translateX(6px);
        }

        .dashboard-nav-index {
          color: var(--color-accent);
          font-size: 12px;
          font-family: var(--font-mono);
          letter-spacing: 0.16em;
          text-transform: uppercase;
          padding-top: 4px;
        }

        .dashboard-nav-link[data-active="true"] .dashboard-nav-index {
          color: #f4d077;
        }

        .dashboard-nav-title {
          display: block;
          margin-bottom: 4px;
        }

        .dashboard-nav-description {
          display: block;
          color: var(--color-text-muted);
          font-size: 14px;
          line-height: 1.5;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dashboard-nav-link[data-active="true"] .dashboard-nav-description {
          color: rgba(247, 240, 225, 0.72);
        }

        .dashboard-signout {
          margin-top: 16px;
          flex-shrink: 0;
          width: 100%;
          border: 1px solid var(--color-border);
          border-radius: 20px;
          padding: 14px 16px;
          background: transparent;
          text-align: left;
          cursor: pointer;
        }

        .dashboard-signout-copy {
          color: var(--color-text-muted);
          font-size: 14px;
        }

        .dashboard-main {
          padding: 24px;
          min-width: 0;
        }

        .dashboard-topbar {
          margin-bottom: 18px;
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-start;
          flex-wrap: wrap;
        }

        .dashboard-topbar-copy {
          display: grid;
          gap: 10px;
        }

        .dashboard-topbar-pills {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .dashboard-status-pill,
        .dashboard-primary-link,
        .dashboard-secondary-link,
        .dashboard-ops-card {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          border-radius: var(--radius-pill);
          padding: 12px 16px;
          font-weight: 600;
        }

        .dashboard-menu-button {
          display: none;
          align-items: center;
          gap: 12px;
          border-radius: var(--radius-pill);
          padding: 12px 16px;
          font-weight: 600;
          border: 1px solid var(--color-border);
          background: rgba(255, 253, 248, 0.82);
          cursor: pointer;
        }

        .dashboard-status-pill,
        .dashboard-ops-card {
          border: 1px solid var(--color-border);
          background: rgba(255, 253, 248, 0.82);
        }

        .dashboard-status-pill--warm {
          background: rgba(234, 215, 177, 0.4);
        }

        .dashboard-pill-copy {
          color: var(--color-text-muted);
          font-size: 14px;
          font-weight: 500;
        }

        .dashboard-route-card {
          border: 1px solid var(--color-border);
          border-radius: 20px;
          padding: 14px 16px;
          background: rgba(255, 253, 248, 0.72);
          max-width: 620px;
        }

        .dashboard-route-title {
          display: block;
          margin-bottom: 6px;
        }

        .dashboard-route-copy {
          color: var(--color-text-muted);
          line-height: 1.55;
        }

        .dashboard-topbar-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
        }

        .dashboard-primary-link {
          background: var(--color-surface-inverse);
          color: var(--color-text-inverse);
        }

        .dashboard-secondary-link {
          border: 1px solid var(--color-border);
          background: rgba(255, 253, 248, 0.82);
        }

        .dashboard-content-frame {
          border: 1px solid var(--color-border);
          border-radius: 32px;
          min-height: calc(100vh - 48px);
          background:
            linear-gradient(180deg, rgba(255, 253, 248, 0.96), rgba(252, 248, 240, 0.9)),
            radial-gradient(circle at top right, rgba(179, 123, 31, 0.06), transparent 36%);
          box-shadow: var(--shadow-soft);
          padding: 28px;
          min-width: 0;
          overflow: clip;
        }

        @media (max-width: 1180px) {
          .dashboard-shell {
            grid-template-columns: 290px minmax(0, 1fr);
          }
        }

        @media (max-width: 920px) {
          .dashboard-shell {
            grid-template-columns: 1fr;
          }

          .dashboard-menu-button {
            display: inline-flex;
          }

          .dashboard-backdrop {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(21, 17, 13, 0.42);
            opacity: 0;
            pointer-events: none;
            transition: opacity 180ms ease;
            z-index: 25;
            border: 0;
          }

          .dashboard-backdrop[data-open="true"] {
            opacity: 1;
            pointer-events: auto;
          }

          .dashboard-sidebar {
            position: fixed;
            inset: 0 auto 0 0;
            width: min(320px, 86vw);
            z-index: 30;
            transform: translateX(-102%);
            transition: transform 180ms ease;
            box-shadow: var(--shadow-soft);
            height: 100svh;
            overflow-y: auto;
          }

          .dashboard-sidebar[data-open="true"] {
            transform: translateX(0);
          }

          .dashboard-nav-description {
            white-space: normal;
            overflow: visible;
            text-overflow: clip;
          }

          .dashboard-main {
            padding: 16px;
          }

          .dashboard-topbar {
            align-items: stretch;
          }

          .dashboard-topbar-actions {
            width: 100%;
          }

          .dashboard-ops-card {
            width: 100%;
            justify-content: space-between;
          }

          .dashboard-content-frame {
            border-radius: 26px;
            min-height: calc(100vh - 32px);
            padding: 20px;
          }
        }

        @media (max-width: 640px) {
          .dashboard-shell {
            min-height: 100svh;
          }

          .dashboard-menu-button,
          .dashboard-status-pill,
          .dashboard-primary-link,
          .dashboard-secondary-link,
          .dashboard-ops-card {
            width: 100%;
            justify-content: space-between;
          }

          .dashboard-route-card {
            max-width: none;
          }

          .dashboard-topbar-pills,
          .dashboard-topbar-actions {
            display: grid;
          }

          .dashboard-brand-title {
            font-size: 36px;
          }

          .dashboard-sidebar {
            width: min(340px, 92vw);
            padding: 24px 18px;
          }

          .dashboard-content-frame {
            border-radius: 22px;
            padding: 16px;
          }
        }

        @media (max-width: 480px) {
          .dashboard-main {
            padding: 12px;
          }

          .dashboard-topbar {
            gap: 12px;
          }

          .dashboard-route-card,
          .dashboard-session-card,
          .dashboard-nav-link,
          .dashboard-signout {
            border-radius: 18px;
          }
        }
      `}</style>
    </div>
  );
}
