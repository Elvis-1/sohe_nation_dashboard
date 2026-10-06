"use client";

import Link from "next/link";
import { useState } from "react";
import { AppStateMessage } from "@/src/core/ui/app-state-message";
import { PageHeader } from "@/src/core/ui/page-header";
import { SectionCard } from "@/src/core/ui/section-card";
import { useToast } from "@/src/core/ui/toast";
import type { DashboardContentRecord } from "@/src/core/types/dashboard";
import { updateContentRecord } from "@/src/features/content/data/repositories/content-repository";
import {
  useContentDesk,
  useContentDeskError,
} from "@/src/features/content/presentation/state/use-content-desk";

const STOREFRONT_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL ?? "https://sohenation.com";

/** Seeded copy marks facts the owner must supply with this; the page is not launch-ready until none remain. */
export const OWNER_REVIEW_MARKER = "[Owner to confirm";

// Search engines show roughly this many characters of a description.
const SUMMARY_SOFT_LIMIT = 160;

type FormState = Pick<DashboardContentRecord, "title" | "headline" | "summary" | "body" | "visibility">;

export function needsOwnerReview(entry: Pick<DashboardContentRecord, "body" | "summary">) {
  return `${entry.summary}\n${entry.body}`.includes(OWNER_REVIEW_MARKER);
}

export function InfoPageEditorShell({ contentId }: { contentId: string }) {
  const entries = useContentDesk();
  const error = useContentDeskError();
  const entry = entries.find((item) => item.id === contentId && item.area === "info_page");

  if (error) {
    return (
      <AppStateMessage
        eyebrow="Information Pages"
        title="The page could not load."
        description={`The dashboard could not read content from the API. ${error.message}`}
        action={<Link href="/content">Back to content</Link>}
      />
    );
  }

  if (!entry) {
    return (
      <AppStateMessage
        eyebrow="Information Pages"
        title={entries.length ? "This page was not found." : "Loading page..."}
        description={
          entries.length
            ? "It may have been removed, or the link is wrong."
            : "Reading the page from the API."
        }
        action={<Link href="/content#information-pages">Back to information pages</Link>}
      />
    );
  }

  // Keyed so switching pages or saving resets the form from the stored record.
  return <InfoPageForm key={`${entry.id}:${entry.updatedAt ?? ""}`} entry={entry} />;
}

function InfoPageForm({ entry }: { entry: DashboardContentRecord }) {
  const toast = useToast();
  const [form, setForm] = useState<FormState>({
    title: entry.title,
    headline: entry.headline,
    summary: entry.summary,
    body: entry.body,
    visibility: entry.visibility,
  });
  const [saving, setSaving] = useState(false);
  const storefrontPath = `/${entry.slug ?? ""}`;
  const reviewPending = needsOwnerReview(form);
  const dirty =
    form.title !== entry.title ||
    form.headline !== entry.headline ||
    form.summary !== entry.summary ||
    form.body !== entry.body ||
    form.visibility !== entry.visibility;

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateContentRecord({ ...entry, ...form });
      toast.success(
        form.visibility === "published"
          ? `${form.headline} saved and live on the storefront.`
          : `${form.headline} saved as ${form.visibility}. It is not live on the storefront.`,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "The page could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Information Pages"
        title={entry.headline || entry.title}
        description={`Edit the copy for ${storefrontPath} on the storefront. Changes go live when the page is saved as published.`}
        actions={
          <>
            <Link href="/content#information-pages" style={lightPillStyle}>
              All information pages
            </Link>
            <a href={`${STOREFRONT_URL}${storefrontPath}`} target="_blank" rel="noreferrer" style={lightPillStyle}>
              View on storefront
            </a>
          </>
        }
      />

      {reviewPending ? (
        <div role="alert" style={reviewBannerStyle}>
          <strong>Needs owner review before launch.</strong> This page still contains{" "}
          <code>{OWNER_REVIEW_MARKER}: …]</code> notes. Replace each one with the real detail. Legal
          pages (privacy, terms) should be approved by the owner, ideally with legal advice.
        </div>
      ) : null}

      <SectionCard
        title="Page copy"
        description="The page title is the large heading and the browser tab title. The intro sits under it and is the description search engines and link previews show."
      >
        <div style={{ display: "grid", gap: 16 }}>
          <label style={labelStyle}>
            <span>Page title</span>
            <input
              aria-label="Page title"
              onChange={(event) => update("headline", event.target.value)}
              style={inputStyle}
              value={form.headline}
            />
          </label>
          <label style={labelStyle}>
            <span>
              Intro and search description{" "}
              <span style={hintStyle}>
                {form.summary.length}/{SUMMARY_SOFT_LIMIT} characters
                {form.summary.length > SUMMARY_SOFT_LIMIT ? " — search results will cut this off" : ""}
              </span>
            </span>
            <textarea
              aria-label="Intro and search description"
              onChange={(event) => update("summary", event.target.value)}
              rows={3}
              style={textareaStyle}
              value={form.summary}
            />
          </label>
          <label style={labelStyle}>
            <span>Page body</span>
            <textarea
              aria-label="Page body"
              onChange={(event) => update("body", event.target.value)}
              rows={24}
              style={{ ...textareaStyle, fontFamily: "var(--font-mono, ui-monospace, monospace)", fontSize: 14 }}
              value={form.body}
            />
          </label>
        </div>
      </SectionCard>

      <SectionCard title="Formatting" description="The page body supports this simple formatting.">
        <ul style={{ display: "grid", gap: 6, margin: 0, paddingLeft: 18, color: "var(--color-text-muted)", lineHeight: 1.6 }}>
          <li><code>## Heading</code> and <code>### Small heading</code> on their own line</li>
          <li>A blank line starts a new paragraph</li>
          <li><code>- item</code> for bullets, <code>1. item</code> for numbered steps</li>
          <li><code>**bold**</code> and <code>[link text](/returns)</code>; links may go to a storefront path, an <code>https://</code> address, or <code>mailto:</code></li>
          <li>Tables: rows like <code>| Size | Chest (cm) |</code>, with <code>| --- | --- |</code> under the first row</li>
          <li><code>{"{{support_email}}"}</code> and <code>{"{{store_name}}"}</code> are replaced with the values from Settings</li>
        </ul>
      </SectionCard>

      <SectionCard title="Publishing" description="Only published pages are shown on the storefront. A draft or ready page shows the not-found screen, and its footer link breaks.">
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <label style={labelStyle}>
            <span>Status</span>
            <select
              aria-label="Status"
              onChange={(event) => update("visibility", event.target.value as FormState["visibility"])}
              style={inputStyle}
              value={form.visibility}
            >
              <option value="draft">Draft</option>
              <option value="ready">Ready</option>
              <option value="published">Published</option>
            </select>
          </label>
          <label style={labelStyle}>
            <span>
              Record name <span style={hintStyle}>Dashboard only; not shown on the storefront</span>
            </span>
            <input
              aria-label="Record name"
              onChange={(event) => update("title", event.target.value)}
              style={inputStyle}
              value={form.title}
            />
          </label>
        </div>
        <div className="dashboard-action-row" style={{ marginTop: 16 }}>
          <button
            disabled={!dirty || saving}
            onClick={() => void handleSave()}
            style={{ ...darkButtonStyle, opacity: !dirty || saving ? 0.6 : 1 }}
            type="button"
          >
            {saving ? "Saving..." : "Save page"}
          </button>
          {entry.updatedAt ? (
            <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
              Last saved {new Date(entry.updatedAt).toLocaleString()}
            </span>
          ) : null}
        </div>
      </SectionCard>
    </div>
  );
}

const labelStyle = { display: "grid", gap: 8 } as const;

const hintStyle = {
  fontWeight: 400,
  fontSize: 12,
  color: "var(--color-text-muted)",
} as const;

const inputStyle = {
  border: "1px solid var(--color-border)",
  borderRadius: 16,
  padding: "14px 16px",
  background: "var(--color-surface)",
} as const;

const textareaStyle = {
  ...inputStyle,
  resize: "vertical" as const,
  lineHeight: 1.6,
} as const;

const lightPillStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "var(--radius-pill)",
  padding: "14px 18px",
  border: "1px solid var(--color-border)",
  background: "rgba(255, 253, 248, 0.82)",
  color: "var(--color-text)",
  fontWeight: 600,
} as const;

const darkButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: 0,
  borderRadius: "var(--radius-pill)",
  padding: "14px 18px",
  background: "var(--color-surface-inverse)",
  color: "var(--color-text-inverse)",
  fontWeight: 600,
  cursor: "pointer",
} as const;

const reviewBannerStyle = {
  marginBottom: 20,
  border: "1px solid rgba(179, 123, 31, 0.4)",
  borderRadius: 16,
  padding: "14px 18px",
  background: "rgba(179, 123, 31, 0.12)",
  color: "var(--color-text)",
  lineHeight: 1.6,
} as const;
