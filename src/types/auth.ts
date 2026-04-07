/**
 * Mirrors NestJS AuthModule + User schema (safe user / JWT) and `JwtAuthAdapter.login` result.
 *
 * `POST /auth/login` returns `{ accessToken, user }` where `user` is `toSafeUser()` (no password).
 * `GET /auth/profile` returns `JwtPayload` (`sub`, `email`, `role`).
 */

export type Role = "admin" | "student";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

export interface JWTPayload {
  sub: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

/** Nest `JwtAuthAdapter.login` response. */
export interface LoginResponse {
  accessToken: string;
  user: User;
}
