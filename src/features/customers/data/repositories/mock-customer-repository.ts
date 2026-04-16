import { mockCustomers } from "@/src/features/customers/data/mock-customers";

export function listCustomers() {
  return mockCustomers;
}

export function getCustomerById(customerId: string) {
  return mockCustomers.find((customer) => customer.id === customerId) ?? null;
}
