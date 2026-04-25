import Link from "next/link";
import { AppStateMessage } from "@/src/core/ui/app-state-message";

export default function StoriesContentPage() {
  return (
    <AppStateMessage
      eyebrow="Homepage Desk"
      title="Story editing is not available in the dashboard."
      description="The dashboard content module is now limited to homepage hero media and featured products. Story content remains visible on the storefront but is not editable here."
      action={<Link href="/content">Back to homepage desk</Link>}
    />
  );
}
