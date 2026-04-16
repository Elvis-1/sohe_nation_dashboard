"use client";

import { AppStateMessage } from "@/src/core/ui/app-state-message";

export default function Error({
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <AppStateMessage
      eyebrow="Dashboard"
      title="The workspace hit a snag"
      description="Refresh this view and keep moving through the dashboard."
      actionLabel="Retry"
      onAction={reset}
    />
  );
}
