"use client";

import { useSyncExternalStore } from "react";
import {
  getStoredContentSnapshot,
  listContentEntries,
  subscribeToStoredContent,
} from "@/src/features/content/data/repositories/mock-content-repository";

export function useContentDesk() {
  return useSyncExternalStore(subscribeToStoredContent, getStoredContentSnapshot, listContentEntries);
}
