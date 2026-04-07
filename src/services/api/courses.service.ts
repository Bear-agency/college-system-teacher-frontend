import { apiClient } from "@/src/services/api/client";
import type {
  Course,
  CourseWire,
  CreateCourseRequest,
  DeleteSuccessResponse,
  UpdateCourseRequest,
} from "@/src/types/api";

function normalizeCourse(raw: CourseWire): Course {
  return {
    id: raw.id ?? raw._id ?? "",
    name: raw.name,
    code: raw.code ?? null,
    description: raw.description,
    subjectId: raw.subjectId,
  };
}

export const coursesService = {
  list(subjectId?: string): Promise<Course[]> {
    return apiClient
      .get<CourseWire[]>("/courses", {
        params: subjectId ? { subjectId } : undefined,
      })
      .then((r) => r.data.map(normalizeCourse));
  },

  getById(id: string): Promise<Course> {
    return apiClient.get<CourseWire>(`/courses/${id}`).then((r) => normalizeCourse(r.data));
  },

  create(body: CreateCourseRequest): Promise<Course> {
    return apiClient.post<CourseWire>("/courses", body).then((r) => normalizeCourse(r.data));
  },

  update(id: string, body: UpdateCourseRequest): Promise<Course> {
    return apiClient.patch<CourseWire>(`/courses/${id}`, body).then((r) => normalizeCourse(r.data));
  },

  remove(id: string): Promise<DeleteSuccessResponse> {
    return apiClient.delete<DeleteSuccessResponse>(`/courses/${id}`).then((r) => r.data);
  },
};
