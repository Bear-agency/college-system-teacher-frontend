import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Hierarchy: educational year context, then departments, subjects, and lectures.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-2 border-primary/15 shadow-sm">
          <CardHeader>
            <CardTitle>Academic years</CardTitle>
            <CardDescription>Global filter and activation</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Use the sidebar selector to scope departments. Manage years under Academic Years.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Structure</CardTitle>
            <CardDescription>Departments and subjects</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Departments link to one or more years. Subjects belong to a department.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
            <CardDescription>Lectures</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Each lecture is tied to a subject and stores markdown body.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
