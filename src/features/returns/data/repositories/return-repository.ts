import { fetchAllPages, type DeskLoadStatus } from "@/src/core/api/paginate";
import type { DashboardReturnRecord } from "@/src/core/types/dashboard";
import {
  fetchDashboardReturn,
  fetchDashboardReturns,
  updateDashboardReturn,
} from "@/src/features/returns/data/api/return-api-client";

const RETURN_CHANGE_EVENT = "sohe-dashboard-returns-change";
const EMPTY_RETURNS: DashboardReturnRecord[] = [];

let cachedReturns: DashboardReturnRecord[] | null = null;
let lastReturnsError: Error | null = null;
let fetchPromise: Promise<DashboardReturnRecord[]> | null = null;

function dispatchChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(RETURN_CHANGE_EVENT));
  }
}

async function loadReturns(): Promise<DashboardReturnRecord[]> {
  const results = await fetchAllPages(fetchDashboardReturns);
  cachedReturns = results;
  fetchPromise = null;
  lastReturnsError = null;
  dispatchChange();
  return results;
}

export function subscribeToStoredReturns(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  const handle = () => onStoreChange();
  window.addEventListener(RETURN_CHANGE_EVENT, handle);
  return () => window.removeEventListener(RETURN_CHANGE_EVENT, handle);
}

export function getStoredReturnsSnapshot(): DashboardReturnRecord[] {
  if (cachedReturns !== null) return cachedReturns;

  if (!fetchPromise) {
    fetchPromise = loadReturns().catch((error) => {
      cachedReturns = EMPTY_RETURNS;
      fetchPromise = null;
      lastReturnsError = error instanceof Error ? error : new Error("Returns fetch failed.");
      dispatchChange();
      return EMPTY_RETURNS;
    });
  }

  return EMPTY_RETURNS;
}

export function getReturnsErrorSnapshot(): Error | null {
  return lastReturnsError;
}

export function getReturnsStatusSnapshot(): DeskLoadStatus {
  if (lastReturnsError) return "error";
  return cachedReturns === null ? "loading" : "ready";
}

/** Drop the cached desk (including a failed load) so the next read refetches from the API. */
export function retryReturnsLoad(): void {
  cachedReturns = null;
  lastReturnsError = null;
  fetchPromise = null;
  dispatchChange();
}

export function getServerReturnsSnapshot(): DashboardReturnRecord[] {
  return EMPTY_RETURNS;
}

export function listReturns(): DashboardReturnRecord[] {
  return getStoredReturnsSnapshot();
}

export function listPendingReturns(): DashboardReturnRecord[] {
  return getStoredReturnsSnapshot().filter(
    (item) => item.status === "new" || item.status === "in_review",
  );
}

export function getReturnById(returnId: string): DashboardReturnRecord | null {
  return getStoredReturnsSnapshot().find((item) => item.id === returnId) ?? null;
}

/**
 * Fetch one return straight from the API and add it to the queue.
 * Used when a detail page opens a return the loaded queue does not contain.
 */
export async function loadReturnIntoDesk(returnId: string): Promise<DashboardReturnRecord | null> {
  let record: DashboardReturnRecord;
  try {
    record = await fetchDashboardReturn(returnId);
  } catch {
    return null;
  }
  if (cachedReturns !== null && !cachedReturns.some((item) => item.id === record.id)) {
    cachedReturns = [record, ...cachedReturns];
    dispatchChange();
  }
  return record;
}

export async function updateReturnRecord(
  nextReturn: DashboardReturnRecord,
): Promise<DashboardReturnRecord> {
  const updated = await updateDashboardReturn(nextReturn.id, {
    status: nextReturn.status,
    internal_decision: nextReturn.internalDecision,
  });
  if (cachedReturns !== null) {
    cachedReturns = cachedReturns.map((r) => (r.id === updated.id ? updated : r));
  }
  dispatchChange();
  return updated;
}
