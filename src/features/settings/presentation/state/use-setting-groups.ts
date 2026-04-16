"use client";

import { useSyncExternalStore } from "react";
import {
  getStoredSettingGroupsSnapshot,
  listSettingGroups,
  subscribeToStoredSettings,
} from "@/src/features/settings/data/repositories/mock-setting-repository";

export function useSettingGroups() {
  return useSyncExternalStore(
    subscribeToStoredSettings,
    getStoredSettingGroupsSnapshot,
    listSettingGroups,
  );
}
