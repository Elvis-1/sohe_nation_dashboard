import { mockSettingGroups } from "@/src/features/settings/data/mock-settings";

const SETTING_STORAGE_KEY = "sohe-dashboard-settings";
const SETTING_CHANGE_EVENT = "sohe-dashboard-settings-change";

let cachedSettingsRaw: string | null | undefined;
let cachedSettingsValue: typeof mockSettingGroups | undefined;

export function listSettingGroups() {
  return mockSettingGroups;
}

function cloneSettingGroups() {
  return JSON.parse(JSON.stringify(mockSettingGroups)) as typeof mockSettingGroups;
}

function readStoredSettingGroups() {
  if (typeof window === "undefined") {
    return cloneSettingGroups();
  }

  const rawValue = window.localStorage.getItem(SETTING_STORAGE_KEY);

  if (!rawValue) {
    return cloneSettingGroups();
  }

  try {
    return JSON.parse(rawValue) as typeof mockSettingGroups;
  } catch {
    window.localStorage.removeItem(SETTING_STORAGE_KEY);
    return cloneSettingGroups();
  }
}

function dispatchSettingChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SETTING_CHANGE_EVENT));
  }
}

export function subscribeToStoredSettings(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === SETTING_STORAGE_KEY) {
      onStoreChange();
    }
  };

  const handleSettingChange = () => {
    onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(SETTING_CHANGE_EVENT, handleSettingChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(SETTING_CHANGE_EVENT, handleSettingChange);
  };
}

export function getStoredSettingGroupsSnapshot() {
  if (typeof window === "undefined") {
    return listSettingGroups();
  }

  const rawValue = window.localStorage.getItem(SETTING_STORAGE_KEY);

  if (rawValue === cachedSettingsRaw && cachedSettingsValue !== undefined) {
    return cachedSettingsValue;
  }

  cachedSettingsRaw = rawValue;
  cachedSettingsValue = readStoredSettingGroups();

  return cachedSettingsValue;
}

export function updateSettingGroups(nextGroups: typeof mockSettingGroups) {
  window.localStorage.setItem(SETTING_STORAGE_KEY, JSON.stringify(nextGroups));
  dispatchSettingChange();
}
