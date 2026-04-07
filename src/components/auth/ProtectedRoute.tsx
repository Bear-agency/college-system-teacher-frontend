"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/src/store/useAuthStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** When true, only `role === "admin"` may access (matches Nest admin dashboard). */
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = true }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isHydrated, checkAuth } = useAuthStore();

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (requireAdmin && user?.role !== "admin") {
      router.replace("/login?error=admin-only");
    }
  }, [isHydrated, isAuthenticated, user?.role, requireAdmin, router, pathname]);

  if (!isHydrated) {
    return <div className="p-8 text-sm text-muted-foreground">Loading session…</div>;
  }

  if (!isAuthenticated || (requireAdmin && user?.role !== "admin")) {
    return <div className="p-8 text-sm text-muted-foreground">Redirecting…</div>;
  }

  return <>{children}</>;
}
