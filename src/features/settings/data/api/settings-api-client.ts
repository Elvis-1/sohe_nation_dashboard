import { apiRequest } from "@/src/core/api/http-client";
import type {
  DashboardSettingGroup,
  SettingFieldOptions,
  SettingFieldType,
} from "@/src/core/types/dashboard";

const BASE = "/dashboard/settings";

type ApiSettingField = {
  id: string;
  label: string;
  value: string;
  placeholder: boolean;
  type?: SettingFieldType;
  options?: {
    help_text?: string;
    required?: boolean;
    locked?: boolean;
    min?: number;
    max?: number;
    unit?: string;
    max_length?: number;
    choices?: Array<{ value: string; label: string }>;
  };
};

function mapOptions(api: ApiSettingField["options"]): SettingFieldOptions {
  return {
    helpText: api?.help_text,
    required: api?.required,
    locked: api?.locked,
    min: api?.min,
    max: api?.max,
    unit: api?.unit,
    maxLength: api?.max_length,
    choices: api?.choices,
  };
}

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
      type: field.type ?? "text",
      options: mapOptions(field.options),
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
