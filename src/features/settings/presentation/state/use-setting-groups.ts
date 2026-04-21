"use client";

import { useSyncExternalStore } from "react";
import {
  getServerSettingGroupsSnapshot,
  getSettingsErrorSnapshot,
  getStoredSettingGroupsSnapshot,
  subscribeToStoredSettings,
} from "@/src/features/settings/data/repositories/setting-repository";

export function useSettingGroups() {
  return useSyncExternalStore(
    subscribeToStoredSettings,
    getStoredSettingGroupsSnapshot,
    getServerSettingGroupsSnapshot,
  );
}

export function useSettingGroupsError() {
  return useSyncExternalStore(
    subscribeToStoredSettings,
    getSettingsErrorSnapshot,
    () => null,
  );
}
