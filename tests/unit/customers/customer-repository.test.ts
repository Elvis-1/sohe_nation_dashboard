import { beforeEach, describe, expect, it, vi } from "vitest";

const apiRequest = vi.fn();

vi.mock("@/src/core/api/http-client", () => ({
  apiRequest: (...args: unknown[]) => apiRequest(...args),
}));

import {
  CUSTOMER_PAGE_SIZE,
  fetchCustomerPage,
} from "@/src/features/customers/data/repositories/customer-repository";

const apiCustomer = {
  id: "c1",
  email: "ada@example.com",
  first_name: "Ada",
  last_name: "Nwosu",
  default_region: "NG",
  order_count: 4,
  return_count: 1,
  address_count: 2,
};

beforeEach(() => {
  apiRequest.mockReset();
});

describe("fetchCustomerPage", () => {
  it("sends search, region, and page to the API instead of filtering locally", async () => {
    apiRequest.mockResolvedValueOnce({ count: 30, results: [apiCustomer] });

    await fetchCustomerPage({ search: "  ada ", region: "NG", page: 2 });

    const path = apiRequest.mock.calls[0][0] as string;
    const query = new URL(path, "http://dashboard.test").searchParams;
    expect(query.get("search")).toBe("ada");
    expect(query.get("default_region")).toBe("NG");
    expect(query.get("page")).toBe("2");
    expect(query.get("page_size")).toBe(String(CUSTOMER_PAGE_SIZE));
  });

  it("omits empty filters", async () => {
    apiRequest.mockResolvedValueOnce({ count: 0, results: [] });

    await fetchCustomerPage({ search: " ", region: "", page: 1 });

    const query = new URL(apiRequest.mock.calls[0][0] as string, "http://dashboard.test").searchParams;
    expect(query.has("search")).toBe(false);
    expect(query.has("default_region")).toBe(false);
  });

  it("maps list counts, which the list endpoint sends instead of id arrays", async () => {
    apiRequest.mockResolvedValueOnce({ count: 1, results: [apiCustomer] });

    const { count, results } = await fetchCustomerPage({ search: "", region: "", page: 1 });

    expect(count).toBe(1);
    expect(results[0]).toMatchObject({ orderCount: 4, returnCount: 1, addressCount: 2, orderIds: [] });
  });
});
