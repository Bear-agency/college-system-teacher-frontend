import { apiClient } from "@/src/services/api/client";
import type { CreateStudentRequest } from "@/src/types/api";

export const studentsService = {
  list(academicYearId?: string): Promise<unknown[]> {
    return apiClient
      .get<unknown[]>("/students", {
        params: academicYearId ? { academicYearId } : undefined,
      })
      .then((r) => r.data);
  },

  create(body: CreateStudentRequest): Promise<unknown> {
    return apiClient.post<unknown>("/students", body).then((r) => r.data);
  },
};
