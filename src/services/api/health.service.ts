import { apiClient } from "@/src/services/api/client";
import type { HealthResponse } from "@/src/types/api";

export const healthService = {
  check(): Promise<HealthResponse> {
    return apiClient.get<HealthResponse>("/health").then((r) => r.data);
  },
};
