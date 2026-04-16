import type { DashboardContentRecord } from "@/src/core/types/dashboard";

export const contentEntries: DashboardContentRecord[] = [
  {
    id: "content_homepage_lead",
    area: "homepage",
    title: "Homepage hero and lead merchandising rail",
    visibility: "published",
    eyebrow: "Campaign 01",
    headline: "Built Like An Army",
    body:
      "A sharp homepage hero for the current drop, pairing disciplined campaign language with the products staff need to push first.",
    callToActionLabel: "Shop The Drop",
    callToActionHref: "/products",
    linkedProductIds: ["prod_lunar_utility_jacket", "prod_varsity_crest_cap"],
    mediaReferences: [
      {
        id: "media_homepage_drop_hero",
        alt: "Homepage campaign hero for the current drop",
        kind: "image",
        url: "/fixtures/content/homepage-hero.jpg",
      },
    ],
    previewBullets: ["Hero headline", "Lead CTA", "Primary merchandising rail"],
    summary: "Primary homepage hero with lead CTA and highlighted drop rail.",
  },
  {
    id: "content_featured_drop_rail",
    area: "featured_drop",
    title: "Featured drop merchandising rail",
    visibility: "ready",
    eyebrow: "Drop Focus",
    headline: "Lead pieces for the next homepage swap",
    body:
      "Merchandising slot for the pieces that should define the release, ordered to support discovery and PDP traffic.",
    callToActionLabel: "Open Products",
    callToActionHref: "/products",
    linkedProductIds: [
      "prod_lunar_utility_jacket",
      "prod_rally_knit_set",
      "prod_varsity_crest_cap",
    ],
    mediaReferences: [
      {
        id: "media_featured_drop_grid",
        alt: "Merchandising frame for the featured drop rail",
        kind: "image",
        url: "/fixtures/content/featured-drop-grid.jpg",
      },
    ],
    previewBullets: ["Merchandising rail", "Linked product order", "Drop support copy"],
    summary: "Homepage featured-drop rail with linked products for the current release.",
  },
  {
    id: "content_story_drop_01",
    area: "stories",
    title: "Story and lookbook campaign entries",
    visibility: "ready",
    eyebrow: "Lookbook 01",
    headline: "Built Like An Army",
    body:
      "Editorial story module with campaign framing, lookbook context, and product callouts for the next release window.",
    callToActionLabel: "Enter The Story",
    callToActionHref: "/stories/built-like-an-army",
    linkedProductIds: ["prod_rally_knit_set"],
    mediaReferences: [
      {
        id: "media_story_drop_01_cover",
        alt: "Lookbook cover frame for the next story release",
        kind: "image",
        url: "/fixtures/content/story-drop-01.jpg",
      },
    ],
    previewBullets: ["Story cover", "Campaign summary", "Linked product callouts"],
    summary: "Editorial story module with product callouts for the upcoming release.",
  },
  {
    id: "content_navigation_promo",
    area: "navigation_promos",
    title: "Navigation promo slots and footer messaging",
    visibility: "draft",
    eyebrow: "Navigation Push",
    headline: "Stories and restock messaging",
    body:
      "Compact promo copy for navigation and footer touchpoints, used to move staff-approved campaign messages into storefront support slots.",
    callToActionLabel: "Read The Lookbook",
    callToActionHref: "/stories",
    linkedProductIds: ["prod_varsity_crest_cap"],
    mediaReferences: [
      {
        id: "media_navigation_promo_badge",
        alt: "Promo tile art for navigation messaging",
        kind: "image",
        url: "/fixtures/content/navigation-promo-badge.jpg",
      },
    ],
    previewBullets: ["Navigation promo label", "Footer support message", "Story CTA"],
    summary: "Small merchandising hooks for nav and footer promo messaging.",
  },
];
