import type { ProductReturnPolicy } from "@/src/core/types/dashboard";

/** Short label for the return rule an item was bought under (Slice 14). */
export function returnRuleLabel(policy: ProductReturnPolicy, days: number | null): string {
  if (policy === "final_sale") return "Final sale";
  if (policy === "custom") return days ? `Custom: ${days} days` : "Custom window";
  return days ? `Standard: ${days} days` : "Standard";
}
