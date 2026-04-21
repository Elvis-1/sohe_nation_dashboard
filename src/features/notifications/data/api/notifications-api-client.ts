import { apiRequest } from "@/src/core/api/http-client";
import type {
  DashboardNotificationLog,
  DashboardNotificationProviderStatus,
  DashboardNotificationProviderTestResult,
} from "@/src/core/types/dashboard";

type ApiNotificationLog = {
  id: string;
  retry_of_id?: string | null;
  event_type: string;
  recipient_email: string;
  subject: string;
  backend_name: string;
  status: "pending" | "sent" | "failed";
  attempt_number: number;
  sent_at?: string | null;
  last_attempted_at?: string | null;
  provider_response: string;
  error_message: string;
  can_retry: boolean;
  created_at: string;
};

type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

type ApiNotificationProviderStatus = {
  backend_name: string;
  delivery_mode: "live" | "local";
  is_live_backend: boolean;
  is_configured: boolean;
  host: string;
  port: number;
  host_user_masked: string;
  use_tls: boolean;
  default_from_email: string;
  notes: string;
};

type ApiNotificationProviderTestResult = {
  recipient_email: string;
  sent_count: number;
  backend_name: string;
  delivery_mode: "live" | "local";
  default_from_email: string;
};

function mapLog(log: ApiNotificationLog): DashboardNotificationLog {
  return {
    id: log.id,
    retryOfId: log.retry_of_id ?? undefined,
    eventType: log.event_type,
    recipientEmail: log.recipient_email,
    subject: log.subject,
    backendName: log.backend_name,
    status: log.status,
    attemptNumber: log.attempt_number,
    sentAt: log.sent_at,
    lastAttemptedAt: log.last_attempted_at,
    providerResponse: log.provider_response,
    errorMessage: log.error_message,
    canRetry: log.can_retry,
    createdAt: log.created_at,
  };
}

function mapProviderStatus(status: ApiNotificationProviderStatus): DashboardNotificationProviderStatus {
  return {
    backendName: status.backend_name,
    deliveryMode: status.delivery_mode,
    isLiveBackend: status.is_live_backend,
    isConfigured: status.is_configured,
    host: status.host,
    port: status.port,
    hostUserMasked: status.host_user_masked,
    useTls: status.use_tls,
    defaultFromEmail: status.default_from_email,
    notes: status.notes,
  };
}

function mapProviderTestResult(
  result: ApiNotificationProviderTestResult,
): DashboardNotificationProviderTestResult {
  return {
    recipientEmail: result.recipient_email,
    sentCount: result.sent_count,
    backendName: result.backend_name,
    deliveryMode: result.delivery_mode,
    defaultFromEmail: result.default_from_email,
  };
}

export async function fetchNotificationLogs(filters?: {
  eventType?: string;
  status?: string;
  recipient?: string;
}): Promise<DashboardNotificationLog[]> {
  const params = new URLSearchParams();
  if (filters?.eventType) params.set("event_type", filters.eventType);
  if (filters?.status) params.set("status", filters.status);
  if (filters?.recipient) params.set("recipient", filters.recipient);

  const query = params.toString();
  const data = await apiRequest<PaginatedResponse<ApiNotificationLog>>(
    `/dashboard/notifications/${query ? `?${query}` : ""}`,
  );
  return data.results.map(mapLog);
}

export async function retryNotificationLog(id: string): Promise<DashboardNotificationLog> {
  const data = await apiRequest<ApiNotificationLog>(`/dashboard/notifications/${id}/retry/`, {
    method: "POST",
  });
  return mapLog(data);
}

export async function fetchNotificationProviderStatus(): Promise<DashboardNotificationProviderStatus> {
  const data = await apiRequest<ApiNotificationProviderStatus>("/dashboard/notifications/provider/");
  return mapProviderStatus(data);
}

export async function sendNotificationProviderTest(
  recipientEmail: string,
): Promise<DashboardNotificationProviderTestResult> {
  const data = await apiRequest<ApiNotificationProviderTestResult>(
    "/dashboard/notifications/provider/test/",
    {
      method: "POST",
      body: { recipient_email: recipientEmail },
    },
  );
  return mapProviderTestResult(data);
}
