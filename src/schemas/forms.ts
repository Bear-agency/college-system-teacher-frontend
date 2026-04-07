import { z } from "zod";

const mongoId = z.string().regex(/^[a-f0-9]{24}$/i, "Invalid id");

export const academicYearCreateSchema = z
  .object({
    title: z.string().min(1).max(20),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => new Date(data.startDate).getTime() < new Date(data.endDate).getTime(),
    { message: "End date must be after start date", path: ["endDate"] },
  );

export const departmentCreateSchema = z.object({
  name: z.string().min(3).max(120),
  code: z
    .string()
    .max(10)
    .transform((s) => {
      const t = s.trim();
      return t === "" ? undefined : t;
    })
    .pipe(
      z.union([
        z.undefined(),
        z.string().min(2, "Code must be at least 2 characters when provided").max(10),
      ]),
    ),
  academicYearIds: z.array(mongoId).min(1, "Select at least one academic year"),
});

export const departmentUpdateSchema = departmentCreateSchema.partial();

export const subjectCreateSchema = z.object({
  name: z.string().min(3).max(120),
  description: z.string().min(5).max(400),
  departmentId: mongoId,
  semester: z.union([z.literal(1), z.literal(2)]),
  courseNumber: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
  ]),
});

export const subjectUpdateSchema = subjectCreateSchema.partial();

export const lectureCreateSchema = z.object({
  title: z.string().min(3).max(120),
  subjectId: mongoId,
  contentMarkdown: z.string().max(500_000).optional(),
});

/** Form-only: subject chosen in UI context, not in the form fields */
export const lectureCreateFormSchema = z.object({
  title: z.string().min(3).max(120),
  contentMarkdown: z.string().max(500_000).optional(),
});

export const lectureUpdateSchema = z.object({
  title: z.string().min(3).max(120).optional(),
  contentMarkdown: z.string().max(500_000).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});
