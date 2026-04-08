"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
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
import { departmentsService, getApiErrorMessage, groupsService, studentsService } from "@/src/services/api";
import { useAcademicYearStore } from "@/src/store/academic-year-store";
import type { Department, Group, Student } from "@/src/types/api";

const NO_DEPARTMENT = "__none__";
const NO_GROUP = "__none__";
const ALL_COURSES = "__all__";

function isPopulatedGroup(g: Student["group"]): g is Group {
  return typeof g === "object" && g !== null && "_id" in g;
}

export default function AdminStudentsPage() {
  const queryClient = useQueryClient();
  const { selectedAcademicYearId } = useAcademicYearStore();
  const [filterDepartmentId, setFilterDepartmentId] = useState("");
  const [filterGroupId, setFilterGroupId] = useState("");
  const [filterCourse, setFilterCourse] = useState<string>(ALL_COURSES);

  const [newFullName, setNewFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newTgId, setNewTgId] = useState("");
  const [newGroupId, setNewGroupId] = useState("");
  const [bulkJson, setBulkJson] = useState("");

  const departmentsQuery = useQuery({
    queryKey: ["departments", selectedAcademicYearId],
    queryFn: () => departmentsService.list(selectedAcademicYearId ?? undefined),
  });

  const groupsQuery = useQuery({
    queryKey: ["groups", selectedAcademicYearId, filterDepartmentId],
    queryFn: () =>
      groupsService.list({
        academicYearId: selectedAcademicYearId ?? undefined,
        departmentId: filterDepartmentId || undefined,
      }),
    enabled: Boolean(selectedAcademicYearId),
  });

  const listParams = useMemo(() => {
    const courseNumber =
      filterCourse === ALL_COURSES ? undefined : (Number(filterCourse) as 1 | 2 | 3 | 4);
    return {
      academicYearId: selectedAcademicYearId ?? undefined,
      departmentId: filterDepartmentId || undefined,
      groupId: filterGroupId || undefined,
      courseNumber,
    };
  }, [selectedAcademicYearId, filterDepartmentId, filterGroupId, filterCourse]);

  const studentsQuery = useQuery({
    queryKey: ["students", listParams],
    queryFn: () => studentsService.list(listParams),
  });

  const createMutation = useMutation({
    mutationFn: studentsService.create,
    onSuccess: () => {
      toast.success("Student created");
      setNewFullName("");
      setNewEmail("");
      setNewTgId("");
      void queryClient.invalidateQueries({ queryKey: ["students"], exact: false });
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const bulkMutation = useMutation({
    mutationFn: studentsService.bulkImport,
    onSuccess: (res) => {
      toast.success(`Imported ${res.created} students${res.failed.length ? `, ${res.failed.length} failed` : ""}`);
      setBulkJson("");
      void queryClient.invalidateQueries({ queryKey: ["students"], exact: false });
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: studentsService.remove,
    onSuccess: () => {
      toast.success("Student removed");
      void queryClient.invalidateQueries({ queryKey: ["students"], exact: false });
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const columns = useMemo<ColumnDef<Student>[]>(
    () => [
      { accessorKey: "fullName", header: "Name" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "tgId", header: "Telegram", cell: ({ row }) => row.original.tgId ?? "—" },
      {
        id: "group",
        header: "Group",
        cell: ({ row }) => {
          const g = row.original.group;
          if (isPopulatedGroup(g)) return g.name;
          return "—";
        },
      },
      {
        id: "course",
        header: "Course",
        cell: ({ row }) => {
          const g = row.original.group;
          if (isPopulatedGroup(g)) return g.courseNumber;
          return "—";
        },
      },
      {
        id: "dept",
        header: "Department",
        cell: ({ row }) => {
          const g = row.original.group;
          if (!isPopulatedGroup(g)) return "—";
          const d = g.departmentId;
          if (d && typeof d === "object" && "name" in d) {
            return (d as { code?: string | null; name: string }).code
              ? `${(d as { name: string }).name} (${(d as { code: string }).code})`
              : (d as { name: string }).name;
          }
          return String(d ?? "—");
        },
      },
      {
        id: "active",
        header: "Active",
        cell: ({ row }) => (row.original.isActive ? "Yes" : "No"),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm(`Remove ${row.original.fullName}?`)) {
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

  const groupsForCreate = groupsQuery.data ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Students</h1>
        <p className="text-sm text-muted-foreground">
          Filter by department, group, and course. Select a global academic year in the sidebar.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="min-w-[200px] space-y-2">
            <Label>Department</Label>
            <Select
              value={filterDepartmentId === "" ? NO_DEPARTMENT : filterDepartmentId}
              onValueChange={(v) => {
                setFilterDepartmentId(!v || v === NO_DEPARTMENT ? "" : v);
                setFilterGroupId("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_DEPARTMENT}>All departments</SelectItem>
                {(departmentsQuery.data ?? []).map((d: Department) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.code ? `${d.name} (${d.code})` : d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[200px] space-y-2">
            <Label>Group</Label>
            <Select
              value={filterGroupId === "" ? NO_GROUP : filterGroupId}
              onValueChange={(v) => setFilterGroupId(!v || v === NO_GROUP ? "" : v)}
              disabled={!selectedAcademicYearId}
            >
              <SelectTrigger>
                <SelectValue placeholder="All groups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_GROUP}>All groups</SelectItem>
                {groupsForCreate.map((g: Group) => (
                  <SelectItem key={g._id} value={g._id}>
                    {g.name} (course {g.courseNumber})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[160px] space-y-2">
            <Label>Course</Label>
            <Select
              value={filterCourse}
              onValueChange={(v) => {
                if (v) setFilterCourse(v);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_COURSES}>All courses</SelectItem>
                {[1, 2, 3, 4].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add student</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Full name</Label>
            <Input value={newFullName} onChange={(e) => setNewFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Telegram (optional)</Label>
            <Input value={newTgId} onChange={(e) => setNewTgId(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Group</Label>
            <Select
              value={newGroupId || NO_GROUP}
              onValueChange={(v) => setNewGroupId(!v || v === NO_GROUP ? "" : v)}
              disabled={!selectedAcademicYearId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_GROUP}>Select group</SelectItem>
                {groupsForCreate.map((g: Group) => (
                  <SelectItem key={g._id} value={g._id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Button
              type="button"
              disabled={
                createMutation.isPending ||
                !newFullName.trim() ||
                !newEmail.trim() ||
                !newGroupId ||
                !selectedAcademicYearId
              }
              onClick={() =>
                createMutation.mutate({
                  fullName: newFullName.trim(),
                  email: newEmail.trim(),
                  groupId: newGroupId,
                  tgId: newTgId.trim() || undefined,
                })
              }
            >
              Create student
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bulk import (JSON)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Array of objects: <code className="text-xs">{"{ \"fullName\", \"email\", \"tgId\"? }"}</code>
          </p>
          <div className="space-y-2">
            <Label>Group for import</Label>
            <Select
              value={newGroupId || NO_GROUP}
              onValueChange={(v) => setNewGroupId(!v || v === NO_GROUP ? "" : v)}
              disabled={!selectedAcademicYearId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_GROUP}>Select group</SelectItem>
                {groupsForCreate.map((g: Group) => (
                  <SelectItem key={g._id} value={g._id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Textarea
            rows={6}
            placeholder='[{"fullName":"A","email":"a@x.com"},{"fullName":"B","email":"b@x.com"}]'
            value={bulkJson}
            onChange={(e) => setBulkJson(e.target.value)}
          />
          <Button
            type="button"
            variant="secondary"
            disabled={bulkMutation.isPending || !newGroupId || !bulkJson.trim()}
            onClick={() => {
              try {
                const parsed = JSON.parse(bulkJson) as unknown;
                if (!Array.isArray(parsed)) {
                  toast.error("JSON must be an array");
                  return;
                }
                bulkMutation.mutate({
                  groupId: newGroupId,
                  students: parsed.map((row) => ({
                    fullName: String((row as { fullName?: string }).fullName ?? ""),
                    email: String((row as { email?: string }).email ?? ""),
                    tgId: (row as { tgId?: string }).tgId,
                  })),
                });
              } catch {
                toast.error("Invalid JSON");
              }
            }}
          >
            Import
          </Button>
        </CardContent>
      </Card>

      {studentsQuery.isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <DataTable columns={columns} data={studentsQuery.data ?? []} />
      )}
    </div>
  );
}
