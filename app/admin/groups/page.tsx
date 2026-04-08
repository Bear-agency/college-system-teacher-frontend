"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { departmentsService, getApiErrorMessage, groupsService } from "@/src/services/api";
import { groupCreateSchema } from "@/src/schemas/forms";
import { useAcademicYearStore } from "@/src/store/academic-year-store";
import type { Department, Group } from "@/src/types/api";
import type { z } from "zod";

type FormValues = z.infer<typeof groupCreateSchema>;

const NO_DEPARTMENT = "__none__";

function deptLabel(d: Department) {
  return d.code ? `${d.name} (${d.code})` : d.name;
}

export default function AdminGroupsPage() {
  const queryClient = useQueryClient();
  const { selectedAcademicYearId } = useAcademicYearStore();
  const [filterDept, setFilterDept] = useState<string>("");

  const departmentsQuery = useQuery({
    queryKey: ["departments", selectedAcademicYearId],
    queryFn: () => departmentsService.list(selectedAcademicYearId ?? undefined),
  });

  const groupsQuery = useQuery({
    queryKey: ["groups", selectedAcademicYearId, filterDept],
    queryFn: () =>
      groupsService.list({
        academicYearId: selectedAcademicYearId ?? undefined,
        departmentId: filterDept || undefined,
      }),
    enabled: Boolean(selectedAcademicYearId),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(groupCreateSchema),
    defaultValues: {
      name: "",
      courseNumber: 1,
      departmentId: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: groupsService.create,
    onSuccess: () => {
      toast.success("Group created");
      form.reset({
        name: "",
        courseNumber: 1,
        departmentId: "",
      });
      void queryClient.invalidateQueries({ queryKey: ["groups"], exact: false });
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: groupsService.remove,
    onSuccess: () => {
      toast.success("Group removed");
      void queryClient.invalidateQueries({ queryKey: ["groups"], exact: false });
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const columns = useMemo<ColumnDef<Group>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
      {
        accessorKey: "courseNumber",
        header: "Course",
        cell: ({ row }) => row.original.courseNumber,
      },
      {
        id: "department",
        header: "Department",
        cell: ({ row }) => {
          const d = row.original.departmentId;
          if (d && typeof d === "object" && "name" in d) {
            return (d as { name: string; code?: string | null }).code
              ? `${(d as { name: string }).name} (${(d as { code: string }).code})`
              : (d as { name: string }).name;
          }
          return String(d ?? "—");
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm(`Delete group ${row.original.name}?`)) {
                deleteMutation.mutate(row.original._id);
              }
            }}
          >
            Delete
          </Button>
        ),
      },
    ],
    [deleteMutation],
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Groups</h1>
        <p className="text-sm text-muted-foreground">
          Groups belong to one department and one academic year. Pick a global year in the sidebar to
          list and create groups.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent className="max-w-md space-y-2">
          <Label>Department (optional)</Label>
          <Select
            value={filterDept === "" ? NO_DEPARTMENT : filterDept}
            onValueChange={(v) => setFilterDept(!v || v === NO_DEPARTMENT ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_DEPARTMENT}>All departments</SelectItem>
              {(departmentsQuery.data ?? []).map((d: Department) => (
                <SelectItem key={d.id} value={d.id}>
                  {deptLabel(d)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle>Create group</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((v) => {
              if (!selectedAcademicYearId) {
                toast.error("Select an academic year in the sidebar");
                return;
              }
              createMutation.mutate({
                name: v.name,
                courseNumber: v.courseNumber,
                departmentId: v.departmentId,
                academicYearId: selectedAcademicYearId,
              });
            })}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input {...form.register("name")} placeholder="KN-21" />
                {form.formState.errors.name ? (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label>Course (year)</Label>
                <Select
                  value={String(form.watch("courseNumber"))}
                  onValueChange={(v) => {
                    if (!v) return;
                    form.setValue("courseNumber", Number(v) as 1 | 2 | 3 | 4, {
                      shouldValidate: true,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Department</Label>
                <Select
                  value={form.watch("departmentId") || NO_DEPARTMENT}
                  onValueChange={(v) =>
                    form.setValue("departmentId", !v || v === NO_DEPARTMENT ? "" : v, {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_DEPARTMENT}>Select department</SelectItem>
                    {(departmentsQuery.data ?? []).map((d: Department) => (
                      <SelectItem key={d.id} value={d.id}>
                        {deptLabel(d)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.departmentId ? (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.departmentId.message}
                  </p>
                ) : null}
              </div>
            </div>
            <Button type="submit" disabled={createMutation.isPending || !selectedAcademicYearId}>
              Create
            </Button>
          </form>
        </CardContent>
      </Card>

      {!selectedAcademicYearId ? (
        <p className="text-sm text-muted-foreground">
          Choose an educational year in the sidebar to load groups.
        </p>
      ) : groupsQuery.isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <DataTable columns={columns} data={groupsQuery.data ?? []} />
      )}
    </div>
  );
}
