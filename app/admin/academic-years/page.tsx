"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { getApiErrorMessage, academicYearsService } from "@/src/services/api";
import { academicYearCreateSchema } from "@/src/schemas/forms";
import type { AcademicYear } from "@/src/types/api";
import type { z } from "zod";

type FormValues = z.infer<typeof academicYearCreateSchema>;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString();
}

export default function AdminAcademicYearsPage() {
  const queryClient = useQueryClient();
  const yearsQuery = useQuery({
    queryKey: ["academic-years"],
    queryFn: () => academicYearsService.list(),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(academicYearCreateSchema),
    defaultValues: {
      title: "",
      startDate: "",
      endDate: "",
      isActive: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: academicYearsService.create,
    onSuccess: () => {
      toast.success("Academic year created");
      form.reset({ title: "", startDate: "", endDate: "", isActive: false });
      queryClient.invalidateQueries({ queryKey: ["academic-years"] });
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const setActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) =>
      active ? academicYearsService.update(id, { isActive: true }) : academicYearsService.close(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-years"] });
      toast.success("Year status updated");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const sorted = useMemo(
    () =>
      [...(yearsQuery.data ?? [])].sort(
        (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
      ),
    [yearsQuery.data],
  );

  const columns = useMemo<ColumnDef<AcademicYear>[]>(
    () => [
      { accessorKey: "title", header: "Title" },
      {
        accessorKey: "startDate",
        header: "Start",
        cell: ({ row }) => formatDate(row.original.startDate),
      },
      {
        accessorKey: "endDate",
        header: "End",
        cell: ({ row }) => formatDate(row.original.endDate),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) =>
          row.original.isActive ? (
            <Badge>Active</Badge>
          ) : (
            <Badge variant="secondary">Inactive</Badge>
          ),
      },
      {
        id: "toggle",
        header: "Active",
        cell: ({ row }) => (
          <Switch
            checked={row.original.isActive}
            disabled={setActiveMutation.isPending}
            onCheckedChange={(checked) =>
              setActiveMutation.mutate({ id: row.original._id, active: checked })
            }
          />
        ),
      },
    ],
    [setActiveMutation],
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Academic years</h1>
        <p className="text-sm text-muted-foreground">List, create, and toggle the active year.</p>
      </div>

      <Card className="border-2 border-primary/20 bg-card shadow-md">
        <CardHeader>
          <CardTitle>Create academic year</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={form.handleSubmit((values) =>
              createMutation.mutate({
                title: values.title,
                startDate: new Date(values.startDate).toISOString(),
                endDate: new Date(values.endDate).toISOString(),
                isActive: values.isActive,
              }),
            )}
          >
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...form.register("title")} />
              {form.formState.errors.title ? (
                <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start date</Label>
              <Input id="startDate" type="date" {...form.register("startDate")} />
              {form.formState.errors.startDate ? (
                <p className="text-sm text-destructive">{form.formState.errors.startDate.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End date</Label>
              <Input id="endDate" type="date" {...form.register("endDate")} />
              {form.formState.errors.endDate ? (
                <p className="text-sm text-destructive">{form.formState.errors.endDate.message}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-2 md:col-span-2">
              <Switch
                id="isActive"
                checked={form.watch("isActive")}
                onCheckedChange={(v) => form.setValue("isActive", v)}
              />
              <Label htmlFor="isActive">Set as active</Label>
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={createMutation.isPending}>
                Create
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {yearsQuery.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : (
        <DataTable columns={columns} data={sorted} />
      )}
    </div>
  );
}
