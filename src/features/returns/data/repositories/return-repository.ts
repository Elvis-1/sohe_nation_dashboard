import type { DashboardReturnRecord } from "@/src/core/types/dashboard";
import {
  fetchDashboardReturns,
  updateDashboardReturn,
} from "@/src/features/returns/data/api/return-api-client";

const RETURN_CHANGE_EVENT = "sohe-dashboard-returns-change";
const EMPTY_RETURNS: DashboardReturnRecord[] = [];

let cachedReturns: DashboardReturnRecord[] | null = null;
let fetchPromise: Promise<DashboardReturnRecord[]> | null = null;

function dispatchChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(RETURN_CHANGE_EVENT));
  }
}

async function loadReturns(): Promise<DashboardReturnRecord[]> {
  const { results } = await fetchDashboardReturns({ page_size: 100 });
  cachedReturns = results;
  fetchPromise = null;
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
    fetchPromise = loadReturns().catch(() => {
      cachedReturns = EMPTY_RETURNS;
      fetchPromise = null;
      dispatchChange();
      return EMPTY_RETURNS;
    });
  }

  return EMPTY_RETURNS;
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
