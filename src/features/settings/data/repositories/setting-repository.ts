import type { DashboardSettingGroup } from "@/src/core/types/dashboard";
import {
  fetchDashboardSettings,
  updateDashboardSettingGroup,
} from "@/src/features/settings/data/api/settings-api-client";

const SETTINGS_CHANGE_EVENT = "sohe-dashboard-settings-change";
const EMPTY_SETTINGS: DashboardSettingGroup[] = [];

let cachedSettings: DashboardSettingGroup[] | null = null;
let fetchPromise: Promise<DashboardSettingGroup[]> | null = null;
let lastSettingsError: Error | null = null;

function dispatchChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SETTINGS_CHANGE_EVENT));
  }
}

async function loadSettings(): Promise<DashboardSettingGroup[]> {
  const groups = await fetchDashboardSettings();
  cachedSettings = groups;
  fetchPromise = null;
  lastSettingsError = null;
  dispatchChange();
  return groups;
}

export function subscribeToStoredSettings(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  const handle = () => onStoreChange();
  window.addEventListener(SETTINGS_CHANGE_EVENT, handle);
  return () => window.removeEventListener(SETTINGS_CHANGE_EVENT, handle);
}

export function getStoredSettingGroupsSnapshot(): DashboardSettingGroup[] {
  if (cachedSettings !== null) return cachedSettings;

  if (!fetchPromise) {
    fetchPromise = loadSettings().catch((error) => {
      cachedSettings = EMPTY_SETTINGS;
      fetchPromise = null;
      lastSettingsError =
        error instanceof Error ? error : new Error("Settings fetch failed.");
      dispatchChange();
      return EMPTY_SETTINGS;
    });
  }

  return EMPTY_SETTINGS;
}

export function getServerSettingGroupsSnapshot(): DashboardSettingGroup[] {
  return EMPTY_SETTINGS;
}

export function getSettingsErrorSnapshot(): Error | null {
  return lastSettingsError;
}

function groupsAreEqual(left: DashboardSettingGroup, right: DashboardSettingGroup) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export async function updateSettingGroups(
  nextGroups: DashboardSettingGroup[],
): Promise<DashboardSettingGroup[]> {
  const currentGroupsById = new Map((cachedSettings ?? []).map((group) => [group.id, group]));
  const updatedGroups: DashboardSettingGroup[] = [];

  for (const group of nextGroups) {
    const currentGroup = currentGroupsById.get(group.id);
    if (currentGroup && groupsAreEqual(currentGroup, group)) {
      updatedGroups.push(currentGroup);
      continue;
    }

    const updatedGroup = await updateDashboardSettingGroup(
      group.id,
      group.fields.map((field) => ({ id: field.id, value: field.value })),
    );
    updatedGroups.push(updatedGroup);
  }

  cachedSettings = updatedGroups;
  lastSettingsError = null;
  dispatchChange();
  return updatedGroups;
}
