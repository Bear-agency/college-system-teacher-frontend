import { apiClient } from "@/src/services/api/client";
import type {
  CreateDepartmentRequest,
  DeleteSuccessResponse,
  Department,
  UpdateDepartmentRequest,
} from "@/src/types/api";

export const departmentsService = {
  list(academicYearId?: string): Promise<Department[]> {
    return apiClient
      .get<Department[]>("/departments", {
        params: academicYearId ? { academicYearId } : undefined,
      })
      .then((r) => r.data);
  },

  getById(id: string): Promise<Department> {
    return apiClient.get<Department>(`/departments/${id}`).then((r) => r.data);
  },

  create(body: CreateDepartmentRequest): Promise<Department> {
    return apiClient.post<Department>("/departments", body).then((r) => r.data);
  },

  update(id: string, body: UpdateDepartmentRequest): Promise<Department> {
    return apiClient.patch<Department>(`/departments/${id}`, body).then((r) => r.data);
  },

  remove(id: string): Promise<DeleteSuccessResponse> {
    return apiClient.delete<DeleteSuccessResponse>(`/departments/${id}`).then((r) => r.data);
  },
};
