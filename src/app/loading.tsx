import { AppStateMessage } from "@/src/core/ui/app-state-message";

export default function Loading() {
  return (
    <AppStateMessage
      eyebrow="Dashboard"
      title="Preparing the control room"
      description="Pulling the current operational view into place."
    />
  );
}
