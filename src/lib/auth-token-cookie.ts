import Cookies from "js-cookie";
import ms from "ms";
import { AUTH_JWT_COOKIE_NAME } from "@/src/constants/auth-cookie";

function parseJwtDurationMs(spec: string): number {
  const n = ms(spec as ms.StringValue);
  return typeof n === "number" && !Number.isNaN(n) ? n : (ms("1h" as ms.StringValue) ?? 3600_000);
}

/**
 * Mirrors backend `JWT_EXPIRATION` (e.g. `1h`, `7d`) via `NEXT_PUBLIC_JWT_EXPIRATION`.
 */
export function getJwtCookieExpiresAt(): Date {
  const spec = process.env.NEXT_PUBLIC_JWT_EXPIRATION ?? "1h";
  return new Date(Date.now() + parseJwtDurationMs(spec));
}

export function setAuthJwtCookie(token: string): void {
  Cookies.set(AUTH_JWT_COOKIE_NAME, token, {
    expires: getJwtCookieExpiresAt(),
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export function removeAuthJwtCookie(): void {
  Cookies.remove(AUTH_JWT_COOKIE_NAME, { path: "/" });
}

export function getAuthJwtCookie(): string | undefined {
  return Cookies.get(AUTH_JWT_COOKIE_NAME);
}
