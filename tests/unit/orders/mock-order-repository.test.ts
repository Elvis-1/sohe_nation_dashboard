import {
  getOrderById,
  getStoredOrdersSnapshot,
  updateOrderRecord,
} from "@/src/features/orders/data/repositories/mock-order-repository";

describe("mock-order-repository", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns the fixture-backed order desk when nothing is stored yet", () => {
    const snapshot = getStoredOrdersSnapshot();

    expect(snapshot.length).toBeGreaterThanOrEqual(3);
    expect(snapshot[0]?.orderNumber).toBe("SOH-2034");
  });

  it("updates and persists an order record in local storage", () => {
    const initialOrder = getOrderById("order_soh_2033");

    expect(initialOrder).not.toBeNull();

    updateOrderRecord({
      ...initialOrder!,
      status: "paid",
      internalNote: "Finance cleared the payment capture.",
    });

    const updatedOrder = getOrderById("order_soh_2033");

    expect(updatedOrder?.status).toBe("paid");
    expect(updatedOrder?.internalNote).toBe("Finance cleared the payment capture.");
  });
});
