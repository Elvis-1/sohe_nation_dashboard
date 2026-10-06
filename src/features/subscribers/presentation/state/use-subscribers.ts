"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/src/core/api/http-client";
import {
  fetchSubscriberPage,
  fetchSubscriberSummary,
  type DashboardSubscriber,
  type SubscriberFilters,
  type SubscriberSummary,
} from "@/src/features/subscribers/data/api/subscribers-api-client";

type Result = {
  key: string;
  rows: DashboardSubscriber[];
  count: number;
  summary: SubscriberSummary | null;
  error: string | null;
};

/** One server-filtered page of subscribers plus the list summary; `reload` refetches both. */
export function useSubscribers(filters: SubscriberFilters) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const key = JSON.stringify([filters.status, filters.source, filters.search.trim(), filters.page, attempt]);

  useEffect(() => {
    let isActive = true;
    Promise.all([fetchSubscriberPage(filters), fetchSubscriberSummary()]).then(
      ([page, summary]) => {
        if (isActive) setResult({ key, rows: page.results, count: page.count, summary, error: null });
      },
      (error: unknown) => {
        if (!isActive) return;
        const message = error instanceof ApiError ? error.message : "Unable to load subscribers right now.";
        setResult({ key, rows: [], count: 0, summary: null, error: message });
      },
    );
    return () => {
      isActive = false;
    };
    // `key` covers every filter field plus reloads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const current = result?.key === key ? result : null;
  return {
    status: !current ? ("loading" as const) : current.error ? ("error" as const) : ("ready" as const),
    rows: current?.rows ?? [],
    count: current?.count ?? 0,
    summary: current?.summary ?? result?.summary ?? null,
    error: current?.error ?? null,
    reload: () => setAttempt((value) => value + 1),
  };
}
