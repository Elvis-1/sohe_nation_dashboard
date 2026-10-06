"use client";

import Link from "next/link";
import { useState } from "react";
import { AppStateMessage } from "@/src/core/ui/app-state-message";
import { PageHeader } from "@/src/core/ui/page-header";
import { SeoFieldsSection } from "@/src/core/ui/seo-fields-section";
import { useToast } from "@/src/core/ui/toast";
import type { DashboardContentRecord, DashboardSeoOverrides } from "@/src/core/types/dashboard";
import { updateContentSeo } from "@/src/features/content/data/repositories/content-repository";
import {
  useContentDesk,
  useContentDeskError,
} from "@/src/features/content/presentation/state/use-content-desk";

const EMPTY_SEO: DashboardSeoOverrides = { seoTitle: "", seoDescription: "", shareImageUrl: "" };

export function StorySeoEditorShell({ contentId }: { contentId: string }) {
  const entries = useContentDesk();
  const error = useContentDeskError();
  const story = entries.find((entry) => entry.id === contentId && entry.area === "stories");

  if (error) {
    return (
      <AppStateMessage
        eyebrow="Stories"
        title="The story could not load."
        description={`The dashboard could not read content from the API. ${error.message}`}
        action={<Link href="/content#stories">Back to content</Link>}
      />
    );
  }
  if (!story) {
    return (
      <AppStateMessage
        eyebrow="Stories"
        title={entries.length ? "This story was not found." : "Loading story..."}
        description={entries.length ? "It may have been removed, or the link is wrong." : "Reading the story from the API."}
        action={<Link href="/content#stories">Back to content</Link>}
      />
    );
  }
  return <StorySeoForm key={`${story.id}:${story.updatedAt ?? ""}`} story={story} />;
}

function StorySeoForm({ story }: { story: DashboardContentRecord }) {
  const toast = useToast();
  const [seo, setSeo] = useState<DashboardSeoOverrides>(story.seo ?? EMPTY_SEO);
  const [saving, setSaving] = useState(false);
  const original = story.seo ?? EMPTY_SEO;
  const dirty =
    seo.seoTitle !== original.seoTitle ||
    seo.seoDescription !== original.seoDescription ||
    seo.shareImageUrl !== original.shareImageUrl;

  async function handleSave() {
    setSaving(true);
    try {
      await updateContentSeo(story, seo);
      toast.success("Search and sharing settings saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "The settings could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Stories"
        title={story.headline || story.title}
        description="Story copy is managed outside the dashboard. Here you can set how this story appears in search results and link previews."
        actions={
          <Link href="/content#stories" style={lightPillStyle}>
            All content
          </Link>
        }
      />
      <SeoFieldsSection
        idPrefix="Story"
        path={`/stories/${story.slug ?? ""}`}
        value={seo}
        onChange={setSeo}
        defaults={{
          title: story.headline || story.title,
          description: story.summary,
          imageUrl: story.mediaReferences[0]?.kind === "video"
            ? story.mediaReferences[0]?.posterUrl ?? ""
            : story.mediaReferences[0]?.url ?? "",
        }}
      />
      <div className="dashboard-action-row" style={{ marginTop: 16 }}>
        <button
          disabled={!dirty || saving}
          onClick={() => void handleSave()}
          style={{ ...darkButtonStyle, opacity: !dirty || saving ? 0.6 : 1 }}
          type="button"
        >
          {saving ? "Saving..." : "Save search and sharing"}
        </button>
      </div>
    </div>
  );
}

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
