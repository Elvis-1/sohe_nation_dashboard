import { EmptyStatePanel } from "@/src/core/ui/empty-state-panel";
import { PageHeader } from "@/src/core/ui/page-header";
import { ModuleStatePanel } from "@/src/core/ui/module-state-panel";
import { SectionCard } from "@/src/core/ui/section-card";
import { listCustomers } from "@/src/features/customers/data/repositories/mock-customer-repository";

export function CustomersPageShell() {
  const customers = listCustomers();

  return (
    <div>
      <PageHeader
        eyebrow="Customers"
        title="Profile, order, and return context in one place."
        description="This module will become the staff view into customer activity across account history, post-purchase support, and returns."
      />
      <SectionCard
        title="Customer list"
        description="Scaffolded list view for lookup and navigation into customer detail."
      >
        {customers.length === 0 ? (
          <EmptyStatePanel
            eyebrow="Customers"
            title="No customer records are linked yet."
            description="Account fixtures will populate this surface once customer, order, and return relationships are staged."
            actionHref="/"
            actionLabel="Return to overview"
          />
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {customers.map((customer) => (
              <div
                key={customer.email}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 0.5fr 0.5fr",
                  gap: 12,
                  border: "1px solid var(--color-border)",
                  borderRadius: 18,
                  padding: "16px",
                }}
              >
                <strong>
                  {customer.firstName} {customer.lastName}
                </strong>
                <span>{customer.email}</span>
                <span>{customer.orderIds.length} orders</span>
                <span>{customer.returnIds.length} returns</span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
      <div style={{ marginTop: 16 }}>
        <ModuleStatePanel
          eyebrow="Module state"
          title="Customer detail remains a later dedicated phase."
          description="The shell-level state pattern is ready now so the customers module can stay coherent even before profile drill-down is implemented."
          nextLabel="Return to overview"
          nextHref="/"
        />
      </div>
    </div>
  );
}
