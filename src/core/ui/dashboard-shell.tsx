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
  const navGroups = [
    { label: "Operations", items: navItems.slice(0, 6) },
    { label: "System", items: navItems.slice(6) },
  ];

  useEffect(() => {
    if (typeof document === "undefined") return;
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
        <div className="dashboard-sidebar-top">
          <div className="dashboard-brand-block">
            <div className="dashboard-brand-mark" aria-hidden="true">
              SN
            </div>
            <div>
              <p className="dashboard-brand-eyebrow">Sohe Nation</p>
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
              {session?.email ?? "Authenticated staff session"} · {session?.role ?? "Operations staff"}
            </span>
          </div>
        </div>
        <div className="dashboard-nav-shell">
          <div className="dashboard-nav-header">
            <div>
              <span className="dashboard-nav-kicker">Workspace map</span>
              <strong className="dashboard-nav-current">
                {activeItem?.label ?? "Overview"}
              </strong>
            </div>
            <span className="dashboard-nav-section-badge">
              {activeSectionNumber}
            </span>
          </div>
          <nav className="dashboard-nav">
            {navGroups.map((group) => (
              <div key={group.label} className="dashboard-nav-group">
                <div className="dashboard-nav-group-label">{group.label}</div>
                <div className="dashboard-nav-group-items">
                  {group.items.map((item) => (
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
                      <span className="dashboard-nav-copy">
                        <strong className="dashboard-nav-title">{item.label}</strong>
                        <span className="dashboard-nav-description">{item.description}</span>
                      </span>
                      <span className="dashboard-nav-arrow" aria-hidden="true">
                        ↗
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
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
              <strong className="dashboard-route-title">{activeItem?.label ?? "Control Desk"}</strong>
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
              <span className="dashboard-pill-copy">Session status</span>
              <strong>Protected access</strong>
            </div>
          </div>
        </header>
        <div className="dashboard-content-frame">
          {children}
        </div>
      </main>
      {/* Global, not scoped: scoped styled-jsx classes never reach <Link>, which left the nav
          links and topbar links unstyled. Every class here is dashboard-* and shell-only. */}
      <style jsx global>{`
        .dashboard-shell {
          position: relative;
          display: grid;
          grid-template-columns: 296px minmax(0, 1fr);
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
          overflow: hidden;
          border-right: 1px solid rgba(111, 93, 58, 0.14);
          padding: 20px 18px 18px;
          background:
            linear-gradient(180deg, rgba(251, 247, 239, 0.98), rgba(243, 235, 219, 0.95)),
            linear-gradient(90deg, rgba(157, 120, 49, 0.06), transparent 26%);
          backdrop-filter: blur(18px);
          box-shadow: inset -1px 0 0 rgba(255, 255, 255, 0.5);
        }

        .dashboard-sidebar::before {
          content: "";
          position: absolute;
          inset: 10px 10px 10px 12px;
          border-radius: 20px;
          border: 1px solid rgba(184, 148, 83, 0.12);
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.28), transparent 20%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent);
          pointer-events: none;
        }

        .dashboard-sidebar-top {
          position: relative;
          z-index: 1;
          display: grid;
          gap: 14px;
        }

        .dashboard-brand-block {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 6px 12px;
          align-items: start;
          flex-shrink: 0;
          padding: 2px 6px 0;
        }

        .dashboard-brand-mark {
          display: inline-grid;
          place-items: center;
          width: 42px;
          height: 42px;
          border-radius: 12px;
          border: 1px solid rgba(184, 148, 83, 0.28);
          background:
            linear-gradient(180deg, rgba(255, 254, 250, 0.88), rgba(232, 219, 191, 0.64));
          color: var(--color-accent);
          font-family: var(--font-mono);
          font-size: 12px;
          letter-spacing: 0.2em;
          text-indent: 0.2em;
          box-shadow: 0 8px 18px rgba(84, 58, 19, 0.05);
        }

        .dashboard-brand-eyebrow {
          color: var(--color-accent);
          font-family: var(--font-mono);
          font-size: 12px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }

        .dashboard-brand-title {
          margin-top: 2px;
          font-family: var(--font-heading);
          font-size: 26px;
          letter-spacing: 0.03em;
          line-height: 1;
        }

        .dashboard-brand-description {
          grid-column: 1 / -1;
          color: var(--color-text-muted);
          line-height: 1.5;
          font-size: 11px;
          max-width: 24ch;
        }

        .dashboard-session-card {
          border: 1px solid rgba(184, 148, 83, 0.16);
          border-radius: 14px;
          padding: 10px 12px;
          background:
            linear-gradient(180deg, rgba(255, 253, 248, 0.72), rgba(240, 231, 213, 0.72));
          display: grid;
          gap: 4px;
          flex-shrink: 0;
          box-shadow: none;
        }

        .dashboard-session-label {
          color: var(--color-text-muted);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          font-family: var(--font-mono);
        }

        .dashboard-session-name {
          display: block;
          font-size: 15px;
        }

        .dashboard-session-meta {
          color: var(--color-text-muted);
          font-size: 11px;
          line-height: 1.4;
          overflow-wrap: anywhere;
        }

        .dashboard-nav-shell {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-rows: auto minmax(0, 1fr);
          gap: 12px;
          flex: 1;
          min-height: 0;
          margin-top: 12px;
          padding-top: 14px;
          border-top: 1px solid rgba(184, 148, 83, 0.16);
        }

        .dashboard-nav-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 0 6px;
        }

        .dashboard-nav-kicker {
          color: var(--color-text-muted);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          font-family: var(--font-mono);
        }

        .dashboard-nav-current {
          display: block;
          margin-top: 3px;
          font-size: 14px;
          color: var(--color-text);
          letter-spacing: 0.01em;
        }

        .dashboard-nav-section-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 36px;
          height: 26px;
          border-radius: 999px;
          border: 1px solid rgba(184, 148, 83, 0.18);
          background: rgba(255, 253, 248, 0.64);
          color: var(--color-accent);
          font-family: var(--font-body);
          font-size: 11px;
          letter-spacing: 0.08em;
        }

        .dashboard-nav {
          display: grid;
          gap: 14px;
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          overscroll-behavior: contain;
          padding-right: 2px;
          padding-bottom: 4px;
          align-content: start;
        }

        .dashboard-nav-group {
          display: grid;
          gap: 8px;
        }

        .dashboard-nav-group-label {
          padding: 0 6px 0 14px;
          color: rgba(100, 89, 74, 0.82);
          font-size: 10px;
          font-family: var(--font-mono);
          letter-spacing: 0.18em;
          text-transform: uppercase;
          position: relative;
        }

        .dashboard-nav-group-label::before {
          content: "";
          background: rgba(184, 148, 83, 0.5);
          width: 8px;
          height: 1px;
          position: absolute;
          top: 50%;
          left: 0;
        }

        .dashboard-nav-group-items {
          gap: 2px;
          display: grid;
        }

        .dashboard-nav-link {
          color: var(--color-text);
          box-shadow: none;
          background: 0 0;
          border: 1px solid #0000;
          border-radius: 12px;
          grid-template-columns: 36px minmax(0,1fr);
          align-items: flex-start;
          gap: 12px;
          min-height: 56px;
          padding: 12px 12px 12px 14px;
          transition: transform .16s,background .16s,color .16s,border-color .16s,box-shadow .16s;
          display: grid;
          position: relative;
        }

        .dashboard-nav-link:hover{
          background:#fffcf6b8;
          border-color:#b8945324;
          transform:translate(2px);
        }

        .dashboard-nav-link[data-active=true]{
          color:var(--color-text-inverse);
          background:linear-gradient(135deg,#1d160ffa,#302415f5);
          border-color:#f4d0772e;
          transform:none;
          box-shadow:0 10px 22px #1a120a1f,inset 3px 0 #f4d077;
        }

        .dashboard-nav-link::after{
          content:"";
          opacity:0;
          background:#b894532e;
          width:1px;
          transition:opacity .16s;
          position:absolute;
          inset:8px auto 8px 0;
        }

        .dashboard-nav-link:hover::after{opacity:1}

        .dashboard-nav-index{color:#75571fe0;width:36px;height:36px;font-size:12px;font-family:var(--font-mono);letter-spacing:.12em;text-transform:uppercase;background:#dac6a161;border-radius:999px;justify-content:center;align-self:start;align-items:center;display:inline-flex}

        .dashboard-nav-link[data-active=true] .dashboard-nav-index{color:#f4d077;background:#f4d07724}

        .dashboard-nav-copy{min-width:0;display:grid;gap:4px}

        .dashboard-nav-title{font-size:17px;font-weight:700;line-height:1.18;display:block}

        .dashboard-nav-description{color:var(--color-text-muted);overflow-wrap:anywhere;opacity:1;max-width:64ch;font-size:15px;line-height:1.4;display:block}

        .dashboard-nav-link[data-active=true] .dashboard-nav-description{color:#f7f0e1c2;opacity:1}

        .dashboard-nav-arrow{display:none}

        .dashboard-signout{z-index:1;text-align:left;cursor:pointer;background:#fffdf885;border:1px solid #b8945324;border-radius:14px;flex-shrink:0;width:100%;margin-top:14px;padding:12px;transition:border-color .16s,transform .16s,background .16s;position:relative}

        .dashboard-signout:hover{background:#fffdf8cc;border-color:#b8945338;transform:translateY(-1px)}

        .dashboard-signout-copy{color:var(--color-text-muted);font-size:12px;line-height:1.4}

        .dashboard-main{min-width:0;padding:24px}

        .dashboard-topbar{flex-wrap:wrap;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:18px;display:flex}

        .dashboard-topbar-copy{gap:10px;display:grid}

        .dashboard-topbar-pills{flex-wrap:wrap;gap:10px;display:flex}

        .dashboard-status-pill,.dashboard-primary-link,.dashboard-secondary-link,.dashboard-ops-card{border-radius:var(--radius-pill);align-items:center;gap:12px;padding:12px 16px;font-weight:600;display:inline-flex}

        .dashboard-menu-button{border-radius:var(--radius-pill);border:1px solid var(--color-border);cursor:pointer;background:#fffdf8d1;align-items:center;gap:12px;padding:12px 16px;font-weight:600;display:none}

        .dashboard-route-card{border:1px solid var(--color-border);background:#fffdf8b8;border-radius:20px;max-width:760px;padding:14px 16px}

        .dashboard-route-title{margin-bottom:6px;font-size:18px;display:block}

        .dashboard-route-copy{color:var(--color-text-muted);max-width:64ch;font-size:14px;line-height:1.55;display:block}

        .dashboard-status-pill,.dashboard-ops-card{border:1px solid var(--color-border);background:#fffdf8d1}

        .dashboard-status-pill--warm{background:#ead7b166}

        .dashboard-pill-copy{color:var(--color-text-muted);font-size:14px;font-weight:500}

        .dashboard-route-card{border:1px solid var(--color-border);background:#fffdf8b8;border-radius:20px;max-width:620px;padding:14px 16px}

        .dashboard-route-title{margin-bottom:6px;display:block}

        .dashboard-route-copy{color:var(--color-text-muted);line-height:1.55}

        .dashboard-topbar-actions{flex-wrap:wrap;align-items:center;gap:12px;display:flex}

        .dashboard-primary-link{background:var(--color-surface-inverse);color:var(--color-text-inverse)}

        .dashboard-secondary-link{border:1px solid var(--color-border);background:#fffdf8d1}

        .dashboard-content-frame{border:1px solid var(--color-border);min-height:calc(100vh - 48px);box-shadow:var(--shadow-soft);background:linear-gradient(180deg,#fffdf8f5,#fcf8f0e6),radial-gradient(circle at 100% 0,#b37b1f0f,#0000 36%);border-radius:32px;min-width:0;padding:28px;overflow:clip}

        @media (max-width: 1180px){.dashboard-shell{grid-template-columns:278px minmax(0,1fr)}.dashboard-brand-title{font-size:24px}.dashboard-brand-description{max-width:22ch}}

        @media (min-width:921px){.dashboard-sidebar-top{gap:10px}.dashboard-brand-block{gap:4px 10px}.dashboard-brand-title{font-size:24px}.dashboard-brand-description{display:none}.dashboard-session-card{padding:8px 10px}.dashboard-session-meta{white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.dashboard-nav-shell{gap:10px;margin-top:10px;padding-top:12px}.dashboard-nav{gap:10px}.dashboard-nav-group{gap:6px}.dashboard-nav-group-items{gap:1px}.dashboard-nav-link{grid-template-columns:30px minmax(0,1fr);align-items:center;gap:10px;min-height:0;padding:8px 9px 8px 10px}.dashboard-nav-index{width:30px;height:30px;font-size:11px}.dashboard-nav-title{font-size:13px}.dashboard-nav-description{display:block;font-size:12px;line-height:1.35}}

        @media (min-width: 921px) and (height<=860px){.dashboard-sidebar{padding:16px 14px 14px}.dashboard-sidebar-top{gap:10px}.dashboard-brand-block{gap:6px 10px;padding-top:0}.dashboard-brand-mark{width:40px;height:40px}.dashboard-brand-title{font-size:22px}.dashboard-brand-description{display:none}.dashboard-session-card{padding:8px 10px}.dashboard-nav-shell{margin-top:8px;padding-top:10px}.dashboard-nav{gap:10px}.dashboard-nav-group{gap:5px}.dashboard-nav-group-items{gap:2px}.dashboard-nav-link{grid-template-columns:26px minmax(0,1fr);padding:6px 9px 6px 10px}.dashboard-nav-index{width:26px;height:26px;font-size:10px}.dashboard-nav-description{display:none}.dashboard-signout{margin-top:10px;padding:10px 11px}}

        @media (max-width:920px){.dashboard-shell{grid-template-columns:1fr}.dashboard-menu-button{display:inline-flex}.dashboard-backdrop{opacity:0;pointer-events:none;z-index:25;background:rgba(21,17,13,0.42);border:0;transition:opacity .18s;display:block;position:fixed;inset:0}.dashboard-backdrop[data-open=true]{opacity:1;pointer-events:auto}.dashboard-sidebar{z-index:30;width:min(320px,86vw);box-shadow:var(--shadow-soft);height:100svh;padding:22px 16px;transition:transform .18s;position:fixed;inset:0 auto 0 0;transform:translate(-102%)}.dashboard-sidebar[data-open=true]{transform:translate(0)}.dashboard-sidebar::before{inset:12px 10px}.dashboard-main{padding:16px}.dashboard-topbar{align-items:stretch}.dashboard-topbar-actions{width:100%}.dashboard-ops-card{justify-content:space-between;width:100%}.dashboard-brand-title{font-size:38px}.dashboard-nav-current{font-size:15px}.dashboard-nav-section-badge{min-width:42px;height:32px}.dashboard-nav{overflow-y:auto;padding-right:2px}.dashboard-nav{gap:12px}.dashboard-nav-group{gap:10px}.dashboard-nav-link{background:linear-gradient(#fffdf8eb,#faf4e8cc);border-color:#b8945329;border-radius:16px;grid-template-columns:auto 1fr;gap:10px;padding:12px 14px;box-shadow:0 6px 14px #32220a09}.dashboard-nav-description{opacity:1;font-size:13px;line-height:1.45;display:block}.dashboard-nav-link::after{display:none}.dashboard-nav-index{background:0 0;width:auto;height:auto}.dashboard-nav-arrow{display:none}.dashboard-content-frame{border-radius:26px;min-height:calc(100vh - 32px);padding:20px}}

        @media (max-width:640px){.dashboard-shell{min-height:100svh}.dashboard-menu-button,.dashboard-status-pill,.dashboard-primary-link,.dashboard-secondary-link,.dashboard-ops-card{justify-content:space-between;width:100%}.dashboard-route-card{max-width:none}.dashboard-topbar-pills,.dashboard-topbar-actions{display:grid}.dashboard-brand-title{font-size:36px}.dashboard-sidebar{width:min(100vw,380px);padding:18px 12px}.dashboard-brand-block{padding:6px 6px 0}.dashboard-nav-header{padding:0 6px}.dashboard-nav-group-label{padding:0 6px}.dashboard-nav-link{padding:14px 14px;border-radius:18px}.dashboard-session-card,.dashboard-signout{border-radius:18px}.dashboard-content-frame{border-radius:22px;padding:16px}}

        @media (max-width:480px){.dashboard-main{padding:12px}.dashboard-topbar{gap:12px}.dashboard-route-card,.dashboard-session-card,.dashboard-nav-link,.dashboard-signout{border-radius:18px}}
      `}</style>
    </div>
  );
}
