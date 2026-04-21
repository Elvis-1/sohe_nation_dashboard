"use client";

import { useSyncExternalStore } from "react";
import {
  getContentErrorSnapshot,
  getServerContentSnapshot,
  getStoredContentSnapshot,
  subscribeToStoredContent,
} from "@/src/features/content/data/repositories/content-repository";

export function useContentDesk() {
  return useSyncExternalStore(
    subscribeToStoredContent,
    getStoredContentSnapshot,
    getServerContentSnapshot,
  );
}

export function useContentDeskError() {
  return useSyncExternalStore(
    subscribeToStoredContent,
    getContentErrorSnapshot,
    () => null,
  );
}
