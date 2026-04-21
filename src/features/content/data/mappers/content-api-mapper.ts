import type { DashboardContentRecord, DashboardMediaReference } from "@/src/core/types/dashboard";

type ApiMediaReference = {
  id: string;
  alt: string;
  kind: DashboardMediaReference["kind"];
  url: string;
  poster_url?: string;
};

type ApiCampaignStat = {
  label: string;
  value: string;
};

type ApiModule = {
  title: string;
  body: string;
};

type ApiHotspot = {
  id: string;
  label: string;
  product_slug: string;
  top: string;
  left: string;
  note: string;
};

export type ApiContentRecord = {
  id: string;
  area: DashboardContentRecord["area"];
  slug?: string | null;
  title: string;
  visibility: DashboardContentRecord["visibility"];
  eyebrow: string;
  headline: string;
  body: string;
  summary: string;
  call_to_action_label: string;
  call_to_action_href: string;
  secondary_call_to_action_label?: string;
  secondary_call_to_action_href?: string;
  chapter_label?: string;
  campaign_statement?: string;
  linked_product_ids: string[];
  media_references: ApiMediaReference[];
  preview_bullets: string[];
  campaign_stats?: ApiCampaignStat[];
  modules?: ApiModule[];
  hotspots?: ApiHotspot[];
  created_at?: string;
  updated_at?: string;
};

export type ApiPaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

function mapMedia(api: ApiMediaReference): DashboardMediaReference {
  return {
    id: api.id,
    alt: api.alt,
    kind: api.kind,
    url: api.url,
    posterUrl: api.poster_url,
  };
}

export function mapApiContentToRecord(api: ApiContentRecord): DashboardContentRecord {
  return {
    id: api.id,
    area: api.area,
    slug: api.slug ?? undefined,
    title: api.title,
    visibility: api.visibility,
    eyebrow: api.eyebrow,
    headline: api.headline,
    body: api.body,
    callToActionLabel: api.call_to_action_label,
    callToActionHref: api.call_to_action_href,
    secondaryCallToActionLabel: api.secondary_call_to_action_label ?? "",
    secondaryCallToActionHref: api.secondary_call_to_action_href ?? "",
    chapterLabel: api.chapter_label ?? "",
    campaignStatement: api.campaign_statement ?? "",
    linkedProductIds: api.linked_product_ids ?? [],
    mediaReferences: (api.media_references ?? []).map(mapMedia),
    previewBullets: api.preview_bullets ?? [],
    campaignStats: api.campaign_stats ?? [],
    modules: api.modules ?? [],
    hotspots: (api.hotspots ?? []).map((hotspot) => ({
      id: hotspot.id,
      label: hotspot.label,
      productSlug: hotspot.product_slug,
      top: hotspot.top,
      left: hotspot.left,
      note: hotspot.note,
    })),
    summary: api.summary,
  };
}
