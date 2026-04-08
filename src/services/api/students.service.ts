import { apiClient } from "@/src/services/api/client";
import type {
  BulkImportStudentsRequest,
  BulkImportStudentsResponse,
  CreateStudentRequest,
  Student,
  StudentListParams,
  UpdateStudentRequest,
} from "@/src/types/api";

export const studentsService = {
  list(params?: StudentListParams): Promise<Student[]> {
    const cleaned =
      params &&
      Object.fromEntries(
        Object.entries(params).filter(
          ([, v]) => v !== undefined && v !== "",
        ),
      );
    const query =
      cleaned && Object.keys(cleaned).length > 0
        ? (cleaned as Record<string, string | number>)
        : undefined;
    return apiClient.get<Student[]>("/students", { params: query }).then((r) => r.data);
  },

  getById(id: string): Promise<Student> {
    return apiClient.get<Student>(`/students/${id}`).then((r) => r.data);
  },

  create(body: CreateStudentRequest): Promise<Student> {
    return apiClient.post<Student>("/students", body).then((r) => r.data);
  },

  update(id: string, body: UpdateStudentRequest): Promise<Student> {
    return apiClient.patch<Student>(`/students/${id}`, body).then((r) => r.data);
  },

  remove(id: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(`/students/${id}`).then((r) => r.data);
  },

  bulkImport(body: BulkImportStudentsRequest): Promise<BulkImportStudentsResponse> {
    return apiClient
      .post<BulkImportStudentsResponse>("/students/bulk-import", body)
      .then((r) => r.data);
  },
};
