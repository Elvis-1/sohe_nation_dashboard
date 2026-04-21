"use client";

import { useSyncExternalStore } from "react";
import {
  subscribeToStoredStaff,
  getStoredStaffSnapshot,
  getServerStaffSnapshot,
} from "@/src/features/staff/data/repositories/staff-repository";

export function useStaffList() {
  return useSyncExternalStore(
    subscribeToStoredStaff,
    getStoredStaffSnapshot,
    getServerStaffSnapshot,
  );
}
