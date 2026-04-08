"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  CalendarRange,
  Cog,
  GraduationCap,
  LayoutDashboard,
  Layers,
  LogOut,
  Users,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { academicYearsService } from "@/src/services/api/academic-years.service";
import { useAcademicYearStore } from "@/src/store/academic-year-store";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/src/store/useAuthStore";

const nav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/academic-years", label: "Academic Years", icon: CalendarRange },
  { href: "/admin/departments", label: "Departments", icon: Layers },
  { href: "/admin/groups", label: "Groups", icon: UsersRound },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/subjects", label: "Subjects", icon: BookOpen },
  { href: "/admin/lectures", label: "Lectures", icon: GraduationCap },
  { href: "/admin/settings", label: "Settings", icon: Cog },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const { selectedAcademicYearId, setSelectedAcademicYearId } = useAcademicYearStore();

  const yearsQuery = useQuery({
    queryKey: ["academic-years"],
    queryFn: () => academicYearsService.list(),
  });

  const activeYear = yearsQuery.data?.find((y) => y.isActive);

  return (
    <aside className="w-72 shrink-0 border-r bg-sidebar px-4 py-5">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">HPK Teacher System</h2>
        <p className="text-sm text-muted-foreground">Admin</p>
      </div>

      <div className="space-y-2 rounded-lg border border-sidebar-border bg-card p-3 shadow-sm">
        <Label htmlFor="year-context">Educational year (global)</Label>
        <Select
          value={selectedAcademicYearId ?? "all"}
          onValueChange={(v) => setSelectedAcademicYearId(v === "all" ? null : v)}
        >
          <SelectTrigger id="year-context" className="w-full bg-background">
            <SelectValue placeholder="All years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All years</SelectItem>
            {(yearsQuery.data ?? []).map((y) => (
              <SelectItem key={y._id} value={y._id}>
                {y.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {activeYear ? (
          <Badge variant="secondary" className="mt-1">
            Active: {activeYear.title}
          </Badge>
        ) : null}
      </div>

      <Separator className="my-6" />

      <nav className="space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/admin/dashboard" && href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                active ? "bg-sidebar-accent font-medium" : "hover:bg-accent",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <Separator className="my-6" />

      <ButtonLogout
        onLogout={() => {
          logout();
          toast.success("Signed out");
          router.replace("/login");
        }}
      />
    </aside>
  );
}

function ButtonLogout({ onLogout }: { onLogout: () => void }) {
  return (
    <button
      type="button"
      onClick={() => void onLogout()}
      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
    >
      <LogOut className="size-4" />
      Sign out
    </button>
  );
}
