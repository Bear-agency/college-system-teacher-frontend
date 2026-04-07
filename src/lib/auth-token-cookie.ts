import Cookies from "js-cookie";
import ms from "ms";
import { AUTH_JWT_COOKIE_NAME } from "@/src/constants/auth-cookie";

const FALLBACK_COOKIE_MS = ms("1h" as ms.StringValue) ?? 3600_000;

function jwtExpToCookieExpires(token: string): Date {
  try {
    const segment = token.split(".")[1];
    if (!segment) throw new Error("no payload");
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const payload = JSON.parse(atob(padded)) as { exp?: number };
    if (typeof payload.exp === "number") {
      return new Date(payload.exp * 1000);
    }
  } catch {
    /* ignore */
  }
  return new Date(Date.now() + FALLBACK_COOKIE_MS);
}

export function setAuthJwtCookie(token: string): void {
  Cookies.set(AUTH_JWT_COOKIE_NAME, token, {
    expires: jwtExpToCookieExpires(token),
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
