import { mockReturns } from "@/src/features/returns/data/mock-returns";

const RETURN_STORAGE_KEY = "sohe-dashboard-returns";
const RETURN_CHANGE_EVENT = "sohe-dashboard-returns-change";

let cachedReturnsRaw: string | null | undefined;
let cachedReturnsValue: typeof mockReturns | undefined;

export function listReturns() {
  return mockReturns;
}

export function listPendingReturns() {
  return getStoredReturnsSnapshot().filter((item) => item.status === "new" || item.status === "in_review");
}

function cloneReturns() {
  return JSON.parse(JSON.stringify(mockReturns)) as typeof mockReturns;
}

function readStoredReturns() {
  if (typeof window === "undefined") {
    return cloneReturns();
  }

  const rawValue = window.localStorage.getItem(RETURN_STORAGE_KEY);

  if (!rawValue) {
    return cloneReturns();
  }

  try {
    return JSON.parse(rawValue) as typeof mockReturns;
  } catch {
    window.localStorage.removeItem(RETURN_STORAGE_KEY);
    return cloneReturns();
  }
}

function dispatchReturnChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(RETURN_CHANGE_EVENT));
  }
}

export function subscribeToStoredReturns(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === RETURN_STORAGE_KEY) {
      onStoreChange();
    }
  };

  const handleReturnChange = () => {
    onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(RETURN_CHANGE_EVENT, handleReturnChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(RETURN_CHANGE_EVENT, handleReturnChange);
  };
}

export function getStoredReturnsSnapshot() {
  if (typeof window === "undefined") {
    return listReturns();
  }

  const rawValue = window.localStorage.getItem(RETURN_STORAGE_KEY);

  if (rawValue === cachedReturnsRaw && cachedReturnsValue !== undefined) {
    return cachedReturnsValue;
  }

  cachedReturnsRaw = rawValue;
  cachedReturnsValue = readStoredReturns();

  return cachedReturnsValue;
}

export function getReturnById(returnId: string) {
  return getStoredReturnsSnapshot().find((item) => item.id === returnId) ?? null;
}

export function updateReturnRecord(nextReturn: (typeof mockReturns)[number]) {
  const currentReturns = readStoredReturns();
  const updatedReturns = currentReturns.map((item) =>
    item.id === nextReturn.id ? nextReturn : item,
  );

  window.localStorage.setItem(RETURN_STORAGE_KEY, JSON.stringify(updatedReturns));
  dispatchReturnChange();
}
