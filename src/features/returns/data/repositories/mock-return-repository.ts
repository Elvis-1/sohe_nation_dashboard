import { mockReturns } from "@/src/features/returns/data/mock-returns";

export function listReturns() {
  return mockReturns;
}

export function listPendingReturns() {
  return mockReturns.filter((item) => item.status === "new" || item.status === "in_review");
}
