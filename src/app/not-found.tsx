import Link from "next/link";
import { AppStateMessage } from "@/src/core/ui/app-state-message";

export default function NotFound() {
  return (
    <AppStateMessage
      eyebrow="Dashboard"
      title="This route is not part of the control map"
      description="Head back to the overview and continue with the staff flow."
      actionLabel="Open overview"
      action={<Link href="/">Open overview</Link>}
    />
  );
}
