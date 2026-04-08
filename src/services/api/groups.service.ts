import { apiClient } from "@/src/services/api/client";
import type { CreateGroupRequest, Group, UpdateGroupRequest } from "@/src/types/api";

export interface GroupListParams {
  academicYearId?: string;
  departmentId?: string;
}

export const groupsService = {
  list(params?: GroupListParams): Promise<Group[]> {
    return apiClient
      .get<Group[]>("/groups", {
        params:
          params?.academicYearId || params?.departmentId
            ? {
                academicYearId: params.academicYearId,
                departmentId: params.departmentId,
              }
            : undefined,
      })
      .then((r) => r.data);
  },

  getById(id: string): Promise<Group> {
    return apiClient.get<Group>(`/groups/${id}`).then((r) => r.data);
  },

  create(body: CreateGroupRequest): Promise<Group> {
    return apiClient.post<Group>("/groups", body).then((r) => r.data);
  },

  update(id: string, body: UpdateGroupRequest): Promise<Group> {
    return apiClient.patch<Group>(`/groups/${id}`, body).then((r) => r.data);
  },

  remove(id: string): Promise<unknown> {
    return apiClient.delete(`/groups/${id}`).then((r) => r.data);
  },
};
