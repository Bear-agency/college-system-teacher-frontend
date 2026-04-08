"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { departmentsService, getApiErrorMessage, subjectsService } from "@/src/services/api";
import { subjectCreateSchema } from "@/src/schemas/forms";
import { useAcademicYearStore } from "@/src/store/academic-year-store";
import type { Department, Subject } from "@/src/types/api";
import type { z } from "zod";

type FormValues = z.infer<typeof subjectCreateSchema>;

/** Base UI Select must not switch `value` between undefined and string — keep controlled with a sentinel. */
const NO_DEPARTMENT = "__none__";
const YEAR_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: "1st year",
  2: "2nd year",
  3: "3rd year",
  4: "4th year",
};

export default function AdminSubjectsPage() {
  const queryClient = useQueryClient();
  const { selectedAcademicYearId } = useAcademicYearStore();
  const [departmentId, setDepartmentId] = useState<string>("");

  const departmentsQuery = useQuery({
    queryKey: ["departments", selectedAcademicYearId],
    queryFn: () =>
      departmentsService.list(selectedAcademicYearId ?? undefined),
  });

  const subjectsQuery = useQuery({
    queryKey: ["subjects", departmentId],
    queryFn: () => subjectsService.list(departmentId || undefined),
    enabled: Boolean(departmentId),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(subjectCreateSchema),
    defaultValues: {
      name: "",
      description: "",
      departmentId: "",
      semester: 1,
      courseNumber: 1,
    },
  });

  useEffect(() => {
    if (departmentId) {
      form.setValue("departmentId", departmentId, { shouldValidate: true });
    }
  }, [departmentId, form]);

  const createMutation = useMutation({
    mutationFn: subjectsService.create,
    onSuccess: () => {
      toast.success("Subject created");
      form.reset({
        name: "",
        description: "",
        departmentId: departmentId || "",
        semester: 1,
        courseNumber: 1,
      });
      void queryClient.invalidateQueries({ queryKey: ["subjects", departmentId], exact: false });
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: subjectsService.remove,
    onSuccess: () => {
      toast.success("Subject removed");
      void queryClient.invalidateQueries({ queryKey: ["subjects", departmentId], exact: false });
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const columns = useMemo<ColumnDef<Subject>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
      {
        accessorKey: "courseNumber",
        header: "Study year",
        cell: ({ row }) => {
          const y = row.original.courseNumber ?? 1;
          return YEAR_LABELS[y as keyof typeof YEAR_LABELS] ?? y;
        },
      },
      { accessorKey: "semester", header: "Semester" },
      {
        id: "desc",
        header: "Description",
        cell: ({ row }) => (
          <span className="line-clamp-2 max-w-xs text-muted-foreground text-sm">
            {row.original.description}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm(`Delete ${row.original.name}?`)) {
                deleteMutation.mutate(row.original.id);
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
        <h1 className="text-2xl font-semibold">Subjects</h1>
        <p className="text-sm text-muted-foreground">
          Choose a department, then filter by study year (course). Subjects belong to a department and
          a course number (1–4).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent className="max-w-2xl space-y-4">
          <div className="space-y-2">
            <Label>Department</Label>
            <Select
              value={departmentId === "" ? NO_DEPARTMENT : departmentId}
              onValueChange={(v) => {
                const id = v === NO_DEPARTMENT ? "" : (v ?? "");
                setDepartmentId(id);
                form.setValue("departmentId", id, { shouldValidate: true });
              }}
            >
              <SelectTrigger className="w-full min-w-0 max-w-full">
                <SelectValue placeholder="Select department">
                  {(value: unknown) => {
                    const v = String(value ?? "");
                    if (v === "" || v === NO_DEPARTMENT) return "Select department";
                    const d = (departmentsQuery.data ?? []).find((x) => x.id === v);
                    return d ? (d.code ? `${d.name} (${d.code})` : d.name) : v;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_DEPARTMENT}>Select department</SelectItem>
                {(departmentsQuery.data ?? []).map((d: Department) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.code ? `${d.name} (${d.code})` : d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

        </CardContent>
      </Card>

      <Card className="border-2 border-primary/20 bg-card shadow-md">
        <CardHeader>
          <CardTitle>Create subject</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((v) => {
              if (!departmentId) {
                toast.error("Select a department");
                return;
              }
              createMutation.mutate({ ...v, departmentId });
            })}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Name</Label>
                <Input {...form.register("name")} />
                {form.formState.errors.name ? (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label>Study year</Label>
                <Select
                  value={String(form.watch("courseNumber"))}
                  onValueChange={(v) =>
                    form.setValue("courseNumber", Number(v) as 1 | 2 | 3 | 4, {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1st year</SelectItem>
                    <SelectItem value="2">2nd year</SelectItem>
                    <SelectItem value="3">3rd year</SelectItem>
                    <SelectItem value="4">4th year</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.courseNumber ? (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.courseNumber.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label>Semester</Label>
                <Select
                  value={String(form.watch("semester"))}
                  onValueChange={(v) =>
                    form.setValue("semester", Number(v) as 1 | 2, { shouldValidate: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea rows={4} {...form.register("description")} />
              {form.formState.errors.description ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.description.message}
                </p>
              ) : null}
            </div>
            <Button type="submit" disabled={createMutation.isPending || !departmentId}>
              Create
            </Button>
          </form>
        </CardContent>
      </Card>

      {!departmentId ? (
        <p className="text-sm text-muted-foreground">Select a department to load subjects.</p>
      ) : subjectsQuery.isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <DataTable columns={columns} data={subjectsQuery.data ?? []} />
      )}
    </div>
  );
}
