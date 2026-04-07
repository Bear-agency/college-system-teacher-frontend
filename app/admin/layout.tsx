import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { ProtectedRoute } from "@/src/components/auth/ProtectedRoute";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAdmin>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 bg-muted/40 p-6">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
