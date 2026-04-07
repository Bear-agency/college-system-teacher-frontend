"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";
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
import {
  coursesService,
  departmentsService,
  getApiErrorMessage,
  lecturesService,
  subjectsService,
} from "@/src/services/api";
import { lectureCreateFormSchema, lectureUpdateSchema } from "@/src/schemas/forms";
import { useAcademicYearStore } from "@/src/store/academic-year-store";
import type { Course, Department, Lecture, Subject } from "@/src/types/api";
import type { z } from "zod";

type CreateForm = z.infer<typeof lectureCreateFormSchema>;
type EditForm = z.infer<typeof lectureUpdateSchema>;

const SELECT_NONE = "__none__";

export default function AdminLecturesPage() {
  const queryClient = useQueryClient();
  const { selectedAcademicYearId } = useAcademicYearStore();
  const [departmentId, setDepartmentId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);

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

  const lecturesQuery = useQuery({
    queryKey: ["lectures", courseId],
    queryFn: () => lecturesService.list({ courseId }),
    enabled: Boolean(courseId),
  });

  const createForm = useForm<CreateForm>({
    resolver: zodResolver(lectureCreateFormSchema),
    defaultValues: { title: "", contentMarkdown: "" },
  });

  const editForm = useForm<EditForm>({
    resolver: zodResolver(lectureUpdateSchema),
    defaultValues: { title: "", contentMarkdown: "" },
  });

  useEffect(() => {
    if (selectedLecture) {
      editForm.reset({
        title: selectedLecture.title,
        contentMarkdown: selectedLecture.contentMarkdown ?? "",
      });
    }
  }, [selectedLecture, editForm]);

  const createMutation = useMutation({
    mutationFn: lecturesService.create,
    onSuccess: () => {
      toast.success("Lecture created");
      createForm.reset({ title: "", contentMarkdown: "" });
      queryClient.invalidateQueries({ queryKey: ["lectures", courseId] });
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: EditForm }) =>
      lecturesService.update(id, body),
    onSuccess: () => {
      toast.success("Lecture saved");
      queryClient.invalidateQueries({ queryKey: ["lectures", courseId] });
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const columns = useMemo<ColumnDef<Lecture>[]>(
    () => [
      { accessorKey: "title", header: "Title" },
      {
        id: "pick",
        header: "",
        cell: ({ row }) => (
          <Button variant="outline" size="sm" onClick={() => setSelectedLecture(row.original)}>
            Edit
          </Button>
        ),
      },
    ],
    [],
  );

  const migrateToCoursesMutation = useMutation({
    mutationFn: () => lecturesService.migrateToCourses(),
    onSuccess: (res) => {
      toast.success(
        `Migration done: ${res.coursesCreated} course(s) created, ${res.lecturesUpdated} lecture(s) updated.`,
      );
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["lectures"] });
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const lectureRows: Lecture[] = useMemo(() => {
    const raw = lecturesQuery.data ?? [];
    return raw.map((row) => ({
      id: row.id ?? (row as unknown as { _id: string })._id,
      title: row.title,
      courseId: row.courseId ?? null,
      subjectId: row.subjectId ?? null,
      contentMarkdown: row.contentMarkdown ?? "",
    }));
  }, [lecturesQuery.data]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Lectures</h1>
        <p className="text-sm text-muted-foreground">
          Select department, subject, and course, then create or edit markdown content.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={departmentId === "" ? SELECT_NONE : departmentId}
                onValueChange={(v) => {
                  setDepartmentId(v === SELECT_NONE ? "" : (v ?? ""));
                  setSubjectId("");
                  setCourseId("");
                  setSelectedLecture(null);
                }}
              >
                <SelectTrigger className="w-full min-w-0 max-w-full">
                  <SelectValue placeholder="Department">
                    {(value: unknown) => {
                      const v = String(value ?? "");
                      if (v === "" || v === SELECT_NONE) return "Department";
                      const d = (departmentsQuery.data ?? []).find((x) => x.id === v);
                      return d ? d.name : v;
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SELECT_NONE}>Department</SelectItem>
                  {(departmentsQuery.data ?? []).map((d: Department) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select
                value={subjectId === "" ? SELECT_NONE : subjectId}
                onValueChange={(v) => {
                  setSubjectId(v === SELECT_NONE ? "" : (v ?? ""));
                  setCourseId("");
                  setSelectedLecture(null);
                }}
                disabled={!departmentId}
              >
                <SelectTrigger className="w-full min-w-0 max-w-full">
                  <SelectValue placeholder="Subject">
                    {(value: unknown) => {
                      const v = String(value ?? "");
                      if (v === "" || v === SELECT_NONE) return "Subject";
                      const s = (subjectsQuery.data ?? []).find((x) => x.id === v);
                      return s ? s.name : v;
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SELECT_NONE}>Subject</SelectItem>
                  {(subjectsQuery.data ?? []).map((s: Subject) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Course</Label>
              <Select
                value={courseId === "" ? SELECT_NONE : courseId}
                onValueChange={(v) => {
                  setCourseId(v === SELECT_NONE ? "" : (v ?? ""));
                  setSelectedLecture(null);
                }}
                disabled={!subjectId}
              >
                <SelectTrigger className="w-full min-w-0 max-w-full">
                  <SelectValue placeholder="Course">
                    {(value: unknown) => {
                      const v = String(value ?? "");
                      if (v === "" || v === SELECT_NONE) return "Course";
                      const c = (coursesQuery.data ?? []).find((x) => x.id === v);
                      return c ? (c.code ? `${c.name} (${c.code})` : c.name) : v;
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SELECT_NONE}>Course</SelectItem>
                  {(coursesQuery.data ?? []).map((c: Course) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.code ? `${c.name} (${c.code})` : c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="border-t pt-3">
              <p className="mb-2 text-xs text-muted-foreground">
                One-time: create default courses and move lectures that still use subject-only links.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={migrateToCoursesMutation.isPending}
                onClick={() => {
                  if (
                    confirm(
                      "Run global migration? Default courses will be created per subject where needed.",
                    )
                  ) {
                    migrateToCoursesMutation.mutate();
                  }
                }}
              >
                {migrateToCoursesMutation.isPending ? "Migrating…" : "Migrate lectures to courses"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/20 bg-card shadow-md">
          <CardHeader>
            <CardTitle>New lecture</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-3"
              onSubmit={createForm.handleSubmit((v) => {
                if (!courseId) {
                  toast.error("Select a course first");
                  return;
                }
                createMutation.mutate({
                  title: v.title,
                  courseId,
                  contentMarkdown: v.contentMarkdown,
                });
              })}
            >
              <div className="space-y-2">
                <Label>Title</Label>
                <Input {...createForm.register("title")} />
                {createForm.formState.errors.title ? (
                  <p className="text-sm text-destructive">
                    {createForm.formState.errors.title.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label>Markdown body</Label>
                <Textarea rows={6} {...createForm.register("contentMarkdown")} />
              </div>
              <Button type="submit" disabled={!courseId || createMutation.isPending}>
                Create lecture
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {!courseId ? (
        <p className="text-sm text-muted-foreground">
          Select a course to load lectures. Add courses under Admin → Courses if the list is empty.
        </p>
      ) : lecturesQuery.isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <DataTable columns={columns} data={lectureRows} />
      )}

      {selectedLecture ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit: {selectedLecture.title}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-2">
            <form
              className="space-y-3"
              onSubmit={editForm.handleSubmit((v) =>
                updateMutation.mutate({ id: selectedLecture.id, body: v }),
              )}
            >
              <div className="space-y-2">
                <Label>Title</Label>
                <Input {...editForm.register("title")} />
              </div>
              <div className="space-y-2">
                <Label>Markdown</Label>
                <Textarea rows={14} {...editForm.register("contentMarkdown")} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={updateMutation.isPending}>
                  Save
                </Button>
                <Button type="button" variant="secondary" onClick={() => setSelectedLecture(null)}>
                  Close
                </Button>
              </div>
            </form>
            <div>
              <Label className="mb-2 block">Preview</Label>
              <article className="prose prose-sm max-h-[480px] overflow-auto rounded-md border bg-muted/30 p-4 dark:prose-invert">
                <ReactMarkdown>
                  {editForm.watch("contentMarkdown") || "*No content*"}
                </ReactMarkdown>
              </article>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
