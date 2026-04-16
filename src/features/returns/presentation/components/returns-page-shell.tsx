import { EmptyStatePanel } from "@/src/core/ui/empty-state-panel";
import { PageHeader } from "@/src/core/ui/page-header";
import { ModuleStatePanel } from "@/src/core/ui/module-state-panel";
import { SectionCard } from "@/src/core/ui/section-card";
import { listReturns } from "@/src/features/returns/data/repositories/mock-return-repository";

export function ReturnsPageShell() {
  const returns = listReturns();

  return (
    <div>
      <PageHeader
        eyebrow="Returns"
        title="Process customer requests with a clear queue."
        description="The returns desk will mirror the customer account return lifecycle, giving staff a straightforward review-and-decision workflow."
      />
      <SectionCard
        title="Returns queue"
        description="Scaffolded queue for status filters, review decisions, and return outcomes."
      >
        {returns.length === 0 ? (
          <EmptyStatePanel
            eyebrow="Returns"
            title="No return requests are waiting."
            description="Once the account returns flow sends fixture requests through the dashboard, they will appear here for staff review."
            actionHref="/"
            actionLabel="Return to overview"
          />
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {returns.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "0.8fr 1fr 0.8fr 0.8fr 1fr",
                  gap: 12,
                  border: "1px solid var(--color-border)",
                  borderRadius: 18,
                  padding: "16px",
                }}
              >
                <strong>{item.id}</strong>
                <span>{item.customerName}</span>
                <span>{item.orderId}</span>
                <span style={{ color: "var(--color-accent)", textTransform: "capitalize" }}>
                  {item.status.replaceAll("_", " ")}
                </span>
                <span>{item.reason}</span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
      <div style={{ marginTop: 16 }}>
        <ModuleStatePanel
          eyebrow="Module state"
          title="Decision controls are the next returns milestone."
          description="The queue is visible now, and the shared state component keeps this module aligned with the rest of the dashboard until the full returns workflow is built."
          nextLabel="Back to overview"
          nextHref="/"
        />
      </div>
    </div>
  );
}
