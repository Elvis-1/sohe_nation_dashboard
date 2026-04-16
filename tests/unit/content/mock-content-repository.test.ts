import {
  getContentEntryByArea,
  getStoredContentSnapshot,
  updateContentRecord,
} from "@/src/features/content/data/repositories/mock-content-repository";

describe("mock-content-repository", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns the fixture-backed content desk when nothing is stored yet", () => {
    const snapshot = getStoredContentSnapshot();

    expect(snapshot.length).toBeGreaterThanOrEqual(4);
    expect(snapshot.some((entry) => entry.area === "homepage")).toBe(true);
    expect(snapshot.some((entry) => entry.area === "stories")).toBe(true);
  });

  it("updates and persists a content record in local storage", () => {
    const initialEntry = getContentEntryByArea("stories");

    expect(initialEntry).not.toBeNull();

    updateContentRecord({
      ...initialEntry!,
      visibility: "ready",
      headline: "Updated editorial direction",
      summary: "Editorial story module updated for the next release window.",
    });

    const updatedEntry = getContentEntryByArea("stories");

    expect(updatedEntry?.visibility).toBe("ready");
    expect(updatedEntry?.headline).toBe("Updated editorial direction");
    expect(updatedEntry?.summary).toBe(
      "Editorial story module updated for the next release window.",
    );
  });
});
