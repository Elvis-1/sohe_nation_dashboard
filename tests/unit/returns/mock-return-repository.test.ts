import {
  getReturnById,
  getStoredReturnsSnapshot,
  updateReturnRecord,
} from "@/src/features/returns/data/repositories/mock-return-repository";

describe("mock-return-repository", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns the fixture-backed return queue when nothing is stored yet", () => {
    const snapshot = getStoredReturnsSnapshot();

    expect(snapshot.length).toBeGreaterThanOrEqual(3);
    expect(snapshot[0]?.id).toBe("RET-104");
  });

  it("updates and persists a return record in local storage", () => {
    const initialReturn = getReturnById("RET-103");

    expect(initialReturn).not.toBeNull();

    updateReturnRecord({
      ...initialReturn!,
      status: "approved",
      internalDecision: "Approved after damage review and replacement stock confirmation.",
    });

    const updatedReturn = getReturnById("RET-103");

    expect(updatedReturn?.status).toBe("approved");
    expect(updatedReturn?.internalDecision).toBe(
      "Approved after damage review and replacement stock confirmation.",
    );
  });
});
