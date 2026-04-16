import { render, screen } from "@testing-library/react";
import { EmptyStatePanel } from "@/src/core/ui/empty-state-panel";

describe("EmptyStatePanel", () => {
  it("renders the empty-state copy and action link", () => {
    render(
      <EmptyStatePanel
        eyebrow="Products"
        title="The catalog desk is empty right now."
        description="Fixture or live records will appear here once they exist."
        actionHref="/"
        actionLabel="Return to overview"
      />,
    );

    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "The catalog desk is empty right now." })).toBeInTheDocument();
    expect(
      screen.getByText("Fixture or live records will appear here once they exist."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Return to overview" })).toHaveAttribute("href", "/");
  });
});
