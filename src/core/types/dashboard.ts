export type CurrencyCode = "NGN" | "USD" | "GBP" | "EUR";

export type Money = {
  amount: number;
  currency: CurrencyCode;
  formatted: string;
};

export type DashboardMediaReference = {
  id: string;
  alt: string;
  kind: "image" | "video";
  url: string;
};

export type ProductVisibility = "draft" | "published" | "scheduled";

export type ProductAudience = "women" | "men" | "unisex";
export type ProductRegion = "NG" | "US" | "GB" | "EU";

export type ProductCategory =
  | "tracksuit"
  | "outerwear"
  | "tops"
  | "bottoms"
  | "headwear";

export type DashboardProductVariant = {
  id: string;
  sku: string;
  size: string;
  color: string;
  inventoryQuantity: number;
  isAvailable: boolean;
  price: Money;
  compareAtPrice?: Money;
};

export type DashboardProductRecord = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: ProductCategory;
  audience: ProductAudience;
  defaultRegion: ProductRegion;
  regionAvailability: ProductRegion[];
  visibility: ProductVisibility;
  price: Money;
  compareAtPrice?: Money;
  inventoryQuantity: number;
  primaryMedia: DashboardMediaReference;
  narrative?: {
    campaignNote: string;
    fitGuidance: string;
    materialStory: string;
    sustainabilityNote: string;
    deliveryNote: string;
  };
  variants: DashboardProductVariant[];
};

export type PaymentProvider = "paypal" | "flutterwave";

export type OrderStatus =
  | "awaiting_capture"
  | "paid"
  | "ready_to_fulfill"
  | "fulfilled"
  | "delivered"
  | "cancelled";

export type DashboardOrderLine = {
  id: string;
  productId: string;
  variantId: string;
  title: string;
  variantLabel: string;
  quantity: number;
  unitPrice: Money;
};

export type DashboardOrderRecord = {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  paymentProvider: PaymentProvider;
  total: Money;
  createdAt: string;
  shippingAddress: string;
  fulfillmentNote: string;
  internalNote: string;
  lines: DashboardOrderLine[];
};

export type DashboardContentArea =
  | "homepage"
  | "stories"
  | "featured_drop"
  | "navigation_promos";

export type ContentVisibility = "draft" | "ready" | "published";

export type DashboardContentRecord = {
  id: string;
  area: DashboardContentArea;
  title: string;
  visibility: ContentVisibility;
  eyebrow: string;
  headline: string;
  body: string;
  callToActionLabel: string;
  callToActionHref: string;
  linkedProductIds: string[];
  mediaReferences: DashboardMediaReference[];
  previewBullets: string[];
  summary: string;
};

export type ReturnStatus = "new" | "in_review" | "approved" | "rejected" | "completed";

export type DashboardReturnRecord = {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  status: ReturnStatus;
  reason: string;
  requestedAt: string;
  itemSummary: string;
  customerNote: string;
  internalDecision: string;
};

export type DashboardCustomerRecord = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  defaultRegion: "NG" | "US" | "GB" | "EU";
  orderIds: string[];
  returnIds: string[];
  addressCount: number;
};

export type DashboardSettingField = {
  id: string;
  label: string;
  value: string;
  placeholder?: boolean;
};

export type DashboardSettingGroup = {
  id: string;
  title: string;
  description: string;
  fields: DashboardSettingField[];
};

export type OverviewMetric = {
  label: string;
  value: string;
  note: string;
  emphasis: "primary" | "default" | "warning";
};

export type OverviewQuickAction = {
  label: string;
  description: string;
  href: string;
};

export type OverviewModuleLink = {
  title: string;
  description: string;
  href: string;
  stat: string;
};

export type OverviewSnapshot = {
  overviewMetrics: OverviewMetric[];
  overviewModules: OverviewModuleLink[];
  quickActions: OverviewQuickAction[];
  recentOrders: DashboardOrderRecord[];
  lowStockProducts: DashboardProductRecord[];
  returnQueue: DashboardReturnRecord[];
  prioritySummary: {
    activeOrderCount: number;
    lowStockCount: number;
    returnQueueCount: number;
  };
};
