import type { DashboardContentRecord } from "@/src/core/types/dashboard";

export const contentEntries: DashboardContentRecord[] = [
  {
    id: "content_homepage_lead",
    area: "homepage",
    title: "Homepage hero and lead merchandising rail",
    visibility: "published",
    linkedProductIds: ["prod_lunar_utility_jacket", "prod_varsity_crest_cap"],
    mediaReferences: [
      {
        id: "media_homepage_drop_hero",
        alt: "Homepage campaign hero for the current drop",
        kind: "image",
        url: "/fixtures/content/homepage-hero.jpg",
      },
    ],
    summary: "Primary homepage hero with lead CTA and highlighted drop rail.",
  },
  {
    id: "content_story_drop_01",
    area: "stories",
    title: "Story and lookbook campaign entries",
    visibility: "ready",
    linkedProductIds: ["prod_rally_knit_set"],
    mediaReferences: [
      {
        id: "media_story_drop_01_cover",
        alt: "Lookbook cover frame for the next story release",
        kind: "image",
        url: "/fixtures/content/story-drop-01.jpg",
      },
    ],
    summary: "Editorial story module with product callouts for the upcoming release.",
  },
  {
    id: "content_navigation_promo",
    area: "navigation_promos",
    title: "Navigation promo slots and footer messaging",
    visibility: "draft",
    linkedProductIds: [],
    mediaReferences: [],
    summary: "Small merchandising hooks for nav and footer promo messaging.",
  },
];
