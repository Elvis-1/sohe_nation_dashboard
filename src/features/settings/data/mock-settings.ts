import type { DashboardSettingGroup } from "@/src/core/types/dashboard";

export const mockSettingGroups: DashboardSettingGroup[] = [
  {
    id: "store_profile",
    title: "Store profile",
    description: "Brand-facing defaults shared across commerce operations.",
    fields: [
      { id: "store_name", label: "Store name", value: "Sohe's Nation" },
      { id: "support_email", label: "Support email", value: "support@sohesnation.com" },
    ],
  },
  {
    id: "payments",
    title: "Payments placeholder",
    description: "Gateway and settlement defaults reserved for later API wiring.",
    fields: [
      { id: "primary_provider", label: "Primary provider", value: "Flutterwave", placeholder: true },
      { id: "secondary_provider", label: "Secondary provider", value: "PayPal", placeholder: true },
    ],
  },
  {
    id: "shipping",
    title: "Shipping placeholder",
    description: "Carrier, cutoff, and delivery defaults for future backend configuration.",
    fields: [
      { id: "primary_region", label: "Primary region", value: "Nigeria", placeholder: true },
      { id: "pickup_window", label: "Pickup window", value: "Weekdays 4pm", placeholder: true },
    ],
  },
  {
    id: "staff_roles",
    title: "Staff roles placeholder",
    description: "Simple access placeholders for the MVP staff flow.",
    fields: [
      { id: "ops_role", label: "Operations role", value: "Staff Access", placeholder: true },
      { id: "session_mode", label: "Session mode", value: "Fixture mode", placeholder: true },
    ],
  },
];
