"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getApiErrorMessage,
  academicYearsService,
  departmentsService,
} from "@/src/services/api";
import { departmentCreateSchema } from "@/src/schemas/forms";
import { useAcademicYearStore } from "@/src/store/academic-year-store";
import type { AcademicYear, Department } from "@/src/types/api";
import type { z } from "zod";

type FormValues = z.infer<typeof departmentCreateSchema>;

export default function AdminDepartmentsPage() {
  const queryClient = useQueryClient();
  const { selectedAcademicYearId } = useAcademicYearStore();

  const yearsQuery = useQuery({
    queryKey: ["academic-years"],
    queryFn: () => academicYearsService.list(),
  });

  const departmentsQuery = useQuery({
    queryKey: ["departments", selectedAcademicYearId],
    queryFn: () =>
      departmentsService.list(selectedAcademicYearId ?? undefined),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(departmentCreateSchema),
    defaultValues: { name: "", code: "", academicYearIds: [] },
  });

  const selectedYears = form.watch("academicYearIds");

  const toggleYear = (id: string, checked: boolean) => {
    const next = new Set(selectedYears);
    if (checked) next.add(id);
    else next.delete(id);
    form.setValue("academicYearIds", [...next], { shouldValidate: true });
  };

  const createMutation = useMutation({
    mutationFn: departmentsService.create,
    onSuccess: () => {
      toast.success("Department created");
      form.reset({ name: "", code: "", academicYearIds: [] });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: departmentsService.remove,
    onSuccess: () => {
      toast.success("Department removed");
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const columns = useMemo<ColumnDef<Department>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "code", header: "Code" },
      {
        id: "years",
        header: "Years",
        cell: ({ row }) => row.original.academicYearIds.length,
      },
      {
        id: "subjects",
        header: "Subjects",
        cell: ({ row }) => row.original.subjects.length,
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
        <h1 className="text-2xl font-semibold">Departments</h1>
        <p className="text-sm text-muted-foreground">
          Filtered by global academic year when one is selected in the sidebar.
        </p>
      </div>

      <Card className="border-2 border-primary/20 bg-card shadow-md">
        <CardHeader>
          <CardTitle>Create department</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((v) => createMutation.mutate(v))}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="d-name">Name</Label>
                <Input id="d-name" {...form.register("name")} />
                {form.formState.errors.name ? (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="d-code">Code</Label>
                <Input id="d-code" {...form.register("code")} />
                {form.formState.errors.code ? (
                  <p className="text-sm text-destructive">{form.formState.errors.code.message}</p>
                ) : null}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Academic years</Label>
              <div className="grid gap-2 rounded-md border p-3 sm:grid-cols-2">
                {(yearsQuery.data ?? []).map((y: AcademicYear) => (
                  <label key={y._id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={selectedYears.includes(y._id)}
                      onCheckedChange={(c) => toggleYear(y._id, c === true)}
                    />
                    {y.title}
                  </label>
                ))}
              </div>
              {form.formState.errors.academicYearIds ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.academicYearIds.message as string}
                </p>
              ) : null}
            </div>
            <Button type="submit" disabled={createMutation.isPending}>
              Create
            </Button>
          </form>
        </CardContent>
      </Card>

      {departmentsQuery.isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <DataTable columns={columns} data={departmentsQuery.data ?? []} />
      )}
    </div>
  );
}
