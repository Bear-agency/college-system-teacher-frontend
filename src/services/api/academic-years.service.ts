import { apiClient } from "@/src/services/api/client";
import type {
  AcademicYear,
  CreateAcademicYearRequest,
  DeleteSuccessResponse,
  UpdateAcademicYearRequest,
} from "@/src/types/api";

export const academicYearsService = {
  list(): Promise<AcademicYear[]> {
    return apiClient.get<AcademicYear[]>("/academic-years").then((r) => r.data);
  },

  getById(id: string): Promise<AcademicYear> {
    return apiClient.get<AcademicYear>(`/academic-years/${id}`).then((r) => r.data);
  },

  create(body: CreateAcademicYearRequest): Promise<AcademicYear> {
    return apiClient.post<AcademicYear>("/academic-years", body).then((r) => r.data);
  },

  update(id: string, body: UpdateAcademicYearRequest): Promise<AcademicYear> {
    return apiClient.patch<AcademicYear>(`/academic-years/${id}`, body).then((r) => r.data);
  },

  close(id: string): Promise<AcademicYear> {
    return apiClient.patch<AcademicYear>(`/academic-years/${id}/close`).then((r) => r.data);
  },

  remove(id: string): Promise<DeleteSuccessResponse> {
    return apiClient.delete<DeleteSuccessResponse>(`/academic-years/${id}`).then((r) => r.data);
  },
};
