import { apiRequest } from "@/src/core/api/http-client";
import type { DashboardStaffMember, StaffRole } from "@/src/core/types/dashboard";

const BASE = "/dashboard/staff";

type ApiAuditEntry = {
  action: string;
  performed_by_email: string;
  metadata: Record<string, string>;
  created_at: string;
};

type ApiStaffMember = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: StaffRole;
  is_active: boolean;
  is_owner: boolean;
  created_at: string;
  audit_log?: ApiAuditEntry[];
};

function mapMember(m: ApiStaffMember): DashboardStaffMember {
  return {
    id: m.id,
    email: m.email,
    firstName: m.first_name,
    lastName: m.last_name,
    role: m.role,
    isActive: m.is_active,
    isOwner: m.is_owner,
    createdAt: m.created_at,
    auditLog: m.audit_log?.map((e) => ({
      action: e.action,
      performedByEmail: e.performed_by_email,
      metadata: e.metadata,
      createdAt: e.created_at,
    })),
  };
}

export async function fetchStaffList(): Promise<DashboardStaffMember[]> {
  const data = await apiRequest<ApiStaffMember[]>(BASE);
  return data.map(mapMember);
}

export async function fetchStaffMember(id: string): Promise<DashboardStaffMember> {
  const data = await apiRequest<ApiStaffMember>(`${BASE}/${id}`);
  return mapMember(data);
}

export async function createStaffMember(payload: {
  email: string;
  firstName: string;
  lastName: string;
  role: StaffRole;
}): Promise<DashboardStaffMember & { inviteEmailSent: boolean }> {
  const data = await apiRequest<ApiStaffMember & { invite_email_sent: boolean }>(BASE, {
    method: "POST",
    body: {
      email: payload.email,
      first_name: payload.firstName,
      last_name: payload.lastName,
      role: payload.role,
    },
  });
  return { ...mapMember(data), inviteEmailSent: data.invite_email_sent };
}

export async function patchStaffMember(
  id: string,
  payload: { role?: StaffRole; isActive?: boolean },
): Promise<DashboardStaffMember> {
  const body: Record<string, unknown> = {};
  if (payload.role !== undefined) body.role = payload.role;
  if (payload.isActive !== undefined) body.is_active = payload.isActive;

  const data = await apiRequest<ApiStaffMember>(`${BASE}/${id}`, {
    method: "PATCH",
    body,
  });
  return mapMember(data);
}

export async function deleteStaffMember(id: string): Promise<void> {
  await apiRequest<void>(`${BASE}/${id}`, {
    method: "DELETE",
  });
}
