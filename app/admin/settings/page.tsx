"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { academicYearsService, getApiErrorMessage } from "@/src/services/api";
import type { AcademicYear } from "@/src/types/api";

const NONE = "__none__";

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");

  const yearsQuery = useQuery({
    queryKey: ["academic-years"],
    queryFn: () => academicYearsService.list(),
  });

  const promoteMutation = useMutation({
    mutationFn: academicYearsService.promote,
    onSuccess: (res) => {
      toast.success(
        `Promotion done: ${res.studentsMoved} students moved, ${res.promotedGroupIds.length} new groups, ${res.graduatedGroupIds.length} graduated groups.`,
      );
      void queryClient.invalidateQueries({ queryKey: ["academic-years"] });
      void queryClient.invalidateQueries({ queryKey: ["groups"], exact: false });
      void queryClient.invalidateQueries({ queryKey: ["students"], exact: false });
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const sorted = [...(yearsQuery.data ?? [])].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Administrative actions that affect multiple modules.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Promote to next year</CardTitle>
        </CardHeader>
        <CardContent className="max-w-xl space-y-4">
          <p className="text-sm text-muted-foreground">
            Copies groups from the source academic year into the target year with{" "}
            <code className="text-xs">course + 1</code>, and moves students. Fourth-year groups become
            graduated; their students are marked inactive.
          </p>
          {yearsQuery.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <>
              <div className="space-y-2">
                <Label>From academic year</Label>
                <Select
                  value={fromId || NONE}
                  onValueChange={(v) => setFromId(!v || v === NONE ? "" : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Select year</SelectItem>
                    {sorted.map((y: AcademicYear) => (
                      <SelectItem key={y._id} value={y._id}>
                        {y.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>To academic year</Label>
                <Select value={toId || NONE} onValueChange={(v) => setToId(!v || v === NONE ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Select year</SelectItem>
                    {sorted.map((y: AcademicYear) => (
                      <SelectItem key={y._id} value={y._id}>
                        {y.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                disabled={
                  promoteMutation.isPending || !fromId || !toId || fromId === toId
                }
                onClick={() => promoteMutation.mutate({ fromAcademicYearId: fromId, toAcademicYearId: toId })}
              >
                Run promotion
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
