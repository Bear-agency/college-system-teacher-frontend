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

export interface Department {
  id: string;
  name: string;
  code: string | null;
  academicYearIds: string[];
  subjects: SubjectHierarchy[];
}

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
}

export interface CreateSubjectRequest {
  name: string;
  description: string;
  departmentId: string;
  semester: 1 | 2;
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
  title: string;
  academicYearId: string;
}

export type UpdateGroupRequest = Partial<CreateGroupRequest>;

export interface Group {
  _id: string;
  title: string;
  /** Populated or raw ObjectId string from API */
  academicYear?: string | { _id: string; title?: string };
  createdAt?: string;
  updatedAt?: string;
}

/** Students */
export interface CreateStudentRequest {
  fullName: string;
  email: string;
  groupId: string;
}

/** Tests */
export interface CreateTestRequest {
  title: string;
  studentId: string;
  groupId: string;
  score: number;
}
