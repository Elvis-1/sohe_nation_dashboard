/**
 * Maps API snake_case product responses to the DashboardProductRecord shape.
 *
 * Key reconciliations:
 *   API `gender`           → Dashboard `audience`
 *   API `inventory_quantity` → Dashboard `inventoryQuantity`
 *   API `primary_media`    → Dashboard `primaryMedia`
 *   API `compare_at_price` → Dashboard `compareAtPrice`
 */

import type {
  DashboardProductRecord,
  DashboardProductVariant,
  DashboardMediaReference,
  Money,
  ProductRegion,
} from "@/src/core/types/dashboard";

// ---------------------------------------------------------------------------
// Raw API response shapes (snake_case from Django/DRF)
// ---------------------------------------------------------------------------

type ApiMoney = {
  amount: number;
  currency: string;
  formatted: string;
};

type ApiVariant = {
  id: string;
  sku: string;
  size: string;
  color: string;
  inventory_quantity: number;
  is_available: boolean;
  price: ApiMoney;
  compare_at_price: ApiMoney | null;
};

type ApiMedia = {
  id: string;
  alt: string;
  kind: "image" | "video";
  url: string;
  is_primary: boolean;
};

type ApiNarrative = {
  campaign_note?: string;
  fit_guidance?: string;
  material_story?: string;
  sustainability_note?: string;
  delivery_note?: string;
} | null;

export type ApiProductRecord = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: DashboardProductRecord["category"];
  gender: DashboardProductRecord["audience"];
  visibility: DashboardProductRecord["visibility"];
  price: ApiMoney | null;
  compare_at_price: ApiMoney | null;
  inventory_quantity: number;
  primary_media: ApiMedia | null;
  narrative?: ApiNarrative;
  variants: ApiVariant[];
  badge?: string;
  description?: string;
  default_region?: string;
  region_availability?: string[];
  created_at?: string;
  updated_at?: string;
};

export type ApiPaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function mapMoney(api: ApiMoney): Money {
  return {
    amount: api.amount,
    currency: api.currency as Money["currency"],
    formatted: api.formatted,
  };
}

function mapMedia(api: ApiMedia): DashboardMediaReference {
  return {
    id: api.id,
    alt: api.alt,
    kind: api.kind,
    url: api.url,
  };
}

function mapVariant(api: ApiVariant): DashboardProductVariant {
  return {
    id: api.id,
    sku: api.sku,
    size: api.size,
    color: api.color,
    inventoryQuantity: api.inventory_quantity,
    isAvailable: api.is_available,
    price: mapMoney(api.price),
    compareAtPrice: api.compare_at_price ? mapMoney(api.compare_at_price) : undefined,
  };
}

function mapNarrative(api: ApiNarrative): NonNullable<DashboardProductRecord["narrative"]> {
  return {
    campaignNote: api?.campaign_note ?? "",
    fitGuidance: api?.fit_guidance ?? "",
    materialStory: api?.material_story ?? "",
    sustainabilityNote: api?.sustainability_note ?? "",
    deliveryNote: api?.delivery_note ?? "",
  };
}

export function mapApiProductToRecord(api: ApiProductRecord): DashboardProductRecord {
  const fallbackMedia: DashboardMediaReference = {
    id: `${api.id}_placeholder`,
    alt: `${api.title} image`,
    kind: "image",
    url: "/fixtures/products/placeholder.jpg",
  };

  const fallbackMoney: Money = {
    amount: 0,
    currency: "NGN",
    formatted: "NGN 0",
  };

  return {
    id: api.id,
    slug: api.slug,
    title: api.title,
    subtitle: api.subtitle,
    category: api.category,
    audience: api.gender,       // API uses `gender`, dashboard uses `audience`
    defaultRegion: (api.default_region ?? "NG") as ProductRegion,
    regionAvailability: (api.region_availability ?? []) as ProductRegion[],
    visibility: api.visibility,
    price: api.price ? mapMoney(api.price) : fallbackMoney,
    compareAtPrice: api.compare_at_price ? mapMoney(api.compare_at_price) : undefined,
    inventoryQuantity: api.inventory_quantity,
    primaryMedia: api.primary_media ? mapMedia(api.primary_media) : fallbackMedia,
    narrative: mapNarrative(api.narrative ?? null),
    variants: api.variants.map(mapVariant),
  };
}
