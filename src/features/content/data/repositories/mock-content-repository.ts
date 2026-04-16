import { contentEntries } from "@/src/features/content/data/mock-content";

const CONTENT_STORAGE_KEY = "sohe-dashboard-content";
const CONTENT_CHANGE_EVENT = "sohe-dashboard-content-change";

let cachedContentRaw: string | null | undefined;
let cachedContentValue: typeof contentEntries | undefined;

export function listContentEntries() {
  return contentEntries;
}

function cloneContentEntries() {
  return JSON.parse(JSON.stringify(contentEntries)) as typeof contentEntries;
}

function readStoredContentEntries() {
  if (typeof window === "undefined") {
    return cloneContentEntries();
  }

  const rawValue = window.localStorage.getItem(CONTENT_STORAGE_KEY);

  if (!rawValue) {
    return cloneContentEntries();
  }

  try {
    const parsedValue = JSON.parse(rawValue) as typeof contentEntries;

    return parsedValue;
  } catch {
    window.localStorage.removeItem(CONTENT_STORAGE_KEY);
    return cloneContentEntries();
  }
}

function dispatchContentChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CONTENT_CHANGE_EVENT));
  }
}

export function subscribeToStoredContent(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === CONTENT_STORAGE_KEY) {
      onStoreChange();
    }
  };

  const handleContentChange = () => {
    onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(CONTENT_CHANGE_EVENT, handleContentChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(CONTENT_CHANGE_EVENT, handleContentChange);
  };
}

export function getStoredContentSnapshot() {
  if (typeof window === "undefined") {
    return listContentEntries();
  }

  const rawValue = window.localStorage.getItem(CONTENT_STORAGE_KEY);

  if (rawValue === cachedContentRaw && cachedContentValue !== undefined) {
    return cachedContentValue;
  }

  cachedContentRaw = rawValue;
  cachedContentValue = readStoredContentEntries();

  return cachedContentValue;
}

export function getContentEntryByArea(area: (typeof contentEntries)[number]["area"]) {
  return getStoredContentSnapshot().find((entry) => entry.area === area) ?? null;
}

export function updateContentRecord(nextRecord: (typeof contentEntries)[number]) {
  const currentContent = readStoredContentEntries();
  const updatedContent = currentContent.map((entry) =>
    entry.id === nextRecord.id ? nextRecord : entry,
  );

  window.localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(updatedContent));
  dispatchContentChange();
}

export function listContentEntriesByAreas(
  areas: Array<(typeof contentEntries)[number]["area"]>,
) {
  const areaSet = new Set(areas);

  return getStoredContentSnapshot().filter((entry) => areaSet.has(entry.area));
}
