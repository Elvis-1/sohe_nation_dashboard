import { beforeEach, describe, expect, it, vi } from "vitest";

// Fixtures are real responses recorded from the seeded e2e API (api `seed_e2e`,
// api/scripts/run_e2e_api.sh). Re-record them when a serializer changes shape.
import contentList from "./fixtures/content.json";
import notificationProvider from "./fixtures/notification-provider.json";
import notificationList from "./fixtures/notifications.json";
import orderList from "./fixtures/orders.json";
import productDetail from "./fixtures/product-detail.json";
import productList from "./fixtures/products.json";
import returnList from "./fixtures/returns.json";
import settingGroups from "./fixtures/settings.json";
import staffDetail from "./fixtures/staff-detail.json";
import staffList from "./fixtures/staff.json";

const apiRequest = vi.fn();

vi.mock("@/src/core/api/http-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/src/core/api/http-client")>()),
  apiRequest: (...args: unknown[]) => apiRequest(...args),
}));

import { fetchDashboardContent } from "@/src/features/content/data/api/content-api-client";
import {
  fetchNotificationLogs,
  fetchNotificationProviderStatus,
} from "@/src/features/notifications/data/api/notifications-api-client";
import { fetchDashboardOrders } from "@/src/features/orders/data/api/order-api-client";
import {
  fetchDashboardProduct,
  fetchDashboardProducts,
} from "@/src/features/products/data/api/product-api-client";
import { fetchDashboardReturns } from "@/src/features/returns/data/api/return-api-client";
import { fetchDashboardSettings } from "@/src/features/settings/data/api/settings-api-client";
import { fetchStaffList, fetchStaffMember } from "@/src/features/staff/data/api/staff-api-client";

/** Paths of `undefined` values, i.e. fields the mapper read from a key the API does not send. */
function undefinedPaths(value: unknown, optional: string[] = [], path = ""): string[] {
  if (value === undefined) return optional.includes(path) ? [] : [path];
  if (Array.isArray(value)) return value.flatMap((item) => undefinedPaths(item, optional, `${path}[]`));
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) =>
      undefinedPaths(child, optional, path ? `${path}.${key}` : key),
    );
  }
  return [];
}

function uniq(paths: string[]) {
  return [...new Set(paths)];
}

beforeEach(() => {
  apiRequest.mockReset();
});

describe("dashboard API adapters against recorded API responses", () => {
  it("orders map every field the desk and detail page use", async () => {
    apiRequest.mockResolvedValueOnce(orderList);
    const { count, results } = await fetchDashboardOrders();

    expect(count).toBe(orderList.count);
    const source = orderList.results[0];
    expect(results[0]).toMatchObject({
      id: source.id,
      orderNumber: source.order_number,
      customerId: source.customer_id,
      paymentProvider: source.payment_provider,
      shippingAddress: source.shipping_address,
      total: { amount: source.total.amount, formatted: source.total.formatted },
    });
    expect(results[0].shippingDetails).toEqual({
      recipientName: "Tomi Alade",
      phone: "+2348030000000",
      line1: "4 Raymond Njoku Street",
      line2: "",
      city: "Ikoyi",
      state: "Lagos",
      postalCode: "",
      countryCode: "NG",
    });
    // Orders placed before structured snapshots only carry the text address.
    expect(results[1].shippingDetails).toBeNull();
    expect(results[0].lines[0]).toMatchObject({
      variantId: source.lines[0].variant_id,
      variantLabel: source.lines[0].variant_label,
    });
    expect(uniq(results.flatMap((r) => undefinedPaths(r)))).toEqual([]);
  });

  it("returns map customer, order, and decision fields", async () => {
    apiRequest.mockResolvedValueOnce(returnList);
    const { results } = await fetchDashboardReturns();

    const source = returnList.results[0];
    expect(results[0]).toMatchObject({
      orderId: source.order_id,
      customerId: source.customer_id,
      itemSummary: source.item_summary,
      internalDecision: source.internal_decision,
    });
    expect(uniq(results.flatMap((r) => undefinedPaths(r)))).toEqual([]);
  });

  it("product list maps gender to audience and variant stock", async () => {
    apiRequest.mockResolvedValueOnce(productList);
    const { results } = await fetchDashboardProducts();

    const source = productList.results[0];
    expect(results[0]).toMatchObject({
      id: source.id,
      audience: source.gender,
      inventoryQuantity: source.inventory_quantity,
    });
    expect(results[0].variants[0].inventoryQuantity).toBe(source.variants[0].inventory_quantity);
    // compareAtPrice is legitimately absent when a product has no sale price.
    const optional = ["compareAtPrice", "variants[].compareAtPrice"];
    expect(uniq(results.flatMap((r) => undefinedPaths(r, optional)))).toEqual([]);
  });

  it("product detail carries the narrative and regions the editor saves back", async () => {
    apiRequest.mockResolvedValueOnce(productDetail);
    const product = await fetchDashboardProduct(productDetail.id);

    expect(product.narrative).toEqual({
      campaignNote: productDetail.narrative.campaign_note,
      fitGuidance: productDetail.narrative.fit_guidance,
      materialStory: productDetail.narrative.material_story,
      sustainabilityNote: productDetail.narrative.sustainability_note,
      deliveryNote: productDetail.narrative.delivery_note,
    });
    expect(product.defaultRegion).toBe(productDetail.default_region);
    expect(product.regionAvailability).toEqual(productDetail.region_availability);
  });

  it("content maps homepage records including media and linked products", async () => {
    apiRequest.mockResolvedValueOnce(contentList);
    const { results } = await fetchDashboardContent();

    const source = contentList.results[0];
    expect(results[0]).toMatchObject({ id: source.id, area: source.area, visibility: source.visibility });
    expect(results[0].linkedProductIds).toEqual(source.linked_product_ids);
    // slug is null for non-story areas; posterUrl only exists on video media.
    const optional = ["slug", "mediaReferences[].posterUrl"];
    expect(uniq(results.flatMap((r) => undefinedPaths(r, optional)))).toEqual([]);
  });

  it("settings map grouped fields", async () => {
    apiRequest.mockResolvedValueOnce(settingGroups);
    const groups = await fetchDashboardSettings();

    expect(groups.map((g) => g.id)).toEqual(settingGroups.map((g) => g.id));
    expect(groups[0].fields[0]).toMatchObject({
      id: settingGroups[0].fields[0].id,
      label: settingGroups[0].fields[0].label,
      value: settingGroups[0].fields[0].value,
      placeholder: settingGroups[0].fields[0].placeholder,
      type: "text",
    });

    // Typed fields carry their control options (Slice 14A).
    const returns = groups.find((g) => g.id === "returns");
    const window = returns?.fields.find((f) => f.id === "return_window_days");
    expect(window).toMatchObject({ type: "integer", options: { min: 1, max: 90, unit: "days" } });
    const regions = returns?.fields.find((f) => f.id === "final_sale_regions");
    expect(regions?.type).toBe("multi_choice");
    expect(regions?.options.choices?.map((c) => c.value)).toEqual(["NG", "GB", "US", "EU"]);
    expect(returns?.fields.find((f) => f.id === "faulty_always_returnable")?.options.locked).toBe(true);
  });

  it("staff list and detail map owner flags and the audit log", async () => {
    apiRequest.mockResolvedValueOnce(staffList).mockResolvedValueOnce(staffDetail);

    const members = await fetchStaffList();
    const member = await fetchStaffMember(staffDetail.id);

    expect(members.some((m) => m.isOwner)).toBe(true);
    // auditLog is only sent on detail reads.
    expect(uniq(members.flatMap((m) => undefinedPaths(m, ["auditLog"])))).toEqual([]);
    expect(member.auditLog?.[0]).toMatchObject({
      action: staffDetail.audit_log[0].action,
      performedByEmail: staffDetail.audit_log[0].performed_by_email,
    });
  });

  it("notification logs and provider status map delivery details", async () => {
    apiRequest.mockResolvedValueOnce(notificationList).mockResolvedValueOnce(notificationProvider);

    const logs = await fetchNotificationLogs();
    const provider = await fetchNotificationProviderStatus();

    expect(logs[0]).toMatchObject({
      recipientEmail: notificationList.results[0].recipient_email,
      backendName: notificationList.results[0].backend_name,
      canRetry: notificationList.results[0].can_retry,
    });
    // retryOfId is absent on first attempts.
    expect(uniq(logs.flatMap((l) => undefinedPaths(l, ["retryOfId"])))).toEqual([]);
    expect(provider).toMatchObject({
      backendName: notificationProvider.backend_name,
      deliveryMode: notificationProvider.delivery_mode,
      isLiveBackend: notificationProvider.is_live_backend,
    });
  });
});
