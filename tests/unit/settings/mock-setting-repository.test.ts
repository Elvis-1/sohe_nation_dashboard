import {
  getStoredSettingGroupsSnapshot,
  updateSettingGroups,
} from "@/src/features/settings/data/repositories/mock-setting-repository";

describe("mock-setting-repository", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns the fixture-backed settings groups when nothing is stored yet", () => {
    const snapshot = getStoredSettingGroupsSnapshot();

    expect(snapshot.length).toBeGreaterThanOrEqual(4);
    expect(snapshot[0]?.title).toBe("Store profile");
  });

  it("updates and persists settings groups in local storage", () => {
    const initialGroups = getStoredSettingGroupsSnapshot();
    const updatedGroups = initialGroups.map((group) =>
      group.id === "shipping"
        ? {
            ...group,
            fields: group.fields.map((field) =>
              field.id === "pickup_window"
                ? { ...field, value: "Weekdays 2pm" }
                : field,
            ),
          }
        : group,
    );

    updateSettingGroups(updatedGroups);

    const persistedGroups = getStoredSettingGroupsSnapshot();
    const shippingGroup = persistedGroups.find((group) => group.id === "shipping");
    const pickupWindowField = shippingGroup?.fields.find((field) => field.id === "pickup_window");

    expect(pickupWindowField?.value).toBe("Weekdays 2pm");
  });
});
