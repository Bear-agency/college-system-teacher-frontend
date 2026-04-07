import { apiClient } from "@/src/lib/api-client";
import type { JwtProfile, LoginRequest, LoginResponse, RegisterRequest } from "@/src/types/api";

export const authService = {
  login(body: LoginRequest): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>("/auth/login", body).then((r) => r.data);
  },

  register(body: RegisterRequest): Promise<Record<string, unknown>> {
    return apiClient.post<Record<string, unknown>>("/auth/register", body).then((r) => r.data);
  },

  profile(): Promise<JwtProfile> {
    return apiClient.get<JwtProfile>("/auth/profile").then((r) => r.data);
  },
};
