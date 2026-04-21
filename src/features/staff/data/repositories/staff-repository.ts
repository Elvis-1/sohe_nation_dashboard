import type { DashboardStaffMember } from "@/src/core/types/dashboard";
import {
  deleteStaffMember as deleteStaffMemberRequest,
  fetchStaffList,
  fetchStaffMember,
  patchStaffMember,
  createStaffMember,
} from "@/src/features/staff/data/api/staff-api-client";
import type { StaffRole } from "@/src/core/types/dashboard";

const STAFF_CHANGE_EVENT = "sohe-dashboard-staff-change";
const EMPTY: DashboardStaffMember[] = [];

let cached: DashboardStaffMember[] | null = null;
let fetchPromise: Promise<DashboardStaffMember[]> | null = null;

function dispatch() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(STAFF_CHANGE_EVENT));
  }
}

async function load(): Promise<DashboardStaffMember[]> {
  const members = await fetchStaffList();
  cached = members;
  fetchPromise = null;
  dispatch();
  return members;
}

export function subscribeToStoredStaff(onChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  const handle = () => onChange();
  window.addEventListener(STAFF_CHANGE_EVENT, handle);
  return () => window.removeEventListener(STAFF_CHANGE_EVENT, handle);
}

export function getStoredStaffSnapshot(): DashboardStaffMember[] {
  if (cached !== null) return cached;
  if (!fetchPromise) {
    fetchPromise = load().catch(() => {
      cached = EMPTY;
      fetchPromise = null;
      dispatch();
      return EMPTY;
    });
  }
  return EMPTY;
}

export function getServerStaffSnapshot(): DashboardStaffMember[] {
  return EMPTY;
}

export async function loadStaffMember(id: string): Promise<DashboardStaffMember> {
  return fetchStaffMember(id);
}

export async function inviteStaffMember(payload: {
  email: string;
  firstName: string;
  lastName: string;
  role: StaffRole;
}): Promise<DashboardStaffMember & { inviteEmailSent: boolean }> {
  const result = await createStaffMember(payload);
  cached = null;
  dispatch();
  return result;
}

export async function updateStaffMember(
  id: string,
  payload: { role?: StaffRole; isActive?: boolean },
): Promise<DashboardStaffMember> {
  const updated = await patchStaffMember(id, payload);
  if (cached) {
    cached = cached.map((m) => (m.id === id ? updated : m));
    dispatch();
  }
  return updated;
}

export async function deleteStaffMember(id: string): Promise<void> {
  await deleteStaffMemberRequest(id);
  if (cached) {
    cached = cached.filter((member) => member.id !== id);
    dispatch();
  } else {
    dispatch();
  }
}
