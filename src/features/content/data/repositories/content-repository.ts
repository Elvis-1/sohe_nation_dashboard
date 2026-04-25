import type { DashboardContentArea, DashboardContentRecord } from "@/src/core/types/dashboard";
import {
  fetchDashboardContent,
  updateDashboardContentRecord,
} from "@/src/features/content/data/api/content-api-client";

const CONTENT_CHANGE_EVENT = "sohe-dashboard-content-change";
const EMPTY_CONTENT: DashboardContentRecord[] = [];

let cachedContent: DashboardContentRecord[] | null = null;
let fetchPromise: Promise<DashboardContentRecord[]> | null = null;
let lastContentError: Error | null = null;

function buildWritePayload(nextRecord: DashboardContentRecord) {
  switch (nextRecord.area) {
    case "homepage":
      return {
        visibility: nextRecord.visibility,
        media_references: nextRecord.mediaReferences.map((media) => ({
          id: media.id,
          alt: media.alt,
          kind: media.kind,
          url: media.url,
          poster_url: media.posterUrl,
        })),
      };
    case "featured_drop":
      return {
        visibility: nextRecord.visibility,
        linked_product_ids: nextRecord.linkedProductIds,
      };
    case "navigation_promos":
      return {
        visibility: nextRecord.visibility,
      };
    case "stories":
    default:
      return {
        area: nextRecord.area,
        slug: nextRecord.slug,
        title: nextRecord.title,
        visibility: nextRecord.visibility,
        eyebrow: nextRecord.eyebrow,
        headline: nextRecord.headline,
        body: nextRecord.body,
        summary: nextRecord.summary,
        call_to_action_label: nextRecord.callToActionLabel,
        call_to_action_href: nextRecord.callToActionHref,
        secondary_call_to_action_label: nextRecord.secondaryCallToActionLabel,
        secondary_call_to_action_href: nextRecord.secondaryCallToActionHref,
        chapter_label: nextRecord.chapterLabel,
        campaign_statement: nextRecord.campaignStatement,
        linked_product_ids: nextRecord.linkedProductIds,
        media_references: nextRecord.mediaReferences.map((media) => ({
          id: media.id,
          alt: media.alt,
          kind: media.kind,
          url: media.url,
          poster_url: media.posterUrl,
        })),
        preview_bullets: nextRecord.previewBullets,
        campaign_stats: nextRecord.campaignStats,
        modules: nextRecord.modules,
        hotspots: nextRecord.hotspots?.map((hotspot) => ({
          id: hotspot.id,
          label: hotspot.label,
          product_slug: hotspot.productSlug,
          top: hotspot.top,
          left: hotspot.left,
          note: hotspot.note,
        })),
      };
  }
}

function dispatchChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CONTENT_CHANGE_EVENT));
  }
}

async function loadContent(): Promise<DashboardContentRecord[]> {
  const { results } = await fetchDashboardContent({ page_size: 100 });
  cachedContent = results;
  fetchPromise = null;
  lastContentError = null;
  dispatchChange();
  return results;
}

export function subscribeToStoredContent(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  const handle = () => onStoreChange();
  window.addEventListener(CONTENT_CHANGE_EVENT, handle);
  return () => window.removeEventListener(CONTENT_CHANGE_EVENT, handle);
}

export function getStoredContentSnapshot(): DashboardContentRecord[] {
  if (cachedContent !== null) return cachedContent;

  if (!fetchPromise) {
    fetchPromise = loadContent().catch((error) => {
      cachedContent = EMPTY_CONTENT;
      fetchPromise = null;
      lastContentError = error instanceof Error ? error : new Error("Content fetch failed.");
      dispatchChange();
      return EMPTY_CONTENT;
    });
  }

  return EMPTY_CONTENT;
}

export function getServerContentSnapshot(): DashboardContentRecord[] {
  return EMPTY_CONTENT;
}

export function getContentErrorSnapshot(): Error | null {
  return lastContentError;
}

export function getContentEntryByArea(area: DashboardContentArea) {
  return getStoredContentSnapshot().find((entry) => entry.area === area) ?? null;
}

export async function updateContentRecord(
  nextRecord: DashboardContentRecord,
): Promise<DashboardContentRecord> {
  const updated = await updateDashboardContentRecord(nextRecord.id, buildWritePayload(nextRecord));

  if (cachedContent !== null) {
    cachedContent = cachedContent.map((entry) => (entry.id === updated.id ? updated : entry));
  }
  dispatchChange();
  return updated;
}
