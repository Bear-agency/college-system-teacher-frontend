import { apiClient } from "@/src/services/api/client";
import type { UserListItem } from "@/src/types/api";

export const usersService = {
  list(): Promise<UserListItem[]> {
    return apiClient.get<UserListItem[]>("/users").then((r) => r.data);
  },
};
