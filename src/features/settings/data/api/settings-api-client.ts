import { apiRequest } from "@/src/core/api/http-client";
import type { DashboardSettingGroup } from "@/src/core/types/dashboard";

const BASE = "/dashboard/settings";

type ApiSettingField = {
  id: string;
  label: string;
  value: string;
  placeholder: boolean;
};

type ApiSettingGroup = {
  id: string;
  title: string;
  description: string;
  fields: ApiSettingField[];
};

function mapApiSettingGroup(group: ApiSettingGroup): DashboardSettingGroup {
  return {
    id: group.id,
    title: group.title,
    description: group.description,
    fields: group.fields.map((field) => ({
      id: field.id,
      label: field.label,
      value: field.value,
      placeholder: field.placeholder,
    })),
  };
}

export async function fetchDashboardSettings(): Promise<DashboardSettingGroup[]> {
  const data = await apiRequest<ApiSettingGroup[]>(BASE);
  return data.map(mapApiSettingGroup);
}

export async function updateDashboardSettingGroup(
  groupId: string,
  fields: Array<{ id: string; value: string }>,
): Promise<DashboardSettingGroup> {
  const data = await apiRequest<ApiSettingGroup>(`${BASE}/${groupId}`, {
    method: "PATCH",
    body: { fields },
  });
  return mapApiSettingGroup(data);
}
