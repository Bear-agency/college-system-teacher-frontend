import { apiClient } from "@/src/services/api/client";
import type {
  CreateSubjectRequest,
  DeleteSuccessResponse,
  Subject,
  UpdateSubjectRequest,
} from "@/src/types/api";

export const subjectsService = {
  list(departmentId?: string): Promise<Subject[]> {
    return apiClient
      .get<Subject[]>("/subjects", {
        params: departmentId ? { departmentId } : undefined,
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
