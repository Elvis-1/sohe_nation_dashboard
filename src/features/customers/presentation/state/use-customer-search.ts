"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/src/core/api/http-client";
import type { DashboardCustomerRecord } from "@/src/core/types/dashboard";
import {
  fetchCustomerPage,
  type CustomerListFilters,
  type CustomerPage,
} from "@/src/features/customers/data/repositories/customer-repository";

type Result = { key: string; page: CustomerPage | null; error: string | null };

export type CustomerSearchState = {
  status: "loading" | "ready" | "error";
  customers: DashboardCustomerRecord[];
  count: number;
  error: string | null;
  retry: () => void;
};

/** One server-filtered page of customers; refetches whenever the filters change. */
export function useCustomerSearch(filters: CustomerListFilters): CustomerSearchState {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const key = JSON.stringify([filters.search.trim(), filters.region, filters.page, attempt]);

  useEffect(() => {
    let isActive = true;
    fetchCustomerPage(filters).then(
      (page) => {
        if (isActive) setResult({ key, page, error: null });
      },
      (error: unknown) => {
        if (!isActive) return;
        const message = error instanceof ApiError ? error.message : "Unable to load customers right now.";
        setResult({ key, page: null, error: message });
      },
    );
    return () => {
      isActive = false;
    };
    // `key` covers every filter field plus retries.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // A result for older filters counts as loading, so stale rows never show under new filters.
  const current = result?.key === key ? result : null;
  return {
    status: !current ? "loading" : current.error ? "error" : "ready",
    customers: current?.page?.results ?? [],
    count: current?.page?.count ?? 0,
    error: current?.error ?? null,
    retry: () => setAttempt((value) => value + 1),
  };
}
