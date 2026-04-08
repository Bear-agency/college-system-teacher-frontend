/**
 * Mirrors NestJS DTOs and common API response shapes from `backend/src`.
 * Controllers live under modules (e.g. presentation/http) or module root, not infrastructure/controllers.
 */

import type { Role } from "./auth";

export type { Role, JWTPayload as JwtProfile, LoginResponse } from "./auth";

/** GET / */
export type HelloResponse = string;

/** GET /health | /health-check */
export interface HealthResponse {
  status: string;
  timestamp: string;
}

/** POST /auth/register */
export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

/** POST /auth/login */
export interface LoginRequest {
  email: string;
  password: string;
}

/** GET /users (admin) */
export interface UserListItem {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

/** Academic years — Mongo documents */
export interface AcademicYear {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAcademicYearRequest {
  title: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

export type UpdateAcademicYearRequest = Partial<CreateAcademicYearRequest>;

export interface DeleteSuccessResponse {
  success: boolean;
}

/** Departments */
export interface LectureHierarchy {
  id: string;
  title: string;
}

export interface SubjectHierarchy {
  id: string;
  name: string;
  lectures: LectureHierarchy[];
}

/**
 * Canonical shape used in the UI. Wire JSON from Nest may use `subjectIds` instead of `subjects`;
 * `departmentsService` normalizes that.
 */
export interface Department {
  id: string;
  name: string;
  code: string | null;
  academicYearIds: string[];
  subjects: SubjectHierarchy[];
}

/** Raw `/departments` entity JSON (before normalization). */
export type DepartmentWire = Omit<Department, "subjects" | "academicYearIds" | "id"> & {
  id?: string;
  _id?: string;
  academicYearIds?: string[];
  subjects?: SubjectHierarchy[];
  subjectIds?: string[];
};

export interface CreateDepartmentRequest {
  name: string;
  code?: string;
  academicYearIds: string[];
}

export type UpdateDepartmentRequest = Partial<CreateDepartmentRequest>;

/** Subjects (flat entity from API) */
export interface Subject {
  id: string;
  name: string;
  description: string;
  departmentId: string;
  semester: 1 | 2;
  /** Study year / course number (1st–4th year). */
  courseNumber: 1 | 2 | 3 | 4;
}

export interface CreateSubjectRequest {
  name: string;
  description?: string;
  departmentId: string;
  semester: 1 | 2;
  courseNumber: 1 | 2 | 3 | 4;
}

export type UpdateSubjectRequest = Partial<CreateSubjectRequest>;

/** Lectures */
export interface Lecture {
  id: string;
  title: string;
  subjectId: string;
  contentMarkdown: string;
}

export interface CreateLectureRequest {
  title: string;
  subjectId: string;
  contentMarkdown?: string;
}

export interface UpdateLectureRequest {
  title?: string;
  contentMarkdown?: string;
}

export interface MigrateLecturesRequest {
  defaultAcademicYearId: string;
}

export interface MigrateLecturesResponse {
  modifiedCount?: number;
  [key: string]: unknown;
}

/** Groups (admin) */
export interface CreateGroupRequest {
  name: string;
  courseNumber: 1 | 2 | 3 | 4;
  departmentId: string;
  academicYearId: string;
}

export type UpdateGroupRequest = Partial<CreateGroupRequest>;

export interface Group {
  _id: string;
  name: string;
  courseNumber: number;
  departmentId: string | { _id: string; name?: string; code?: string | null };
  /** Populated or raw ObjectId string from API */
  academicYear?: string | { _id: string; title?: string };
  isGraduated?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Students */
export interface CreateStudentRequest {
  fullName: string;
  email: string;
  groupId: string;
  tgId?: string;
  isActive?: boolean;
}

export interface UpdateStudentRequest {
  fullName?: string;
  email?: string;
  groupId?: string;
  tgId?: string;
  isActive?: boolean;
}

export interface Student {
  _id: string;
  fullName: string;
  email: string;
  tgId?: string;
  isActive: boolean;
  group: Group | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentListParams {
  academicYearId?: string;
  departmentId?: string;
  groupId?: string;
  courseNumber?: 1 | 2 | 3 | 4;
}

export interface BulkImportStudentsRequest {
  groupId: string;
  students: { fullName: string; email: string; tgId?: string }[];
}

export interface BulkImportStudentsResponse {
  created: number;
  failed: { email: string; reason: string }[];
}

export interface PromoteStudentsRequest {
  fromAcademicYearId: string;
  toAcademicYearId: string;
}

export interface PromoteStudentsResponse {
  promotedGroupIds: string[];
  graduatedGroupIds: string[];
  studentsMoved: number;
  sourceGroupsProcessed: number;
}

/** Subject ↔ group ↔ year link */
export interface CreateSubjectAssignmentRequest {
  subjectId: string;
  groupId: string;
  academicYearId: string;
}

export interface SubjectAssignment {
  _id: string;
  subjectId: unknown;
  groupId: unknown;
  academicYearId: unknown;
  createdAt?: string;
  updatedAt?: string;
}

/** Tests */
export interface CreateTestRequest {
  title: string;
  studentId: string;
  groupId: string;
  score: number;
}
