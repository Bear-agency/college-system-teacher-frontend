import { apiClient } from "@/src/services/api/client";
import type {
  CreateSubjectRequest,
  DeleteSuccessResponse,
  Subject,
  UpdateSubjectRequest,
} from "@/src/types/api";

export const subjectsService = {
  list(departmentId?: string, courseNumber?: 1 | 2 | 3 | 4): Promise<Subject[]> {
    const params: Record<string, string | number> = {};
    if (departmentId) params.departmentId = departmentId;
    if (courseNumber !== undefined) params.courseNumber = courseNumber;
    return apiClient
      .get<Subject[]>("/subjects", {
        params: Object.keys(params).length ? params : undefined,
      })
      .then((r) => r.data);
  },

  getById(id: string): Promise<Subject> {
    return apiClient.get<Subject>(`/subjects/${id}`).then((r) => r.data);
  },

  create(body: CreateSubjectRequest): Promise<Subject> {
    return apiClient.post<Subject>("/subjects", body).then((r) => r.data);
  },

  update(id: string, body: UpdateSubjectRequest): Promise<Subject> {
    return apiClient.patch<Subject>(`/subjects/${id}`, body).then((r) => r.data);
  },

  remove(id: string): Promise<DeleteSuccessResponse> {
    return apiClient.delete<DeleteSuccessResponse>(`/subjects/${id}`).then((r) => r.data);
  },
};
