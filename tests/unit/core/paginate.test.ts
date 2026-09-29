import { describe, expect, it, vi } from "vitest";

import { fetchAllPages, MAX_PAGE_SIZE } from "@/src/core/api/paginate";

function page(start: number, size: number) {
  return Array.from({ length: size }, (_, index) => ({ id: `record-${start + index}` }));
}

describe("fetchAllPages", () => {
  it("reads every page until count is reached", async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce({ count: 150, results: page(0, MAX_PAGE_SIZE) })
      .mockResolvedValueOnce({ count: 150, results: page(100, 50) });

    const records = await fetchAllPages(fetchPage);

    expect(records).toHaveLength(150);
    expect(fetchPage).toHaveBeenNthCalledWith(1, { page: 1, page_size: MAX_PAGE_SIZE });
    expect(fetchPage).toHaveBeenNthCalledWith(2, { page: 2, page_size: MAX_PAGE_SIZE });
  });

  it("does not request a page past an exact multiple of the page size", async () => {
    const fetchPage = vi.fn().mockResolvedValueOnce({ count: 100, results: page(0, MAX_PAGE_SIZE) });

    const records = await fetchAllPages(fetchPage);

    expect(records).toHaveLength(100);
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });

  it("stops on a short page when count is missing", async () => {
    const fetchPage = vi.fn().mockResolvedValueOnce({ results: page(0, 3) });

    expect(await fetchAllPages(fetchPage)).toHaveLength(3);
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });
});
