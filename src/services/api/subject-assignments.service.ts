import { apiClient } from "@/src/services/api/client";
import type { CreateSubjectAssignmentRequest, SubjectAssignment } from "@/src/types/api";

export interface SubjectAssignmentListParams {
  subjectId?: string;
  groupId?: string;
  academicYearId?: string;
}

export const subjectAssignmentsService = {
  list(params?: SubjectAssignmentListParams): Promise<SubjectAssignment[]> {
    return apiClient
      .get<SubjectAssignment[]>("/subject-assignments", {
        params:
          params?.subjectId || params?.groupId || params?.academicYearId
            ? {
                subjectId: params.subjectId,
                groupId: params.groupId,
                academicYearId: params.academicYearId,
              }
            : undefined,
      })
      .then((r) => r.data);
  },

  getById(id: string): Promise<SubjectAssignment> {
    return apiClient.get<SubjectAssignment>(`/subject-assignments/${id}`).then((r) => r.data);
  },

  create(body: CreateSubjectAssignmentRequest): Promise<SubjectAssignment> {
    return apiClient.post<SubjectAssignment>("/subject-assignments", body).then((r) => r.data);
  },

  remove(id: string): Promise<{ success: boolean }> {
    return apiClient
      .delete<{ success: boolean }>(`/subject-assignments/${id}`)
      .then((r) => r.data);
  },
};
