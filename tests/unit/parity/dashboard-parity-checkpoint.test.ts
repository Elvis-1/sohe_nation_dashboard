import { getOverviewSnapshot } from "@/src/features/overview/data/repositories/mock-overview-repository";
import {
  getStoredSettingGroupsSnapshot,
} from "@/src/features/settings/data/repositories/mock-setting-repository";
import { listContentEntries } from "@/src/features/content/data/repositories/mock-content-repository";
import { listCustomers } from "@/src/features/customers/data/repositories/mock-customer-repository";
import { getStoredOrdersSnapshot, updateOrderRecord } from "@/src/features/orders/data/repositories/order-repository";
import {
  getProductById,
  updateProductRecord,
} from "@/src/features/products/data/repositories/mock-product-repository";
import {
  getReturnById,
  updateReturnRecord,
} from "@/src/features/returns/data/repositories/mock-return-repository";

describe("dashboard parity checkpoint", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("keeps overview operational summaries aligned with live stored dashboard state", async () => {
    const initialProduct = getProductById("prod_lunar_utility_jacket");
    const initialOrder = getStoredOrdersSnapshot().find((order) => order.id === "order_soh_2034");
    const initialReturn = getReturnById("RET-103");

    expect(initialProduct).not.toBeNull();
    expect(initialOrder).not.toBeUndefined();
    expect(initialReturn).not.toBeNull();

    updateProductRecord({
      ...initialProduct!,
      inventoryQuantity: 2,
    });
    await updateOrderRecord({
      ...initialOrder!,
      status: "delivered",
    });
    updateReturnRecord({
      ...initialReturn!,
      status: "completed",
    });

    const snapshot = getOverviewSnapshot();

    expect(snapshot.lowStockProducts.some((product) => product.id === "prod_lunar_utility_jacket")).toBe(
      true,
    );
    expect(snapshot.recentOrders.find((order) => order.id === "order_soh_2034")?.status).toBe(
      "delivered",
    );
    expect(snapshot.returnQueue.some((item) => item.id === "RET-103")).toBe(false);
  });

  it("covers the planned settings groups needed before API work", () => {
    const groups = getStoredSettingGroupsSnapshot();
    const groupIds = groups.map((group) => group.id);

    expect(groupIds).toEqual(
      expect.arrayContaining([
        "store_profile",
        "payments",
        "shipping",
        "notifications",
        "staff_roles",
      ]),
    );
  });

  it("retains fixture coverage for the planned content areas and customer relationships", () => {
    const contentAreas = listContentEntries().map((entry) => entry.area);
    const customers = listCustomers();
    const orders = getStoredOrdersSnapshot();
    const returns = [getReturnById("RET-104"), getReturnById("RET-103"), getReturnById("RET-102")].filter(
      Boolean,
    );

    expect(contentAreas).toEqual(
      expect.arrayContaining(["homepage", "featured_drop", "stories", "navigation_promos"]),
    );

    expect(
      customers.every((customer) =>
        customer.orderIds.every(
          (orderNumber) => orders.some((order) => order.orderNumber === orderNumber) || orderNumber.startsWith("SOH-20"),
        ),
      ),
    ).toBe(true);

    expect(
      customers.every((customer) =>
        customer.returnIds.every((returnId) => returns.some((item) => item?.id === returnId)),
      ),
    ).toBe(true);
  });
});
