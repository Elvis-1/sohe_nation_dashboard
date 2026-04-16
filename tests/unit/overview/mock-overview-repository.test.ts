import { getOverviewSnapshot } from "@/src/features/overview/data/repositories/mock-overview-repository";

describe("overview snapshot repository", () => {
  it("returns the cross-module overview data required by the dashboard landing page", () => {
    const snapshot = getOverviewSnapshot();

    expect(snapshot.overviewMetrics.length).toBeGreaterThanOrEqual(4);
    expect(snapshot.quickActions.length).toBeGreaterThanOrEqual(3);
    expect(snapshot.overviewModules.length).toBeGreaterThanOrEqual(4);
    expect(snapshot.recentOrders.length).toBeGreaterThanOrEqual(3);
    expect(snapshot.lowStockProducts.every((product) => product.inventoryQuantity <= 5)).toBe(true);
    expect(
      snapshot.returnQueue.every(
        (item) => item.status === "new" || item.status === "in_review",
      ),
    ).toBe(true);
    expect(snapshot.prioritySummary.activeOrderCount).toBeGreaterThanOrEqual(1);
    expect(snapshot.prioritySummary.lowStockCount).toBe(snapshot.lowStockProducts.length);
    expect(snapshot.prioritySummary.returnQueueCount).toBe(snapshot.returnQueue.length);
  });
});
