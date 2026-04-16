import { mockOrders } from "@/src/features/orders/data/mock-orders";

export function listOrders() {
  return mockOrders;
}

export function listRecentOrders(limit = 3) {
  return mockOrders.slice(0, limit);
}
