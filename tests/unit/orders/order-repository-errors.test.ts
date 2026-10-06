import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchDashboardOrders = vi.fn();
const fetchDashboardOrder = vi.fn();
const fetchDashboardReturns = vi.fn();

vi.mock("@/src/features/orders/data/api/order-api-client", () => ({
  fetchDashboardOrders: (...args: unknown[]) => fetchDashboardOrders(...args),
  fetchDashboardOrder: (...args: unknown[]) => fetchDashboardOrder(...args),
  updateDashboardOrder: vi.fn(),
  archiveDashboardOrder: vi.fn(),
}));

vi.mock("@/src/features/returns/data/api/return-api-client", () => ({
  fetchDashboardReturns: (...args: unknown[]) => fetchDashboardReturns(...args),
  fetchDashboardReturn: vi.fn(),
  updateDashboardReturn: vi.fn(),
}));

async function flush() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

beforeEach(() => {
  vi.resetModules();
  fetchDashboardOrders.mockReset();
  fetchDashboardOrder.mockReset();
  fetchDashboardReturns.mockReset();
});

describe("order repository load errors", () => {
  it("exposes the API error instead of silently returning an empty desk", async () => {
    fetchDashboardOrders.mockRejectedValueOnce(new Error("API unavailable"));
    const repo = await import("@/src/features/orders/data/repositories/order-repository");

    repo.getStoredOrdersSnapshot();
    await flush();

    expect(repo.getOrdersErrorSnapshot()?.message).toBe("API unavailable");
    expect(repo.getStoredOrdersSnapshot()).toEqual([]);
  });

  it("retry clears the error and refetches", async () => {
    fetchDashboardOrders
      .mockRejectedValueOnce(new Error("API unavailable"))
      .mockResolvedValueOnce({ results: [{ id: "order-1" }] });
    const repo = await import("@/src/features/orders/data/repositories/order-repository");

    repo.getStoredOrdersSnapshot();
    await flush();
    repo.retryOrdersLoad();

    expect(repo.getOrdersErrorSnapshot()).toBeNull();
    repo.getStoredOrdersSnapshot();
    await flush();

    expect(fetchDashboardOrders).toHaveBeenCalledTimes(2);
    expect(repo.getOrdersErrorSnapshot()).toBeNull();
    expect(repo.getStoredOrdersSnapshot()).toEqual([{ id: "order-1" }]);
  });
});

describe("return repository load errors", () => {
  it("exposes the API error and recovers on retry", async () => {
    fetchDashboardReturns
      .mockRejectedValueOnce(new Error("API unavailable"))
      .mockResolvedValueOnce({ results: [{ id: "return-1" }] });
    const repo = await import("@/src/features/returns/data/repositories/return-repository");

    repo.getStoredReturnsSnapshot();
    await flush();
    expect(repo.getReturnsErrorSnapshot()?.message).toBe("API unavailable");

    repo.retryReturnsLoad();
    repo.getStoredReturnsSnapshot();
    await flush();

    expect(repo.getReturnsErrorSnapshot()).toBeNull();
    expect(repo.getStoredReturnsSnapshot()).toEqual([{ id: "return-1" }]);
  });
});

describe("order repository load state and paging", () => {
  it("reports loading until the first load lands, then ready", async () => {
    fetchDashboardOrders.mockResolvedValueOnce({ count: 1, results: [{ id: "order-1" }] });
    const repo = await import("@/src/features/orders/data/repositories/order-repository");

    repo.getStoredOrdersSnapshot();
    expect(repo.getOrdersStatusSnapshot()).toBe("loading");
    await flush();

    expect(repo.getOrdersStatusSnapshot()).toBe("ready");
  });

  it("reads every page instead of stopping at the first 100 orders", async () => {
    const firstPage = Array.from({ length: 100 }, (_, index) => ({ id: `order-${index}` }));
    fetchDashboardOrders
      .mockResolvedValueOnce({ count: 101, results: firstPage })
      .mockResolvedValueOnce({ count: 101, results: [{ id: "order-100" }] });
    const repo = await import("@/src/features/orders/data/repositories/order-repository");

    repo.getStoredOrdersSnapshot();
    await flush();

    expect(repo.getStoredOrdersSnapshot()).toHaveLength(101);
    expect(repo.getOrderById("order-100")).toEqual({ id: "order-100" });
  });

  it("adds an order fetched directly to the loaded desk", async () => {
    fetchDashboardOrders.mockResolvedValueOnce({ count: 1, results: [{ id: "order-1" }] });
    fetchDashboardOrder.mockResolvedValueOnce({ id: "order-2" });
    const repo = await import("@/src/features/orders/data/repositories/order-repository");

    repo.getStoredOrdersSnapshot();
    await flush();
    await repo.loadOrderIntoDesk("order-2");

    expect(repo.getOrderById("order-2")).toEqual({ id: "order-2" });
  });
});
