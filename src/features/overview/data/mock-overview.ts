import type {
  OverviewMetric,
  OverviewModuleLink,
  OverviewQuickAction,
} from "@/src/core/types/dashboard";

export const overviewMetrics: OverviewMetric[] = [
  {
    label: "Orders today",
    value: "28",
    note: "+6 from yesterday",
    emphasis: "primary" as const,
  },
  {
    label: "Revenue staged",
    value: "NGN 4.8M",
    note: "PayPal and Flutterwave mix holding steady",
    emphasis: "default" as const,
  },
  {
    label: "Low stock",
    value: "7 SKUs",
    note: "Outerwear and headwear need immediate attention",
    emphasis: "warning" as const,
  },
  {
    label: "Returns awaiting review",
    value: "3",
    note: "Two fit requests and one damage check",
    emphasis: "default" as const,
  },
];

export const quickActions: OverviewQuickAction[] = [
  {
    label: "Review returns queue",
    description: "Three customer requests need a decision before the next pickup window.",
    href: "/returns",
  },
  {
    label: "Restock low inventory",
    description: "Seven SKUs are close to running out across active discovery entries.",
    href: "/products",
  },
  {
    label: "Refresh homepage lead",
    description: "Campaign spotlight is ready for the next merchandising swap.",
    href: "/content",
  },
];

export const overviewModules: OverviewModuleLink[] = [
  {
    title: "Products",
    description: "Catalog control for prices, stock, variants, and visibility.",
    href: "/products",
    stat: "42 active product records",
  },
  {
    title: "Orders",
    description: "Payment, fulfillment, and internal movement across every purchase.",
    href: "/orders",
    stat: "11 orders in motion",
  },
  {
    title: "Content",
    description: "Homepage, stories, and merchandising spotlight management.",
    href: "/content",
    stat: "3 campaign surfaces active",
  },
  {
    title: "Returns",
    description: "Customer return queue, review outcomes, and operational follow-through.",
    href: "/returns",
    stat: "3 requests awaiting action",
  },
];
