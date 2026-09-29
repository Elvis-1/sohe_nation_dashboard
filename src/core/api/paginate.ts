/** Largest `page_size` the API accepts (`apps/common/pagination.py`). */
export const MAX_PAGE_SIZE = 100;

type PageParams = { page: number; page_size: number };
type PageResult<T> = { count?: number; results: T[] };

/**
 * Read every page of a paginated list endpoint.
 * Stops on a short page or once `count` records are collected.
 */
export async function fetchAllPages<T>(
  fetchPage: (params: PageParams) => Promise<PageResult<T>>,
): Promise<T[]> {
  const records: T[] = [];

  for (let page = 1; ; page += 1) {
    const { count, results } = await fetchPage({ page, page_size: MAX_PAGE_SIZE });
    records.push(...results);

    const reachedCount = typeof count === "number" && records.length >= count;
    if (results.length < MAX_PAGE_SIZE || reachedCount) {
      return records;
    }
  }
}

/** Load state for API-backed desks, safe to use as a `useSyncExternalStore` snapshot. */
export type DeskLoadStatus = "loading" | "ready" | "error";
