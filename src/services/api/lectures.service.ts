import { apiClient } from "@/src/services/api/client";
import type {
  CreateLectureRequest,
  Lecture,
  MigrateLecturesRequest,
  MigrateLecturesResponse,
  MigrateLecturesToCoursesResponse,
  UpdateLectureRequest,
} from "@/src/types/api";

export const lecturesService = {
  list(params?: { courseId?: string; subjectId?: string }): Promise<Lecture[]> {
    return apiClient
      .get<Lecture[]>("/lectures", {
        params:
          params?.courseId != null
            ? { courseId: params.courseId }
            : params?.subjectId != null
              ? { subjectId: params.subjectId }
              : undefined,
      })
      .then((r) => r.data);
  },

  create(body: CreateLectureRequest): Promise<Lecture> {
    return apiClient.post<Lecture>("/lectures", body).then((r) => r.data);
  },

  update(id: string, body: UpdateLectureRequest): Promise<Lecture> {
    return apiClient.patch<Lecture>(`/lectures/${id}`, body).then((r) => r.data);
  },

  migrateDefaultSubject(body: MigrateLecturesRequest): Promise<MigrateLecturesResponse> {
    return apiClient
      .post<MigrateLecturesResponse>("/lectures/migrate/default-subject", body)
      .then((r) => r.data);
  },

  migrateToCourses(): Promise<MigrateLecturesToCoursesResponse> {
    return apiClient
      .post<MigrateLecturesToCoursesResponse>("/lectures/migrate/to-courses")
      .then((r) => r.data);
  },
};
