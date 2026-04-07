import { apiClient } from "@/src/services/api/client";
import type { CreateTestRequest } from "@/src/types/api";

export const testsService = {
  list(academicYearId?: string): Promise<unknown[]> {
    return apiClient
      .get<unknown[]>("/tests", {
        params: academicYearId ? { academicYearId } : undefined,
      })
      .then((r) => r.data);
  },

  create(body: CreateTestRequest): Promise<unknown> {
    return apiClient.post<unknown>("/tests", body).then((r) => r.data);
  },
};
