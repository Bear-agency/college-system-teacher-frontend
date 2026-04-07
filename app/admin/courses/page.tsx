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
import { coursesService, departmentsService, getApiErrorMessage, subjectsService } from "@/src/services/api";
import { courseCreateSchema } from "@/src/schemas/forms";
import { useAcademicYearStore } from "@/src/store/academic-year-store";
import type { Course, Department, Subject } from "@/src/types/api";
import type { z } from "zod";

const NO_DEPARTMENT = "__none__";
const NO_SUBJECT = "__none__";

export default function AdminCoursesPage() {
  const queryClient = useQueryClient();
  const { selectedAcademicYearId } = useAcademicYearStore();
  const [departmentId, setDepartmentId] = useState<string>("");
  const [subjectId, setSubjectId] = useState<string>("");

  const departmentsQuery = useQuery({
    queryKey: ["departments", selectedAcademicYearId],
    queryFn: () =>
      departmentsService.list(selectedAcademicYearId ?? undefined),
  });

  const subjectsQuery = useQuery({
    queryKey: ["subjects", departmentId],
    queryFn: () => subjectsService.list(departmentId),
    enabled: Boolean(departmentId),
  });

  const coursesQuery = useQuery({
    queryKey: ["courses", subjectId],
    queryFn: () => coursesService.list(subjectId),
    enabled: Boolean(subjectId),
  });

  const form = useForm<
    z.input<typeof courseCreateSchema>,
    unknown,
    z.output<typeof courseCreateSchema>
  >({
    resolver: zodResolver(courseCreateSchema),
    defaultValues: {
      name: "",
      description: "",
      code: "",
      subjectId: "",
    },
  });

  useEffect(() => {
    if (subjectId) {
      form.setValue("subjectId", subjectId, { shouldValidate: true });
    }
  }, [subjectId, form]);

  const createMutation = useMutation({
    mutationFn: coursesService.create,
    onSuccess: () => {
      toast.success("Course created");
      form.reset({
        name: "",
        description: "",
        code: "",
        subjectId: subjectId || "",
      });
      queryClient.invalidateQueries({ queryKey: ["courses", subjectId] });
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: coursesService.remove,
    onSuccess: () => {
      toast.success("Course removed");
      queryClient.invalidateQueries({ queryKey: ["courses", subjectId] });
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const columns = useMemo<ColumnDef<Course>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
      {
        accessorKey: "code",
        header: "Code",
        cell: ({ row }) => row.original.code ?? "—",
      },
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
        <h1 className="text-2xl font-semibold">Courses</h1>
        <p className="text-sm text-muted-foreground">
          Courses belong to a subject. Choose department and subject, then list or create courses.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent className="max-w-md space-y-4">
          <div className="space-y-2">
            <Label>Department</Label>
            <Select
              value={departmentId === "" ? NO_DEPARTMENT : departmentId}
              onValueChange={(v) => {
                const id = v === NO_DEPARTMENT ? "" : (v ?? "");
                setDepartmentId(id);
                setSubjectId("");
                form.setValue("subjectId", "", { shouldValidate: true });
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
          <div className="space-y-2">
            <Label>Subject</Label>
            <Select
              value={subjectId === "" ? NO_SUBJECT : subjectId}
              onValueChange={(v) => {
                const id = v === NO_SUBJECT ? "" : (v ?? "");
                setSubjectId(id);
                form.setValue("subjectId", id, { shouldValidate: true });
              }}
              disabled={!departmentId}
            >
              <SelectTrigger className="w-full min-w-0 max-w-full">
                <SelectValue placeholder="Select subject">
                  {(value: unknown) => {
                    const v = String(value ?? "");
                    if (v === "" || v === NO_SUBJECT) return "Select subject";
                    const s = (subjectsQuery.data ?? []).find((x) => x.id === v);
                    return s ? s.name : v;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_SUBJECT}>Select subject</SelectItem>
                {(subjectsQuery.data ?? []).map((s: Subject) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-primary/20 bg-card shadow-md">
        <CardHeader>
          <CardTitle>Create course</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((v) => {
              if (!subjectId) {
                toast.error("Select a subject");
                return;
              }
              createMutation.mutate({ ...v, subjectId });
            })}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input {...form.register("name")} />
                {form.formState.errors.name ? (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label>Code (optional)</Label>
                <Input {...form.register("code")} placeholder="e.g. CS101" />
                {form.formState.errors.code ? (
                  <p className="text-sm text-destructive">{form.formState.errors.code.message}</p>
                ) : null}
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
            <Button type="submit" disabled={createMutation.isPending || !subjectId}>
              Create
            </Button>
          </form>
        </CardContent>
      </Card>

      {!subjectId ? (
        <p className="text-sm text-muted-foreground">Select a subject to load courses.</p>
      ) : coursesQuery.isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <DataTable columns={columns} data={coursesQuery.data ?? []} />
      )}
    </div>
  );
}
