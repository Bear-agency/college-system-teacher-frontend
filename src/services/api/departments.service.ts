import { apiClient } from "@/src/services/api/client";
import type {
  CreateDepartmentRequest,
  DeleteSuccessResponse,
  Department,
  DepartmentWire,
  SubjectHierarchy,
  UpdateDepartmentRequest,
} from "@/src/types/api";

function normalizeDepartment(raw: DepartmentWire): Department {
  const academicYearIds = Array.isArray(raw.academicYearIds) ? raw.academicYearIds : [];
  let subjects: SubjectHierarchy[];
  if (Array.isArray(raw.subjects)) {
    subjects = raw.subjects.map((s) => ({
      ...s,
      lectures: Array.isArray(s.lectures) ? s.lectures : [],
    }));
  } else if (Array.isArray(raw.subjectIds)) {
    subjects = raw.subjectIds.map((id) => ({ id, name: "", lectures: [] }));
  } else {
    subjects = [];
  }
  const id = raw.id ?? raw._id ?? "";
  return {
    id,
    name: raw.name,
    code: raw.code ?? null,
    academicYearIds,
    subjects,
  };
}

export const departmentsService = {
  list(academicYearId?: string): Promise<Department[]> {
    return apiClient
      .get<DepartmentWire[]>("/departments", {
        params: academicYearId ? { academicYearId } : undefined,
      })
      .then((r) => r.data.map(normalizeDepartment));
  },

  getById(id: string): Promise<Department> {
    return apiClient.get<DepartmentWire>(`/departments/${id}`).then((r) => normalizeDepartment(r.data));
  },

  create(body: CreateDepartmentRequest): Promise<Department> {
    return apiClient.post<DepartmentWire>("/departments", body).then((r) => normalizeDepartment(r.data));
  },

  update(id: string, body: UpdateDepartmentRequest): Promise<Department> {
    return apiClient.patch<DepartmentWire>(`/departments/${id}`, body).then((r) => normalizeDepartment(r.data));
  },

  remove(id: string): Promise<DeleteSuccessResponse> {
    return apiClient.delete<DeleteSuccessResponse>(`/departments/${id}`).then((r) => r.data);
  },
};
