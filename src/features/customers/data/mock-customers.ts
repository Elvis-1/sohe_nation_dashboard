import type { DashboardCustomerRecord } from "@/src/core/types/dashboard";

export const mockCustomers: DashboardCustomerRecord[] = [
  {
    id: "customer_ada_nwosu",
    email: "ada@example.com",
    firstName: "Ada",
    lastName: "Nwosu",
    defaultRegion: "NG",
    orderIds: ["SOH-2034", "SOH-2026", "SOH-2024", "SOH-2018"],
    returnIds: ["RET-103"],
    addressCount: 2,
  },
  {
    id: "customer_tomi_alade",
    email: "tomi@example.com",
    firstName: "Tomi",
    lastName: "Alade",
    defaultRegion: "NG",
    orderIds: ["SOH-2033", "SOH-2011"],
    returnIds: [],
    addressCount: 1,
  },
  {
    id: "customer_ife_balogun",
    email: "ife@example.com",
    firstName: "Ife",
    lastName: "Balogun",
    defaultRegion: "NG",
    orderIds: ["SOH-2032", "SOH-2028"],
    returnIds: ["RET-104"],
    addressCount: 1,
  },
  {
    id: "customer_kemi_adeyemi",
    email: "kemi@example.com",
    firstName: "Kemi",
    lastName: "Adeyemi",
    defaultRegion: "NG",
    orderIds: ["SOH-2022", "SOH-2008"],
    returnIds: ["RET-102"],
    addressCount: 1,
  },
];
